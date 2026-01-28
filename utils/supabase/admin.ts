import { toDateTime } from '@/utils/helpers';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database, Tables, TablesInsert } from '@/types/db';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;

// Change to control trial period length
const TRIAL_PERIOD_DAYS = 0;

// Use service_role key for admin operations to bypass RLS
// This is safe because these functions are only called from server-side code
// IMPORTANT: We need to get the service role key dynamically to ensure it's loaded from .env.local
function getServiceRoleKey(): string | undefined {
  // Try multiple ways to get the key
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  // Fallback: Try to load directly from .env.local if not found in process.env
  // This can happen if Next.js hasn't loaded the env vars yet or there's a cache issue
  if (!key && process.env.NODE_ENV === 'development') {
    try {
      const fs = require('fs');
      const path = require('path');
      const envLocalPath = path.join(process.cwd(), '.env.local');
      
      if (fs.existsSync(envLocalPath)) {
        const envContent = fs.readFileSync(envLocalPath, 'utf8');
        const match = envContent.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m);
        if (match && match[1]) {
          key = match[1].trim();
          // Remove quotes if present
          if ((key.startsWith('"') && key.endsWith('"')) || 
              (key.startsWith("'") && key.endsWith("'"))) {
            key = key.slice(1, -1);
          }
          console.log('⚠️  Loaded SUPABASE_SERVICE_ROLE_KEY directly from .env.local (fallback)');
          console.log('   This suggests Next.js did not load the variable. Try:');
          console.log('   1. Delete .next folder: rm -rf .next');
          console.log('   2. Restart server completely');
        }
      }
    } catch (error) {
      // Silently fail - this is just a fallback
    }
  }
  
  // Enhanced debug logging to help diagnose issues
  if (process.env.NODE_ENV === 'development') {
    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('=== getServiceRoleKey Diagnostic ===');
    console.log('Direct process.env access:', {
      hasSUPABASE_SERVICE_ROLE_KEY: !!rawKey,
      hasNEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: !!publicKey,
      rawKeyType: typeof rawKey,
      rawKeyLength: rawKey?.length || 0,
      rawKeyFirstChars: rawKey ? rawKey.substring(0, 20) + '...' : 'N/A',
      finalKeyLength: key?.length || 0,
      finalKeyFirstChars: key ? key.substring(0, 20) + '...' : 'N/A',
      loadedFromFallback: !rawKey && !!key
    });
    
    // Check all environment variables that contain SUPABASE
    const allSupabaseVars = Object.keys(process.env)
      .filter(k => k.includes('SUPABASE'))
      .map(k => ({
        key: k,
        hasValue: !!process.env[k],
        valueLength: process.env[k]?.length || 0,
        valuePreview: process.env[k]?.substring(0, 30) + '...' || 'empty'
      }));
    
    console.log('All SUPABASE env vars in process.env:', allSupabaseVars);
    
    // Check if key might be wrapped in quotes
    if (rawKey && (rawKey.startsWith('"') || rawKey.startsWith("'"))) {
      console.warn('⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY appears to be wrapped in quotes!');
      console.warn('   Remove quotes from .env.local file. Should be: SUPABASE_SERVICE_ROLE_KEY=eyJ...');
      console.warn('   NOT: SUPABASE_SERVICE_ROLE_KEY="eyJ..."');
    }
  }
  
  // Trim whitespace if present (common issue with .env files)
  const trimmedKey = key?.trim();
  
  if (trimmedKey && trimmedKey !== key) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY had whitespace and was trimmed');
  }
  
  return trimmedKey;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

// Helper function to extract project ref from JWT or URL
const extractProjectRef = (jwt: string): string | null => {
  try {
    const parts = jwt.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload.ref || null;
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return null;
};

const extractProjectRefFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
};

// Create supabase client - we'll recreate it with service_role key when needed
const getAdminSupabaseClient = (forceKey?: string) => {
  // Allow passing a key directly to bypass getServiceRoleKey if needed
  const serviceRoleKey = forceKey || getServiceRoleKey();
  
  // Validate that service_role key matches the Supabase URL project
  if (serviceRoleKey && supabaseUrl && process.env.NODE_ENV === 'development') {
    const keyProjectRef = extractProjectRef(serviceRoleKey);
    const urlProjectRef = extractProjectRefFromUrl(supabaseUrl);
    
    if (keyProjectRef && urlProjectRef && keyProjectRef !== urlProjectRef) {
      console.error('❌ PROJECT MISMATCH DETECTED!');
      console.error(`Service Role Key is for project: ${keyProjectRef}`);
      console.error(`NEXT_PUBLIC_SUPABASE_URL is for project: ${urlProjectRef}`);
      console.error('SOLUTION:');
      console.error(`1. Go to Supabase Dashboard → Project: ${urlProjectRef} → Settings → API`);
      console.error(`2. Copy the "service_role" key (NOT the anon key)`);
      console.error(`3. Update SUPABASE_SERVICE_ROLE_KEY in your .env.local file`);
      console.error(`OR update NEXT_PUBLIC_SUPABASE_URL to match project: ${keyProjectRef}`);
    }
  }
  
  if (!serviceRoleKey && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found. Admin operations may fail due to RLS.');
    console.warn('Please set SUPABASE_SERVICE_ROLE_KEY in your .env.local file.');
    console.warn('Current env vars:', {
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasNextPublicServiceRoleKey: !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET'
    });
  }
  
  // CRITICAL: If serviceRoleKey is not provided, we MUST fail - never fallback to anon key for admin operations
  if (!serviceRoleKey) {
    console.error('❌ CRITICAL: Cannot create admin client without service_role key!');
    console.error('Admin operations require service_role key to bypass RLS.');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  
  // Validate the key format (service_role keys should be JWT tokens)
  if (!serviceRoleKey.startsWith('eyJ')) {
    console.warn('⚠️  WARNING: Service role key does not appear to be a valid JWT token');
    console.warn('   Service role keys should start with "eyJ" (base64 encoded JWT)');
  }
  
  // Create client with service_role key - this bypasses RLS
  const client = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Log in development to confirm we're using service_role
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Admin Supabase client created with service_role key');
    console.log('   Key length:', serviceRoleKey.length);
    console.log('   Key preview:', serviceRoleKey.substring(0, 30) + '...');
    console.log('   This client should bypass RLS policies');
  }
  
  return client;
};

// Keep a default client for backward compatibility
const supabase = getAdminSupabaseClient();

const upsertProductRecord = async (product: Stripe.Product, serviceKey?: string) => {
  // CRITICAL: Must have service_role key for admin operations
  if (!serviceKey) {
    throw new Error('Service role key is required for upsertProductRecord');
  }
  
  // Use admin client with service_role key
  const adminSupabase = getAdminSupabaseClient(serviceKey);
  
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { data, error: upsertError } = await adminSupabase
    .from('products')
    .upsert([productData], { onConflict: 'id' });
    
  if (upsertError) {
    console.error(`❌ Product insert/update failed`);
    console.error('Error message:', upsertError.message);
    console.error('Error code:', upsertError.code);
    console.error('Error details:', upsertError.details);
    console.error('Error hint:', upsertError.hint);
    console.error('Product data:', productData);
    console.error('Service key used:', serviceKey ? `${serviceKey.substring(0, 30)}...` : 'NONE');
    
    // Provide specific guidance for RLS errors
    if (upsertError.code === '42501' || upsertError.message?.includes('row-level security')) {
      throw new Error(
        `RLS Policy Violation: The service_role key is not bypassing RLS. ` +
        `This usually means: 1) The key is incorrect, 2) The key doesn't match the project, ` +
        `or 3) RLS policies are blocking service_role. Original error: ${upsertError.message}`
      );
    }
    
    throw new Error(`Product insert/update failed: ${upsertError.message}`);
  }
  
  return data;
};

const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3,
  serviceKey?: string
) => {
  // Use admin client with service_role key
  const adminSupabase = getAdminSupabaseClient(serviceKey);
  
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS,
    description: null,
    metadata: null
  };

  const { error: upsertError } = await adminSupabase
    .from('prices')
    .upsert([priceData]);

  if (upsertError?.message.includes('foreign key constraint')) {
    if (retryCount < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
    } else {
      console.error(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
      );
      throw new Error(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
      );
    }
  } else if (upsertError) {
    console.error(`Price insert/update failed: ${upsertError.message}`);
    throw new Error(`Price insert/update failed: ${upsertError.message}`);
  } else {
  }
};

const deleteProductRecord = async (product: Stripe.Product) => {
  const { error: deletionError } = await supabase
    .from('products')
    .delete()
    .eq('id', product.id);
  if (deletionError) {
    console.error(`Product deletion failed: ${deletionError.message}`);
    throw new Error(`Product deletion failed: ${deletionError.message}`);
  }
};

const deletePriceRecord = async (price: Stripe.Price) => {
  const { error: deletionError } = await supabase
    .from('prices')
    .delete()
    .eq('id', price.id);
  if (deletionError) {
    console.error(`Price deletion failed: ${deletionError.message}`);
    throw new Error(`Price deletion failed: ${deletionError.message}`);
  }
};

/**
 * Sync all products and prices from Stripe to the database
 * This is useful when products haven't been synced via webhooks
 */
async function syncStripeProducts() {
  try {
    // FIRST: Check process.env directly BEFORE calling getServiceRoleKey()
    const directCheck = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('=== syncStripeProducts: Direct process.env check ===');
    console.log('Direct access result:', {
      exists: !!directCheck,
      length: directCheck?.length || 0,
      type: typeof directCheck,
      preview: directCheck ? directCheck.substring(0, 30) + '...' : 'N/A'
    });
    
    // Check if service_role key is available
    const serviceRoleKey = getServiceRoleKey();
    
    // Detailed diagnostic logging
    console.log('=== syncStripeProducts Diagnostic ===');
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      directCheckExists: !!directCheck,
      directCheckLength: directCheck?.length || 0,
      hasServiceRoleKey: !!serviceRoleKey,
      serviceRoleKeyLength: serviceRoleKey?.length || 0,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('SERVICE') || k.includes('SUPABASE')).map(k => ({
        key: k,
        hasValue: !!process.env[k],
        valueLength: process.env[k]?.length || 0
      }))
    });
    
    // If direct check exists but getServiceRoleKey returns undefined, use direct value
    const finalKey = serviceRoleKey || directCheck;
    
    if (!finalKey) {
      // Enhanced diagnostic information
      const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const publicKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
      
      const envCheck = {
        SUPABASE_SERVICE_ROLE_KEY: rawKey ? `SET (length: ${rawKey.length})` : 'NOT SET',
        NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: publicKey ? `SET (length: ${publicKey.length})` : 'NOT SET',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        allSupabaseVars: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
        rawKeyPreview: rawKey ? rawKey.substring(0, 50) + '...' : 'N/A',
        hasQuotes: rawKey ? (rawKey.startsWith('"') || rawKey.startsWith("'")) : false
      };
      
      console.error('❌ syncStripeProducts ERROR: SUPABASE_SERVICE_ROLE_KEY not found');
      console.error('=== Detailed Environment Check ===');
      console.error(JSON.stringify(envCheck, null, 2));
      console.error('');
      console.error('=== COMMON ISSUES ===');
      console.error('1. Variable not in .env.local file');
      console.error('2. Server not restarted after adding variable');
      console.error('3. Variable wrapped in quotes (should be: SUPABASE_SERVICE_ROLE_KEY=eyJ..., NOT: SUPABASE_SERVICE_ROLE_KEY="eyJ...")');
      console.error('4. Extra spaces or newlines in .env.local');
      console.error('5. .env.local file in wrong location (should be in project root)');
      console.error('');
      console.error('=== SOLUTION ===');
      console.error('1. Open .env.local in project root');
      console.error('2. Add line: SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
      console.error('   (NO quotes, NO spaces around =)');
      console.error('3. Save file');
      console.error('4. RESTART server completely:');
      console.error('   - Stop: Ctrl+C');
      console.error('   - Wait 5 seconds');
      console.error('   - Start: pnpm dev');
      console.error('5. Next.js ONLY loads .env.local on server startup');
      
      const errorMsg = 'SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
        'Please check the console logs above for detailed diagnostics. ' +
        'Common issues: variable not in .env.local, server not restarted, or variable wrapped in quotes. ' +
        'The server MUST be restarted after adding environment variables.';
      throw new Error(errorMsg);
    }

    console.log('Starting Stripe products sync...');
    console.log('Using Supabase URL:', supabaseUrl);
    console.log('Service role key configured:', finalKey ? 'YES' : 'NO');
    console.log('Using key from:', serviceRoleKey ? 'getServiceRoleKey()' : directCheck ? 'direct process.env' : 'NONE');
    
    // Check if Stripe is configured
    if (!stripe) {
      throw new Error('Stripe is not configured. Please check your STRIPE_SECRET_KEY environment variable.');
    }
    
    // Fetch all active products from Stripe
    console.log('Fetching products from Stripe...');
    const products = await stripe.products.list({ active: true, limit: 100 });
    
    console.log(`Found ${products.data.length} products in Stripe`);
    
    if (products.data.length === 0) {
      console.warn('No products found in Stripe. Please create at least one product in your Stripe dashboard.');
      return { success: false, productsCount: 0, pricesCount: 0, error: 'No products in Stripe' };
    }
    
    // Sync each product - pass the key directly to ensure it's used
    let syncedProducts = 0;
    let productErrors = 0;
    for (const product of products.data) {
      try {
        // Create a fresh admin client for each operation to ensure service_role is used
        const adminClient = getAdminSupabaseClient(finalKey);
        
        // Verify we're using service_role by checking the auth header
        if (process.env.NODE_ENV === 'development') {
          console.log(`Attempting to sync product: ${product.name} (${product.id})`);
        }
        
        await upsertProductRecord(product, finalKey);
        syncedProducts++;
        console.log(`✓ Synced product: ${product.name} (${product.id})`);
      } catch (productError: any) {
        productErrors++;
        console.error(`✗ Failed to sync product ${product.id}:`, productError.message);
        console.error('   Error details:', {
          message: productError.message,
          code: productError.code,
          details: productError.details,
          hint: productError.hint
        });
        
        // If it's an RLS error, provide more context
        if (productError.message?.includes('row-level security') || 
            productError.message?.includes('RLS') ||
            productError.code === '42501') {
          console.error('   ⚠️  RLS ERROR DETECTED!');
          console.error('   This means the service_role key is NOT bypassing RLS.');
          console.error('   Possible causes:');
          console.error('   1. Service role key is incorrect or invalid');
          console.error('   2. Service role key does not match the Supabase project');
          console.error('   3. Service role key is being overridden somewhere');
          console.error('   4. Supabase RLS policies are misconfigured');
        }
      }
    }
    
    console.log(`Synced ${syncedProducts}/${products.data.length} products`);
    
    // Fetch all active prices from Stripe
    console.log('Fetching prices from Stripe...');
    const prices = await stripe.prices.list({ active: true, limit: 100 });
    
    console.log(`Found ${prices.data.length} prices in Stripe`);
    
    // Sync each price - pass the key directly to ensure it's used
    let syncedPrices = 0;
    let priceErrors = 0;
    for (const price of prices.data) {
      try {
        await upsertPriceRecord(price, 0, 3, finalKey);
        syncedPrices++;
        console.log(`✓ Synced price: ${price.id}`);
      } catch (priceError: any) {
        priceErrors++;
        console.error(`✗ Failed to sync price ${price.id}:`, priceError.message);
      }
    }
    
    console.log(`Synced ${syncedPrices}/${prices.data.length} prices`);
    
    if (syncedProducts === 0) {
      throw new Error(
        'Failed to sync any products. ' +
        'This is likely due to Row Level Security (RLS) policy. ' +
        'Please ensure SUPABASE_SERVICE_ROLE_KEY is set correctly in your .env.local file.'
      );
    }
    
    console.log('Stripe products sync completed successfully');
    return { 
      success: true, 
      productsCount: syncedProducts, 
      pricesCount: syncedPrices,
      productErrors,
      priceErrors
    };
  } catch (error: any) {
    console.error('Error syncing Stripe products:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more helpful error message for RLS violations
    if (error.message?.includes('row-level security policy') || error.message?.includes('RLS')) {
      throw new Error(
        'Failed to sync products: Row Level Security (RLS) policy violation. ' +
        'Please ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local file. ' +
        'This key bypasses RLS and is required for admin operations like syncing products from Stripe. ' +
        `Original error: ${error.message}`
      );
    }
    
    throw new Error(`Failed to sync Stripe products: ${error.message}`);
  }
}

const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
  const { error: upsertError } = await supabase
    .from('customers')
    .upsert([{ id: uuid, stripe_customer_id: customerId }]);

  if (upsertError) {
    console.error(
      `Supabase customer record creation failed: ${upsertError.message}`
    );
    throw new Error(
      `Supabase customer record creation failed: ${upsertError.message}`
    );
  }

  return customerId;
};

const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email };
  const newCustomer = await stripe.customers.create(customerData);
  if (!newCustomer) {
    console.error('Stripe customer creation failed.');
    throw new Error('Stripe customer creation failed.');
  }

  return newCustomer.id;
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {

  // Check if the customer already exists in Supabase
  const { data: existingSupabaseCustomer, error: queryError } =
    await supabase
      .from('customers')
      .select('*')
      .eq('id', uuid)
      .maybeSingle();

  if (queryError) {
    console.error(`Supabase customer lookup failed: ${queryError.message}`);
    throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
  }

  // Retrieve the Stripe customer ID using the Supabase customer ID, with email fallback
  let stripeCustomerId: string | undefined;
  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    // If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
    const stripeCustomers = await stripe.customers.list({ email: email });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  // If still no stripeCustomerId, create a new customer in Stripe
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email);
  if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');

  if (existingSupabaseCustomer && stripeCustomerId) {
    // If Supabase has a record but doesn't match Stripe, update Supabase record
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      console.warn(
        'Supabase customer record mismatched Stripe ID. Updating Supabase record.'
      );
      const { error: updateError } = await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', uuid);

      if (updateError) {
        console.error(
          `Supabase customer record update failed: ${updateError.message}`
        );
        throw new Error(
          `Supabase customer record update failed: ${updateError.message}`
        );
      }
    }
    // If Supabase has a record and matches Stripe, return Stripe customer ID
    return stripeCustomerId;
  } else {
    console.warn(
      'Supabase customer record was missing. Creating a new record.'
    );

    // If Supabase has no record, create a new record and return Stripe customer ID
    const upsertedStripeCustomer = await upsertCustomerToSupabase(
      uuid,
      stripeIdToInsert
    );
    if (!upsertedStripeCustomer)
      throw new Error('Supabase customer record creation failed.');

    return upsertedStripeCustomer;
  }
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const { error: updateError } = await supabase
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    })
    .eq('id', uuid);
  if (updateError) {
    console.error(`Customer update failed: ${updateError.message}`);
    throw new Error(`Customer update failed: ${updateError.message}`);
  }
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabase
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (noCustomerError) {
    console.error(`Customer lookup failed: ${noCustomerError.message}`);
    throw new Error(`Customer lookup failed: ${noCustomerError.message}`);
  }

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData: TablesInsert<'subscriptions'> = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null
  };

  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert([subscriptionData]);
  if (upsertError) {
    console.error(`Subscription insert/update failed: ${upsertError.message}`);
    throw new Error(
      `Subscription insert/update failed: ${upsertError.message}`
    );
  } 

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid) {
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
  }
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  deleteProductRecord,
  deletePriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
  syncStripeProducts
};

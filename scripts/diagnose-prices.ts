/**
 * Script de diagnóstico para verificar preços no Supabase e Stripe
 * 
 * Execute com: npx tsx scripts/diagnose-prices.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey) {
  console.error('❌ Variáveis de ambiente não configuradas:');
  console.error(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'OK' : 'MISSING'}`);
  console.error(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'OK' : 'MISSING'}`);
  console.error(`STRIPE_SECRET_KEY: ${stripeSecretKey ? 'OK' : 'MISSING'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

async function diagnosePrices() {
  console.log('🔍 DIAGNÓSTICO DE PREÇOS\n');
  
  // 1. Verificar todos os preços no Supabase
  console.log('📊 PREÇOS NO SUPABASE:');
  console.log('='.repeat(100));
  
  const { data: supabasePrices, error } = await supabase
    .from('prices')
    .select('*')
    .order('active', { ascending: false });
  
  if (error) {
    console.error('❌ Erro ao buscar preços do Supabase:', error);
    return;
  }
  
  console.log(`Total de preços no banco: ${supabasePrices?.length || 0}\n`);
  
  supabasePrices?.forEach((price, idx) => {
    console.log(`${idx + 1}. ID: ${price.id}`);
    console.log(`   Active: ${price.active ? '✅ Ativo' : '❌ Inativo'}`);
    console.log(`   Product: ${price.product_id}`);
    console.log(`   Amount: ${price.unit_amount} ${price.currency?.toUpperCase()}`);
    console.log(`   Type: ${price.type}`);
    console.log(`   Interval: ${price.interval || 'N/A'}`);
    console.log('');
  });
  
  // 2. Verificar produtos no Supabase
  console.log('📦 PRODUTOS NO SUPABASE:');
  console.log('='.repeat(100));
  
  const { data: products } = await supabase
    .from('products')
    .select('*, prices(*)');
  
  products?.forEach((product, idx) => {
    console.log(`${idx + 1}. ${product.name} (${product.id})`);
    console.log(`   Active: ${product.active ? '✅' : '❌'}`);
    console.log(`   Preços: ${(product as any).prices?.length || 0}`);
    console.log('');
  });
  
  // 3. Verificar qual preço seria selecionado pela lógica atual
  console.log('🎯 LÓGICA DE SELEÇÃO DE PREÇO:');
  console.log('='.repeat(100));
  
  let selectedPrice = null;
  
  // Priority 1: Annual price $500 (50000 cents)
  for (const product of products || []) {
    if ((product as any).prices && Array.isArray((product as any).prices)) {
      selectedPrice = (product as any).prices.find(
        (price: any) => price?.active === true && 
                       price?.interval === 'year' && 
                       price?.unit_amount === 50000
      );
      if (selectedPrice) {
        console.log('✅ Priority 1: Encontrou preço anual de $500');
        break;
      }
    }
  }
  
  // Priority 2: Any annual price
  if (!selectedPrice) {
    for (const product of products || []) {
      if ((product as any).prices && Array.isArray((product as any).prices)) {
        selectedPrice = (product as any).prices.find(
          (price: any) => price?.active === true && price?.interval === 'year'
        );
        if (selectedPrice) {
          console.log('✅ Priority 2: Encontrou preço anual');
          break;
        }
      }
    }
  }
  
  // Priority 3: First active price from HIPAA Hub product
  if (!selectedPrice) {
    const hipaaHubProduct = products?.find(
      (product: any) => product?.name?.toLowerCase().includes('hipaa') || 
                       product?.name?.toLowerCase().includes('hub')
    );
    
    if (hipaaHubProduct && (hipaaHubProduct as any).prices && Array.isArray((hipaaHubProduct as any).prices)) {
      selectedPrice = (hipaaHubProduct as any).prices.find((price: any) => price?.active === true);
      if (selectedPrice) {
        console.log('✅ Priority 3: Encontrou primeiro preço ativo do HIPAA Hub');
      }
    }
  }
  
  // Priority 4: First active price from any product
  if (!selectedPrice) {
    for (const product of products || []) {
      if ((product as any).prices && Array.isArray((product as any).prices)) {
        selectedPrice = (product as any).prices.find((price: any) => price?.active === true);
        if (selectedPrice) {
          console.log('✅ Priority 4: Encontrou primeiro preço ativo');
          break;
        }
      }
    }
  }
  
  if (selectedPrice) {
    console.log('\n🎯 PREÇO SELECIONADO:');
    console.log(`ID: ${selectedPrice.id}`);
    console.log(`Product: ${selectedPrice.product_id}`);
    console.log(`Active: ${selectedPrice.active ? '✅ Ativo' : '❌ Inativo'}`);
    console.log(`Amount: ${selectedPrice.unit_amount} ${selectedPrice.currency?.toUpperCase()}`);
    console.log(`Type: ${selectedPrice.type}`);
    console.log(`Interval: ${selectedPrice.interval || 'N/A'}`);
  } else {
    console.log('❌ NENHUM PREÇO SELECIONADO');
  }
  
  // 4. Verificar preços no Stripe
  console.log('\n\n💳 VERIFICANDO PREÇOS NO STRIPE:');
  console.log('='.repeat(100));
  
  try {
    const stripePrices = await stripe.prices.list({
      limit: 100,
      expand: ['data.product'],
    });
    
    console.log(`Total de preços no Stripe: ${stripePrices.data.length}\n`);
    
    stripePrices.data.forEach((price, idx) => {
      const product = price.product as Stripe.Product;
      console.log(`${idx + 1}. ID: ${price.id}`);
      console.log(`   Active: ${price.active ? '✅ Ativo' : '❌ Inativo'}`);
      console.log(`   Product: ${product.name} (${typeof price.product === 'string' ? price.product : product.id})`);
      console.log(`   Amount: ${price.unit_amount} ${price.currency.toUpperCase()}`);
      console.log(`   Type: ${price.type}`);
      console.log(`   Interval: ${price.recurring?.interval || 'N/A'}`);
      console.log('');
    });
    
    // 5. Comparar Stripe vs Supabase
    console.log('\n⚖️  COMPARAÇÃO STRIPE vs SUPABASE:');
    console.log('='.repeat(100));
    
    const supabasePriceIds = new Set(supabasePrices?.map(p => p.id) || []);
    const stripePriceIds = new Set(stripePrices.data.map(p => p.id));
    
    // Preços no Stripe mas não no Supabase
    const missingInSupabase = stripePrices.data.filter(p => !supabasePriceIds.has(p.id));
    if (missingInSupabase.length > 0) {
      console.log(`\n⚠️  PREÇOS NO STRIPE MAS NÃO NO SUPABASE (${missingInSupabase.length}):`);
      missingInSupabase.forEach(p => {
        const product = p.product as Stripe.Product;
        console.log(`   - ${p.id} (${product.name}) - ${p.active ? 'Ativo' : 'Inativo'}`);
      });
    }
    
    // Preços no Supabase mas não no Stripe
    const missingInStripe = supabasePrices?.filter(p => !stripePriceIds.has(p.id)) || [];
    if (missingInStripe.length > 0) {
      console.log(`\n⚠️  PREÇOS NO SUPABASE MAS NÃO NO STRIPE (${missingInStripe.length}):`);
      missingInStripe.forEach(p => {
        console.log(`   - ${p.id} - ${p.active ? 'Ativo' : 'Inativo'}`);
      });
    }
    
    // Preços com status diferente
    console.log('\n🔄 PREÇOS COM STATUS DIFERENTE:');
    for (const supabasePrice of supabasePrices || []) {
      const stripePrice = stripePrices.data.find(p => p.id === supabasePrice.id);
      if (stripePrice && stripePrice.active !== supabasePrice.active) {
        console.log(`   - ${supabasePrice.id}:`);
        console.log(`     Stripe: ${stripePrice.active ? 'Ativo' : 'Inativo'}`);
        console.log(`     Supabase: ${supabasePrice.active ? 'Ativo' : 'Inativo'}`);
      }
    }
    
  } catch (stripeError: any) {
    console.error('❌ Erro ao buscar preços do Stripe:', stripeError.message);
  }
  
  console.log('\n✅ DIAGNÓSTICO COMPLETO\n');
}

// Execute
diagnosePrices().catch(console.error);

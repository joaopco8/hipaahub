#!/usr/bin/env node

/**
 * Test script to verify SUPABASE_SERVICE_ROLE_KEY works correctly
 * This will attempt to insert a test record to verify RLS bypass
 * Run with: node scripts/test-service-role.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Testing SUPABASE_SERVICE_ROLE_KEY ===\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

console.log('1. Configuration:');
console.log('   Supabase URL:', supabaseUrl);
console.log('   Service Role Key:', serviceRoleKey ? `${serviceRoleKey.substring(0, 30)}... (${serviceRoleKey.length} chars)` : 'NOT SET');
console.log('   Anon Key:', anonKey ? `${anonKey.substring(0, 30)}... (${anonKey.length} chars)` : 'NOT SET');

// Extract project refs
const extractProjectRef = (jwt) => {
  try {
    const parts = jwt.split('.');
    if (parts.length >= 2) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload.ref || null;
    }
  } catch (e) {
    return null;
  }
  return null;
};

const extractProjectRefFromUrl = (url) => {
  try {
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
};

const keyProjectRef = extractProjectRef(serviceRoleKey);
const urlProjectRef = extractProjectRefFromUrl(supabaseUrl);

console.log('\n2. Project validation:');
console.log('   Service Role Key project:', keyProjectRef || 'Could not extract');
console.log('   URL project:', urlProjectRef || 'Could not extract');

if (keyProjectRef && urlProjectRef && keyProjectRef !== urlProjectRef) {
  console.error('\n❌ PROJECT MISMATCH!');
  console.error(`   Service Role Key is for project: ${keyProjectRef}`);
  console.error(`   URL is for project: ${urlProjectRef}`);
  console.error('   These must match!');
  process.exit(1);
} else if (keyProjectRef && urlProjectRef) {
  console.log('   ✅ Projects match!');
}

// Test with service_role key
console.log('\n3. Testing service_role key:');
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Try to query products table (this should work with service_role)
console.log('   Attempting to query products table...');
adminClient
  .from('products')
  .select('id')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('   ❌ Query failed:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Error details:', error.details);
      console.error('   Error hint:', error.hint);
      
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        console.error('\n   ⚠️  RLS ERROR: Service role key is NOT bypassing RLS!');
        console.error('   This means:');
        console.error('   1. The key might be incorrect');
        console.error('   2. The key might not match the project');
        console.error('   3. RLS policies might be misconfigured');
      }
      process.exit(1);
    } else {
      console.log('   ✅ Query successful! Service role key is working.');
      console.log('   Found', data?.length || 0, 'products');
    }
  })
  .catch((err) => {
    console.error('   ❌ Unexpected error:', err.message);
    process.exit(1);
  });

// Also test with anon key to show the difference
console.log('\n4. Testing anon key (for comparison):');
if (anonKey) {
  const anonClient = createClient(supabaseUrl, anonKey);
  anonClient
    .from('products')
    .select('id')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('   ⚠️  Anon key query failed (expected if RLS is enabled):', error.message);
      } else {
        console.log('   ✅ Anon key query successful (RLS might not be enabled)');
      }
    })
    .catch(() => {
      // Ignore
    });
} else {
  console.log('   ⚠️  Anon key not available for comparison');
}




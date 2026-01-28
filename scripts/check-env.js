#!/usr/bin/env node

/**
 * Diagnostic script to check if SUPABASE_SERVICE_ROLE_KEY is properly configured
 * Run with: node scripts/check-env.js
 * 
 * This script reads .env.local directly to check if variables are present
 */

const fs = require('fs');
const path = require('path');

// Try to read .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ Found .env.local file\n');
} else {
  console.log('❌ .env.local file not found in project root\n');
  process.exit(1);
}

// Parse .env.local manually
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  }
});

console.log('=== Environment Variables Diagnostic ===\n');

const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const publicServiceRoleKey = envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('1. SUPABASE_SERVICE_ROLE_KEY:');
if (serviceRoleKey) {
  console.log('   ✅ SET');
  console.log(`   Length: ${serviceRoleKey.length}`);
  console.log(`   Preview: ${serviceRoleKey.substring(0, 30)}...`);
  if (serviceRoleKey.startsWith('"') || serviceRoleKey.startsWith("'")) {
    console.log('   ⚠️  WARNING: Key appears to be wrapped in quotes!');
    console.log('   Remove quotes from .env.local');
  }
  if (serviceRoleKey.includes(' ')) {
    console.log('   ⚠️  WARNING: Key contains spaces!');
  }
} else {
  console.log('   ❌ NOT SET');
}

console.log('\n2. NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY:');
if (publicServiceRoleKey) {
  console.log('   ✅ SET');
  console.log(`   Length: ${publicServiceRoleKey.length}`);
} else {
  console.log('   ⚠️  NOT SET (optional)');
}

console.log('\n3. NEXT_PUBLIC_SUPABASE_URL:');
if (supabaseUrl) {
  console.log('   ✅ SET');
  console.log(`   Value: ${supabaseUrl}`);
} else {
  console.log('   ❌ NOT SET');
}

console.log('\n4. NEXT_PUBLIC_SUPABASE_ANON_KEY:');
if (anonKey) {
  console.log('   ✅ SET');
  console.log(`   Length: ${anonKey.length}`);
} else {
  console.log('   ❌ NOT SET');
}

console.log('\n5. All SUPABASE variables in .env.local:');
const allSupabaseVars = Object.keys(envVars)
  .filter(k => k.includes('SUPABASE'))
  .sort();
if (allSupabaseVars.length > 0) {
  allSupabaseVars.forEach(key => {
    const value = envVars[key];
    const hasValue = !!value;
    console.log(`   ${hasValue ? '✅' : '❌'} ${key}: ${hasValue ? `SET (${value.length} chars)` : 'NOT SET'}`);
  });
} else {
  console.log('   ⚠️  No SUPABASE variables found in .env.local');
}

console.log('\n=== Summary ===');
if (serviceRoleKey) {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY is configured');
  console.log('   If you still see errors, make sure:');
  console.log('   1. Server was restarted after adding the variable');
  console.log('   2. Variable has no quotes around it');
  console.log('   3. Variable has no spaces around the = sign');
} else {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY is NOT configured');
  console.log('   Add it to .env.local:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  console.log('   (Get it from Supabase Dashboard → Settings → API → service_role key)');
}


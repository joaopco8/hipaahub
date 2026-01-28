#!/usr/bin/env node

/**
 * Comprehensive diagnostic script for environment variable issues
 * Run with: node scripts/diagnose-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== Comprehensive Environment Diagnostic ===\n');

// 1. Check .env.local file
const envLocalPath = path.join(process.cwd(), '.env.local');
console.log('1. Checking .env.local file:');
if (fs.existsSync(envLocalPath)) {
  console.log('   ✅ .env.local exists');
  const content = fs.readFileSync(envLocalPath, 'utf8');
  const lines = content.split('\n');
  
  const serviceKeyLine = lines.find(line => line.trim().startsWith('SUPABASE_SERVICE_ROLE_KEY='));
  if (serviceKeyLine) {
    const match = serviceKeyLine.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/);
    if (match) {
      const value = match[1].trim();
      console.log(`   ✅ SUPABASE_SERVICE_ROLE_KEY found in file`);
      console.log(`   Length: ${value.length}`);
      console.log(`   Preview: ${value.substring(0, 30)}...`);
      
      // Check for issues
      if (value.startsWith('"') || value.startsWith("'")) {
        console.log('   ⚠️  WARNING: Value is wrapped in quotes!');
      }
      if (value.includes('\n') || value.includes('\r')) {
        console.log('   ⚠️  WARNING: Value contains line breaks!');
      }
      if (value.length < 100) {
        console.log('   ⚠️  WARNING: Value seems too short (should be ~200+ chars)');
      }
    } else {
      console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY line found but format is incorrect');
    }
  } else {
    console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  }
} else {
  console.log('   ❌ .env.local does not exist');
}

// 2. Check .next folder
const nextPath = path.join(process.cwd(), '.next');
console.log('\n2. Checking .next cache folder:');
if (fs.existsSync(nextPath)) {
  console.log('   ⚠️  .next folder exists - this may contain cached environment variables');
  console.log('   💡 Solution: Delete .next folder and restart server');
  console.log('   Run: pnpm clean (or manually delete .next folder)');
} else {
  console.log('   ✅ .next folder does not exist');
}

// 3. Check if running in Node.js (to test process.env)
console.log('\n3. Checking process.env (Node.js runtime):');
const nodeEnv = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (nodeEnv) {
  console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY is available in process.env');
  console.log(`   Length: ${nodeEnv.length}`);
  console.log(`   Preview: ${nodeEnv.substring(0, 30)}...`);
} else {
  console.log('   ❌ SUPABASE_SERVICE_ROLE_KEY is NOT in process.env');
  console.log('   💡 This is expected if running outside Next.js');
  console.log('   💡 Next.js loads .env.local only when the server starts');
}

// 4. Recommendations
console.log('\n=== Recommendations ===');
console.log('If the variable is in .env.local but not working:');
console.log('1. Delete .next folder: pnpm clean (or manually: rm -rf .next)');
console.log('2. Stop the Next.js server completely (Ctrl+C)');
console.log('3. Wait 5 seconds');
console.log('4. Start server again: pnpm dev');
console.log('5. Test the endpoint: http://localhost:3000/api/test-env');
console.log('\nIf still not working, check:');
console.log('- Variable has no quotes around it');
console.log('- Variable is on a single line (no line breaks)');
console.log('- No spaces around the = sign');
console.log('- .env.local is in project root (same level as package.json)');




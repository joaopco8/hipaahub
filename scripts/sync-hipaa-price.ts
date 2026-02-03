/**
 * Script para sincronizar o preço Hipaa Hub $499/ano do Stripe para o Supabase
 * 
 * Execute com: npx tsx scripts/sync-hipaa-price.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY não configurada');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

async function getHipaaPriceDetails() {
  console.log('🔍 Buscando detalhes do preço no Stripe...\n');
  
  const priceId = 'price_1Slau3FjJxHsNvNGFAw3AS5t';
  
  try {
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });
    
    const product = price.product as Stripe.Product;
    
    console.log('✅ DETALHES DO PREÇO:');
    console.log('='.repeat(80));
    console.log(`ID: ${price.id}`);
    console.log(`Product ID: ${typeof price.product === 'string' ? price.product : product.id}`);
    console.log(`Product Name: ${product.name}`);
    console.log(`Active: ${price.active ? '✅ Ativo' : '❌ Inativo'}`);
    console.log(`Amount: ${price.unit_amount} ${price.currency.toUpperCase()}`);
    console.log(`Type: ${price.type}`);
    console.log(`Interval: ${price.recurring?.interval || 'N/A'}`);
    console.log(`Interval Count: ${price.recurring?.interval_count || 'N/A'}`);
    console.log(`Trial Period Days: ${price.recurring?.trial_period_days || 0}`);
    console.log('='.repeat(80));
    
    // Return SQL INSERT statement
    console.log('\n📝 SQL PARA INSERIR NO SUPABASE:');
    console.log('='.repeat(80));
    
    const productId = typeof price.product === 'string' ? price.product : product.id;
    
    const sql = `
-- Primeiro, garantir que o produto existe
INSERT INTO products (id, active, name, description, metadata)
VALUES (
  '${productId}',
  ${product.active},
  '${product.name}',
  ${product.description ? `'${product.description.replace(/'/g, "''")}'` : 'NULL'},
  '${JSON.stringify(product.metadata)}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

-- Depois, inserir/atualizar o preço
INSERT INTO prices (id, product_id, active, currency, type, unit_amount, interval, interval_count, trial_period_days, description, metadata)
VALUES (
  '${price.id}',
  '${productId}',
  ${price.active},
  '${price.currency}',
  '${price.type}',
  ${price.unit_amount},
  ${price.recurring?.interval ? `'${price.recurring.interval}'` : 'NULL'},
  ${price.recurring?.interval_count || 'NULL'},
  ${price.recurring?.trial_period_days || 0},
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  product_id = EXCLUDED.product_id,
  active = EXCLUDED.active,
  currency = EXCLUDED.currency,
  type = EXCLUDED.type,
  unit_amount = EXCLUDED.unit_amount,
  interval = EXCLUDED.interval,
  interval_count = EXCLUDED.interval_count,
  trial_period_days = EXCLUDED.trial_period_days;
`;
    
    console.log(sql);
    console.log('='.repeat(80));
    
    return { price, product, sql };
    
  } catch (error: any) {
    console.error('❌ Erro ao buscar preço do Stripe:', error.message);
    process.exit(1);
  }
}

// Execute
getHipaaPriceDetails().then(() => {
  console.log('\n✅ Detalhes obtidos com sucesso!');
  console.log('\n💡 Use o MCP do Supabase para executar o SQL acima.');
}).catch(console.error);

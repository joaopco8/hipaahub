-- Migration: Sync Hipaa Hub $499/year price from Stripe to Supabase
-- Created: 2026-02-03
-- Purpose: Add the active Hipaa Hub product and price that exists in Stripe

-- First, ensure the product exists
INSERT INTO products (id, active, name, description, metadata)
VALUES (
  'prod_Tj30fdzmZiwOO3',
  true,
  'Hipaa Hub',
  'HIPAA compliance platform for healthcare providers',
  '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  active = EXCLUDED.active,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata;

-- Then, insert/update the price
INSERT INTO prices (id, product_id, active, currency, type, unit_amount, interval, interval_count, trial_period_days, description, metadata)
VALUES (
  'price_1Slau3FjJxHsNvNGFAw3AS5t',
  'prod_Tj30fdzmZiwOO3',
  true,
  'usd',
  'recurring',
  49900,
  'year',
  1,
  0,
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

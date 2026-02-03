-- Migration: Sync CORRECT Hipaa Hub price from Stripe (LIVE MODE)
-- Price ID: price_1SwjJyFjJxHsNvNGinxBhYa7
-- Amount: 49900 USD ($499/year)
-- Created: 2026-02-03

-- First, ensure the product exists (update if needed)
INSERT INTO products (id, active, name, description, metadata)
VALUES (
  'prod_TuJnK2C8Rmb6id',
  true,
  'HIPAA Hub',
  'Audit-ready HIPAA compliance documentation system.',
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
  'price_1SwjJyFjJxHsNvNGinxBhYa7',
  'prod_TuJnK2C8Rmb6id',
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

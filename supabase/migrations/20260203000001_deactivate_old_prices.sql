-- Migration: Deactivate all old prices and keep only the correct LIVE price
-- This ensures the checkout will use the correct price
-- Created: 2026-02-03

-- Step 1: Deactivate ALL prices first
UPDATE prices
SET active = false
WHERE active = true;

-- Step 2: Activate ONLY the correct LIVE price
UPDATE prices
SET active = true
WHERE id = 'price_1SwjJyFjJxHsNvNGinxBhYa7';

-- Verify the result (for logging purposes)
-- Should show only 1 active price: price_1SwjJyFjJxHsNvNGinxBhYa7

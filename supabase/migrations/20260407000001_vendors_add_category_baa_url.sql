-- Add category and BAA URL fields to vendors table
-- category: maps to one of 10 standard HIPAA vendor categories (ehr, telehealth, billing, etc.)
-- baa_url: link to the vendor's BAA page for quick access

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS baa_url text;

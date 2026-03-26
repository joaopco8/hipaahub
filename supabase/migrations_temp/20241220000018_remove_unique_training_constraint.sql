-- Remove unique constraint that prevents users from retaking training
-- This allows maintaining a complete training history for audit purposes
-- Multiple completed trainings are allowed as they represent retraining/refresher courses

-- Drop the unique index that prevents multiple completed trainings
drop index if exists training_records_unique_active_training;

-- Add a comment explaining why we allow multiple trainings
comment on table training_records is 'HIPAA Employee Training Records - Required by OCR for compliance audits. Multiple completed trainings are allowed to maintain complete training history.';

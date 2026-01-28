-- Add evidence fields for legal compliance and audit trails
-- These fields are critical for OCR audits and legal defense

-- Add quiz_answers JSONB field to store all question responses
alter table training_records 
  add column if not exists quiz_answers jsonb;

comment on column training_records.quiz_answers is 'Complete record of all quiz questions and answers (legal evidence)';

-- Ensure acknowledgement_ip is properly indexed for forensic queries
create index if not exists training_records_acknowledgement_ip_idx 
  on training_records(acknowledgement_ip) 
  where acknowledgement_ip is not null;

-- Add index on quiz_answers for efficient queries
create index if not exists training_records_quiz_answers_idx 
  on training_records using gin(quiz_answers) 
  where quiz_answers is not null;

-- Add certificate_id for unique certificate tracking
alter table training_records 
  add column if not exists certificate_id text;

-- Create unique index for certificate_id
create unique index if not exists training_records_certificate_id_idx 
  on training_records(certificate_id) 
  where certificate_id is not null;

comment on column training_records.certificate_id is 'Unique certificate identifier for legal verification';

-- Add user_agent for additional forensic evidence
alter table training_records 
  add column if not exists user_agent text;

comment on column training_records.user_agent is 'Browser user agent at time of training completion (forensic evidence)';

-- Add training_start_time to track duration
alter table training_records 
  add column if not exists training_start_time timestamp with time zone;

comment on column training_records.training_start_time is 'When training session started (for duration tracking)';

-- Add training_duration_minutes
alter table training_records 
  add column if not exists training_duration_minutes integer;

comment on column training_records.training_duration_minutes is 'Total time spent on training in minutes';

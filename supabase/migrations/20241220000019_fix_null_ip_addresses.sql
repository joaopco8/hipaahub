-- Fix existing training records with NULL IP addresses
-- Update NULL IPs to 'unknown' for existing records
update training_records 
set acknowledgement_ip = 'unknown'
where acknowledgement_ip is null;

-- Ensure the column has a default value for future inserts
alter table training_records 
  alter column acknowledgement_ip set default 'unknown';

-- Add a check to ensure IP is never empty
alter table training_records 
  add constraint training_records_acknowledgement_ip_not_empty 
  check (acknowledgement_ip is null or length(trim(acknowledgement_ip)) > 0);

comment on column training_records.acknowledgement_ip is 'IP address at time of training completion (forensic evidence). Defaults to "unknown" if not available.';

-- ============================================================
-- PRACTICE PLAN: Staff Training Tracker + BAA Tracker tables
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. EMPLOYEES  (Practice-level HR roster)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  first_name text NOT NULL,
  last_name  text NOT NULL,
  email      text NOT NULL,
  role_group text NOT NULL
    CHECK (role_group IN ('Clinical','Admin','Contractor','Intern')),
  hire_date  date,
  is_active  boolean NOT NULL DEFAULT true,

  created_at timestamp with time zone DEFAULT timezone('utc',now()) NOT NULL,

  UNIQUE (org_id, email)
);

CREATE INDEX IF NOT EXISTS employees_org_idx        ON employees(org_id);
CREATE INDEX IF NOT EXISTS employees_role_group_idx ON employees(role_group);
CREATE INDEX IF NOT EXISTS employees_is_active_idx  ON employees(is_active);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "employees_select" ON employees FOR SELECT
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "employees_insert" ON employees FOR INSERT
  WITH CHECK (
    org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );
CREATE POLICY "employees_update" ON employees FOR UPDATE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "employees_delete" ON employees FOR DELETE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 2. TRAINING_ASSIGNMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  module_id   text NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,

  assigned_at  timestamp with time zone DEFAULT timezone('utc',now()) NOT NULL,
  due_date     date,                          -- defaults to 30 days from assignment
  started_at   timestamp with time zone,
  completed_at timestamp with time zone,
  expires_at   timestamp with time zone,      -- 12 months from completion

  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started','in_progress','completed','expired')),

  created_at timestamp with time zone DEFAULT timezone('utc',now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS ta_org_idx      ON training_assignments(org_id);
CREATE INDEX IF NOT EXISTS ta_employee_idx ON training_assignments(employee_id);
CREATE INDEX IF NOT EXISTS ta_module_idx   ON training_assignments(module_id);
CREATE INDEX IF NOT EXISTS ta_status_idx   ON training_assignments(status);
CREATE INDEX IF NOT EXISTS ta_expires_idx  ON training_assignments(expires_at);

ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ta_select" ON training_assignments FOR SELECT
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "ta_insert" ON training_assignments FOR INSERT
  WITH CHECK (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "ta_update" ON training_assignments FOR UPDATE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "ta_delete" ON training_assignments FOR DELETE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 3. TRAINING_CERTIFICATES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_certificates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES training_assignments(id) ON DELETE CASCADE,
  employee_id   uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  module_id     text NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  org_id        text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  completed_at       timestamp with time zone NOT NULL,
  expires_at         timestamp with time zone NOT NULL,  -- 12 months from completed_at
  certificate_pdf_url text,                              -- Supabase Storage path
  signed_by          text,                               -- Admin full name

  created_at timestamp with time zone DEFAULT timezone('utc',now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS tc_assignment_idx ON training_certificates(assignment_id);
CREATE INDEX IF NOT EXISTS tc_employee_idx   ON training_certificates(employee_id);
CREATE INDEX IF NOT EXISTS tc_org_idx        ON training_certificates(org_id);

ALTER TABLE training_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tc_select" ON training_certificates FOR SELECT
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "tc_insert" ON training_certificates FOR INSERT
  WITH CHECK (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "tc_update" ON training_certificates FOR UPDATE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "tc_delete" ON training_certificates FOR DELETE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────
-- 4. BAAS  (dedicated BAA tracking, Practice plan)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS baas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id   uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  org_id      text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  signed_date     date,
  expiration_date date,
  no_expiration   boolean NOT NULL DEFAULT false,

  status text NOT NULL DEFAULT 'not_signed'
    CHECK (status IN ('active','expiring_soon','expired','not_signed')),

  document_url text,   -- Supabase Storage path to uploaded BAA PDF

  created_at timestamp with time zone DEFAULT timezone('utc',now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc',now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS baas_org_idx        ON baas(org_id);
CREATE INDEX IF NOT EXISTS baas_vendor_idx     ON baas(vendor_id);
CREATE INDEX IF NOT EXISTS baas_status_idx     ON baas(status);
CREATE INDEX IF NOT EXISTS baas_expiration_idx ON baas(expiration_date);

ALTER TABLE baas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "baas_select" ON baas FOR SELECT
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "baas_insert" ON baas FOR INSERT
  WITH CHECK (
    org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );
CREATE POLICY "baas_update" ON baas FOR UPDATE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "baas_delete" ON baas FOR DELETE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

-- Auto-update updated_at on baas
CREATE OR REPLACE FUNCTION update_baas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc',now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER baas_updated_at
  BEFORE UPDATE ON baas
  FOR EACH ROW EXECUTE FUNCTION update_baas_updated_at();

-- ─────────────────────────────────────────────
-- 5. Add name column to vendors for cleaner BAA tracker
--    (existing table uses vendor_name; add alias view)
-- ─────────────────────────────────────────────
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS start_date date;

-- ─────────────────────────────────────────────
-- 6. Storage bucket for BAA documents & certificates
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('baa-documents', 'baa-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('training-certificates', 'training-certificates', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: only authenticated users can access their org's files
CREATE POLICY "baa_docs_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'baa-documents');

CREATE POLICY "baa_docs_select" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'baa-documents');

CREATE POLICY "baa_docs_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'baa-documents');

CREATE POLICY "cert_upload" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'training-certificates');

CREATE POLICY "cert_select" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'training-certificates');

COMMENT ON TABLE employees             IS 'Practice plan: HR roster with role-group based training tracking';
COMMENT ON TABLE training_assignments  IS 'Practice plan: assignment of training modules to employees';
COMMENT ON TABLE training_certificates IS 'Practice plan: generated completion certificates';
COMMENT ON TABLE baas                  IS 'Practice plan: dedicated BAA tracking with expiration status';

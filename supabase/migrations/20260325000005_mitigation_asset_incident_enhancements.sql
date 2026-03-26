-- =====================================================================
-- PRACTICE PLAN: Mitigation Workflow + Asset Risk + Incident Enhancements
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 1. MITIGATION_ITEMS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mitigation_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  source      text NOT NULL DEFAULT 'manual'
    CHECK (source IN ('risk_assessment', 'manual', 'asset', 'incident')),
  source_id   text,               -- ID of the source record (risk assessment, asset, etc.)

  title       text NOT NULL,
  description text,

  priority    text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  status      text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'done', 'ignored')),

  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date    date,
  closed_at   timestamp with time zone,

  created_at  timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL,
  updated_at  timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS mi_org_idx      ON mitigation_items(org_id);
CREATE INDEX IF NOT EXISTS mi_status_idx   ON mitigation_items(status);
CREATE INDEX IF NOT EXISTS mi_priority_idx ON mitigation_items(priority);
CREATE INDEX IF NOT EXISTS mi_due_idx      ON mitigation_items(due_date);

ALTER TABLE mitigation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mi_select" ON mitigation_items FOR SELECT
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "mi_insert" ON mitigation_items FOR INSERT
  WITH CHECK (
    org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid())
    AND created_by = auth.uid()
  );
CREATE POLICY "mi_update" ON mitigation_items FOR UPDATE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));
CREATE POLICY "mi_delete" ON mitigation_items FOR DELETE
  USING (org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid()));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_mitigation_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    NEW.closed_at = timezone('utc', now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mitigation_items_updated_at
  BEFORE UPDATE ON mitigation_items
  FOR EACH ROW EXECUTE FUNCTION update_mitigation_items_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 2. MITIGATION_COMMENTS
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mitigation_comments (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES mitigation_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS mc_item_idx ON mitigation_comments(item_id);

ALTER TABLE mitigation_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mc_select" ON mitigation_comments FOR SELECT
  USING (item_id IN (
    SELECT id FROM mitigation_items
    WHERE org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid())
  ));
CREATE POLICY "mc_insert" ON mitigation_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND item_id IN (
      SELECT id FROM mitigation_items
      WHERE org_id IN (SELECT id::text FROM organizations WHERE user_id = auth.uid())
    )
  );
CREATE POLICY "mc_delete" ON mitigation_comments FOR DELETE
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────
-- 3. ASSETS — add Practice plan columns
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS phi_access_level    text DEFAULT 'read'
    CHECK (phi_access_level IN ('none','read','read_write','full')),
  ADD COLUMN IF NOT EXISTS encryption_at_rest  boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS encryption_in_transit boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_controlled   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS responsible_person  text,
  ADD COLUMN IF NOT EXISTS last_reviewed_date  date;

-- Practice risk score function (returns 0-75)
CREATE OR REPLACE FUNCTION asset_practice_risk_score(
  p_phi_access_level   text,
  p_encryption_at_rest boolean,
  p_encryption_in_transit boolean,
  p_access_controlled  boolean,
  p_mfa_enabled        boolean
) RETURNS integer AS $$
DECLARE
  base_score integer;
  deductions integer := 0;
BEGIN
  base_score := CASE p_phi_access_level
    WHEN 'none'       THEN 0
    WHEN 'read'       THEN 25
    WHEN 'read_write' THEN 50
    WHEN 'full'       THEN 75
    ELSE 25
  END;
  IF p_encryption_at_rest    IS TRUE THEN deductions := deductions + 10; END IF;
  IF p_encryption_in_transit IS TRUE THEN deductions := deductions + 10; END IF;
  IF p_access_controlled     IS TRUE THEN deductions := deductions + 10; END IF;
  IF p_mfa_enabled           IS TRUE THEN deductions := deductions + 10; END IF;
  RETURN GREATEST(0, base_score - deductions);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─────────────────────────────────────────────────────────────────────
-- 4. INCIDENT_LOGS — add Practice plan columns
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE incident_logs
  ADD COLUMN IF NOT EXISTS sanction_type         text
    CHECK (sanction_type IN ('verbal_warning','written_warning','suspension','termination','other')),
  ADD COLUMN IF NOT EXISTS involved_employee_ids uuid[],  -- references employees.id (Practice plan)
  ADD COLUMN IF NOT EXISTS reviewed_by_admin     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewed_at           timestamp with time zone;

COMMENT ON COLUMN incident_logs.sanction_type         IS 'Practice plan: structured sanction type';
COMMENT ON COLUMN incident_logs.involved_employee_ids IS 'Practice plan: UUIDs of employees from the employees table';
COMMENT ON COLUMN incident_logs.reviewed_by_admin     IS 'Practice plan: admin review toggle';
COMMENT ON TABLE  mitigation_items                    IS 'Practice plan: structured mitigation workflow items';
COMMENT ON TABLE  mitigation_comments                 IS 'Practice plan: comments thread on mitigation items';

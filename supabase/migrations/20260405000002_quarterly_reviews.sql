-- =====================================================================
-- Quarterly Compliance Reviews
-- =====================================================================

CREATE TABLE IF NOT EXISTS quarterly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quarter VARCHAR(10) NOT NULL,    -- 'Q1', 'Q2', 'Q3', 'Q4'
  year INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'complete', 'cancelled')),
  meeting_date DATE,
  meeting_time TIME,
  meeting_location VARCHAR(255),
  duration_minutes INTEGER,
  compliance_score_at_review INTEGER,
  compliance_tier_at_review VARCHAR(20),
  pre_brief_sent_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  facilitated_by UUID REFERENCES users(id),
  agenda_config JSONB DEFAULT '{}',
  notes_for_attendees TEXT,
  elapsed_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quarterly_reviews_org ON quarterly_reviews(org_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_reviews_status ON quarterly_reviews(status);

CREATE TABLE IF NOT EXISTS quarterly_review_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  email VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  was_present BOOLEAN DEFAULT false,
  invite_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_attendees_review ON quarterly_review_attendees(review_id);

CREATE TABLE IF NOT EXISTS quarterly_review_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL,
  section_label VARCHAR(100) NOT NULL,
  section_order INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'complete', 'skipped')),
  discussion_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_sections_review ON quarterly_review_sections(review_id);

CREATE TABLE IF NOT EXISTS quarterly_review_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES quarterly_review_sections(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  decision_text TEXT NOT NULL,
  decided_by_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_decisions_review ON quarterly_review_decisions(review_id);

CREATE TABLE IF NOT EXISTS quarterly_review_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES quarterly_reviews(id) ON DELETE CASCADE,
  section_id UUID REFERENCES quarterly_review_sections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  assigned_to_name VARCHAR(255),
  due_date DATE,
  priority VARCHAR(10) DEFAULT 'medium'
    CHECK (priority IN ('high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'complete', 'cancelled')),
  mitigation_item_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_action_items_review ON quarterly_review_action_items(review_id);

-- RLS
ALTER TABLE quarterly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_review_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_review_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_review_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_review_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access their org quarterly reviews"
  ON quarterly_reviews FOR ALL
  USING (org_id IN (SELECT id FROM organizations WHERE user_id = auth.uid()));

CREATE POLICY "Users access their org review attendees"
  ON quarterly_review_attendees FOR ALL
  USING (review_id IN (
    SELECT id FROM quarterly_reviews WHERE org_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users access their org review sections"
  ON quarterly_review_sections FOR ALL
  USING (review_id IN (
    SELECT id FROM quarterly_reviews WHERE org_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users access their org review decisions"
  ON quarterly_review_decisions FOR ALL
  USING (review_id IN (
    SELECT id FROM quarterly_reviews WHERE org_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users access their org review action items"
  ON quarterly_review_action_items FOR ALL
  USING (review_id IN (
    SELECT id FROM quarterly_reviews WHERE org_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  ));

-- Extend mitigation_items source to include quarterly_review
-- (update the constraint; DROP/ADD since ALTER CONSTRAINT is not supported in PG)
ALTER TABLE mitigation_items DROP CONSTRAINT IF EXISTS mitigation_items_source_check;
ALTER TABLE mitigation_items ADD CONSTRAINT mitigation_items_source_check
  CHECK (source IN ('risk_assessment', 'manual', 'asset', 'incident', 'quarterly_review'));

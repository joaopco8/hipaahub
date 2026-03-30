-- ============================================================
-- Subscription system: org-level trial tracking
-- ============================================================

-- Add subscription fields to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(20) NOT NULL DEFAULT 'solo'
    CHECK (plan_tier IN ('solo', 'practice', 'clinic', 'enterprise')),
  ADD COLUMN IF NOT EXISTS subscribed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMPTZ;

-- Subscription events log
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  from_plan VARCHAR(20),
  to_plan VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast org lookups
CREATE INDEX IF NOT EXISTS idx_subscription_events_org_id
  ON subscription_events (org_id, created_at DESC);

-- RLS: users can read their own org's events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org subscription events"
  ON subscription_events FOR SELECT
  USING (
    org_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Index for expire-trial cron query
CREATE INDEX IF NOT EXISTS idx_orgs_trial_expiry
  ON organizations (subscription_status, trial_ends_at)
  WHERE subscription_status = 'trial';

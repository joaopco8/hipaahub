-- Compliance Calendar: three supporting tables

CREATE TABLE IF NOT EXISTS compliance_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'policy_review', 'training_renewal', 'baa_renewal',
    'risk_assessment', 'quarterly_review', 'mitigation_deadline',
    'custom'
  )),
  status VARCHAR(30) NOT NULL DEFAULT 'upcoming' CHECK (status IN (
    'upcoming', 'due_soon', 'overdue', 'in_progress',
    'complete', 'snoozed', 'cancelled'
  )),
  due_date DATE NOT NULL,
  end_date DATE,
  assigned_to UUID REFERENCES users(id),
  source_type VARCHAR(50),
  source_id UUID,
  notes TEXT,
  recurrence VARCHAR(20) DEFAULT 'none' CHECK (recurrence IN (
    'none', 'annual', 'quarterly', 'monthly', 'custom'
  )),
  recurrence_interval_days INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id),
  snoozed_until DATE,
  snooze_reason TEXT,
  is_auto_generated BOOLEAN DEFAULT false,
  parent_event_id UUID REFERENCES compliance_calendar_events(id),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_events_org_id ON compliance_calendar_events(org_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_due_date ON compliance_calendar_events(due_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON compliance_calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_source ON compliance_calendar_events(source_type, source_id);

CREATE TABLE IF NOT EXISTS calendar_event_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES compliance_calendar_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_activity_event ON calendar_event_activity(event_id);

CREATE TABLE IF NOT EXISTS calendar_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  notifications_enabled BOOLEAN DEFAULT true,
  alert_days INTEGER[] DEFAULT '{90,60,30,7,1}',
  additional_cc TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE compliance_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_event_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access their org calendar events"
  ON compliance_calendar_events
  FOR ALL
  USING (
    org_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users access their org event activity"
  ON calendar_event_activity
  FOR ALL
  USING (
    event_id IN (
      SELECT e.id FROM compliance_calendar_events e
      JOIN organizations o ON o.id = e.org_id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users access their org notification prefs"
  ON calendar_notification_preferences
  FOR ALL
  USING (
    org_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

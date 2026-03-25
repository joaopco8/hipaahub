-- Add 'ignored' status to action_items and create comments table

-- Step 1: Drop the existing check constraint on status
ALTER TABLE action_items DROP CONSTRAINT IF EXISTS action_items_status_check;

-- Step 2: Re-add with 'ignored' included
ALTER TABLE action_items
  ADD CONSTRAINT action_items_status_check
  CHECK (status IN ('pending', 'in-progress', 'completed', 'ignored'));

-- Step 3: Add assignee_user_id and due_date columns if not present
ALTER TABLE action_items
  ADD COLUMN IF NOT EXISTS assignee_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS due_date date;

-- Step 4: Create action_item_comments table
CREATE TABLE IF NOT EXISTS action_item_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_item_id uuid NOT NULL REFERENCES action_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS action_item_comments_item_idx ON action_item_comments(action_item_id);
CREATE INDEX IF NOT EXISTS action_item_comments_user_idx ON action_item_comments(user_id);

ALTER TABLE action_item_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on their action items"
  ON action_item_comments FOR SELECT
  USING (
    action_item_id IN (
      SELECT id FROM action_items WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments on their action items"
  ON action_item_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND action_item_id IN (
      SELECT id FROM action_items WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON action_item_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON action_item_comments FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to update updated_at on comments
CREATE TRIGGER update_action_item_comments_updated_at
  BEFORE UPDATE ON action_item_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

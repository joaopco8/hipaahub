-- Add DELETE policies for risk_assessments and compliance_commitments

-- RLS Policy for risk_assessments DELETE
create policy "Users can delete own risk assessment" on risk_assessments
  for delete using (auth.uid() = user_id);

-- RLS Policy for compliance_commitments DELETE
create policy "Users can delete own commitment" on compliance_commitments
  for delete using (auth.uid() = user_id);









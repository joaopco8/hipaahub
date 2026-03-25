-- Add role_group to employee_invites for role-based training assignment

ALTER TABLE employee_invites
  ADD COLUMN IF NOT EXISTS role_group text
    CHECK (role_group IN ('clinical', 'admin', 'contractor', 'intern'));

COMMENT ON COLUMN employee_invites.role_group IS 'Employee role group for training role-based module assignment';

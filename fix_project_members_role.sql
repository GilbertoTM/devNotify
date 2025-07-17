-- Fix project_members role constraint issue

-- First check what constraint is causing the problem
-- The error suggests the role 'owner' is being rejected

-- Let's check the current constraint
-- If needed, we can update it to ensure 'owner' is included

-- Drop and recreate the constraint if necessary
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_role_check;

-- Add the constraint with all valid roles
ALTER TABLE project_members ADD CONSTRAINT project_members_role_check 
  CHECK (role IN ('owner', 'admin', 'developer', 'viewer'));

-- Verify the constraint
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'project_members'::regclass AND contype = 'c';

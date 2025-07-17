-- Verify and add missing columns if needed
-- Execute this in Supabase SQL Editor

-- Check if team_id column exists in projects table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'team_id'
    ) THEN
        ALTER TABLE projects ADD COLUMN team_id uuid REFERENCES teams(id);
        ALTER TABLE projects ALTER COLUMN team_id SET NOT NULL;
    END IF;
END $$;

-- Check if created_by column exists in integrations table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'integrations' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE integrations ADD COLUMN created_by uuid REFERENCES profiles(id);
    END IF;
END $$;

-- Check if status column exists in integrations table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'integrations' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE integrations ADD COLUMN status text DEFAULT 'connected';
    END IF;
END $$;

-- Verify table structure
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('teams', 'projects', 'team_members', 'project_members', 'integrations')
ORDER BY table_name, ordinal_position;

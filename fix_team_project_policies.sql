-- Fix RLS policies for teams and projects creation
-- Execute this in Supabase SQL Editor

-- Drop existing problematic policies for teams
DROP POLICY IF EXISTS "teams_select_policy" ON teams;
DROP POLICY IF EXISTS "teams_insert_policy" ON teams;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON teams;

-- Drop existing problematic policies for projects
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;

-- Drop existing problematic policies for team_members
DROP POLICY IF EXISTS "team_members_policy" ON team_members;

-- Drop existing problematic policies for project_members
DROP POLICY IF EXISTS "project_members_policy" ON project_members;

-- ===== TEAMS POLICIES =====

-- Users can create teams
CREATE POLICY "teams_insert_policy" ON teams
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can view teams they are members of
CREATE POLICY "teams_select_policy" ON teams
  FOR SELECT TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = id AND tm.user_id = auth.uid()
    )
  );

-- Team creators can update their teams
CREATE POLICY "teams_update_policy" ON teams
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- ===== TEAM_MEMBERS POLICIES =====

-- Allow team creators to add members
CREATE POLICY "team_members_insert_policy" ON team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t 
      WHERE t.id = team_id AND t.created_by = auth.uid()
    )
  );

-- Members can view team membership
CREATE POLICY "team_members_select_policy" ON team_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM teams t 
      WHERE t.id = team_id AND t.created_by = auth.uid()
    )
  );

-- ===== PROJECTS POLICIES =====

-- Users can create projects in teams they own or are admins of
CREATE POLICY "projects_insert_policy" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM teams t 
      WHERE t.id = team_id AND t.created_by = auth.uid()
    )
  );

-- Users can view projects they have access to
CREATE POLICY "projects_select_policy" ON projects
  FOR SELECT TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = id AND pm.user_id = auth.uid()
    )
  );

-- Project creators can update their projects
CREATE POLICY "projects_update_policy" ON projects
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- ===== PROJECT_MEMBERS POLICIES =====

-- Allow project creators to add members
CREATE POLICY "project_members_insert_policy" ON project_members
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id AND p.created_by = auth.uid()
    )
  );

-- Members can view project membership
CREATE POLICY "project_members_select_policy" ON project_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM projects p 
      WHERE p.id = project_id AND p.created_by = auth.uid()
    )
  );

-- Add the creator as team member automatically
CREATE OR REPLACE FUNCTION add_team_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add the creator as project member automatically
CREATE OR REPLACE FUNCTION add_project_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_add_team_creator ON teams;
CREATE TRIGGER trigger_add_team_creator
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_team_creator_as_member();

DROP TRIGGER IF EXISTS trigger_add_project_creator ON projects;
CREATE TRIGGER trigger_add_project_creator
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_project_creator_as_member();

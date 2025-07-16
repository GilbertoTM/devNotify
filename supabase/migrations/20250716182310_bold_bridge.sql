/*
  # Fix all RLS policies for authentication

  1. Drop all existing problematic policies
  2. Create clean, working policies for all tables
  3. Ensure proper authentication flow
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team members can read their teams" ON teams;

DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Project members can read their projects" ON projects;

DROP POLICY IF EXISTS "Team members can read team membership" ON team_members;
DROP POLICY IF EXISTS "Project members can read project membership" ON project_members;

DROP POLICY IF EXISTS "Project members can read integrations" ON integrations;
DROP POLICY IF EXISTS "Project admins can manage integrations" ON integrations;

DROP POLICY IF EXISTS "Project members can read notifications" ON notifications;
DROP POLICY IF EXISTS "Project members can update notifications" ON notifications;

DROP POLICY IF EXISTS "Project members can read patterns" ON notification_patterns;

-- PROFILES TABLE POLICIES
CREATE POLICY "Enable read access for users to own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for users to create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users to own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- TEAMS TABLE POLICIES
CREATE POLICY "Enable insert for authenticated users"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable read for team members"
  ON teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = teams.id 
      AND team_members.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

-- PROJECTS TABLE POLICIES
CREATE POLICY "Enable insert for authenticated users"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable read for project members"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = projects.id 
      AND project_members.user_id = auth.uid()
    )
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      WHERE t.id = projects.team_id 
      AND tm.user_id = auth.uid()
    )
  );

-- TEAM_MEMBERS TABLE POLICIES
CREATE POLICY "Enable read for team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for team creators"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_id 
      AND teams.created_by = auth.uid()
    )
  );

-- PROJECT_MEMBERS TABLE POLICIES
CREATE POLICY "Enable read for project members"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM project_members pm 
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for project creators"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_id 
      AND projects.created_by = auth.uid()
    )
  );

-- INTEGRATIONS TABLE POLICIES
CREATE POLICY "Enable read for project members"
  ON integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = integrations.project_id 
      AND project_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = integrations.project_id 
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Enable insert for project members"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = integrations.project_id 
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = integrations.project_id 
      AND projects.created_by = auth.uid()
    )
  );

-- NOTIFICATIONS TABLE POLICIES
CREATE POLICY "Enable read for project members"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = notifications.project_id 
      AND project_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = notifications.project_id 
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Enable update for project members"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = notifications.project_id 
      AND project_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = notifications.project_id 
      AND projects.created_by = auth.uid()
    )
  );

-- NOTIFICATION_PATTERNS TABLE POLICIES
CREATE POLICY "Enable read for project members"
  ON notification_patterns FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = notification_patterns.project_id 
      AND project_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = notification_patterns.project_id 
      AND projects.created_by = auth.uid()
    )
  );
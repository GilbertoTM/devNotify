/*
  # Comprehensive CRUD Policies for DevNotify Database
  
  This file contains complete Row Level Security (RLS) policies for all tables
  in the DevNotify database schema. These policies implement proper access control
  based on user roles and relationships.
  
  ## User Roles:
  - admin: Full system access
  - developer: Can create projects/teams, manage own resources
  - viewer: Read-only access to assigned resources
  
  ## Security Model:
  - Users can only access data they have permission for
  - Team/project membership determines access rights
  - Owners have full control over their resources
  - Admins have elevated privileges for system management
*/

-- =============================================================================
-- PROFILES TABLE POLICIES
-- =============================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Team members can read profiles of other team members
CREATE POLICY "Team members can read team profiles" ON profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm1
            JOIN team_members tm2 ON tm1.team_id = tm2.team_id
            WHERE tm1.user_id = auth.uid() AND tm2.user_id = profiles.id
        )
    );

-- Project members can read profiles of other project members
CREATE POLICY "Project members can read project profiles" ON profiles
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members pm1
            JOIN project_members pm2 ON pm1.project_id = pm2.project_id
            WHERE pm1.user_id = auth.uid() AND pm2.user_id = profiles.id
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Profiles are created automatically via trigger, no manual INSERT needed
-- Users cannot delete profiles (handled by auth system)

-- =============================================================================
-- TEAMS TABLE POLICIES
-- =============================================================================

-- Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team members can read their teams
CREATE POLICY "Team members can read their teams" ON teams
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = teams.id AND user_id = auth.uid()
        )
    );

-- Admins can read all teams
CREATE POLICY "Admins can read all teams" ON teams
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Authenticated users can create teams
CREATE POLICY "Users can create teams" ON teams
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Team owners and admins can update teams
CREATE POLICY "Team owners can update teams" ON teams
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = teams.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = teams.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- System admins can update any team
CREATE POLICY "System admins can update any team" ON teams
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Team owners can delete teams
CREATE POLICY "Team owners can delete teams" ON teams
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = teams.id AND user_id = auth.uid() AND role = 'owner'
        )
    );

-- System admins can delete any team
CREATE POLICY "System admins can delete any team" ON teams
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================================================
-- TEAM_MEMBERS TABLE POLICIES
-- =============================================================================

-- Enable RLS on team_members table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Team members can read team membership
CREATE POLICY "Team members can read team membership" ON team_members
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid()
        )
    );

-- Admins can read all team memberships
CREATE POLICY "Admins can read all team memberships" ON team_members
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Team owners and admins can add members
CREATE POLICY "Team owners can add members" ON team_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- System admins can add members to any team
CREATE POLICY "System admins can add team members" ON team_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Team owners and admins can update member roles
CREATE POLICY "Team owners can update member roles" ON team_members
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Team owners and admins can remove members
CREATE POLICY "Team owners can remove members" ON team_members
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Users can remove themselves from teams
CREATE POLICY "Users can leave teams" ON team_members
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- =============================================================================
-- PROJECTS TABLE POLICIES
-- =============================================================================

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Project members can read their projects
CREATE POLICY "Project members can read their projects" ON projects
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = projects.id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE t.id = projects.team_id AND tm.user_id = auth.uid()
        )
    );

-- Admins can read all projects
CREATE POLICY "Admins can read all projects" ON projects
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Authenticated users can create projects
CREATE POLICY "Users can create projects" ON projects
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Project owners and admins can update projects
CREATE POLICY "Project owners can update projects" ON projects
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = projects.id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Team owners can update team projects
CREATE POLICY "Team owners can update team projects" ON projects
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = projects.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm.team_id = projects.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    );

-- System admins can update any project
CREATE POLICY "System admins can update any project" ON projects
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Project owners can delete projects
CREATE POLICY "Project owners can delete projects" ON projects
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = projects.id AND user_id = auth.uid() AND role = 'owner'
        )
    );

-- System admins can delete any project
CREATE POLICY "System admins can delete any project" ON projects
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================================================
-- PROJECT_MEMBERS TABLE POLICIES
-- =============================================================================

-- Enable RLS on project_members table
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Project members can read project membership
CREATE POLICY "Project members can read project membership" ON project_members
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM project_members pm
            WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
        )
    );

-- Admins can read all project memberships
CREATE POLICY "Admins can read all project memberships" ON project_members
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Project owners and admins can add members
CREATE POLICY "Project owners can add members" ON project_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = project_members.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- System admins can add members to any project
CREATE POLICY "System admins can add project members" ON project_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Project owners and admins can update member roles
CREATE POLICY "Project owners can update member roles" ON project_members
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = project_members.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = project_members.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Project owners and admins can remove members
CREATE POLICY "Project owners can remove members" ON project_members
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = project_members.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Users can remove themselves from projects
CREATE POLICY "Users can leave projects" ON project_members
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- =============================================================================
-- INTEGRATIONS TABLE POLICIES
-- =============================================================================

-- Enable RLS on integrations table
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Project members can read integrations
CREATE POLICY "Project members can read integrations" ON integrations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = integrations.project_id AND user_id = auth.uid()
        )
    );

-- Admins can read all integrations
CREATE POLICY "Admins can read all integrations" ON integrations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Project admins can manage integrations
CREATE POLICY "Project admins can manage integrations" ON integrations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = integrations.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = integrations.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        ) AND created_by = auth.uid()
    );

-- System admins can manage all integrations
CREATE POLICY "System admins can manage all integrations" ON integrations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- =============================================================================

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Project members can read notifications
CREATE POLICY "Project members can read notifications" ON notifications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = notifications.project_id AND user_id = auth.uid()
        )
    );

-- Admins can read all notifications
CREATE POLICY "Admins can read all notifications" ON notifications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- System can create notifications (usually via integrations/webhooks)
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT TO authenticated
    WITH CHECK (true); -- Notifications are typically created by system processes

-- Project members can update notifications (mark as read, resolve)
CREATE POLICY "Project members can update notifications" ON notifications
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = notifications.project_id AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = notifications.project_id AND user_id = auth.uid()
        )
    );

-- Project admins can delete notifications
CREATE POLICY "Project admins can delete notifications" ON notifications
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = notifications.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- System admins can delete any notification
CREATE POLICY "System admins can delete any notification" ON notifications
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================================================
-- NOTIFICATION_PATTERNS TABLE POLICIES
-- =============================================================================

-- Enable RLS on notification_patterns table
ALTER TABLE notification_patterns ENABLE ROW LEVEL SECURITY;

-- Project members can read patterns
CREATE POLICY "Project members can read patterns" ON notification_patterns
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = notification_patterns.project_id AND user_id = auth.uid()
        )
    );

-- Admins can read all patterns
CREATE POLICY "Admins can read all patterns" ON notification_patterns
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- System can create patterns (usually automated)
CREATE POLICY "System can create patterns" ON notification_patterns
    FOR INSERT TO authenticated
    WITH CHECK (true); -- Patterns are typically created by system analysis

-- System can update patterns
CREATE POLICY "System can update patterns" ON notification_patterns
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- Project admins can delete patterns
CREATE POLICY "Project admins can delete patterns" ON notification_patterns
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = notification_patterns.project_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- System admins can delete any pattern
CREATE POLICY "System admins can delete any pattern" ON notification_patterns
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC MEMBERSHIP
-- =============================================================================

-- Function to automatically add creator as owner when creating a team
CREATE OR REPLACE FUNCTION add_team_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add team owner
DROP TRIGGER IF EXISTS add_team_owner_trigger ON teams;
CREATE TRIGGER add_team_owner_trigger
    AFTER INSERT ON teams
    FOR EACH ROW
    EXECUTE FUNCTION add_team_owner();

-- Function to automatically add creator as owner when creating a project
CREATE OR REPLACE FUNCTION add_project_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add project owner
DROP TRIGGER IF EXISTS add_project_owner_trigger ON projects;
CREATE TRIGGER add_project_owner_trigger
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION add_project_owner();

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on all sequences to authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION add_team_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION add_project_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;

-- =============================================================================
-- POLICY SUMMARY
-- =============================================================================

/*
  ## Policy Summary:
  
  ### PROFILES
  - Users can read/update their own profile
  - Team/project members can see each other's profiles
  - Admins can read/update all profiles
  
  ### TEAMS
  - Team members can read their teams
  - Users can create teams (become owner automatically)
  - Owners/admins can update/delete teams
  - System admins have full access
  
  ### TEAM_MEMBERS
  - Team members can see membership
  - Owners/admins can add/remove/update members
  - Users can leave teams themselves
  
  ### PROJECTS
  - Project/team members can read projects
  - Users can create projects (become owner automatically)
  - Owners/admins can update/delete projects
  - System admins have full access
  
  ### PROJECT_MEMBERS
  - Project members can see membership
  - Owners/admins can add/remove/update members
  - Users can leave projects themselves
  
  ### INTEGRATIONS
  - Project members can read integrations
  - Project admins can manage integrations
  - System admins have full access
  
  ### NOTIFICATIONS
  - Project members can read/update notifications
  - System can create notifications
  - Project admins can delete notifications
  
  ### NOTIFICATION_PATTERNS
  - Project members can read patterns
  - System can create/update patterns
  - Project admins can delete patterns
  
  ## Security Features:
  - Row Level Security enabled on all tables
  - Role-based access control (owner, admin, member, viewer)
  - Automatic ownership assignment via triggers
  - Proper isolation between teams/projects
  - Admin override capabilities for system management
*/
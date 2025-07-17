-- Fix integrations table policies to allow project creators to add integrations

-- Drop existing policies
DROP POLICY IF EXISTS "Project members can read integrations" ON integrations;
DROP POLICY IF EXISTS "Admins can read all integrations" ON integrations;
DROP POLICY IF EXISTS "Project admins can manage integrations" ON integrations;
DROP POLICY IF EXISTS "System admins can manage all integrations" ON integrations;

-- Recreate with better logic

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

-- Project creators can create integrations (simplified policy)
CREATE POLICY "Project creators can create integrations" ON integrations
    FOR INSERT TO authenticated
    WITH CHECK (
        -- User is the creator of the integration
        created_by = auth.uid()
        AND (
            -- User is a project admin/owner
            EXISTS (
                SELECT 1 FROM project_members
                WHERE project_id = integrations.project_id 
                AND user_id = auth.uid() 
                AND role IN ('owner', 'admin')
            )
            OR
            -- User is the project creator (even if not yet in project_members)
            EXISTS (
                SELECT 1 FROM projects
                WHERE id = integrations.project_id 
                AND created_by = auth.uid()
            )
        )
    );

-- Project admins can update integrations
CREATE POLICY "Project admins can update integrations" ON integrations
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = integrations.project_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
        OR
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = integrations.project_id 
            AND created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = integrations.project_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
        OR
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = integrations.project_id 
            AND created_by = auth.uid()
        )
    );

-- Project admins can delete integrations
CREATE POLICY "Project admins can delete integrations" ON integrations
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_id = integrations.project_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
        OR
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = integrations.project_id 
            AND created_by = auth.uid()
        )
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

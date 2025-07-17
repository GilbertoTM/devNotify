-- Script para limpiar completamente las políticas RLS y recrearlas
-- EJECUTAR EN SUPABASE SQL EDITOR

-- ===== PASO 1: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES =====

-- Eliminar políticas de profiles
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Eliminar políticas de teams
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'teams'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON teams', policy_record.policyname);
    END LOOP;
END $$;

-- Eliminar políticas de team_members
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'team_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON team_members', policy_record.policyname);
    END LOOP;
END $$;

-- Eliminar políticas de projects
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'projects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON projects', policy_record.policyname);
    END LOOP;
END $$;

-- Eliminar políticas de project_members
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'project_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON project_members', policy_record.policyname);
    END LOOP;
END $$;

-- Eliminar políticas de integrations
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'integrations'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON integrations', policy_record.policyname);
    END LOOP;
END $$;

-- Eliminar políticas de notifications
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'notifications'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON notifications', policy_record.policyname);
    END LOOP;
END $$;

-- ===== PASO 2: VERIFICAR/AGREGAR COLUMNAS FALTANTES =====

-- Agregar columna color a projects si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'color'
    ) THEN
        ALTER TABLE projects ADD COLUMN color text NOT NULL DEFAULT '#3B82F6';
    END IF;
END $$;

-- ===== PASO 3: CREAR POLÍTICAS SIMPLES SIN RECURSIÓN =====

-- PROFILES: Solo acceso a propio perfil
CREATE POLICY "profiles_simple_policy" ON profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- TEAMS: Solo creador puede acceder inicialmente
CREATE POLICY "teams_owner_only" ON teams
  FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- TEAM_MEMBERS: Solo el usuario mismo puede ver su membresía
CREATE POLICY "team_members_self_only" ON team_members
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PROJECTS: Solo creador puede acceder inicialmente
CREATE POLICY "projects_owner_only" ON projects
  FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- PROJECT_MEMBERS: Solo el usuario mismo puede ver su membresía
CREATE POLICY "project_members_self_only" ON project_members
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- INTEGRATIONS: Solo creador puede acceder
CREATE POLICY "integrations_owner_only" ON integrations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS: Solo usuario puede acceder a sus notificaciones
CREATE POLICY "notifications_user_only" ON notifications
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ===== PASO 4: CREAR FUNCIONES Y TRIGGERS PARA AUTO-MEMBRESÍA =====

-- Función para agregar automáticamente el creador como miembro del equipo
CREATE OR REPLACE FUNCTION auto_add_team_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (team_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para agregar automáticamente el creador como miembro del proyecto
CREATE OR REPLACE FUNCTION auto_add_project_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (project_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_add_team_member ON teams;
CREATE TRIGGER trigger_auto_add_team_member
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_team_member();

DROP TRIGGER IF EXISTS trigger_auto_add_project_member ON projects;
CREATE TRIGGER trigger_auto_add_project_member
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_add_project_member();

-- ===== VERIFICACIÓN =====
SELECT 'Políticas creadas correctamente' as status;

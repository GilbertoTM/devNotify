u-- ALTERNATIVA: Remover temporalmente el constraint problemático
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_role_check;

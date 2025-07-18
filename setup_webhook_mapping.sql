-- Script para configurar el mapeo de repositorios a proyectos
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla de mapeo de repositorios (si no existe)
CREATE TABLE IF NOT EXISTS repository_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    repository_full_name TEXT NOT NULL UNIQUE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    github_webhook_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_repository_mappings_repo_name 
ON repository_mappings(repository_full_name);

CREATE INDEX IF NOT EXISTS idx_repository_mappings_project_id 
ON repository_mappings(project_id);

-- 3. Primero verificar qué proyectos existen
SELECT id, name FROM projects ORDER BY created_at DESC;

-- 4. Insertar mapeo para el repositorio principal
-- NOTA: Usaremos el proyecto más reciente como ejemplo
INSERT INTO repository_mappings (repository_full_name, project_id, github_webhook_url)
VALUES (
    'GilbertoTM/devNotify',
    (SELECT id FROM projects ORDER BY created_at DESC LIMIT 1),
    'https://giliberto05.app.n8n.cloud/webhook/github-webhook'
) ON CONFLICT (repository_full_name) DO UPDATE SET
    project_id = EXCLUDED.project_id,
    github_webhook_url = EXCLUDED.github_webhook_url,
    updated_at = NOW();

-- 5. Función para obtener project_id por repositorio
CREATE OR REPLACE FUNCTION get_project_id_by_repo(repo_name TEXT)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT project_id 
        FROM repository_mappings 
        WHERE repository_full_name = repo_name
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Verificar la configuración
SELECT 
    rm.repository_full_name,
    p.name as project_name,
    rm.github_webhook_url,
    rm.created_at
FROM repository_mappings rm
JOIN projects p ON rm.project_id = p.id;

-- 7. Agregar más mapeos de repositorios (ejemplos)
-- Ajustar según tus repositorios reales

-- Mapeo para repositorio principal
INSERT INTO repository_mappings (repository_full_name, project_id, github_webhook_url)
VALUES 
    ('GilbertoTM/devNotify', 'c7a2dc3f-d70d-4b0e-9493-5421c8b72d5d', 'https://giliberto05.app.n8n.cloud/webhook/github-webhook'),
    ('GilbertoTM/otro-repo', '441b3c83-c43d-4a2b-a279-f8faf6b77c71', 'https://giliberto05.app.n8n.cloud/webhook/github-webhook'),
    ('GilbertoTM/arkus-project', '99c2baa7-5288-4f09-8b0e-b132db353244', 'https://giliberto05.app.n8n.cloud/webhook/github-webhook')
ON CONFLICT (repository_full_name) DO UPDATE SET
    project_id = EXCLUDED.project_id,
    github_webhook_url = EXCLUDED.github_webhook_url,
    updated_at = NOW();

-- 8. Función para auto-mapear repositorio a proyecto por nombre
CREATE OR REPLACE FUNCTION auto_map_repository_to_project(repo_name TEXT)
RETURNS UUID AS $$
DECLARE
    project_id_result UUID;
    repo_short_name TEXT;
BEGIN
    -- Obtener solo el nombre del repositorio (sin usuario)
    repo_short_name := split_part(repo_name, '/', 2);
    
    -- Buscar proyecto con nombre similar
    SELECT id INTO project_id_result
    FROM projects 
    WHERE name ILIKE '%' || repo_short_name || '%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Si no encuentra, usar el proyecto más reciente
    IF project_id_result IS NULL THEN
        SELECT id INTO project_id_result
        FROM projects 
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;
    
    -- Insertar mapeo automático
    INSERT INTO repository_mappings (repository_full_name, project_id, github_webhook_url)
    VALUES (
        repo_name,
        project_id_result,
        'https://giliberto05.app.n8n.cloud/webhook/github-webhook'
    )
    ON CONFLICT (repository_full_name) DO NOTHING;
    
    RETURN project_id_result;
END;
$$ LANGUAGE plpgsql;

-- SOLUCIÓN TEMPORAL: Política muy permisiva para integrations
-- IMPORTANTE: Solo para desarrollo, NO para producción

-- Deshabilitar RLS temporalmente
ALTER TABLE integrations DISABLE ROW LEVEL SECURITY;

-- O alternativamente, crear una política muy permisiva:
-- DROP POLICY IF EXISTS "Temporary allow all integrations" ON integrations;
-- CREATE POLICY "Temporary allow all integrations" ON integrations
--     FOR ALL TO authenticated
--     USING (true)
--     WITH CHECK (created_by = auth.uid());

-- Deshabilitar temporalmente RLS para diagnosticar el problema
-- EJECUTAR ESTO TEMPORALMENTE EN SUPABASE SQL EDITOR

-- Verificar las políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Deshabilitar temporalmente RLS en la tabla profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- NOTA: Después de probar, volver a habilitar con:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

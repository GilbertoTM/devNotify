import { createClient } from '@supabase/supabase-js';

// ACTUALIZAR ESTAS CREDENCIALES CON EL NUEVO PROYECTO
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables de entorno de Supabase no definidas');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Definida' : 'No definida');
}

console.log('Inicializando cliente Supabase con URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  // Agregar opciones para mejor diagnóstico
  global: {
    fetch: (...args) => {
      console.log('Realizando solicitud a Supabase');
      return fetch(...args);
    }
  }
});

// Verificar que el cliente se inicialice correctamente
console.log('Cliente Supabase inicializado:', !!supabase);

// Función para probar la conectividad
export const testSupabaseConnection = async () => {
  try {
    console.log('🧪 Probando conexión con Supabase...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
    console.log('✅ Conexión exitosa con Supabase');
    return true;
  } catch (error) {
    console.error('💥 Error de conectividad:', error);
    return false;
  }
};
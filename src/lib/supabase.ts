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
      const [url, options] = args;
      const method = options?.method || 'GET';
      const urlPath = typeof url === 'string' ? new URL(url).pathname : 'unknown';
      
      // Solo logear operaciones importantes para reducir ruido
      if (method !== 'GET' || urlPath.includes('rpc/')) {
        console.log(`📡 Supabase ${method} ${urlPath}`);
      }
      
      const startTime = Date.now();
      return fetch(...args).then(response => {
        const duration = Date.now() - startTime;
        
        // Solo logear si tarda más de 1 segundo o es una operación de escritura
        if (duration > 1000 || method !== 'GET') {
          console.log(`✅ Supabase ${method} ${urlPath} completado en ${duration}ms`);
        }
        
        return response;
      }).catch(error => {
        const duration = Date.now() - startTime;
        console.error(`❌ Supabase ${method} ${urlPath} falló en ${duration}ms:`, error);
        throw error;
      });
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

// Función helper para agregar timeout a consultas de Supabase
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 15000,
  operation: string = 'Supabase operation'
): Promise<T> => {
  let timeoutId: NodeJS.Timeout | undefined;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      console.error(`⏰ [${operation}] Timeout después de ${timeoutMs}ms`);
      reject(new Error(`${operation} timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    console.log(`⏳ [${operation}] Iniciando operación con timeout de ${timeoutMs}ms`);
    const result = await Promise.race([promise, timeoutPromise]);
    console.log(`✅ [${operation}] Operación completada exitosamente`);
    if (timeoutId) clearTimeout(timeoutId); // Cancelar el timeout cuando la operación se completa
    return result;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId); // Cancelar el timeout en caso de error también
    console.error(`❌ [${operation}] Operación falló:`, error);
    throw error;
  }
};
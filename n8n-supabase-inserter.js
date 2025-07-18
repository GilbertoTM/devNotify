// Código para n8n - Insertar en Supabase
// Este código debe ir en un nodo "Code" para insertar en Supabase

const item = $input.all()[0];

if (!item) {
  throw new Error('No hay datos de entrada');
}

// Extraer datos del nodo anterior
const notification = item.json.notification;
const repositoryName = item.json.repository_name;

console.log('Procesando notificación:', notification);
console.log('Repositorio:', repositoryName);

// Mapear repositorio a proyecto (esto debería estar en tu base de datos)
// Por ahora usaremos un mapeo hardcodeado
const projectMapping = {
  'jose/DevNotify': 1, // Ajusta según tu proyecto
  'jose/project': 1,
  'arkus/project': 1
  // Añade más mapeos según necesites
};

const projectId = projectMapping[repositoryName];

if (!projectId) {
  console.log(`No se encontró mapeo para el repositorio: ${repositoryName}`);
  // Puedes decidir si quieres fallar o usar un proyecto por defecto
  // throw new Error(`No se encontró mapeo para el repositorio: ${repositoryName}`);
}

// Preparar datos para insertar en Supabase
const supabaseData = {
  project_id: projectId || 1, // Usar proyecto por defecto si no se encuentra mapeo
  type: notification.type,
  title: notification.title,
  message: notification.message,
  data: notification.data,
  status: 'unread',
  created_at: new Date().toISOString()
};

console.log('Datos para Supabase:', JSON.stringify(supabaseData, null, 2));

// Preparar output para el nodo HTTP de Supabase
const output = {
  method: 'POST',
  url: 'https://your-supabase-url.supabase.co/rest/v1/notifications',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-supabase-anon-key',
    'apikey': 'your-supabase-anon-key'
  },
  body: supabaseData
};

return [output];

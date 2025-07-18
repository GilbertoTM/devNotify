// CÓDIGO OPTIMIZADO PARA SUPABASE
// Reemplaza el código de tu nodo Code con este:

const items = $input.all();
console.log('TOTAL ITEMS:', items.length);

if (!items || items.length === 0) {
  return [{ success: false, error: 'No hay datos' }];
}

const item = items[0];
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return [{ success: false, error: 'No body found' }];
}

const eventType = headers?.['x-github-event'] || 'unknown';
const repository = body.repository;
const sender = body.sender;
const headCommit = body.head_commit;

console.log('Event:', eventType);
console.log('Repo:', repository?.full_name);
console.log('Sender:', sender?.login);
console.log('Commit:', headCommit?.message);

// Preparar datos directamente para Supabase
const supabaseData = {
  project_id: 1, // Cambiar por tu ID de proyecto real
  type: eventType,
  title: `Nuevo ${eventType} en ${repository?.name}`,
  message: `${sender?.login} hizo commit: "${headCommit?.message}"`,
  data: {
    repository: repository?.full_name,
    sender: sender?.login,
    commit_message: headCommit?.message,
    commit_sha: headCommit?.id,
    branch: body.ref?.replace('refs/heads/', ''),
    url: headCommit?.url,
    timestamp: headCommit?.timestamp
  },
  status: 'unread'
};

console.log('DATOS PARA SUPABASE:', JSON.stringify(supabaseData, null, 2));

// Retornar datos listos para HTTP Request
return [supabaseData];

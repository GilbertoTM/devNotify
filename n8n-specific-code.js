// CÓDIGO ESPECÍFICO PARA TU ESTRUCTURA DE DATOS
// Basado en el input que compartiste, usa este código en tu nodo Code de n8n

// Obtener todos los items
const items = $input.all();

console.log('TOTAL ITEMS:', items.length);

// Verificar si hay items
if (!items || items.length === 0) {
  return [{
    success: false,
    error: 'No hay datos de entrada',
    debug: 'No items found'
  }];
}

const item = items[0];

console.log('ESTRUCTURA DEL ITEM:');
console.log('- item.json existe:', item.json ? 'SÍ' : 'NO');
console.log('- item.json.body existe:', item.json?.body ? 'SÍ' : 'NO');
console.log('- item.json.headers existe:', item.json?.headers ? 'SÍ' : 'NO');

// Basado en tu input, los datos están en item.json.body
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return [{
    success: false,
    error: 'No se encontró el cuerpo del webhook',
    debug: 'item.json.body is null or undefined',
    raw_item: item
  }];
}

// Extraer información básica
const eventType = headers?.['x-github-event'] || 'unknown';
const repository = body.repository;
const sender = body.sender;
const headCommit = body.head_commit;

console.log('DATOS EXTRAÍDOS:');
console.log('- Event Type:', eventType);
console.log('- Repository:', repository?.full_name);
console.log('- Sender:', sender?.login);
console.log('- Head Commit:', headCommit?.message);

// Crear notificación específica para push (que es tu caso)
if (eventType === 'push' && headCommit) {
  const notification = {
    type: 'commit',
    title: `Nuevo commit en ${repository.name}`,
    message: `${sender.login} hizo commit: "${headCommit.message}"`,
    data: {
      repository: repository.full_name,
      commit_sha: headCommit.id,
      commit_message: headCommit.message,
      author: headCommit.author.name,
      author_email: headCommit.author.email,
      url: headCommit.url,
      branch: body.ref?.replace('refs/heads/', '') || 'unknown',
      timestamp: headCommit.timestamp
    }
  };
  
  const output = {
    success: true,
    event_type: eventType,
    repository_name: repository.full_name,
    repository_id: repository.id,
    sender_login: sender.login,
    notification: notification,
    debug: 'Procesado correctamente'
  };
  
  console.log('OUTPUT FINAL:', JSON.stringify(output, null, 2));
  
  return [output];
}

// Si no es push o no hay head_commit
return [{
  success: false,
  error: `Evento no soportado o incompleto: ${eventType}`,
  debug: {
    eventType: eventType,
    hasHeadCommit: !!headCommit,
    hasRepository: !!repository,
    hasSender: !!sender
  }
}];

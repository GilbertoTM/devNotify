# Código robusto para n8n (después del debugging)

Una vez que hayas confirmado la estructura de datos con el código de debugging, usa este código más robusto:

```javascript
// Código robusto para procesar GitHub webhooks en n8n

try {
  // Obtener el primer item del input
  const items = $input.all();
  
  if (!items || items.length === 0) {
    throw new Error('No hay datos de entrada');
  }
  
  const item = items[0];
  
  // Extraer datos del webhook
  // Ajusta estas rutas según lo que veas en el debugging
  const body = item.json?.body || item.json;
  const headers = item.json?.headers || {};
  
  if (!body) {
    throw new Error('No se encontró el cuerpo del webhook');
  }
  
  // Extraer información básica
  const eventType = headers['x-github-event'] || 'unknown';
  const repository = body.repository;
  const sender = body.sender;
  
  console.log('Procesando evento:', eventType);
  console.log('Repositorio:', repository?.full_name);
  console.log('Usuario:', sender?.login);
  
  // Preparar datos base para la notificación
  let notification = {
    type: eventType,
    title: `Evento ${eventType} en ${repository?.name || 'repositorio'}`,
    message: `${sender?.login || 'Usuario'} realizó una acción en ${repository?.name || 'repositorio'}`,
    data: {
      repository: repository?.full_name || 'unknown',
      sender: sender?.login || 'unknown',
      event_type: eventType,
      timestamp: new Date().toISOString()
    }
  };
  
  // Personalizar según el tipo de evento
  if (eventType === 'push' && body.head_commit) {
    notification.title = `Nuevo commit en ${repository.name}`;
    notification.message = `${sender.login} hizo commit: "${body.head_commit.message}"`;
    notification.data.commit_sha = body.head_commit.id;
    notification.data.commit_message = body.head_commit.message;
    notification.data.branch = body.ref?.replace('refs/heads/', '') || 'unknown';
  } else if (eventType === 'pull_request' && body.pull_request) {
    const pr = body.pull_request;
    notification.title = `Pull Request ${body.action} en ${repository.name}`;
    notification.message = `${sender.login} ${body.action} PR: "${pr.title}"`;
    notification.data.pr_number = pr.number;
    notification.data.pr_title = pr.title;
    notification.data.action = body.action;
  } else if (eventType === 'issues' && body.issue) {
    const issue = body.issue;
    notification.title = `Issue ${body.action} en ${repository.name}`;
    notification.message = `${sender.login} ${body.action} issue: "${issue.title}"`;
    notification.data.issue_number = issue.number;
    notification.data.issue_title = issue.title;
    notification.data.action = body.action;
  }
  
  // Preparar output
  const output = {
    success: true,
    event_type: eventType,
    repository_name: repository?.full_name || 'unknown',
    notification: notification,
    // Incluir datos originales por si los necesitas
    original_data: body
  };
  
  console.log('Output generado:', JSON.stringify(output, null, 2));
  
  return [output];
  
} catch (error) {
  console.error('Error procesando webhook:', error);
  
  return [{
    success: false,
    error: error.message,
    raw_input: $input.all()
  }];
}
```

## Código para insertar en Supabase

Una vez que tengas el procesamiento funcionando, usa este código en un nodo separado para insertar en Supabase:

```javascript
// Código para insertar notificación en Supabase

try {
  const items = $input.all();
  
  if (!items || items.length === 0) {
    throw new Error('No hay datos de entrada');
  }
  
  const item = items[0];
  
  // Verificar que el procesamiento anterior fue exitoso
  if (!item.json?.success) {
    throw new Error('El procesamiento anterior falló: ' + item.json?.error);
  }
  
  const notification = item.json.notification;
  const repositoryName = item.json.repository_name;
  
  // Mapear repositorio a proyecto (ajusta según tu configuración)
  const projectMapping = {
    'jose/DevNotify': 1,
    'jose/project': 1,
    'arkus/project': 1
    // Añade más mapeos según necesites
  };
  
  const projectId = projectMapping[repositoryName] || 1; // Proyecto por defecto
  
  // Preparar datos para Supabase
  const supabaseData = {
    project_id: projectId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    status: 'unread',
    created_at: new Date().toISOString()
  };
  
  console.log('Insertando en Supabase:', JSON.stringify(supabaseData, null, 2));
  
  // Preparar output para HTTP Request a Supabase
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
  
} catch (error) {
  console.error('Error preparando datos para Supabase:', error);
  
  return [{
    success: false,
    error: error.message,
    raw_input: $input.all()
  }];
}
```

## Instrucciones de uso

1. **Primer nodo Code**: Usa el código de debugging para entender la estructura
2. **Segundo nodo Code**: Una vez confirmada la estructura, usa el código robusto de procesamiento
3. **Tercer nodo Code**: Usa el código de preparación para Supabase
4. **Cuarto nodo HTTP Request**: Conecta este nodo para hacer la petición a Supabase

## Configuración del nodo HTTP Request

- **Method**: POST
- **URL**: Se toma del output del nodo anterior
- **Headers**: Se toman del output del nodo anterior
- **Body**: Se toma del output del nodo anterior
- **Response Format**: JSON

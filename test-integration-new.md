# Siguiente paso: Conectar con Supabase

## PASO 1: Verificar los logs actuales

Primero, verifica qué logs estás viendo en n8n cuando haces un commit:

1. **Ve a tu workflow en n8n**
2. **Haz un commit en GitHub**
3. **Revisa los logs del nodo Code**
4. **Deberías ver algo como:**
   ```
   Event: push
   Repo: GilbertoTM/devNotify
   Sender: GilbertoTM
   Commit: tu mensaje de commit
   ```

## PASO 2: Añadir inserción en Supabase

Ahora vamos a añadir un nodo para insertar en Supabase:

### A. Añadir nodo HTTP Request

1. **En tu workflow de n8n**
2. **Añade un nodo HTTP Request** entre el Code y el Respond to Webhook
3. **La secuencia debe ser:**
   ```
   Webhook → Code → HTTP Request → Respond to Webhook
   ```

### B. Configurar el nodo HTTP Request

**Configuración básica:**
- **Method**: POST
- **URL**: `https://your-project-id.supabase.co/rest/v1/notifications`
- **Authentication**: None (usaremos headers)

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer your-anon-key",
  "apikey": "your-anon-key"
}
```

**Body (JSON):**
```json
{
  "project_id": 1,
  "type": "{{ $('Code').item.json.event_type }}",
  "title": "Nuevo {{ $('Code').item.json.event_type }} en {{ $('Code').item.json.repository }}",
  "message": "{{ $('Code').item.json.sender }} - {{ $('Code').item.json.commit_message }}",
  "data": {
    "repository": "{{ $('Code').item.json.repository }}",
    "sender": "{{ $('Code').item.json.sender }}",
    "commit_message": "{{ $('Code').item.json.commit_message }}"
  },
  "status": "unread"
}
```

### C. Alternativa: Preparar datos en el nodo Code

Si prefieres preparar los datos en el nodo Code, cambia el código del nodo Code por este:

```javascript
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

// Preparar datos para Supabase
const supabaseData = {
  project_id: 1, // Cambiar según tu proyecto
  type: eventType,
  title: `Nuevo ${eventType} en ${repository?.name}`,
  message: `${sender?.login} - ${headCommit?.message || 'Sin mensaje'}`,
  data: {
    repository: repository?.full_name,
    sender: sender?.login,
    commit_message: headCommit?.message,
    commit_sha: headCommit?.id,
    branch: body.ref?.replace('refs/heads/', ''),
    url: headCommit?.url
  },
  status: 'unread'
};

console.log('Datos para Supabase:', JSON.stringify(supabaseData, null, 2));

return [{
  success: true,
  supabase_data: supabaseData,
  // Mantener datos originales para debugging
  original: {
    event_type: eventType,
    repository: repository?.full_name,
    sender: sender?.login,
    commit_message: headCommit?.message
  }
}];
```

## PASO 3: Obtener credenciales de Supabase

Necesitas:
1. **Tu URL de Supabase** (algo como: `https://abc123.supabase.co`)
2. **Tu anon key** (la clave pública)

¿Dónde encontrarlas?
1. **Ve a tu proyecto en Supabase**
2. **Settings → API**
3. **Copia la URL y la anon key**

## PASO 4: Probar la integración

1. **Configura el nodo HTTP Request** con tus credenciales
2. **Guarda el workflow**
3. **Haz un commit en GitHub**
4. **Revisa los logs** para ver si se inserta correctamente
5. **Ve a tu aplicación** para ver si aparece la notificación

¿Qué opción prefieres para configurar los datos de Supabase: usar el HTTP Request con expresiones o cambiar el código del nodo Code?

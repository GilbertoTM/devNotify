# PASO A PASO: Completar integración con Supabase

## PASO 1: Actualizar el código del nodo Code

**Reemplaza el código actual de tu nodo Code con este:**

```javascript
const items = $input.all();
console.log('TOTAL ITEMS:', items.length);

if (!items || items.length === 0) {
  return { success: false, error: 'No hay datos' }; // ✅ CAMBIADO: Sin array
}

const item = items[0];
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return { success: false, error: 'No body found' }; // ✅ CAMBIADO: Sin array
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
  project_id: '99c2baa7-5288-4f09-8b0e-b132db353244', // Tu ID real
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
return supabaseData; // ✅ ESTO ESTÁ CORRECTO
```

## PASO 2: Añadir nodo HTTP Request

1. **En tu workflow de n8n**
2. **Añade un nodo HTTP Request** entre Code y Respond to Webhook
3. **Secuencia final:**
   ```
   Webhook → Code → HTTP Request → Respond to Webhook
   ```

## PASO 3: Configurar el nodo HTTP Request

### Configuración básica:
- **Method**: POST
- **URL**: `https://tu-proyecto-id.supabase.co/rest/v1/notifications`
- **Send Body**: ON
- **Body Content Type**: JSON

### Headers:
Añade estos headers:
```
Content-Type: application/json
Authorization: Bearer tu-anon-key
apikey: tu-anon-key
```

### Body:
En el campo Body, selecciona "JSON" y usa:
```json
{{ $json }}
```

## CONFIGURACIÓN EXACTA DEL NODO HTTP REQUEST

### Configuración paso a paso:

#### 1. **Method**
- Selecciona: `POST`

#### 2. **URL**
- Ingresa: `https://tu-proyecto-id.supabase.co/rest/v1/notifications`
- Ejemplo: `https://abc123def.supabase.co/rest/v1/notifications`

#### 3. **Authentication**
- Selecciona: `None` (usaremos headers manuales)

#### 4. **Send Query Parameters**
- Deja: `OFF` (no necesitamos query parameters)

#### 5. **Send Headers**
- Activa: `ON`
- Añade estos headers:

| Name | Value |
|------|-------|
| `Content-Type` | `application/json` |
| `Authorization` | `Bearer tu-anon-key-aquí` |
| `apikey` | `tu-anon-key-aquí` |

#### 6. **Send Body**
- Activa: `ON`

#### 7. **Body Content Type**
- Selecciona: `JSON`

#### 8. **Specify Body**
- Selecciona: `Using Fields Below` (no "JSON")

#### 9. **Body Parameters**
- En lugar de usar parámetros individuales, usa el campo de texto JSON
- Pega exactamente: `{{ $json }}`

### Alternativa si no funciona el `{{ $json }}`:

Si el `{{ $json }}` no funciona, cambia:

#### 8. **Specify Body**
- Selecciona: `JSON`

#### 9. **Body (JSON)**
- Pega este JSON exactamente:
```json
{
  "project_id": {{ $json.project_id }},
  "type": "{{ $json.type }}",
  "title": "{{ $json.title }}",
  "message": "{{ $json.message }}",
  "data": {{ $json.data }},
  "status": "{{ $json.status }}"
}
```

### Ejemplo completo de configuración:

```
Method: POST
URL: https://abc123def.supabase.co/rest/v1/notifications
Authentication: None
Send Query Parameters: OFF
Send Headers: ON
  - Content-Type: application/json
  - Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
  - apikey: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Send Body: ON
Body Content Type: JSON
Specify Body: Using Fields Below
Body: {{ $json }}
```

### CONFIGURACIÓN DE HEADERS (PARÁMETROS INDIVIDUALES)

### Cuando actives "Send Headers: ON", verás campos para añadir headers individuales:

**Añade estos 3 headers uno por uno:**

#### Header 1:
- **Name**: `Content-Type`
- **Value**: `application/json`

#### Header 2:
- **Name**: `Authorization`
- **Value**: `Bearer tu-anon-key-aquí`

#### Header 3:
- **Name**: `apikey`
- **Value**: `tu-anon-key-aquí`

### Ejemplo visual:
```
[+] Add Header
Name: Content-Type          Value: application/json
[+] Add Header  
Name: Authorization         Value: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
[+] Add Header
Name: apikey                Value: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### IMPORTANTE:
- **NO** uses JSON para los headers
- **SÍ** añade cada header como parámetro individual
- **SÍ** incluye "Bearer " antes de la key en Authorization
- **NO** incluyas "Bearer " en el campo apikey

### Si no ves la opción de añadir headers individuales:
1. Asegúrate de que "Send Headers" esté en `ON`
2. Busca un botón "+ Add Header" o similar
3. Algunos versions de n8n muestran una tabla donde puedes añadir filas

¿Ya puedes ver la opción de añadir headers individuales?

### Para obtener tus credenciales:

1. Ve a tu proyecto en Supabase
2. Settings → API
3. Copia:
   - **URL**: Project URL
   - **anon key**: anon public key

## PASO 4: Obtener credenciales de Supabase

1. **Ve a tu proyecto en Supabase**
2. **Settings → API**
3. **Copia:**
   - **URL**: algo como `https://abc123.supabase.co`
   - **anon key**: la clave pública

## PASO 5: Verificar ID del proyecto

Necesitas el ID real de tu proyecto en Supabase. Puedes:

1. **Ir a tu aplicación** y hacer login
2. **Ver qué proyecto_id** tienes en la tabla `projects`
3. **O usar 1** si solo tienes un proyecto

## PASO 6: Probar la integración completa

1. **Guarda el workflow**
2. **Haz un commit en GitHub**
3. **Revisa los logs** en cada nodo
4. **Ve a tu aplicación** para verificar que aparezca la notificación

## OPCIÓN AUTOMÁTICA: Buscar project_id dinámicamente

### Opción 1: Usar tabla de mapeo (RECOMENDADA)

**Reemplaza el código del nodo Code con este:**

```javascript
const items = $input.all();
console.log('TOTAL ITEMS:', items.length);

if (!items || items.length === 0) {
  return { success: false, error: 'No hay datos' };
}

const item = items[0];
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return { success: false, error: 'No body found' };
}

const eventType = headers?.['x-github-event'] || 'unknown';
const repository = body.repository;
const sender = body.sender;
const headCommit = body.head_commit;

console.log('Event:', eventType);
console.log('Repo:', repository?.full_name);
console.log('Sender:', sender?.login);
console.log('Commit:', headCommit?.message);

// Preparar datos con lookup dinámico
const lookupData = {
  repository_full_name: repository?.full_name,
  notification_data: {
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
  }
};

console.log('DATOS CON LOOKUP:', JSON.stringify(lookupData, null, 2));

return [lookupData];
```

### Opción 2: Buscar project_id con HTTP Request

**Estructura del workflow:**
```
Webhook → Code → HTTP Request (Lookup) → Code (Merge) → HTTP Request (Insert) → Respond
```

**Configuración del HTTP Request (Lookup):**
- **Method**: GET
- **URL**: `https://tu-proyecto.supabase.co/rest/v1/repository_mappings?repository_full_name=eq.{{ $json.repository_full_name }}&select=project_id`
- **Headers**: 
  ```
  Authorization: Bearer tu-anon-key
  apikey: tu-anon-key
  ```

### Opción 3: Código TODO EN UNO (más simple)

**Reemplaza el código del nodo Code con este:**

```javascript
const items = $input.all();

if (!items || items.length === 0) {
  return { success: false, error: 'No hay datos' };
}

const item = items[0];
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return { success: false, error: 'No body found' };
}

const eventType = headers?.['x-github-event'] || 'unknown';
const repository = body.repository;
const sender = body.sender;
const headCommit = body.head_commit;

console.log('Event:', eventType);
console.log('Repo:', repository?.full_name);
console.log('Sender:', sender?.login);
console.log('Commit:', headCommit?.message);

// Mapeo hardcodeado pero dinámico
const repositoryMappings = {
  'GilbertoTM/devNotify': 1,
  'jose/project': 1,
  'arkus/project': 1
  // Agregar más según necesites
};

const projectId = repositoryMappings[repository?.full_name] || 1; // Fallback

console.log('PROJECT ID ENCONTRADO:', projectId);

const supabaseData = {
  project_id: projectId,
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

console.log('DATOS FINALES:', JSON.stringify(supabaseData, null, 2));

return [supabaseData];
```

## IMPORTANTE:

- **Cambia `project_id: 1`** por el ID real de tu proyecto
- **Reemplaza las credenciales** con las tuyas
- **Verifica que la tabla `notifications`** exista en Supabase

¿Necesitas ayuda para obtener las credenciales de Supabase o el ID del proyecto?

## CONFIGURACIÓN DEL BODY (PASOS EXACTOS)

### Opción 1: Usar `{{ $json }}` (MÁS SIMPLE)

#### Configuración:
1. **Body Content Type**: Selecciona `JSON`
2. **Specify Body**: Selecciona `Using JSON`
3. **Body (JSON)**: Pega exactamente `{{ $json }}`

### Opción 2: Si no funciona la anterior, usar parámetros individuales

#### Configuración:
1. **Body Content Type**: Selecciona `JSON`
2. **Specify Body**: Selecciona `Using Fields Below`
3. **Body Parameters**: Añade estos parámetros uno por uno:

| Name | Value |
|------|-------|
| `project_id` | `{{ $json.project_id }}` |
| `type` | `{{ $json.type }}` |
| `title` | `{{ $json.title }}` |
| `message` | `{{ $json.message }}` |
| `data` | `{{ $json.data }}` |
| `status` | `{{ $json.status }}` |

### Opción 3: Hardcodear el JSON (SI LAS ANTERIORES FALLAN)

#### Configuración:
1. **Body Content Type**: Selecciona `JSON`
2. **Specify Body**: Selecciona `Using JSON`
3. **Body (JSON)**: Pega este JSON exacto:

```json
{
  "project_id": {{ $json.project_id }},
  "type": "{{ $json.type }}",
  "title": "{{ $json.title }}",
  "message": "{{ $json.message }}",
  "data": {{ $json.data }},
  "status": "{{ $json.status }}"
}
```

### ¿Cuál opción ves en tu interfaz?

**Si ves:**
- `Using JSON` → Usa **Opción 1**
- `Using Fields Below` → Usa **Opción 2**
- Solo un campo de texto → Usa **Opción 3**

### IMPORTANTE:
- **SIEMPRE** usa `JSON` como Body Content Type
- **SIEMPRE** usa las expresiones `{{ $json.campo }}`
- **NO** pongas comillas en campos numéricos como `project_id`

¿Cuál de estas opciones ves en tu interfaz de n8n?

## SIGUIENTE PASO: PROBAR LA INTEGRACIÓN COMPLETA

### PASO 1: Verificar que el workflow esté completo

Tu workflow debería verse así:
```
Webhook → Code → HTTP Request → Respond to Webhook
```

### PASO 2: Actualizar el código del nodo Code

**¿Ya actualizaste el código del nodo Code?** Si no, usa este código que incluye el mapeo automático:

```javascript
const items = $input.all();
console.log('TOTAL ITEMS:', items.length);

if (!items || items.length === 0) {
  return { success: false, error: 'No hay datos' };
}

const item = items[0];
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return { success: false, error: 'No body found' };
}

const eventType = headers?.['x-github-event'] || 'unknown';
const repository = body.repository;
const sender = body.sender;
const headCommit = body.head_commit;

console.log('Event:', eventType);
console.log('Repo:', repository?.full_name);
console.log('Sender:', sender?.login);
console.log('Commit:', headCommit?.message);

// Mapeo automático de repositorios
const repositoryMappings = {
  'GilbertoTM/devNotify': 1,
  'jose/project': 1,
  'arkus/project': 1
};

const projectId = repositoryMappings[repository?.full_name] || 1;
console.log('PROJECT ID:', projectId);

const supabaseData = {
  project_id: projectId,
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

return supabaseData;
```

### PASO 3: Probar la integración

1. **Guarda el workflow**
2. **Asegúrate de que esté activo**
3. **Haz un commit en tu repositorio de GitHub**
4. **Monitorea los logs de cada nodo**

### PASO 4: Verificar los resultados

#### A. En n8n:
- **Nodo Code**: Deberías ver los datos procesados
- **Nodo HTTP Request**: Deberías ver una respuesta exitosa de Supabase (status 200/201)
- **Nodo Respond**: Deberías ver la respuesta final

#### B. En tu aplicación:
- **Abre tu aplicación DevNotify**
- **Verifica que aparezca la nueva notificación**
- **Debería aparecer algo como**: "Nuevo push en devNotify - GilbertoTM hizo commit: tu mensaje"

### PASO 5: Troubleshooting

Si algo falla, revisa:

1. **¿Los logs del nodo Code muestran los datos correctos?**
2. **¿El nodo HTTP Request devuelve status 200/201?**
3. **¿Las credenciales de Supabase son correctas?**
4. **¿La tabla notifications existe en Supabase?**

### PASO 6: Verificar en Supabase (opcional)

Puedes verificar directamente en Supabase:
1. **Ve a tu proyecto en Supabase**
2. **Table Editor → notifications**
3. **Verifica que se haya insertado la nueva notificación**

## ¿Listo para probar?

1. **Haz un commit en tu repositorio**
2. **Dime qué ves en los logs de n8n**
3. **Verifica si aparece la notificación en tu aplicación**

¿Ya hiciste el commit de prueba？

## SOLUCIÓN PARA ERROR "JSON parameter needs to be valid JSON"

### El problema:
El nodo Code está retornando un array `[{...}]` pero el HTTP Request necesita un objeto `{...}`.

### SOLUCIÓN 1: Cambiar el código del nodo Code (MÁS SIMPLE)

**Reemplaza la última línea del código del nodo Code:**

**CAMBIAR ESTO:**
```javascript
return [supabaseData];
```

**POR ESTO:**
```javascript
return supabaseData;
```

### SOLUCIÓN 2: Alternativa - Usar el primer elemento del array

Si prefieres mantener el array, cambia la configuración del HTTP Request:

**En el Body del HTTP Request, en lugar de:**
```
{{ $json }}
```

**Usa:**
```
{{ $json[0] }}
```

### SOLUCIÓN 3: Código completo corregido

**Reemplaza TODO el código del nodo Code con este:**

```javascript
const items = $input.all();
console.log('TOTAL ITEMS:', items.length);

if (!items || items.length === 0) {
  return { success: false, error: 'No hay datos' };
}

const item = items[0];
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return { success: false, error: 'No body found' };
}

const eventType = headers?.['x-github-event'] || 'unknown';
const repository = body.repository;
const sender = body.sender;
const headCommit = body.head_commit;

console.log('Event:', eventType);
console.log('Repo:', repository?.full_name);
console.log('Sender:', sender?.login);
console.log('Commit:', headCommit?.message);

// Mapeo automático de repositorios
const repositoryMappings = {
  'GilbertoTM/devNotify': '99c2baa7-5288-4f09-8b0e-b132db353244',
  'jose/project': '99c2baa7-5288-4f09-8b0e-b132db353244',
  'arkus/project': '99c2baa7-5288-4f09-8b0e-b132db353244'
};

const projectId = repositoryMappings[repository?.full_name] || '99c2baa7-5288-4f09-8b0e-b132db353244';
console.log('PROJECT ID:', projectId);

const supabaseData = {
  project_id: projectId,
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

// RETORNAR OBJETO DIRECTAMENTE, NO ARRAY
return supabaseData;
```

### CAMBIOS CLAVE:

1. **Línea 5**: Cambié `return [{ success: false, error: 'No hay datos' }]` por `return { success: false, error: 'No hay datos' }`
2. **Línea 12**: Cambié `return [{ success: false, error: 'No body found' }]` por `return { success: false, error: 'No body found' }`
3. **Línea 44**: Mantuve `return supabaseData` (esto está correcto)

### RESULTADO:
Ahora SIEMPRE retornas un objeto `{...}`, nunca un array `[{...}]`, lo que debería solucionar el problema de formato JSON.

### CONFIGURACIÓN DEL HTTP REQUEST:
Con este código, tu HTTP Request debería usar:
- **Body**: `{{ $json }}`
- **Body Content Type**: `JSON`

¿Quieres probar con este código corregido?

## CORRECCIÓN DE LA URL

### URL ACTUAL (INCORRECTA):
```
https://uzkauyxvwxsfkkhhyyrl.supabase.co
```

### URL CORRECTA (AÑADIR LA RUTA):
```
https://uzkauyxvwxsfkkhhyyrl.supabase.co/rest/v1/notifications
```

### PASOS PARA CORREGIR:

1. **Ve a tu nodo HTTP Request**
2. **En el campo URL**, cambia de:
   ```
   https://uzkauyxvwxsfkkhhyyrl.supabase.co
   ```
   
3. **A esto (añade la ruta):**
   ```
   https://uzkauyxvwxsfkkhhyyrl.supabase.co/rest/v1/notifications
   ```

### EXPLICACIÓN:
- `https://uzkauyxvwxsfkkhhyyrl.supabase.co` = URL base de tu proyecto
- `/rest/v1/notifications` = Ruta de la API para insertar en la tabla notifications

### RESULTADO ESPERADO:
Una vez que cambies la URL, deberías ver:
- ✅ Status 200 o 201 (en lugar de 404)
- ✅ La notificación se insertará en Supabase
- ✅ Aparecerá en tu aplicación

### PASO A PASO:
1. **Edita el nodo HTTP Request**
2. **Cambia la URL** añadiendo `/rest/v1/notifications`
3. **Guarda el workflow**
4. **Haz un commit** para probar

¿Ya añadiste `/rest/v1/notifications` al final de la URL?

## PROGRESO: URL CORREGIDA - Error de esquema

### ¡Excelente progreso!
- ✅ La URL ya funciona correctamente
- ✅ La conexión con Supabase está establecida
- ❌ El JSON tiene un campo `commit` que no existe en la tabla

### EL PROBLEMA:
El error "Could not find the 'commit' column of 'notifications'" indica que estás enviando un campo `commit` que no existe en tu tabla `notifications`.

### CAUSA:
En tu JSON tienes:
```json
{
  "project_id": "99c2baa7-5288-4f09-8b0e-b132db353244",
  "type": "push",
  "title": "Nuevo push en devNotify",
  "message": "GilbertoTM hizo",
  "commit": "commit de prueba 10",  // ❌ Este campo no existe
  "data": ["object Object"],
  "status": "unread"
}
```

### SOLUCIÓN:

#### OPCIÓN 1: Volver al código original del nodo Code

**En tu nodo HTTP Request, cambia el Body de JSON manual a:**
```
{{ $json }}
```

**Y usa este código en el nodo Code:**
```javascript
const items = $input.all();
console.log('TOTAL ITEMS:', items.length);

if (!items || items.length === 0) {
  return { success: false, error: 'No hay datos' };
}

const item = items[0];
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return { success: false, error: 'No body found' };
}

const eventType = headers?.['x-github-event'] || 'unknown';
const repository = body.repository;
const sender = body.sender;
const headCommit = body.head_commit;

console.log('Event:', eventType);
console.log('Repo:', repository?.full_name);
console.log('Sender:', sender?.login);
console.log('Commit:', headCommit?.message);

const supabaseData = {
  project_id: '99c2baa7-5288-4f09-8b0e-b132db353244',
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

return supabaseData;
```

#### OPCIÓN 2: Corregir el JSON manual

**Si prefieres seguir con JSON manual, úsalo así:**
```json
{
  "project_id": "99c2baa7-5288-4f09-8b0e-b132db353244",
  "type": "push",
  "title": "Nuevo push en devNotify",
  "message": "GilbertoTM hizo commit: commit de prueba 10",
  "data": {
    "repository": "GilbertoTM/devNotify",
    "sender": "GilbertoTM",
    "commit_message": "commit de prueba 10"
  },
  "status": "unread"
}
```

### RECOMENDACIÓN:
**Usa la OPCIÓN 1** (volver al código original) ya que es más automático y completo.

¿Quieres probar la OPCIÓN 1?

## PROBLEMA: Row Level Security (RLS) bloqueando la inserción

### ¡PROGRESO EXCELENTE!
- ✅ El JSON es correcto y coincide con tu esquema
- ✅ La conexión y autenticación básica funciona
- ❌ RLS (Row Level Security) está bloqueando la inserción

### EL PROBLEMA:
El error "new row violates row-level security policy for table 'notifications'" indica que tu tabla tiene políticas RLS activas que no permiten insertar datos con la clave `anon`.

### SOLUCIÓN INMEDIATA:

#### OPCIÓN 1: Deshabilitar RLS temporalmente para testing

**Ejecuta este SQL en Supabase SQL Editor:**
```sql
-- Deshabilitar RLS temporalmente para testing
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
```

#### OPCIÓN 2: Crear una política RLS para permitir inserciones

**Ejecuta este SQL en Supabase SQL Editor:**
```sql
-- Crear política para permitir inserción desde webhooks
CREATE POLICY "Allow webhook inserts" ON notifications
FOR INSERT 
TO anon
WITH CHECK (true);
```

#### OPCIÓN 3: Verificar políticas existentes

**Ejecuta este SQL para ver las políticas actuales:**
```sql
-- Ver políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

### RECOMENDACIÓN RÁPIDA:

**Para testing rápido**, usa la **OPCIÓN 1** (deshabilitar RLS temporalmente):

1. **Ve a Supabase SQL Editor**
2. **Ejecuta**: `ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;`
3. **Prueba el webhook** de nuevo
4. **Deberías ver status 200/201** y la notificación insertada

### DESPUÉS DEL TESTING:

Una vez que confirmes que funciona, puedes:
1. **Reactivar RLS**: `ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;`
2. **Crear políticas apropiadas** para tu aplicación

### IMPORTANTE:
- **Solo deshabilita RLS para testing**
- **En producción siempre usa políticas RLS apropiadas**

¿Quieres probar deshabilitando RLS temporalmente?

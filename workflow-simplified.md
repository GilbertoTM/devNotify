# n8n Workflow Simplificado - GitHub to DevNotify

## Configuración del Workflow

1. **Webhook Node (Trigger)**
   - Method: POST
   - Path: `github-webhook`
   - Response Mode: `Respond immediately`
   - Response Code: 200
   - Response Body: `{"status": "received"}`

2. **Code Node 1: Extract GitHub Data**
   - Name: `Extract GitHub Data`
   - JavaScript Code:
   ```javascript
   // Get the first item from input
   const payload = $input.first();
   
   // Extract data from the GitHub webhook payload
   const event = payload.headers['x-github-event'];
   const repoName = payload.body.repository.full_name;
   const repoId = payload.body.repository.id;
   const branch = payload.body.ref ? payload.body.ref.replace('refs/heads/', '') : 'main';
   
   // Return the extracted data
   return [{
     json: {
       event,
       repoName,
       repoId,
       branch,
       fullPayload: payload.body
     }
   }];
   ```

3. **HTTP Request Node: Check Project Mapping**
   - Name: `Check Project Mapping`
   - Method: GET
   - URL: `https://nqygjxsnlcxqpxjdcssb.supabase.co/rest/v1/projects`
   - Headers:
     - `apikey`: `tu_supabase_anon_key`
     - `Authorization`: `Bearer tu_supabase_anon_key`
   - Query Parameters:
     - `select`: `*`
     - `github_repo`: `eq.{{$json.repoName}}`

4. **Code Node 2: Process Notification**
   - Name: `Process Notification`
   - JavaScript Code:
   ```javascript
   // Get data from previous nodes
   const githubData = $input.first().json;
   const projects = $('Check Project Mapping').first().json;
   
   // Check if we have a mapped project
   if (!projects || projects.length === 0) {
     return [{
       json: {
         skip: true,
         reason: `No project found for repository: ${githubData.repoName}`
       }
     }];
   }
   
   const project = projects[0];
   
   // Create notification data
   const notification = {
     project_id: project.id,
     type: 'github_push',
     title: `New commit to ${githubData.repoName}`,
     message: `Branch: ${githubData.branch}`,
     data: {
       event: githubData.event,
       repository: githubData.repoName,
       branch: githubData.branch,
       commits: githubData.fullPayload.commits || []
     },
     created_at: new Date().toISOString()
   };
   
   return [{
     json: notification
   }];
   ```

5. **IF Node: Should Create Notification**
   - Name: `Should Create Notification`
   - Condition: `{{$json.skip}}` equals `false` (or condition: `{{$json.skip}}` is not equal to `true`)

6. **HTTP Request Node: Create Notification**
   - Name: `Create Notification`
   - Method: POST
   - URL: `https://nqygjxsnlcxqpxjdcssb.supabase.co/rest/v1/notifications`
   - Headers:
     - `apikey`: `tu_supabase_anon_key`
     - `Authorization`: `Bearer tu_supabase_anon_key`
     - `Content-Type`: `application/json`
   - Body:
   ```json
   {
     "project_id": "{{$json.project_id}}",
     "type": "{{$json.type}}",
     "title": "{{$json.title}}",
     "message": "{{$json.message}}",
     "data": "{{$json.data}}"
   }
   ```

## Flujo de Conexiones

1. Webhook → Extract GitHub Data
2. Extract GitHub Data → Check Project Mapping
3. Check Project Mapping → Process Notification
4. Process Notification → Should Create Notification
5. Should Create Notification (True) → Create Notification

## Notas Importantes

- El primer Code Node usa solo `$input.first()` para evitar referencias a nodos
- El segundo Code Node usa `$('Check Project Mapping').first()` para obtener datos del nodo HTTP
- El webhook responde inmediatamente con status 200
- Se valida que exista un proyecto mapeado antes de crear la notificación
- La clave de Supabase debe reemplazarse con tu clave real

## Debugging

Si hay errores, verifica:
1. Que las claves de Supabase sean correctas
2. Que el nombre del nodo HTTP sea exactamente `Check Project Mapping`
3. Que la tabla `projects` tenga un campo `github_repo`
4. Que la tabla `notifications` exista con los campos correctos

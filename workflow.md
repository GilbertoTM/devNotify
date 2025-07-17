# 🚀 Workflow n8n para DevNotify - Integración GitHub

Este documento describe cómo configurar un workflow completo en n8n para automatizar la gestión de notificaciones y proyectos en DevNotify cuando ocurren eventos en GitHub.

## 📋 Resumen del Workflow

El workflow detecta eventos de GitHub (commits, pull requests, issues) y crea automáticamente notificaciones en Supabase para que aparezcan en tu aplicación DevNotify.

## 🏗️ Arquitectura del Workflow

```
GitHub Webhook → n8n → Supabase → DevNotify App
```

## 📦 Nodos Necesarios

1. **Webhook Trigger** - Recibir eventos de GitHub
2. **GitHub Node** - Obtener datos adicionales de GitHub
3. **Switch Node** - Clasificar tipos de eventos
4. **Code Node** - Procesar y formatear datos
5. **Supabase Node** - Insertar notificaciones
6. **HTTP Request Node** - Opcional: notificar a usuarios

---

## 🔧 Configuración Paso a Paso

### 1. **Webhook Trigger Node**
```json
{
  "name": "GitHub Webhook",
  "type": "webhook",
  "httpMethod": "POST",
  "path": "github-webhook",
  "responseMode": "responseNode",
  "authentication": "none"
}
```

**Configuración:**
- HTTP Method: `POST`
- Path: `github-webhook` 
- Authentication: `None` (GitHub incluye su propio signature)
- Response: `Respond to Webhook`

### 2. **Code Node - Validar Webhook GitHub**
```javascript
// Validar que el webhook viene de GitHub
const signature = $node["GitHub Webhook"].json.headers["x-hub-signature-256"];
const payload = JSON.stringify($node["GitHub Webhook"].json.body);

// Verificar signature (opcional pero recomendado)
// const crypto = require('crypto');
// const secret = 'tu-webhook-secret';
// const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

const eventType = $node["GitHub Webhook"].json.headers["x-github-event"];
const body = $node["GitHub Webhook"].json.body;

return [{
  json: {
    eventType: eventType,
    repository: body.repository?.full_name,
    sender: body.sender?.login,
    action: body.action,
    data: body
  }
}];
```

### 3. **Switch Node - Clasificar Eventos**
```json
{
  "name": "Event Type Switch",
  "type": "switch",
  "rules": [
    {
      "type": "string",
      "value1": "={{ $json.eventType }}",
      "value2": "push",
      "operation": "equal"
    },
    {
      "type": "string", 
      "value1": "={{ $json.eventType }}",
      "value2": "pull_request",
      "operation": "equal"
    },
    {
      "type": "string",
      "value1": "={{ $json.eventType }}",
      "value2": "issues",
      "operation": "equal"
    }
  ]
}
```

### 4. **Code Node - Procesar Push Events**
```javascript
// Para eventos de tipo 'push'
const data = $json.data;
const commits = data.commits || [];

const notifications = commits.map(commit => ({
  title: `New commit in ${data.repository.name}`,
  description: commit.message.substring(0, 200),
  type: 'commit',
  priority: 'medium',
  source: 'github',
  metadata: {
    repository: data.repository.full_name,
    branch: data.ref.replace('refs/heads/', ''),
    commit_sha: commit.id,
    author: commit.author.name,
    url: commit.url,
    timestamp: commit.timestamp
  },
  is_read: false,
  created_at: new Date().toISOString()
}));

return notifications.map(notification => ({ json: notification }));
```

### 5. **Code Node - Procesar Pull Request Events**
```javascript
// Para eventos de tipo 'pull_request'
const data = $json.data;
const pr = data.pull_request;
const action = data.action;

let title = '';
let priority = 'medium';

switch(action) {
  case 'opened':
    title = `New PR: ${pr.title}`;
    priority = 'high';
    break;
  case 'closed':
    title = pr.merged ? `PR Merged: ${pr.title}` : `PR Closed: ${pr.title}`;
    priority = pr.merged ? 'high' : 'low';
    break;
  case 'review_requested':
    title = `Review Requested: ${pr.title}`;
    priority = 'high';
    break;
  default:
    title = `PR ${action}: ${pr.title}`;
}

return [{
  json: {
    title: title,
    description: pr.body?.substring(0, 200) || 'No description',
    type: 'pull_request',
    priority: priority,
    source: 'github',
    metadata: {
      repository: data.repository.full_name,
      pr_number: pr.number,
      action: action,
      author: pr.user.login,
      url: pr.html_url,
      state: pr.state,
      merged: pr.merged || false
    },
    is_read: false,
    created_at: new Date().toISOString()
  }
}];
```

### 6. **Code Node - Procesar Issues Events**
```javascript
// Para eventos de tipo 'issues'
const data = $json.data;
const issue = data.issue;
const action = data.action;

let title = '';
let priority = 'medium';

switch(action) {
  case 'opened':
    title = `New Issue: ${issue.title}`;
    priority = 'high';
    break;
  case 'closed':
    title = `Issue Closed: ${issue.title}`;
    priority = 'low';
    break;
  case 'assigned':
    title = `Issue Assigned: ${issue.title}`;
    priority = 'high';
    break;
  default:
    title = `Issue ${action}: ${issue.title}`;
}

return [{
  json: {
    title: title,
    description: issue.body?.substring(0, 200) || 'No description',
    type: 'issue',
    priority: priority,
    source: 'github',
    metadata: {
      repository: data.repository.full_name,
      issue_number: issue.number,
      action: action,
      author: issue.user.login,
      url: issue.html_url,
      state: issue.state,
      labels: issue.labels.map(label => label.name)
    },
    is_read: false,
    created_at: new Date().toISOString()
  }
}];
```

### 7. **Code Node - Obtener Project ID**
```javascript
// Buscar el project_id basado en el repositorio
const repositoryName = $json.metadata.repository;

// Aquí podrías hacer una consulta a Supabase para encontrar el project_id
// basado en la configuración de integración que tiene el repository_url
// Por ahora, usaremos un mapeo manual o valor por defecto

const projectMappings = {
  'usuario/mi-repo': 'project-id-1',
  'usuario/otro-repo': 'project-id-2'
  // Agregar más mappings según tus proyectos
};

const projectId = projectMappings[repositoryName] || 'default-project-id';

return [{
  json: {
    ...($json),
    project_id: projectId
  }
}];
```

### 8. **HTTP Request Node - Insertar en Supabase**
```json
{
  "name": "Insert Notification to Supabase",
  "type": "httpRequest",
  "method": "POST", 
  "url": "https://uzkauyxvwxsfkkhhyyrl.supabase.co/rest/v1/notifications",
  "headers": {
    "apikey": "TU_SUPABASE_ANON_KEY",
    "Authorization": "Bearer TU_SUPABASE_ANON_KEY",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  "body": {
    "title": "={{ $json.title }}",
    "description": "={{ $json.description }}",
    "type": "={{ $json.type }}",
    "priority": "={{ $json.priority }}",
    "source": "={{ $json.source }}",
    "metadata": "={{ JSON.stringify($json.metadata) }}",
    "project_id": "={{ $json.project_id }}",
    "is_read": false,
    "created_at": "={{ $json.created_at }}"
  }
}
```

### 9. **HTTP Request Node - Opcional: Notificar usuarios**
```json
{
  "name": "Notify Users via WebSocket",
  "type": "httpRequest",
  "method": "POST",
  "url": "http://localhost:3001/api/notify",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "projectId": "={{ $json.project_id }}",
    "notification": {
      "title": "={{ $json.title }}",
      "type": "={{ $json.type }}",
      "priority": "={{ $json.priority }}"
    }
  }
}
```

### 10. **Webhook Response Node**
```javascript
// Responder a GitHub para confirmar recepción
return [{
  json: {
    status: 'success',
    message: 'Webhook processed successfully',
    timestamp: new Date().toISOString()
  }
}];
```

---

## 🔐 Configuración de Seguridad

### Variables de Entorno en n8n:
```bash
SUPABASE_URL=https://uzkauyxvwxsfkkhhyyrl.supabase.co
SUPABASE_ANON_KEY=tu-clave-anonima
GITHUB_WEBHOOK_SECRET=tu-secret-del-webhook
BACKEND_URL=http://localhost:3001
```

### Webhook Secret Validation (Opcional):
```javascript
const crypto = require('crypto');

function validateGitHubSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}
```

---

## 📊 Configuración en GitHub

### 1. Configurar Webhook en GitHub:
1. Ve a tu repositorio → Settings → Webhooks
2. Click "Add webhook"
3. **Payload URL**: `https://tu-n8n-domain.com/webhook/github-webhook`
4. **Content type**: `application/json`
5. **Secret**: (opcional) tu webhook secret
6. **Events**: Selecciona:
   - Push events
   - Pull requests  
   - Issues
   - Issue comments (opcional)

### 2. Eventos a Escuchar:
```json
{
  "events": [
    "push",
    "pull_request", 
    "issues",
    "issue_comment",
    "create",
    "delete"
  ]
}
```

---

## 🔄 Flujo Completo del Workflow

```mermaid
graph TD
    A[GitHub Event] -->|Webhook| B[n8n Webhook Trigger]
    B --> C[Validate GitHub Signature]
    C --> D[Event Type Switch]
    
    D -->|push| E[Process Push Events]
    D -->|pull_request| F[Process PR Events] 
    D -->|issues| G[Process Issue Events]
    
    E --> H[Get Project ID]
    F --> H
    G --> H
    
    H --> I[Insert to Supabase]
    I --> J[Notify Users via WebSocket]
    J --> K[Send Response to GitHub]
    
    I -->|Error| L[Error Handler]
    L --> M[Log Error & Send Fallback Response]
```

---

## 🧪 Testing del Workflow

### 1. Test Webhook Endpoint:
```bash
curl -X POST https://tu-n8n-domain.com/webhook/github-webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{
    "repository": {"full_name": "test/repo"},
    "commits": [{
      "id": "abc123",
      "message": "Test commit",
      "author": {"name": "Test User"},
      "timestamp": "2025-01-17T10:00:00Z"
    }]
  }'
```

### 2. Verificar en Supabase:
```sql
SELECT * FROM notifications 
WHERE source = 'github' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 📈 Mejoras Adicionales

### 1. **Filtros Avanzados**:
- Filtrar por branches específicas
- Ignorar commits de bots
- Filtrar por palabras clave en commits

### 2. **Agregación de Notificaciones**:
- Agrupar commits múltiples en una notificación
- Resumen diario/semanal

### 3. **Integración con Slack/Discord**:
- Notificaciones adicionales en canales de equipo

### 4. **Dashboard de Métricas**:
- Tracking de eventos procesados
- Alertas de errores

---

## 🐛 Troubleshooting

### Problemas Comunes:
1. **Webhook no se ejecuta**: Verificar URL y configuración en GitHub
2. **Error de autenticación en Supabase**: Verificar API keys
3. **Timeout en requests**: Aumentar timeout en n8n
4. **Datos faltantes**: Verificar estructura del payload de GitHub

### Logs Útiles:
```javascript
// Agregar en cualquier Code Node para debugging
console.log('Input data:', JSON.stringify($input.all(), null, 2));
console.log('Current node data:', JSON.stringify($json, null, 2));
```

---

## 🚨 **SOLUCIÓN ESPECÍFICA: Resolver Timeouts en Creación de Proyectos**

### Problema Actual:
- Timeout de 60 segundos al enlazar proyectos con GitHub
- Consultas síncronas que bloquean la UI
- Validaciones de repositorios que tardan mucho

### Solución con n8n:

#### **Nuevo Flujo de Creación de Proyectos:**

1. **Usuario crea proyecto** → Solo se guarda en Supabase (rápido, <1s)
2. **GitHub setup separado** → Se configura via webhook asíncrono
3. **Validación en background** → n8n valida y actualiza el estado
4. **Notificación de éxito** → Usuario recibe confirmación en tiempo real

#### **Implementación:**

### 1. **Modificar Frontend - Creación Asíncrona**
```typescript
// En CreateProjectModal.tsx - Nuevo flujo
const handleCreateProjectAsync = async (projectData) => {
  try {
    // 1. Crear proyecto básico (rápido)
    const project = await createProject({
      name: projectData.name,
      description: projectData.description,
      color: projectData.color,
      teamId: teamId,
      status: 'pending' // Nuevo campo
    });

    // 2. Si hay GitHub integration, iniciar setup asíncrono
    if (projectData.services.includes('github')) {
      await initiateGitHubSetup(project.id, githubConfig);
    }

    // 3. Mostrar éxito inmediato
    showSuccess('Project created! GitHub integration in progress...');
    
  } catch (error) {
    showError('Failed to create project');
  }
};

// Nueva función para setup asíncrono
const initiateGitHubSetup = async (projectId, config) => {
  // Enviar request a n8n para validar y configurar
  await fetch('https://tu-n8n-domain.com/webhook/setup-github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId,
      repository: config.repository,
      username: config.username,
      token: config.token,
      branch: config.branch
    })
  });
};
```

### 2. **n8n Workflow - GitHub Setup Validator**

#### **Nodo 1: Webhook Trigger**
```json
{
  "name": "GitHub Setup Request",
  "type": "webhook",
  "path": "setup-github",
  "httpMethod": "POST"
}
```

#### **Nodo 2: Validar Repository**
```javascript
// Validar que el repositorio existe y es accesible
const { projectId, repository, username, token } = $json;

const githubApiUrl = `https://api.github.com/repos/${username}/${repository}`;
const headers = {
  'User-Agent': 'DevNotify-Setup',
  'Accept': 'application/vnd.github.v3+json'
};

if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

try {
  const response = await fetch(githubApiUrl, { headers });
  
  if (response.ok) {
    const repoData = await response.json();
    
    return [{
      json: {
        projectId,
        status: 'valid',
        repository: {
          full_name: repoData.full_name,
          default_branch: repoData.default_branch,
          clone_url: repoData.clone_url,
          html_url: repoData.html_url
        },
        config: { username, repository, token, branch: $json.branch || repoData.default_branch }
      }
    }];
  } else {
    throw new Error(`Repository not found or not accessible: ${response.status}`);
  }
} catch (error) {
  return [{
    json: {
      projectId,
      status: 'invalid',
      error: error.message
    }
  }];
}
```

#### **Nodo 3: Update Project Status**
```javascript
// Actualizar el estado del proyecto en Supabase
const { projectId, status, repository, config, error } = $json;

const updateData = {
  status: status,
  repository_url: repository?.html_url || null,
  updated_at: new Date().toISOString()
};

if (status === 'valid') {
  // Agregar configuración de GitHub
  updateData.github_config = config;
} else {
  // Agregar error details
  updateData.error_details = error;
}

return [{
  json: {
    projectId,
    updateData,
    notificationType: status === 'valid' ? 'success' : 'error'
  }
}];
```

#### **Nodo 4: HTTP Request - Update Supabase**
```json
{
  "method": "PATCH",
  "url": "https://uzkauyxvwxsfkkhhyyrl.supabase.co/rest/v1/projects?id=eq.{{ $json.projectId }}",
  "headers": {
    "apikey": "TU_SUPABASE_ANON_KEY",
    "Authorization": "Bearer TU_SUPABASE_ANON_KEY",
    "Content-Type": "application/json"
  },
  "body": "={{ JSON.stringify($json.updateData) }}"
}
```

#### **Nodo 5: Create Notification**
```javascript
// Crear notificación para el usuario
const { projectId, notificationType } = $json;

const notifications = {
  success: {
    title: '✅ GitHub Integration Complete',
    description: 'Your project has been successfully linked to GitHub. You will now receive notifications for commits, PRs, and issues.',
    type: 'success',
    priority: 'medium'
  },
  error: {
    title: '❌ GitHub Integration Failed', 
    description: 'There was an issue linking your project to GitHub. Please check your repository settings and try again.',
    type: 'error',
    priority: 'high'
  }
};

const notification = notifications[notificationType];

return [{
  json: {
    project_id: projectId,
    title: notification.title,
    description: notification.description,
    type: notification.type,
    priority: notification.priority,
    source: 'system',
    is_read: false,
    created_at: new Date().toISOString()
  }
}];
```

#### **Nodo 6: WebSocket Notification**
```javascript
// Notificar al usuario en tiempo real
const notificationData = $json;

// Enviar via WebSocket al frontend
await fetch('http://localhost:3001/api/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'project_update',
    projectId: notificationData.project_id,
    notification: notificationData
  })
});

return [{ json: { status: 'notification_sent' } }];
```

### 3. **Modificar Base de Datos**

```sql
-- Agregar campos para status asíncrono
ALTER TABLE projects 
ADD COLUMN status VARCHAR DEFAULT 'active',
ADD COLUMN github_config JSONB,
ADD COLUMN error_details TEXT;

-- Índice para consultas rápidas
CREATE INDEX idx_projects_status ON projects(status);
```

### 4. **Frontend - Mostrar Estado en Tiempo Real**

```typescript
// En ProjectCard.tsx - Mostrar estado del proyecto
const ProjectStatusBadge = ({ project }) => {
  const statusConfig = {
    active: { color: 'green', text: '✅ Active' },
    pending: { color: 'yellow', text: '⏳ Setting up...' },
    error: { color: 'red', text: '❌ Setup failed' }
  };

  const config = statusConfig[project.status] || statusConfig.active;

  return (
    <span className={`px-2 py-1 rounded text-xs bg-${config.color}-100 text-${config.color}-800`}>
      {config.text}
    </span>
  );
};

// WebSocket listener para updates en tiempo real
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8082');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'project_update') {
      // Actualizar estado del proyecto
      updateProjectStatus(data.projectId, data.notification);
      
      // Mostrar notificación toast
      showToast(data.notification.title, data.notification.type);
    }
  };

  return () => ws.close();
}, []);
```

---

## 🎯 **Beneficios de esta Solución:**

1. **⚡ Velocidad**: Creación de proyecto <1 segundo
2. **🔄 Asíncrono**: No bloquea la interfaz de usuario  
3. **💪 Robusto**: Manejo de errores sin timeouts
4. **📡 Tiempo Real**: Notificaciones instantáneas via WebSocket
5. **🔧 Recuperación**: Si falla el setup, se puede reintentar
6. **📊 Visibilidad**: Usuario ve el progreso del setup

## 🚀 **Flujo Final Optimizado:**

```
1. Usuario crea proyecto → Éxito inmediato (< 1s)
2. Sistema inicia GitHub setup → En background via n8n
3. n8n valida repositorio → Sin timeouts, con reintentos
4. Estado actualizado → Notificación en tiempo real
5. Usuario ve confirmación → Sin esperas ni bloqueos
```

¡Este enfoque elimina completamente los timeouts y hace la experiencia mucho más fluida! 🎉

# DevNotify - Notas del Proyecto

## Implementaciones Completadas

### ✅ Enlazar Proyectos con Servicios
- **Modal de Creación de Proyectos**: Interfaz completa para crear proyectos con enlaces a servicios
- **Integración con Docker**: Configuración automática de Docker para proyectos
- **Múltiples Servicios**: Soporte para GitHub, AWS, PostgreSQL, Jenkins, Datadog
- **Configuración por Servicio**: Campos específicos para cada tipo de servicio
- **Validación de Datos**: Verificación de campos requeridos y configuración

## Próximas Implementaciones

### 1. Eventos en Tiempo Real con WebSocket
- Implementar conexión WebSocket desde el frontend al backend
- Mostrar eventos de Docker en tiempo real (creación, eliminación, inicio, parada de contenedores)
- Actualizar automáticamente el dashboard cuando ocurran cambios

### 2. Acciones de Contenedores
- Botones para iniciar, parar, reiniciar y eliminar contenedores
- Modal de confirmación para acciones destructivas
- Feedback visual del estado de las operaciones

### 3. Integración con Otros Servicios
- **GitHub**: Mostrar repositorios, pull requests, issues
- **Docker Hub**: Integración con imágenes públicas y privadas
- **Slack/Discord**: Notificaciones push para eventos importantes
- **Email**: Resúmenes diarios/semanales de actividad

### 4. Sistema de Notificaciones Avanzado
- Filtros por tipo de evento (Docker, GitHub, etc.)
- Configuración de alertas personalizadas
- Historial de notificaciones con búsqueda
- Notificaciones push del navegador

### 5. Panel de Administración
- Gestión de usuarios y permisos
- Configuración de integraciones
- Logs del sistema
- Métricas de uso

### 6. Funcionalidades Avanzadas de Docker
- Visualización de logs de contenedores
- Métricas de recursos (CPU, memoria, red)
- Gestión de volúmenes y redes
- Composer para múltiples contenedores

## Secuencia de Comandos para Ejecutar el Proyecto

### 1. Verificar Dependencias del Sistema
```bash
# Verificar que Docker esté instalado y funcionando
docker --version
docker ps

# Verificar Node.js
node --version
npm --version
```

### 2. Configurar Variables de Entorno
```bash
# Crear archivo .env en la raíz del proyecto
cp .env.example .env
# Editar .env con tus credenciales de Supabase
```

### 3. Instalar Dependencias del Frontend
```bash
# Desde la raíz del proyecto
npm install
```

### 4. Instalar Dependencias del Backend
```bash
# Navegar al directorio backend
cd backend
npm install
```

### 5. Iniciar el Backend
```bash
# Desde el directorio backend
npm start
# O alternativamente:
node server.js
```

### 6. Iniciar el Frontend (en otra terminal)
```bash
# Desde la raíz del proyecto (en una nueva terminal)
npm run dev
```

### 7. Verificar que Todo Funcione
- Backend debe estar corriendo en `http://localhost:8080`
- Frontend debe estar corriendo en `http://localhost:5173`
- Verificar que Docker esté funcionando: `docker ps`

### 8. Probar la Integración
```bash
# Probar endpoints del backend
curl http://localhost:8080/api/containers
curl http://localhost:8080/api/images
```

## Notas Importantes

- El backend debe estar corriendo antes de usar las funcionalidades de Docker en el frontend
- Si hay conflictos de puertos, cambiar el puerto del WebSocket en `backend/server.js`
- Asegurarse de que Docker daemon esté corriendo: `sudo systemctl start docker`
- Para desarrollo, mantener ambas terminales abiertas (backend y frontend)

## Cómo Usar la Funcionalidad de Enlazar Proyectos

### 1. Crear un Nuevo Proyecto
1. Ve a la pestaña "Projects" en la aplicación
2. Haz clic en el botón "New Project"
3. Completa los detalles del proyecto:
   - **Nombre**: Nombre del proyecto
   - **Descripción**: Descripción opcional
   - **Color**: Selecciona un color para identificar el proyecto

### 2. Enlazar Servicios
1. En el paso 2 del modal, selecciona los servicios que quieres enlazar
2. **Docker**: Configuración automática (socket path opcional)
3. **GitHub**: Requiere Personal Access Token
4. **AWS**: Requiere Access Key ID y Secret Access Key
5. **PostgreSQL**: Configuración de base de datos
6. **Jenkins**: URL, usuario y API token
7. **Datadog**: API Key y Application Key

### 3. Configuración de Docker
- **Socket Path**: Por defecto `/var/run/docker.sock` (Linux/macOS)
- **Host**: Para Docker remoto, usar `tcp://host:port`
- **Verificación**: El sistema verificará la conexión automáticamente

### 4. Verificar Integración
- Los proyectos creados aparecerán en la lista
- Las integraciones se mostrarán en el panel de administración
- Los eventos de Docker se mostrarán en tiempo real

## Estructura del Proyecto
```
project/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   │   ├── CreateProjectModal.tsx  # Modal de creación de proyectos
│   │   ├── ProjectsView.tsx        # Vista de proyectos
│   │   └── DockerDashboard.tsx     # Dashboard de Docker
│   ├── hooks/             # Hooks personalizados
│   └── types/             # Tipos TypeScript
├── backend/               # Backend Node.js
├── supabase/             # Migraciones de base de datos
└── NOTAS.md             # Este archivo
``` 
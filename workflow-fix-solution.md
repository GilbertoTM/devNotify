# Solución para el error "Referenced node doesn't exist"

## El problema

El error "Referenced node doesn't exist" significa que hay un nodo en tu workflow que está referenciando a otro nodo que no existe o fue eliminado.

## Solución paso a paso

### PASO 1: Verificar las conexiones del workflow

1. **Ve a tu workflow de n8n**
2. **Revisa todas las conexiones** entre nodos
3. **Busca líneas rojas** o conexiones rotas
4. **Verifica que todos los nodos estén conectados correctamente**

### PASO 2: Verificar nombres de nodos

1. **Haz clic en cada nodo** del workflow
2. **Verifica que el nombre del nodo** sea correcto
3. **Si has renombrado algún nodo**, asegúrate de que las referencias sean correctas

### PASO 3: Recrear el workflow (RECOMENDADO)

Ya que tienes pocos nodos, es más fácil recrear el workflow desde cero:

**Elimina todos los nodos y crea estos exactamente:**

1. **Nodo Webhook** (nombre: "Webhook")
   - URL: tu URL de webhook
   - Método: POST
   - Autenticación: None

2. **Nodo Code** (nombre: "Process GitHub Data")
   - Conecta desde el Webhook
   - Pega el código que te di anteriormente

3. **Nodo HTTP Request** (nombre: "Insert to Supabase") - OPCIONAL por ahora
   - Conecta desde el Code
   - Déjalo sin configurar por ahora

### PASO 4: Configurar el nodo Code

Pega EXACTAMENTE este código en el nodo Code:

```javascript
// Obtener todos los items
const items = $input.all();

console.log('TOTAL ITEMS:', items.length);

// Verificar si hay items
if (!items || items.length === 0) {
  return [{
    success: false,
    error: 'No hay datos de entrada'
  }];
}

const item = items[0];

// Verificar estructura
console.log('ESTRUCTURA:');
console.log('- item.json existe:', item.json ? 'SÍ' : 'NO');
console.log('- item.json.body existe:', item.json?.body ? 'SÍ' : 'NO');
console.log('- item.json.headers existe:', item.json?.headers ? 'SÍ' : 'NO');

// Extraer datos
const body = item.json?.body;
const headers = item.json?.headers;

if (!body) {
  return [{
    success: false,
    error: 'No se encontró el cuerpo del webhook'
  }];
}

// Extraer información
const eventType = headers?.['x-github-event'] || 'unknown';
const repository = body.repository;
const sender = body.sender;
const headCommit = body.head_commit;

console.log('DATOS:');
console.log('- Event Type:', eventType);
console.log('- Repository:', repository?.full_name);
console.log('- Sender:', sender?.login);
console.log('- Commit:', headCommit?.message);

// Crear output simple
const output = {
  success: true,
  event_type: eventType,
  repository: repository?.full_name || 'unknown',
  sender: sender?.login || 'unknown',
  commit_message: headCommit?.message || 'no commit',
  debug: 'Procesado correctamente'
};

console.log('OUTPUT:', JSON.stringify(output, null, 2));

return [output];
```

### PASO 5: Guardar y probar

1. **Guarda el workflow**
2. **Activa el workflow**
3. **Haz un commit** en GitHub
4. **Revisa los logs**

## Posibles causas del error:

1. **Nodos eliminados**: Eliminaste un nodo pero otros nodos lo siguen referenciando
2. **Nombres cambiados**: Cambiaste el nombre de un nodo pero las referencias siguen usando el nombre anterior
3. **Conexiones rotas**: Hay conexiones que apuntan a nodos que no existen
4. **Workflow corrupto**: El workflow tiene referencias internas rotas

## Solución rápida (SI PERSISTE EL ERROR):

**Crea un workflow completamente nuevo:**

1. **Crea un nuevo workflow** en n8n
2. **Añade solo un nodo Webhook** primero
3. **Prueba que el webhook funcione** (haz un commit y verifica que llegue)
4. **Luego añade el nodo Code** con el código simple
5. **Prueba paso a paso**

## Importante:

- **NO uses** código complejo hasta que funcione el simple
- **NO conectes** más nodos hasta que funcione el básico
- **SÍ verifica** que el webhook de GitHub esté configurado correctamente

¿Quieres que te ayude a recrear el workflow desde cero?

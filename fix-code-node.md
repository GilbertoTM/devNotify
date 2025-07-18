# GUÍA CLARA: Qué código usar en n8n

## PASO 1: Usar SOLO este código para debugging

Ve a tu nodo Code en n8n y pega **EXACTAMENTE** este código:

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

## PASO 2: Probar el workflow

1. **Guarda el nodo** con este código
2. **Activa el workflow** en n8n
3. **Haz un commit** en tu repositorio de GitHub
4. **Ve a los logs** en n8n (busca en la consola del nodo)

## PASO 3: Verificar los logs

Deberías ver algo como:
```
TOTAL ITEMS: 1
ESTRUCTURA:
- item.json existe: SÍ
- item.json.body existe: SÍ
- item.json.headers existe: SÍ
DATOS:
- Event Type: push
- Repository: GilbertoTM/devNotify
- Sender: GilbertoTM
- Commit: commit de prueba 3
OUTPUT: { success: true, ... }
```

## PASO 4: Si funciona, continúa con el código completo

Solo si el paso anterior funciona, entonces podrás usar el código más complejo.

## IMPORTANTE:

- **NO uses** los otros archivos por ahora
- **SOLO usa** este código simple
- **NO hagas** cambios al código hasta que veas los logs correctos
- **Si no ves logs**, el problema está en la configuración del webhook o el workflow

## Si sigue fallando:

1. Verifica que el webhook de GitHub esté configurado correctamente
2. Verifica que el workflow esté activo
3. Verifica que el URL del webhook sea correcto
4. Revisa los "Recent Deliveries" en GitHub

¿Te aparecen los logs cuando haces el commit?
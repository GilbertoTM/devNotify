# Guía para debuggear el código de n8n

## Paso 1: Usar el código ultra-simple

1. Ve a tu workflow de n8n
2. Edita el nodo "Code" que está después del webhook
3. Borra todo el código existente
4. Copia y pega este código exactamente:

```javascript
// Obtener todos los items
const items = $input.all();

// Log completo del input
console.log('TOTAL ITEMS:', items.length);
console.log('PRIMER ITEM COMPLETO:', JSON.stringify(items[0], null, 2));

// Si hay items, extraer el primero
if (items.length > 0) {
  const item = items[0];
  
  // Intentar diferentes formas de acceder a los datos
  console.log('item.json:', item.json ? 'EXISTS' : 'NOT EXISTS');
  console.log('item.json.body:', item.json?.body ? 'EXISTS' : 'NOT EXISTS');
  console.log('item.json.headers:', item.json?.headers ? 'EXISTS' : 'NOT EXISTS');
  
  // Si existe el body, extraer información básica
  if (item.json?.body) {
    const body = item.json.body;
    console.log('REPOSITORY NAME:', body.repository?.name);
    console.log('SENDER:', body.sender?.login);
    console.log('ACTION:', body.action);
    
    // Crear output simple
    const output = {
      success: true,
      repository: body.repository?.name || 'unknown',
      sender: body.sender?.login || 'unknown',
      action: body.action || 'unknown',
      message: `Procesado evento de ${body.repository?.name || 'unknown'}`
    };
    
    return [output];
  }
}

// Si no hay datos, devolver error
return [{
  success: false,
  error: 'No se encontraron datos válidos',
  raw_input: items
}];
```

## Paso 2: Probar el workflow

1. Guarda el nodo de código
2. Haz un commit en tu repositorio de GitHub
3. Ve a la consola de n8n y busca los logs del nodo
4. Deberías ver información detallada sobre la estructura de datos

## Paso 3: Analizar los logs

Los logs te mostrarán:
- Cuántos items llegaron
- La estructura completa del primer item
- Si existen los campos que esperamos
- Los valores específicos de repository, sender, etc.

## Paso 4: Ajustar el código

Una vez que veas la estructura real de los datos, podemos ajustar el código para acceder correctamente a la información.

## Notas importantes:

- Este código es solo para debugging, no insertará nada en Supabase
- Los logs aparecerán en la consola de n8n cuando ejecutes el workflow
- Si no ves logs, revisa que el workflow esté activo y que el webhook se esté disparando

## Paso 5: Verificar que el webhook se está disparando

Puedes verificar que GitHub está enviando el webhook correctamente:

1. Ve a tu repositorio en GitHub
2. Ve a Settings > Webhooks
3. Haz clic en tu webhook
4. Ve a "Recent Deliveries"
5. Deberías ver entregas recientes con código de respuesta 200

Si no ves entregas recientes, el problema está en la configuración del webhook, no en el código de n8n.

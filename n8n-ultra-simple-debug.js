// ULTRA SIMPLE - Solo para debugging
// Copia este código en tu nodo "Code" en n8n

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

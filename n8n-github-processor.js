// Código para n8n - Procesador de GitHub webhooks
// Este código debe ir en un nodo "Code" en n8n

// Obtener el primer item del input
const item = $input.all()[0];

if (!item) {
  throw new Error('No hay datos de entrada');
}

// Extraer el cuerpo del webhook
const body = item.json.body;

if (!body) {
  throw new Error('No se encontró el cuerpo del webhook');
}

// Extraer información del evento
const eventType = item.json.headers['x-github-event'];
const repository = body.repository;
const sender = body.sender;

console.log('Tipo de evento:', eventType);
console.log('Repositorio:', repository?.full_name);
console.log('Sender:', sender?.login);

// Procesar según el tipo de evento
let notification = null;

if (eventType === 'push') {
  const commits = body.commits || [];
  const headCommit = body.head_commit;
  
  if (headCommit) {
    notification = {
      type: 'commit',
      title: `Nuevo commit en ${repository.name}`,
      message: `${sender.login} hizo commit: "${headCommit.message}"`,
      data: {
        repository: repository.full_name,
        commit_sha: headCommit.id,
        commit_message: headCommit.message,
        author: headCommit.author.name,
        author_email: headCommit.author.email,
        url: headCommit.url,
        branch: body.ref?.replace('refs/heads/', '') || 'unknown'
      }
    };
  }
} else if (eventType === 'pull_request') {
  const pr = body.pull_request;
  const action = body.action;
  
  notification = {
    type: 'pull_request',
    title: `Pull Request ${action} en ${repository.name}`,
    message: `${sender.login} ${action} PR: "${pr.title}"`,
    data: {
      repository: repository.full_name,
      pr_number: pr.number,
      pr_title: pr.title,
      pr_body: pr.body,
      author: pr.user.login,
      action: action,
      url: pr.html_url,
      branch: pr.head.ref
    }
  };
} else if (eventType === 'issues') {
  const issue = body.issue;
  const action = body.action;
  
  notification = {
    type: 'issue',
    title: `Issue ${action} en ${repository.name}`,
    message: `${sender.login} ${action} issue: "${issue.title}"`,
    data: {
      repository: repository.full_name,
      issue_number: issue.number,
      issue_title: issue.title,
      issue_body: issue.body,
      author: issue.user.login,
      action: action,
      url: issue.html_url,
      labels: issue.labels?.map(l => l.name).join(', ') || ''
    }
  };
}

if (!notification) {
  throw new Error(`Tipo de evento no soportado: ${eventType}`);
}

// Preparar el output para el siguiente nodo
const output = {
  event_type: eventType,
  repository_name: repository.full_name,
  repository_id: repository.id,
  sender_login: sender.login,
  notification: notification,
  raw_data: body
};

console.log('Output preparado:', JSON.stringify(output, null, 2));

return [output];

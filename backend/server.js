const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
const WebSocket = require('ws');
const { 
  validateGitHubCredentials, 
  validateGitHubRepository, 
  getRepositoryCommits, 
  getRepositoryIssues 
} = require('./github-validator');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a Docker usando el socket
const docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

// API Routes
app.get('/api/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    res.json(containers);
  } catch (error) {
    console.error('Error obteniendo contenedores:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/images', async (req, res) => {
  try {
    const images = await docker.listImages();
    res.json(images);
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await docker.getEvents();
    res.json(events);
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const images = await docker.listImages();
    
    const stats = {
      containers: {
        total: containers.length,
        running: containers.filter(c => c.State === 'running').length,
        stopped: containers.filter(c => c.State === 'exited').length,
        paused: containers.filter(c => c.State === 'paused').length
      },
      images: {
        total: images.length,
        size: images.reduce((acc, img) => acc + (img.Size || 0), 0)
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket para eventos en tiempo real
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('Cliente WebSocket conectado');
  
  // Enviar estadísticas iniciales
  docker.listContainers({ all: true }, (err, containers) => {
    if (!err) {
      ws.send(JSON.stringify({
        type: 'containers_update',
        data: containers
      }));
    }
  });
  
  docker.listImages((err, images) => {
    if (!err) {
      ws.send(JSON.stringify({
        type: 'images_update',
        data: images
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
  });
  
  ws.on('error', (error) => {
    console.error('Error en WebSocket:', error);
  });
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint para validar credenciales de GitHub
app.post('/api/validate-github-credentials', async (req, res) => {
  try {
    const { token, username } = req.body;
    
    if (!token || !username) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required credentials' 
      });
    }

    const validation = await validateGitHubCredentials(token, username);
    
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error
      });
    }

    res.json({
      success: true,
      user: validation.user
    });

  } catch (error) {
    console.error('Error validating GitHub credentials:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Endpoint para validar repositorio de GitHub
app.post('/api/validate-github-repository', async (req, res) => {
  try {
    const { token, owner, repo } = req.body;
    
    if (!token || !owner || !repo) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters' 
      });
    }

    const validation = await validateGitHubRepository(token, owner, repo);
    
    if (!validation.valid) {
      return res.status(404).json({
        success: false,
        error: validation.error
      });
    }

    res.json({
      success: true,
      repository: validation.repository
    });

  } catch (error) {
    console.error('Error validating GitHub repository:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Endpoint para obtener commits de un repositorio
app.get('/api/github/:owner/:repo/commits', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authorization token required' 
      });
    }

    const commits = await getRepositoryCommits(token, owner, repo);
    
    res.json({
      success: true,
      commits
    });

  } catch (error) {
    console.error('Error fetching repository commits:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Endpoint para obtener issues de un repositorio
app.get('/api/github/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authorization token required' 
      });
    }

    const issues = await getRepositoryIssues(token, owner, repo);
    
    res.json({
      success: true,
      issues
    });

  } catch (error) {
    console.error('Error fetching repository issues:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
  console.log(`📡 WebSocket corriendo en ws://localhost:8081`);
  console.log(`🐳 Conectado a Docker en /var/run/docker.sock`);
});
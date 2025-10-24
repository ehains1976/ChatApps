// Backend simple pour VertProjet
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const PORT = 3001;

// Données simulées
const projects = [
  {
    id: 1,
    name: 'Projet Alpha',
    description: 'Développement d\'une nouvelle fonctionnalité',
    status: 'En cours',
    progress: 85,
    start_date: '2024-01-01',
    end_date: '2024-02-15',
    team_size: 5,
    total_tasks: 20,
    completed_tasks: 17
  },
  {
    id: 2,
    name: 'Projet Beta',
    description: 'Refonte de l\'interface utilisateur',
    status: 'En cours',
    progress: 60,
    start_date: '2024-01-15',
    end_date: '2024-03-01',
    team_size: 3,
    total_tasks: 15,
    completed_tasks: 9
  },
  {
    id: 3,
    name: 'Projet Gamma',
    description: 'Optimisation des performances',
    status: 'Terminé',
    progress: 100,
    start_date: '2023-12-01',
    end_date: '2024-01-30',
    team_size: 4,
    total_tasks: 12,
    completed_tasks: 12
  },
  {
    id: 4,
    name: 'Projet Delta',
    description: 'Migration vers nouvelle architecture',
    status: 'En retard',
    progress: 30,
    start_date: '2024-01-01',
    end_date: '2024-01-20',
    team_size: 6,
    total_tasks: 25,
    completed_tasks: 8
  }
];

const tasks = [
  { id: 1, project_id: 1, title: 'Analyse des besoins', status: 'Terminé', progress: 100, priority: 'Haute' },
  { id: 2, project_id: 1, title: 'Conception technique', status: 'En cours', progress: 80, priority: 'Haute' },
  { id: 3, project_id: 1, title: 'Développement', status: 'En cours', progress: 60, priority: 'Moyenne' },
  { id: 4, project_id: 1, title: 'Tests', status: 'À faire', progress: 0, priority: 'Moyenne' },
  { id: 5, project_id: 2, title: 'Design UI/UX', status: 'En cours', progress: 70, priority: 'Haute' },
  { id: 6, project_id: 2, title: 'Implémentation frontend', status: 'À faire', progress: 0, priority: 'Haute' },
  { id: 7, project_id: 3, title: 'Audit de performance', status: 'Terminé', progress: 100, priority: 'Haute' },
  { id: 8, project_id: 3, title: 'Optimisation', status: 'Terminé', progress: 100, priority: 'Haute' },
  { id: 9, project_id: 4, title: 'Planification migration', status: 'En cours', progress: 50, priority: 'Haute' },
  { id: 10, project_id: 4, title: 'Migration des données', status: 'À faire', progress: 0, priority: 'Haute' }
];

// Fonction pour calculer les statistiques
function calculateStats() {
  const tasksInProgress = tasks.filter(t => t.status === 'En cours').length;
  const tasksCompleted = tasks.filter(t => t.status === 'Terminé').length;
  const tasksOverdue = tasks.filter(t => t.status === 'En retard').length;
  const activeProjects = projects.filter(p => p.status !== 'Terminé').length;
  
  return {
    tasksInProgress,
    tasksCompleted,
    tasksOverdue,
    activeProjects
  };
}

// Fonction pour gérer les requêtes CORS
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Fonction pour envoyer une réponse JSON
function sendJSON(res, data, statusCode = 200) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Fonction pour gérer les erreurs
function sendError(res, message, statusCode = 500) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
}

// Serveur HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Gérer les requêtes OPTIONS (CORS preflight)
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes API
  if (path === '/api/dashboard/stats') {
    const stats = calculateStats();
    sendJSON(res, stats);
  }
  else if (path === '/api/projects') {
    if (method === 'GET') {
      sendJSON(res, projects);
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const newProject = JSON.parse(body);
          newProject.id = projects.length + 1;
          projects.push(newProject);
          sendJSON(res, { id: newProject.id, message: 'Projet créé avec succès' }, 201);
        } catch (error) {
          sendError(res, 'Données JSON invalides', 400);
        }
      });
    }
  }
  else if (path.startsWith('/api/projects/')) {
    const projectId = parseInt(path.split('/')[3]);
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      sendError(res, 'Projet non trouvé', 404);
      return;
    }
    
    if (method === 'GET') {
      const projectTasks = tasks.filter(t => t.project_id === projectId);
      sendJSON(res, { ...project, tasks: projectTasks });
    } else if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const updatedProject = JSON.parse(body);
          const index = projects.findIndex(p => p.id === projectId);
          if (index !== -1) {
            projects[index] = { ...projects[index], ...updatedProject };
            sendJSON(res, { message: 'Projet mis à jour avec succès' });
          }
        } catch (error) {
          sendError(res, 'Données JSON invalides', 400);
        }
      });
    } else if (method === 'DELETE') {
      const index = projects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects.splice(index, 1);
        sendJSON(res, { message: 'Projet supprimé avec succès' });
      }
    }
  }
  else if (path === '/api/tasks') {
    if (method === 'GET') {
      const tasksWithProjects = tasks.map(task => {
        const project = projects.find(p => p.id === task.project_id);
        return {
          ...task,
          project_name: project ? project.name : 'Projet inconnu'
        };
      });
      sendJSON(res, tasksWithProjects);
    }
  }
  else if (path === '/') {
    // Servir le fichier HTML principal
    fs.readFile('./index.html', (err, data) => {
      if (err) {
        sendError(res, 'Fichier non trouvé', 404);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
  else if (path === '/calendar') {
    // Servir le calendrier
    fs.readFile('./calendar.html', (err, data) => {
      if (err) {
        sendError(res, 'Fichier calendrier non trouvé', 404);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
  else {
    sendError(res, 'Route non trouvée', 404);
  }
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur VertProjet démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🎯 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🌐 Application: http://localhost:${PORT}/`);
});

// Gestion des erreurs
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});

// Backend simple pour VertProjet
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3001;

// Données simulées - Utilisateurs
const users = [
  {
    id: 1,
    prenom: 'Marie',
    nom: 'Dubois',
    entreprise: 'Tech Corp',
    courriel: 'marie.dubois@techcorp.com'
  },
  {
    id: 2,
    prenom: 'Jean',
    nom: 'Martin',
    entreprise: 'Innovation Inc',
    courriel: 'jean.martin@innovation.com'
  },
  {
    id: 3,
    prenom: 'Sophie',
    nom: 'Bernard',
    entreprise: 'Digital Solutions',
    courriel: 'sophie.bernard@digital.com'
  },
  {
    id: 4,
    prenom: 'Pierre',
    nom: 'Lefebvre',
    entreprise: 'Tech Corp',
    courriel: 'pierre.lefebvre@techcorp.com'
  }
];

// Projets
const projects = [
  {
    id: 1,
    name: 'Projet Alpha',
    description: 'Développement d\'une nouvelle fonctionnalité',
    status: 'En cours',
    progress: 85,
    start_date: '2024-01-01',
    end_date: '2024-02-15',
    delivery_date: '2024-02-15',
    team_size: 5,
    total_tasks: 20,
    completed_tasks: 17,
    milestones: ['Revue initiale', 'Développement', 'Tests', 'Livraison']
  },
  {
    id: 2,
    name: 'Projet Beta',
    description: 'Refonte de l\'interface utilisateur',
    status: 'En cours',
    progress: 60,
    start_date: '2024-01-15',
    end_date: '2024-03-01',
    delivery_date: '2024-03-01',
    team_size: 3,
    total_tasks: 15,
    completed_tasks: 9,
    milestones: ['Design', 'Développement', 'Tests', 'Déploiement']
  },
  {
    id: 3,
    name: 'Projet Gamma',
    description: 'Optimisation des performances',
    status: 'Terminé',
    progress: 100,
    start_date: '2023-12-01',
    end_date: '2024-01-30',
    delivery_date: '2024-01-30',
    team_size: 4,
    total_tasks: 12,
    completed_tasks: 12,
    milestones: ['Audit', 'Optimisation', 'Validation']
  }
];

// Tâches étendues
const tasks = [
  { 
    id: 1, 
    project_id: 1, 
    title: 'Analyse des besoins',
    description: 'Analyser les besoins du client et documenter les spécifications',
    status: 'Terminé',
    priority: 'Haute',
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    due_date: '2024-01-05',
    progress: 100,
    responsible_id: 1,
    is_recurrent: false
  },
  { 
    id: 2, 
    project_id: 1, 
    title: 'Conception technique',
    description: 'Créer l\'architecture technique du projet',
    status: 'En cours',
    priority: 'Haute',
    start_date: '2024-01-06',
    end_date: '2024-01-20',
    due_date: '2024-01-20',
    progress: 80,
    responsible_id: 2,
    is_recurrent: false
  },
  { 
    id: 3, 
    project_id: 2, 
    title: 'Design UI/UX',
    description: 'Créer les maquettes et prototypes',
    status: 'En cours',
    priority: 'Haute',
    start_date: '2024-01-15',
    end_date: '2024-02-15',
    due_date: '2024-02-15',
    progress: 70,
    responsible_id: 3,
    is_recurrent: false
  },
  { 
    id: 4, 
    project_id: null, 
    title: 'Réunion hebdomadaire d\'équipe',
    description: 'Réunion de coordination de l\'équipe',
    status: 'En cours',
    priority: 'Moyenne',
    start_date: '2024-01-20',
    end_date: '2024-01-20',
    due_date: '2024-01-20',
    progress: 0,
    responsible_id: 1,
    is_recurrent: true,
    recurrent_pattern: 'weekly'
  }
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
  else if (path === '/api/users') {
    if (method === 'GET') {
      sendJSON(res, users);
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const newUser = JSON.parse(body);
          newUser.id = users.length + 1;
          users.push(newUser);
          sendJSON(res, { id: newUser.id, message: 'Utilisateur créé avec succès' }, 201);
        } catch (error) {
          sendError(res, 'Données JSON invalides', 400);
        }
      });
    }
  }
  else if (path.startsWith('/api/users/')) {
    const userId = parseInt(path.split('/')[3]);
    
    if (method === 'GET') {
      const user = users.find(u => u.id === userId);
      if (!user) {
        sendError(res, 'Utilisateur non trouvé', 404);
        return;
      }
      sendJSON(res, user);
    } else if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const updatedUser = JSON.parse(body);
          const index = users.findIndex(u => u.id === userId);
          if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            sendJSON(res, { message: 'Utilisateur mis à jour avec succès' });
          }
        } catch (error) {
          sendError(res, 'Données JSON invalides', 400);
        }
      });
    } else if (method === 'DELETE') {
      const index = users.findIndex(u => u.id === userId);
      if (index !== -1) {
        users.splice(index, 1);
        sendJSON(res, { message: 'Utilisateur supprimé avec succès' });
      }
    }
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
      const query = parsedUrl.query;
      const tasksWithDetails = tasks.map(task => {
        const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;
        const responsible = users.find(u => u.id === task.responsible_id);
        return {
          ...task,
          project_name: project ? project.name : 'Sans projet',
          responsible_name: responsible ? `${responsible.prenom} ${responsible.nom}` : 'Non assigné',
          responsible_email: responsible ? responsible.courriel : null
        };
      });
      
      // Filtres
      let filteredTasks = tasksWithDetails;
      if (query.responsible_id) {
        filteredTasks = filteredTasks.filter(t => t.responsible_id === parseInt(query.responsible_id));
      }
      if (query.project_id) {
        filteredTasks = filteredTasks.filter(t => t.project_id === parseInt(query.project_id));
      }
      if (query.status) {
        filteredTasks = filteredTasks.filter(t => t.status === query.status);
      }
      
      sendJSON(res, filteredTasks);
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const newTask = JSON.parse(body);
          newTask.id = tasks.length + 1;
          tasks.push(newTask);
          sendJSON(res, { id: newTask.id, message: 'Tâche créée avec succès' }, 201);
        } catch (error) {
          sendError(res, 'Données JSON invalides', 400);
        }
      });
    }
  }
  else if (path.startsWith('/api/tasks/')) {
    const taskId = parseInt(path.split('/')[3]);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      sendError(res, 'Tâche non trouvée', 404);
      return;
    }
    
    if (method === 'GET') {
      const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;
      const responsible = users.find(u => u.id === task.responsible_id);
      const taskWithDetails = {
        ...task,
        project_name: project ? project.name : 'Sans projet',
        responsible_name: responsible ? `${responsible.prenom} ${responsible.nom}` : 'Non assigné'
      };
      sendJSON(res, taskWithDetails);
    } else if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const updatedTask = JSON.parse(body);
          const index = tasks.findIndex(t => t.id === taskId);
          if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updatedTask };
            sendJSON(res, { message: 'Tâche mise à jour avec succès' });
          }
        } catch (error) {
          sendError(res, 'Données JSON invalides', 400);
        }
      });
    } else if (method === 'DELETE') {
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
        sendJSON(res, { message: 'Tâche supprimée avec succès' });
      }
    }
  }
  else if (path === '/' || path.startsWith('/src/') || path.startsWith('/assets/')) {
    // Servir les fichiers statiques du frontend React
    const filePath = path === '/' ? './dist/index.html' : `./dist${path}`;
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Fallback sur index.html pour le routing React
        fs.readFile('./dist/index.html', (err, fallback) => {
          if (err) {
            sendError(res, 'Fichier non trouvé', 404);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallback);
        });
        return;
      }
      
      // Déterminer le type de contenu
      const contentType = path.endsWith('.css') ? 'text/css' : 
                         path.endsWith('.js') ? 'application/javascript' :
                         path.endsWith('.html') ? 'text/html' : 'text/html';
      
      res.writeHead(200, { 'Content-Type': contentType });
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

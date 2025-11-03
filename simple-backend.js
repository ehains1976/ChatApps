// Backend simple pour VertProjet
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3001;

// Données simulées - Utilisateurs (avec comptes admin)
const users = [
  {
    id: 1,
    prenom: 'BZ',
    nom: 'Inc',
    entreprise: 'BZ Inc',
    courriel: 'bzinc@bzinc.ca',
    role: 'admin'
  },
  {
    id: 2,
    prenom: 'Vert',
    nom: 'Dure',
    entreprise: 'VertDure',
    courriel: 'vertdure@vertdure.com',
    role: 'admin'
  },
  {
    id: 3,
    prenom: 'Marie',
    nom: 'Dubois',
    entreprise: 'Tech Corp',
    courriel: 'marie.dubois@techcorp.com',
    role: 'user'
  },
  {
    id: 4,
    prenom: 'Jean',
    nom: 'Martin',
    entreprise: 'Innovation Inc',
    courriel: 'jean.martin@innovation.com',
    role: 'user'
  },
  {
    id: 5,
    prenom: 'Sophie',
    nom: 'Bernard',
    entreprise: 'Digital Solutions',
    courriel: 'sophie.bernard@digital.com',
    role: 'user'
  },
  {
    id: 6,
    prenom: 'Pierre',
    nom: 'Lefebvre',
    entreprise: 'Tech Corp',
    courriel: 'pierre.lefebvre@techcorp.com',
    role: 'user'
  }
];

// Mots de passe (en production, on utiliserait bcrypt)
const passwords = {
  'bzinc@bzinc.ca': 'Jai.1.Mcd0',
  'vertdure@vertdure.com': 'Jai.du.Beau.Gaz0n'
};

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
    owner_id: 1,
    hours_allocated: 120,
    price: 20400.00,
    total_tasks: 20,
    completed_tasks: 17,
    milestones: [
      { id: 1, name: 'Revue initiale', due_date: '2024-01-10', completed: true },
      { id: 2, name: 'Développement', due_date: '2024-02-01', completed: false },
      { id: 3, name: 'Tests', due_date: '2024-02-10', completed: false },
      { id: 4, name: 'Livraison', due_date: '2024-02-15', completed: false }
    ]
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
    owner_id: 2,
    hours_allocated: 80,
    price: 13600.00,
    total_tasks: 15,
    completed_tasks: 9,
    milestones: [
      { id: 5, name: 'Design', due_date: '2024-02-01', completed: true },
      { id: 6, name: 'Développement', due_date: '2024-02-20', completed: false },
      { id: 7, name: 'Tests', due_date: '2024-02-25', completed: false },
      { id: 8, name: 'Déploiement', due_date: '2024-03-01', completed: false }
    ]
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
    owner_id: 1,
    hours_allocated: 60,
    price: 10200.00,
    total_tasks: 12,
    completed_tasks: 12,
    milestones: [
      { id: 9, name: 'Audit', due_date: '2023-12-15', completed: true },
      { id: 10, name: 'Optimisation', due_date: '2024-01-15', completed: true },
      { id: 11, name: 'Validation', due_date: '2024-01-30', completed: true }
    ]
  },
  {
    id: 4,
    name: 'Projet Delta',
    description: 'Migration vers nouvelle architecture',
    status: 'En retard',
    progress: 30,
    start_date: '2024-01-01',
    end_date: '2024-01-20',
    delivery_date: '2024-02-10',
    team_size: 3,
    owner_id: 2,
    hours_allocated: 50,
    price: 8500.00,
    total_tasks: 8,
    completed_tasks: 2,
    milestones: [
      { id: 12, name: 'Planification', due_date: '2024-01-05', completed: true },
      { id: 13, name: 'Migration', due_date: '2024-01-20', completed: false }
    ]
  }
];

// Tâches étendues
const tasks = [
  { 
    id: 1, 
    project_id: 1, 
    project_name: 'Projet Alpha',
    title: 'Analyse des besoins',
    description: 'Analyser les besoins du client et documenter les spécifications',
    status: 'Terminé',
    priority: 'Haute',
    start_date: '2024-01-01',
    end_date: '2024-01-05',
    due_date: '2024-01-05',
    progress: 100,
    responsables: [{ id: 1, prenom: 'BZ', nom: 'Inc' }],
    is_recurrent: false,
    milestone_id: 1
  },
  { 
    id: 2, 
    project_id: 1,
    project_name: 'Projet Alpha',
    title: 'Conception technique',
    description: 'Créer l\'architecture technique du projet',
    status: 'En cours',
    priority: 'Haute',
    start_date: '2024-01-06',
    end_date: '2024-01-20',
    due_date: '2024-01-20',
    progress: 80,
    responsables: [{ id: 3, prenom: 'Marie', nom: 'Dubois' }],
    is_recurrent: false,
    milestone_id: 2
  },
  { 
    id: 3, 
    project_id: 2,
    project_name: 'Projet Beta',
    title: 'Design UI/UX',
    description: 'Créer les maquettes et prototypes',
    status: 'En cours',
    priority: 'Haute',
    start_date: '2024-01-15',
    end_date: '2024-02-15',
    due_date: '2024-02-15',
    progress: 70,
    responsables: [{ id: 5, prenom: 'Sophie', nom: 'Bernard' }],
    is_recurrent: false,
    milestone_id: 5
  },
  { 
    id: 4, 
    project_id: null,
    project_name: null,
    title: 'Réunion hebdomadaire d\'équipe',
    description: 'Réunion de coordination de l\'équipe',
    status: 'En cours',
    priority: 'Moyenne',
    start_date: '2024-01-20',
    end_date: '2024-01-20',
    due_date: '2024-01-20',
    progress: 0,
    responsables: [{ id: 1, prenom: 'BZ', nom: 'Inc' }],
    is_recurrent: true,
    recurrent_pattern: 'weekly',
    milestone_id: null
  },
  { 
    id: 5, 
    project_id: 1,
    project_name: 'Projet Alpha',
    title: 'Développement backend',
    description: 'Implémenter les APIs backend',
    status: 'En cours',
    priority: 'Haute',
    start_date: '2024-01-21',
    end_date: '2024-02-05',
    due_date: '2024-02-05',
    progress: 60,
    responsables: [{ id: 4, prenom: 'Jean', nom: 'Martin' }, { id: 6, prenom: 'Pierre', nom: 'Lefebvre' }],
    is_recurrent: false,
    milestone_id: 2
  }
];

// Données mockup - Activités client
const activities = [
  {
    id: 1,
    date: '2024-01-15T10:00:00',
    client: 'BZ Inc',
    emplacement: 'Bureau principal - Montréal',
    project_id: 1,
    action: 'Migration serveur de base de données',
    raison: 'Amélioration de la sécurité et performance. Le serveur actuel n\'était plus supporté.',
    resultats: 'Temps de réponse réduit de 40%, sécurité renforcée avec chiffrement TLS 1.3, capacité de stockage augmentée de 3x',
    equipements_touches: ['Serveur-DB-001', 'Serveur-Backup-01', 'Routeur-Core-01'],
    technicien: 'Marie Dubois',
    type_activite: 'intervention'
  },
  {
    id: 2,
    date: '2024-01-18T14:30:00',
    client: 'VertDure',
    emplacement: 'Siège social - Québec',
    project_id: 2,
    action: 'Installation et configuration firewall nouvelle génération',
    raison: 'Conformité réglementaire et protection contre les menaces avancées',
    resultats: 'Blocage de 1200+ tentatives d\'intrusion détectées en première semaine, trafic analysé à 99.8%',
    equipements_touches: ['Firewall-NGFW-01', 'Switch-Core-01'],
    technicien: 'Jean Martin',
    type_activite: 'intervention'
  },
  {
    id: 3,
    date: '2024-01-20T09:00:00',
    client: 'BZ Inc',
    emplacement: 'Bureau principal - Montréal',
    project_id: 1,
    action: 'Optimisation performance réseau WiFi',
    raison: 'Plaintes utilisateurs concernant la lenteur du WiFi, surtout dans les bureaux éloignés',
    resultats: 'Vitesse moyenne augmentée de 250%, couverture étendue de 30%, réduction des zones mortes à zéro',
    equipements_touches: ['AP-WiFi-01', 'AP-WiFi-02', 'AP-WiFi-03', 'Contrôleur-WiFi-01'],
    technicien: 'Sophie Bernard',
    type_activite: 'optimisation'
  },
  {
    id: 4,
    date: '2024-01-22T13:00:00',
    client: 'VertDure',
    emplacement: 'Bureau régional - Laval',
    project_id: null,
    action: 'Formation équipe IT sur gestion des sauvegardes',
    raison: 'Nouveau système de sauvegarde déployé, nécessité de former l\'équipe sur les procédures',
    resultats: 'Équipe formée sur 3 niveaux (administrateurs, techniciens, utilisateurs), documentation complète fournie, procédures de restauration testées avec succès',
    equipements_touches: [],
    technicien: 'Pierre Lefebvre',
    type_activite: 'formation'
  },
  {
    id: 5,
    date: '2024-01-25T11:30:00',
    client: 'BZ Inc',
    emplacement: 'Centre de données - Montréal',
    project_id: 3,
    action: 'Résolution panne critique serveur web',
    raison: 'Serveur web principal inaccessible, impactant tous les services client',
    resultats: 'Problème résolu en 45 minutes (panne de disque dur détectée et remplacée), services restaurés avec perte de données minimale grâce aux sauvegardes',
    equipements_touches: ['Serveur-WEB-001', 'RAID-Controller-01'],
    technicien: 'Marie Dubois',
    type_activite: 'resolution'
  }
];

// Données mockup - Mises à jour équipements
const equipmentUpdates = [
  {
    id: 1,
    date: '2024-01-10T08:00:00',
    niveau: 'equipement',
    reference: 'Serveur-DB-001',
    type_equipement: 'Serveur Windows',
    version_avant: 'Windows Server 2019',
    version_apres: 'Windows Server 2022',
    type_update: 'securite',
    downtime: 30,
    tests_effectues: 'Tests de connectivité, tests de performance, vérification des services critiques, test de restauration',
    impact: 'majeur',
    technicien: 'Jean Martin',
    validation: 'Validé par directeur IT - 2024-01-10'
  },
  {
    id: 2,
    date: '2024-01-12T20:00:00',
    niveau: 'type',
    reference: 'Tous les postes Windows 11',
    type_equipement: 'Poste Windows 11',
    version_avant: 'Windows 11 22H2',
    version_apres: 'Windows 11 23H2',
    type_update: 'fonctionnalite',
    downtime: 0,
    tests_effectues: 'Déploiement progressif sur 5 postes pilotes, tests utilisateurs pendant 1 semaine, validation fonctionnalités critiques',
    impact: 'moyen',
    technicien: 'Sophie Bernard',
    validation: 'Validé par chef d\'équipe - 2024-01-12'
  },
  {
    id: 3,
    date: '2024-01-14T02:00:00',
    niveau: 'equipement',
    reference: 'Routeur-Core-01',
    type_equipement: 'Routeur Cisco',
    version_avant: 'IOS 15.7(3)M4a',
    version_apres: 'IOS XE 17.06.05a',
    type_update: 'securite',
    downtime: 15,
    tests_effectues: 'Test de routage, test de sécurité, vérification des règles firewall, test de redondance',
    impact: 'critique',
    technicien: 'Pierre Lefebvre',
    validation: 'Validé par architecte réseau - 2024-01-14'
  },
  {
    id: 4,
    date: '2024-01-16T10:00:00',
    niveau: 'client',
    reference: 'Site Montréal - BZ Inc',
    type_equipement: 'Infrastructure complète',
    version_avant: 'Mixed',
    version_apres: 'Standardisé Windows Server 2022',
    type_update: 'securite',
    downtime: 120,
    tests_effectues: 'Tests complets d\'infrastructure, vérification de tous les services, tests de charge, validation par client',
    impact: 'critique',
    technicien: 'Marie Dubois',
    validation: 'Validé par directeur général - 2024-01-16'
  },
  {
    id: 5,
    date: '2024-01-19T14:00:00',
    niveau: 'equipement',
    reference: 'Firewall-NGFW-01',
    type_equipement: 'Firewall Fortinet',
    version_avant: 'FortiOS 7.2.5',
    version_apres: 'FortiOS 7.4.1',
    type_update: 'correctif',
    downtime: 20,
    tests_effectues: 'Tests de filtrage, test de performance IPS, vérification des règles, test de failover',
    impact: 'majeur',
    technicien: 'Jean Martin',
    validation: 'Validé par responsable sécurité - 2024-01-19'
  },
  {
    id: 6,
    date: '2024-01-21T16:00:00',
    niveau: 'type',
    reference: 'Tous les serveurs Linux',
    type_equipement: 'Serveur Linux',
    version_avant: 'Ubuntu 20.04 LTS',
    version_apres: 'Ubuntu 22.04 LTS',
    type_update: 'securite',
    downtime: 45,
    tests_effectues: 'Tests sur environnement de staging, tests applicatifs, vérification compatibilité, test de restauration',
    impact: 'majeur',
    technicien: 'Sophie Bernard',
    validation: 'Validé par chef d\'équipe DevOps - 2024-01-21'
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

// Fonction pour parser le body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
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
  if (path === '/api/auth/login') {
    if (method === 'POST') {
      parseBody(req).then(body => {
        console.log('Login attempt for:', body.email);
        const user = users.find(u => u.courriel === body.email);
        
        if (!user || passwords[body.email] !== body.password) {
          sendError(res, 'Courriel ou mot de passe incorrect', 401);
          return;
        }
        
        const { ...userWithoutPassword } = user;
        sendJSON(res, { user: userWithoutPassword, token: 'mock-token-' + user.id });
      }).catch(error => {
        sendError(res, 'Données JSON invalides', 400);
      });
      return;
    }
  }
  else if (path === '/api/dashboard/stats') {
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
      const projectsWithDetails = projects.map(p => ({
        ...p,
        owner_prenom: users.find(u => u.id === p.owner_id)?.prenom || null,
        owner_nom: users.find(u => u.id === p.owner_id)?.nom || null,
        owner_courriel: users.find(u => u.id === p.owner_id)?.courriel || null
      }));
      sendJSON(res, projectsWithDetails);
    } else if (method === 'POST') {
      parseBody(req).then(newProject => {
        newProject.id = Math.max(...projects.map(p => p.id)) + 1;
        newProject.owner_id = newProject.owner_id || 1;
        newProject.team_size = newProject.team_size || 1;
        newProject.hours_allocated = newProject.hours_allocated || 0;
        newProject.price = (newProject.hours_allocated || 0) * 170;
        newProject.status = newProject.status || 'En cours';
        newProject.progress = newProject.progress || 0;
        newProject.milestones = newProject.milestones || [];
        projects.push(newProject);
        sendJSON(res, { id: newProject.id, message: 'Projet créé avec succès' }, 201);
      }).catch(error => {
        sendError(res, 'Données JSON invalides', 400);
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
      parseBody(req).then(updatedProject => {
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
          if (updatedProject.hours_allocated !== undefined) {
            updatedProject.price = updatedProject.hours_allocated * 170;
          }
          projects[index] = { ...projects[index], ...updatedProject };
          sendJSON(res, { message: 'Projet mis à jour avec succès' });
        } else {
          sendError(res, 'Projet non trouvé', 404);
        }
      }).catch(error => {
        sendError(res, 'Données JSON invalides', 400);
      });
    } else if (method === 'DELETE') {
      const index = projects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects.splice(index, 1);
        sendJSON(res, { message: 'Projet supprimé avec succès' });
      } else {
        sendError(res, 'Projet non trouvé', 404);
      }
    }
  }
  else if (path === '/api/tasks') {
    if (method === 'GET') {
      const query = parsedUrl.query;
      const tasksWithDetails = tasks.map(task => {
        const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;
        return {
          ...task,
          project_name: project ? project.name : 'Sans projet',
          responsables: task.responsables || [],
          notes_count: Array.isArray(task.notes) ? task.notes.length : 0
        };
      });
      
      // Filtres
      let filteredTasks = tasksWithDetails;
      if (query.responsible_id) {
        filteredTasks = filteredTasks.filter(t => 
          t.responsables && t.responsables.some(r => r.id === parseInt(query.responsible_id))
        );
      }
      if (query.project_id) {
        filteredTasks = filteredTasks.filter(t => t.project_id === parseInt(query.project_id));
      }
      if (query.status) {
        filteredTasks = filteredTasks.filter(t => t.status === query.status);
      }
      
      sendJSON(res, filteredTasks);
    } else if (method === 'POST') {
      parseBody(req).then(newTask => {
        newTask.id = Math.max(...tasks.map(t => t.id), 0) + 1;
        newTask.status = newTask.status || 'À faire';
        newTask.priority = newTask.priority || 'Moyenne';
        newTask.progress = newTask.progress || 0;
        newTask.is_recurrent = newTask.is_recurrent || false;
        
        // Gérer les responsables
        if (newTask.responsible_ids && Array.isArray(newTask.responsible_ids)) {
          newTask.responsables = newTask.responsible_ids.map(id => {
            const user = users.find(u => u.id === id);
            return user ? { id: user.id, prenom: user.prenom, nom: user.nom } : null;
          }).filter(Boolean);
        } else if (newTask.responsible_id) {
          const user = users.find(u => u.id === newTask.responsible_id);
          newTask.responsables = user ? [{ id: user.id, prenom: user.prenom, nom: user.nom }] : [];
        } else {
          newTask.responsables = [];
        }
        
        const project = newTask.project_id ? projects.find(p => p.id === newTask.project_id) : null;
        newTask.project_name = project ? project.name : null;
        newTask.notes = [];
        
        tasks.push(newTask);
        sendJSON(res, { id: newTask.id, message: 'Tâche créée avec succès' }, 201);
      }).catch(error => {
        sendError(res, 'Données JSON invalides', 400);
      });
    }
  }
  else if (path.startsWith('/api/tasks/') && path.endsWith('/notes')) {
    // Notes de tâches - stockage en mémoire
    const taskId = parseInt(path.split('/')[3]);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      sendError(res, 'Tâche non trouvée', 404);
      return;
    }
    task.notes = task.notes || [];
    if (method === 'GET') {
      sendJSON(res, task.notes);
    } else if (method === 'POST') {
      parseBody(req).then(body => {
        if (!body || !body.content || String(body.content).trim() === '') {
          sendError(res, 'Contenu de note manquant', 400);
          return;
        }
        const newNote = {
          id: (task.notes.length ? Math.max(...task.notes.map(n => n.id)) : 0) + 1,
          content: String(body.content),
          author_id: body.author_id || null,
          created_at: new Date().toISOString()
        };
        task.notes.unshift(newNote);
        sendJSON(res, { id: newNote.id, created_at: newNote.created_at }, 201);
      }).catch(error => {
        sendError(res, 'Données JSON invalides', 400);
      });
    }
  }
  else if (path === '/api/operations/activities') {
    if (method === 'GET') {
      sendJSON(res, activities);
    } else if (method === 'POST') {
      parseBody(req).then(newActivity => {
        newActivity.id = Math.max(...activities.map(a => a.id), 0) + 1;
        newActivity.date = newActivity.date || new Date().toISOString();
        activities.push(newActivity);
        sendJSON(res, { id: newActivity.id, message: 'Activité créée avec succès' }, 201);
      }).catch(error => {
        sendError(res, 'Données JSON invalides', 400);
      });
    }
  }
  else if (path === '/api/operations/updates') {
    if (method === 'GET') {
      sendJSON(res, equipmentUpdates);
    } else if (method === 'POST') {
      parseBody(req).then(newUpdate => {
        newUpdate.id = Math.max(...equipmentUpdates.map(u => u.id), 0) + 1;
        newUpdate.date = newUpdate.date || new Date().toISOString();
        equipmentUpdates.push(newUpdate);
        sendJSON(res, { id: newUpdate.id, message: 'Mise à jour créée avec succès' }, 201);
      }).catch(error => {
        sendError(res, 'Données JSON invalides', 400);
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
      sendJSON(res, task);
    } else if (method === 'PUT') {
      parseBody(req).then(updatedTask => {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          // Gérer les responsables
          if (updatedTask.responsible_ids && Array.isArray(updatedTask.responsible_ids)) {
            updatedTask.responsables = updatedTask.responsible_ids.map(id => {
              const user = users.find(u => u.id === id);
              return user ? { id: user.id, prenom: user.prenom, nom: user.nom } : null;
            }).filter(Boolean);
          } else if (updatedTask.responsible_id) {
            const user = users.find(u => u.id === updatedTask.responsible_id);
            updatedTask.responsables = user ? [{ id: user.id, prenom: user.prenom, nom: user.nom }] : [];
          }
          
          tasks[index] = { ...tasks[index], ...updatedTask };
          sendJSON(res, { message: 'Tâche mise à jour avec succès' });
        } else {
          sendError(res, 'Tâche non trouvée', 404);
        }
      }).catch(error => {
        sendError(res, 'Données JSON invalides', 400);
      });
    } else if (method === 'DELETE') {
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.splice(index, 1);
        sendJSON(res, { message: 'Tâche supprimée avec succès' });
      } else {
        sendError(res, 'Tâche non trouvée', 404);
      }
    }
  }
  else if (path === '/' || path.startsWith('/assets/') || path === '/vite.svg') {
    // Servir les fichiers statiques du frontend React
    const filePath = path === '/' ? './dist/index.html' : `./dist${path}`;
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Fallback sur index.html pour le routing React
        fs.readFile('./dist/index.html', (err, fallback) => {
          if (err) {
            sendError(res, 'Application non trouvée. Exécutez "npm run build" d\'abord.', 404);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallback);
        });
        return;
      }
      
      // Déterminer le type de contenu
      const ext = path.split('.').pop();
      const contentType = ext === 'css' ? 'text/css' : 
                         ext === 'js' ? 'application/javascript' :
                         ext === 'svg' ? 'image/svg+xml' :
                         'text/html';
      
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
  console.log(`🚀 Serveur VertProjet (MOCK DATA) démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🎯 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
  console.log(`🌐 Application: http://localhost:${PORT}/`);
  console.log(`\n📝 Comptes de test:`);
  console.log(`   - bzinc@bzinc.ca / Jai.1.Mcd0`);
  console.log(`   - vertdure@vertdure.com / Jai.du.Beau.Gaz0n`);
});

// Gestion des erreurs
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});


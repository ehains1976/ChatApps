const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Base de données SQLite
const db = new sqlite3.Database('./vertprojet.db', (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
  } else {
    console.log('✅ Base de données SQLite connectée');
  }
});

// Initialisation de la base de données
const initDatabase = () => {
  // Table des projets
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'En cours',
      progress INTEGER DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des tâches
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'À faire',
      priority TEXT DEFAULT 'Moyenne',
      progress INTEGER DEFAULT 0,
      start_date TEXT,
      due_date TEXT,
      assigned_to TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id)
    )
  `);

  // Table des sous-tâches
  db.run(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'À faire',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks (id)
    )
  `);

  // Table des équipes
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      member_name TEXT NOT NULL,
      role TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id)
    )
  `);

  console.log('✅ Tables de base de données créées');
};

// Données de démonstration
const seedDatabase = () => {
  // Vérifier si des données existent déjà
  db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification des données:', err.message);
      return;
    }

    if (row.count === 0) {
      console.log('🌱 Ajout des données de démonstration...');
      
      // Projets de démonstration
      const projects = [
        {
          name: 'Projet Alpha',
          description: 'Développement d\'une nouvelle fonctionnalité',
          status: 'En cours',
          progress: 85,
          start_date: '2024-01-01',
          end_date: '2024-02-15'
        },
        {
          name: 'Projet Beta',
          description: 'Refonte de l\'interface utilisateur',
          status: 'En cours',
          progress: 60,
          start_date: '2024-01-15',
          end_date: '2024-03-01'
        },
        {
          name: 'Projet Gamma',
          description: 'Optimisation des performances',
          status: 'Terminé',
          progress: 100,
          start_date: '2023-12-01',
          end_date: '2024-01-30'
        },
        {
          name: 'Projet Delta',
          description: 'Migration vers nouvelle architecture',
          status: 'En retard',
          progress: 30,
          start_date: '2024-01-01',
          end_date: '2024-01-20'
        }
      ];

      projects.forEach(project => {
        db.run(
          `INSERT INTO projects (name, description, status, progress, start_date, end_date) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [project.name, project.description, project.status, project.progress, project.start_date, project.end_date]
        );
      });

      // Tâches de démonstration
      const tasks = [
        { project_id: 1, title: 'Analyse des besoins', status: 'Terminé', progress: 100, priority: 'Haute' },
        { project_id: 1, title: 'Conception technique', status: 'En cours', progress: 80, priority: 'Haute' },
        { project_id: 1, title: 'Développement', status: 'En cours', progress: 60, priority: 'Moyenne' },
        { project_id: 1, title: 'Tests', status: 'À faire', progress: 0, priority: 'Moyenne' },
        { project_id: 2, title: 'Design UI/UX', status: 'En cours', progress: 70, priority: 'Haute' },
        { project_id: 2, title: 'Implémentation frontend', status: 'À faire', progress: 0, priority: 'Haute' },
        { project_id: 3, title: 'Audit de performance', status: 'Terminé', progress: 100, priority: 'Haute' },
        { project_id: 3, title: 'Optimisation', status: 'Terminé', progress: 100, priority: 'Haute' },
        { project_id: 4, title: 'Planification migration', status: 'En cours', progress: 50, priority: 'Haute' },
        { project_id: 4, title: 'Migration des données', status: 'À faire', progress: 0, priority: 'Haute' }
      ];

      tasks.forEach(task => {
        db.run(
          `INSERT INTO tasks (project_id, title, status, progress, priority) 
           VALUES (?, ?, ?, ?, ?)`,
          [task.project_id, task.title, task.status, task.progress, task.priority]
        );
      });

      // Équipes de démonstration
      const teams = [
        { project_id: 1, member_name: 'Alice Martin', role: 'Chef de projet', email: 'alice@company.com' },
        { project_id: 1, member_name: 'Bob Dupont', role: 'Développeur', email: 'bob@company.com' },
        { project_id: 1, member_name: 'Claire Leroy', role: 'Designer', email: 'claire@company.com' },
        { project_id: 2, member_name: 'David Moreau', role: 'Chef de projet', email: 'david@company.com' },
        { project_id: 2, member_name: 'Emma Petit', role: 'Développeur', email: 'emma@company.com' },
        { project_id: 3, member_name: 'François Blanc', role: 'Architecte', email: 'francois@company.com' },
        { project_id: 3, member_name: 'Gabrielle Roux', role: 'Développeur', email: 'gabrielle@company.com' },
        { project_id: 4, member_name: 'Hugo Simon', role: 'Chef de projet', email: 'hugo@company.com' },
        { project_id: 4, member_name: 'Isabelle Garcia', role: 'DevOps', email: 'isabelle@company.com' },
        { project_id: 4, member_name: 'Julien Thomas', role: 'Développeur', email: 'julien@company.com' }
      ];

      teams.forEach(member => {
        db.run(
          `INSERT INTO teams (project_id, member_name, role, email) 
           VALUES (?, ?, ?, ?)`,
          [member.project_id, member.member_name, member.role, member.email]
        );
      });

      console.log('✅ Données de démonstration ajoutées');
    }
  });
};

// Routes API

// Dashboard - Statistiques générales
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  
  // Tâches en cours
  db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'En cours'", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    stats.tasksInProgress = row.count;
    
    // Tâches terminées
    db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'Terminé'", (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      stats.tasksCompleted = row.count;
      
      // Tâches en retard
      db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'En retard'", (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        stats.tasksOverdue = row.count;
        
        // Projets actifs
        db.get("SELECT COUNT(*) as count FROM projects WHERE status != 'Terminé'", (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          stats.activeProjects = row.count;
          
          res.json(stats);
        });
      });
    });
  });
});

// Projets
app.get('/api/projects', (req, res) => {
  db.all(`
    SELECT p.*, 
           COUNT(t.id) as total_tasks,
           COUNT(CASE WHEN t.status = 'Terminé' THEN 1 END) as completed_tasks,
           COUNT(team.id) as team_size
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    LEFT JOIN teams team ON p.id = team.project_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  
  db.get("SELECT * FROM projects WHERE id = ?", [projectId], (err, project) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!project) {
      res.status(404).json({ error: 'Projet non trouvé' });
      return;
    }
    
    // Récupérer les tâches du projet
    db.all("SELECT * FROM tasks WHERE project_id = ?", [projectId], (err, tasks) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Récupérer l'équipe du projet
      db.all("SELECT * FROM teams WHERE project_id = ?", [projectId], (err, team) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          ...project,
          tasks,
          team
        });
      });
    });
  });
});

// Tâches
app.get('/api/tasks', (req, res) => {
  db.all(`
    SELECT t.*, p.name as project_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    ORDER BY t.created_at DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Créer un nouveau projet
app.post('/api/projects', (req, res) => {
  const { name, description, start_date, end_date } = req.body;
  
  db.run(
    `INSERT INTO projects (name, description, start_date, end_date) 
     VALUES (?, ?, ?, ?)`,
    [name, description, start_date, end_date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Projet créé avec succès' });
    }
  );
});

// Mettre à jour un projet
app.put('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  const { name, description, status, progress, start_date, end_date } = req.body;
  
  db.run(
    `UPDATE projects 
     SET name = ?, description = ?, status = ?, progress = ?, start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, description, status, progress, start_date, end_date, projectId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Projet mis à jour avec succès' });
    }
  );
});

// Supprimer un projet
app.delete('/api/projects/:id', (req, res) => {
  const projectId = req.params.id;
  
  db.run("DELETE FROM projects WHERE id = ?", [projectId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Projet supprimé avec succès' });
  });
});

// Initialiser la base de données
initDatabase();
seedDatabase();

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur VertProjet démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🎯 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
});

// Gestion des erreurs
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  db.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture de la base de données:', err.message);
    } else {
      console.log('✅ Base de données fermée');
    }
    process.exit(0);
  });
});

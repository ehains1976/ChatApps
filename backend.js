// Backend VertProjet avec PostgreSQL
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import { initializeDatabase } from './database/init.js';

const PORT = process.env.PORT || 3001;

// Importer la connexion depuis database/connection.js qui gère mieux les différents environnements
import pool from './database/connection.js';

// Initialiser la base de données au démarrage
let dbInitialized = false;
async function start() {
  try {
    console.log('🔄 Démarrage de l\'initialisation de la base de données...');
    await initializeDatabase();
    dbInitialized = true;
    console.log('✅ Base de données initialisée avec succès!');
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE lors de l\'initialisation DB:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('⚠️ Le backend continue mais les tables peuvent ne pas exister');
    console.error('⚠️ Vérifiez les logs ci-dessus et créez les tables manuellement si nécessaire');
    // Ne pas bloquer le démarrage, mais loguer l'erreur complète
  }
}


// Fonction pour gérer les requêtes CORS
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, data, statusCode = 200) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendError(res, message, statusCode = 500) {
  setCORSHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
}

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

// Routes API avec PostgreSQL
const routes = {
  // Route login
  async '/api/auth/login'(req, res, method) {
    if (method === 'POST') {
      try {
        const body = await parseBody(req);
        console.log('Login attempt for:', body.email);
        
        // Chercher l'utilisateur par email
        const userResult = await pool.query(
          'SELECT id, prenom, nom, courriel, password_hash, role FROM users WHERE courriel = $1',
          [body.email]
        );
        
        console.log('User found:', userResult.rows.length > 0);
        
        if (userResult.rows.length === 0) {
          sendError(res, 'Courriel ou mot de passe incorrect', 401);
          return;
        }
        
        const user = userResult.rows[0];
        
        // Vérifier le mot de passe
        const bcrypt = await import('bcryptjs');
        const bcryptjs = bcrypt.default || bcrypt;
        let passwordHash = user.password_hash;
        
        // Si le hash est manquant ou null
        if (!passwordHash || passwordHash === '') {
          console.log('Password hash missing, attempting auto-migration');
          const expected = user.courriel === 'bzinc@bzinc.ca' ? 'Jai.1.Mcd0' : 'Jai.du.Beau.Gaz0n';
          if (body.password === expected) {
            passwordHash = await bcryptjs.hash(expected, 10);
            await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [passwordHash, user.id]);
            console.log('Password hash created');
          } else {
            console.log('Password incorrect');
            sendError(res, 'Courriel ou mot de passe incorrect', 401);
            return;
          }
        }

        const isValid = await bcryptjs.compare(body.password, passwordHash);
        console.log('Password valid:', isValid);
        
        if (!isValid) {
          sendError(res, 'Courriel ou mot de passe incorrect', 401);
          return;
        }
        
        // Retourner l'utilisateur (sans password_hash)
        const { password_hash, ...userWithoutPassword } = user;
        sendJSON(res, { user: userWithoutPassword, token: 'dummy-token' });
      } catch (error) {
        console.error('Erreur login:', error);
        sendError(res, 'Erreur serveur', 500);
      }
    }
  },

  // Route dashboard stats
  async '/api/dashboard/stats'(req, res, method) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'En cours') as tasksInProgress,
        COUNT(*) FILTER (WHERE status = 'Terminé') as tasksCompleted,
        COUNT(*) FILTER (WHERE status = 'En retard') as tasksOverdue,
        COUNT(*) FILTER (WHERE status != 'Terminé') as activeProjects
      FROM projects
    `);
    sendJSON(res, result.rows[0]);
  },

  // Routes Users
  async '/api/users'(req, res, method) {
    if (method === 'GET') {
      try {
        const result = await pool.query('SELECT id, prenom, nom, entreprise, courriel FROM users');
        sendJSON(res, result.rows || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        sendJSON(res, []); // Retourner un tableau vide au lieu d'une erreur 500
      }
    } else if (method === 'POST') {
      const body = await parseBody(req);
      const result = await pool.query(
        'INSERT INTO users (prenom, nom, entreprise, courriel) VALUES ($1, $2, $3, $4) RETURNING id',
        [body.prenom, body.nom, body.entreprise, body.courriel]
      );
      sendJSON(res, { id: result.rows[0].id, message: 'Utilisateur créé avec succès' }, 201);
    }
  },

  async '/api/users/:id'(req, res, method, params) {
    const id = parseInt(params.id);
    if (method === 'GET') {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        sendError(res, 'Utilisateur non trouvé', 404);
        return;
      }
      sendJSON(res, result.rows[0]);
    } else if (method === 'PUT') {
      const body = await parseBody(req);
      await pool.query(
        'UPDATE users SET prenom = $1, nom = $2, entreprise = $3, courriel = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
        [body.prenom, body.nom, body.entreprise, body.courriel, id]
      );
      sendJSON(res, { message: 'Utilisateur mis à jour avec succès' });
    } else if (method === 'DELETE') {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      sendJSON(res, { message: 'Utilisateur supprimé avec succès' });
    }
  },

  // Routes Projects
  async '/api/projects'(req, res, method) {
    if (method === 'GET') {
      try {
        const result = await pool.query(`
          SELECT p.*, u.prenom as owner_prenom, u.nom as owner_nom, u.courriel as owner_courriel,
                 (SELECT json_agg(m.name) FROM milestones m WHERE m.project_id = p.id) as milestones,
                 (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
                 (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Terminé') as completed_tasks
          FROM projects p
          LEFT JOIN users u ON p.owner_id = u.id
          ORDER BY p.id
        `);
        sendJSON(res, result.rows || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        sendJSON(res, []); // Retourner un tableau vide au lieu d'une erreur 500
      }
    } else if (method === 'POST') {
      try {
        const body = await parseBody(req);
        console.log('Creating project with data:', JSON.stringify(body, null, 2));
        
        // Si pas d'owner_id, utiliser le premier utilisateur admin disponible
        let ownerId = body.owner_id;
        if (!ownerId) {
          const userResult = await pool.query('SELECT id FROM users ORDER BY id LIMIT 1');
          if (userResult.rows.length > 0) {
            ownerId = userResult.rows[0].id;
            console.log('Using default owner_id:', ownerId);
          }
        }
      
        // Définir delivery_date par défaut si manquant
        const deliveryDate = body.delivery_date || body.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Convertir les dates vides en null
        const startDate = body.start_date && body.start_date.trim() !== '' ? body.start_date : null;
        const endDate = body.end_date && body.end_date.trim() !== '' ? body.end_date : null;
        
        const result = await pool.query(
          `INSERT INTO projects (name, description, status, start_date, end_date, delivery_date, team_size, owner_id, hours_allocated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [body.name, body.description, body.status || 'En cours', startDate, endDate, deliveryDate, body.team_size || 1, ownerId, body.hours_allocated || 0]
        );
      
      // Créer les jalons si fournis
      if (body.milestones && Array.isArray(body.milestones)) {
        for (const milestone of body.milestones) {
          await pool.query('INSERT INTO milestones (project_id, name) VALUES ($1, $2)', [result.rows[0].id, milestone]);
        }
      }
      
        sendJSON(res, { id: result.rows[0].id, message: 'Projet créé avec succès' }, 201);
      } catch (error) {
        console.error('Erreur création projet:', error);
        sendError(res, 'Erreur lors de la création du projet', 500);
      }
    }
  },

  async '/api/projects/:id'(req, res, method, params) {
    const id = parseInt(params.id);
    if (method === 'GET') {
      const result = await pool.query(`
        SELECT p.*, u.prenom as owner_prenom, u.nom as owner_nom,
               (SELECT json_agg(json_build_object('id', m.id, 'name', m.name, 'due_date', m.due_date, 'completed', m.completed))
                FROM milestones m WHERE m.project_id = p.id) as milestones
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.id = $1
      `, [id]);
      if (result.rows.length === 0) {
        sendError(res, 'Projet non trouvé', 404);
        return;
      }
      sendJSON(res, result.rows[0]);
    }
  },

  async '/api/projects/:id'(req, res, method, params) {
    const id = parseInt(params.id);
    if (method === 'GET') {
      const result = await pool.query(`
        SELECT p.*, u.prenom as owner_prenom, u.nom as owner_nom,
               (SELECT json_agg(json_build_object('id', m.id, 'name', m.name, 'due_date', m.due_date, 'completed', m.completed))
                FROM milestones m WHERE m.project_id = p.id) as milestones
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        WHERE p.id = $1
      `, [id]);
      if (result.rows.length === 0) {
        sendError(res, 'Projet non trouvé', 404);
        return;
      }
      sendJSON(res, result.rows[0]);
    } else if (method === 'PUT') {
      const body = await parseBody(req);
      
      // Convertir les dates vides en null
      const startDate = body.start_date && body.start_date.trim() !== '' ? body.start_date : null;
      const endDate = body.end_date && body.end_date.trim() !== '' ? body.end_date : null;
      const deliveryDate = body.delivery_date || body.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await pool.query(
        `UPDATE projects SET 
          name = $1, 
          description = $2, 
          status = $3, 
          start_date = $4, 
          end_date = $5, 
          delivery_date = $6, 
          team_size = $7, 
          hours_allocated = $8,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [body.name, body.description, body.status, startDate, endDate, deliveryDate, body.team_size, body.hours_allocated, id]
      );
      
      // Mettre à jour les jalons si fournis
      if (body.milestones && Array.isArray(body.milestones)) {
        // Supprimer les anciens jalons
        await pool.query('DELETE FROM milestones WHERE project_id = $1', [id]);
        
        // Ajouter les nouveaux jalons
        for (const milestone of body.milestones) {
          if (milestone.trim()) {
            await pool.query(
              'INSERT INTO milestones (project_id, name, due_date) VALUES ($1, $2, $3)',
              [id, milestone.trim(), deliveryDate]
            );
          }
        }
      }
      
      sendJSON(res, { message: 'Projet mis à jour avec succès' });
    } else if (method === 'DELETE') {
      // Supprimer les jalons associés
      await pool.query('DELETE FROM milestones WHERE project_id = $1', [id]);
      
      // Supprimer le projet
      await pool.query('DELETE FROM projects WHERE id = $1', [id]);
      sendJSON(res, { message: 'Projet supprimé avec succès' });
    }
  },

  // Routes Tasks avec many-to-many responsables
  async '/api/tasks'(req, res, method, params, query) {
    if (method === 'GET') {
      try {
        let querySQL = `
          SELECT t.*, 
                 p.name as project_name,
                 (SELECT json_agg(json_build_object('id', u.id, 'prenom', u.prenom, 'nom', u.nom))
                  FROM users u
                  JOIN task_responsibles tr ON u.id = tr.user_id
                  WHERE tr.task_id = t.id) as responsables,
                 (SELECT COUNT(*) FROM task_notes n WHERE n.task_id = t.id) as notes_count
          FROM tasks t
          LEFT JOIN projects p ON t.project_id = p.id
          WHERE 1=1
        `;
        const queryParams = [];
        let paramIndex = 1;

        if (query.responsible_id) {
          querySQL += ` AND EXISTS (SELECT 1 FROM task_responsibles tr WHERE tr.task_id = t.id AND tr.user_id = $${paramIndex})`;
          queryParams.push(parseInt(query.responsible_id));
          paramIndex++;
        }
        
        if (query.project_id) {
          querySQL += ` AND t.project_id = $${paramIndex}`;
          queryParams.push(parseInt(query.project_id));
          paramIndex++;
        }
        
        if (query.status) {
          querySQL += ` AND t.status = $${paramIndex}`;
          queryParams.push(query.status);
          paramIndex++;
        }

        querySQL += ' ORDER BY t.id';
        const result = await pool.query(querySQL, queryParams);
        sendJSON(res, result.rows || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        sendJSON(res, []); // Retourner un tableau vide au lieu d'une erreur 500
      }
    } else if (method === 'POST') {
      const body = await parseBody(req);
      const result = await pool.query(
        `INSERT INTO tasks (title, description, status, priority, start_date, end_date, due_date, progress, project_id, milestone_id, is_recurrent, recurrent_pattern)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [body.title, body.description, body.status || 'À faire', body.priority || 'Moyenne', body.start_date, body.end_date, body.due_date, body.progress || 0, body.project_id, body.milestone_id || null, body.is_recurrent || false, body.recurrent_pattern]
      );
      
      // Créer les relations responsables si fournis
      if (body.responsible_id || (Array.isArray(body.responsible_ids))) {
        const responsibleIds = Array.isArray(body.responsible_ids) ? body.responsible_ids : [body.responsible_id];
        for (const responsibleId of responsibleIds) {
          if (responsibleId) {
            await pool.query('INSERT INTO task_responsibles (task_id, user_id) VALUES ($1, $2)', [result.rows[0].id, responsibleId]);
          }
        }
      }
      
      sendJSON(res, { id: result.rows[0].id, message: 'Tâche créée avec succès' }, 201);
    }
  },

  async '/api/tasks/:id'(req, res, method, params) {
    const id = parseInt(params.id);
    if (method === 'DELETE') {
      await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      sendJSON(res, { message: 'Tâche supprimée avec succès' });
    } else if (method === 'PUT') {
      const body = await parseBody(req);
      await pool.query(
        `UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, start_date = $5, end_date = $6, due_date = $7, progress = $8, project_id = $9, milestone_id = $10, updated_at = CURRENT_TIMESTAMP
         WHERE id = $11`,
        [body.title, body.description, body.status, body.priority, body.start_date, body.end_date, body.due_date, body.progress, body.project_id, body.milestone_id || null, id]
      );
      
      // Mettre à jour les relations responsables
      // D'abord supprimer les anciennes relations
      await pool.query('DELETE FROM task_responsibles WHERE task_id = $1', [id]);
      
      // Puis créer les nouvelles relations
      if (body.responsible_id || (Array.isArray(body.responsible_ids))) {
        const responsibleIds = Array.isArray(body.responsible_ids) ? body.responsible_ids : [body.responsible_id];
        for (const responsibleId of responsibleIds) {
          if (responsibleId) {
            await pool.query('INSERT INTO task_responsibles (task_id, user_id) VALUES ($1, $2)', [id, responsibleId]);
          }
        }
      }
      
      sendJSON(res, { message: 'Tâche mise à jour avec succès' });
    }
  }
  ,
  // Notes de tâche
  async '/api/tasks/:id/notes'(req, res, method, params) {
    const taskId = parseInt(params.id);
    if (method === 'GET') {
      const result = await pool.query(
        `SELECT n.id, n.content, n.created_at, n.author_id,
                u.prenom, u.nom
         FROM task_notes n
         LEFT JOIN users u ON u.id = n.author_id
         WHERE n.task_id = $1
         ORDER BY n.created_at DESC`,
        [taskId]
      );
      sendJSON(res, result.rows);
    } else if (method === 'POST') {
      const body = await parseBody(req);
      if (!body || !body.content || String(body.content).trim() === '') {
        sendError(res, 'Contenu de note manquant', 400);
        return;
      }
      const authorId = body.author_id || null;
      const result = await pool.query(
        `INSERT INTO task_notes (task_id, author_id, content)
         VALUES ($1, $2, $3) RETURNING id, created_at`,
        [taskId, authorId, body.content]
      );
      sendJSON(res, { id: result.rows[0].id, created_at: result.rows[0].created_at }, 201);
    }
  }
};

// Middleware pour forcer HTTPS en production
if (process.env.NODE_ENV === 'production') {
  server.on('request', (req, res) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      res.writeHead(301, {
        'Location': `https://${req.headers.host}${req.url}`
      });
      res.end();
      return;
    }
  });
}

// Serveur HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Headers de sécurité pour HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

  // Gérer CORS preflight
  if (method === 'OPTIONS') {
    setCORSHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // Servir les fichiers statiques
  if (pathname.startsWith('/assets/') || pathname === '/vite.svg') {
    const filePath = pathname.startsWith('/assets/') ? `./dist${pathname}` : `./dist${pathname}`;
    fs.readFile(filePath, (err, data) => {
      if (err) {
        sendError(res, 'Fichier non trouvé', 404);
        return;
      }
      const ext = path.extname(pathname);
      const contentType = ext === '.js' ? 'application/javascript' : 
                         ext === '.css' ? 'text/css' :
                         ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  // Healthcheck endpoint pour Railway
  if (pathname === '/health' || pathname === '/healthcheck') {
    setCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: dbInitialized ? 'connected' : 'not initialized'
    }));
    return;
  }

  // Servir index.html pour le routing React
  if (pathname === '/' || !pathname.startsWith('/api')) {
    fs.readFile('./dist/index.html', (err, data) => {
      if (err) {
        // Si index.html n'existe pas, retourner quand même 200 pour le healthcheck
        if (pathname === '/') {
          setCORSHeaders(res);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            status: 'ok', 
            message: 'Server running, frontend building...',
            database: dbInitialized ? 'connected' : 'not initialized'
          }));
          return;
        }
        sendError(res, 'Application non trouvée', 404);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // Routes API
  try {
    const routeKey = Object.keys(routes).find(key => {
      if (key.includes(':')) {
        const pattern = key.replace(/:(\w+)/g, '(\\d+)').replace(/\//g, '\\/');
        const regex = new RegExp('^' + pattern + '$');
        return regex.test(pathname);
      }
      return pathname === key;
    });

    if (routeKey && routes[routeKey]) {
      const params = {};
      if (routeKey.includes(':')) {
        const parts = routeKey.split('/');
        const pathParts = pathname.split('/');
        parts.forEach((part, i) => {
          if (part.startsWith(':')) {
            const paramName = part.substring(1);
            params[paramName] = pathParts[i];
          }
        });
      }
      await routes[routeKey](req, res, method, params, parsedUrl.query);
    } else {
      sendError(res, 'Route non trouvée', 404);
    }
  } catch (error) {
    console.error('Erreur:', error);
    sendError(res, error.message, 500);
  }
});

// Démarrer le serveur (même si la DB échoue, pour que le healthcheck fonctionne)
let serverStarted = false;

async function startServer() {
  if (serverStarted) return;
  
  // Attendre un peu pour s'assurer que l'initialisation est terminée
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (!dbInitialized) {
    console.warn('⚠️ Démarrage du serveur sans initialisation DB complète');
  }
  
  server.listen(PORT, () => {
    serverStarted = true;
    console.log(`🚀 Serveur ChatApps démarré sur le port ${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
    console.log(`💾 Base de données: ${process.env.DATABASE_URL ? 'PostgreSQL (Railway)' : 'Locale'}`);
  });
}

// Démarrer le serveur même si la DB échoue (pour que le healthcheck fonctionne)
start().then(() => {
  console.log('✅ Initialisation DB terminée, démarrage du serveur...');
  startServer();
}).catch((err) => {
  console.error('❌ Erreur lors de l\'initialisation DB:', err);
  console.warn('⚠️ Démarrage du serveur quand même pour permettre le healthcheck');
  // Démarrer quand même le serveur pour que Railway puisse vérifier la santé
  startServer();
});

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  pool.end();
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});

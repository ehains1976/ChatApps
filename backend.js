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

// Pool de connexions PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Initialiser la base de données au démarrage
let dbInitialized = false;
async function start() {
  try {
    await initializeDatabase();
    dbInitialized = true;
    console.log('✅ Base de données initialisée');
  } catch (error) {
    console.error('⚠️ Erreur initialisation DB:', error.message);
    console.log('⚠️ Le backend continue sans initialisation automatique');
    console.log('⚠️ Les tables doivent être créées manuellement');
  }
}
start();

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
        let passwordHash = user.password_hash;
        
        // Si le hash est manquant ou null
        if (!passwordHash || passwordHash === '') {
          console.log('Password hash missing, attempting auto-migration');
          const expected = user.courriel === 'bzinc@bzinc.ca' ? 'Jai.1.Mcd0' : 'Jai.du.Beau.Gaz0n';
          if (body.password === expected) {
            passwordHash = await bcrypt.hash(expected, 10);
            await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [passwordHash, user.id]);
            console.log('Password hash created');
          } else {
            console.log('Password incorrect');
            sendError(res, 'Courriel ou mot de passe incorrect', 401);
            return;
          }
        }

        const isValid = await bcrypt.compare(body.password, passwordHash);
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
      const result = await pool.query('SELECT id, prenom, nom, entreprise, courriel FROM users');
      sendJSON(res, result.rows);
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
      const result = await pool.query(`
        SELECT p.*, u.prenom as owner_prenom, u.nom as owner_nom, u.courriel as owner_courriel,
               (SELECT json_agg(m.name) FROM milestones m WHERE m.project_id = p.id) as milestones,
               (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
               (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Terminé') as completed_tasks
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        ORDER BY p.id
      `);
      sendJSON(res, result.rows);
    } else if (method === 'POST') {
      const body = await parseBody(req);
      
      // Si pas d'owner_id, utiliser le premier utilisateur admin disponible
      let ownerId = body.owner_id;
      if (!ownerId) {
        const userResult = await pool.query('SELECT id FROM users ORDER BY id LIMIT 1');
        if (userResult.rows.length > 0) {
          ownerId = userResult.rows[0].id;
          console.log('Using default owner_id:', ownerId);
        }
      }
      
      const result = await pool.query(
        `INSERT INTO projects (name, description, status, start_date, end_date, delivery_date, team_size, owner_id, hours_allocated)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [body.name, body.description, body.status || 'En cours', body.start_date, body.end_date, body.delivery_date, body.team_size || 1, ownerId, body.hours_allocated || 0]
      );
      
      // Créer les jalons si fournis
      if (body.milestones && Array.isArray(body.milestones)) {
        for (const milestone of body.milestones) {
          await pool.query('INSERT INTO milestones (project_id, name) VALUES ($1, $2)', [result.rows[0].id, milestone]);
        }
      }
      
      sendJSON(res, { id: result.rows[0].id, message: 'Projet créé avec succès' }, 201);
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

  // Routes Tasks avec many-to-many responsables
  async '/api/tasks'(req, res, method, params, query) {
    if (method === 'GET') {
      let querySQL = `
        SELECT t.*, 
               p.name as project_name,
               (SELECT json_agg(json_build_object('id', u.id, 'prenom', u.prenom, 'nom', u.nom))
                FROM users u
                JOIN task_responsibles tr ON u.id = tr.user_id
                WHERE tr.task_id = t.id) as responsables
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
      sendJSON(res, result.rows);
    } else if (method === 'POST') {
      const body = await parseBody(req);
      const result = await pool.query(
        `INSERT INTO tasks (title, description, status, priority, start_date, end_date, due_date, progress, project_id, is_recurrent, recurrent_pattern)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [body.title, body.description, body.status || 'À faire', body.priority || 'Moyenne', body.start_date, body.end_date, body.due_date, body.progress || 0, body.project_id, body.is_recurrent || false, body.recurrent_pattern]
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
        `UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, start_date = $5, end_date = $6, due_date = $7, progress = $8, project_id = $9, updated_at = CURRENT_TIMESTAMP
         WHERE id = $10`,
        [body.title, body.description, body.status, body.priority, body.start_date, body.end_date, body.due_date, body.progress, body.project_id, id]
      );
      sendJSON(res, { message: 'Tâche mise à jour avec succès' });
    }
  }
};

// Serveur HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

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

  // Servir index.html pour le routing React
  if (pathname === '/' || !pathname.startsWith('/api')) {
    fs.readFile('./dist/index.html', (err, data) => {
      if (err) {
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

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur VertProjet démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  console.log(`💾 Base de données: ${process.env.DATABASE_URL ? 'PostgreSQL (Railway)' : 'Locale'}`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  pool.end();
  server.close(() => {
    console.log('✅ Serveur fermé');
    process.exit(0);
  });
});

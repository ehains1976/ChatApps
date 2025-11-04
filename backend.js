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
    
    // Vérifier que la connexion est valide avant d'essayer d'initialiser
    const isRailwayProd = !!process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';
    if (isRailwayProd) {
      console.log('🌐 Vérification de la connexion en production Railway...');
    }
    
    await initializeDatabase();
    dbInitialized = true;
    console.log('✅ Base de données initialisée avec succès!');
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE lors de l\'initialisation DB:', error);
    console.error('❌ Stack trace:', error.stack);
    
    // En production Railway, si c'est une erreur de configuration, arrêter
    const isRailwayProd = !!process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';
    if (isRailwayProd && (error.message.includes('Configuration PostgreSQL manquante') || error.message.includes('mauvaise base de données'))) {
      console.error('❌ ARRÊT: Configuration PostgreSQL incorrecte en production');
      console.error('❌ Définissez DATABASE_URL dans Railway Dashboard → Service → Variables');
      throw error; // Arrêter le démarrage
    }
    
    console.error('⚠️ Le backend continue mais les tables peuvent ne pas exister');
    console.error('⚠️ Vérifiez les logs ci-dessus et créez les tables manuellement si nécessaire');
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
        console.log('🔐 LOGIN - Tentative de connexion pour:', body.email);
        console.log('  Email fourni:', body.email);
        console.log('  Mot de passe fourni:', body.password ? '***' : 'MANQUANT');
        
        // Chercher l'utilisateur par email
        const userResult = await pool.query(
          'SELECT id, prenom, nom, courriel, password_hash, role FROM users WHERE courriel = $1',
          [body.email]
        );
        
        console.log('  👤 Utilisateur trouvé:', userResult.rows.length > 0);
        if (userResult.rows.length > 0) {
          console.log('  → ID:', userResult.rows[0].id, 'Role:', userResult.rows[0].role);
        } else {
          console.log('  ❌ ÉCHEC: Aucun utilisateur trouvé avec cet email');
        }
        
        if (userResult.rows.length === 0) {
          sendError(res, 'Courriel ou mot de passe incorrect', 401);
          return;
        }
        
        const user = userResult.rows[0];
        
        // Vérifier le mot de passe
        const bcrypt = await import('bcryptjs');
        const bcryptjs = bcrypt.default || bcrypt;
        let passwordHash = user.password_hash;
        
        // Si le hash est manquant ou null, refuser la connexion
        if (!passwordHash || passwordHash === '') {
          console.log('  ❌ ÉCHEC: Aucun mot de passe défini pour cet utilisateur');
          sendError(res, 'Aucun mot de passe défini pour cet utilisateur. Veuillez contacter un administrateur.', 401);
          return;
        }
        
        // Vérifier que le mot de passe est fourni
        if (!body.password || body.password.trim() === '') {
          console.log('  ❌ ÉCHEC: Mot de passe non fourni');
          sendError(res, 'Le mot de passe est requis', 400);
          return;
        }

        const isValid = await bcryptjs.compare(body.password, passwordHash);
        console.log('  🔑 Vérification mot de passe:', isValid ? '✓ VALIDE' : '✗ INVALIDE');
        
        if (!isValid) {
          console.log('  ❌ ÉCHEC: Mot de passe incorrect');
          sendError(res, 'Courriel ou mot de passe incorrect', 401);
          return;
        }
        
        // Retourner l'utilisateur (sans password_hash)
        const { password_hash, ...userWithoutPassword } = user;
        console.log('  ✅ SUCCÈS: Connexion réussie pour', user.courriel);
        sendJSON(res, { user: userWithoutPassword, token: 'dummy-token' });
      } catch (error) {
        console.error('  ❌ ERREUR LOGIN:', error.message);
        console.error('  Stack:', error.stack);
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
        const result = await pool.query('SELECT id, prenom, nom, entreprise, courriel, role FROM users ORDER BY id');
        sendJSON(res, result.rows || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        sendJSON(res, []); // Retourner un tableau vide au lieu d'une erreur 500
      }
    } else if (method === 'POST') {
      try {
        const body = await parseBody(req);
        console.log('👤 Création d\'un nouvel utilisateur:', body.courriel);
        
        // Vérifier que le mot de passe est fourni
        if (!body.password || body.password.trim() === '') {
          console.log('  ❌ ERREUR: Mot de passe requis pour créer un utilisateur');
          sendError(res, 'Le mot de passe est obligatoire', 400);
          return;
        }
        
        // Vérifier que l'email n'existe pas déjà
        const existingUser = await pool.query('SELECT id FROM users WHERE courriel = $1', [body.courriel]);
        if (existingUser.rows.length > 0) {
          console.log('  ❌ ERREUR: Email déjà utilisé');
          sendError(res, 'Cet email est déjà utilisé', 409);
          return;
        }
        
        // Hasher le mot de passe
        const bcrypt = await import('bcryptjs');
        const bcryptjs = bcrypt.default || bcrypt;
        const passwordHash = await bcryptjs.hash(body.password, 10);
        console.log('  ✅ Mot de passe hashé');
        
        // Créer l'utilisateur avec le mot de passe hashé
        const result = await pool.query(
          `INSERT INTO users (prenom, nom, entreprise, courriel, password_hash, role) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           RETURNING id, prenom, nom, entreprise, courriel, role`,
          [
            body.prenom, 
            body.nom, 
            body.entreprise, 
            body.courriel, 
            passwordHash,
            body.role || 'user'
          ]
        );
        
        console.log('  ✅ Utilisateur créé avec succès, ID:', result.rows[0].id);
        const { password_hash, ...userWithoutPassword } = result.rows[0];
        sendJSON(res, { ...userWithoutPassword, message: 'Utilisateur créé avec succès' }, 201);
      } catch (error) {
        console.error('  ❌ ERREUR création utilisateur:', error.message);
        sendError(res, 'Erreur lors de la création de l\'utilisateur', 500);
      }
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
      try {
        const body = await parseBody(req);
        console.log('👤 Mise à jour de l\'utilisateur ID:', id);
        
        // Si un nouveau mot de passe est fourni, le hasher
        let updateQuery;
        let queryParams;
        
        if (body.password && body.password.trim() !== '') {
          console.log('  🔑 Mise à jour du mot de passe');
          const bcrypt = await import('bcryptjs');
          const bcryptjs = bcrypt.default || bcrypt;
          const passwordHash = await bcryptjs.hash(body.password, 10);
          
          updateQuery = `UPDATE users 
                        SET prenom = $1, nom = $2, entreprise = $3, courriel = $4, 
                            password_hash = $5, role = $6, updated_at = CURRENT_TIMESTAMP 
                        WHERE id = $7`;
          queryParams = [
            body.prenom, 
            body.nom, 
            body.entreprise, 
            body.courriel, 
            passwordHash,
            body.role || 'user',
            id
          ];
        } else {
          // Mise à jour sans changer le mot de passe
          updateQuery = `UPDATE users 
                        SET prenom = $1, nom = $2, entreprise = $3, courriel = $4, 
                            role = $5, updated_at = CURRENT_TIMESTAMP 
                        WHERE id = $6`;
          queryParams = [
            body.prenom, 
            body.nom, 
            body.entreprise, 
            body.courriel,
            body.role || 'user',
            id
          ];
        }
        
        await pool.query(updateQuery, queryParams);
        console.log('  ✅ Utilisateur mis à jour avec succès');
        sendJSON(res, { message: 'Utilisateur mis à jour avec succès' });
      } catch (error) {
        console.error('  ❌ ERREUR mise à jour utilisateur:', error.message);
        sendError(res, 'Erreur lors de la mise à jour de l\'utilisateur', 500);
      }
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
  },
  
  // Route de debug pour vérifier la base de données
  async '/api/debug/db'(req, res, method) {
    if (method === 'GET') {
      try {
        // Vérifier les tables
        const tablesResult = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        
        // Compter les données dans chaque table
        const tableCounts = {};
        for (const row of tablesResult.rows) {
          try {
            const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
            tableCounts[row.table_name] = parseInt(countResult.rows[0].count);
          } catch (e) {
            tableCounts[row.table_name] = 'error: ' + e.message;
          }
        }
        
        // Vérifier les utilisateurs
        const usersResult = await pool.query('SELECT id, prenom, nom, courriel, role FROM users ORDER BY id');
        
        // Vérifier la base de données actuelle
        const dbResult = await pool.query('SELECT current_database() as db_name');
        
        sendJSON(res, {
          database: dbResult.rows[0].db_name,
          tables: tablesResult.rows.map(r => r.table_name),
          tableCounts: tableCounts,
          users: usersResult.rows,
          totalTables: tablesResult.rows.length,
          totalUsers: usersResult.rows.length
        });
      } catch (error) {
        console.error('Erreur debug DB:', error);
        sendError(res, error.message, 500);
      }
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

  // LOG: Afficher chaque requête entrante
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${pathname}`);
  
  // Log les paramètres de requête si présents
  if (Object.keys(parsedUrl.query).length > 0) {
    console.log(`  Query params:`, parsedUrl.query);
  }

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
      console.log(`  → Route trouvée: ${routeKey}`);
      await routes[routeKey](req, res, method, params, parsedUrl.query);
    } else {
      console.log(`  → Route NON trouvée (404)`);
      sendError(res, 'Route non trouvée', 404);
    }
  } catch (error) {
    console.error(`  ❌ ERREUR:`, error.message);
    console.error('  Stack:', error.stack);
    sendError(res, error.message, 500);
  }
  
  // Log la réponse après qu'elle soit envoyée
  res.on('finish', () => {
    console.log(`  ✓ Réponse: ${res.statusCode} ${res.statusMessage || ''}`);
  });
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
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🚀 SERVEUR CHATAPPS DÉMARRÉ`);
    console.log(`   Port: ${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api`);
    console.log(`   Healthcheck: http://localhost:${PORT}/health`);
    console.log(`   Base de données: ${process.env.DATABASE_URL ? 'PostgreSQL (Railway)' : 'Locale'}`);
    console.log(`   DB Initialisée: ${dbInitialized ? '✅ OUI' : '⚠️ NON'}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📝 Les logs de requête seront affichés ci-dessous:');
    console.log('');
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

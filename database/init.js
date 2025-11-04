// Script d'initialisation de la base de données
import pool from './connection.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool: PoolClass } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour créer la base de données si elle n'existe pas
async function ensureDatabaseExists() {
  try {
    // Extraire les infos de connexion depuis DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('⚠️ DATABASE_URL non trouvée, on suppose que la base existe');
      return;
    }

    // Parser l'URL pour extraire le nom de la base
    const url = new URL(dbUrl.replace('postgresql://', 'http://'));
    const targetDb = url.pathname.replace('/', '');
    
    if (!targetDb || targetDb === 'postgres') {
      console.log('⚠️ Base de données cible non spécifiée ou "postgres", on suppose qu\'elle existe');
      return;
    }

    console.log(`🔍 Vérification de l'existence de la base de données: ${targetDb}`);
    
    // Construire une URL pour se connecter à la base 'postgres' par défaut
    const defaultDbUrl = dbUrl.replace(`/${targetDb}`, '/postgres');
    
    // Créer un pool temporaire pour se connecter à 'postgres'
    const adminPool = new PoolClass({
      connectionString: defaultDbUrl,
      ssl: dbUrl.includes('railway') || dbUrl.includes('rlwy.net') ? { rejectUnauthorized: false } : false,
    });

    try {
      // Vérifier si la base existe
      const checkResult = await adminPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [targetDb]
      );

      if (checkResult.rows.length === 0) {
        console.log(`📦 Création de la base de données ${targetDb}...`);
        // Créer la base de données
        await adminPool.query(`CREATE DATABASE "${targetDb}"`);
        console.log(`✅ Base de données ${targetDb} créée avec succès!`);
      } else {
        console.log(`✅ Base de données ${targetDb} existe déjà`);
      }
    } finally {
      await adminPool.end();
    }
  } catch (error) {
    // Si on ne peut pas créer la base (peut-être qu'elle existe déjà ou permissions insuffisantes)
    console.warn('⚠️ Impossible de vérifier/créer la base de données:', error.message);
    console.warn('⚠️ On continue quand même, la base peut déjà exister');
  }
}

export async function initializeDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // S'assurer que la base de données existe
    await ensureDatabaseExists();
    
    // Test de connexion d'abord
    try {
      const testResult = await pool.query('SELECT NOW()');
      console.log('✅ Connexion PostgreSQL réussie:', testResult.rows[0]);
    } catch (connError) {
      console.error('❌ Erreur de connexion PostgreSQL:', connError.message);
      throw new Error(`Impossible de se connecter à PostgreSQL: ${connError.message}`);
    }
    
    // Lire et exécuter le schéma
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Fichier schema.sql introuvable: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Exécution du schéma SQL...');
    
    // Exécuter le schéma en une seule transaction
    await pool.query(schema);
    console.log('✅ Schéma SQL exécuté avec succès');
    
    // Créer les utilisateurs admin s'ils n'existent pas
    const adminUsers = [
      { 
        prenom: 'BZ', 
        nom: 'Inc', 
        entreprise: 'BZ Inc', 
        courriel: 'bzinc@bzinc.ca', 
        password: 'Jai.1.Mcd0',
        role: 'admin'
      },
      { 
        prenom: 'Vert', 
        nom: 'Dure', 
        entreprise: 'VertDure', 
        courriel: 'vertdure@vertdure.com', 
        password: 'Jai.du.Beau.Gaz0n',
        role: 'admin'
      }
    ];
    
    // S'assurer que les colonnes nécessaires existent
    // Ajouter milestone_id sur tasks si manquant pour lier une tâche à un jalon
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = 'milestone_id'
        ) THEN
          ALTER TABLE tasks 
            ADD COLUMN milestone_id INTEGER REFERENCES milestones(id) ON DELETE SET NULL;
          CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
        END IF;
      END$$;
    `);

    for (const user of adminUsers) {
      // Supporter l'ancien courriel bzinc@bzinc.com en le migrant vers .ca
      const possibleEmails = user.courriel === 'bzinc@bzinc.ca' ? ['bzinc@bzinc.ca', 'bzinc@bzinc.com'] : [user.courriel];

      const result = await pool.query(
        'SELECT id, courriel, password_hash FROM users WHERE courriel = ANY($1)',
        [possibleEmails]
      );

      const passwordHash = await bcrypt.hash(user.password, 10);

      if (result.rows.length === 0) {
        // Créer l'utilisateur
        await pool.query(
          `INSERT INTO users (prenom, nom, entreprise, courriel, password_hash, role) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.prenom, user.nom, user.entreprise, user.courriel, passwordHash, user.role]
        );
        console.log(`✅ Utilisateur admin créé: ${user.courriel}`);
      } else {
        const existing = result.rows[0];
        // Mettre à jour courriel s'il est ancien et/ou mot de passe si manquant
        const newEmail = user.courriel;
        const needsEmailUpdate = existing.courriel !== newEmail;
        const needsPasswordUpdate = !existing.password_hash || existing.password_hash.length < 20;

        if (needsEmailUpdate || needsPasswordUpdate) {
          await pool.query(
            `UPDATE users SET courriel = $1, password_hash = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
            [newEmail, needsPasswordUpdate ? passwordHash : existing.password_hash, user.role, existing.id]
          );
          console.log(`🔄 Utilisateur admin mis à jour: ${newEmail}`);
        }
      }
    }
    
    console.log('✅ Base de données initialisée avec succès!');
    
    // Vérifier que les tables existent
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📊 Tables créées:', tablesCheck.rows.map(r => r.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    console.error('❌ Détails:', error.message);
    if (error.stack) {
      console.error('❌ Stack:', error.stack);
    }
    throw error;
  }
}


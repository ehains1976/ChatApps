// Script d'initialisation de la base de données
import pool from './connection.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // Lire et exécuter le schéma
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    
    // Créer les utilisateurs admin s'ils n'existent pas
    const adminUsers = [
      { 
        prenom: 'BZ', 
        nom: 'Inc', 
        entreprise: 'BZ Inc', 
        courriel: 'bzinc@bzinc.com', 
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
    
    for (const user of adminUsers) {
      const result = await pool.query('SELECT id FROM users WHERE courriel = $1', [user.courriel]);
      
      if (result.rows.length === 0) {
        const passwordHash = await bcrypt.hash(user.password, 10);
        await pool.query(
          `INSERT INTO users (prenom, nom, entreprise, courriel, password_hash, role) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.prenom, user.nom, user.entreprise, user.courriel, passwordHash, user.role]
        );
        console.log(`✅ Utilisateur admin créé: ${user.courriel}`);
      }
    }
    
    console.log('✅ Base de données initialisée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
}


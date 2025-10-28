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
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
}


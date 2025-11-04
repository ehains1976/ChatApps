// Script pour créer l'utilisateur jmcaouette avec mot de passe
import pool from './database/connection.js';
import bcrypt from 'bcryptjs';

async function createUser() {
  try {
    console.log('🔄 Création de l\'utilisateur jmcaouette...');
    
    const email = 'jmcaouette';
    const password = 'Batmanjoker2025%%';
    
    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('✅ Mot de passe hashé');
    
    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO users (prenom, nom, entreprise, courriel, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (courriel) 
       DO UPDATE SET 
         password_hash = EXCLUDED.password_hash,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, prenom, nom, courriel, role`,
      ['JM', 'Caouette', 'ChatApps', email, passwordHash, 'user']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Utilisateur créé/mis à jour avec succès !');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.courriel}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Mot de passe: ${password} (hashé dans la BD)`);
    } else {
      console.log('⚠️ Utilisateur non créé');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createUser();


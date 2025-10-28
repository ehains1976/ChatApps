// Script pour fixer les utilisateurs dans la base de données Railway
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixUsers() {
  try {
    console.log('🔄 Fix users...');
    
    // Supprimer les doublons
    await pool.query("DELETE FROM users WHERE courriel = 'bzinc@bzinc.com'");
    console.log('✅ Supprimé bzinc@bzinc.com');
    
    // Créer les hash
    const hash1 = await bcrypt.hash('Jai.1.Mcd0', 10);
    const hash2 = await bcrypt.hash('Jai.du.Beau.Gaz0n', 10);
    
    // Fixer bzinc
    await pool.query(`
      UPDATE users 
      SET password_hash = $1,
          courriel = 'bzinc@bzinc.ca',
          role = 'admin',
          updated_at = CURRENT_TIMESTAMP
      WHERE courriel = 'bzinc@bzinc.ca'
    `, [hash1]);
    console.log('✅ Fixé bzinc@bzinc.ca');
    
    // Fixer vertdure
    await pool.query(`
      UPDATE users 
      SET password_hash = $1,
          role = 'admin',
          updated_at = CURRENT_TIMESTAMP
      WHERE courriel = 'vertdure@vertdure.com'
    `, [hash2]);
    console.log('✅ Fixé vertdure@vertdure.com');
    
    // Vérifier
    const result = await pool.query('SELECT id, prenom, nom, courriel, role FROM users ORDER BY id');
    console.log('\n📊 Utilisateurs dans la base:');
    result.rows.forEach(user => console.log(`  - ${user.courriel} (${user.role})`));
    
    pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixUsers();


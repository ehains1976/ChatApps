// Script pour tester la connexion directement
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testLogin() {
  try {
    console.log('🔄 Test de connexion...');
    
    // Test bzinc
    const result1 = await pool.query(
      'SELECT id, prenom, nom, courriel, password_hash, role FROM users WHERE courriel = $1',
      ['bzinc@bzinc.ca']
    );
    
    if (result1.rows.length > 0) {
      const user = result1.rows[0];
      console.log('✅ Utilisateur bzinc trouvé:', user.courriel);
      console.log('Password hash length:', user.password_hash ? user.password_hash.length : 'NULL');
      
      const isValid = await bcrypt.compare('Jai.1.Mcd0', user.password_hash);
      console.log('Password valid:', isValid);
    } else {
      console.log('❌ Utilisateur bzinc non trouvé');
    }
    
    // Test vertdure
    const result2 = await pool.query(
      'SELECT id, prenom, nom, courriel, password_hash, role FROM users WHERE courriel = $1',
      ['vertdure@vertdure.com']
    );
    
    if (result2.rows.length > 0) {
      const user = result2.rows[0];
      console.log('✅ Utilisateur vertdure trouvé:', user.courriel);
      console.log('Password hash length:', user.password_hash ? user.password_hash.length : 'NULL');
      
      const isValid = await bcrypt.compare('Jai.du.Beau.Gaz0n', user.password_hash);
      console.log('Password valid:', isValid);
    } else {
      console.log('❌ Utilisateur vertdure non trouvé');
    }
    
    pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testLogin();


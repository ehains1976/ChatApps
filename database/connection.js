// Connexion PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;

// Fonction pour réparer l'URL interne de Railway
function getConnectionString() {
  let url = process.env.DATABASE_URL;
  
  if (!url) {
    console.error('⚠️ DATABASE_URL non définie');
    return null;
  }
  
  console.log('🔌 Connexion à PostgreSQL:', url.replace(/:[^:@]+@/, ':****@')); // Masquer le mot de passe
  
  return url;
}

const pool = new Pool({
  connectionString: getConnectionString(),
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Test de connexion au démarrage
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

export default pool;


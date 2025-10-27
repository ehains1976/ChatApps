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
  
  // Si c'est une URL interne Railway, la convertir en URL publique
  if (url.includes('postgres.railway.internal') || url.includes('railway.internal')) {
    // Convertir l'URL interne en URL publique
    url = url.replace(/@postgres\.railway\.internal:\d+/, '@containers-us-west-136.railway.app:5432');
    console.log('📡 Conversion URL interne → externe');
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


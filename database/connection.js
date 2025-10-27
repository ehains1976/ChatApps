// Connexion PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;

// Fonction pour construire l'URL de connexion avec plusieurs méthodes
function getConnectionString() {
  // DEBUG: Afficher toutes les variables PostgreSQL disponibles
  const pgVars = Object.keys(process.env).filter(k => k.includes('PG') || k.includes('POSTGRES') || k.includes('DATABASE'));
  console.log('🔍 Variables PostgreSQL disponibles:', pgVars.join(', ') || 'AUCUNE');
  
  // Méthode 1: Railway variables automatiques (PG*) - PRIORITÉ
  if (process.env.PGHOST) {
    const host = process.env.PGHOST;
    const port = process.env.PGPORT || '5432';
    const database = process.env.PGDATABASE || 'railway';
    const user = process.env.PGUSER || 'postgres';
    const password = process.env.PGPASSWORD || '';
    
    const url = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    console.log('📡 Construction URL depuis variables PG* Railway');
    return url;
  }
  
  // Méthode 2: Variables individuelles Railway
  if (process.env.POSTGRES_HOST) {
    const host = process.env.POSTGRES_HOST;
    const port = process.env.POSTGRES_PORT || '5432';
    const database = process.env.POSTGRES_DB || process.env.POSTGRES_DATABASE || 'railway';
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || '';
    
    const url = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    console.log('📡 Construction URL depuis variables Railway individuelles');
    return url;
  }
  
  // Méthode 3: DATABASE_URL directe (IGNORER railway.internal)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('railway.internal')) {
    console.log('📡 Utilisation de DATABASE_URL (externe)');
    return process.env.DATABASE_URL;
  }
  
  // Méthode 4: RAILWAY_DATABASE_URL
  if (process.env.RAILWAY_DATABASE_URL) {
    console.log('📡 Utilisation de RAILWAY_DATABASE_URL');
    return process.env.RAILWAY_DATABASE_URL;
  }
  
  console.error('⚠️ Aucune variable de connexion PostgreSQL trouvée');
  console.error('DATABASE_URL actuelle contient railway.internal, ce qui ne fonctionne pas');
  return null;
}

const connectionString = getConnectionString();
console.log('🔌 Connexion à PostgreSQL:', connectionString ? connectionString.replace(/:[^:@]+@/, ':****@') : 'ERREUR');

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

// Test de connexion au démarrage
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

export default pool;


// Connexion PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;

// Fonction pour construire l'URL de connexion avec plusieurs méthodes
function getConnectionString() {
  // DEBUG: Afficher toutes les variables PostgreSQL disponibles
  const pgVars = Object.keys(process.env).filter(k => k.includes('PG') || k.includes('POSTGRES') || k.includes('DATABASE'));
  console.log('🔍 Variables PostgreSQL disponibles:', pgVars.join(', ') || 'AUCUNE');
  
  // Méthode 1: DATABASE_URL directe (PRIORITÉ pour développement local et production)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('railway.internal')) {
    console.log('📡 Utilisation de DATABASE_URL');
    return process.env.DATABASE_URL;
  }
  
  // Méthode 2: Railway variables automatiques (PG*) - pour Railway
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
  
  // Méthode 3: Variables individuelles (pour développement local ou Railway)
  if (process.env.POSTGRES_HOST) {
    const host = process.env.POSTGRES_HOST;
    const port = process.env.POSTGRES_PORT || '5432';
    const database = process.env.POSTGRES_DB || process.env.POSTGRES_DATABASE || 'vertprojet_bd';
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || '';
    
    const url = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    console.log('📡 Construction URL depuis variables individuelles');
    return url;
  }
  
  // Méthode 4: RAILWAY_DATABASE_URL
  if (process.env.RAILWAY_DATABASE_URL) {
    console.log('📡 Utilisation de RAILWAY_DATABASE_URL');
    return process.env.RAILWAY_DATABASE_URL;
  }
  
  // Méthode 5: Valeur par défaut pour développement local (si PostgreSQL est sur localhost)
  const defaultUrl = 'postgresql://postgres:postgres@localhost:5432/vertprojet_bd';
  console.warn('⚠️ Aucune variable de connexion PostgreSQL trouvée');
  console.warn('⚠️ Tentative avec la configuration par défaut locale:', defaultUrl.replace(/:[^:@]+@/, ':****@'));
  console.warn('⚠️ Pour utiliser une autre configuration, créez un fichier .env avec DATABASE_URL');
  return defaultUrl;
}

const connectionString = getConnectionString();
console.log('🔌 Connexion à PostgreSQL:', connectionString ? connectionString.replace(/:[^:@]+@/, ':****@') : 'ERREUR');

// Déterminer si on est en production (Railway) ou développement local
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
const isLocalhost = connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'));

const pool = new Pool({
  connectionString: connectionString,
  // SSL seulement en production (Railway), pas en local
  ssl: connectionString && !isLocalhost ? { rejectUnauthorized: false } : false,
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


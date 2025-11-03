// Connexion PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;

// Fonction pour construire l'URL de connexion avec plusieurs méthodes
function getConnectionString() {
  // DEBUG: Afficher toutes les variables PostgreSQL disponibles
  const pgVars = Object.keys(process.env).filter(k => k.includes('PG') || k.includes('POSTGRES') || k.includes('DATABASE'));
  console.log('🔍 Variables PostgreSQL disponibles:', pgVars.join(', ') || 'AUCUNE');
  console.log('🔍 RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT || 'NON');
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV || 'NON');
  
  // Afficher toutes les variables Railway pour debug
  const railwayVars = Object.keys(process.env).filter(k => k.includes('RAILWAY'));
  console.log('🔍 Variables Railway:', railwayVars.join(', ') || 'AUCUNE');
  
  // Afficher DATABASE_URL si elle existe (masquée)
  if (process.env.DATABASE_URL) {
    const masked = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log('🔍 DATABASE_URL trouvée:', masked.substring(0, 80) + '...');
  } else {
    console.log('❌ DATABASE_URL ABSENTE dans process.env');
  }
  
  // En production Railway, accepter toutes les DATABASE_URL
  // Détecter Railway via RAILWAY_ENVIRONMENT (plus fiable que NODE_ENV)
  const isRailwayProduction = !!process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';
  
  if (isRailwayProduction) {
    console.log('🌐 Mode Railway détecté');
  }
  
  // Méthode 1: DATABASE_URL directe (PRIORITÉ pour développement local et production)
  if (process.env.DATABASE_URL) {
    console.log('📡 DATABASE_URL trouvée, longueur:', process.env.DATABASE_URL.length);
    // En production Railway, accepter toutes les DATABASE_URL
    if (isRailwayProduction) {
      console.log('📡 Utilisation de DATABASE_URL (Railway production)');
      return process.env.DATABASE_URL;
    }
    // En local, exclure railway.internal
    if (!process.env.DATABASE_URL.includes('railway.internal')) {
      console.log('📡 Utilisation de DATABASE_URL (local)');
      return process.env.DATABASE_URL;
    }
  }
  
  // Méthode 2: Railway variables automatiques (PG*) - pour Railway
  if (process.env.PGHOST) {
    const host = process.env.PGHOST;
    const port = process.env.PGPORT || '5432';
    // Forcer ChatApps_BD au lieu de 'railway' par défaut
    const database = process.env.PGDATABASE || 'ChatApps_BD';
    const user = process.env.PGUSER || 'postgres';
    const password = process.env.PGPASSWORD || '';
    
    const url = `postgresql://${user}:${password}@${host}:${port}/${database}`;
    console.log('📡 Construction URL depuis variables PG* Railway');
    console.log('📡 Base de données:', database);
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
  // En production Railway, ne JAMAIS utiliser cette valeur par défaut
  console.log('🔍 Vérification finale: isRailwayProduction =', isRailwayProduction);
  console.log('🔍 RAILWAY_ENVIRONMENT value:', process.env.RAILWAY_ENVIRONMENT);
  console.log('🔍 NODE_ENV value:', process.env.NODE_ENV);
  
  if (isRailwayProduction) {
    console.error('❌ ERREUR CRITIQUE: Aucune variable de connexion PostgreSQL trouvée en production Railway!');
    console.error('❌ Variables disponibles:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PG') || k.includes('RAILWAY')).join(', ') || 'AUCUNE');
    console.error('❌ Vérifiez que DATABASE_URL ou PGHOST/PGUSER/etc. sont définies dans Railway');
    console.error('❌ Allez dans Railway Dashboard → Service → Variables → Ajoutez DATABASE_URL');
    console.error('❌ Valeur DATABASE_URL requise: postgresql://postgres:XEdudbwfBeasNUKlupcKYcCHbGuTNrAL@centerbeam.proxy.rlwy.net:58257/ChatApps_BD');
    throw new Error('Configuration PostgreSQL manquante en production Railway. Définissez DATABASE_URL dans Railway.');
  }
  
  const defaultUrl = 'postgresql://postgres:postgres@localhost:5432/vertprojet_bd';
  console.warn('⚠️ Aucune variable de connexion PostgreSQL trouvée');
  console.warn('⚠️ Tentative avec la configuration par défaut locale:', defaultUrl.replace(/:[^:@]+@/, ':****@'));
  console.warn('⚠️ Pour utiliser une autre configuration, créez un fichier .env avec DATABASE_URL');
  return defaultUrl;
}

let connectionString;
try {
  connectionString = getConnectionString();
} catch (error) {
  // En production Railway, ne pas continuer sans connexion
  const isRailwayProd = !!process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';
  console.log('🔍 Erreur lors de getConnectionString(), isRailwayProd =', isRailwayProd);
  
  if (isRailwayProd) {
    console.error('❌ ERREUR FATALE: Impossible de construire la connexion PostgreSQL');
    console.error('❌ L\'application ne peut pas démarrer sans configuration DB valide');
    throw error; // Relancer l'erreur pour arrêter le démarrage
  }
  // En local, utiliser la valeur par défaut
  console.warn('⚠️ Utilisation de la valeur par défaut locale');
  connectionString = 'postgresql://postgres:postgres@localhost:5432/vertprojet_bd';
}

// Extraire le nom de la base de données de l'URL
let dbName = 'INCONNU';
if (connectionString) {
  try {
    const url = new URL(connectionString.replace('postgresql://', 'http://'));
    dbName = url.pathname.replace('/', '');
  } catch (e) {
    // Fallback: extraire manuellement
    const match = connectionString.match(/\/([^\/\?]+)(\?|$)/);
    if (match) dbName = match[1];
  }
}

console.log('🔌 Connexion à PostgreSQL:', connectionString ? connectionString.replace(/:[^:@]+@/, ':****@') : 'ERREUR');
console.log('📊 Base de données cible:', dbName);

// Vérifier que c'est bien ChatApps_BD en production Railway
const isRailwayProd = !!process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';
if (isRailwayProd) {
  if (dbName !== 'ChatApps_BD' && dbName !== 'INCONNU') {
    console.error('❌ ERREUR: Connexion à', dbName, 'au lieu de ChatApps_BD');
    console.error('❌ DATABASE_URL doit pointer vers ChatApps_BD');
    throw new Error(`Connexion à la mauvaise base de données: ${dbName}. Attendu: ChatApps_BD`);
  } else if (dbName === 'ChatApps_BD') {
    console.log('✅ Confirmation: Connexion à ChatApps_BD');
  }
}

// Déterminer si on est en production (Railway) ou développement local
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


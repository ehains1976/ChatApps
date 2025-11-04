// Script pour tester la connexion PostgreSQL depuis l'extérieur
// Utilise ce script pour vérifier que tu peux te connecter à Railway PostgreSQL

import pkg from 'pg';
const { Pool } = pkg;

// ⚠️ REMPLACE ces valeurs par celles de Railway
// Trouve-les dans Railway Dashboard → Postgres → Variables
const config = {
  host: process.env.PGHOST || 'nozomi.proxy.rlwy.net', // Host Railway
  port: process.env.PGPORT || 37174, // Port Railway
  database: process.env.PGDATABASE || 'ChatApps_BD', // Base de données Railway
  user: process.env.PGUSER || 'postgres', // User PostgreSQL
  password: process.env.PGPASSWORD || 'zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt', // Password Railway
  ssl: {
    rejectUnauthorized: false // Requis pour Railway
  }
};

// Ou utilise directement DATABASE_URL
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

console.log('🔌 Test de connexion PostgreSQL externe...');
console.log('📍 Host:', config.host);
console.log('📍 Port:', config.port);
console.log('📍 Database:', config.database);
console.log('📍 User:', config.user);
console.log('');

const pool = new Pool({
  connectionString: connectionString,
  ssl: config.ssl
});

async function testConnection() {
  try {
    console.log('⏳ Tentative de connexion...');
    
    // Test 1: Connexion basique
    const client = await pool.connect();
    console.log('✅ Connexion réussie!');
    
    // Test 2: Vérifier la version PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('📊 Version PostgreSQL:', versionResult.rows[0].version.split(' ')[0] + ' ' + versionResult.rows[0].version.split(' ')[1]);
    
    // Test 3: Lister les tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('📋 Tables trouvées:', tablesResult.rows.length);
    if (tablesResult.rows.length > 0) {
      console.log('   -', tablesResult.rows.map(r => r.table_name).join(', '));
    } else {
      console.log('   ⚠️ Aucune table trouvée (la base de données est vide)');
    }
    
    // Test 4: Vérifier les utilisateurs (si la table existe)
    try {
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      console.log('👤 Utilisateurs dans la table users:', usersResult.rows[0].count);
    } catch (err) {
      console.log('⚠️ Table users n\'existe pas encore');
    }
    
    // Test 5: Vérifier les projets (si la table existe)
    try {
      const projectsResult = await client.query('SELECT COUNT(*) as count FROM projects');
      console.log('📁 Projets dans la table projects:', projectsResult.rows[0].count);
    } catch (err) {
      console.log('⚠️ Table projects n\'existe pas encore');
    }
    
    client.release();
    
    console.log('');
    console.log('✅ Tous les tests sont passés!');
    console.log('💡 Tu peux maintenant utiliser un outil externe (pgAdmin, DBeaver) avec ces informations');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ERREUR DE CONNEXION:');
    console.error('   Message:', error.message);
    console.error('');
    console.error('🔍 Vérifications à faire:');
    console.error('   1. Les informations de connexion sont-elles correctes?');
    console.error('   2. Le service PostgreSQL est-il démarré dans Railway?');
    console.error('   3. Le port est-il accessible depuis l\'extérieur?');
    console.error('   4. SSL est-il activé? (requis pour Railway)');
    console.error('');
    console.error('💡 Consulte CONNEXION_EXTERIEURE_BD.md pour plus d\'aide');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();


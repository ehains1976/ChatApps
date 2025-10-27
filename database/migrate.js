// Script de migration pour créer la base de données
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/Vertprojet_bd',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function migrate() {
  try {
    console.log('🔄 Démarrage de la migration...');
    
    // Lire le fichier schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Exécuter le schéma
    await pool.query(schema);
    
    console.log('✅ Migration terminée avec succès!');
    
    // Vérifier les tables créées
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Tables créées:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Vérifier les utilisateurs admin
    const users = await pool.query('SELECT * FROM users WHERE role = $1', ['admin']);
    console.log(`\n👥 Utilisateurs admin créés: ${users.rows.length}`);
    users.rows.forEach(user => {
      console.log(`  - ${user.courriel}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrate();


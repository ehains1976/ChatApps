// Script pour créer les tables manuellement
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function createTables() {
  try {
    console.log('🔄 Création des tables...');
    
    // Lire le schéma SQL
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Exécuter le schéma
    await pool.query(schema);
    console.log('✅ Tables créées!');
    
    // Créer les utilisateurs admin
    const hash1 = await bcrypt.hash('Jai.1.Mcd0', 10);
    const hash2 = await bcrypt.hash('Jai.du.Beau.Gaz0n', 10);
    
    await pool.query(`
      INSERT INTO users (prenom, nom, entreprise, courriel, password_hash, role) VALUES
      ('BZ', 'Inc', 'BZ Inc', 'bzinc@bzinc.com', $1, 'admin'),
      ('Vert', 'Dure', 'VertDure', 'vertdure@vertdure.com', $2, 'admin')
      ON CONFLICT (courriel) DO NOTHING
    `, [hash1, hash2]);
    
    console.log('✅ Utilisateurs admin créés!');
    console.log('   bzinc@bzinc.com / Jai.1.Mcd0');
    console.log('   vertdure@vertdure.com / Jai.du.Beau.Gaz0n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTables();


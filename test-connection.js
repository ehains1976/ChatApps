// Script de test de connexion PostgreSQL
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur:', err);
    process.exit(1);
  }
  console.log('✅ Connecté à PostgreSQL:', res.rows[0]);
  pool.end();
});


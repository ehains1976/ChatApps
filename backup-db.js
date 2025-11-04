// Script Node.js pour sauvegarder la base de données PostgreSQL
// Usage: node backup-db.js

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DB_URL = process.env.DATABASE_URL || 
  'postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require';
const BACKUP_DIR = path.join(__dirname, 'backups');
const DATE = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19).replace('T', '_');
const BACKUP_FILE = path.join(BACKUP_DIR, `backup_${DATE}.sql.gz`);
const KEEP_BACKUPS = 10; // Nombre de backups à conserver

async function createBackup() {
  try {
    console.log('📦 Création du backup de la base de données...');
    console.log(`   Date: ${new Date().toLocaleString()}`);
    console.log(`   Fichier: ${BACKUP_FILE}`);
    
    // Créer le dossier backups s'il n'existe pas
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log(`   📁 Dossier créé: ${BACKUP_DIR}`);
    }
    
    // Vérifier que pg_dump est disponible
    try {
      await execAsync('which pg_dump');
    } catch (error) {
      console.error('❌ Erreur: pg_dump n\'est pas installé ou pas dans le PATH');
      console.error('   Installe PostgreSQL client tools pour utiliser pg_dump');
      console.error('   Windows: https://www.postgresql.org/download/windows/');
      console.error('   macOS: brew install postgresql');
      console.error('   Linux: sudo apt-get install postgresql-client');
      process.exit(1);
    }
    
    // Créer le backup
    console.log('   ⏳ Sauvegarde en cours...');
    const { stdout, stderr } = await execAsync(
      `pg_dump "${DB_URL}" | gzip > "${BACKUP_FILE}"`
    );
    
    if (stderr && !stderr.includes('WARNING')) {
      console.warn('   ⚠️ Avertissements:', stderr);
    }
    
    // Vérifier que le fichier a été créé et n'est pas vide
    if (fs.existsSync(BACKUP_FILE)) {
      const stats = fs.statSync(BACKUP_FILE);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      if (stats.size > 0) {
        console.log('✅ Backup créé avec succès !');
        console.log(`   Fichier: ${BACKUP_FILE}`);
        console.log(`   Taille: ${sizeMB} MB`);
        
        // Nettoyer les anciens backups
        await cleanupOldBackups();
        
        console.log('✅ Backup terminé !');
        process.exit(0);
      } else {
        console.error('❌ Erreur: Le fichier de backup est vide');
        fs.unlinkSync(BACKUP_FILE);
        process.exit(1);
      }
    } else {
      console.error('❌ Erreur: Le fichier de backup n\'a pas été créé');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création du backup:');
    console.error('   ', error.message);
    if (error.stderr) {
      console.error('   Stderr:', error.stderr);
    }
    process.exit(1);
  }
}

async function cleanupOldBackups() {
  try {
    console.log(`🧹 Nettoyage des anciens backups (garde les ${KEEP_BACKUPS} derniers)...`);
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_') && file.endsWith('.sql.gz'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Plus récent en premier
    
    if (files.length > KEEP_BACKUPS) {
      const filesToDelete = files.slice(KEEP_BACKUPS);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`   🗑️  Supprimé: ${file.name}`);
      }
      console.log(`   ✅ ${filesToDelete.length} ancien(s) backup(s) supprimé(s)`);
    } else {
      console.log(`   ℹ️  ${files.length} backup(s) trouvé(s), aucun nettoyage nécessaire`);
    }
  } catch (error) {
    console.warn('   ⚠️  Erreur lors du nettoyage:', error.message);
  }
}

// Lancer le backup
createBackup();


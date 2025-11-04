// Script pour configurer automatiquement les variables Railway
// Usage: node railway-config.js

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration de la base de données
const DATABASE_URL = 'postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD';

// Variables à configurer
const variables = {
  'DATABASE_URL': DATABASE_URL,
  'NODE_ENV': 'production',
  'RAILWAY_ENVIRONMENT': 'production'
};

async function checkRailwayCLI() {
  try {
    await execAsync('railway --version');
    return true;
  } catch (error) {
    console.error('❌ Railway CLI n\'est pas installé');
    console.error('   Installe-le avec: npm install -g @railway/cli');
    console.error('   Ou: https://docs.railway.app/develop/cli');
    return false;
  }
}

async function setVariable(key, value) {
  try {
    console.log(`📝 Configuration de ${key}...`);
    const { stdout, stderr } = await execAsync(`railway variables set ${key}="${value}"`);
    if (stderr && !stderr.includes('WARNING')) {
      console.warn(`   ⚠️  ${stderr}`);
    }
    console.log(`   ✅ ${key} configuré`);
    return true;
  } catch (error) {
    console.error(`   ❌ Erreur pour ${key}:`, error.message);
    return false;
  }
}

async function configureRailway() {
  console.log('🚀 Configuration automatique de Railway...\n');
  
  // Vérifier que Railway CLI est installé
  if (!(await checkRailwayCLI())) {
    process.exit(1);
  }
  
  console.log('✅ Railway CLI détecté\n');
  
  // Vérifier que l'utilisateur est connecté
  try {
    await execAsync('railway whoami');
  } catch (error) {
    console.error('❌ Tu n\'es pas connecté à Railway');
    console.error('   Connecte-toi avec: railway login');
    process.exit(1);
  }
  
  console.log('✅ Connecté à Railway\n');
  console.log('📋 Configuration des variables d\'environnement:\n');
  
  let successCount = 0;
  let failCount = 0;
  
  // Configurer chaque variable
  for (const [key, value] of Object.entries(variables)) {
    const success = await setVariable(key, value);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // Ligne vide entre chaque variable
  }
  
  // Résumé
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Variables configurées avec succès: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Variables en erreur: ${failCount}`);
  }
  console.log('═══════════════════════════════════════════════════════\n');
  
  if (failCount === 0) {
    console.log('🎉 Configuration terminée !');
    console.log('   Railway va redémarrer automatiquement avec les nouvelles variables.');
  } else {
    console.log('⚠️  Certaines variables n\'ont pas pu être configurées.');
    console.log('   Vérifie manuellement dans Railway Dashboard → Service → Variables');
  }
}

// Lancer la configuration
configureRailway();


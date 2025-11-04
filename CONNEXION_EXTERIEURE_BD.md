# Guide : Connexion à PostgreSQL depuis l'extérieur

## 🎯 Pourquoi se connecter depuis l'extérieur ?

C'est **recommandé** si tu as des problèmes de connexion avec Railway car :
- ✅ Tu peux voir directement ce qui se passe dans la base de données
- ✅ Tu peux créer/réparer les tables manuellement
- ✅ Tu peux vérifier les utilisateurs et leurs mots de passe
- ✅ Plus facile à déboguer que via l'application

## 📋 Étape 1 : Obtenir les informations de connexion

### Depuis Railway Dashboard

1. Va sur **Railway Dashboard** → https://railway.app
2. Ouvre ton projet **ChatApps_BD**
3. Clique sur le service **Postgres** (avec l'icône éléphant 🐘)
4. Va dans l'onglet **Variables** (ou **Settings** → **Variables**)
5. Cherche **DATABASE_URL** ou ces variables :
   - `PGHOST` (ou `POSTGRES_HOST`)
   - `PGPORT` (ou `POSTGRES_PORT`)
   - `PGDATABASE` (ou `POSTGRES_DB`)
   - `PGUSER` (ou `POSTGRES_USER`)
   - `PGPASSWORD` (ou `POSTGRES_PASSWORD`)

### DATABASE_URL actuelle
```
postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD
```

Décomposé :
- **Host** : `nozomi.proxy.rlwy.net`
- **Port** : `37174`
- **Database** : `ChatApps_BD`
- **User** : `postgres`
- **Password** : `zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt`

## 🔧 Étape 2 : Choisir un outil de connexion

### Option A : pgAdmin (Recommandé - Interface graphique)

1. **Télécharge pgAdmin** : https://www.pgadmin.org/download/
2. **Installe-le** sur ton ordinateur
3. **Ouvre pgAdmin**
4. **Clic droit sur "Servers"** → **Create** → **Server**
5. **Onglet "General"** :
   - Name : `ChatApps Railway`
6. **Onglet "Connection"** :
   - Host name/address : `nozomi.proxy.rlwy.net` (ou la valeur de PGHOST)
   - Port : `37174` (ou la valeur de PGPORT)
   - Maintenance database : `ChatApps_BD` (ou la valeur de PGDATABASE)
   - Username : `postgres` (ou la valeur de PGUSER)
   - Password : `zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt` (ou la valeur de PGPASSWORD)
   - ✅ Coche "Save password"
7. **Onglet "SSL"** :
   - SSL mode : `Require`
8. **Clique "Save"**

### Option B : DBeaver (Gratuit, multiplateforme)

1. **Télécharge DBeaver** : https://dbeaver.io/download/
2. **Installe-le**
3. **Ouvre DBeaver**
4. **Nouvelle connexion** → **PostgreSQL**
5. **Remplis les champs** :
   - Host : `nozomi.proxy.rlwy.net`
   - Port : `37174`
   - Database : `ChatApps_BD`
   - Username : `postgres`
   - Password : `zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt`
   - ✅ Coche "Show all databases"
6. **Onglet "SSL"** :
   - SSL mode : `require`
7. **Test Connection** → **Finish**

### Option C : psql (Ligne de commande)

1. **Installe PostgreSQL** sur ton ordinateur (ou utilise Railway CLI)
2. **Ouvre un terminal**
3. **Connecte-toi** :
   ```bash
   psql "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require"
   
   # Ou avec la variable d'environnement :
   PGPASSWORD=zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt psql -h nozomi.proxy.rlwy.net -U postgres -p 37174 -d ChatApps_BD
   ```

### Option D : Railway CLI (Le plus simple)

1. **Installe Railway CLI** : https://docs.railway.app/develop/cli
2. **Ouvre un terminal** dans ton projet
3. **Connecte-toi** :
   ```bash
   railway connect Postgres
   ```
   
   **Note** : La commande est `railway connect Postgres` (avec P majuscule)
4. **Une fois connecté**, tu peux exécuter des commandes SQL :
   ```sql
   \dt  -- Liste les tables
   \d users  -- Détails de la table users
   SELECT * FROM users;  -- Voir les utilisateurs
   ```

## 📌 Informations de connexion actuelles

**DATABASE_URL complète :**
```
postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD
```

**Commandes rapides :**

```bash
# Railway CLI (le plus simple)
railway connect Postgres

# psql avec variable d'environnement
PGPASSWORD=zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt psql -h nozomi.proxy.rlwy.net -U postgres -p 37174 -d ChatApps_BD

# psql avec URL complète
psql "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require"
```

## ✅ Étape 3 : Vérifier la connexion

Une fois connecté, exécute ce SQL pour vérifier que tout fonctionne :

```sql
-- Lister toutes les tables
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Voir les utilisateurs
SELECT id, prenom, nom, courriel, role, created_at 
FROM users 
ORDER BY id;
```

## 🔧 Étape 4 : Créer/Réparer les tables si nécessaire

Si les tables n'existent pas ou sont corrompues, exécute le script `create-tables-railway.sql` :

1. **Ouvre le fichier** `create-tables-railway.sql` dans ton projet
2. **Copie tout le contenu**
3. **Colle-le dans l'éditeur SQL** de ton outil (pgAdmin, DBeaver, etc.)
4. **Exécute le script**

## 🔍 Étape 5 : Vérifier les utilisateurs et mots de passe

### Voir tous les utilisateurs
```sql
SELECT id, prenom, nom, courriel, role, 
       CASE WHEN password_hash IS NULL THEN '❌ PAS DE HASH' 
            WHEN password_hash = '' THEN '❌ HASH VIDE' 
            ELSE '✅ OK' END as password_status,
       created_at 
FROM users 
ORDER BY id;
```

### Vérifier un utilisateur spécifique
```sql
SELECT * FROM users WHERE courriel = 'bzinc@bzinc.ca';
```

### Réinitialiser un mot de passe (si nécessaire)
```sql
-- Note: Tu dois d'abord générer le hash avec bcrypt
-- Utilise le script generate-passwords.js ou generate-admin-hashes.js
UPDATE users 
SET password_hash = '$2a$10$...' -- Remplace par le hash généré
WHERE courriel = 'bzinc@bzinc.ca';
```

## 🚨 Problèmes courants

### Erreur : "SSL connection required"
- **Solution** : Active SSL dans ton outil (SSL mode = `require` ou `require`)

### Erreur : "Connection timeout"
- **Solution** : Vérifie que Railway expose bien le port externe (Railway le fait automatiquement)

### Erreur : "Database does not exist"
- **Solution** : Vérifie que tu utilises `ChatApps_BD` comme nom de base de données

### Erreur : "Password authentication failed"
- **Solution** : Vérifie le mot de passe dans Railway → Postgres → Variables → `PGPASSWORD`

## 📝 Commandes SQL utiles

### Lister toutes les tables avec leur nombre de lignes
```sql
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'milestones', COUNT(*) FROM milestones
UNION ALL
SELECT 'task_responsibles', COUNT(*) FROM task_responsibles;
```

### Voir la structure d'une table
```sql
\d users  -- Dans psql
-- Ou
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

### Supprimer et recréer une table (⚠️ ATTENTION : perte de données)
```sql
DROP TABLE IF EXISTS users CASCADE;
-- Puis exécute le CREATE TABLE du script create-tables-railway.sql
```

## 🎯 Avantages de cette approche

- ✅ **Contrôle total** : Tu vois exactement ce qui se passe dans la BD
- ✅ **Debugging facile** : Tu peux tester tes requêtes SQL directement
- ✅ **Backup/Restore** : Tu peux exporter/importer des données facilement
- ✅ **Sauvegarde** : Tu peux créer des backups avant de faire des changements

## 📚 Ressources

- **pgAdmin** : https://www.pgadmin.org/docs/
- **DBeaver** : https://dbeaver.io/docs/
- **Railway CLI** : https://docs.railway.app/develop/cli
- **PostgreSQL Docs** : https://www.postgresql.org/docs/


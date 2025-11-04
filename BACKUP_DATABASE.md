# Guide : Sauvegarder (Backup) la base de données PostgreSQL

## 🎯 Méthodes de sauvegarde

Il existe plusieurs façons de sauvegarder ta base de données PostgreSQL depuis Railway.

## 📋 Méthode 1 : Via Railway CLI (La plus simple)

### Sauvegarder toute la base de données

1. **Ouvre un terminal** dans ton projet
2. **Connecte-toi à Railway** :
   ```bash
   railway login
   ```
3. **Sauvegarde la base de données** :
   ```bash
   railway connect Postgres --command "pg_dump -U postgres -d ChatApps_BD > backup.sql"
   ```
   
   Ou plus simple avec pg_dump directement :
   ```bash
   railway connect Postgres
   ```
   
   Puis une fois connecté :
   ```bash
   pg_dump -U postgres -d ChatApps_BD > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

### Avec les credentials directs

```bash
PGPASSWORD=zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt pg_dump -h nozomi.proxy.rlwy.net -U postgres -p 37174 -d ChatApps_BD > backup.sql
```

## 📋 Méthode 2 : Via psql (Ligne de commande)

### Option A : Sauvegarde complète (format SQL)

```bash
# Avec URL complète
pg_dump "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" > backup.sql

# Ou avec variables d'environnement
PGPASSWORD=zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt pg_dump -h nozomi.proxy.rlwy.net -U postgres -p 37174 -d ChatApps_BD > backup.sql
```

### Option B : Sauvegarde compressée (plus petite)

```bash
pg_dump "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Option C : Sauvegarde format personnalisé (plus rapide pour restaurer)

```bash
pg_dump -Fc "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" > backup_$(date +%Y%m%d_%H%M%S).dump
```

## 📋 Méthode 3 : Via pgAdmin (Interface graphique)

1. **Ouvre pgAdmin** et connecte-toi à Railway (voir `CONNEXION_EXTERIEURE_BD.md`)
2. **Clic droit sur la base de données** `ChatApps_BD`
3. **Backup...**
4. **Configure** :
   - Filename : `backup_20240115.sql` (ou avec date)
   - Format : `Plain` (pour SQL) ou `Custom` (pour .dump)
   - Encoding : `UTF8`
5. **Clique sur "Backup"**

## 📋 Méthode 4 : Via DBeaver (Interface graphique)

1. **Ouvre DBeaver** et connecte-toi à Railway
2. **Clic droit sur la base de données** `ChatApps_BD`
3. **Tools** → **Export Data**
4. **Choisis le format** (SQL, CSV, etc.)
5. **Configure et exporte**

## 📋 Méthode 5 : Sauvegarder seulement certaines tables

Si tu veux sauvegarder seulement certaines tables :

```bash
# Sauvegarder seulement la table users
pg_dump "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" -t users > backup_users.sql

# Sauvegarder plusieurs tables
pg_dump "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" -t users -t projects > backup_tables.sql
```

## 📋 Méthode 6 : Script automatique de backup

Crée un fichier `backup-db.sh` :

```bash
#!/bin/bash

# Configuration
DB_URL="postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# Créer le dossier backups s'il n'existe pas
mkdir -p "$BACKUP_DIR"

# Faire le backup
echo "📦 Création du backup..."
pg_dump "$DB_URL" | gzip > "$BACKUP_FILE"

# Vérifier la taille
SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "✅ Backup créé : $BACKUP_FILE ($SIZE)"

# Garder seulement les 10 derniers backups
echo "🧹 Nettoyage des anciens backups..."
ls -t "$BACKUP_DIR"/backup_*.sql.gz | tail -n +11 | xargs rm -f

echo "✅ Backup terminé !"
```

Utilise-le avec :
```bash
chmod +x backup-db.sh
./backup-db.sh
```

## 🔄 Restaurer un backup

### Depuis un fichier SQL

```bash
# Via psql
psql "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" < backup.sql

# Ou via Railway CLI
railway connect Postgres
psql -U postgres -d ChatApps_BD < backup.sql
```

### Depuis un fichier compressé

```bash
gunzip < backup.sql.gz | psql "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require"
```

### Depuis un fichier .dump (format personnalisé)

```bash
pg_restore -d "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" backup.dump
```

## 📊 Types de sauvegardes

### 1. Plain SQL (`.sql`)
- **Format** : Texte SQL lisible
- **Avantages** : Facile à lire, modifier, et restaurer
- **Inconvénients** : Plus volumineux
- **Usage** : Pour les petites bases, pour la lisibilité

### 2. Compressed (`.sql.gz`)
- **Format** : SQL compressé
- **Avantages** : Plus petit, toujours lisible après décompression
- **Inconvénients** : Doit être décompressé avant restauration
- **Usage** : Pour économiser de l'espace

### 3. Custom format (`.dump`)
- **Format** : Binaire PostgreSQL
- **Avantages** : Plus rapide à restaurer, peut restaurer table par table
- **Inconvénients** : Non lisible, nécessite pg_restore
- **Usage** : Pour les grandes bases, restaurations fréquentes

## ⚙️ Options utiles de pg_dump

```bash
# Sauvegarder seulement les données (sans la structure)
pg_dump --data-only "DATABASE_URL" > data_only.sql

# Sauvegarder seulement la structure (sans les données)
pg_dump --schema-only "DATABASE_URL" > structure_only.sql

# Inclure les commandes pour créer la base si elle n'existe pas
pg_dump --create "DATABASE_URL" > backup_with_create.sql

# Exclure certaines tables
pg_dump --exclude-table=users "DATABASE_URL" > backup_no_users.sql
```

## 📅 Planification automatique (cron job)

Pour faire des backups automatiques tous les jours :

```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour un backup quotidien à 2h du matin
0 2 * * * /chemin/vers/backup-db.sh >> /chemin/vers/backup.log 2>&1
```

## 🎯 Recommandation

Pour une base de données Railway, je recommande :

1. **Backup quotidien automatique** : Utilise le script `backup-db.sh` avec cron
2. **Format compressé** : `.sql.gz` pour économiser l'espace
3. **Conserver 7-30 jours** : Garde plusieurs backups au cas où
4. **Stockage externe** : Sauvegarde aussi sur Google Drive, Dropbox, ou S3

## 📝 Exemple complet

```bash
# 1. Créer le dossier backups
mkdir -p backups

# 2. Faire le backup avec date
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" | gzip > "backups/backup_$DATE.sql.gz"

# 3. Vérifier la taille
ls -lh backups/backup_$DATE.sql.gz

# 4. (Optionnel) Copier vers un stockage externe
# cp backups/backup_$DATE.sql.gz ~/Dropbox/backups/
```

## 🔐 Sécurité

⚠️ **Important** : Les fichiers de backup contiennent toutes tes données, y compris les mots de passe hashés. 

- ✅ Stocke-les dans un endroit sécurisé
- ✅ Ne les partage pas publiquement
- ✅ Utilise des permissions restrictives : `chmod 600 backup.sql`
- ✅ Supprime les anciens backups de manière sécurisée


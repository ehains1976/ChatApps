# Backup Rapide - Guide de démarrage

## 🚀 Méthode la plus simple (Recommandée)

### Option 1 : Script Node.js (Recommandé)

```bash
npm run backup:db
```

C'est tout ! Le backup sera créé dans le dossier `backups/` avec la date et l'heure.

### Option 2 : Script Bash

```bash
# Rendre le script exécutable (une seule fois)
chmod +x backup-db.sh

# Exécuter le backup
./backup-db.sh
```

### Option 3 : Commande directe

```bash
# Créer le dossier backups
mkdir -p backups

# Faire le backup
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require" | gzip > "backups/backup_$DATE.sql.gz"
```

## 📁 Où sont les backups ?

Les backups sont sauvegardés dans le dossier `backups/` avec le format :
```
backups/backup_2024-01-15_14-30-45.sql.gz
```

## 🔄 Restaurer un backup

```bash
# Décompresser et restaurer
gunzip < backups/backup_2024-01-15_14-30-45.sql.gz | psql "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require"
```

## ⚠️ Prérequis

Tu dois avoir `pg_dump` installé sur ton ordinateur :

- **Windows** : Installe PostgreSQL depuis https://www.postgresql.org/download/windows/
- **macOS** : `brew install postgresql`
- **Linux** : `sudo apt-get install postgresql-client` (Debian/Ubuntu) ou `sudo yum install postgresql` (RedHat/CentOS)

## 📚 Pour plus de détails

Consulte `BACKUP_DATABASE.md` pour toutes les méthodes avancées.


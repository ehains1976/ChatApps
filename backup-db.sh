#!/bin/bash

# Script de backup automatique pour PostgreSQL Railway
# Usage: ./backup-db.sh

# Configuration - REMPLACE par tes vraies valeurs
DB_URL="postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

# Créer le dossier backups s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "📦 Création du backup de la base de données..."
echo "   Date: $(date)"
echo "   Fichier: $BACKUP_FILE"

# Vérifier que pg_dump est installé
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Erreur: pg_dump n'est pas installé"
    echo "   Installe PostgreSQL client tools pour utiliser pg_dump"
    exit 1
fi

# Faire le backup
if pg_dump "$DB_URL" | gzip > "$BACKUP_FILE"; then
    # Vérifier que le fichier a été créé et n'est pas vide
    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "✅ Backup créé avec succès !"
        echo "   Fichier: $BACKUP_FILE"
        echo "   Taille: $SIZE"
        
        # Garder seulement les 10 derniers backups (optionnel)
        echo "🧹 Nettoyage des anciens backups (garde les 10 derniers)..."
        ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
        
        echo "✅ Backup terminé !"
        exit 0
    else
        echo "❌ Erreur: Le fichier de backup est vide ou n'a pas été créé"
        exit 1
    fi
else
    echo "❌ Erreur lors de la création du backup"
    exit 1
fi


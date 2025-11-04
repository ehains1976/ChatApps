#!/bin/bash

# Script pour configurer Railway avec les variables d'environnement
# Usage: ./railway-config.sh

echo "🚀 Configuration automatique de Railway..."
echo ""

# Vérifier que Railway CLI est installé
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI n'est pas installé"
    echo "   Installe-le avec: npm install -g @railway/cli"
    echo "   Ou: https://docs.railway.app/develop/cli"
    exit 1
fi

echo "✅ Railway CLI détecté"
echo ""

# Vérifier que l'utilisateur est connecté
if ! railway whoami &> /dev/null; then
    echo "❌ Tu n'es pas connecté à Railway"
    echo "   Connecte-toi avec: railway login"
    exit 1
fi

echo "✅ Connecté à Railway"
echo ""
echo "📋 Configuration des variables d'environnement:"
echo ""

# Variables à configurer
DATABASE_URL="postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD"

# Configurer DATABASE_URL
echo "📝 Configuration de DATABASE_URL..."
if railway variables set DATABASE_URL="$DATABASE_URL"; then
    echo "   ✅ DATABASE_URL configuré"
else
    echo "   ❌ Erreur lors de la configuration de DATABASE_URL"
    exit 1
fi
echo ""

# Configurer NODE_ENV
echo "📝 Configuration de NODE_ENV..."
if railway variables set NODE_ENV="production"; then
    echo "   ✅ NODE_ENV configuré"
else
    echo "   ⚠️  Erreur lors de la configuration de NODE_ENV (non critique)"
fi
echo ""

# Configurer RAILWAY_ENVIRONMENT
echo "📝 Configuration de RAILWAY_ENVIRONMENT..."
if railway variables set RAILWAY_ENVIRONMENT="production"; then
    echo "   ✅ RAILWAY_ENVIRONMENT configuré"
else
    echo "   ⚠️  Erreur lors de la configuration de RAILWAY_ENVIRONMENT (non critique)"
fi
echo ""

echo "═══════════════════════════════════════════════════════"
echo "✅ Configuration terminée !"
echo "   Railway va redémarrer automatiquement avec les nouvelles variables."
echo "═══════════════════════════════════════════════════════"
echo ""
echo "💡 Pour vérifier les variables:"
echo "   railway variables"
echo ""
echo "💡 Pour voir les logs:"
echo "   railway logs"


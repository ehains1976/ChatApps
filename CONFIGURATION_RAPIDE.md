# Configuration Rapide Railway

## 🚀 Configuration automatique en une commande

```bash
npm run railway:config
```

C'est tout ! Le script va :
1. ✅ Vérifier que Railway CLI est installé
2. ✅ Vérifier que tu es connecté
3. ✅ Configurer toutes les variables d'environnement
4. ✅ Railway redémarre automatiquement

## 📋 Prérequis

### 1. Installer Railway CLI (une seule fois)

```bash
npm install -g @railway/cli
```

### 2. Se connecter à Railway (une seule fois)

```bash
railway login
```

### 3. Lier ton projet (une seule fois)

```bash
railway link
```

## ✅ Après la configuration

Railway va automatiquement :
- Redémarrer le service
- Appliquer les nouvelles variables
- Reconnecter à la base de données

## 🔍 Vérifier que ça fonctionne

```bash
# Voir les variables configurées
railway variables

# Voir les logs
railway logs
```

## 📝 Variables configurées

- `DATABASE_URL` → Connexion PostgreSQL
- `NODE_ENV` → `production`
- `RAILWAY_ENVIRONMENT` → `production`

## 🎯 Alternative : Script bash

Si tu préfères le script bash :

```bash
chmod +x railway-config.sh
./railway-config.sh
```

## 💡 Astuce

Si Railway CLI n'est pas installé, le script te dira exactement comment l'installer !


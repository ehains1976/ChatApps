# Guide : Déployer et Configurer Railway

## 🚀 Méthodes de déploiement

### Méthode 1 : Railway CLI (Recommandé - Automatique)

```bash
# 1. Installer Railway CLI (une seule fois)
npm install -g @railway/cli

# 2. Se connecter
railway login

# 3. Configurer les variables automatiquement
npm run railway:config

# OU avec le script bash
./railway-config.sh
```

### Méthode 2 : Via Git (Automatique)

Si ton projet est connecté à GitHub et Railway est lié au repo :

```bash
# 1. Commit tes changements
git add .
git commit -m "Mise à jour configuration"

# 2. Push vers GitHub
git push origin main

# Railway va automatiquement détecter et déployer
```

### Méthode 3 : Via Railway Dashboard (Manuel)

1. Va sur **Railway Dashboard** → Ton projet
2. Clique sur le service **backend**
3. Onglet **Variables**
4. Ajoute/Modifie les variables :
   - `DATABASE_URL` = `postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD`
   - `NODE_ENV` = `production`
   - `RAILWAY_ENVIRONMENT` = `production`
5. Railway redémarre automatiquement

## 📋 Variables d'environnement requises

### Variables obligatoires

| Variable | Valeur |
|---------|--------|
| `DATABASE_URL` | `postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD` |
| `NODE_ENV` | `production` |

### Variables optionnelles

| Variable | Valeur | Description |
|---------|--------|-------------|
| `RAILWAY_ENVIRONMENT` | `production` | Identifie que l'app tourne sur Railway |

## 🔧 Scripts disponibles

### Configuration automatique

```bash
# Configurer toutes les variables Railway
npm run railway:config

# OU avec le script bash
chmod +x railway-config.sh
./railway-config.sh
```

### Vérifier la configuration

```bash
# Voir toutes les variables configurées
railway variables

# Voir les logs du déploiement
railway logs

# Voir le statut du service
railway status
```

## 📝 Fichier railway.json

Le fichier `railway.json` contient la configuration du projet :

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "variables": {
    "DATABASE_URL": "...",
    "NODE_ENV": "production"
  }
}
```

**Note :** Les variables dans `railway.json` sont des valeurs par défaut. Les variables définies dans Railway Dashboard ont priorité.

## ✅ Checklist de déploiement

Avant de déployer :

- [ ] Variables d'environnement configurées
- [ ] `DATABASE_URL` pointe vers la bonne base de données (`ChatApps_BD`)
- [ ] Tests locaux passent
- [ ] Code commité et pushé (si Git)

Après le déploiement :

- [ ] Vérifier les logs : `railway logs`
- [ ] Tester le healthcheck : `https://ton-domaine.com/health`
- [ ] Vérifier la connexion à la base de données dans les logs
- [ ] Tester la connexion dans l'application

## 🐛 Dépannage

### Railway ne se connecte pas à la base de données

1. Vérifie que `DATABASE_URL` est bien configurée :
   ```bash
   railway variables
   ```

2. Vérifie que la base de données s'appelle bien `ChatApps_BD`

3. Vérifie les logs :
   ```bash
   railway logs
   ```
   Cherche les erreurs de connexion PostgreSQL

### Les variables ne sont pas prises en compte

1. Vérifie que les variables sont bien définies :
   ```bash
   railway variables
   ```

2. Redémarre le service manuellement dans Railway Dashboard

3. Vérifie que tu es dans le bon projet :
   ```bash
   railway whoami
   railway link
   ```

## 📚 Commandes Railway CLI utiles

```bash
# Se connecter
railway login

# Voir qui tu es
railway whoami

# Lier le projet actuel à Railway
railway link

# Voir les variables
railway variables

# Définir une variable
railway variables set DATABASE_URL="..."

# Voir les logs
railway logs

# Ouvrir le dashboard
railway open

# Se connecter à la base de données
railway connect Postgres
```

## 🎯 Workflow recommandé

1. **Développement local** :
   ```bash
   npm run dev:db
   ```

2. **Tester les changements** :
   - Vérifier que tout fonctionne localement
   - Tester les nouvelles fonctionnalités

3. **Commit et push** :
   ```bash
   git add .
   git commit -m "Description des changements"
   git push origin main
   ```

4. **Railway déploie automatiquement** (si connecté à GitHub)

5. **Vérifier le déploiement** :
   ```bash
   railway logs
   ```

6. **Si besoin, reconfigurer les variables** :
   ```bash
   npm run railway:config
   ```

## 💡 Astuce

Pour automatiser complètement, tu peux créer un script qui fait tout :

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Déploiement sur Railway..."

# 1. Tester localement (optionnel)
# npm test

# 2. Commit et push
git add .
git commit -m "Auto-deploy: $(date)"
git push origin main

# 3. Configurer Railway si nécessaire
npm run railway:config

# 4. Afficher les logs
echo "📊 Logs Railway:"
railway logs --tail 50
```


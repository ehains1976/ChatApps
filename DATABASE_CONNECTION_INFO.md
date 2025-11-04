# Informations de connexion PostgreSQL Railway

## 🔌 Informations actuelles

**DATABASE_URL :**
```
postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD
```

**Détails :**
- **Host** : `nozomi.proxy.rlwy.net`
- **Port** : `37174`
- **Database** : `ChatApps_BD`
- **User** : `postgres`
- **Password** : `zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt`

## 🚀 Commandes de connexion rapides

### Railway CLI (Le plus simple)
```bash
railway connect Postgres
```

### psql avec variable d'environnement
```bash
PGPASSWORD=zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt psql -h nozomi.proxy.rlwy.net -U postgres -p 37174 -d ChatApps_BD
```

### psql avec URL complète
```bash
psql "postgresql://postgres:zJhVcnQkyiSQuHCoJQVdXeToBDsQcMnt@nozomi.proxy.rlwy.net:37174/ChatApps_BD?sslmode=require"
```

## ⚠️ Note importante

La base de données s'appelle **`ChatApps_BD`**. 
Assure-toi que la variable `DATABASE_URL` dans Railway Dashboard → Service Backend → Variables est bien configurée avec ce nom de base de données.

## 📝 Pour tester la connexion

Utilise le script de test :
```bash
npm run test:db
```

Ou configure directement `DATABASE_URL` dans Railway Dashboard → Service Backend → Variables.


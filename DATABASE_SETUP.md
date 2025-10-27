# 🗄️ Configuration Base de Données PostgreSQL

## Sur Railway

### 1. Créer la base de données PostgreSQL

Dans ton tableau de bord Railway :
1. Va sur ton projet
2. Clique sur "+ New"
3. Sélectionne "Database" → "PostgreSQL"
4. Nomme-la "Vertprojet_bd"
5. Railway va créer la base et te donner une `DATABASE_URL`

### 2. Configurer la variable d'environnement

Dans Railway, ajoute la variable d'environnement :
- Nom : `DATABASE_URL`
- Valeur : la connection string de Railway (ex: `postgresql://postgres:xxxx@xxxx.railway.app:5432/railway`)

### 3. Déployer

Une fois la variable d'environnement ajoutée :
```bash
railway up
```

Le backend va automatiquement :
1. Se connecter à PostgreSQL
2. Créer toutes les tables
3. Créer les utilisateurs admin :
   - **bzinc** / Jai.1.Mcd0
   - **vertdure** / Jai.du.Beau.Gaz0n

## Structure de la Base de Données

### Tables créées :

**users** - Utilisateurs et responsables
- id, prenom, nom, entreprise, courriel, password_hash, role

**projects** - Projets
- id, name, description, status, progress, start_date, end_date, delivery_date
- team_size, owner_id, hours_allocated, price (calculé automatiquement 170$/heure)

**milestones** - Jalons des projets
- id, project_id, name, due_date, completed

**tasks** - Tâches
- id, title, description, status, priority
- start_date, end_date, due_date, progress
- project_id, is_recurrent, recurrent_pattern

**task_responsibles** - Relation many-to-many tâches-responsables
- id, task_id, user_id

## Utilisateurs Admin Créés Automatiquement

- **Courriel** : bzinc@bzinc.com
- **Mot de passe** : Jai.1.Mcd0
- **Rôle** : admin

- **Courriel** : vertdure@vertdure.com  
- **Mot de passe** : Jai.du.Beau.Gaz0n
- **Rôle** : admin

## Fonctionnalités

✅ **Projets** : Avec calcul automatique du prix (heures × 170$)
✅ **Tâches** : Avec many-to-many pour plusieurs responsables
✅ **Jalons** : Liés aux projets
✅ **Dashboard** : Stats calculées depuis la vraie DB
✅ **Authentification** : Mots de passe hashés avec bcrypt


# Comment voir les tables dans Railway Dashboard

## ⚠️ IMPORTANT : Pourquoi je ne vois pas mes tables ?

**Railway ne montre pas toujours les tables créées via code dans son interface visuelle.** C'est normal ! Les tables existent et fonctionnent, mais Railway les affiche parfois seulement si elles ont été créées via l'interface.

**Solution :** Utilise SQL pour vérifier/créer les tables (voir ci-dessous).

## Méthode 1 : Vérifier si les tables existent (via SQL dans Railway)

1. **Va sur Railway Dashboard** → https://railway.app
2. **Ouvre ton projet ChatApps_BD**
3. **Clique sur le service PostgreSQL** (icône éléphant 🐘)
4. **Va dans l'onglet "Data"** ou **"Query"** ou **"SQL Editor"**
5. **Colle et exécute ce SQL** :

```sql
-- Lister toutes les tables
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Méthode 2 : Créer les tables si elles n'existent pas

Si la requête SQL ci-dessus ne retourne aucune table, crée-les :

1. **Dans Railway Dashboard** → Postgres → Onglet **"Data"** ou **"Query"**
2. **Ouvre le fichier** `create-tables-railway.sql` dans ton projet
3. **Copie tout le contenu**
4. **Colle-le dans l'éditeur SQL** de Railway
5. **Clique sur "Run"** ou "Execute"

Les tables suivantes seront créées :
- `users` - Utilisateurs
- `projects` - Projets
- `milestones` - Jalons
- `tasks` - Tâches
- `task_responsibles` - Relations tâches-responsables

## Méthode 3 : Via Railway CLI

1. **Ouvre un terminal** dans ton projet
2. **Connecte-toi à PostgreSQL** :
   ```bash
   railway connect Postgres
   ```
3. **Une fois connecté, exécute** :
   ```sql
   \dt  -- Liste les tables
   \d users  -- Détails de la table users
   SELECT * FROM users;  -- Voir les utilisateurs
   ```
   
   Ou copie-colle le contenu de `create-tables-railway.sql` pour créer les tables.

## Méthode 4 : Via l'API de debug

Utilise l'endpoint de debug pour voir toutes les tables :
```
https://ton-domaine.com/api/debug/db
```

Cela affichera toutes les tables et leurs données en JSON.

## ✅ Vérification rapide

### Option 1 : Via SQL dans Railway
```sql
-- Voir toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Compter les lignes dans chaque table
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'milestones', COUNT(*) FROM milestones;
```

### Option 2 : Via l'API
Ouvre dans ton navigateur :
```
https://ton-domaine.com/api/debug/db
```

## 💡 Pourquoi Railway ne montre pas mes tables ?

**C'est normal !** Railway ne montre pas toujours les tables créées via code dans son interface visuelle. Mais les tables **existent et fonctionnent** quand même.

**Solutions :**
- ✅ Utilise SQL pour voir/créer les tables (voir Méthode 1)
- ✅ Utilise Railway CLI (voir Méthode 3)
- ✅ Utilise un outil externe (pgAdmin, DBeaver) - voir `CONNEXION_EXTERIEURE_BD.md`
- ✅ Utilise l'API de debug (voir Méthode 4)

Les tables fonctionnent parfaitement même si Railway ne les affiche pas visuellement !


# Comment voir les tables dans Railway Dashboard

## Méthode 1 : Via l'interface Railway (Recommandé)

1. **Va sur Railway Dashboard** → https://railway.app
2. **Ouvre ton projet ChatApps**
3. **Clique sur le service PostgreSQL** (ChatApps_BD)
4. **Cherche un onglet "Query", "SQL", "Data" ou "Console"**
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

## Méthode 2 : Via Railway CLI

1. **Ouvre un terminal** dans ton projet
2. **Connecte-toi à PostgreSQL** :
   ```bash
   railway connect postgres
   ```
3. **Une fois connecté, exécute** :
   ```sql
   \dt  -- Liste les tables
   \d users  -- Détails de la table users
   SELECT * FROM users;  -- Voir les utilisateurs
   ```

## Méthode 3 : Via l'API de debug

Utilise l'endpoint de debug que nous avons créé :
```
https://chatapps.bzhosing.ca/api/debug/db
```

Cela affichera toutes les tables et leurs données.

## Note importante

Les tables **existent déjà** dans la base de données `ChatApps_BD`. Si Railway ne les affiche pas dans son interface visuelle, c'est normal - elles ont été créées via l'application au démarrage.

Tu peux quand même :
- ✅ Les voir via l'API de debug
- ✅ Les utiliser normalement dans l'application
- ✅ Les interroger via Railway CLI ou l'éditeur SQL

## Vérification rapide

Pour vérifier que tout fonctionne, ouvre :
```
https://chatapps.bzhosing.ca/api/debug/db
```

Tu devrais voir toutes les tables listées.


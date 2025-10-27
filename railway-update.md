# Instructions Railway

## Étape 1: Trouver DATABASE_URL
Dans Railway:
1. Va dans PostgreSQL (VertProjet_BD)
2. Onglet "Variables"
3. Copie la valeur de `DATABASE_URL` ou `POSTGRES_URL`

## Étape 2: Ajouter DATABASE_URL au backend
Dans Railway:
1. Va dans le service VertProjet
2. Onglet "Variables"
3. Clique "New Variable"
4. Nom: `DATABASE_URL`
5. Valeur: (colle la connection string de PostgreSQL)
6. Save

## Étape 3: Redéployer
Railway va redémarrer automatiquement

## Résultat attendu dans les logs:
```
✅ Connecté à PostgreSQL
✅ Tables créées
✅ Utilisateur admin créé: bzinc@bzinc.com
✅ Utilisateur admin créé: vertdure@vertdure.com
✅ Base de données initialisée avec succès!
```


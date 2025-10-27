# Instructions de Configuration Railway

## Problème actuel
Le backend ne peut pas se connecter à PostgreSQL car le réseau privé Railway ne fonctionne pas.

## Solutions possibles

### Solution 1: Créer les tables manuellement via l'interface Railway

Dans Railway, va dans PostgreSQL (VertProjet_BD) et cherche:
- Un bouton "Query"
- Un éditeur SQL
- Une section "Query" ou "Console"
- Des onglets comme "Data", "Schema", "Query", "SQL"

### Solution 2: Utiliser Railway CLI pour exécuter le SQL

```bash
railway connect postgres
# Puis exécuter le SQL
```

### Solution 3: Utiliser une URL publique alternative

Si Railway fournit une URL publique externe pour PostgreSQL, on peut l'utiliser.

## Ce qu'il faut faire maintenant

1. **Trouve la bonne section dans PostgreSQL Railway**
2. **Exécute le SQL de `create-tables-railway.sql`**
3. **Insère les utilisateurs temporaires**
4. **Teste la connexion**

## Alternative: Skip l'initialisation automatique

On peut modifier le backend pour ne pas initialiser automatiquement la DB et juste se connecter pour les opérations normales.


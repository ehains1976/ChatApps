# Configuration Railway pour VertProjet

## Problème actuel
Le backend ne peut pas se connecter à PostgreSQL à cause de problèmes de réseau.

## Solution

### 1. Vérifier le "Private Networking" dans Railway

Dans Railway :
1. Va dans le service backend (VertProjet)
2. Onglet "Network" ou "Settings"
3. Cherche "Private Networking" ou "Service Dependencies"
4. Assure-toi que le service PostgreSQL est listé comme dépendance

### 2. Alternative : Utiliser les variables d'environnement séparées

Au lieu d'utiliser une URL de connexion, Railway peut fournir des variables individuelles :

- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Si ces variables existent, on peut construire l'URL manuellement dans le code.

### 3. Solution temporaire : Créer les tables manuellement

Si la connexion automatique ne fonctionne pas, on peut :
1. Se connecter directement à PostgreSQL via Railway
2. Créer les tables manuellement avec le SQL
3. Créer les utilisateurs admin

Ensuite le backend pourra se connecter pour lire/écrire des données.


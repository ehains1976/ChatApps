# 🚀 Configuration VertProjet - Développement Local

Ce guide vous explique comment faire fonctionner VertProjet en local sur votre machine.

## Prérequis

1. **Node.js** (v18 ou supérieur)
   - Vérifier: `node --version`
   - Télécharger: https://nodejs.org/

2. **PostgreSQL** (v12 ou supérieur)
   - Windows: Télécharger depuis https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql@14` puis `brew services start postgresql@14`
   - Linux (Ubuntu/Debian): `sudo apt-get install postgresql postgresql-contrib`
   - Vérifier: `psql --version`

## Étape 1: Installation des dépendances

```bash
npm install
```

## Étape 2: Configuration de la base de données PostgreSQL locale

### 2.1 Créer la base de données

Ouvrez un terminal et connectez-vous à PostgreSQL:

```bash
# Windows (utiliser psql depuis le répertoire d'installation PostgreSQL)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

Puis exécutez:

```sql
CREATE DATABASE vertprojet_bd;
\q
```

### 2.2 Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet (copiez `.env.example`):

```bash
cp .env.example .env
```

Modifiez `.env` avec vos informations PostgreSQL locales:

```env
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/vertprojet_bd
PORT=3001
NODE_ENV=development
```

**Note:** Remplacez `VOTRE_MOT_DE_PASSE` par le mot de passe de votre utilisateur PostgreSQL.

Si vous utilisez un autre utilisateur que `postgres`, ajustez l'URL:
```env
DATABASE_URL=postgresql://utilisateur:motdepasse@localhost:5432/vertprojet_bd
```

## Étape 3: Initialiser la base de données

Le backend va automatiquement créer les tables et les utilisateurs admin au premier démarrage. Mais vous pouvez aussi le faire manuellement:

```bash
npm run migrate
```

## Étape 4: Démarrer l'application

### Option A: Démarrer backend et frontend ensemble (recommandé)

```bash
npm run dev
```

Cela démarre:
- Backend sur `http://localhost:3001`
- Frontend (Vite) sur `http://localhost:5173`

### Option B: Démarrer séparément

Terminal 1 (Backend):
```bash
npm run backend
```

Terminal 2 (Frontend):
```bash
npm run frontend
```

## Étape 5: Accéder à l'application

Ouvrez votre navigateur et allez sur:
- **Frontend:** http://localhost:5173
- **API Backend:** http://localhost:3001/api

## Comptes utilisateurs créés automatiquement

Le système crée automatiquement deux comptes admin au démarrage:

1. **bzinc@bzinc.ca** / `Jai.1.Mcd0`
2. **vertdure@vertdure.com** / `Jai.du.Beau.Gaz0n`

## Dépannage

### Erreur: "Cannot connect to PostgreSQL"

1. Vérifiez que PostgreSQL est démarré:
   - Windows: Services → PostgreSQL
   - macOS: `brew services list` (doit être "started")
   - Linux: `sudo systemctl status postgresql`

2. Vérifiez vos identifiants dans `.env`

3. Testez la connexion manuellement:
   ```bash
   psql -U postgres -d vertprojet_bd
   ```

### Erreur: "Database does not exist"

Créez la base de données (voir Étape 2.1)

### Erreur de port déjà utilisé

Si le port 3001 ou 5173 est déjà utilisé, changez-le dans:
- `.env` pour le backend (PORT=3001)
- `vite.config.ts` pour le frontend (port: 5173)

## Scripts disponibles

- `npm run dev` - Démarre backend + frontend ensemble
- `npm run backend` - Démarre uniquement le backend
- `npm run frontend` - Démarre uniquement le frontend
- `npm run build` - Construit le frontend pour production
- `npm run migrate` - Initialise/migre la base de données
- `npm start` - Démarre le backend en mode production

## Structure des fichiers

- `backend.js` - Serveur backend principal
- `database/` - Configuration et schéma de la base de données
- `src/` - Code source React/TypeScript du frontend
- `dist/` - Build du frontend (créé après `npm run build`)




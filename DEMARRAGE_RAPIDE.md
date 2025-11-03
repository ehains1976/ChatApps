# 🚀 Démarrage Rapide - VertProjet avec Données Mockup

Ce guide vous permet de démarrer VertProjet rapidement **SANS** base de données PostgreSQL, en utilisant des données mockup (simulées).

## Prérequis

- **Node.js** (v18 ou supérieur)
  - Vérifier: `node --version`
  - Télécharger: https://nodejs.org/

## Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Construire le frontend**
   ```bash
   npm run build
   ```

## Démarrage

### Option 1: Backend + Frontend ensemble (recommandé)

```bash
npm run dev
```

Cela démarre:
- Backend avec données mockup sur `http://localhost:3001`
- Frontend (Vite dev server) sur `http://localhost:5173`

### Option 2: Démarrer séparément

Terminal 1 (Backend):
```bash
npm run backend
```

Terminal 2 (Frontend):
```bash
npm run frontend
```

## Accès

Ouvrez votre navigateur:
- **Frontend:** http://localhost:5173
- **API Backend:** http://localhost:3001/api

## Comptes de test

Deux comptes admin sont disponibles pour tester l'application:

1. **bzinc@bzinc.ca** / `Jai.1.Mcd0`
2. **vertdure@vertdure.com** / `Jai.du.Beau.Gaz0n`

## Données mockup incluses

- ✅ 6 utilisateurs (dont 2 admins)
- ✅ 4 projets avec jalons
- ✅ 5 tâches avec responsables
- ✅ Statistiques du dashboard calculées

## Important

⚠️ **Les données sont en mémoire** - elles seront réinitialisées à chaque redémarrage du serveur.

Pour utiliser une vraie base de données PostgreSQL, utilisez:
```bash
npm run dev:db
```

Mais assurez-vous d'avoir PostgreSQL configuré (voir `LOCAL_SETUP.md`).




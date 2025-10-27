# 🚀 Démarrage Rapide - VertProjet

## 1. Démarrer l'application

```bash
npm run dev
```

Cette commande va démarrer :
- **Backend** sur `http://localhost:3001` (API)
- **Frontend React** sur `http://localhost:5173` (Interface)

## 2. Accéder à l'application

Ouvre ton navigateur sur : **http://localhost:5173**

## 3. Navigation dans l'application

### 📊 Dashboard
Vue d'ensemble avec statistiques et projets

### ✅ Tâches
- Gestion complète des tâches
- Filtres par responsable, projet, statut
- Créer/modifier/supprimer des tâches
- Tâches récurrentes
- Tâches sans projet

### 📅 Calendrier
- Onglets : Projets / Tâches / Les deux
- Navigation entre les mois
- Affichage des dates de livraison et échéances

### 👥 Équipe
- Gestion des utilisateurs
- CRUD complet

## 4. Utilisation des filtres

Dans la page **Tâches** :
1. **Responsable** : Filtre par utilisateur
2. **Statut** : À faire / En cours / Terminé / En retard
3. **Projet** : Par projet ou "Sans projet"

## 5. Créer une tâche

1. Cliquer sur "Nouvelle Tâche"
2. Remplir les champs obligatoires :
   - ✅ Titre
   - ✅ Description
   - ✅ Responsable (sélectionner un utilisateur)
   - ✅ Date d'échéance
3. Remplir les champs optionnels si nécessaire
4. Sauvegarder

## 6. Problèmes courants

### Port déjà utilisé
Si tu vois l'erreur `EADDRINUSE: address already in use :::3001` :
```bash
# Windows
netstat -ano | findstr :3001
taskkill /F /PID <numéro_du_processus>

# Puis relancer
npm run dev
```

### Pas de données
Assure-toi que les deux serveurs tournent :
- Backend sur le port 3001
- Frontend sur le port 5173

## ✨ Fonctionnalités principales

- ✅ Gestion complète des tâches
- 📅 Calendrier avec projets et tâches
- 👥 Gestion des utilisateurs
- 🔍 Filtres avancés
- 🔄 Tâches récurrentes
- 📊 Statistiques en temps réel

Bon projet ! 🚀


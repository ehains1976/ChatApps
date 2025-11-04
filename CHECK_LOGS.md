# Comment voir les logs et déboguer

## 🖥️ Dans Railway (Production)

### Voir les logs du serveur backend
1. Va dans ton projet Railway (ChatApps_BD)
2. Clique sur le service **backend** (pas Postgres)
3. Va dans l'onglet **Logs** (en haut à droite)
4. **Tu devrais maintenant voir** :
   - ✅ Un message de démarrage avec le port et les infos de la DB
   - 📝 Chaque requête entrante avec la méthode HTTP et le chemin
   - 🔐 Les détails des tentatives de login (email, si utilisateur trouvé, si mot de passe valide)
   - ✓ Les codes de réponse (200, 401, 404, 500, etc.)

### Exemple de ce que tu devrais voir :
```
═══════════════════════════════════════════════════════
🚀 SERVEUR CHATAPPS DÉMARRÉ
   Port: 3001
   API: http://localhost:3001/api
   Healthcheck: http://localhost:3001/health
   Base de données: PostgreSQL (Railway)
   DB Initialisée: ✅ OUI
═══════════════════════════════════════════════════════

📝 Les logs de requête seront affichés ci-dessous:

[2024-01-15T10:30:00.000Z] GET /health
  ✓ Réponse: 200 OK

[2024-01-15T10:30:05.000Z] POST /api/auth/login
  → Route trouvée: /api/auth/login
🔐 LOGIN - Tentative de connexion pour: bzinc@bzinc.ca
  Email fourni: bzinc@bzinc.ca
  Mot de passe fourni: ***
  👤 Utilisateur trouvé: true
  → ID: 1 Role: admin
  🔑 Vérification mot de passe: ✓ VALIDE
  ✅ SUCCÈS: Connexion réussie pour bzinc@bzinc.ca
  ✓ Réponse: 200 OK
```

## 💻 En local (sur ton ordinateur)

1. Ouvre un terminal
2. Va dans le dossier du projet
3. Lance le serveur : `npm run start:db`
4. Les logs s'affichent directement dans le terminal

## 🌐 Dans le navigateur (Frontend)

1. Appuie sur **F12** (ouvrir DevTools)
2. Onglet **Console** - voir les erreurs JavaScript du frontend
3. Onglet **Network** (Réseau) - voir toutes les requêtes HTTP
   - Clique sur une requête pour voir les détails
   - Regarde la réponse du serveur (onglet "Response")

## 🔍 Vérification rapide

### Si tu ne vois RIEN dans les logs Railway :
1. Vérifie que tu regardes les logs du **bon service** (backend, pas Postgres)
2. Vérifie que le service est **déployé et démarré**
3. Essaie de rafraîchir la page des logs
4. Fais une requête (par exemple, essaie de te connecter) pour générer des logs

### Si tu vois des erreurs :
- Copie les messages d'erreur (en rouge) et partage-les
- Regarde les lignes qui commencent par `❌` ou `⚠️`

## 📊 Logs disponibles maintenant

Avec les améliorations, tu verras maintenant :
- ✅ **Chaque requête** : méthode HTTP + chemin + timestamp
- ✅ **Routes trouvées** : quelle route API a été appelée
- ✅ **Détails login** : email, utilisateur trouvé, validation mot de passe
- ✅ **Codes de réponse** : 200, 401, 404, 500, etc.
- ✅ **Erreurs détaillées** : message + stack trace


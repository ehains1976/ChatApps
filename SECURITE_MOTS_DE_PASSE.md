# Sécurité des Mots de Passe - Documentation

## ✅ Améliorations de sécurité implémentées

### 1. Création d'utilisateurs avec mot de passe obligatoire

**Avant :** Les utilisateurs pouvaient être créés sans mot de passe
**Maintenant :** Le mot de passe est **obligatoire** lors de la création d'un utilisateur

- ✅ Le backend vérifie que le mot de passe est fourni
- ✅ Le mot de passe est automatiquement hashé avec bcrypt (10 rounds)
- ✅ Le mot de passe hashé est stocké dans la base de données
- ✅ Le mot de passe en clair n'est jamais stocké

### 2. Connexion avec mot de passe obligatoire

**Avant :** La connexion pouvait fonctionner sans mot de passe (auto-migration)
**Maintenant :** La connexion **exige** un mot de passe

- ✅ Le backend refuse les connexions sans mot de passe
- ✅ Le backend refuse les connexions si l'utilisateur n'a pas de password_hash
- ✅ Les mots de passe sont vérifiés avec bcrypt.compare()

### 3. Interface de gestion des utilisateurs améliorée

L'interface `UserManager` permet maintenant :
- ✅ Créer des utilisateurs avec un mot de passe
- ✅ Modifier les utilisateurs (changer le mot de passe optionnel)
- ✅ Définir le rôle (user/admin)
- ✅ Message informatif : "Le mot de passe sera encrypté (hashé) dans la base de données"

## 🔐 Comment ça fonctionne

### Hachage des mots de passe

Les mots de passe sont hashés avec **bcrypt** (10 rounds de salage) :

```javascript
const passwordHash = await bcrypt.hash(password, 10);
```

Cela signifie :
- Chaque mot de passe a un hash unique (même mot de passe = hash différent à chaque fois)
- Le hash contient le salt automatiquement
- Impossible de retrouver le mot de passe original depuis le hash

### Vérification des mots de passe

Lors de la connexion :
```javascript
const isValid = await bcrypt.compare(passwordFourni, passwordHashStocke);
```

## 📝 Créer l'utilisateur jmcaouette

Pour créer l'utilisateur **jmcaouette** avec le mot de passe **Batmanjoker2025%%** :

```bash
npm run create:user
```

Ou manuellement :
```bash
node create-user-jmcaouette.js
```

**Informations de l'utilisateur :**
- **Email** : `jmcaouette`
- **Mot de passe** : `Batmanjoker2025%%`
- **Prénom** : `JM`
- **Nom** : `Caouette`
- **Entreprise** : `ChatApps`
- **Rôle** : `user`

## 🎯 Utilisation dans l'application

### Créer un utilisateur via l'interface

1. Va dans **Gestion des Utilisateurs**
2. Clique sur **"Nouvel Utilisateur"**
3. Remplis le formulaire :
   - Prénom *
   - Nom *
   - Courriel *
   - Entreprise *
   - **Mot de passe *** (obligatoire)
   - Rôle (user/admin)
4. Clique sur **"Créer"**

Le mot de passe sera automatiquement hashé et stocké de manière sécurisée.

### Modifier un utilisateur

1. Clique sur l'icône **✏️ Modifier** d'un utilisateur
2. Modifie les informations
3. **Pour changer le mot de passe** : Entres un nouveau mot de passe
4. **Pour ne pas changer le mot de passe** : Laisse le champ vide
5. Clique sur **"Mettre à jour"**

## 🔒 Sécurité

### Ce qui est sécurisé

✅ **Mots de passe hashés** : Jamais stockés en clair
✅ **Bcrypt** : Algorithme sécurisé avec salt automatique
✅ **Validation** : Mot de passe obligatoire à la création
✅ **Vérification** : Connexion impossible sans mot de passe
✅ **Pas de mot de passe par défaut** : Chaque utilisateur doit avoir son propre mot de passe

### Bonnes pratiques respectées

- ✅ Mot de passe obligatoire lors de la création
- ✅ Hashage avec bcrypt (10 rounds)
- ✅ Pas de mot de passe visible dans les logs
- ✅ Message d'erreur clair si mot de passe manquant
- ✅ Possibilité de changer le mot de passe sans affecter les autres champs

## 📊 API Endpoints

### POST /api/users
Crée un nouvel utilisateur avec mot de passe obligatoire.

**Body :**
```json
{
  "prenom": "JM",
  "nom": "Caouette",
  "entreprise": "ChatApps",
  "courriel": "jmcaouette",
  "password": "Batmanjoker2025%%",
  "role": "user"
}
```

**Réponse :**
```json
{
  "id": 1,
  "prenom": "JM",
  "nom": "Caouette",
  "entreprise": "ChatApps",
  "courriel": "jmcaouette",
  "role": "user",
  "message": "Utilisateur créé avec succès"
}
```

### PUT /api/users/:id
Met à jour un utilisateur. Le mot de passe est optionnel (laisser vide pour ne pas changer).

**Body :**
```json
{
  "prenom": "JM",
  "nom": "Caouette",
  "entreprise": "ChatApps",
  "courriel": "jmcaouette",
  "password": "NouveauMotDePasse123!",  // Optionnel
  "role": "admin"
}
```

### POST /api/auth/login
Connexion avec email et mot de passe obligatoires.

**Body :**
```json
{
  "email": "jmcaouette",
  "password": "Batmanjoker2025%%"
}
```

**Réponse si succès :**
```json
{
  "user": {
    "id": 1,
    "prenom": "JM",
    "nom": "Caouette",
    "courriel": "jmcaouette",
    "role": "user"
  },
  "token": "dummy-token"
}
```

**Réponse si erreur :**
```json
{
  "error": "Courriel ou mot de passe incorrect"
}
```

## ⚠️ Notes importantes

1. **Les mots de passe sont irrécupérables** : Une fois hashés, impossible de les retrouver. Il faut les réinitialiser.

2. **Changement de mot de passe** : Lors de la modification, si le champ mot de passe est vide, le mot de passe existant est conservé.

3. **Connexion obligatoire** : Tous les utilisateurs doivent avoir un mot de passe hashé pour pouvoir se connecter.

4. **Rôle admin** : Les administrateurs peuvent créer et modifier les utilisateurs via l'interface.

## 🚀 Prochaines étapes (optionnel)

Pour améliorer encore la sécurité, on pourrait :
- Ajouter une validation de force du mot de passe (min 8 caractères, majuscules, chiffres, etc.)
- Ajouter une expiration des mots de passe
- Ajouter un système de réinitialisation de mot de passe par email
- Ajouter un système de verrouillage de compte après plusieurs tentatives échouées


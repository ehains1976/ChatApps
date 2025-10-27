-- Script pour insérer les données initiales dans la base Railway

-- Insérer les utilisateurs admin (les mots de passe doivent être hashés avec bcrypt)
-- Note: Les mots de passe hashés seront ajoutés via le backend

-- Pour créer manuellement les users admin, il faut d'abord hasher les passwords avec bcrypt
-- bzinc / Jai.1.Mcd0
-- vertdure / Jai.du.Beau.Gaz0n

-- Ces users seront créés automatiquement par le backend une fois DATABASE_URL configurée

-- Pour l'instant, insérez manuellement si nécessaire:
-- INSERT INTO users (prenom, nom, entreprise, courriel, password_hash, role) VALUES
-- ('BZ', 'Inc', 'BZ Inc', 'bzinc@bzinc.com', '[HASH_BCRYPT]', 'admin');


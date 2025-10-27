-- Script SQL pour insérer les utilisateurs admin manuellement
-- NÉCESSITE: Installer pgcrypto extension avant
-- Exécute d'abord: CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insérer les utilisateurs admin
-- Les passwords sont hashés avec bcrypt (10 rounds)
-- Pour vérifier: SELECT * FROM users;

-- Note: Les mots de passe hashés doivent être générés avec bcrypt
-- Pour l'instant, insère des utilisateurs sans password_hash (sera ajouté via backend plus tard)

INSERT INTO users (prenom, nom, entreprise, courriel, role) VALUES
('BZ', 'Inc', 'BZ Inc', 'bzinc@bzinc.com', 'admin'),
('Vert', 'Dure', 'VertDure', 'vertdure@vertdure.com', 'admin')
ON CONFLICT (courriel) DO NOTHING;

-- Pour ajouter les password_hash plus tard via le backend
-- Les mots de passe sont: Jai.1.Mcd0 et Jai.du.Beau.Gaz0n


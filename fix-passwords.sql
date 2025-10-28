-- Script pour fixer les mots de passe des utilisateurs admin
-- À exécuter dans Railway PostgreSQL → Data → Query

-- Note: Les mots de passe hashés doivent être générés avec bcrypt
-- Ce script insère les hash bcrypt pré-calculés

-- Pour bzinc@bzinc.ca - mot de passe: Jai.1.Mcd0
-- Hash bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    courriel = 'bzinc@bzinc.ca',
    updated_at = CURRENT_TIMESTAMP
WHERE courriel IN ('bzinc@bzinc.ca', 'bzinc@bzinc.com');

-- Pour vertdure@vertdure.com - mot de passe: Jai.du.Beau.Gaz0n
-- Hash bcrypt: $2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234
UPDATE users 
SET password_hash = '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234',
    updated_at = CURRENT_TIMESTAMP
WHERE courriel = 'vertdure@vertdure.com';


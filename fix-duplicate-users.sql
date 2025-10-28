-- Script pour fixer les doublons et les mots de passe dans Railway PostgreSQL → Data → Query

-- 1. Supprimer les anciens doublons
DELETE FROM users WHERE courriel = 'bzinc@bzinc.com';

-- 2. Garder seulement bzinc@bzinc.ca
-- (Mais d'abord, on vérifie s'il existe déjà)

-- 3. Mettre à jour les mots de passe des utilisateurs admin
UPDATE users 
SET password_hash = '$2a$10$KdUX0sEw5Gpag6jEEJ1OL.zh.3.0/EitfLQm6xQ3WtL2GmVWsQzL.',
    courriel = 'bzinc@bzinc.ca',
    role = 'admin',
    updated_at = CURRENT_TIMESTAMP
WHERE courriel = 'bzinc@bzinc.ca';

UPDATE users 
SET password_hash = '$2a$10$qXKT/DQaP8iPFNsArghZ0O7qe3qbivg4YY7u.3RX00pcaWCx5hyEa',
    role = 'admin',
    updated_at = CURRENT_TIMESTAMP
WHERE courriel = 'vertdure@vertdure.com';


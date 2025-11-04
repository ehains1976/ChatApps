-- Script pour afficher toutes les tables dans Railway
-- Exécutez ce script dans Railway Dashboard → PostgreSQL → Query/SQL Editor

-- Lister toutes les tables
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Voir les détails de chaque table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Compter les lignes dans chaque table
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'milestones', COUNT(*) FROM milestones
UNION ALL
SELECT 'task_responsibles', COUNT(*) FROM task_responsibles
UNION ALL
SELECT 'task_notes', COUNT(*) FROM task_notes;

-- Voir les utilisateurs
SELECT id, prenom, nom, courriel, role, created_at FROM users ORDER BY id;


-- Copie tout ce fichier dans l'éditeur SQL de Railway

-- Table Users (avec authentification admin)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    entreprise VARCHAR(255) NOT NULL,
    courriel VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'En cours',
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    delivery_date DATE NOT NULL,
    team_size INTEGER DEFAULT 0,
    owner_id INTEGER REFERENCES users(id),
    hours_allocated INTEGER DEFAULT 0,
    price DECIMAL(10,2) GENERATED ALWAYS AS (hours_allocated * 170.00) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Milestones (Jalons pour les projets)
CREATE TABLE IF NOT EXISTS milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'À faire',
    priority VARCHAR(50) DEFAULT 'Moyenne',
    start_date DATE,
    end_date DATE,
    due_date DATE NOT NULL,
    progress INTEGER DEFAULT 0,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    is_recurrent BOOLEAN DEFAULT FALSE,
    recurrent_pattern VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour relation many-to-many Tasks-Responsables
CREATE TABLE IF NOT EXISTS task_responsibles (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_responsibles_task ON task_responsibles(task_id);
CREATE INDEX IF NOT EXISTS idx_task_responsibles_user ON task_responsibles(user_id);


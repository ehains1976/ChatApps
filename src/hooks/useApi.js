import { useState, useEffect } from 'react';

// Hook pour les statistiques du dashboard
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    tasksInProgress: 0,
    tasksCompleted: 0,
    tasksOverdue: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Récupérer les projets et tâches
        const [projectsResponse, tasksResponse] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/tasks')
        ]);
        
        // Vérifier les status HTTP
        if (!projectsResponse.ok || !tasksResponse.ok) {
          throw new Error('Erreur HTTP lors du chargement des données');
        }
        
        const projectsData = await projectsResponse.json();
        const tasksData = await tasksResponse.json();
        
        // S'assurer que les données sont des tableaux
        const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.error ? [] : []);
        const tasks = Array.isArray(tasksData) ? tasksData : (tasksData?.error ? [] : []);
        
        // Calculer les statistiques
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Compter les tâches par statut
        const tasksInProgress = tasks.filter(t => t.status === 'En cours' || t.status === 'À faire').length;
        const tasksCompleted = tasks.filter(t => t.status === 'Terminé').length;
        
        // Compter les tâches en retard (due_date avant aujourd'hui et status != 'Terminé')
        const tasksOverdue = tasks.filter(t => {
          if (t.status === 'Terminé') return false;
          const dueDate = t.due_date || t.end_date;
          return dueDate && dueDate < todayStr;
        }).length;
        
        // Compter les projets actifs (status != 'Terminé' et != 'Annulé')
        const activeProjects = projects.filter(p => 
          p.status !== 'Terminé' && p.status !== 'Annulé'
        ).length;
        
        setStats({
          tasksInProgress,
          tasksCompleted,
          tasksOverdue,
          activeProjects
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des statistiques:', err);
        // Mettre des valeurs par défaut en cas d'erreur
        setStats({
          tasksInProgress: 0,
          tasksCompleted: 0,
          tasksOverdue: 0,
          activeProjects: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Rafraîchir les stats toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
};

// Hook pour les projets
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        // S'assurer que les données sont un tableau
        const projectsData = Array.isArray(data) ? data : (data?.error ? [] : []);
        setProjects(projectsData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des projets:', err);
        setProjects([]); // Tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { 
    projects, 
    loading, 
    error
  };
};

// Hook pour les tâches
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        // S'assurer que les données sont un tableau
        const tasksData = Array.isArray(data) ? data : (data?.error ? [] : []);
        setTasks(tasksData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des tâches:', err);
        setTasks([]); // Tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return { tasks, loading, error };
};

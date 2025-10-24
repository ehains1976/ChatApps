import { useState, useEffect } from 'react';
import apiService from '../services/api';

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
        const data = await apiService.getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Rafraîchir les stats toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: () => fetchStats() };
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
        const data = await apiService.getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des projets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const createProject = async (projectData) => {
    try {
      const newProject = await apiService.createProject(projectData);
      setProjects(prev => [...prev, { ...projectData, id: newProject.id }]);
      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      await apiService.updateProject(id, projectData);
      setProjects(prev => 
        prev.map(project => 
          project.id === id ? { ...project, ...projectData } : project
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await apiService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    projects, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject 
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
        const data = await apiService.getTasks();
        setTasks(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement des tâches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return { tasks, loading, error };
};

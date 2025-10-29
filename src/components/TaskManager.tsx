import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  User,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import Card from './ui/Card';

interface User {
  id: number;
  prenom: string;
  nom: string;
  entreprise: string;
  courriel: string;
}

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  project_id: number | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  due_date: string;
  progress: number;
  responsible_id: number;
  is_recurrent: boolean;
  recurrent_pattern?: string;
  project_name?: string;
  responsible_name?: string;
  responsible_email?: string;
}

const TaskManager: React.FC = () => {
  const toDateInput = (d?: string) => {
    if (!d) return '';
    // Accept already formatted or ISO strings
    const idx = d.indexOf('T');
    return idx > 0 ? d.slice(0, idx) : d;
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterUser, setFilterUser] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<number | 'none' | null>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: null as number | null,
    milestone_id: null as number | null,
    responsible_id: null as number | null,
    priority: 'Moyenne',
    status: 'À faire',
    start_date: '',
    end_date: '',
    due_date: '',
    is_recurrent: false,
    recurrent_pattern: 'daily'
  });

  useEffect(() => {
    fetchData();
  }, [filterUser, filterStatus, filterProject]);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes, projectsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/users'),
        fetch('/api/projects')
      ]);

      const tasksData = await tasksRes.json();
      const usersData = await usersRes.json();
      const projectsData = await projectsRes.json();

      setTasks(tasksData);
      setUsers(usersData);
      setProjects(projectsData);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setIsLoading(false);
    }
  };

  const fetchMilestones = async (projectId: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const project = await response.json();
      setMilestones(project.milestones || []);
    } catch (error) {
      console.error('Erreur lors du chargement des jalons:', error);
      setMilestones([]);
    }
  };

  const handleProjectChange = (projectId: number | null) => {
    setFormData({ ...formData, project_id: projectId, milestone_id: null });
    if (projectId) {
      fetchMilestones(projectId);
    } else {
      setMilestones([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingTask 
      ? `/api/tasks/${editingTask.id}`
      : '/api/tasks';
    
    const method = editingTask ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      await fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      project_id: task.project_id,
      milestone_id: (task as any).milestone_id || null,
      responsible_id: task.responsible_id,
      priority: task.priority,
      status: task.status,
      start_date: toDateInput(task.start_date),
      end_date: toDateInput(task.end_date),
      due_date: toDateInput(task.due_date),
      is_recurrent: task.is_recurrent,
      recurrent_pattern: task.recurrent_pattern || 'daily'
    });
    
    // Charger les jalons du projet si un projet est sélectionné
    if (task.project_id) {
      fetchMilestones(task.project_id);
    }
    
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setShowForm(false);
    setMilestones([]);
    setFormData({
      title: '',
      description: '',
      project_id: null,
      milestone_id: null,
      responsible_id: null,
      priority: 'Moyenne',
      status: 'À faire',
      start_date: '',
      end_date: '',
      due_date: '',
      is_recurrent: false,
      recurrent_pattern: 'daily'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Terminé': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'En cours': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'En retard': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-green-100 text-green-700 border-green-300';
      case 'En cours': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'En retard': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'text-red-600';
      case 'Moyenne': return 'text-yellow-600';
      case 'Basse': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterUser && task.responsible_id !== filterUser) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterProject === 'none') {
      return task.project_id === null;
    }
    if (filterProject !== null && task.project_id !== filterProject) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Gestion des Tâches</h2>
          <p className="text-slate-600 mt-1">Organisez et suivez vos tâches efficacement</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors shadow-lg"
          style={{ backgroundColor: '#16a34a', color: 'white' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Tâche</span>
        </button>
      </div>

      {/* Filtres */}
      <Card>
        <div className="flex items-center space-x-4 flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="font-medium text-slate-700">Filtres:</span>
          </div>

          {/* Filtre par responsable */}
          <div className="relative">
            <select
              value={filterUser || 'all'}
              onChange={(e) => setFilterUser(e.target.value === 'all' ? null : parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 appearance-none cursor-pointer pr-10"
            >
              <option value="all">Tous les responsables</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.prenom} {user.nom}
                </option>
              ))}
            </select>
            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Filtre par statut */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 appearance-none cursor-pointer pr-10"
            >
              <option value="all">Tous les statuts</option>
              <option value="À faire">À faire</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="En retard">En retard</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Filtre par projet */}
          <div className="relative">
            <select
              value={filterProject === null ? 'all' : filterProject}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'all') return setFilterProject(null);
                if (value === 'none') return setFilterProject('none');
                return setFilterProject(parseInt(value));
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-700 appearance-none cursor-pointer pr-10"
            >
              <option value="all">Tous les projets</option>
              <option value="none">Sans projet</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Compteur */}
          <div className="ml-auto">
            <span className="text-sm text-slate-600">
              {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </Card>

      {/* Liste des tâches */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Aucune tâche trouvée</p>
            </div>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="flex items-start justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">{task.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status}</span>
                      </span>
                      <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        Priorité: {task.priority}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{task.due_date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{task.responsible_name}</span>
                      </div>
                      <div>
                        📁 {task.project_name}
                      </div>
                      {task.is_recurrent && (
                        <span className="text-primary-600">🔄 Récurrent</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de formulaire */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-800">
                  {editingTask ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Responsable */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Responsable *
                    </label>
                    <select
                      required
                      value={formData.responsible_id || ''}
                      onChange={(e) => setFormData({ ...formData, responsible_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sélectionner...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.prenom} {user.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Projet */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Projet
                    </label>
                    <select
                      value={formData.project_id || ''}
                      onChange={(e) => handleProjectChange(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sans projet</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Jalon */}
                  {formData.project_id && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Jalon
                      </label>
                      <select
                        value={formData.milestone_id || ''}
                        onChange={(e) => setFormData({ ...formData, milestone_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Sans jalon</option>
                        {milestones.map(milestone => (
                          <option key={milestone.id} value={milestone.id}>
                            {milestone.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="À faire">À faire</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminé">Terminé</option>
                      <option value="En retard">En retard</option>
                    </select>
                  </div>

                  {/* Priorité */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Priorité
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Basse">Basse</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Haute">Haute</option>
                    </select>
                  </div>

                  {/* Tâche récurrente */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tâche récurrente
                    </label>
                    <div className="flex items-center h-10">
                      <input
                        type="checkbox"
                        checked={formData.is_recurrent}
                        onChange={(e) => setFormData({ ...formData, is_recurrent: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-slate-600">Oui</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Date de début */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date de début
                    </label>
                  <input
                    type="date"
                    value={toDateInput(formData.start_date)}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  </div>

                  {/* Date de fin */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={toDateInput(formData.end_date)}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Date d'échéance */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date d'échéance *
                    </label>
                    <input
                      type="date"
                      required
                      value={toDateInput(formData.due_date)}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Pattern de récurrence */}
                {formData.is_recurrent && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fréquence
                    </label>
                    <select
                      value={formData.recurrent_pattern}
                      onChange={(e) => setFormData({ ...formData, recurrent_pattern: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuelle</option>
                      <option value="yearly">Annuelle</option>
                    </select>
                  </div>
                )}

                {/* Boutons */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#16a34a' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                  >
                    {editingTask ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManager;


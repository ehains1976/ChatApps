import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Folder, TrendingUp, Calendar, Users, CheckCircle, Edit, Trash2, X } from 'lucide-react';
import Card from './ui/Card';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  delivery_date: string;
  team_size: number;
  hours_allocated?: number;
  price?: number;
  owner_prenom?: string;
  owner_nom?: string;
  owner_courriel?: string;
  total_tasks: number;
  completed_tasks: number;
  milestones: string[];
}

const ProjectsList: React.FC = () => {
  const toDateInput = (d?: string) => {
    if (!d) return '';
    // Accept already formatted or ISO strings
    const idx = d.indexOf('T');
    return idx > 0 ? d.slice(0, idx) : d;
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'En cours',
    start_date: '',
    end_date: '',
    delivery_date: '',
    team_size: 1,
    hours_allocated: 0,
    owner_id: null as number | null,
    milestones: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = editingProject 
      ? `/api/projects/${editingProject.id}`
      : '/api/projects';
    
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hours_allocated: Number(formData.hours_allocated) || 0,
          owner_id: formData.owner_id || null,
          milestones: formData.milestones.split(',').map(m => m.trim())
        })
      });

      if (response.ok) {
        await fetchProjects();
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });
      await fetchProjects();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      start_date: toDateInput(project.start_date),
      end_date: toDateInput(project.end_date),
      delivery_date: toDateInput(project.delivery_date),
      team_size: project.team_size,
      hours_allocated: project.hours_allocated || 0,
      owner_id: (project as any).owner_id || null,
      milestones: project.milestones?.join(', ') || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setShowForm(false);
    setFormData({
      name: '',
      description: '',
      status: 'En cours',
      start_date: '',
      end_date: '',
      delivery_date: '',
      team_size: 1,
      hours_allocated: 0,
      owner_id: null,
      milestones: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
      case 'En cours': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      case 'En retard': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#16a34a' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Projets</h2>
          <p className="text-slate-600 mt-1">Gestion et suivi de vos projets</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-lg"
          style={{ backgroundColor: '#16a34a', color: 'white' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau Projet</span>
        </button>
      </div>

      {/* Liste des projets */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {projects.map((project) => {
          const statusColors = getStatusColor(project.status);
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg">
                <div className="p-6">
                  {/* Header du projet */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#f0fdf4' }}>
                        <Folder className="w-6 h-6" style={{ color: '#16a34a' }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">{project.name}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-5 h-5 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" style={{ color: '#dc2626' }} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 mb-4">{project.description}</p>

                  {/* Progression */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Progression</span>
                      <span className="text-sm font-semibold text-slate-800">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div 
                        className="rounded-full h-2.5 transition-all"
                        style={{ 
                          width: `${project.progress}%`,
                          backgroundColor: project.progress === 100 ? '#16a34a' : '#2563eb'
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">{project.completed_tasks}/{project.total_tasks} tâches</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">{project.delivery_date}</span>
                    </div>
                  </div>

                  {/* Hours & Price + Owner */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Heures:</span> {project.hours_allocated ?? 0} h
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Prix:</span> {(((project.hours_allocated ?? 0) * 170)).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                    </div>
                    <div className="text-sm text-slate-600 truncate">
                      <span className="font-medium text-slate-700">Responsable:</span> {project.owner_prenom} {project.owner_nom}
                    </div>
                  </div>

                  {/* Jalons */}
                  {project.milestones && project.milestones.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-slate-700 mb-2 block">Jalons :</span>
                      <div className="flex flex-wrap gap-2">
                        {project.milestones.slice(0, 3).map((milestone, idx) => (
                          <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full border border-primary-200">
                            {milestone}
                          </span>
                        ))}
                        {project.milestones.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                            +{project.milestones.length - 3} autres
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={resetForm}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">
                {editingProject ? 'Modifier le Projet' : 'Nouveau Projet'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date de livraison *
                  </label>
                  <input
                    type="date"
                    required
                    value={toDateInput(formData.delivery_date)}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Responsable du projet *
                  </label>
                  <select
                    required
                    value={formData.owner_id || ''}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner un responsable</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.prenom} {user.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="En retard">En retard</option>
                    <option value="Planifié">Planifié</option>
                  </select>
                </div>

                {/* removed team size field */}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Heures allouées
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.hours_allocated}
                    onChange={(e) => setFormData({ ...formData, hours_allocated: parseInt(e.target.value || '0') })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prix estimé (170$/h)
                  </label>
                  <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50">
                    {((Number(formData.hours_allocated) || 0) * 170).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jalons (séparés par des virgules)
                </label>
                  <input
                    type="text"
                    value={formData.milestones}
                    onChange={(e) => setFormData({ ...formData, milestones: e.target.value })}
                    placeholder="Revue initiale, Développement, Tests, Livraison"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
              </div>

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
                  {editingProject ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectsList;


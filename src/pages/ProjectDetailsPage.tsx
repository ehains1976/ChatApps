import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  Folder,
  TrendingUp
} from 'lucide-react';
import Card from '../components/ui/Card';

interface ProjectDetailsPageProps {
  projectId: number | null;
  onBack: () => void;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  start_date: string;
  end_date: string;
  delivery_date: string;
  hours_allocated?: number;
  owner_prenom?: string;
  owner_nom?: string;
  milestones: Array<{
    id: number;
    name: string;
    due_date: string;
    completed: boolean;
  }>;
  total_tasks: number;
  completed_tasks: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  milestone_id?: number;
  responsible_name?: string;
}

const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails(projectId);
    }
  }, [projectId]);

  const fetchProjectDetails = async (projectId: number) => {
    try {
      setIsLoading(true);
      
      // Récupérer les détails du projet
      const projectRes = await fetch(`/api/projects/${projectId}`);
      const projectData = await projectRes.json();
      
      // Récupérer toutes les tâches du projet
      const tasksRes = await fetch(`/api/tasks?project_id=${projectId}`);
      const tasksData = await tasksRes.json();
      
      console.log('Project data:', projectData);
      console.log('Tasks data:', tasksData);
      console.log('Milestones:', projectData.milestones);
      
      // Debug: vérifier les milestone_id des tâches
      tasksData.forEach((task: any, index: number) => {
        console.log(`Task ${index}: milestone_id = "${task.milestone_id}" (type: ${typeof task.milestone_id})`);
      });
      
      setProject(projectData);
      // Forcer milestone_id en nombre pour un matching strict avec les IDs de jalons
      const normalizedTasks = Array.isArray(tasksData)
        ? tasksData.map((t: any) => ({
            ...t,
            milestone_id: t.milestone_id === null || t.milestone_id === undefined || t.milestone_id === '' || t.milestone_id === 'null'
              ? null
              : Number(t.milestone_id)
          }))
        : [];
      setTasks(normalizedTasks);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTasksByMilestone = (milestoneId: number) => {
    const milestoneTasks = tasks.filter(task => {
      // Gérer les cas où milestone_id est null, undefined, ou string "null"
      if (task.milestone_id === null || task.milestone_id === undefined || task.milestone_id === 'null') {
        return false;
      }
      const taskMilestoneId = Number(task.milestone_id);
      const matches = taskMilestoneId === milestoneId;
      console.log(`Comparing task milestone_id ${taskMilestoneId} (${typeof taskMilestoneId}) with ${milestoneId} (${typeof milestoneId}): ${matches}`);
      return matches;
    });
    console.log(`Tasks for milestone ${milestoneId}:`, milestoneTasks);
    return milestoneTasks;
  };

  const getTasksWithoutMilestone = () => {
    return tasks.filter(task => !task.milestone_id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Terminé': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'En cours': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'À faire': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-green-100 text-green-700 border-green-200';
      case 'En cours': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'À faire': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Non définie';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'Terminé') return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Projet non trouvé</p>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retour aux projets
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{project.name}</h1>
            <p className="text-slate-600">{project.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
            project.status === 'Terminé' ? 'bg-green-100 text-green-700 border-green-200' :
            project.status === 'En cours' ? 'bg-blue-100 text-blue-700 border-blue-200' :
            'bg-gray-100 text-gray-700 border-gray-200'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Stats du projet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Progression</p>
              <p className="text-lg font-semibold text-slate-800">{project.progress}%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Tâches terminées</p>
              <p className="text-lg font-semibold text-slate-800">{project.completed_tasks}/{project.total_tasks}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Livraison</p>
              <p className="text-lg font-semibold text-slate-800">{formatDate(project.delivery_date)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Responsable</p>
              <p className="text-lg font-semibold text-slate-800">{project.owner_prenom} {project.owner_nom}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Jalons et tâches */}
      <div className="space-y-6">
        {/* Tâches par jalon */}
        {project.milestones && project.milestones.length > 0 && project.milestones.map((milestone) => {
          const milestoneTasks = getTasksByMilestone(milestone.id);
          if (milestoneTasks.length === 0) return null;

          return (
            <Card key={milestone.id}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Folder className="w-5 h-5 text-primary-600" />
                    <h3 className="text-xl font-semibold text-slate-800">{milestone.name}</h3>
                    <span className="text-sm text-slate-500">({formatDate(milestone.due_date)})</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    milestone.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {milestone.completed ? 'Terminé' : 'En cours'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tâches terminées */}
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Terminées ({milestoneTasks.filter(t => t.status === 'Terminé').length})</span>
                    </h4>
                    <div className="space-y-2">
                      {milestoneTasks.filter(t => t.status === 'Terminé').map((task) => (
                        <div key={task.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-green-800">{task.title}</h5>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          <p className="text-sm text-green-600">{formatDate(task.due_date)}</p>
                          {task.responsible_name && (
                            <p className="text-xs text-green-500 mt-1">Responsable: {task.responsible_name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tâches en cours */}
                  <div>
                    <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>En cours ({milestoneTasks.filter(t => t.status === 'En cours').length})</span>
                    </h4>
                    <div className="space-y-2">
                      {milestoneTasks.filter(t => t.status === 'En cours').map((task) => (
                        <div key={task.id} className={`p-3 border rounded-lg ${
                          isOverdue(task.due_date, task.status) 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <h5 className={`font-medium ${
                              isOverdue(task.due_date, task.status) ? 'text-red-800' : 'text-blue-800'
                            }`}>
                              {task.title}
                            </h5>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {formatDate(task.due_date)}
                            {isOverdue(task.due_date, task.status) && ' (En retard)'}
                          </p>
                          {task.responsible_name && (
                            <p className={`text-xs mt-1 ${
                              isOverdue(task.due_date, task.status) ? 'text-red-500' : 'text-blue-500'
                            }`}>
                              Responsable: {task.responsible_name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tâches à faire */}
                  <div>
                    <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>À faire ({milestoneTasks.filter(t => t.status === 'À faire').length})</span>
                    </h4>
                    <div className="space-y-2">
                      {milestoneTasks.filter(t => t.status === 'À faire').map((task) => (
                        <div key={task.id} className={`p-3 border rounded-lg ${
                          isOverdue(task.due_date, task.status) 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-orange-50 border-orange-200'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <h5 className={`font-medium ${
                              isOverdue(task.due_date, task.status) ? 'text-red-800' : 'text-orange-800'
                            }`}>
                              {task.title}
                            </h5>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {formatDate(task.due_date)}
                            {isOverdue(task.due_date, task.status) && ' (En retard)'}
                          </p>
                          {task.responsible_name && (
                            <p className={`text-xs mt-1 ${
                              isOverdue(task.due_date, task.status) ? 'text-red-500' : 'text-orange-500'
                            }`}>
                              Responsable: {task.responsible_name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Tâches sans jalon */}
        {getTasksWithoutMilestone().length > 0 && (
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Folder className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-slate-800">Tâches sans jalon</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tâches terminées sans jalon */}
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Terminées ({getTasksWithoutMilestone().filter(t => t.status === 'Terminé').length})</span>
                  </h4>
                  <div className="space-y-2">
                    {getTasksWithoutMilestone().filter(t => t.status === 'Terminé').map((task) => (
                      <div key={task.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-green-800">{task.title}</h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-sm text-green-600">{formatDate(task.due_date)}</p>
                        {task.responsible_name && (
                          <p className="text-xs text-green-500 mt-1">Responsable: {task.responsible_name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tâches en cours sans jalon */}
                <div>
                  <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>En cours ({getTasksWithoutMilestone().filter(t => t.status === 'En cours').length})</span>
                  </h4>
                  <div className="space-y-2">
                    {getTasksWithoutMilestone().filter(t => t.status === 'En cours').map((task) => (
                      <div key={task.id} className={`p-3 border rounded-lg ${
                        isOverdue(task.due_date, task.status) 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <h5 className={`font-medium ${
                            isOverdue(task.due_date, task.status) ? 'text-red-800' : 'text-blue-800'
                          }`}>
                            {task.title}
                          </h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {formatDate(task.due_date)}
                          {isOverdue(task.due_date, task.status) && ' (En retard)'}
                        </p>
                        {task.responsible_name && (
                          <p className={`text-xs mt-1 ${
                            isOverdue(task.due_date, task.status) ? 'text-red-500' : 'text-blue-500'
                          }`}>
                            Responsable: {task.responsible_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tâches à faire sans jalon */}
                <div>
                  <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>À faire ({getTasksWithoutMilestone().filter(t => t.status === 'À faire').length})</span>
                  </h4>
                  <div className="space-y-2">
                    {getTasksWithoutMilestone().filter(t => t.status === 'À faire').map((task) => (
                      <div key={task.id} className={`p-3 border rounded-lg ${
                        isOverdue(task.due_date, task.status) 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-orange-50 border-orange-200'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <h5 className={`font-medium ${
                            isOverdue(task.due_date, task.status) ? 'text-red-800' : 'text-orange-800'
                          }`}>
                            {task.title}
                          </h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          isOverdue(task.due_date, task.status) ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {formatDate(task.due_date)}
                          {isOverdue(task.due_date, task.status) && ' (En retard)'}
                        </p>
                        {task.responsible_name && (
                          <p className={`text-xs mt-1 ${
                            isOverdue(task.due_date, task.status) ? 'text-red-500' : 'text-orange-500'
                          }`}>
                            Responsable: {task.responsible_name}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectDetailsPage;

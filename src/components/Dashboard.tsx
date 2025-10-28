import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FolderOpen,
  Calendar,
  BarChart3,
  Eye
} from 'lucide-react';
import StatsCard from './StatsCard';
import ProjectCard from './ProjectCard';
import Card from './ui/Card';
import { useDashboardStats, useProjects } from '../hooks/useApi';

interface DashboardProps {
  onProjectClick: (projectId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onProjectClick }) => {
  // Utilisation des hooks API
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats();
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();

  // Configuration des KPIs avec les vraies données
  const kpis = [
    {
      title: 'Tâches en cours',
      value: stats.tasksInProgress,
      change: '+12%',
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Tâches terminées',
      value: stats.tasksCompleted,
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Tâches en retard',
      value: stats.tasksOverdue,
      change: '-3%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Projets actifs',
      value: stats.activeProjects,
      change: '+2',
      trend: 'up',
      icon: FolderOpen,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h2>
        <p className="text-slate-600">Vue d'ensemble de vos projets et tâches</p>
      </motion.div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <StatsCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
            icon={kpi.icon}
            color={kpi.color}
            bgColor={kpi.bgColor}
            borderColor={kpi.borderColor}
            delay={0.1 + index * 0.1}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projets en cours */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Projets en cours</h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Voir tout
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectsLoading ? (
                <div className="col-span-2 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Chargement des projets...</p>
                </div>
              ) : projectsError ? (
                <div className="col-span-2 text-center py-8">
                  <p className="text-red-600">Erreur lors du chargement des projets</p>
                </div>
              ) : (
                projects
                  .filter(project => project.status !== 'Terminé' && project.status !== 'Annulé')
                  .slice(0, 6)
                  .map((project, index) => (
                    <div key={project.id} className="relative">
                      <ProjectCard
                        name={project.name}
                        description={project.description}
                        progress={project.progress}
                        status={project.status as any}
                        deadline={project.delivery_date || project.end_date}
                        team={project.team_size || 0}
                        tasks={project.total_tasks || 0}
                        completedTasks={project.completed_tasks || 0}
                        delay={0.3 + index * 0.1}
                      />
                      <button
                        onClick={() => onProjectClick(project.id)}
                        className="absolute top-2 right-2 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
                        title="Voir les détails du projet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Widgets latéraux */}
        <div className="space-y-6">
          {/* Calendrier rapide */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-slate-800">Échéances à venir</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(() => {
                  // Calculer les échéances dans les 7 prochains jours
                  const today = new Date();
                  const nextWeek = new Date(today);
                  nextWeek.setDate(today.getDate() + 7);
                  
                  const upcomingEvents: Array<{title: string, date: string, type: 'project' | 'task'}> = [];
                  
                  // Ajouter les projets avec delivery_date
                  projects.forEach(project => {
                    if (project.delivery_date) {
                      const deliveryDate = new Date(project.delivery_date);
                      if (deliveryDate >= today && deliveryDate <= nextWeek) {
                        upcomingEvents.push({
                          title: project.name,
                          date: project.delivery_date,
                          type: 'project'
                        });
                      }
                    }
                  });
                  
                  // Trier par date
                  upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  
                  // Afficher les 5 prochains
                  const eventsToShow = upcomingEvents.slice(0, 5);
                  
                  if (eventsToShow.length === 0) {
                    return (
                      <div className="text-center py-6 text-slate-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-sm">Aucune échéance</p>
                      </div>
                    );
                  }
                  
                  return eventsToShow.map((event, index) => {
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'short' 
                    });
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className={`w-2 h-2 rounded-full ${event.type === 'project' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                          <p className="text-xs text-slate-500">{formattedDate}</p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          </motion.div>

          {/* Gantt rapide */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-slate-800">Gantt</h3>
              </div>
              <div className="text-center text-slate-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Diagramme de Gantt</p>
                <p className="text-xs text-slate-400">Bientôt disponible</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

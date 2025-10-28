import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FolderOpen,
  Calendar,
  BarChart3
} from 'lucide-react';
import StatsCard from './StatsCard';
import ProjectCard from './ProjectCard';
import Card from './ui/Card';
import { useDashboardStats, useProjects } from '../hooks/useApi';

const Dashboard: React.FC = () => {
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
                    <ProjectCard
                      key={project.id}
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
                <h3 className="text-lg font-semibold text-slate-800">Calendrier</h3>
              </div>
              <div className="text-center text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Calendrier interactif</p>
                <p className="text-xs text-slate-400">Bientôt disponible</p>
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

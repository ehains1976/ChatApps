import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Target, MoreHorizontal } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';

interface ProjectCardProps {
  name: string;
  description: string;
  progress: number;
  status: 'En cours' | 'Terminé' | 'En retard' | 'Planifié';
  deadline: string;
  team: number;
  tasks: number;
  completedTasks: number;
  delay?: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  progress,
  status,
  deadline,
  team,
  tasks,
  completedTasks,
  delay = 0,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'En retard':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Planifié':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getProgressColor = (progress: number, status: string) => {
    if (progress === 100) return 'bg-green-500';
    if (status === 'En retard') return 'bg-red-500';
    return 'bg-primary-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 text-lg mb-1">{name}</h4>
            <p className="text-slate-600 text-sm">{description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(status)}`}>
              {status}
            </span>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Progression</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: delay + 0.2 }}
              className={`h-2 rounded-full ${getProgressColor(progress, status)}`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-slate-500 mr-1" />
              <span className="text-sm text-slate-600">Équipe</span>
            </div>
            <p className="text-lg font-semibold text-slate-800">{team}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 text-slate-500 mr-1" />
              <span className="text-sm text-slate-600">Tâches</span>
            </div>
            <p className="text-lg font-semibold text-slate-800">{completedTasks}/{tasks}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-slate-500 mr-1" />
              <span className="text-sm text-slate-600">Échéance</span>
            </div>
            <p className="text-sm font-medium text-slate-800">{deadline}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="primary" size="sm" className="flex-1">
            Voir détails
          </Button>
          <Button variant="outline" size="sm">
            Modifier
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;

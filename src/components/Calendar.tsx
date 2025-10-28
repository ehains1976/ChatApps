import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Folder, CheckSquare } from 'lucide-react';
import Card from './ui/Card';

interface Project {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  delivery_date: string;
  status: string;
  milestones: string[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  due_date: string;
  project_id: number | null;
  responsible_name?: string;
  project_name?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'project' | 'task';
  project?: string;
  responsible?: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'both'>('both');
  const [filteredResponsible, setFilteredResponsible] = useState<number | null>(null);

  // Fonction pour normaliser les dates au format yyyy-MM-dd
  const normalizeDate = (dateStr: string | undefined | null): string | null => {
    if (!dateStr) return null;
    // Si c'est déjà au format yyyy-MM-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Si c'est au format ISO, extraire juste la date
    const idx = dateStr.indexOf('T');
    if (idx > 0) return dateStr.slice(0, idx);
    return dateStr;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks')
      ]);

      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();

      console.log('Projects loaded:', projectsData.length);
      console.log('Tasks loaded:', tasksData.length);
      console.log('Sample project:', projectsData[0]);
      console.log('Sample task:', tasksData[0]);

      setProjects(projectsData);
      setTasks(tasksData);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = new Date(year, month - 1, lastDay.getDate() - i);
      days.push({ date: prevMonth, isCurrentMonth: false });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({ date: currentDay, isCurrentMonth: true });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = new Date(year, month + 1, day);
      days.push({ date: nextMonth, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date): { projects: CalendarEvent[]; tasks: CalendarEvent[] } => {
    const dateStr = date.toISOString().split('T')[0];
    const events = { projects: [] as CalendarEvent[], tasks: [] as CalendarEvent[] };

    // Projets dont la date de livraison correspond
    projects.forEach(project => {
      const normalizedDeliveryDate = normalizeDate(project.delivery_date);
      if (normalizedDeliveryDate === dateStr) {
        events.projects.push({
          id: `project-${project.id}`,
          title: project.name,
          date: normalizedDeliveryDate || '',
          type: 'project',
          project: project.name
        });
      }
    });

    // Tâches
    tasks.forEach(task => {
      const taskDueDate = normalizeDate(task.due_date || task.end_date);
      if (taskDueDate === dateStr) {
        // Filtrer par responsable si nécessaire
        if (filteredResponsible && task.project_id !== filteredResponsible) {
          return;
        }

        events.tasks.push({
          id: `task-${task.id}`,
          title: task.title,
          date: taskDueDate || '',
          type: 'task',
          project: task.project_name,
          responsible: task.responsible_name
        });
      }
    });

    return events;
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-green-100 text-green-700 border-green-200';
      case 'task': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return <Folder className="w-3 h-3" />;
      case 'task': return <CheckSquare className="w-3 h-3" />;
      default: return '📅';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
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
      {/* Header du calendrier */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-slate-800">Calendrier</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Onglets Projets/Tâches */}
        <div className="mb-6 flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'projects'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Folder className="w-4 h-4 inline mr-2" />
            Projets
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'tasks'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <CheckSquare className="w-4 h-4 inline mr-2" />
            Tâches
          </button>
          <button
            onClick={() => setActiveTab('both')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'both'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            📅 Les deux
          </button>
        </div>

        {/* Mois/Année */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-800 capitalize">
            {formatDate(currentDate)}
          </h3>
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden">
          {/* En-têtes des jours */}
          {weekDays.map((day) => (
            <div key={day} className="bg-slate-50 p-3 text-center">
              <span className="text-sm font-medium text-slate-600">{day}</span>
            </div>
          ))}
          
          {/* Jours du mois */}
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isCurrentMonth = day.isCurrentMonth;
            const isTodayDate = isToday(day.date);
            
            // Déterminer quels événements afficher selon l'onglet actif
            const displayEvents: CalendarEvent[] = [];
            
            if (activeTab === 'projects' || activeTab === 'both') {
              displayEvents.push(...dayEvents.projects);
            }
            if (activeTab === 'tasks' || activeTab === 'both') {
              displayEvents.push(...dayEvents.tasks);
            }
            
            return (
              <div
                key={index}
                className={`bg-white min-h-[120px] p-2 border-b border-r border-slate-200 ${
                  !isCurrentMonth ? 'bg-slate-50 text-slate-400' : ''
                } ${isTodayDate ? 'bg-primary-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isTodayDate ? 'text-primary-600' : isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {isTodayDate && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  )}
                </div>
                
                {/* Événements du jour */}
                <div className="space-y-1">
                  {displayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded border flex items-center space-x-1 ${getEventTypeColor(event.type)}`}
                      title={`${event.title}${event.project ? ` - ${event.project}` : ''}${event.responsible ? ` - ${event.responsible}` : ''}`}
                    >
                      {getEventTypeIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {displayEvents.length > 3 && (
                    <div className="text-xs text-slate-500">
                      +{displayEvents.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Légende */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Légende</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border bg-green-100 border-green-200"></div>
            <span className="text-sm text-slate-600">📁 Projets</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded border bg-blue-100 border-blue-200"></div>
            <span className="text-sm text-slate-600">✅ Tâches</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Calendar;

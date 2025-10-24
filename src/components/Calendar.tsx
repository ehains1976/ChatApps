import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import Card from './ui/Card';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'milestone' | 'meeting' | 'task';
  project?: string;
  time?: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);

  // Données d'événements simulées
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Échéance Projet Alpha',
        date: '2024-02-15',
        type: 'deadline',
        project: 'Projet Alpha',
        time: '17:00'
      },
      {
        id: '2',
        title: 'Réunion équipe Beta',
        date: '2024-01-25',
        type: 'meeting',
        project: 'Projet Beta',
        time: '14:00'
      },
      {
        id: '3',
        title: 'Jalon Gamma',
        date: '2024-01-30',
        type: 'milestone',
        project: 'Projet Gamma',
        time: '09:00'
      },
      {
        id: '4',
        title: 'Tâche Delta critique',
        date: '2024-01-20',
        type: 'task',
        project: 'Projet Delta',
        time: '16:00'
      },
      {
        id: '5',
        title: 'Revue mensuelle',
        date: '2024-01-31',
        type: 'meeting',
        time: '10:00'
      }
    ];
    setEvents(mockEvents);
  }, []);

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

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-red-100 text-red-700 border-red-200';
      case 'milestone': return 'bg-green-100 text-green-700 border-green-200';
      case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'task': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return '⏰';
      case 'milestone': return '🎯';
      case 'meeting': return '👥';
      case 'task': return '✅';
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
            
            {/* Vues */}
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
              {(['month', 'week', 'day'] as const).map((viewType) => (
                <button
                  key={viewType}
                  onClick={() => setView(viewType)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    view === viewType
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {viewType === 'month' ? 'Mois' : viewType === 'week' ? 'Semaine' : 'Jour'}
                </button>
              ))}
            </div>
            
            {/* Bouton ajouter événement */}
            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Mois/Année */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-800">
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
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} truncate`}
                      title={`${event.title} - ${event.time || ''}`}
                    >
                      <span className="mr-1">{getEventTypeIcon(event.type)}</span>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-slate-500">
                      +{dayEvents.length - 3} autres
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
          {[
            { type: 'deadline', label: 'Échéances', icon: '⏰' },
            { type: 'milestone', label: 'Jalons', icon: '🎯' },
            { type: 'meeting', label: 'Réunions', icon: '👥' },
            { type: 'task', label: 'Tâches', icon: '✅' }
          ].map((item) => (
            <div key={item.type} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded border ${getEventTypeColor(item.type)}`}></div>
              <span className="text-sm text-slate-600">{item.icon} {item.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default Calendar;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Users,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage }) => {
  const [counts, setCounts] = useState({
    projects: 0,
    tasks: 0,
    users: 0,
    calendar: 0
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [projectsRes, tasksRes, usersRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/tasks'),
          fetch('/api/users')
        ]);

        const projects = await projectsRes.json();
        const tasks = await tasksRes.json();
        const users = await usersRes.json();

        // Compter les événements du calendrier (projets avec delivery_date + tâches avec due_date)
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const calendarEvents = [
          ...projects.filter((p: any) => p.delivery_date && new Date(p.delivery_date) >= today && new Date(p.delivery_date) <= nextWeek),
          ...tasks.filter((t: any) => (t.due_date || t.end_date) && new Date(t.due_date || t.end_date) >= today && new Date(t.due_date || t.end_date) <= nextWeek)
        ];

        setCounts({
          projects: projects.length,
          tasks: tasks.length,
          users: users.length,
          calendar: calendarEvents.length
        });
      } catch (error) {
        console.error('Erreur lors du chargement des compteurs:', error);
      }
    };

    fetchCounts();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard', count: 0 },
    { icon: FolderOpen, label: 'Projets', page: 'projects', count: counts.projects },
    { icon: CheckSquare, label: 'Tâches', page: 'tasks', count: counts.tasks },
    { icon: Calendar, label: 'Calendrier', page: 'calendar', count: counts.calendar },
    { icon: BookOpen, label: 'Journal d\'Opérations', page: 'operations', count: 0 },
    { icon: BarChart3, label: 'Rapports', page: 'reports', count: 0 },
    { icon: Users, label: 'Équipe', page: 'team', count: counts.users },
  ];

  return (
    <motion.aside 
      className="w-64 bg-white border-r border-slate-200 flex flex-col"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                  currentPage === item.page
                    ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${currentPage === item.page ? 'text-primary-600' : 'text-slate-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    currentPage === item.page
                      ? 'bg-primary-100 text-primary-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </nav>

    </motion.aside>
  );
};

export default Sidebar;

import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderOpen, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Users
} from 'lucide-react';

interface SidebarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPage }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard', count: 0 },
    { icon: FolderOpen, label: 'Projets', page: 'projects', count: 12 },
    { icon: CheckSquare, label: 'Tâches', page: 'tasks', count: 45 },
    { icon: Calendar, label: 'Calendrier', page: 'calendar', count: 8 },
    { icon: BarChart3, label: 'Rapports', page: 'reports', count: 0 },
    { icon: Users, label: 'Équipe', page: 'team', count: 0 },
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

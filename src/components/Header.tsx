import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  user?: any;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <motion.header 
      className="bg-white border-b border-slate-200 px-6 py-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">VertProjet</h1>
              <p className="text-sm text-slate-500">Gestion de Projets TI</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher projets, tâches..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>

          {/* User Profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-slate-800">{user?.prenom} {user?.nom}</p>
              <p className="text-slate-500">{user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
            </div>
          </motion.div>

          {/* Logout Button */}
          {onLogout && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

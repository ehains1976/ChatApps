import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import ProjectsPage from './pages/ProjectsPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Login from './components/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Afficher le login si non authentifié
  if (!user && !isLoading) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.5rem', color: '#64748b' }}>Chargement...</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'calendar':
        return <Calendar />;
      case 'tasks':
        return <TasksPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'team':
        return <UsersPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: '#0f172a' }}>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
        
        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <Header user={user} onLogout={handleLogout} />
          
          {/* Page Content */}
          <motion.main 
            style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderPage()}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default App;
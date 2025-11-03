import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import OperationsLogPage from './pages/OperationsLogPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Calendar from './components/Calendar';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  // Utilisateur par défaut (sans authentification)
  const [user] = useState<any>({
    id: 1,
    prenom: 'Admin',
    nom: 'Local',
    courriel: 'admin@local',
    role: 'admin'
  });

  const navigateToProject = (projectId: number) => {
    setCurrentProjectId(projectId);
    setCurrentPage('project-details');
  };

  const navigateBack = () => {
    setCurrentProjectId(null);
    setCurrentPage('projects');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'calendar':
        return <Calendar />;
      case 'tasks':
        return <TasksPage />;
      case 'projects':
        return <ProjectsPage onProjectClick={navigateToProject} />;
      case 'project-details':
        return <ProjectDetailsPage projectId={currentProjectId} onBack={navigateBack} />;
      case 'operations':
        return <OperationsLogPage />;
      case 'team':
        return <UsersPage />;
      case 'dashboard':
      default:
        return <DashboardPage onProjectClick={navigateToProject} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)', color: '#0f172a' }}>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar */}
        <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
        
        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <Header user={user} onLogout={() => {}} />
          
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
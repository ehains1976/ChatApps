import React from 'react';
import Dashboard from '../components/Dashboard';

interface DashboardPageProps {
  onProjectClick: (projectId: number) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onProjectClick }) => {
  return <Dashboard onProjectClick={onProjectClick} />;
};

export default DashboardPage;

import React from 'react';
import ProjectsList from '../components/ProjectsList';

interface ProjectsPageProps {
  onProjectClick: (projectId: number) => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onProjectClick }) => {
  return <ProjectsList onProjectClick={onProjectClick} />;
};

export default ProjectsPage;


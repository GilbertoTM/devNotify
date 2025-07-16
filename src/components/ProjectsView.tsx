import React from 'react';
import { ProjectCard } from './ProjectCard';
import { Project } from '../types';
import { Plus, Search } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onProjectClick }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Projects</h2>
          <p className="text-gray-400">Manage and monitor all your development projects</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            {...project}
            onClick={onProjectClick}
          />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to start monitoring your development ecosystem</p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Create Project
          </button>
        </div>
      )}
    </div>
  );
};
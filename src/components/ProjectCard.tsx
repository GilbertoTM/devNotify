import React from 'react';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  UsersIcon, 
  ChartBarIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { Project } from '../types';

interface ProjectCardProps extends Project {
  onClick: (projectId: string) => void;
}

const statusStyles = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  maintenance: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  color,
  status,
  services,
  lastActivity,
  criticalAlerts,
  warningAlerts,
  members,
  onClick
}) => {
  return (
    <div 
      onClick={() => onClick(id)}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:bg-gray-800/70 hover:border-gray-600/70 hover:shadow-xl hover:shadow-gray-900/20 hover:scale-105 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full border border-gray-600 shadow-sm group-hover:scale-110 transition-transform duration-200"
            style={{ backgroundColor: color }}
          ></div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-gray-100 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full border ${statusStyles[status]}`}>
            {status}
          </span>
          <ChevronRightIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-400 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
          <span className="text-sm text-gray-300">{criticalAlerts} Critical</span>
        </div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-gray-300">{warningAlerts} Warnings</span>
        </div>
        <div className="flex items-center space-x-2">
          <UsersIcon className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">{members} Members</span>
        </div>
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300">{lastActivity}</span>
        </div>
      </div>

      <div className="border-t border-gray-700/50 pt-3">
        <p className="text-xs text-gray-500 mb-2">Connected Services</p>
        <div className="flex flex-wrap gap-1">
          {services.slice(0, 4).map((service, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-md backdrop-blur-sm"
            >
              {service}
            </span>
          ))}
          {services.length > 4 && (
            <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-md backdrop-blur-sm">
              +{services.length - 4} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
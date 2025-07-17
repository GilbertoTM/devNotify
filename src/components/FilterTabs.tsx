import React from 'react';
import { 
  ServerIcon, 
  CodeBracketIcon, 
  ShieldCheckIcon, 
  CircleStackIcon, 
  CloudIcon, 
  ExclamationTriangleIcon, 
  FolderOpenIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  counts: Record<string, number>;
  activeView: 'notifications' | 'projects' | 'docker';
  onViewChange: (view: 'notifications' | 'projects' | 'docker') => void;
}

const filters = [
  { id: 'all', label: 'All', icon: SparklesIcon },
  { id: 'infrastructure', label: 'Infrastructure', icon: ServerIcon },
  { id: 'ci_cd', label: 'CI/CD', icon: CodeBracketIcon },
  { id: 'security', label: 'Security', icon: ShieldCheckIcon },
  { id: 'database', label: 'Database', icon: CircleStackIcon },
  { id: 'application', label: 'Application', icon: CloudIcon },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({ 
  activeFilter, 
  onFilterChange, 
  counts, 
  activeView, 
  onViewChange 
}) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 mb-6">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onViewChange('notifications')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeView === 'notifications'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => onViewChange('projects')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeView === 'projects'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => onViewChange('docker')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeView === 'docker'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            Docker
          </button>
        </div>
        
        {activeView === 'notifications' && (
          <div className="flex items-center space-x-2">
            {Object.entries(counts).map(([filter, count]) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)} ({count})
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
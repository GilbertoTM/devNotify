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
  activeView: 'notifications' | 'projects';
  onViewChange: (view: 'notifications' | 'projects') => void;
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
    <div className="mb-6">
      {/* View Toggle */}
      <div className="flex space-x-1 mb-4">
        <button
          onClick={() => onViewChange('notifications')}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg
            transition-all duration-300 hover:bg-gray-700/50 hover:scale-105
            ${activeView === 'notifications' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25' 
              : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
            }
          `}
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Notifications</span>
        </button>
        <button
          onClick={() => onViewChange('projects')}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg
            transition-all duration-300 hover:bg-gray-700/50 hover:scale-105
            ${activeView === 'projects' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25' 
              : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
            }
          `}
        >
          <FolderOpenIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Projects</span>
        </button>
      </div>

      {/* Category Filters (only show for notifications view) */}
      {activeView === 'notifications' && (
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            const count = counts[filter.id] || 0;
            
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap
                  transition-all duration-300 hover:bg-gray-700/50 hover:scale-105
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25' 
                    : 'bg-gray-800/50 text-gray-400 hover:text-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{filter.label}</span>
                {count > 0 && (
                  <span className={`
                    px-2 py-1 text-xs rounded-full min-w-[20px] text-center
                    ${isActive ? 'bg-blue-500/80 text-white' : 'bg-gray-700/80 text-gray-300'}
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
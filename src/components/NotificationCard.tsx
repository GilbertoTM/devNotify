import React from 'react';
import { 
  ClockIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  CodeBracketIcon,
  ServerIcon,
  ShieldCheckIcon,
  CircleStackIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import { Notification } from '../types';

interface NotificationCardProps extends Notification {
  actions?: { label: string; action: () => void }[];
}

const categoryIcons = {
  infrastructure: ServerIcon,
  ci_cd: CodeBracketIcon,
  security: ShieldCheckIcon,
  database: CircleStackIcon,
  application: CloudIcon,
};

const typeStyles = {
  critical: 'border-red-500 bg-red-500/10 text-red-400',
  warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  info: 'border-blue-500 bg-blue-500/10 text-blue-400',
  success: 'border-green-500 bg-green-500/10 text-green-400',
};

const typeIcons = {
  critical: ExclamationCircleIcon,
  warning: ExclamationCircleIcon,
  info: ExclamationCircleIcon,
  success: CheckCircleIcon,
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  service,
  title,
  description,
  timestamp,
  category,
  isRead = false,
  projectName,
  projectColor,
  actions = []
}) => {
  const CategoryIcon = categoryIcons[category] || CloudIcon; // Fallback a CloudIcon
  const TypeIcon = typeIcons[type] || ExclamationCircleIcon; // Fallback a ExclamationCircleIcon

  return (
    <div className={`
      relative border-l-4 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-3
      hover:bg-gray-800/70 hover:shadow-lg hover:shadow-gray-900/20 hover:scale-[1.02] transition-all duration-300 group
      ${typeStyles[type] || typeStyles.info}
      ${isRead ? 'opacity-60' : ''}
    `}>
      <div className="flex items-start space-x-4">
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-full
          ${typeStyles[type] || typeStyles.info} border backdrop-blur-sm group-hover:scale-110 transition-transform duration-200
        `}>
          <TypeIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full border border-gray-600 shadow-sm"
              style={{ backgroundColor: projectColor }}
            ></div>
            <span className="text-xs font-medium text-gray-300">{projectName}</span>
            <span className="text-xs text-gray-500">•</span>
            <CategoryIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-300 transition-colors" />
            <span className="text-sm font-medium text-gray-300">{service}</span>
            <span className="text-xs text-gray-500">•</span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <ClockIcon className="w-3 h-3" />
              <span>{timestamp}</span>
            </div>
          </div>
          
          <h3 className="text-white font-medium mb-1 group-hover:text-gray-100 transition-colors">
            {title}
          </h3>
          
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {description}
          </p>
          
          {actions.length > 0 && (
            <div className="flex space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-600/70 text-gray-300 rounded-md transition-all duration-200 hover:scale-105"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {!isRead && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
    </div>
  );
};
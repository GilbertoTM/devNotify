import React from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

interface StatusBarProps {
  stats: {
    total: number;
    critical: number;
    warning: number;
    resolved: number;
  };
}

export const StatusBar: React.FC<StatusBarProps> = ({ stats }) => {
  const statusItems = [
    { 
      label: 'Total Notifications', 
      value: stats.total, 
      icon: ChartBarIcon, 
      color: 'text-blue-400',
      bg: 'bg-gradient-to-br from-blue-500/10 to-blue-600/5',
      border: 'border-blue-500/20'
    },
    { 
      label: 'Critical', 
      value: stats.critical, 
      icon: ExclamationTriangleIcon, 
      color: 'text-red-400',
      bg: 'bg-gradient-to-br from-red-500/10 to-red-600/5',
      border: 'border-red-500/20'
    },
    { 
      label: 'Warnings', 
      value: stats.warning, 
      icon: ClockIcon, 
      color: 'text-yellow-400',
      bg: 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5',
      border: 'border-yellow-500/20'
    },
    { 
      label: 'Resolved', 
      value: stats.resolved, 
      icon: CheckCircleIcon, 
      color: 'text-green-400',
      bg: 'bg-gradient-to-br from-green-500/10 to-green-600/5',
      border: 'border-green-500/20'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statusItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={`
            ${item.bg} border ${item.border} rounded-xl p-6 backdrop-blur-sm
            hover:scale-105 hover:shadow-lg hover:shadow-gray-900/20 transition-all duration-300 group
          `}>
            <div className="flex items-center space-x-4">
              <Icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform duration-200`} />
              <div>
                <p className="text-sm text-gray-400">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
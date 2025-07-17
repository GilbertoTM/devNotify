import React, { useState, useMemo } from 'react';
import { 
  ClockIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  TagIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Notification, NotificationFilter, Project, NotificationPattern } from '../types';
import { NotificationCard } from './NotificationCard';
import { NotificationHistory } from './NotificationHistory';
import { PatternAnalysis } from './PatternAnalysis';

interface ProjectNotificationsProps {
  project: Project;
  notifications: Notification[];
  patterns: NotificationPattern[];
  onMarkAsRead: (id: string) => void;
  onResolveNotification: (id: string) => void;
  onExportData: (format: 'csv' | 'json' | 'pdf') => void;
}

export const ProjectNotifications: React.FC<ProjectNotificationsProps> = ({
  project,
  notifications,
  patterns,
  onMarkAsRead,
  onResolveNotification,
  onExportData
}) => {
  const [activeTab, setActiveTab] = useState<'live' | 'history' | 'patterns'>('live');
  const [filter, setFilter] = useState<NotificationFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter notifications based on current filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Project filter
      if (notification.projectId !== project.id) return false;
      
      // Search query
      if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !notification.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !notification.service.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filter.categories && filter.categories.length > 0 && 
          !filter.categories.includes(notification.category)) {
        return false;
      }
      
      // Type filter
      if (filter.types && filter.types.length > 0 && 
          !filter.types.includes(notification.type)) {
        return false;
      }
      
      // Service filter
      if (filter.services && filter.services.length > 0 && 
          !filter.services.includes(notification.service)) {
        return false;
      }
      
      // Severity filter
      if (filter.severity && filter.severity.length > 0 && 
          !filter.severity.includes(notification.severity)) {
        return false;
      }
      
      // Resolved filter
      if (filter.resolved !== undefined && notification.resolved !== filter.resolved) {
        return false;
      }
      
      // Date range filter
      if (filter.dateRange) {
        const notificationDate = new Date(notification.exactTimestamp);
        if (notificationDate < filter.dateRange.start || notificationDate > filter.dateRange.end) {
          return false;
        }
      }
      
      return true;
    });
  }, [notifications, project.id, searchQuery, filter]);

  // Get live notifications (recent, unresolved)
  const liveNotifications = filteredNotifications.filter(n => !n.resolved);
  
  // Get statistics
  const stats = useMemo(() => {
    const projectNotifications = notifications.filter(n => n.projectId === project.id);
    return {
      total: projectNotifications.length,
      unresolved: projectNotifications.filter(n => !n.resolved).length,
      critical: projectNotifications.filter(n => n.type === 'critical' && !n.resolved).length,
      patterns: patterns.length,
      avgResolutionTime: '2.5 hours' // This would be calculated from actual data
    };
  }, [notifications, project.id, patterns]);

  const tabs = [
    { id: 'live', label: 'Live Notifications', icon: ExclamationTriangleIcon, count: liveNotifications.length },
    { id: 'history', label: 'History', icon: ClockIcon, count: filteredNotifications.length },
    { id: 'patterns', label: 'Pattern Analysis', icon: ChartBarIcon, count: patterns.length },
  ];

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/30 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            ></div>
            <h2 className="text-2xl font-bold text-white">{project.name}</h2>
            <span className={`
              px-3 py-1 text-sm rounded-full
              ${project.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                project.status === 'maintenance' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                'bg-gray-500/10 text-gray-400 border border-gray-500/20'}
            `}>
              {project.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onExportData('csv')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">Export</span>
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-gray-400">Total Notifications</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{stats.unresolved}</div>
            <div className="text-sm text-gray-400">Unresolved</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-sm text-gray-400">Critical</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">{stats.patterns}</div>
            <div className="text-sm text-gray-400">Patterns Found</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">{stats.avgResolutionTime}</div>
            <div className="text-sm text-gray-400">Avg Resolution</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
              ${showFilters 
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400' 
                : 'bg-gray-700/50 border border-gray-600/50 text-gray-400 hover:text-gray-300'
              }
            `}
          >
            <FunnelIcon className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700/50">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
              <select 
                multiple
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFilter(prev => ({ ...prev, categories: values }));
                }}
              >
                <option value="infrastructure">Infrastructure</option>
                <option value="ci_cd">CI/CD</option>
                <option value="security">Security</option>
                <option value="database">Database</option>
                <option value="application">Application</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Types</label>
              <select 
                multiple
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFilter(prev => ({ ...prev, types: values }));
                }}
              >
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select 
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                onChange={(e) => {
                  const value = e.target.value;
                  setFilter(prev => ({ 
                    ...prev, 
                    resolved: value === 'all' ? undefined : value === 'resolved' 
                  }));
                }}
              >
                <option value="all">All</option>
                <option value="unresolved">Unresolved</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25' 
                  : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              <span className={`
                px-2 py-1 text-xs rounded-full min-w-[20px] text-center
                ${activeTab === tab.id ? 'bg-blue-500/80 text-white' : 'bg-gray-700/80 text-gray-300'}
              `}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'live' && (
          <div>
            {liveNotifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No active notifications</h3>
                <p className="text-gray-500">All notifications for this project have been resolved.</p>
              </div>
            ) : (
              liveNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  {...notification}
                  actions={[
                    { label: 'Mark as Read', action: () => onMarkAsRead(notification.id) },
                    { label: 'Resolve', action: () => onResolveNotification(notification.id) },
                  ]}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <NotificationHistory 
            notifications={filteredNotifications}
            onMarkAsRead={onMarkAsRead}
            onResolveNotification={onResolveNotification}
          />
        )}

        {activeTab === 'patterns' && (
          <PatternAnalysis 
            patterns={patterns}
            notifications={filteredNotifications}
          />
        )}
      </div>
    </div>
  );
};
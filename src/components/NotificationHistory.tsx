import React, { useState, useMemo } from 'react';
import { 
  ClockIcon, 
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { Notification } from '../types';

interface NotificationHistoryProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onResolveNotification: (id: string) => void;
}

export const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  notifications,
  onMarkAsRead,
  onResolveNotification
}) => {
  const [groupBy, setGroupBy] = useState<'date' | 'category' | 'service'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Group notifications
  const groupedNotifications = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => {
      const dateA = new Date(a.exactTimestamp).getTime();
      const dateB = new Date(b.exactTimestamp).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    const groups: Record<string, Notification[]> = {};

    sorted.forEach(notification => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'date':
          groupKey = new Date(notification.exactTimestamp).toDateString();
          break;
        case 'category':
          groupKey = notification.category;
          break;
        case 'service':
          groupKey = notification.service;
          break;
        default:
          groupKey = 'All';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [notifications, groupBy, sortOrder]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(new Date(timestamp));
  };

  const getGroupIcon = (groupKey: string) => {
    switch (groupBy) {
      case 'date':
        return CalendarIcon;
      case 'category':
        return ExclamationCircleIcon;
      case 'service':
        return CheckCircleIcon;
      default:
        return ClockIcon;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Group By</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="date">Date</option>
              <option value="category">Category</option>
              <option value="service">Service</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-all duration-200">
          <ArrowDownTrayIcon className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400">Export History</span>
        </button>
      </div>

      {/* Grouped Notifications */}
      <div className="space-y-3">
        {Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => {
          const isExpanded = expandedGroups.has(groupKey);
          const GroupIcon = getGroupIcon(groupKey);
          
          return (
            <div key={groupKey} className="bg-gray-800/30 rounded-lg border border-gray-700/50">
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <GroupIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-white font-medium">{groupKey}</span>
                  <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-full">
                    {groupNotifications.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-700/50">
                  {groupNotifications.map((notification, index) => (
                    <div 
                      key={notification.id}
                      className={`
                        p-4 hover:bg-gray-700/20 transition-colors
                        ${index !== groupNotifications.length - 1 ? 'border-b border-gray-700/30' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`
                              px-2 py-1 text-xs rounded-full
                              ${notification.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                                notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                notification.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-green-500/20 text-green-400'}
                            `}>
                              {notification.type}
                            </span>
                            <span className="text-sm text-gray-400">{notification.service}</span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.exactTimestamp)}
                            </span>
                            {notification.resolved && (
                              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                                Resolved
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-white font-medium mb-1">{notification.title}</h4>
                          <p className="text-sm text-gray-400 mb-2">{notification.description}</p>
                          
                          {notification.tags && notification.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {notification.tags.map((tag, tagIndex) => (
                                <span 
                                  key={tagIndex}
                                  className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-md"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {notification.resolvedAt && notification.resolvedBy && (
                            <div className="text-xs text-gray-500">
                              Resolved by {notification.resolvedBy} on {formatTimestamp(notification.resolvedAt)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md transition-colors"
                            >
                              Mark Read
                            </button>
                          )}
                          {!notification.resolved && (
                            <button
                              onClick={() => onResolveNotification(notification.id)}
                              className="px-3 py-1 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-md transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <ClockIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No history available</h3>
          <p className="text-gray-500">No notifications match your current filters.</p>
        </div>
      )}
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Notification, Project, Integration, Team, User, NotificationPattern } from '../types';
import { useSupabaseData } from './useSupabaseData';
import { useAuth } from './useAuth';

// Mock patterns data
const mockPatterns: NotificationPattern[] = [
  {
    id: 'pattern-1',
    type: 'recurring',
    title: 'Daily CPU Spikes',
    description: 'CPU usage consistently spikes every day around 2 PM, likely due to batch processing jobs',
    frequency: 15,
    lastOccurrence: new Date(Date.now() - 2 * 60 * 1000),
    relatedNotifications: ['1', '7'],
    severity: 'medium',
    suggestion: 'Consider optimizing batch processing jobs or scaling resources during peak hours'
  },
  {
    id: 'pattern-2',
    type: 'common_error',
    title: 'Database Connection Timeouts',
    description: 'Frequent database connection timeouts occurring during high traffic periods',
    frequency: 8,
    lastOccurrence: new Date(Date.now() - 8 * 60 * 1000),
    relatedNotifications: ['3'],
    severity: 'high',
    suggestion: 'Increase connection pool size or implement connection pooling optimization'
  },
  {
    id: 'pattern-3',
    type: 'escalating',
    title: 'Build Time Increase',
    description: 'CI/CD build times have been gradually increasing over the past week',
    frequency: 12,
    lastOccurrence: new Date(Date.now() - 5 * 60 * 1000),
    relatedNotifications: ['2'],
    severity: 'medium',
    suggestion: 'Review build process for optimization opportunities or consider parallel builds'
  }
];

export const useNotifications = () => {
  const { user } = useAuth();
  const {
    projects,
    teams,
    integrations,
    notifications,
    createProject: createSupabaseProject,
    createTeam: createSupabaseTeam,
    addIntegration: addSupabaseIntegration,
    markNotificationAsRead,
    resolveNotification: resolveSupabaseNotification,
  } = useSupabaseData(user?.id || null);
  
  // Debug logs
  console.log('📊 [useNotifications] Current user:', user?.id);
  console.log('📊 [useNotifications] Total notifications:', notifications.length);
  console.log('📊 [useNotifications] Notifications:', notifications);
  
  const [patterns] = useState<NotificationPattern[]>(mockPatterns);
  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(notification => {
    // TEMPORAL: Deshabilitado filtro por proyecto para debug
    // if (selectedProject && notification.projectId !== selectedProject) {
    //   return false;
    // }
    
    // Filter by category
    if (filter === 'all') return true;
    return notification.category === filter;
  });

  console.log('🔍 [useNotifications] Filter:', filter);
  console.log('🔍 [useNotifications] Selected project:', selectedProject);
  console.log('🔍 [useNotifications] Filtered notifications:', filteredNotifications.length);
  console.log('🔍 [useNotifications] Filtered notifications:', filteredNotifications);

  const getCounts = () => {
    const counts: Record<string, number> = {
      all: notifications.length,
      infrastructure: 0,
      ci_cd: 0,
      security: 0,
      database: 0,
      application: 0,
    };

    const notificationsToCount = selectedProject 
      ? notifications.filter(n => n.projectId === selectedProject)
      : notifications;

    notificationsToCount.forEach(notification => {
      counts[notification.category]++;
    });

    return counts;
  };

  const getStats = () => {
    const notificationsToCount = selectedProject 
      ? notifications.filter(n => n.projectId === selectedProject)
      : notifications;
      
    const stats = {
      total: notificationsToCount.length,
      critical: notificationsToCount.filter(n => n.type === 'critical').length,
      warning: notificationsToCount.filter(n => n.type === 'warning').length,
      resolved: notificationsToCount.filter(n => n.isRead).length,
    };

    return stats;
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    // This would need to be implemented in the Supabase hook
    notifications.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    });
  };

  const createProject = async (projectData: { name: string; description?: string; color?: string; teamId: string }) => {
    try {
      return await createSupabaseProject(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const createTeam = async (teamData: { name: string; description?: string }) => {
    try {
      return await createSupabaseTeam(teamData);
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  };

  const addIntegration = async (integrationData: {
    projectId: string;
    type: string;
    name: string;
    config: Record<string, any>;
  }) => {
    try {
      return await addSupabaseIntegration(integrationData);
    } catch (error) {
      console.error('Error adding integration:', error);
      throw error;
    }
  };

  const resolveNotification = async (id: string) => {
    try {
      await resolveSupabaseNotification(id);
    } catch (error) {
      console.error('Error resolving notification:', error);
    }
  };

  return {
    notifications: filteredNotifications,
    projects,
    teams,
    integrations,
    patterns,
    filter,
    setFilter,
    selectedProject,
    setSelectedProject,
    getCounts,
    getStats,
    markAsRead,
    markAllAsRead,
    resolveNotification,
    createProject,
    createTeam,
    addIntegration,
  };
};
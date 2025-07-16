import { useState, useEffect } from 'react';
import { Notification, Project, Integration, Team, User, NotificationPattern } from '../types';

// Mock projects data
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'E-commerce Platform',
    description: 'Main customer-facing e-commerce application',
    color: '#3B82F6',
    status: 'active',
    services: ['AWS EC2', 'PostgreSQL', 'Redis', 'GitHub Actions', 'New Relic'],
    lastActivity: '2 min ago',
    criticalAlerts: 2,
    warningAlerts: 5,
    members: 8,
    integrations: [
      { id: 'int-1', type: 'github', name: 'Main Repository', status: 'connected', config: {}, lastSync: '2 min ago', projectId: 'proj-1' },
      { id: 'int-2', type: 'aws', name: 'Production AWS', status: 'connected', config: {}, lastSync: '5 min ago', projectId: 'proj-1' },
    ],
    createdBy: '1',
    createdAt: '2024-01-01',
  },
  {
    id: 'proj-2',
    name: 'Analytics Dashboard',
    description: 'Internal analytics and reporting system',
    color: '#10B981',
    status: 'active',
    services: ['Kubernetes', 'MongoDB', 'Docker', 'GitLab CI'],
    lastActivity: '15 min ago',
    criticalAlerts: 0,
    warningAlerts: 2,
    members: 4,
    integrations: [
      { id: 'int-3', type: 'kubernetes', name: 'Analytics Cluster', status: 'connected', config: {}, lastSync: '10 min ago', projectId: 'proj-2' },
    ],
    createdBy: '1',
    createdAt: '2024-01-15',
  },
  {
    id: 'proj-3',
    name: 'Mobile API',
    description: 'REST API for mobile applications',
    color: '#F59E0B',
    status: 'maintenance',
    services: ['AWS Lambda', 'DynamoDB', 'API Gateway'],
    lastActivity: '1 hour ago',
    criticalAlerts: 1,
    warningAlerts: 3,
    members: 3,
    integrations: [
      { id: 'int-4', type: 'aws', name: 'Mobile API Lambda', status: 'error', config: {}, lastSync: '1 hour ago', projectId: 'proj-3' },
    ],
    createdBy: '1',
    createdAt: '2024-02-01',
  },
  {
    id: 'proj-4',
    name: 'Legacy System',
    description: 'Legacy monolith being phased out',
    color: '#6B7280',
    status: 'archived',
    services: ['On-premise servers', 'MySQL'],
    lastActivity: '2 days ago',
    criticalAlerts: 0,
    warningAlerts: 1,
    members: 2,
    integrations: [],
    createdBy: '1',
    createdAt: '2024-01-01',
  },
];

// Mock teams data
const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Frontend Team',
    description: 'Responsible for user interfaces and web applications',
    projects: ['proj-1', 'proj-2'],
    members: [],
    createdBy: '1',
    createdAt: '2024-01-01',
  },
  {
    id: 'team-2',
    name: 'Backend Team',
    description: 'API development and server infrastructure',
    projects: ['proj-1', 'proj-3'],
    members: [],
    createdBy: '1',
    createdAt: '2024-01-01',
  },
];

// Mock integrations data
const mockIntegrations: Integration[] = [
  { id: 'int-1', type: 'github', name: 'Main Repository', status: 'connected', config: {}, lastSync: '2 min ago', projectId: 'proj-1' },
  { id: 'int-2', type: 'aws', name: 'Production AWS', status: 'connected', config: {}, lastSync: '5 min ago', projectId: 'proj-1' },
  { id: 'int-3', type: 'kubernetes', name: 'Analytics Cluster', status: 'connected', config: {}, lastSync: '10 min ago', projectId: 'proj-2' },
  { id: 'int-4', type: 'aws', name: 'Mobile API Lambda', status: 'error', config: {}, lastSync: '1 hour ago', projectId: 'proj-3' },
];

// Mock data for demonstration
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'critical',
    service: 'AWS EC2',
    title: 'High CPU Usage Alert',
    description: 'Instance i-0123456789abcdef0 has been running at 95% CPU for the last 10 minutes',
    timestamp: '2 minutes ago',
    exactTimestamp: new Date(Date.now() - 2 * 60 * 1000),
    category: 'infrastructure',
    isRead: false,
    projectId: 'proj-1',
    projectName: 'E-commerce Platform',
    projectColor: '#3B82F6',
    integrationId: 'int-2',
    severity: 5,
    resolved: false,
    tags: ['cpu', 'performance', 'ec2']
  },
  {
    id: '2',
    type: 'warning',
    service: 'GitHub Actions',
    title: 'Build Taking Longer Than Expected',
    description: 'The build for feature/new-auth-system has been running for 25 minutes',
    timestamp: '5 minutes ago',
    exactTimestamp: new Date(Date.now() - 5 * 60 * 1000),
    category: 'ci_cd',
    isRead: false,
    projectId: 'proj-1',
    projectName: 'E-commerce Platform',
    projectColor: '#3B82F6',
    integrationId: 'int-1',
    severity: 3,
    resolved: false,
    tags: ['build', 'ci/cd', 'timeout']
  },
  {
    id: '3',
    type: 'critical',
    service: 'PostgreSQL',
    title: 'Database Connection Pool Exhausted',
    description: 'All 100 connections in the pool are being used. New connections are being rejected.',
    timestamp: '8 minutes ago',
    exactTimestamp: new Date(Date.now() - 8 * 60 * 1000),
    category: 'database',
    isRead: false,
    projectId: 'proj-1',
    projectName: 'E-commerce Platform',
    projectColor: '#3B82F6',
    integrationId: 'int-5',
    severity: 5,
    resolved: false,
    tags: ['database', 'connections', 'performance']
  },
  {
    id: '4',
    type: 'info',
    service: 'Kubernetes',
    title: 'Pod Successfully Deployed',
    description: 'api-service-v2.1.0 has been successfully deployed to production cluster',
    timestamp: '12 minutes ago',
    exactTimestamp: new Date(Date.now() - 12 * 60 * 1000),
    category: 'infrastructure',
    isRead: true,
    projectId: 'proj-2',
    projectName: 'Analytics Dashboard',
    projectColor: '#10B981',
    integrationId: 'int-3',
    severity: 1,
    resolved: true,
    resolvedAt: new Date(Date.now() - 10 * 60 * 1000),
    resolvedBy: 'DevOps Team',
    tags: ['kubernetes', 'deployment', 'success']
  },
  {
    id: '5',
    type: 'warning',
    service: 'Snyk Security',
    title: 'New Vulnerability Detected',
    description: 'Medium severity vulnerability found in lodash@4.17.20. Update to 4.17.21 recommended.',
    timestamp: '15 minutes ago',
    exactTimestamp: new Date(Date.now() - 15 * 60 * 1000),
    category: 'security',
    isRead: false,
    projectId: 'proj-2',
    projectName: 'Analytics Dashboard',
    projectColor: '#10B981',
    integrationId: 'int-6',
    severity: 3,
    resolved: false,
    tags: ['security', 'vulnerability', 'lodash']
  },
  {
    id: '6',
    type: 'success',
    service: 'Docker Registry',
    title: 'Image Push Completed',
    description: 'Successfully pushed myapp:latest to production registry',
    timestamp: '20 minutes ago',
    exactTimestamp: new Date(Date.now() - 20 * 60 * 1000),
    category: 'application',
    isRead: true,
    projectId: 'proj-3',
    projectName: 'Mobile API',
    projectColor: '#F59E0B',
    integrationId: 'int-7',
    severity: 1,
    resolved: true,
    resolvedAt: new Date(Date.now() - 18 * 60 * 1000),
    resolvedBy: 'CI/CD Pipeline',
    tags: ['docker', 'registry', 'deployment']
  },
  {
    id: '7',
    type: 'warning',
    service: 'New Relic',
    title: 'Response Time Degradation',
    description: 'Average response time increased by 40% in the last hour',
    timestamp: '25 minutes ago',
    exactTimestamp: new Date(Date.now() - 25 * 60 * 1000),
    category: 'application',
    isRead: false,
    projectId: 'proj-1',
    projectName: 'E-commerce Platform',
    projectColor: '#3B82F6',
    integrationId: 'int-8',
    severity: 4,
    resolved: false,
    tags: ['performance', 'response-time', 'monitoring']
  },
  {
    id: '8',
    type: 'critical',
    service: 'AWS Lambda',
    title: 'Function Error Rate Spike',
    description: 'process-payments function error rate increased to 15% in the last 10 minutes',
    timestamp: '30 minutes ago',
    exactTimestamp: new Date(Date.now() - 30 * 60 * 1000),
    category: 'application',
    isRead: false,
    projectId: 'proj-3',
    projectName: 'Mobile API',
    projectColor: '#F59E0B',
    integrationId: 'int-4',
    severity: 5,
    resolved: false,
    tags: ['lambda', 'errors', 'payments']
  },
];

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
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [projects] = useState<Project[]>(mockProjects);
  const [teams] = useState<Team[]>(mockTeams);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [patterns] = useState<NotificationPattern[]>(mockPatterns);
  const [filter, setFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(notification => {
    // Filter by project if one is selected
    if (selectedProject && notification.projectId !== selectedProject) {
      return false;
    }
    
    // Filter by category
    if (filter === 'all') return true;
    return notification.category === filter;
  });

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

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    // In real app, this would make an API call
    console.log('Creating project:', newProject);
  };

  const createTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    // In real app, this would make an API call
    console.log('Creating team:', newTeam);
  };

  const addIntegration = (integrationData: any) => {
    const newIntegration: Integration = {
      ...integrationData,
      id: `int-${Date.now()}`,
    };
    setIntegrations(prev => [...prev, newIntegration]);
  };

  const resolveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { 
        ...n, 
        resolved: true, 
        resolvedAt: new Date(),
        resolvedBy: 'Current User' // In real app, this would be the actual user
      } : n
    ));
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
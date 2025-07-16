export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'viewer';
  createdAt: string;
  lastLogin: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'maintenance' | 'archived';
  services: string[];
  lastActivity: string;
  criticalAlerts: number;
  warningAlerts: number;
  members: User[];
  integrations: Integration[];
  createdBy: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  type: 'github' | 'aws' | 'azure' | 'gcp' | 'docker' | 'kubernetes' | 'mongodb' | 'postgresql' | 'redis' | 'jenkins' | 'gitlab' | 'slack' | 'datadog' | 'newrelic' | 'sentry';
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastSync: string;
  projectId: string;
}

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  service: string;
  title: string;
  description: string;
  timestamp: string;
  exactTimestamp: Date;
  category: 'infrastructure' | 'ci_cd' | 'security' | 'database' | 'application';
  isRead: boolean;
  projectId: string;
  projectName: string;
  projectColor: string;
  integrationId: string;
  metadata?: Record<string, any>;
  tags?: string[];
  severity: 1 | 2 | 3 | 4 | 5; // 1 = lowest, 5 = highest
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  relatedNotifications?: string[];
}

export interface NotificationPattern {
  id: string;
  type: 'recurring' | 'escalating' | 'common_error';
  title: string;
  description: string;
  frequency: number;
  lastOccurrence: Date;
  relatedNotifications: string[];
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export interface NotificationFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  types?: string[];
  services?: string[];
  severity?: number[];
  resolved?: boolean;
  searchQuery?: string;
}

export interface NotificationExport {
  format: 'csv' | 'json' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeResolved: boolean;
  groupBy?: 'category' | 'service' | 'type' | 'date';
}
export interface Team {
  id: string;
  name: string;
  description: string;
  projects: string[];
  members: User[];
  createdBy: string;
  createdAt: string;
}
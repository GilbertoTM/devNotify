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
  config: GitHubConfig | DockerConfig | Record<string, unknown>;
  lastSync: string;
  projectId: string;
}

export interface GitHubConfig {
  username?: string;
  repository?: string;
  token?: string;
  webhook_url?: string;
  branch?: string;
  auto_deploy?: boolean;
}

export interface DockerConfig {
  registry_url?: string;
  username?: string;
  password?: string;
  repository?: string;
  tag?: string;
  dockerfile_path?: string;
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

// Docker specific types
export interface DockerIntegration extends Integration {
  type: 'docker';
  host: string;
  port: number;
  useTLS?: boolean;
  caCert?: string;
  clientCert?: string;
  clientKey?: string;
}

export interface DockerEvent {
  id: string;
  type: 'container' | 'image' | 'network' | 'volume' | 'system';
  action: 'create' | 'start' | 'stop' | 'destroy' | 'pull' | 'push' | 'build' | 'remove';
  timestamp: string;
  details: {
    containerId?: string;
    imageId?: string;
    imageName?: string;
    containerName?: string;
    status?: string;
    exitCode?: number;
    size?: string;
    ports?: string[];
    volumes?: string;
  };
  projectId: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string[];
  created: string;
  size: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}
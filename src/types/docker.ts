export interface DockerIntegration {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  config: {
    useTLS?: boolean;
    caCert?: string;
    clientCert?: string;
    clientKey?: string;
  };
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
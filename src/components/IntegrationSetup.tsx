import React, { useState } from 'react';
import { Github, Database, Cloud, Server, GitBranch, Shield, Bell, CheckCircle, AlertCircle } from 'lucide-react';

interface IntegrationConfig {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  fields: {
    name: string;
    type: 'text' | 'password' | 'url' | 'select';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
  }[];
  category: 'version_control' | 'cloud' | 'database' | 'monitoring' | 'ci_cd' | 'communication';
}

const integrationConfigs: IntegrationConfig[] = [
  {
    type: 'github',
    name: 'GitHub',
    icon: Github,
    description: 'Monitor repositories, pull requests, issues, and actions',
    category: 'version_control',
    fields: [
      { name: 'token', type: 'password', label: 'Personal Access Token', required: true },
      { name: 'organization', type: 'text', label: 'Organization (optional)', required: false },
      { name: 'repositories', type: 'text', label: 'Repositories (comma-separated)', required: false },
    ]
  },
  {
    type: 'aws',
    name: 'Amazon Web Services',
    icon: Cloud,
    description: 'Monitor EC2, RDS, Lambda, CloudWatch, and other AWS services',
    category: 'cloud',
    fields: [
      { name: 'accessKeyId', type: 'text', label: 'Access Key ID', required: true },
      { name: 'secretAccessKey', type: 'password', label: 'Secret Access Key', required: true },
      { name: 'region', type: 'select', label: 'Region', required: true, options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] },
    ]
  },
  {
    type: 'postgresql',
    name: 'PostgreSQL',
    icon: Database,
    description: 'Monitor database performance, connections, and queries',
    category: 'database',
    fields: [
      { name: 'host', type: 'text', label: 'Host', required: true },
      { name: 'port', type: 'text', label: 'Port', placeholder: '5432', required: true },
      { name: 'database', type: 'text', label: 'Database Name', required: true },
      { name: 'username', type: 'text', label: 'Username', required: true },
      { name: 'password', type: 'password', label: 'Password', required: true },
    ]
  },
  {
    type: 'kubernetes',
    name: 'Kubernetes',
    icon: Server,
    description: 'Monitor pods, services, deployments, and cluster health',
    category: 'cloud',
    fields: [
      { name: 'kubeconfig', type: 'text', label: 'Kubeconfig (base64)', required: true },
      { name: 'namespace', type: 'text', label: 'Namespace (optional)', required: false },
    ]
  },
  {
    type: 'jenkins',
    name: 'Jenkins',
    icon: GitBranch,
    description: 'Monitor build status, job failures, and pipeline health',
    category: 'ci_cd',
    fields: [
      { name: 'url', type: 'url', label: 'Jenkins URL', required: true },
      { name: 'username', type: 'text', label: 'Username', required: true },
      { name: 'apiToken', type: 'password', label: 'API Token', required: true },
    ]
  },
  {
    type: 'datadog',
    name: 'Datadog',
    icon: Shield,
    description: 'Monitor application performance and infrastructure metrics',
    category: 'monitoring',
    fields: [
      { name: 'apiKey', type: 'password', label: 'API Key', required: true },
      { name: 'appKey', type: 'password', label: 'Application Key', required: true },
    ]
  },
];

interface IntegrationSetupProps {
  projectId: string;
  onSave: (integration: any) => void;
  onCancel: () => void;
}

export const IntegrationSetup: React.FC<IntegrationSetupProps> = ({ projectId, onSave, onCancel }) => {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const categories = [
    { id: 'version_control', name: 'Version Control', icon: Github },
    { id: 'cloud', name: 'Cloud & Infrastructure', icon: Cloud },
    { id: 'database', name: 'Databases', icon: Database },
    { id: 'monitoring', name: 'Monitoring & APM', icon: Shield },
    { id: 'ci_cd', name: 'CI/CD', icon: GitBranch },
  ];

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleConnect = async () => {
    if (!selectedIntegration) return;
    
    setIsConnecting(true);
    
    // Simulate API call to test connection
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      setConnectionStatus(success ? 'success' : 'error');
      setIsConnecting(false);
      
      if (success) {
        setTimeout(() => {
          onSave({
            type: selectedIntegration.type,
            name: formData.name || selectedIntegration.name,
            config: formData,
            projectId,
            status: 'connected',
            lastSync: 'Just now'
          });
        }, 1000);
      }
    }, 2000);
  };

  if (selectedIntegration) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setSelectedIntegration(null)}
            className="text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back to integrations
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <selectedIntegration.icon className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">{selectedIntegration.name}</h2>
          </div>
          <p className="text-gray-400">{selectedIntegration.description}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Integration Name
              </label>
              <input
                type="text"
                value={formData.name || selectedIntegration.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`My ${selectedIntegration.name} Integration`}
              />
            </div>

            {selectedIntegration.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}

            {connectionStatus === 'success' && (
              <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">Connection successful!</span>
              </div>
            )}

            {connectionStatus === 'error' && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">Connection failed. Please check your credentials.</span>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting || connectionStatus === 'success'}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isConnecting ? 'Testing Connection...' : 
                 connectionStatus === 'success' ? 'Connected' : 'Test Connection'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Add Integration</h2>
        <p className="text-gray-400">Connect your development tools to receive unified notifications</p>
      </div>

      {categories.map((category) => {
        const CategoryIcon = category.icon;
        const categoryIntegrations = integrationConfigs.filter(i => i.category === category.id);
        
        if (categoryIntegrations.length === 0) return null;

        return (
          <div key={category.id} className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <CategoryIcon className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">{category.name}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryIntegrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <button
                    key={integration.type}
                    onClick={() => setSelectedIntegration(integration)}
                    className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
                      <h4 className="font-medium text-white group-hover:text-gray-100">{integration.name}</h4>
                    </div>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">
                      {integration.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
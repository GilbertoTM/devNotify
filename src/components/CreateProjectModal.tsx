import React, { useState } from 'react';
import { X, Github, Cloud, Database, Shield, GitBranch, Package } from 'lucide-react';
import { GitHubIntegration } from './integrations/GitHubIntegration';
import { GitHubConfig } from '../types';

interface ServiceConfig {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  category: 'containerization' | 'version_control' | 'cloud' | 'database' | 'monitoring' | 'ci_cd';
  fields?: {
    name: string;
    type: 'text' | 'password' | 'url' | 'select';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
  }[];
}

const availableServices: ServiceConfig[] = [
  {
    id: 'docker',
    name: 'Docker',
    icon: Package,
    description: 'Monitor containers, images, and Docker events',
    category: 'containerization',
    fields: [
      { name: 'socketPath', type: 'text', label: 'Docker Socket Path', placeholder: '/var/run/docker.sock', required: false },
      { name: 'host', type: 'text', label: 'Docker Host (optional)', placeholder: 'tcp://localhost:2375', required: false },
    ]
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    description: 'Monitor repositories, pull requests, and issues',
    category: 'version_control',
    fields: [
      { name: 'token', type: 'password', label: 'Personal Access Token', required: true },
      { name: 'organization', type: 'text', label: 'Organization (optional)', required: false },
      { name: 'repositories', type: 'text', label: 'Repositories (comma-separated)', required: false },
    ]
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    icon: Cloud,
    description: 'Monitor EC2, RDS, Lambda, and CloudWatch',
    category: 'cloud',
    fields: [
      { name: 'accessKeyId', type: 'text', label: 'Access Key ID', placeholder: 'AKIA...', required: true },
      { name: 'secretAccessKey', type: 'password', label: 'Secret Access Key', required: true },
      { 
        name: 'region', 
        type: 'select', 
        label: 'AWS Region', 
        required: true,
        options: ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1']
      },
      {
        name: 'services',
        type: 'select',
        label: 'Primary Service',
        required: true,
        options: ['ec2', 's3', 'lambda', 'ecs', 'ecr', 'rds', 'cloudwatch']
      },
      { name: 'resourceName', type: 'text', label: 'Resource Name (bucket, cluster, etc.)', required: false }
    ]
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: Database,
    description: 'Monitor database performance and connections',
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
    id: 'jenkins',
    name: 'Jenkins',
    icon: GitBranch,
    description: 'Monitor build status and pipeline health',
    category: 'ci_cd',
    fields: [
      { name: 'url', type: 'url', label: 'Jenkins URL', required: true },
      { name: 'username', type: 'text', label: 'Username', required: true },
      { name: 'apiToken', type: 'password', label: 'API Token', required: true },
    ]
  },
  {
    id: 'datadog',
    name: 'Datadog',
    icon: Shield,
    description: 'Monitor application performance and metrics',
    category: 'monitoring',
    fields: [
      { name: 'apiKey', type: 'password', label: 'API Key', required: true },
      { name: 'appKey', type: 'password', label: 'Application Key', required: true },
    ]
  },
];

interface Team {
  id: string;
  name: string;
  description?: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: {
    name: string;
    description?: string;
    color?: string;
    services: Array<{
      id: string;
      config: Record<string, any>;
    }>;
  }) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [step, setStep] = useState<'project' | 'services'>('project');
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  const [selectedServices, setSelectedServices] = useState<Array<{
    id: string;
    config: Record<string, any>;
  }>>([]);
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, any>>({});
  const [githubConfig, setGitHubConfig] = useState<GitHubConfig>({});

  const categories: Array<{
    id: string;
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }> = [
    { id: 'containerization', name: 'Containerization', icon: Package },
    { id: 'version_control', name: 'Version Control', icon: Github },
    { id: 'cloud', name: 'Cloud & Infrastructure', icon: Cloud },
    { id: 'database', name: 'Databases', icon: Database },
    { id: 'monitoring', name: 'Monitoring & APM', icon: Shield },
    { id: 'ci_cd', name: 'CI/CD', icon: GitBranch },
  ];

  const handleProjectDataChange = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === serviceId);
      if (isSelected) {
        return prev.filter(s => s.id !== serviceId);
      } else {
        return [...prev, { id: serviceId, config: {} }];
      }
    });
  };

  const handleServiceConfigChange = (serviceId: string, field: string, value: string) => {
    if (serviceId === 'github' && field === 'github_config') {
      const config = JSON.parse(value) as GitHubConfig;
      setGitHubConfig(config);
      setServiceConfigs(prev => ({
        ...prev,
        [serviceId]: config
      }));
    } else {
      setServiceConfigs(prev => ({
        ...prev,
        [serviceId]: {
          ...(prev[serviceId] as Record<string, string>),
          [field]: value
        }
      }));
    }
  };

  const handleCreateProject = () => {
    const servicesWithConfig = selectedServices.map(service => ({
      id: service.id,
      config: serviceConfigs[service.id] || {}
    }));

    onCreateProject({
      ...projectData,
      services: servicesWithConfig
    });

    // Reset form
    setProjectData({ name: '', description: '', color: '#3B82F6' });
    setSelectedServices([]);
    setServiceConfigs({});
    setStep('project');
    onClose();
  };

  const canProceedToServices = projectData.name.trim().length > 0;
  const canCreateProject = selectedServices.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Create New Project</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step === 'project' ? 'text-blue-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'project' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  1
                </div>
                <span className="text-sm font-medium">Project Details</span>
              </div>
              <div className="w-8 h-1 bg-gray-700"></div>
              <div className={`flex items-center space-x-2 ${step === 'services' ? 'text-blue-400' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'services' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Link Services</span>
              </div>
            </div>
          </div>

          {step === 'project' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={(e) => handleProjectDataChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => handleProjectDataChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Color
                </label>
                <div className="flex space-x-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleProjectDataChange('color', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        projectData.color === color ? 'border-white scale-110' : 'border-gray-600 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('services')}
                  disabled={!canProceedToServices}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Next: Link Services
                </button>
              </div>
            </div>
          )}

          {step === 'services' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Select Services to Link</h3>
                <p className="text-gray-400 mb-6">Choose the services you want to monitor for this project</p>
              </div>

              {categories.map((category) => {
                const CategoryIcon = category.icon;
                const categoryServices = availableServices.filter(s => s.category === category.id);
                
                if (categoryServices.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className="w-5 h-5 text-blue-400" />
                      <h4 className="text-md font-medium text-white">{category.name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryServices.map((service) => {
                        const Icon = service.icon;
                        const isSelected = selectedServices.some(s => s.id === service.id);
                        const serviceConfig = serviceConfigs[service.id] || {};
                        
                        return (
                          <div key={service.id} className="space-y-4">
                            <button
                              onClick={() => handleServiceToggle(service.id)}
                              className={`w-full p-4 rounded-lg border transition-all duration-200 text-left group ${
                                isSelected 
                                  ? 'bg-blue-600/20 border-blue-500/50' 
                                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`} />
                                <div>
                                  <h5 className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                    {service.name}
                                  </h5>
                                  <p className={`text-sm ${isSelected ? 'text-blue-200' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </button>

                            {isSelected && service.id === 'github' && (
                              <div className="ml-6 mt-4">
                                <GitHubIntegration 
                                  onConfigChange={(config) => handleServiceConfigChange(service.id, 'github_config', JSON.stringify(config))}
                                  initialConfig={githubConfig}
                                />
                              </div>
                            )}

                            {isSelected && service.fields && service.id !== 'github' && (
                              <div className="ml-6 space-y-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                                {service.fields.map((field) => (
                                  <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                      {field.label} {field.required && <span className="text-red-400">*</span>}
                                    </label>
                                    {field.type === 'select' ? (
                                      <select
                                        value={(serviceConfig as Record<string, string>)?.[field.name] || ''}
                                        onChange={(e) => handleServiceConfigChange(service.id, field.name, e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                                        value={(serviceConfig as Record<string, string>)?.[field.name] || ''}
                                        onChange={(e) => handleServiceConfigChange(service.id, field.name, e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder={field.placeholder}
                                        required={field.required}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between space-x-4 pt-6">
                <button
                  onClick={() => setStep('project')}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Back
                </button>
                <div className="flex space-x-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!canCreateProject}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
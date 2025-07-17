import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon, CloudIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface AWSConfig {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  service_type: 'ec2' | 's3' | 'lambda' | 'ecs' | 'ecr';
  bucket_name?: string;
  cluster_name?: string;
}

interface AWSIntegrationProps {
  onConfigChange: (config: AWSConfig) => void;
  initialConfig?: Partial<AWSConfig>;
}

export const AWSIntegrationSetup: React.FC<AWSIntegrationProps> = ({
  onConfigChange,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<AWSConfig>({
    access_key_id: '',
    secret_access_key: '',
    region: 'us-east-1',
    service_type: 'ec2',
    ...initialConfig
  });
  
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const awsRegions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' }
  ];

  const awsServices = [
    { value: 'ec2', label: 'EC2 (Virtual Machines)', description: 'Gestión de instancias EC2' },
    { value: 's3', label: 'S3 (Storage)', description: 'Almacenamiento de archivos' },
    { value: 'lambda', label: 'Lambda (Functions)', description: 'Funciones serverless' },
    { value: 'ecs', label: 'ECS (Container Service)', description: 'Gestión de contenedores' },
    { value: 'ecr', label: 'ECR (Container Registry)', description: 'Registro de imágenes Docker' }
  ];

  const handleInputChange = (field: keyof AWSConfig, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
    setConnectionStatus('idle');
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const response = await fetch('/api/validate-aws-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessKeyId: config.access_key_id,
          secretAccessKey: config.secret_access_key,
          region: config.region,
          serviceType: config.service_type
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error testing AWS connection:', error);
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <CloudIcon className="w-8 h-8 text-orange-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configuración de AWS</h3>
          <p className="text-sm text-gray-600">Conecta tu proyecto con los servicios de Amazon Web Services</p>
        </div>
      </div>

      {/* Instrucciones rápidas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📋 Cómo obtener tus credenciales:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Ve a la <a href="https://console.aws.amazon.com/iam/" target="_blank" rel="noopener noreferrer" className="underline">consola IAM de AWS</a></li>
          <li>Crea un nuevo usuario con acceso programático</li>
          <li>Asigna los permisos necesarios para los servicios que usarás</li>
          <li>Copia las credenciales generadas aquí</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Access Key ID */}
        <div>
          <label htmlFor="aws-access-key" className="block text-sm font-medium text-gray-700 mb-2">
            Access Key ID
          </label>
          <input
            id="aws-access-key"
            type="text"
            placeholder="AKIA..."
            value={config.access_key_id}
            onChange={(e) => handleInputChange('access_key_id', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Secret Access Key */}
        <div>
          <label htmlFor="aws-secret-key" className="block text-sm font-medium text-gray-700 mb-2">
            Secret Access Key
          </label>
          <div className="relative">
            <input
              id="aws-secret-key"
              type={showSecretKey ? 'text' : 'password'}
              placeholder="Tu secret key de AWS"
              value={config.secret_access_key}
              onChange={(e) => handleInputChange('secret_access_key', e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowSecretKey(!showSecretKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showSecretKey ? 
                <EyeSlashIcon className="w-5 h-5" /> : 
                <EyeIcon className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

        {/* Región */}
        <div>
          <label htmlFor="aws-region" className="block text-sm font-medium text-gray-700 mb-2">
            Región
          </label>
          <select
            id="aws-region"
            value={config.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            {awsRegions.map(region => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>

        {/* Servicio */}
        <div>
          <label htmlFor="aws-service" className="block text-sm font-medium text-gray-700 mb-2">
            Servicio Principal
          </label>
          <select
            id="aws-service"
            value={config.service_type}
            onChange={(e) => handleInputChange('service_type', e.target.value as AWSConfig['service_type'])}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          >
            {awsServices.map(service => (
              <option key={service.value} value={service.value} title={service.description}>
                {service.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Configuraciones específicas por servicio */}
      {config.service_type === 's3' && (
        <div>
          <label htmlFor="aws-bucket" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Bucket S3
          </label>
          <input
            id="aws-bucket"
            type="text"
            placeholder="mi-bucket-de-proyecto"
            value={config.bucket_name || ''}
            onChange={(e) => handleInputChange('bucket_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>
      )}

      {(config.service_type === 'ecs' || config.service_type === 'ecr') && (
        <div>
          <label htmlFor="aws-cluster" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Cluster
          </label>
          <input
            id="aws-cluster"
            type="text"
            placeholder="mi-cluster"
            value={config.cluster_name || ''}
            onChange={(e) => handleInputChange('cluster_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
          />
        </div>
      )}

      {/* Test de conexión */}
      <div className="flex items-center justify-between pt-4 border-t border-orange-200">
        <div className="flex items-center space-x-2">
          {connectionStatus === 'success' && (
            <>
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700">Conexión exitosa</span>
            </>
          )}
          {connectionStatus === 'error' && (
            <>
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">Error en las credenciales</span>
            </>
          )}
        </div>
        
        <button
          type="button"
          onClick={testConnection}
          disabled={isTestingConnection || !config.access_key_id || !config.secret_access_key}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isTestingConnection ? 'Probando...' : 'Probar Conexión'}
        </button>
      </div>
    </div>
  );
};

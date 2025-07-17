import React, { useState } from 'react';
import {
  ServerIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface DockerIntegrationSetupProps {
  projectId: string;
  onSave: (integration: any) => void;
  onCancel: () => void;
}

export const DockerIntegrationSetup: React.FC<DockerIntegrationSetupProps> = ({
  projectId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    host: 'localhost',
    port:2375
    useTLS: false,
    caCert: '', 
    clientCert:     
    clientKey: 
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (field: string, value: string | number | boolean) => setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => setIsTesting(true);
    setTestResult('idle');

    try { // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 200);
      
      // En una implementación real, aquí harías la llamada real a Docker
      const success = Math.random() > 0.370de éxito para demo
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const integration = {
      id: `docker-${Date.now()}`,
      type: 'docker',
      projectId,
      ...formData,
      status: 'connected',
      lastSync: 'Just now'
    };
    onSave(integration);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Docker Integration Setup</h2>
        <p className="text-gray-400">
          Connect your Docker daemon to monitor containers, images, and events in real-time.
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">       Integration Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500       placeholder="e.g., Production Docker"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">            Docker Host <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                className="w-full px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500       placeholder="localhost"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">              Port <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                className="w-full px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500       placeholder="2375          required
              />
            </div>

            <div className="flex items-center">            <input
                type="checkbox"
                id="useTLS"
                checked={formData.useTLS}
                onChange={(e) => handleInputChange('useTLS', e.target.checked)}
                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="useTLS" className="ml-2 block text-sm text-gray-300">               Use TLS (HTTPS)
              </label>
            </div>
          </div>

          {formData.useTLS && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">TLS Configuration</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CA Certificate
                  </label>
                  <textarea
                    value={formData.caCert}
                    onChange={(e) => handleInputChange('caCert', e.target.value)}
                    className="w-full px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Paste your CA certificate here..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Client Certificate
                    </label>
                    <textarea
                      value={formData.clientCert}
                      onChange={(e) => handleInputChange('clientCert', e.target.value)}
                      className="w-full px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Paste your client certificate here..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Client Key
                    </label>
                    <textarea
                      value={formData.clientKey}
                      onChange={(e) => handleInputChange('clientKey', e.target.value)}
                      className="w-full px-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Paste your client key here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">           <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !formData.name || !formData.host}
              className="flex items-center space-x-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ServerIcon className="w-4 h-4"/>
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            {testResult === 'success' && (
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Connection successful!</span>
              </div>
            )}

            {testResult === 'error' && (
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span>Connection failed. Check your settings.</span>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">           <button
              type="button"
              onClick={handleSave}
              disabled={!formData.name || !formData.host || testResult === 'error'}
              className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Save Integration
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 
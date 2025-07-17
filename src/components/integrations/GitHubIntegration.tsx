import React, { useState } from 'react';
import { GitHubConfig } from '../../types';
import { createGitHubService } from '../../services/github';

interface GitHubIntegrationProps {
  onConfigChange: (config: GitHubConfig) => void;
  initialConfig?: GitHubConfig;
}

export const GitHubIntegration: React.FC<GitHubIntegrationProps> = ({
  onConfigChange,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<GitHubConfig>(initialConfig);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    credentials: 'idle' | 'validating' | 'valid' | 'invalid';
    repository: 'idle' | 'validating' | 'valid' | 'invalid';
    message?: string;
  }>({
    credentials: 'idle',
    repository: 'idle'
  });

  const handleChange = (field: keyof GitHubConfig, value: string | boolean) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
    
    // Reset validation when config changes
    if (field === 'token' || field === 'username' || field === 'repository') {
      setValidationStatus(prev => ({
        ...prev,
        credentials: field === 'token' ? 'idle' : prev.credentials,
        repository: (field === 'username' || field === 'repository') ? 'idle' : prev.repository
      }));
    }
  };

  const validateCredentials = async () => {
    if (!config.token) return;
    
    setIsValidating(true);
    setValidationStatus(prev => ({ ...prev, credentials: 'validating' }));
    
    try {
      const githubService = createGitHubService(config.token);
      const result = await githubService.validateCredentials();
      
      if (result.valid) {
        setValidationStatus(prev => ({ 
          ...prev, 
          credentials: 'valid',
          message: `Conectado como: ${result.user?.login}` 
        }));
      } else {
        setValidationStatus(prev => ({ 
          ...prev, 
          credentials: 'invalid',
          message: result.error 
        }));
      }
    } catch (error) {
      setValidationStatus(prev => ({ 
        ...prev, 
        credentials: 'invalid',
        message: 'Error al validar credenciales' 
      }));
    } finally {
      setIsValidating(false);
    }
  };

  const validateRepository = async () => {
    if (!config.username || !config.repository || !config.token) return;
    
    setValidationStatus(prev => ({ ...prev, repository: 'validating' }));
    
    try {
      const githubService = createGitHubService(config.token);
      const result = await githubService.validateRepository(config.username, config.repository);
      
      if (result.valid) {
        setValidationStatus(prev => ({ 
          ...prev, 
          repository: 'valid',
          message: `Repositorio encontrado: ${result.repository?.full_name}` 
        }));
      } else {
        setValidationStatus(prev => ({ 
          ...prev, 
          repository: 'invalid',
          message: result.error 
        }));
      }
    } catch (error) {
      setValidationStatus(prev => ({ 
        ...prev, 
        repository: 'invalid',
        message: 'Error al validar repositorio' 
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validating': return '⏳';
      case 'valid': return '✅';
      case 'invalid': return '❌';
      default: return '';
    }
  };

  return (
    <div className="github-integration bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🐙</span>
        </div>
        <h3 className="text-xl font-semibold text-white">Configuración de GitHub</h3>
      </div>
      
      <div className="space-y-4">
        <div className="form-group">
          <label htmlFor="github-username" className="block text-sm font-medium text-gray-300 mb-2">
            Usuario de GitHub
          </label>
          <input
            id="github-username"
            type="text"
            placeholder="tu-usuario-github"
            value={config.username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="github-repository" className="block text-sm font-medium text-gray-300 mb-2">
            Repositorio
          </label>
          <div className="flex space-x-2">
            <input
              id="github-repository"
              type="text"
              placeholder="nombre-del-repositorio"
              value={config.repository || ''}
              onChange={(e) => handleChange('repository', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
            {config.username && config.repository && config.token && (
              <button
                type="button"
                onClick={validateRepository}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              >
                {getStatusIcon(validationStatus.repository)} Validar
              </button>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="github-token" className="block text-sm font-medium text-gray-300 mb-2">
            Personal Access Token
            <span className="text-xs text-gray-400 ml-2">(Opcional - para repos privados)</span>
          </label>
          <div className="flex space-x-2">
            <input
              id="github-token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={config.token || ''}
              onChange={(e) => handleChange('token', e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
            {config.token && (
              <button
                type="button"
                onClick={validateCredentials}
                disabled={isValidating}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                {getStatusIcon(validationStatus.credentials)} {isValidating ? 'Validando...' : 'Validar'}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Genera un token en: Settings → Developer settings → Personal access tokens
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="github-branch" className="block text-sm font-medium text-gray-300 mb-2">
            Rama Principal
            <span className="text-gray-500 text-xs ml-2">(opcional - deja vacío para todas las ramas)</span>
          </label>
          <input
            id="github-branch"
            type="text"
            placeholder="main, github, develop... (opcional)"
            value={config.branch || ''}
            onChange={(e) => handleChange('branch', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si está vacío, se obtendrán commits de múltiples ramas principales (main, github, master, develop)
          </p>
        </div>

        <div className="form-group">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={config.auto_deploy || false}
              onChange={(e) => handleChange('auto_deploy', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500/50"
            />
            <span className="text-sm text-gray-300">
              Activar notificaciones automáticas en push
            </span>
          </label>
        </div>

        {validationStatus.message && (
          <div className={`p-3 rounded-lg text-sm ${
            validationStatus.credentials === 'valid' || validationStatus.repository === 'valid' 
              ? 'bg-green-900/30 border border-green-500/30 text-green-300'
              : validationStatus.credentials === 'invalid' || validationStatus.repository === 'invalid'
              ? 'bg-red-900/30 border border-red-500/30 text-red-300'
              : 'bg-blue-900/30 border border-blue-500/30 text-blue-300'
          }`}>
            {validationStatus.message}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h4 className="text-sm font-medium text-blue-300 mb-2">¿Cómo obtener un Personal Access Token?</h4>
        <ol className="text-xs text-blue-200 space-y-1 list-decimal list-inside">
          <li>Ve a GitHub.com → Settings (en tu perfil)</li>
          <li>Developer settings → Personal access tokens → Tokens (classic)</li>
          <li>Generate new token → Selecciona 'repo' scope</li>
          <li>Copia el token y pégalo aquí</li>
        </ol>
      </div>
    </div>
  );
};

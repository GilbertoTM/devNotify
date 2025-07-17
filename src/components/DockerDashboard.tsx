import React from 'react';
import { 
  ServerIcon, 
  PlayIcon, 
  StopIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useDockerBackend } from '../hooks/useDockerBackend';

export const DockerDashboard: React.FC = () => {
  const {
    containers,
    images,
    stats,
    isLoading,
    error,
    refreshAll,
    formatBytes,
    formatDate
  } = useDockerBackend();

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
          <span className="text-red-400">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ServerIcon className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Docker Dashboard</h2>
        </div>
        <button
          onClick={refreshAll}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Contenedores Totales</p>
                <p className="text-2xl font-bold text-white">{stats.containers.total}</p>
              </div>
              <ServerIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ejecutándose</p>
                <p className="text-2xl font-bold text-green-400">{stats.containers.running}</p>
              </div>
              <PlayIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Detenidos</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.containers.stopped}</p>
              </div>
              <StopIcon className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Imágenes</p>
                <p className="text-2xl font-bold text-purple-400">{stats.images.total}</p>
              </div>
              <ServerIcon className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Containers */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Contenedores</h3>
        </div>
        <div className="p-4">
          {containers.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay contenedores</p>
          ) : (
            <div className="space-y-3">
              {containers.map((container) => (
                <div key={container.Id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      container.State === 'running' ? 'bg-green-400' : 
                      container.State === 'exited' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <p className="text-white font-medium">
                        {container.Names[0]?.replace('/', '') || container.Id.slice(0, 12)}
                      </p>
                      <p className="text-gray-400 text-sm">{container.Image}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-gray-300 text-sm capitalize">{container.State}</p>
                      <p className="text-gray-400 text-xs">
                        {container.Ports.map(p => `${p.PublicPort}:${p.PrivatePort}`).join(', ') || 'No ports'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {container.State === 'running' ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <StopIcon className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">Imágenes</h3>
        </div>
        <div className="p-4">
          {images.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No hay imágenes</p>
          ) : (
            <div className="space-y-3">
              {images.map((image) => (
                <div key={image.Id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      {image.RepoTags[0] || image.Id.slice(7, 19)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Tamaño: {formatBytes(image.Size)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">
                      {formatDate(image.Created)}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {(image as any).Containers || 0} contenedores
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
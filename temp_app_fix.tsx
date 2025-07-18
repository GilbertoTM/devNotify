// Versión corregida de App.tsx - copiar manualmente
import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';
import { ProjectsView } from './components/ProjectsView';
import { NotificationHistory } from './components/NotificationHistory';
import { PatternAnalysis } from './components/PatternAnalysis';
import { StatusBar } from './components/StatusBar';
import { FilterTabs } from './components/FilterTabs';
import { AdminPanel } from './components/AdminPanel';
import { IntegrationSetup } from './components/IntegrationSetup';
import { DockerDashboard } from './components/DockerDashboard';
import { CreateProjectModal } from './components/CreateProjectModal';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

function App() {
  // Todos los hooks al principio
  const { user, isAuthenticated, login, signUp, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<'notifications' | 'projects' | 'docker'>('notifications');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showIntegrationSetup, setShowIntegrationSetup] = useState(false);
  const [selectedProjectForIntegration, setSelectedProjectForIntegration] = useState<string | null>(null);
  
  const {
    notifications,
    projects,
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
    teams,
    integrations,
    createProject,
    createTeam,
    addIntegration,
  } = useNotifications();

  // WebSocket para notificaciones en tiempo real
  useEffect(() => {
    if (!isAuthenticated) return;

    const ws = new WebSocket('ws://localhost:8082');
    
    ws.onopen = () => {
      console.log('🔌 WebSocket connected for real-time notifications');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          console.log('📡 Real-time notification received:', data.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [isAuthenticated]);

  const handleExportData = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting data as ${format}`);
    // Implementar exportación
  };

  // Renders condicionales después de todos los hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading DevNotify...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} onSignUp={signUp} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenido principal */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-white">DevNotify</h2>
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          </div>
          <p className="text-gray-400">
            Stay on top of your development ecosystem with consolidated alerts and notifications
          </p>
        </div>

        {/* Navegación de vistas */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveView('notifications')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'notifications' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveView('projects')}
              className={`px-4 py-2 rounded-lg ${
                activeView === 'projects' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Projects
            </button>
          </div>
        </div>

        {/* Contenido de las vistas */}
        {activeView === 'notifications' && (
          <NotificationHistory
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onResolveNotification={resolveNotification}
            onExportData={handleExportData}
          />
        )}

        {activeView === 'projects' && (
          <ProjectsView 
            projects={projects}
            onProjectClick={(project) => console.log('Project clicked:', project)}
            onCreateProject={async (projectData) => {
              console.log('Creating project:', projectData);
              // Implementar creación de proyecto
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;

import React from 'react';
import { useState } from 'react';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { AdminPanel } from './components/AdminPanel';
import { IntegrationSetup } from './components/IntegrationSetup';
import { ProjectNotifications } from './components/ProjectNotifications';
import { StatusBar } from './components/StatusBar';
import { FilterTabs } from './components/FilterTabs';
import { NotificationCard } from './components/NotificationCard';
import { ProjectsView } from './components/ProjectsView';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './hooks/useAuth';
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { DockerDashboard } from './components/DockerDashboard';

function App() {
  const { user, isAuthenticated, isLoading, login, signUp } = useAuth();
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

  // Show login form if not authenticated
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

  // Show admin panel if requested and user is admin
  if (showAdmin && user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <AdminPanel
          users={[]}
          projects={projects}
          teams={teams}
          integrations={integrations}
          onCreateProject={createProject}
          onCreateTeam={createTeam}
          onInviteUser={(email, role) => console.log('Invite user:', email, role)}
        />
      </div>
    );
  }

  // Show integration setup
  if (showIntegrationSetup && selectedProjectForIntegration) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <IntegrationSetup
            projectId={selectedProjectForIntegration}
            onSave={(integration) => {
              addIntegration(integration);
              setShowIntegrationSetup(false);
              setSelectedProjectForIntegration(null);
            }}
            onCancel={() => {
              setShowIntegrationSetup(false);
              setSelectedProjectForIntegration(null);
            }}
          />
        </div>
      </div>
    );
  }

  const stats = getStats();
  const counts = getCounts();
  const currentProject = selectedProject ? projects.find(p => p.id === selectedProject) : null;

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId);
    setActiveView('notifications');
  };

  const handleBackToAllProjects = () => {
    setSelectedProject(null);
  };



  const handleExportData = (format: 'csv' | 'json' | 'pdf') => {
    // In a real app, this would generate and download the export
    console.log(`Exporting data in ${format} format`);
    alert(`Exporting data in ${format.toUpperCase()} format...`);
  };

  // If a project is selected, show the detailed project notifications view
  if (currentProject && activeView === 'notifications') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {user?.role === 'admin' && (
            <div className="mb-4">
              <button
                onClick={() => setShowAdmin(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 text-sm hover:scale-105 shadow-lg"
              >
                Admin Panel
              </button>
            </div>
          )}
          
          <div className="mb-6">
            <button
              onClick={handleBackToAllProjects}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/70 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to All Projects</span>
            </button>
          </div>
          
          <ProjectNotifications
            project={currentProject}
            notifications={notifications}
            patterns={patterns.filter(p => 
              p.relatedNotifications.some(nId => 
                notifications.find(n => n.id === nId && n.projectId === currentProject.id)
              )
            )}
            onMarkAsRead={markAsRead}
            onResolveNotification={resolveNotification}
            onExportData={handleExportData}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Access Button */}
        {user?.role === 'admin' && (
          <div className="mb-4">
            <button
              onClick={() => setShowAdmin(true)}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 text-sm hover:scale-105 shadow-lg"
            >
              Admin Panel
            </button>
          </div>
        )}
        
        <div className="mb-8">
          {activeView === 'notifications' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      Notification Center
                    </h2>
                  </div>
                </div>
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
            </>
          )}
        </div>

        {activeView === 'notifications' && <StatusBar stats={stats} />}
        
        <FilterTabs 
          activeFilter={filter} 
          onFilterChange={setFilter} 
          counts={counts}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {activeView === 'notifications' ? (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h3>
                <p className="text-gray-500">
                  {currentProject 
                    ? `No notifications for ${currentProject.name}. Everything looks good!`
                    : "You're all caught up! No new notifications to show."
                  }
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  {...notification}
                  actions={[
                    { label: 'Mark as Read', action: () => markAsRead(notification.id) },
                    { label: 'Resolve', action: () => resolveNotification(notification.id) },
                  ]}
                />
              ))
            )}
          </div>
        ) : activeView === 'projects' ? (
          <ProjectsView 
            projects={projects} 
            onProjectClick={handleProjectClick}
            onCreateProject={async (projectData) => {
              try {
                console.log('Starting project creation with data:', projectData);
                
                let teamId = teams && teams.length > 0 ? teams[0].id : null;
                
                // Si no hay equipos, crear uno automáticamente
                if (!teamId) {
                  console.log('No teams found, creating default team...');
                  try {
                    const newTeam = await createTeam({
                      name: user?.name ? `Equipo de ${user.name}` : 'Mi Equipo',
                      description: 'Equipo creado automáticamente'
                    });
                    teamId = newTeam.id;
                    console.log('Default team created:', newTeam);
                  } catch (teamError: any) {
                    console.error('Failed to create default team:', teamError);
                    alert(`Error creating team: ${teamError.message}`);
                    return;
                  }
                }

                if (!teamId) {
                  alert('Error: No team available for project creation');
                  return;
                }

                console.log('Creating project with teamId:', teamId);
                const newProject = await createProject({
                  name: projectData.name,
                  description: projectData.description,
                  color: projectData.color,
                  teamId
                });

                console.log('Project created successfully:', newProject);

                // Add integrations for each service
                if (projectData.services && projectData.services.length > 0) {
                  console.log('Adding integrations for services:', projectData.services);
                  for (const service of projectData.services) {
                    try {
                      await addIntegration({
                        projectId: newProject.id,
                        type: service.id,
                        name: `${projectData.name} - ${service.id}`,
                        config: service.config
                      });
                    } catch (integrationError) {
                      console.error('Error adding integration:', service.id, integrationError);
                      // Continue with other integrations even if one fails
                    }
                  }
                }

                console.log('Project created successfully with services');
                alert('Project created successfully!');
              } catch (error: any) {
                console.error('Error creating project:', error);
                alert(`Error creating project: ${error.message || 'Unknown error'}`);
              }
            }}
          />
        ) : activeView === 'docker' ? (
          <DockerDashboard />
        ) : null}

        {activeView === 'notifications' && notifications.length > 0 && (
          <div className="mt-8 text-center">
            <button className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/70 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm">
              Load More Notifications
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
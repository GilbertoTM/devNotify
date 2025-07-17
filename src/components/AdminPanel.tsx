import React, { useState } from 'react';
import { Users, FolderPlus, Settings, Shield, Plus, Edit, Trash2, UserPlus } from 'lucide-react';
import { User, Project, Team, Integration } from '../types';

interface AdminPanelProps {
  users: User[];
  projects: Project[];
  teams: Team[];
  integrations: Integration[];
  onCreateProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onCreateTeam: (team: Omit<Team, 'id' | 'createdAt'>) => void;
  onInviteUser: (email: string, role: User['role']) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  users,
  projects,
  teams,
  integrations,
  onCreateProject,
  onCreateTeam,
  onInviteUser
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'teams' | 'integrations'>('projects');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderPlus, count: projects.length },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'teams', label: 'Teams', icon: Shield, count: teams.length },
    { id: 'integrations', label: 'Integrations', icon: Settings, count: integrations.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Administration Panel</h1>
        <p className="text-gray-400">Manage projects, users, teams, and integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
              <span className={`
                px-2 py-1 text-xs rounded-full min-w-[20px] text-center
                ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}
              `}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Project Management</h2>
            <button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color }}
                    ></div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                      <p className="text-sm text-gray-400">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs
                      ${project.status === 'active' ? 'bg-green-500/10 text-green-400' : 
                        project.status === 'maintenance' ? 'bg-yellow-500/10 text-yellow-400' : 
                        'bg-gray-500/10 text-gray-400'}
                    `}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members:</span>
                    <span className="text-white">{project.members.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Integrations:</span>
                    <span className="text-white">{project.integrations.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Alerts:</span>
                    <span className="text-red-400">{project.criticalAlerts + project.warningAlerts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">User Management</h2>
            <button
              onClick={() => setShowInviteUser(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite User</span>
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        px-2 py-1 text-xs rounded-full
                        ${user.role === 'admin' ? 'bg-red-500/10 text-red-400' :
                          user.role === 'developer' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-gray-500/10 text-gray-400'}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">Edit</button>
                        <button className="text-red-400 hover:text-red-300">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Team Management</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                    <p className="text-sm text-gray-400">{team.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members:</span>
                    <span className="text-white">{team.members.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Projects:</span>
                    <span className="text-white">{team.projects.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Integration Management</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Integration</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <div key={integration.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{integration.type}</p>
                  </div>
                  <span className={`
                    px-2 py-1 text-xs rounded-full
                    ${integration.status === 'connected' ? 'bg-green-500/10 text-green-400' :
                      integration.status === 'error' ? 'bg-red-500/10 text-red-400' :
                      'bg-gray-500/10 text-gray-400'}
                  `}>
                    {integration.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Sync:</span>
                    <span className="text-white">{integration.lastSync}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
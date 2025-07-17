import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project, Team, Integration, Notification } from '../types';

export const useSupabaseData = (userId: string | null) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's projects
  const fetchProjects = async () => {
    if (!userId) return;

    try {
      // Consulta simplificada sin joins complejos
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', userId);

      if (error) throw error;

      const formattedProjects: Project[] = data?.map((project: any) => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        color: project.color || '#3B82F6',
        status: project.status || 'active',
        services: [], // Se cargará por separado
        lastActivity: 'Recently',
        criticalAlerts: 0,
        warningAlerts: 0,
        members: [],
        integrations: [],
        createdBy: project.created_by,
        createdAt: project.created_at,
      })) || [];

      setProjects(formattedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    }
  };

  // Fetch user's teams
  const fetchTeams = async () => {
    if (!userId) return;

    try {
      // Consulta simplificada sin joins complejos
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', userId);

      if (error) throw error;

      const formattedTeams: Team[] = data?.map((team: any) => ({
        id: team.id,
        name: team.name,
        description: team.description || '',
        projects: [],
        members: [],
        createdBy: team.created_by,
        createdAt: team.created_at,
      })) || [];

      setTeams(formattedTeams);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError('Failed to fetch teams');
    }
  };

  // Fetch integrations for user's projects
  const fetchIntegrations = async () => {
    if (!userId) return;

    try {
      // Consulta simplificada
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const formattedIntegrations: Integration[] = data?.map((integration: any) => ({
        id: integration.id,
        type: integration.type,
        name: integration.name,
        status: integration.status || 'connected',
        config: integration.config || {},
        lastSync: integration.last_sync || 'Never',
        projectId: integration.project_id,
      })) || [];

      setIntegrations(formattedIntegrations);
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError('Failed to fetch integrations');
    }
  };

  // Fetch notifications for user's projects
  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      // Consulta simplificada
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedNotifications: Notification[] = data?.map((notification: any) => ({
        id: notification.id,
        type: notification.type,
        service: notification.source || 'system',
        title: notification.title,
        description: notification.message,
        timestamp: formatTimestamp(notification.created_at),
        exactTimestamp: new Date(notification.created_at),
        category: notification.type,
        isRead: notification.is_read,
        projectId: notification.project_id,
        projectName: 'Project', // Se cargará por separado si es necesario
        projectColor: '#3B82F6', // Color por defecto
        integrationId: notification.integration_id,
        severity: notification.severity || 'info',
        resolved: notification.resolved || false,
        resolvedAt: notification.resolved_at ? new Date(notification.resolved_at) : undefined,
        resolvedBy: notification.resolved_by,
        tags: notification.tags || [],
        metadata: notification.metadata || {},
      })) || [];

      setNotifications(formattedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    }
  };

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  // Create a new project
  const createProject = async (projectData: {
    name: string;
    description?: string;
    color?: string;
    teamId: string;
  }) => {
    if (!userId) throw new Error('User not authenticated');
    if (!projectData.teamId) throw new Error('Team is required');
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          color: projectData.color || '#3B82F6',
          created_by: userId,
          team_id: projectData.teamId,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh projects list
      await fetchProjects();
      return data;
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  // Create a new team
  const createTeam = async (teamData: {
    name: string;
    description?: string;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      console.log('Creating team with data:', teamData);
      
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          description: teamData.description,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase team creation error:', error);
        throw new Error(`Failed to create team: ${error.message}`);
      }

      console.log('Team created successfully:', data);
      
      // Refresh teams list
      await fetchTeams();
      return data;
    } catch (err: any) {
      console.error('Error creating team:', err);
      throw new Error(err.message || 'Failed to create team');
    }
  };

  // Add integration to project
  const addIntegration = async (integrationData: {
    projectId: string;
    type: string;
    name: string;
    config: Record<string, any>;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('integrations')
        .insert({
          project_id: integrationData.projectId,
          type: integrationData.type,
          name: integrationData.name,
          config: integrationData.config,
          created_by: userId,
          status: 'connected',
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh integrations list
      await fetchIntegrations();
      return data;
    } catch (err) {
      console.error('Error adding integration:', err);
      throw err;
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  // Resolve notification
  const resolveNotification = async (notificationId: string) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          resolved: true, 
          resolved_at: new Date().toISOString(),
          resolved_by: userId 
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { 
          ...n, 
          resolved: true, 
          resolvedAt: new Date(),
          resolvedBy: 'Current User'
        } : n)
      );
    } catch (err) {
      console.error('Error resolving notification:', err);
      throw err;
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchProjects(),
          fetchTeams(),
          fetchIntegrations(),
          fetchNotifications(),
        ]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const notificationsSubscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    const projectsSubscription = supabase
      .channel('projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsSubscription);
      supabase.removeChannel(projectsSubscription);
    };
  }, [userId]);

  return {
    projects,
    teams,
    integrations,
    notifications,
    loading,
    error,
    createProject,
    createTeam,
    addIntegration,
    markNotificationAsRead,
    resolveNotification,
    refetch: () => {
      fetchProjects();
      fetchTeams();
      fetchIntegrations();
      fetchNotifications();
    },
  };
};
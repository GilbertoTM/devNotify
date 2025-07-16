import { useState, useEffect } from 'react';
import { User as SupabaseUser, AuthSession, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: AuthSession | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      // Add a small delay to ensure auth context is fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Don't show alert for profile fetch errors during initial load
        console.warn('Profile fetch failed, user may need to complete signup');
        return;
      }

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar_url,
          role: profile.role,
          createdAt: profile.created_at,
          lastLogin: 'Just now',
        };
        setUser(user);
        setIsAuthenticated(true);
      } else {
        console.warn('No profile found for user, may need to create one');
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await fetchUserProfile(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (typeof error === 'object' && error !== null && 'message' in error) {
        alert((error as any).message || 'Login failed');
      } else {
        alert('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile immediately after signup
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            role: 'developer',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Try to fetch existing profile instead
          await fetchUserProfile(data.user);
        } else {
          // Profile created successfully, fetch it
          await fetchUserProfile(data.user);
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      if (
        typeof error === 'object' && error !== null &&
        'status' in error && (error as any).status === 422 &&
        'code' in error && (error as any).code === 'user_already_exists'
      ) {
        alert('El correo ya está registrado. Por favor, inicia sesión.');
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        alert((error as any).message || 'Sign up failed');
      } else {
        alert('Sign up failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            role: 'developer',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't show alert, just log the error
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      if (
        typeof error === 'object' && error !== null &&
        'status' in error && (error as any).status === 422 &&
        'code' in error && (error as any).code === 'user_already_exists'
      ) {
        alert('El correo ya está registrado. Por favor, inicia sesión.');
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        alert((error as any).message || 'Sign up failed');
      } else {
        alert('Sign up failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getAllUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return profiles?.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar_url,
        role: profile.role,
        createdAt: profile.created_at,
        lastLogin: 'Recently',
      })) || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signUp,
    logout,
    getAllUsers,
  };
};
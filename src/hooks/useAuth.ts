import { useState, useEffect } from 'react';
import { User as SupabaseUser, AuthSession, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, withTimeout } from '../lib/supabase';
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
      console.log('🔍 [fetchUserProfile] Fetching user profile for:', authUser.email);
      // Add a small delay to ensure auth context is fully established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await withTimeout(
        Promise.resolve(supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()),
        5000,
        'FetchUserProfile'
      );
      
      const { data: profile, error } = result as any;

      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // Si es un error 500, probablemente es un problema de RLS
        if (error.message?.includes('500') || error.code === 'PGRST301') {
          console.warn('⚠️ RLS policy error - creating profile from auth user');
          
          // Crear el perfil desde los datos del usuario autenticado
          const fallbackUser: User = {
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            avatar: authUser.user_metadata?.avatar_url || null,
            role: 'developer',
            createdAt: authUser.created_at,
            lastLogin: 'Just now',
          };
          
          setUser(fallbackUser);
          setIsAuthenticated(true);
          console.log('✅ Fallback user profile created');
          
          // Intentar crear el perfil en segundo plano (sin bloquear)
          createUserProfile(authUser, fallbackUser.name).catch(err => {
            console.warn('Background profile creation failed:', err);
          });
          return;
        }
        
        console.warn('⚠️ Profile fetch failed, user may need to complete signup');
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
        console.log('✅ User profile loaded successfully');
      } else {
        console.warn('⚠️ No profile found for user, creating one...');
        // Crear perfil desde datos de auth (sin bloquear)
        const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';
        createUserProfile(authUser, userName).catch(err => {
          console.warn('Background profile creation failed:', err);
        });
      }
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error);
      
      // Si falla todo, crear un usuario básico para no bloquear la aplicación
      const fallbackUser: User = {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        avatar: authUser.user_metadata?.avatar_url || null,
        role: 'developer',
        createdAt: authUser.created_at,
        lastLogin: 'Just now',
      };
      
      setUser(fallbackUser);
      setIsAuthenticated(true);
      console.log('✅ Emergency fallback user created');
    }
  };

  const createUserProfile = async (authUser: SupabaseUser, name: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email || '',
          name: name,
          role: 'developer',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return;
      }

      if (data) {
        const user: User = {
          id: data.id,
          email: data.email,
          name: data.name,
          avatar: data.avatar_url,
          role: data.role,
          createdAt: data.created_at,
          lastLogin: 'Just now',
        };
        setUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('🚀 [login] Iniciando proceso de login con timeout de 30s...');
    
    // Implementar un timeout para evitar esperas infinitas
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => {
        console.log('⏰ [login] Timeout alcanzado - 30 segundos');
        reject(new Error('Tiempo de espera agotado'));
      }, 30000)
    );
    
    try {
      console.log('📡 Enviando solicitud de autenticación a Supabase...');
      // Competir entre la autenticación y el timeout
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeoutPromise
      ]);
      
      console.log('✅ Respuesta recibida de Supabase');
      // Si llegamos aquí, la autenticación respondió antes del timeout
      const { data, error } = result as any;
      
      if (error) {
        console.error('❌ Error de inicio de sesión:', error.message);
        throw error;
      }

      if (data?.user) {
        console.log('👤 Usuario autenticado, obteniendo perfil...');
        // Fetch user profile after successful login
        await fetchUserProfile(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error('No se recibieron datos de usuario');
      }
    } catch (error: any) {
      console.error('💥 Login error:', error.message);
      const errorMessage = error.message || 'Error al iniciar sesión';
      alert(errorMessage);
      return { success: false, error: errorMessage };
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
import React, { useState } from 'react';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  BoltIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { testSupabaseConnection } from '../lib/supabase';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onSignUp?: (email: string, password: string, name: string) => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSignUp, isLoading = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const { login, signUp, isLoading: authIsLoading } = useAuth();
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    // Validación básica
    if (!email || !password) {
      setLocalError('Por favor complete todos los campos');
      return;
    }
    
    if (isSignUpMode && !name) {
      setLocalError('Por favor complete el nombre');
      return;
    }
    
    try {
      console.log('Iniciando proceso de login...');
      if (isSignUpMode) {
        await signUp(email, password, name);
      } else {
        const result = await login(email, password);
        if (!result?.success) {
          setLocalError(result?.error || 'Error al iniciar sesión');
        }
      }
    } catch (err) {
      console.error('Error en formulario de login:', err);
      setLocalError('Ocurrió un error inesperado');
    }
  };

  const handleTestConnection = async () => {
    console.log('🧪 Probando conectividad con Supabase...');
    const isConnected = await testSupabaseConnection();
    if (isConnected) {
      alert('✅ Conexión exitosa con Supabase');
    } else {
      alert('❌ Error de conexión con Supabase');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <BoltIcon className="w-12 h-12 text-blue-400" />
              <div className="absolute inset-0 w-12 h-12 bg-blue-400/20 rounded-full blur-lg"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              DevNotify
            </h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-300">
            {isSignUpMode ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-gray-400">
            Unified developer notification hub
          </p>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          {localError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{localError}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUpMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required={isSignUpMode}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-700/80 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-700/80 transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-700/80 transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {!isSignUpMode && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500/50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Botón de prueba de conectividad */}
            <button
              type="button"
              onClick={handleTestConnection}
              className="w-full py-2 px-4 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm"
            >
              🧪 Probar Conexión con Supabase
            </button>

            <div>
              <button
                type="submit"
                disabled={isLoading || authIsLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                {isLoading || authIsLoading ? 
                  (isSignUpMode ? 'Creating account...' : 'Signing in...') : 
                  (isSignUpMode ? 'Create Account' : 'Sign in')
                }
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(!isSignUpMode)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {isSignUpMode ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};
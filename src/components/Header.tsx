import React, { useState } from 'react';
import { 
  BellIcon, 
  MagnifyingGlassIcon, 
  Cog6ToothIcon, 
  UserIcon, 
  Bars3Icon,
  BoltIcon
} from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
            >
              <Bars3Icon className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <BoltIcon className="w-8 h-8 text-blue-400" />
                <div className="absolute inset-0 w-8 h-8 bg-blue-400/20 rounded-full blur-md"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                DevNotify
              </h1>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-gray-800/80 transition-all duration-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 relative group">
              <BellIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></span>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group">
              <Cog6ToothIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group">
              <UserIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
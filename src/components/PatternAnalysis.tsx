import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  ClockIcon,  
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Notification, NotificationPattern } from '../types';

interface PatternAnalysisProps {
  patterns: NotificationPattern[];
  notifications: Notification[];
}

export const PatternAnalysis: React.FC<PatternAnalysisProps> = ({
  patterns,
  notifications
}) => {
  const [selectedPattern, setSelectedPattern] = useState<NotificationPattern | null>(null);

  // Calculate pattern statistics
  const patternStats = {
    recurring: patterns.filter(p => p.type === 'recurring').length,
    escalating: patterns.filter(p => p.type === 'escalating').length,
    commonErrors: patterns.filter(p => p.type === 'common_error').length,
    highSeverity: patterns.filter(p => p.severity === 'high').length
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'recurring':
        return ArrowPathIcon;
      case 'escalating':
        return ArrowTrendingUpIcon;
      case 'common_error':
        return ExclamationTriangleIcon;
      default:
        return ChartBarIcon;
    }
  };

  const getPatternColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400';
      case 'low':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
      default:
        return 'border-gray-500/30 bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pattern Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <ArrowPathIcon className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-blue-400">{patternStats.recurring}</div>
              <div className="text-sm text-gray-400">Recurring Issues</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-yellow-400">{patternStats.escalating}</div>
              <div className="text-sm text-gray-400">Escalating Patterns</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-red-400">{patternStats.commonErrors}</div>
              <div className="text-sm text-gray-400">Common Errors</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="w-6 h-6 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-purple-400">{patternStats.highSeverity}</div>
              <div className="text-sm text-gray-400">High Severity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <ChartBarIcon className="w-5 h-5" />
            <span>Detected Patterns</span>
          </h3>
          
          {patterns.length === 0 ? (
            <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700/50">
              <ChartBarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No patterns detected yet</p>
              <p className="text-sm text-gray-500 mt-1">Patterns will appear as more data is collected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.map((pattern) => {
                const PatternIcon = getPatternIcon(pattern.type);
                return (
                  <div
                    key={pattern.id}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105
                      ${getPatternColor(pattern.severity)}
                      ${selectedPattern?.id === pattern.id ? 'ring-2 ring-blue-500/50' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <PatternIcon className="w-5 h-5" />
                        <span className="font-medium">{pattern.title}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-current/20">
                        {pattern.severity}
                      </span>
                    </div>
                    
                    <p className="text-sm opacity-80 mb-2">{pattern.description}</p>
                    
                    <div className="flex items-center justify-between text-xs opacity-60">
                      <span>Frequency: {pattern.frequency}x</span>
                      <span>Last: {pattern.lastOccurrence.toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pattern Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <LightBulbIcon className="w-5 h-5" />
            <span>Pattern Details</span>
          </h3>
          
          {selectedPattern ? (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
              <div className="flex items-center space-x-3">
                {React.createElement(getPatternIcon(selectedPattern.type), { 
                  className: "w-6 h-6 text-blue-400" 
                })}
                <h4 className="text-xl font-semibold text-white">{selectedPattern.title}</h4>
              </div>
              
              <p className="text-gray-300">{selectedPattern.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Frequency</div>
                  <div className="text-lg font-semibold text-white">{selectedPattern.frequency} times</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Severity</div>
                  <div className={`text-lg font-semibold capitalize ${
                    selectedPattern.severity === 'high' ? 'text-red-400' :
                    selectedPattern.severity === 'medium' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {selectedPattern.severity}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-2">Last Occurrence</div>
                <div className="text-white">{selectedPattern.lastOccurrence.toLocaleString()}</div>
              </div>
              
              {selectedPattern.suggestion && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <LightBulbIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-blue-400 mb-1">Suggestion</div>
                      <div className="text-sm text-gray-300">{selectedPattern.suggestion}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm text-gray-400 mb-2">Related Notifications</div>
                <div className="text-sm text-gray-300">
                  {selectedPattern.relatedNotifications.length} notifications linked to this pattern
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 text-center">
              <LightBulbIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Select a pattern to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
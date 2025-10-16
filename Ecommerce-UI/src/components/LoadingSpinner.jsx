import React from 'react';
import { Zap } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  showText = false,
  text = 'Loading...',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-32 h-32'
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    gray: 'border-gray-200 border-t-gray-600',
    white: 'border-white border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600'
  };

  if (variant === 'professional') {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 ${className}`}>
        <div className="relative">
          {/* Outer rotating ring */}
          <div className={`${sizeClasses[size]} rounded-full border-4 border-blue-100 animate-spin`}></div>
          
          {/* Inner pulsing ring */}
          <div className={`absolute inset-2 rounded-full border-4 border-blue-300 animate-ping`}></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        {/* Loading text with animation */}
        {showText && (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-gray-700 animate-pulse">{text}</p>
            <div className="flex space-x-1 mt-2 justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} rounded-full animate-spin`}></div>
      {showText && (
        <p className="mt-2 text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

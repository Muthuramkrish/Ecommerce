import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  className = '',
  showText = false,
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    gray: 'border-gray-200 border-t-gray-600',
    white: 'border-white border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    red: 'border-red-200 border-t-red-600'
  };

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

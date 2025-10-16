import React from 'react';
import logo from '../assets/logo.png';

const LoadingPage = ({ message = "Loading...", showProgress = false }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner with centered logo */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          {/* Outer ring */}
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          {/* Inner counter-rotating ring */}
          <div className="absolute inset-1 w-18 h-18 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          {/* Centered logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={logo} alt="Logo" className="w-9 h-9 object-contain opacity-90" />
          </div>
        </div>
        
        {/* Loading text */}
        <p className="text-lg font-medium text-gray-700 mb-2">{message}</p>
        
        {/* Optional progress indicator */}
        {showProgress && (
          <div className="w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        )}
        
        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1 mt-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
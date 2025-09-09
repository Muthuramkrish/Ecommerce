// App.load.js - Functions for App component initialization
import { useEffect } from 'react';

// App initialization and configuration
export const useAppInitialization = () => {
  // Initialize app-wide settings
  useEffect(() => {
    // Set up global error handlers
    const handleGlobalError = (error) => {
      console.error('Global error:', error);
      // You can add error reporting service here
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // You can add error reporting service here
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return {};
};

// App theme and styling configuration
export const useAppTheme = () => {
  useEffect(() => {
    // Set up theme configuration
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const setTheme = (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  return { setTheme };
};

// App performance monitoring
export const useAppPerformance = () => {
  useEffect(() => {
    // Monitor app performance
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('Navigation timing:', entry);
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'paint'] });

      return () => observer.disconnect();
    }
  }, []);

  return {};
};
import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-5 animate-pulse">
            <div className="skeleton h-48 rounded-xl mb-4"></div>
            <div className="space-y-3">
              <div className="skeleton h-4 w-3/4 rounded"></div>
              <div className="skeleton h-3 w-1/2 rounded"></div>
              <div className="flex justify-between items-center">
                <div className="skeleton h-6 w-20 rounded"></div>
                <div className="skeleton h-4 w-16 rounded"></div>
              </div>
              <div className="skeleton h-12 w-full rounded-xl"></div>
            </div>
          </div>
        );
      
      case 'category':
        return (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 animate-pulse">
            <div className="skeleton h-40 rounded-2xl mb-6"></div>
            <div className="text-center space-y-3">
              <div className="skeleton h-6 w-3/4 mx-auto rounded"></div>
              <div className="skeleton h-4 w-1/2 mx-auto rounded"></div>
              <div className="skeleton h-1 w-12 mx-auto rounded-full"></div>
            </div>
          </div>
        );
      
      case 'hero':
        return (
          <div className="relative h-[60vh] sm:h-[70vh] md:h-[90vh] bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="skeleton h-4 w-32 mx-auto rounded-full"></div>
                <div className="skeleton h-16 w-96 mx-auto rounded"></div>
                <div className="skeleton h-8 w-80 mx-auto rounded"></div>
                <div className="skeleton h-6 w-96 mx-auto rounded"></div>
                <div className="flex gap-4 justify-center">
                  <div className="skeleton h-12 w-32 rounded-xl"></div>
                  <div className="skeleton h-12 w-32 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-3 animate-pulse">
            <div className="skeleton h-4 w-full rounded"></div>
            <div className="skeleton h-4 w-5/6 rounded"></div>
            <div className="skeleton h-4 w-4/6 rounded"></div>
          </div>
        );
      
      default:
        return <div className="skeleton h-4 w-full rounded"></div>;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
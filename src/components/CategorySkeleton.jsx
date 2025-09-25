import React from 'react';

const CategorySkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
        <div className="h-8 sm:h-10 md:h-12 lg:h-14 bg-gray-300 rounded-lg mx-auto mb-2 sm:mb-3 md:mb-4 w-64 sm:w-80"></div>
        <div className="h-4 sm:h-5 md:h-6 bg-gray-200 rounded mx-auto w-80 sm:w-96 md:w-[500px]"></div>
      </div>

      {/* Desktop Skeleton - Horizontal Scrollable */}
      <div className="hidden lg:block">
        <div className="flex gap-4 xl:gap-6 px-8 xl:px-12 py-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex-shrink-0" style={{ width: '260px', height: '200px' }}>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-28 bg-gray-300"></div>
                <div className="p-4 text-center">
                  <div className="h-5 bg-gray-300 rounded mb-2 mx-auto w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mx-auto w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet Skeleton - 3 Column Grid */}
      <div className="hidden md:grid lg:hidden grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="h-24 sm:h-28 bg-gray-300"></div>
            <div className="p-3 sm:p-4 text-center">
              <div className="h-4 sm:h-5 bg-gray-300 rounded mb-1 mx-auto w-3/4"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded mx-auto w-1/2"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Skeleton - 2 Column Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg sm:rounded-xl border border-gray-100 overflow-hidden">
            <div className="h-16 sm:h-20 bg-gray-300"></div>
            <div className="p-2 sm:p-3 text-center">
              <div className="h-3 sm:h-4 bg-gray-300 rounded mb-0.5 sm:mb-1 mx-auto w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mx-auto w-1/2"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Skeleton */}
      <div className="hidden sm:flex justify-center items-center mt-8 lg:mt-12 space-x-6 lg:space-x-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <React.Fragment key={index}>
            {index > 0 && <div className="w-px h-8 bg-gray-300"></div>}
            <div className="text-center">
              <div className="h-6 lg:h-7 bg-gray-300 rounded mb-1 w-12 mx-auto"></div>
              <div className="h-4 lg:h-5 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CategorySkeleton;
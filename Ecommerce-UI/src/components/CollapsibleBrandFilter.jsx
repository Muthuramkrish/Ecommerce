import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X, Search } from 'lucide-react';

const CollapsibleBrandFilter = ({
  brands = [],
  selectedBrands = [],
  onBrandToggle,
  onClearAll,
  title = "Brand"
}) => {
  const [isExpanded, setIsExpanded] = useState(selectedBrands.length > 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredBrands = brands.filter(brand => 
    brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleBrands = showAll ? filteredBrands : filteredBrands.slice(0, 8);
  const hasActiveFilters = selectedBrands.length > 0;

  if (brands.length <= 1) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          <span>{title}</span>
          <span className="text-gray-500">({brands.length})</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {selectedBrands.length}
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          {/* Brand List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {visibleBrands.map((brand) => {
              const isSelected = selectedBrands.includes(brand);
              
              return (
                <label key={brand} className="flex items-center cursor-pointer group">
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center mr-3 transition-colors ${
                      isSelected
                        ? 'bg-blue-900 border-blue-900'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      onBrandToggle(brand);
                    }}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                    {brand}
                  </span>
                </label>
              );
            })}
            
            {filteredBrands.length === 0 && (
              <div className="text-sm text-gray-500 py-2">
                No brands found
              </div>
            )}
          </div>

          {/* Show More/Less Button */}
          {filteredBrands.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAll ? 'Show less' : `Show ${filteredBrands.length - 8} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleBrandFilter;
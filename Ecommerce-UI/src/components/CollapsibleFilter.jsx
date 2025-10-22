import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X } from 'lucide-react';

const CollapsibleFilter = ({
  items = [],
  selectedItems = [],
  onItemToggle,
  onClearAll,
  title = "Filter",
  maxVisible = 8,
  searchable = false
}) => {
  const [isExpanded, setIsExpanded] = useState(selectedItems.length > 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredItems = searchable 
    ? items.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, maxVisible);
  const hasActiveFilters = selectedItems.length > 0;

  if (items.length <= 1) {
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
          <span className="text-gray-500">({items.length})</span>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {selectedItems.length}
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
          {/* Search Box (if searchable) */}
          {searchable && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Items List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {visibleItems.map((item) => {
              const isSelected = selectedItems.includes(item);
              
              return (
                <label key={item} className="flex items-center cursor-pointer group">
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center mr-3 transition-colors ${
                      isSelected
                        ? 'bg-blue-900 border-blue-900'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      onItemToggle(item);
                    }}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                    {item}
                  </span>
                </label>
              );
            })}
            
            {filteredItems.length === 0 && (
              <div className="text-sm text-gray-500 py-2">
                No {title.toLowerCase()} found
              </div>
            )}
          </div>

          {/* Show More/Less Button */}
          {filteredItems.length > maxVisible && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAll ? 'Show less' : `Show ${filteredItems.length - maxVisible} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleFilter;
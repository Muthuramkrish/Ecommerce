import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check, X } from 'lucide-react';

const HierarchicalCategoryFilter = ({
  products = [],
  selectedCategories = [],
  selectedSubcategories = [],
  selectedSubSubcategories = [],
  onCategoryToggle,
  onSubcategoryToggle,
  onSubSubcategoryToggle,
  onClearAll,
  title = "Shop by Category"
}) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState(new Set());

  // Build hierarchical category structure from products
  const categoryHierarchy = React.useMemo(() => {
    const hierarchy = new Map();

    products.forEach(product => {
      const category = product.raw?.anchor?.category;
      const subcategory = product.raw?.anchor?.subcategory;
      const subSubcategory = product.raw?.anchor?.subSubcategory;

      if (!category) return;

      if (!hierarchy.has(category)) {
        hierarchy.set(category, {
          name: category,
          count: 0,
          subcategories: new Map()
        });
      }

      const categoryData = hierarchy.get(category);
      categoryData.count++;

      if (subcategory) {
        if (!categoryData.subcategories.has(subcategory)) {
          categoryData.subcategories.set(subcategory, {
            name: subcategory,
            count: 0,
            subSubcategories: new Map()
          });
        }

        const subcategoryData = categoryData.subcategories.get(subcategory);
        subcategoryData.count++;

        if (subSubcategory) {
          if (!subcategoryData.subSubcategories.has(subSubcategory)) {
            subcategoryData.subSubcategories.set(subSubcategory, {
              name: subSubcategory,
              count: 0
            });
          }

          const subSubcategoryData = subcategoryData.subSubcategories.get(subSubcategory);
          subSubcategoryData.count++;
        }
      }
    });

    // Convert Maps to Arrays and sort by name
    const result = Array.from(hierarchy.values()).map(category => ({
      ...category,
      subcategories: Array.from(category.subcategories.values()).map(subcategory => ({
        ...subcategory,
        subSubcategories: Array.from(subcategory.subSubcategories.values()).sort((a, b) => a.name.localeCompare(b.name))
      })).sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products]);

  // Auto-expand categories that have selected items
  useEffect(() => {
    const newExpandedCategories = new Set(expandedCategories);
    const newExpandedSubcategories = new Set(expandedSubcategories);

    // Expand categories with selected subcategories or sub-subcategories
    categoryHierarchy.forEach(category => {
      const hasSelectedSubcategory = category.subcategories.some(sub => 
        selectedSubcategories.includes(sub.name)
      );
      const hasSelectedSubSubcategory = category.subcategories.some(sub =>
        sub.subSubcategories.some(subSub => selectedSubSubcategories.includes(subSub.name))
      );

      if (selectedCategories.includes(category.name) || hasSelectedSubcategory || hasSelectedSubSubcategory) {
        newExpandedCategories.add(category.name);
      }

      // Expand subcategories with selected sub-subcategories
      category.subcategories.forEach(subcategory => {
        const hasSelectedSubSubcategory = subcategory.subSubcategories.some(subSub => 
          selectedSubSubcategories.includes(subSub.name)
        );

        if (selectedSubcategories.includes(subcategory.name) || hasSelectedSubSubcategory) {
          newExpandedSubcategories.add(`${category.name}:${subcategory.name}`);
        }
      });
    });

    setExpandedCategories(newExpandedCategories);
    setExpandedSubcategories(newExpandedSubcategories);
  }, [selectedCategories, selectedSubcategories, selectedSubSubcategories, categoryHierarchy]);

  const toggleCategoryExpansion = (categoryName) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategoryExpansion = (categoryName, subcategoryName) => {
    const key = `${categoryName}:${subcategoryName}`;
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubcategories(newExpanded);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedSubcategories.length > 0 || selectedSubSubcategories.length > 0;

  if (categoryHierarchy.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          {title}
          {hasActiveFilters && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {selectedCategories.length + selectedSubcategories.length + selectedSubSubcategories.length}
            </span>
          )}
        </h3>
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

      <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
        {categoryHierarchy.map((category) => {
          const isCategoryExpanded = expandedCategories.has(category.name);
          const isCategorySelected = selectedCategories.includes(category.name);
          
          return (
            <div key={category.name} className="space-y-1">
              {/* Category Level */}
              <div className="flex items-center group">
                <button
                  onClick={() => toggleCategoryExpansion(category.name)}
                  className="flex items-center flex-1 text-left py-2 px-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center mr-2">
                    {category.subcategories.length > 0 ? (
                      isCategoryExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex items-center flex-1">
                    <div
                      className={`w-4 h-4 border-2 rounded flex items-center justify-center mr-3 cursor-pointer ${
                        isCategorySelected
                          ? 'bg-blue-900 border-blue-900'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoryToggle(category.name);
                      }}
                    >
                      {isCategorySelected && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    
                    <span className={`text-sm flex-1 ${isCategorySelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                      {category.name}
                    </span>
                    
                    <span className="text-xs text-gray-500 ml-2">
                      ({category.count})
                    </span>
                  </div>
                </button>
              </div>

              {/* Subcategories */}
              {isCategoryExpanded && category.subcategories.length > 0 && (
                <div className="ml-6 space-y-1 border-l-2 border-gray-100 pl-4">
                  {category.subcategories.map((subcategory) => {
                    const subcategoryKey = `${category.name}:${subcategory.name}`;
                    const isSubcategoryExpanded = expandedSubcategories.has(subcategoryKey);
                    const isSubcategorySelected = selectedSubcategories.includes(subcategory.name);

                    return (
                      <div key={subcategory.name} className="space-y-1">
                        {/* Subcategory Level */}
                        <div className="flex items-center group">
                          <button
                            onClick={() => toggleSubcategoryExpansion(category.name, subcategory.name)}
                            className="flex items-center flex-1 text-left py-1.5 px-2 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center mr-2">
                              {subcategory.subSubcategories.length > 0 ? (
                                isSubcategoryExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-gray-400" />
                                )
                              ) : (
                                <div className="w-3 h-3" />
                              )}
                            </div>
                            
                            <div className="flex items-center flex-1">
                              <div
                                className={`w-3 h-3 border-2 rounded flex items-center justify-center mr-2 cursor-pointer ${
                                  isSubcategorySelected
                                    ? 'bg-blue-900 border-blue-900'
                                    : 'border-gray-300 hover:border-blue-400'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSubcategoryToggle(subcategory.name);
                                }}
                              >
                                {isSubcategorySelected && (
                                  <Check className="w-2 h-2 text-white" />
                                )}
                              </div>
                              
                              <span className={`text-sm flex-1 ${isSubcategorySelected ? 'font-medium text-blue-900' : 'text-gray-600'}`}>
                                {subcategory.name}
                              </span>
                              
                              <span className="text-xs text-gray-500 ml-2">
                                ({subcategory.count})
                              </span>
                            </div>
                          </button>
                        </div>

                        {/* Sub-subcategories */}
                        {isSubcategoryExpanded && subcategory.subSubcategories.length > 0 && (
                          <div className="ml-4 space-y-1 border-l border-gray-100 pl-3">
                            {subcategory.subSubcategories.map((subSubcategory) => {
                              const isSubSubcategorySelected = selectedSubSubcategories.includes(subSubcategory.name);

                              return (
                                <div key={subSubcategory.name} className="flex items-center group">
                                  <button
                                    onClick={() => onSubSubcategoryToggle(subSubcategory.name)}
                                    className="flex items-center flex-1 text-left py-1 px-2 rounded-md hover:bg-gray-50 transition-colors"
                                  >
                                    <div
                                      className={`w-3 h-3 border rounded flex items-center justify-center mr-2 ${
                                        isSubSubcategorySelected
                                          ? 'bg-blue-900 border-blue-900'
                                          : 'border-gray-300 hover:border-blue-400'
                                      }`}
                                    >
                                      {isSubSubcategorySelected && (
                                        <Check className="w-2 h-2 text-white" />
                                      )}
                                    </div>
                                    
                                    <span className={`text-xs flex-1 ${isSubSubcategorySelected ? 'font-medium text-blue-900' : 'text-gray-600'}`}>
                                      {subSubcategory.name}
                                    </span>
                                    
                                    <span className="text-xs text-gray-500 ml-2">
                                      ({subSubcategory.count})
                                    </span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HierarchicalCategoryFilter;
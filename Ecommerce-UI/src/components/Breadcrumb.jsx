import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Component
 * 
 * A comprehensive breadcrumb navigation component that supports:
 * - Category hierarchy navigation (category > subcategory > sub-subcategory)
 * - Applied filter breadcrumbs (brand, product type, etc.)
 * - Product detail page navigation
 * - Menu-based navigation breadcrumbs
 * 
 * Features:
 * - Animated transitions and hover effects
 * - Multiple separator styles (chevron, arrow, slash)
 * - Home button with optional display
 * - Responsive design
 * - Accessibility support
 * 
 * @param {Array} items - Array of breadcrumb items with label, path, type, value properties
 * @param {Function} onNavigate - Navigation handler function (path, type, value)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showHome - Whether to show home button (default: true)
 * @param {string} separator - Separator style: "chevron", "arrow", "slash" (default: "chevron")
 */

const Breadcrumb = ({ 
  items = [], 
  onNavigate, 
  className = "",
  showHome = true,
  separator = "chevron" // "chevron" | "arrow" | "slash"
}) => {
  const handleItemClick = (item, index) => {
    if (item.onClick) {
      item.onClick();
    } else if (onNavigate && item.path) {
      onNavigate(item.path, item.type, item.value);
    }
  };

  const renderSeparator = () => {
    switch (separator) {
      case "arrow":
        return <span className="mx-2 text-gray-400 text-sm">→</span>;
      case "slash":
        return <span className="mx-2 text-gray-400 text-sm">/</span>;
      case "chevron":
      default:
        return <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />;
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm animate-fade-in-up ${className}`}
      aria-label="Breadcrumb"
    >
      {showHome && (
        <>
          <button
            onClick={() => onNavigate && onNavigate('/', 'home')}
            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:scale-105 group"
            aria-label="Home"
          >
            <Home className="w-4 h-4 group-hover:animate-bounce" />
          </button>
          {items.length > 0 && renderSeparator()}
        </>
      )}
      
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              {!isLast ? (
                <button
                  onClick={() => handleItemClick(item, index)}
                  className={`text-blue-600 hover:text-blue-800 hover:underline transition-all duration-200 hover:scale-105 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 hover:shadow-sm ${
                    item.active ? 'bg-blue-100 text-blue-800' : ''
                  }`}
                  title={item.title || item.label}
                >
                  {item.label}
                </button>
              ) : (
                <span 
                  className="text-gray-700 font-medium px-2 py-1 bg-gray-100 rounded-lg"
                  title={item.title || item.label}
                >
                  {item.label}
                </span>
              )}
              
              {!isLast && renderSeparator()}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Helper function to build breadcrumb items from navigation context
export const buildBreadcrumbItems = ({
  category,
  subcategory,
  subSubcategory,
  brand,
  productType,
  appliedFilters = {},
  currentPage = 'category'
}) => {
  const items = [];

  // Add category if present
  if (category) {
    items.push({
      label: category,
      path: `#category/${encodeURIComponent(category)}`,
      type: 'category',
      value: category,
      title: `Browse ${category} products`
    });
  }

  // Add subcategory if present
  if (subcategory) {
    items.push({
      label: subcategory,
      path: `#subcategory/${encodeURIComponent(subcategory)}`,
      type: 'subcategory',
      value: subcategory,
      title: `Browse ${subcategory} products`
    });
  }

  // Add sub-subcategory if present
  if (subSubcategory) {
    items.push({
      label: subSubcategory,
      path: `#sub-subcategory/${encodeURIComponent(subSubcategory)}`,
      type: 'sub-subcategory',
      value: subSubcategory,
      title: `Browse ${subSubcategory} products`
    });
  }

  // Add applied filters as breadcrumb items
  if (appliedFilters) {
    // Add brand filter
    if (appliedFilters.brand && appliedFilters.brand.length > 0) {
      appliedFilters.brand.forEach(brandName => {
        items.push({
          label: `Brand: ${brandName}`,
          path: `#category/${encodeURIComponent(category || subcategory)}/filter/brand/${encodeURIComponent(brandName)}`,
          type: 'brand',
          value: brandName,
          title: `Filter by brand: ${brandName}`,
          isFilter: true
        });
      });
    }

    // Add product type filter
    if (appliedFilters.productType && appliedFilters.productType.length > 0) {
      appliedFilters.productType.forEach(type => {
        items.push({
          label: `Type: ${type}`,
          path: `#category/${encodeURIComponent(category || subcategory)}/filter/productType/${encodeURIComponent(type)}`,
          type: 'productType',
          value: type,
          title: `Filter by type: ${type}`,
          isFilter: true
        });
      });
    }

    // Add category filter (when filtering within a broader context)
    if (appliedFilters.category && appliedFilters.category.length > 0 && currentPage !== 'category') {
      appliedFilters.category.forEach(cat => {
        items.push({
          label: `Category: ${cat}`,
          path: `#category/${encodeURIComponent(cat)}`,
          type: 'category',
          value: cat,
          title: `Filter by category: ${cat}`,
          isFilter: true
        });
      });
    }

    // Add subcategory filter
    if (appliedFilters.subcategory && appliedFilters.subcategory.length > 0 && currentPage !== 'subcategory') {
      appliedFilters.subcategory.forEach(subcat => {
        items.push({
          label: `Subcategory: ${subcat}`,
          path: `#subcategory/${encodeURIComponent(subcat)}`,
          type: 'subcategory',
          value: subcat,
          title: `Filter by subcategory: ${subcat}`,
          isFilter: true
        });
      });
    }

    // Add sub-subcategory filter
    if (appliedFilters.subSubcategory && appliedFilters.subSubcategory.length > 0 && currentPage !== 'sub-subcategory') {
      appliedFilters.subSubcategory.forEach(subsubcat => {
        items.push({
          label: `Sub-subcategory: ${subsubcat}`,
          path: `#sub-subcategory/${encodeURIComponent(subsubcat)}`,
          type: 'sub-subcategory',
          value: subsubcat,
          title: `Filter by sub-subcategory: ${subsubcat}`,
          isFilter: true
        });
      });
    }
  }

  // Add individual brand/productType if specified (for product details page)
  if (brand && !appliedFilters?.brand?.includes(brand)) {
    items.push({
      label: brand,
      path: `#category/${encodeURIComponent(category || subcategory)}/filter/brand/${encodeURIComponent(brand)}`,
      type: 'brand',
      value: brand,
      title: `Browse ${brand} products`
    });
  }

  if (productType && !appliedFilters?.productType?.includes(productType)) {
    items.push({
      label: productType,
      path: `#category/${encodeURIComponent(category || subcategory)}/filter/productType/${encodeURIComponent(productType)}`,
      type: 'productType',
      value: productType,
      title: `Browse ${productType} products`
    });
  }

  return items;
};

// Helper function to build breadcrumbs from product anchor data
export const buildProductBreadcrumbs = (anchor = {}) => {
  return buildBreadcrumbItems({
    category: anchor.category,
    subcategory: anchor.subcategory,
    subSubcategory: anchor.subSubcategory,
    brand: anchor.brand,
    productType: anchor.productType,
    currentPage: 'product'
  });
};

// Helper function to build breadcrumbs from current filters
export const buildFilterBreadcrumbs = (filters = {}, baseCategory = null) => {
  return buildBreadcrumbItems({
    category: baseCategory,
    appliedFilters: filters,
    currentPage: 'category'
  });
};

export default Breadcrumb;
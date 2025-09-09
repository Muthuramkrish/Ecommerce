// CategoryListPage.load.js - Functions for CategoryListPage component
import { useState, useEffect, useMemo } from 'react';

// Page initialization
export const useCategoryPageInit = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  return {};
};

// View mode and responsive handling
export const useViewMode = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    viewMode,
    setViewMode,
    isDesktop
  };
};

// Sorting functionality
export const useSorting = (products) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortedProducts, setSortedProducts] = useState(products);

  const sortProducts = (productsToSort, sortType) => {
    const sorted = [...productsToSort];
    switch (sortType) {
      case 'name':
        return sorted.sort((a, b) => a['product-title'].localeCompare(b['product-title']));
      case 'price-low':
        return sorted.sort((a, b) => parseFloat(a['new-price']) - parseFloat(b['new-price']));
      case 'price-high':
        return sorted.sort((a, b) => parseFloat(b['new-price']) - parseFloat(a['new-price']));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  };

  return {
    sortBy,
    setSortBy,
    sortedProducts,
    setSortedProducts,
    sortProducts
  };
};

// Price range calculations
export const usePriceRange = (products) => {
  const allPrices = useMemo(() => 
    products.map(p => parseInt(p['new-price']) || 0).filter(n => !isNaN(n)), 
    [products]
  );
  
  const minPrice = useMemo(() => (allPrices.length ? Math.min(...allPrices) : 0), [allPrices]);
  const maxPrice = useMemo(() => (allPrices.length ? Math.max(...allPrices) : 0), [allPrices]);

  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  return {
    priceRange,
    setPriceRange,
    minPrice,
    maxPrice
  };
};

// Filter states management
export const useFilters = (initialFilters = {}) => {
  const [selectedBrands, setSelectedBrands] = useState(initialFilters?.brand || []);
  const [selectedProductTypes, setSelectedProductTypes] = useState(initialFilters?.productType || []);
  const [selectedSubSubcategories, setSelectedSubSubcategories] = useState(initialFilters?.subSubcategory || []);
  const [selectedPowerRanges, setSelectedPowerRanges] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [selectedWarranties, setSelectedWarranties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedProductTypes([]);
    setSelectedSubSubcategories([]);
    setSelectedPowerRanges([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setSelectedCertifications([]);
    setSelectedWarranties([]);
  };

  return {
    selectedBrands, setSelectedBrands,
    selectedProductTypes, setSelectedProductTypes,
    selectedSubSubcategories, setSelectedSubSubcategories,
    selectedPowerRanges, setSelectedPowerRanges,
    selectedColors, setSelectedColors,
    selectedSizes, setSelectedSizes,
    selectedMaterials, setSelectedMaterials,
    selectedCertifications, setSelectedCertifications,
    selectedWarranties, setSelectedWarranties,
    showFilters, setShowFilters,
    clearAllFilters
  };
};

// Filter options extraction
export const useFilterOptions = (products) => {
  const filterOptions = useMemo(() => {
    const brands = new Set();
    const productTypes = new Set();
    const subSubcategories = new Set();
    const powerRanges = new Set();
    const colors = new Set();
    const sizes = new Set();
    const materials = new Set();
    const certifications = new Set();
    const warranties = new Set();

    products.forEach(product => {
      const raw = product.raw || {};
      const anchor = raw.anchor || {};
      const characteristics = raw.characteristics || {};
      const specifications = characteristics.specifications || {};

      // Extract filter values
      if (anchor.brand) brands.add(anchor.brand);
      if (anchor.productType) productTypes.add(anchor.productType);
      if (anchor.subSubcategory) subSubcategories.add(anchor.subSubcategory);
      
      if (specifications.powerRange) powerRanges.add(specifications.powerRange);
      if (specifications.color) colors.add(specifications.color);
      if (specifications.size) sizes.add(specifications.size);
      if (specifications.material) materials.add(specifications.material);
      if (specifications.certification) certifications.add(specifications.certification);
      if (specifications.warranty) warranties.add(specifications.warranty);
    });

    return {
      brands: Array.from(brands).sort(),
      productTypes: Array.from(productTypes).sort(),
      subSubcategories: Array.from(subSubcategories).sort(),
      powerRanges: Array.from(powerRanges).sort(),
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
      materials: Array.from(materials).sort(),
      certifications: Array.from(certifications).sort(),
      warranties: Array.from(warranties).sort()
    };
  }, [products]);

  return filterOptions;
};

// Product filtering logic
export const useProductFiltering = (products, filters, priceRange) => {
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const raw = product.raw || {};
      const anchor = raw.anchor || {};
      const characteristics = raw.characteristics || {};
      const specifications = characteristics.specifications || {};
      
      const price = parseInt(product['new-price']) || 0;

      // Price filter
      if (price < priceRange[0] || price > priceRange[1]) return false;

      // Brand filter
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(anchor.brand)) return false;

      // Product type filter
      if (filters.selectedProductTypes.length > 0 && !filters.selectedProductTypes.includes(anchor.productType)) return false;

      // Sub-subcategory filter
      if (filters.selectedSubSubcategories.length > 0 && !filters.selectedSubSubcategories.includes(anchor.subSubcategory)) return false;

      // Additional filters
      if (filters.selectedPowerRanges.length > 0 && !filters.selectedPowerRanges.includes(specifications.powerRange)) return false;
      if (filters.selectedColors.length > 0 && !filters.selectedColors.includes(specifications.color)) return false;
      if (filters.selectedSizes.length > 0 && !filters.selectedSizes.includes(specifications.size)) return false;
      if (filters.selectedMaterials.length > 0 && !filters.selectedMaterials.includes(specifications.material)) return false;
      if (filters.selectedCertifications.length > 0 && !filters.selectedCertifications.includes(specifications.certification)) return false;
      if (filters.selectedWarranties.length > 0 && !filters.selectedWarranties.includes(specifications.warranty)) return false;

      return true;
    });
  }, [products, filters, priceRange]);

  return filteredProducts;
};

// Toggle filter functions
export const useFilterToggle = () => {
  const toggleFilter = (value, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter(item => item !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  };

  return { toggleFilter };
};

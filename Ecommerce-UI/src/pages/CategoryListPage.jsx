import React, { useEffect, useState } from 'react';
import { ArrowLeft, Grid, List, X, Check, ShoppingCart } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Breadcrumb, { buildBreadcrumbItems, buildFilterBreadcrumbs } from '../components/Breadcrumb';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useReducedMotion, getAnimationClasses } from '../hooks/useReducedMotion';

const CategoryListPage = ({
  category,
  products,
  onAddToCart,
  onAddToWishlist,
  onOpenDetails,
  favorites = [],
  initialFilters,
  onNavigate
}) => {
  const [viewMode, setViewMode] = React.useState('grid');
  const [sortBy, setSortBy] = React.useState('name');
  const [sortedProducts, setSortedProducts] = React.useState(products);
  const [showFilters, setShowFilters] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const subcategorySectionRef = React.useRef(null);

  // Scroll animations
  const [headerSectionRef, isHeaderVisible] = useScrollAnimation();
  const [breadcrumbSectionRef, isBreadcrumbVisible] = useScrollAnimation();
  const [filterSectionRef, isFilterVisible] = useScrollAnimation();
  const [productsSectionRef, isProductsVisible] = useScrollAnimation();
  
  // Reduced motion support
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  //

  // Derived prices
  const allPrices = React.useMemo(() => products.map(p => parseInt(p['new-price']) || 0).filter(n => !isNaN(n)), [products]);
  const minPrice = React.useMemo(() => (allPrices.length ? Math.min(...allPrices) : 0), [allPrices]);
  const maxPrice = React.useMemo(() => (allPrices.length ? Math.max(...allPrices) : 0), [allPrices]);

  // Filter states - keeping only relevant filters for electrical products
  const [priceRange, setPriceRange] = React.useState([minPrice, maxPrice]);
  const [selectedBrands, setSelectedBrands] = React.useState(initialFilters?.brand || []);
  const [selectedProductTypes, setSelectedProductTypes] = React.useState(initialFilters?.productType || []);
  const [selectedCategories, setSelectedCategories] = React.useState(initialFilters?.category || []);
  const [selectedSubcategories, setSelectedSubcategories] = React.useState(initialFilters?.subcategory || []);
  const [selectedSubSubcategories, setSelectedSubSubcategories] = React.useState(initialFilters?.subSubcategory || []);
  const [selectedPowerRanges, setSelectedPowerRanges] = React.useState([]);
  const [selectedColors, setSelectedColors] = React.useState([]);
  const [selectedSizes, setSelectedSizes] = React.useState([]);
  const [selectedMaterials, setSelectedMaterials] = React.useState([]);
  const [selectedCertifications, setSelectedCertifications] = React.useState([]);
  const [selectedWarranties, setSelectedWarranties] = React.useState([]);
  const [showOnlyDiscounted, setShowOnlyDiscounted] = React.useState(false);
  const [selectedDiscountBucket, setSelectedDiscountBucket] = React.useState(0);
  const [showOnlyInStock, setShowOnlyInStock] = React.useState(false);
  const [filteredProducts, setFilteredProducts] = React.useState(products);
  const [isFiltering, setIsFiltering] = useState(false);

  // Sync selected filters when route-provided initialFilters or category changes
  React.useEffect(() => {
    if (initialFilters) {
      setSelectedBrands(initialFilters.brand || []);
      setSelectedProductTypes(initialFilters.productType || []);
      setSelectedCategories(initialFilters.category || []);
      setSelectedSubcategories(initialFilters.subcategory || []);
      setSelectedSubSubcategories(initialFilters.subSubcategory || []);
    } else {
      setSelectedBrands([]);
      setSelectedProductTypes([]);
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      setSelectedSubSubcategories([]);
    }
    // Reset pagination on filter context change
    setCurrentPage(1);
  }, [initialFilters, category]);

  // Keep price range in sync when products change
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Pagination
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 12;
  // Scroll to top whenever page changes (covers both top and bottom pagination controls)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Brand search UI state
  const [brandQuery, setBrandQuery] = React.useState('');


  // Get available filter options based on current filtered products
  const getAvailableBrands = () => {
    const brands = filteredProducts.map(product => {
      const brand = product.raw?.anchor?.brand;
      return brand;
    }).filter(brand => brand && typeof brand === 'string' && brand.trim() !== '');
    return [...new Set(brands)].sort();
  };

  const getAvailableProductTypes = () => {
    const productTypes = filteredProducts.map(product => {
      const productType = product.raw?.anchor?.productType;
      return productType;
    }).filter(productType => productType && typeof productType === 'string' && productType.trim() !== '');
    return [...new Set(productTypes)].sort();
  };

  const getAvailableCategories = () => {
    const categories = filteredProducts.map(product => {
      const category = product.raw?.anchor?.category;
      return category;
    }).filter(category => category && typeof category === 'string' && category.trim() !== '');
    return [...new Set(categories)].sort();
  };

  const getAvailableSubcategories = () => {
    const subcategories = filteredProducts.map(product => {
      const subcategory = product.raw?.anchor?.subcategory;
      return subcategory;
    }).filter(subcategory => subcategory && typeof subcategory === 'string' && subcategory.trim() !== '');
    return [...new Set(subcategories)].sort();
  };

  const getAvailableSubSubcategories = () => {
    const subSubcategories = filteredProducts.map(product => {
      const subSubcategory = product.raw?.anchor?.subSubcategory;
      return subSubcategory;
    }).filter(subSubcategory => subSubcategory && typeof subSubcategory === 'string' && subSubcategory.trim() !== '');
    return [...new Set(subSubcategories)].sort();
  };

  const getAvailablePowerRanges = () => {
    const powerRanges = [];
    filteredProducts.forEach(product => {
      const specs = product.raw?.characteristics?.specifications || [];
      const powerSpec = specs.find(spec =>
        spec.name?.toLowerCase().includes('power') ||
        spec.name?.toLowerCase().includes('watt') ||
        spec.name?.toLowerCase().includes('wattage')
      );
      if (powerSpec && powerSpec.value) {
        const powerValue = parseInt(powerSpec.value);
        if (!isNaN(powerValue)) {
          if (powerValue <= 10) powerRanges.push('0-10W');
          else if (powerValue <= 25) powerRanges.push('11-25W');
          else if (powerValue <= 50) powerRanges.push('26-50W');
          else if (powerValue <= 100) powerRanges.push('51-100W');
          else if (powerValue <= 500) powerRanges.push('101-500W');
          else powerRanges.push('500W+');
        }
      }
    });
    return [...new Set(powerRanges)].sort();
  };

  const getAvailableColors = () => {
    const colors = [];
    filteredProducts.forEach(product => {
      const variants = product.raw?.classification?.variants || [];
      variants.forEach(variant => {
        if (variant.attributes?.color) {
          colors.push(variant.attributes.color);
        }
      });
      // Also check specifications for color info
      const specs = product.raw?.characteristics?.specifications || [];
      const colorSpec = specs.find(spec =>
        spec.name?.toLowerCase().includes('color') ||
        spec.name?.toLowerCase().includes('colour')
      );
      if (colorSpec && colorSpec.value) {
        colors.push(colorSpec.value);
      }
    });
    return [...new Set(colors)].sort();
  };

  const getAvailableSizes = () => {
    const sizes = [];
    filteredProducts.forEach(product => {
      const variants = product.raw?.classification?.variants || [];
      variants.forEach(variant => {
        if (variant.attributes?.size) {
          sizes.push(variant.attributes.size);
        }
      });
      // Also check specifications for size info
      const specs = product.raw?.characteristics?.specifications || [];
      const sizeSpec = specs.find(spec =>
        spec.name?.toLowerCase().includes('size') ||
        spec.name?.toLowerCase().includes('dimension')
      );
      if (sizeSpec && sizeSpec.value) {
        sizes.push(sizeSpec.value);
      }
    });
    return [...new Set(sizes)].sort();
  };

  const getAvailableMaterials = () => {
    const materials = [];
    filteredProducts.forEach(product => {
      const specs = product.raw?.characteristics?.specifications || [];
      const materialSpec = specs.find(spec =>
        spec.name?.toLowerCase().includes('material') ||
        spec.name?.toLowerCase().includes('construction')
      );
      if (materialSpec && materialSpec.value) {
        materials.push(materialSpec.value);
      }
    });
    return [...new Set(materials)].sort();
  };

  const getAvailableCertifications = () => {
    const certifications = [];
    filteredProducts.forEach(product => {
      const specs = product.raw?.characteristics?.specifications || [];
      const certSpec = specs.find(spec =>
        spec.name?.toLowerCase().includes('certification') ||
        spec.name?.toLowerCase().includes('standard') ||
        spec.name?.toLowerCase().includes('compliance')
      );
      if (certSpec && certSpec.value) {
        certifications.push(certSpec.value);
      }
    });
    return [...new Set(certifications)].sort();
  };

  const getAvailableWarranties = () => {
    const warranties = [];
    filteredProducts.forEach(product => {
      const specs = product.raw?.characteristics?.specifications || [];
      const warrantySpec = specs.find(spec =>
        spec.name?.toLowerCase().includes('warranty') ||
        spec.name?.toLowerCase().includes('guarantee')
      );
      if (warrantySpec && warrantySpec.value) {
        warranties.push(warrantySpec.value);
      }
    });
    return [...new Set(warranties)].sort();
  };

  // Use available options based on current filtered products
  const brands = getAvailableBrands();
  const productTypes = getAvailableProductTypes();
  const categories = getAvailableCategories();
  const subcategories = getAvailableSubcategories();
  const subSubcategories = getAvailableSubSubcategories();
  const powerRanges = getAvailablePowerRanges();
  const colors = getAvailableColors();
  const sizes = getAvailableSizes();
  const materials = getAvailableMaterials();
  const certifications = getAvailableCertifications();
  const warranties = getAvailableWarranties();

  // Silently clean up selected filters that are no longer available
  React.useEffect(() => {
    // Remove brands that are no longer available
    if (selectedBrands.length > 0) {
      const availableBrands = brands;
      const validBrands = selectedBrands.filter(brand => availableBrands.includes(brand));
      if (validBrands.length !== selectedBrands.length) {
        setSelectedBrands(validBrands);
      }
    }

    // Remove categories that are no longer available
    if (selectedCategories.length > 0) {
      const availableCategories = categories;
      const validCategories = selectedCategories.filter(category => availableCategories.includes(category));
      if (validCategories.length !== selectedCategories.length) {
        setSelectedCategories(validCategories);
      }
    }

    // Remove product types that are no longer available
    if (selectedProductTypes.length > 0) {
      const availableProductTypes = productTypes;
      const validProductTypes = selectedProductTypes.filter(type => availableProductTypes.includes(type));
      if (validProductTypes.length !== selectedProductTypes.length) {
        setSelectedProductTypes(validProductTypes);
      }
    }

    // Remove subcategories that are no longer available
    if (selectedSubcategories.length > 0) {
      const availableSubcategories = subcategories;
      const validSubcategories = selectedSubcategories.filter(subcat => availableSubcategories.includes(subcat));
      if (validSubcategories.length !== selectedSubcategories.length) {
        setSelectedSubcategories(validSubcategories);
      }
    }

    // Remove sub-subcategories that are no longer available
    if (selectedSubSubcategories.length > 0) {
      const availableSubSubcategories = subSubcategories;
      const validSubSubcategories = selectedSubSubcategories.filter(subsubcat => availableSubSubcategories.includes(subsubcat));
      if (validSubSubcategories.length !== selectedSubSubcategories.length) {
        setSelectedSubSubcategories(validSubSubcategories);
      }
    }

    // Remove power ranges that are no longer available
    if (selectedPowerRanges.length > 0) {
      const availablePowerRanges = powerRanges;
      const validPowerRanges = selectedPowerRanges.filter(range => availablePowerRanges.includes(range));
      if (validPowerRanges.length !== selectedPowerRanges.length) {
        setSelectedPowerRanges(validPowerRanges);
      }
    }

    // Remove certifications that are no longer available
    if (selectedCertifications.length > 0) {
      const availableCertifications = certifications;
      const validCertifications = selectedCertifications.filter(cert => availableCertifications.includes(cert));
      if (validCertifications.length !== selectedCertifications.length) {
        setSelectedCertifications(validCertifications);
      }
    }

    // Remove warranties that are no longer available
    if (selectedWarranties.length > 0) {
      const availableWarranties = warranties;
      const validWarranties = selectedWarranties.filter(warranty => availableWarranties.includes(warranty));
      if (validWarranties.length !== selectedWarranties.length) {
        setSelectedWarranties(validWarranties);
      }
    }

    // Remove colors that are no longer available
    if (selectedColors.length > 0) {
      const availableColors = colors;
      const validColors = selectedColors.filter(color => availableColors.includes(color));
      if (validColors.length !== selectedColors.length) {
        setSelectedColors(validColors);
      }
    }

    // Remove sizes that are no longer available
    if (selectedSizes.length > 0) {
      const availableSizes = sizes;
      const validSizes = selectedSizes.filter(size => availableSizes.includes(size));
      if (validSizes.length !== selectedSizes.length) {
        setSelectedSizes(validSizes);
      }
    }

    // Remove materials that are no longer available
    if (selectedMaterials.length > 0) {
      const availableMaterials = materials;
      const validMaterials = selectedMaterials.filter(material => availableMaterials.includes(material));
      if (validMaterials.length !== selectedMaterials.length) {
        setSelectedMaterials(validMaterials);
      }
    }
  }, [brands, productTypes, categories, subcategories, subSubcategories, powerRanges, colors, sizes, materials, certifications, warranties, selectedBrands, selectedProductTypes, selectedCategories, selectedSubcategories, selectedSubSubcategories, selectedPowerRanges, selectedColors, selectedSizes, selectedMaterials, selectedCertifications, selectedWarranties]);

  // Apply filters
  React.useEffect(() => {
    setIsFiltering(true);
    // Add a small delay to show the loading state
    const timeoutId = setTimeout(() => {
      let filtered = [...products];

      // Price range filter
      if (priceRange && priceRange.length === 2) {
        filtered = filtered.filter(product => {
          const price = parseInt(product['new-price']);
          return !isNaN(price) && price >= priceRange[0] && price <= priceRange[1];
        });
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        filtered = filtered.filter(product => {
          const brand = product.raw?.anchor?.brand;
          return selectedBrands.includes(brand);
        });
      }

      // Product Type filter
      if (selectedProductTypes.length > 0) {
        filtered = filtered.filter(product => {
          const productType = product.raw?.anchor?.productType;
          return selectedProductTypes.includes(productType);
        });
      }

      // Category filter
      if (selectedCategories.length > 0) {
        filtered = filtered.filter(product => {
          const category = product.raw?.anchor?.category;
          return selectedCategories.includes(category);
        });
      }

      // Subcategory filter
      if (selectedSubcategories.length > 0) {
        filtered = filtered.filter(product => {
          const subcategory = product.raw?.anchor?.subcategory;
          return selectedSubcategories.includes(subcategory);
        });
      }

      // Sub-subcategory filter
      if (selectedSubSubcategories.length > 0) {
        filtered = filtered.filter(product => {
          const subSubcategory = product.raw?.anchor?.subSubcategory;
          return selectedSubSubcategories.includes(subSubcategory);
        });
      }

      // Power range filter
      if (selectedPowerRanges.length > 0) {
        filtered = filtered.filter(product => {
          const specs = product.raw?.characteristics?.specifications || [];
          const powerSpec = specs.find(spec =>
            spec.name?.toLowerCase().includes('power') ||
            spec.name?.toLowerCase().includes('watt') ||
            spec.name?.toLowerCase().includes('wattage')
          );
          if (powerSpec && powerSpec.value) {
            const powerValue = parseInt(powerSpec.value);
            if (!isNaN(powerValue)) {
              let powerRange = '';
              if (powerValue <= 10) powerRange = '0-10W';
              else if (powerValue <= 25) powerRange = '11-25W';
              else if (powerValue <= 50) powerRange = '26-50W';
              else if (powerValue <= 100) powerRange = '51-100W';
              else if (powerValue <= 500) powerRange = '101-500W';
              else powerRange = '500W+';
              return selectedPowerRanges.includes(powerRange);
            }
          }
          return false;
        });
      }

      // Certification filter
      if (selectedCertifications.length > 0) {
        filtered = filtered.filter(product => {
          const specs = product.raw?.characteristics?.specifications || [];
          const certSpec = specs.find(spec =>
            spec.name?.toLowerCase().includes('certification') ||
            spec.name?.toLowerCase().includes('standard') ||
            spec.name?.toLowerCase().includes('compliance')
          );
          return certSpec && certSpec.value && selectedCertifications.includes(certSpec.value);
        });
      }

      // Warranty filter
      if (selectedWarranties.length > 0) {
        filtered = filtered.filter(product => {
          const specs = product.raw?.characteristics?.specifications || [];
          const warrantySpec = specs.find(spec =>
            spec.name?.toLowerCase().includes('warranty') ||
            spec.name?.toLowerCase().includes('guarantee')
          );
          return warrantySpec && warrantySpec.value && selectedWarranties.includes(warrantySpec.value);
        });
      }

      // Color filter
      if (selectedColors.length > 0) {
        filtered = filtered.filter(product => {
          const variants = product.raw?.classification?.variants || [];
          const hasColor = variants.some(variant => 
            variant.attributes?.color && selectedColors.includes(variant.attributes.color)
          );
          if (hasColor) return true;
          
          // Also check specifications for color info
          const specs = product.raw?.characteristics?.specifications || [];
          const colorSpec = specs.find(spec =>
            spec.name?.toLowerCase().includes('color') ||
            spec.name?.toLowerCase().includes('colour')
          );
          return colorSpec && colorSpec.value && selectedColors.includes(colorSpec.value);
        });
      }

      // Size filter
      if (selectedSizes.length > 0) {
        filtered = filtered.filter(product => {
          const variants = product.raw?.classification?.variants || [];
          const hasSize = variants.some(variant => 
            variant.attributes?.size && selectedSizes.includes(variant.attributes.size)
          );
          if (hasSize) return true;
          
          // Also check specifications for size info
          const specs = product.raw?.characteristics?.specifications || [];
          const sizeSpec = specs.find(spec =>
            spec.name?.toLowerCase().includes('size') ||
            spec.name?.toLowerCase().includes('dimension')
          );
          return sizeSpec && sizeSpec.value && selectedSizes.includes(sizeSpec.value);
        });
      }

      // Material filter
      if (selectedMaterials.length > 0) {
        filtered = filtered.filter(product => {
          const specs = product.raw?.characteristics?.specifications || [];
          const materialSpec = specs.find(spec =>
            spec.name?.toLowerCase().includes('material') ||
            spec.name?.toLowerCase().includes('construction')
          );
          return materialSpec && materialSpec.value && selectedMaterials.includes(materialSpec.value);
        });
      }

      // Discount filter
      if (showOnlyDiscounted) {
        filtered = filtered.filter(product => {
          const oldPrice = parseInt(product['old-price']);
          const newPrice = parseInt(product['new-price']);
          return !isNaN(oldPrice) && !isNaN(newPrice) && oldPrice > newPrice;
        });
      }

      // Discount bucket filter
      if (selectedDiscountBucket > 0) {
        filtered = filtered.filter(product => {
          const oldPrice = parseInt(product['old-price']);
          const newPrice = parseInt(product['new-price']);
          if (isNaN(oldPrice) || isNaN(newPrice) || oldPrice <= newPrice) return false;
          
          const discountPercent = ((oldPrice - newPrice) / oldPrice) * 100;
          return discountPercent >= selectedDiscountBucket;
        });
      }

      // Stock filter (assuming products with inventory > 0 are in stock)
      if (showOnlyInStock) {
        filtered = filtered.filter(product => {
          const variants = product.raw?.classification?.variants || [];
          return variants.some(variant => (variant.inventory || 0) > 0);
        });
      }

      setFilteredProducts(filtered);
      setCurrentPage(1);
      setIsFiltering(false);
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 300); // 300ms delay to show loading state

    return () => clearTimeout(timeoutId);
  }, [products, priceRange, selectedBrands, selectedProductTypes, selectedCategories,
    selectedSubcategories, selectedSubSubcategories, selectedPowerRanges,
    selectedColors, selectedSizes, selectedMaterials, selectedCertifications, 
    selectedWarranties, showOnlyDiscounted, selectedDiscountBucket, showOnlyInStock]);

  React.useEffect(() => {
    let sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => parseInt(a['new-price']) - parseInt(b['new-price']));
        break;
      case 'price-high':
        sorted.sort((a, b) => parseInt(b['new-price']) - parseInt(a['new-price']));
        break;
      case 'name':
        sorted.sort((a, b) => a['product-title'].localeCompare(b['product-title']));
        break;
      default:
        break;
    }
    setSortedProducts(sorted);
  }, [filteredProducts, sortBy]);

  const isInWishlist = (product) => {
    return favorites.some(fav => 
      fav['product-id'] === product['product-id'] || 
      fav['product-title'] === product['product-title']
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (oldPrice, newPrice) => {
    const discount = ((oldPrice - newPrice) / oldPrice) * 100;
    return Math.round(discount);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
    scrollToTop();
  };

  const handleProductTypeToggle = (productType) => {
    setSelectedProductTypes(prev =>
      prev.includes(productType)
        ? prev.filter(pt => pt !== productType)
        : [...prev, productType]
    );
    scrollToTop();
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
    scrollToTop();
  };

  const handleSubcategoryToggle = (subcategory) => {
    setSelectedSubcategories(prev =>
      prev.includes(subcategory)
        ? prev.filter(sc => sc !== subcategory)
        : [...prev, subcategory]
    );
    scrollToTop();
  };

  const handleSubSubcategoryToggle = (subSubcategory) => {
    setSelectedSubSubcategories(prev =>
      prev.includes(subSubcategory)
        ? prev.filter(ssc => ssc !== subSubcategory)
        : [...prev, subSubcategory]
    );
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    scrollToTop();
  };

  const handlePowerRangeToggle = (powerRange) => {
    setSelectedPowerRanges(prev =>
      prev.includes(powerRange)
        ? prev.filter(pr => pr !== powerRange)
        : [...prev, powerRange]
    );
    scrollToTop();
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
    scrollToTop();
  };

  const handleSizeToggle = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
    scrollToTop();
  };

  const handleMaterialToggle = (material) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
    scrollToTop();
  };

  const handleCertificationToggle = (certification) => {
    setSelectedCertifications(prev =>
      prev.includes(certification)
        ? prev.filter(c => c !== certification)
        : [...prev, certification]
    );
    scrollToTop();
  };

  const handleWarrantyToggle = (warranty) => {
    setSelectedWarranties(prev =>
      prev.includes(warranty)
        ? prev.filter(w => w !== warranty)
        : [...prev, warranty]
    );
    scrollToTop();
  };

  const clearAllFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrands([]);
    setSelectedProductTypes([]);
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedSubSubcategories([]);
    setSelectedPowerRanges([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedMaterials([]);
    setSelectedCertifications([]);
    setSelectedWarranties([]);
    setShowOnlyDiscounted(false);
    setSelectedDiscountBucket(0);
    setShowOnlyInStock(false);
    scrollToTop();
  };

  // Applied filter chips
  const chips = [];
  if (priceRange && (priceRange[0] > minPrice || priceRange[1] < maxPrice)) {
    const priceLabel = priceRange[0] === minPrice && priceRange[1] < maxPrice
      ? `Under ${formatPrice(priceRange[1])}`
      : `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`;
    chips.push({
      type: 'price',
      label: priceLabel,
      onRemove: () => setPriceRange([minPrice, maxPrice])
    });
  }
  selectedBrands.forEach(b => chips.push({
    type: 'brand',
    label: b,
    onRemove: () => setSelectedBrands(prev => prev.filter(x => x !== b))
  }));
  selectedProductTypes.forEach(pt => chips.push({
    type: 'productType',
    label: pt,
    onRemove: () => setSelectedProductTypes(prev => prev.filter(x => x !== pt))
  }));
  selectedCategories.forEach(cat => chips.push({
    type: 'category',
    label: cat,
    onRemove: () => setSelectedCategories(prev => prev.filter(x => x !== cat))
  }));
  selectedSubcategories.forEach(sc => chips.push({
    type: 'subcategory',
    label: sc,
    onRemove: () => setSelectedSubcategories(prev => prev.filter(x => x !== sc))
  }));
  selectedSubSubcategories.forEach(ssc => chips.push({
    type: 'subSubcategory',
    label: ssc,
    onRemove: () => setSelectedSubSubcategories(prev => prev.filter(x => x !== ssc))
  }));
  selectedPowerRanges.forEach(pr => chips.push({
    type: 'powerRange',
    label: pr,
    onRemove: () => setSelectedPowerRanges(prev => prev.filter(x => x !== pr))
  }));
  selectedCertifications.forEach(c => chips.push({
    type: 'certification',
    label: c,
    onRemove: () => setSelectedCertifications(prev => prev.filter(x => x !== c))
  }));
  selectedWarranties.forEach(w => chips.push({
    type: 'warranty',
    label: w,
    onRemove: () => setSelectedWarranties(prev => prev.filter(x => x !== w))
  }));
  selectedColors.forEach(c => chips.push({
    type: 'color',
    label: c,
    onRemove: () => setSelectedColors(prev => prev.filter(x => x !== c))
  }));
  selectedSizes.forEach(s => chips.push({
    type: 'size',
    label: s,
    onRemove: () => setSelectedSizes(prev => prev.filter(x => x !== s))
  }));
  selectedMaterials.forEach(m => chips.push({
    type: 'material',
    label: m,
    onRemove: () => setSelectedMaterials(prev => prev.filter(x => x !== m))
  }));

  if (showOnlyDiscounted) {
    chips.push({ type: 'discount', label: 'On Sale', onRemove: () => setShowOnlyDiscounted(false) });
  }

  if (selectedDiscountBucket > 0) {
    chips.push({ 
      type: 'discountBucket', 
      label: `${selectedDiscountBucket}% or more`, 
      onRemove: () => setSelectedDiscountBucket(0) 
    });
  }

  if (showOnlyInStock) {
    chips.push({ type: 'stock', label: 'In Stock', onRemove: () => setShowOnlyInStock(false) });
  }

  const activeFiltersCount = chips.length;

  // Pagination derived
  const totalResults = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const currentStart = (currentPage - 1) * pageSize;
  const currentEnd = Math.min(totalResults, currentStart + pageSize);
  const pageProducts = sortedProducts.slice(currentStart, currentEnd);

  // Display name formatter: keep collection name plural and title-case it
  const formatCategoryTitle = (name) => {
    if (!name) return '';
    const trimmed = String(name).trim();
    return trimmed
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  // Build breadcrumb items based on current context and filters
  const breadcrumbItems = React.useMemo(() => {
    const appliedFilters = {
      brand: selectedBrands,
      productType: selectedProductTypes,
      category: selectedCategories,
      subcategory: selectedSubcategories,
      subSubcategory: selectedSubSubcategories
    };

    // Determine the current navigation context
    let currentCategory = category;
    let currentSubcategory = null;
    let currentSubSubcategory = null;

    // If we have initial filters, use them to determine context
    if (initialFilters) {
      if (initialFilters.subcategory && initialFilters.subcategory.length > 0) {
        currentSubcategory = initialFilters.subcategory[0];
      }
      if (initialFilters.subSubcategory && initialFilters.subSubcategory.length > 0) {
        currentSubSubcategory = initialFilters.subSubcategory[0];
      }
    }

    return buildBreadcrumbItems({
      category: currentCategory,
      subcategory: currentSubcategory,
      subSubcategory: currentSubSubcategory,
      appliedFilters: appliedFilters,
      currentPage: 'category'
    });
  }, [category, selectedBrands, selectedProductTypes, selectedCategories, selectedSubcategories, selectedSubSubcategories, initialFilters]);

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigation = (path, type, value) => {
    if (type === 'home') {
      // Navigate to home page
      if (onNavigate) {
        onNavigate('/', 'home');
      } else {
        window.location.hash = '#/';
      }
      return;
    }
    
    if (onNavigate) {
      onNavigate(path, type, value);
    } else {
      // Fallback to hash navigation
      if (path && window.location) {
        window.location.hash = path;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div 
        ref={headerSectionRef}
        className={`bg-white shadow-sm border-b transition-all duration-1000 ${
          isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className={`flex items-center space-x-3 md:space-x-4 transition-all duration-700 ${
              isHeaderVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-300 text-sm md:text-base hover:scale-105 group"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back</span>
              </button>
              <div className="h-5 md:h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <div className="animate-fade-in-up">
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  {formatCategoryTitle(category)}
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-0.5 md:mt-1">
                  <span className="font-semibold text-blue-600">{sortedProducts.length}</span> products available
                </p>
              </div>
            </div>

            {/* View Controls */}
            <div className={`flex items-center space-x-3 md:space-x-4 transition-all duration-700 delay-200 ${
              isHeaderVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              {/* Mobile Navigation Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white px-3 py-2 rounded-lg hover:from-blue-800 hover:to-blue-700 transition-all duration-300 text-sm hover:scale-105 hover:shadow-lg group"
              >
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Navigate</span>
              </button>

              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div className="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all duration-300 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-inner' : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <Grid className="w-4 h-4 hover:scale-110 transition-transform duration-200" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all duration-300 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-inner' : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  <List className="w-4 h-4 hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>

          {/* Applied Filter Chips */}
          {chips.length > 0 && (
            <div className={`mt-4 flex flex-wrap gap-2 transition-all duration-700 delay-300 ${
              isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {chips.map((chip, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {chip.label}
                  <button onClick={chip.onRemove} className="ml-2 hover:text-blue-700 hover:scale-110 transition-all duration-200 group" aria-label={`Remove ${chip.type}`}>
                    <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </span>
              ))}
              <button onClick={clearAllFilters} className="text-sm text-gray-600 hover:text-blue-600 underline ml-1 hover:scale-105 transition-all duration-200 font-medium">Clear all</button>
            </div>
          )}

        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {breadcrumbItems.length > 0 && (
        <div 
          ref={breadcrumbSectionRef}
          className={`bg-white/80 backdrop-blur-sm border-b border-gray-100 transition-all duration-1000 ${
            isBreadcrumbVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb
              items={breadcrumbItems}
              onNavigate={handleBreadcrumbNavigation}
              className="text-sm"
              showHome={true}
              separator="chevron"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex gap-6 md:gap-8">
          {/* Mobile Breadcrumb Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="absolute right-0 top-0 h-full w-72 sm:w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <Breadcrumb
                      items={breadcrumbItems}
                      onNavigate={handleBreadcrumbNavigation}
                      className="text-base"
                      showHome={true}
                      separator="chevron"
                    />
                    {breadcrumbItems.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h3>
                        <div className="space-y-2">
                          {breadcrumbItems.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                handleBreadcrumbNavigation(item.path, item.type, item.value);
                                setShowFilters(false);
                              }}
                              className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 text-sm border border-gray-200 hover:border-blue-300"
                            >
                              <div className="font-medium">{item.label}</div>
                              {item.title && (
                                <div className="text-xs text-gray-500 mt-1">{item.title}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Breadcrumb Sidebar */}
          {isDesktop && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                  </div>

                  {/* Main Breadcrumb */}
                  <div className="border-b border-gray-200 pb-4">
                    <Breadcrumb
                      items={breadcrumbItems}
                      onNavigate={handleBreadcrumbNavigation}
                      className="text-base"
                      showHome={true}
                      separator="chevron"
                    />
                  </div>

                  {/* Category Navigation */}
                  {breadcrumbItems.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h3>
                      <div className="space-y-2">
                        {breadcrumbItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleBreadcrumbNavigation(item.path, item.type, item.value)}
                            className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 text-sm border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                          >
                            <div className="font-medium">{item.label}</div>
                            {item.title && (
                              <div className="text-xs text-gray-500 mt-1">{item.title}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Hierarchy */}
                  {(categories.length > 1 || subcategories.length > 1 || subSubcategories.length > 1) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Browse Categories</h3>
                      <div className="space-y-3">
                        {/* Categories */}
                        {categories.length > 1 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Categories</h4>
                            <div className="space-y-1">
                              {categories.slice(0, 5).map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => handleBreadcrumbNavigation(`#category/${encodeURIComponent(cat)}`, 'category', cat)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Subcategories */}
                        {subcategories.length > 1 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Subcategories</h4>
                            <div className="space-y-1">
                              {subcategories.slice(0, 5).map((subcat) => (
                                <button
                                  key={subcat}
                                  onClick={() => handleBreadcrumbNavigation(`#subcategory/${encodeURIComponent(subcat)}`, 'subcategory', subcat)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                                >
                                  {subcat}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Sub-subcategories */}
                        {subSubcategories.length > 1 && (
                          <div>
                            <h4 className="text-xs font-medium text-gray-700 mb-2">Sub-categories</h4>
                            <div className="space-y-1">
                              {subSubcategories.slice(0, 5).map((subsubcat) => (
                                <button
                                  key={subsubcat}
                                  onClick={() => handleBreadcrumbNavigation(`#sub-subcategory/${encodeURIComponent(subsubcat)}`, 'sub-subcategory', subsubcat)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
                                >
                                  {subsubcat}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          <div 
            ref={productsSectionRef}
            className={`flex-1 transition-all duration-1000 ${
              isProductsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {totalResults === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                {/* Result meta and pagination top */}
                <div className={`flex items-center justify-between mb-4 text-sm text-gray-600 transition-all duration-700 ${
                  isProductsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <div>
                    Showing <span className="font-medium text-gray-900">{currentStart + 1}</span> – <span className="font-medium text-gray-900">{currentEnd}</span> of <span className="font-medium text-gray-900">{totalResults}</span> results
                  </div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
                </div>

                {isFiltering ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner size="lg" color="blue" showText={true} text="Filtering products..." />
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10 items-stretch"
                        : "space-y-4"
                    }
                  >
                    {pageProducts.map((product, index) => (
                      <div
                        key={index}
                        className={
                          viewMode === "grid"
                            ? `bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden group cursor-pointer h-full flex flex-col transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up`
                            : `bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-500 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1 animate-fade-in-up`
                        }
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => onOpenDetails && onOpenDetails(product)}
                      >
                        {viewMode === "grid" ? (
                          // 🌟 Grid View
                          <>
                            {/* Image Container */}
                            <div className="relative h-40 overflow-hidden">
                              {/* Animated background gradient */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <img
                                src={product.__activeImage || product["image-url"]}
                                alt={product["product-title"]}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              {/* Shimmer effect */}
                              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                              {product["old-price"] !== product["new-price"] && (
                                <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-lg animate-pulse">
                                  {calculateDiscount(
                                    parseInt(product["old-price"]),
                                    parseInt(product["new-price"])
                                  )}
                                  % OFF
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToWishlist(product);
                                }}
                                className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-300 shadow-lg hover:scale-110 ${isInWishlist(product)
                                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white animate-pulse"
                                  : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-pink-50 hover:text-pink-500 opacity-0 group-hover:opacity-100"
                                  }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill={isInWishlist(product) ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                            </div>

                            {/* Content */}
                            <div className="p-3.5 flex flex-col flex-1 relative overflow-hidden">
                              {/* Subtle background animation */}
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/50 transition-all duration-700"></div>
                              <h3 className="font-semibold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-blue-600 transition-all duration-300 text-[15px] relative z-10">
                                {product["product-title"]}
                              </h3>

                              {/* Variant thumbnails */}
                              {Array.isArray(product.raw?.classification?.variants) &&
                                product.raw.classification.variants.length > 0 && (
                                  <div className="mt-1.5 flex items-center gap-2 overflow-x-auto">
                                    {product.raw.classification.variants
                                      .slice(0, 6)
                                      .map((v, vi) => {
                                        const thumb =
                                          Array.isArray(v.images) && v.images.length > 0
                                            ? v.images[0]
                                            : null;
                                        if (!thumb) return null;
                                        return (
                                          <div
                                            key={vi}
                                            className="w-8 h-8 rounded border border-gray-200 hover:border-blue-400 overflow-hidden flex-shrink-0 cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // update image displayed for this card only
                                              product.__activeImage = thumb;
                                              // force re-render by updating state shallowly
                                              setSortedProducts((prev) => {
                                                const next = [...prev];
                                                return next;
                                              });
                                            }}
                                          >
                                            <img
                                              src={thumb}
                                              alt={v.name || `variant-${vi}`}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        );
                                      })}
                                  </div>
                                )}

                              {/* Price */}
                              <div className="flex items-center justify-between mb-2 mt-1.5">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-bold text-gray-900">
                                    {formatPrice(product["new-price"])}
                                  </span>
                                  {product["old-price"] !== product["new-price"] && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(product["old-price"])}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Add to Cart Button pinned bottom */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(product);
                                }}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold text-sm mt-auto hover:scale-105 hover:shadow-xl relative z-10 group/btn overflow-hidden flex items-center justify-center space-x-2"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                <ShoppingCart className="w-4 h-4 relative z-10 group-hover/btn:animate-bounce" />
                                <span className="relative z-10">Add to Cart</span>
                                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                              </button>
                            </div>
                          </>
                        ) : (
                          // List View
                          <div className="flex items-center p-4 space-x-4">
                            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                              <img
                                src={product.__activeImage || product["image-url"]}
                                alt={product["product-title"]}
                                className="w-full h-full object-cover"
                              />
                              {product["old-price"] !== product["new-price"] && (
                                <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                                  {calculateDiscount(
                                    parseInt(product["old-price"]),
                                    parseInt(product["new-price"])
                                  )}
                                  %
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                {product["product-title"]}
                              </h3>
                              {/* Variant thumbnails */}
                              {Array.isArray(product.raw?.classification?.variants) &&
                                product.raw.classification.variants.length > 0 && (
                                  <div className="mt-1 flex items-center gap-2 overflow-x-auto">
                                    {product.raw.classification.variants
                                      .slice(0, 6)
                                      .map((v, vi) => {
                                        const thumb =
                                          Array.isArray(v.images) && v.images.length > 0
                                            ? v.images[0]
                                            : null;
                                        if (!thumb) return null;
                                        return (
                                          <div
                                            key={vi}
                                            className="w-7 h-7 rounded border border-gray-200 hover:border-blue-400 overflow-hidden flex-shrink-0 cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              product.__activeImage = thumb;
                                              setSortedProducts((prev) => {
                                                const next = [...prev];
                                                return next;
                                              });
                                            }}
                                          >
                                            <img
                                              src={thumb}
                                              alt={v.name || `variant-${vi}`}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        );
                                      })}
                                  </div>
                                )}
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatPrice(product["new-price"])}
                                </span>
                                {product["old-price"] !== product["new-price"] && (
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(product["old-price"])}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToWishlist(product);
                                }}
                                className={`p-2 rounded-full transition-all duration-200 ${isInWishlist(product)
                                  ? "bg-pink-500 text-white"
                                  : "bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-500"
                                  }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill={isInWishlist(product) ? "currentColor" : "none"}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(product);
                                }}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold hover:scale-105 hover:shadow-xl group relative overflow-hidden flex items-center space-x-2"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <ShoppingCart className="w-4 h-4 relative z-10 group-hover:animate-bounce" />
                                <span className="relative z-10">Add to Cart</span>
                                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination bottom */}
                <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
                  <div>
                    Showing <span className="font-medium text-gray-900">{currentStart + 1}</span> – <span className="font-medium text-gray-900">{currentEnd}</span> of <span className="font-medium text-gray-900">{totalResults}</span> results
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onChange={(p) => {
                      setCurrentPage(p);
                      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Panel Component
const FilterPanel = ({
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice,
  selectedBrands,
  handleBrandToggle,
  brandQuery,
  setBrandQuery,
  selectedProductTypes,
  handleProductTypeToggle,
  selectedCategories,
  handleCategoryToggle,
  selectedSubcategories,
  handleSubcategoryToggle,
  selectedSubSubcategories,
  handleSubSubcategoryToggle,
  selectedPowerRanges,
  handlePowerRangeToggle,
  selectedColors,
  handleColorToggle,
  selectedSizes,
  handleSizeToggle,
  selectedMaterials,
  handleMaterialToggle,
  selectedCertifications,
  handleCertificationToggle,
  selectedWarranties,
  handleWarrantyToggle,
  showOnlyDiscounted,
  setShowOnlyDiscounted,
  selectedDiscountBucket,
  setSelectedDiscountBucket,
  showOnlyInStock,
  setShowOnlyInStock,
  brands,
  productTypes,
  categories,
  subcategories,
  subSubcategories,
  powerRanges,
  colors,
  sizes,
  materials,
  certifications,
  warranties,
  clearAllFilters,
  activeFiltersCount,
  subcategorySectionRef
}) => {
  const [showAllBrands, setShowAllBrands] = React.useState(false);
  const [showAllProductTypes, setShowAllProductTypes] = React.useState(false);
  const [showAllSubcategories, setShowAllSubcategories] = React.useState(false);
  const [showAllSubSubcategories, setShowAllSubSubcategories] = React.useState(false);
  const [showAllPowerRanges, setShowAllPowerRanges] = React.useState(false);
  const [showAllColors, setShowAllColors] = React.useState(false);
  const [showAllSizes, setShowAllSizes] = React.useState(false);
  const [showAllMaterials, setShowAllMaterials] = React.useState(false);
  const [showAllCertifications, setShowAllCertifications] = React.useState(false);
  const [showAllWarranties, setShowAllWarranties] = React.useState(false);

  const filteredBrands = brands.filter(b => b.toLowerCase().includes(brandQuery.toLowerCase()));
  const visibleBrands = showAllBrands ? filteredBrands : filteredBrands.slice(0, 5);
  const visibleProductTypes = showAllProductTypes ? productTypes : productTypes.slice(0, 5);
  const visibleSubcategories = showAllSubcategories ? subcategories : subcategories.slice(0, 5);
  const visibleSubSubcategories = showAllSubSubcategories ? subSubcategories : subSubcategories.slice(0, 5);
  const visiblePowerRanges = showAllPowerRanges ? powerRanges : powerRanges.slice(0, 5);
  const visibleColors = showAllColors ? colors : colors.slice(0, 5);
  const visibleSizes = showAllSizes ? sizes : sizes.slice(0, 5);
  const visibleMaterials = showAllMaterials ? materials : materials.slice(0, 5);
  const visibleCertifications = showAllCertifications ? certifications : certifications.slice(0, 5);
  const visibleWarranties = showAllWarranties ? warranties : warranties.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Price</h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              500, 1000, 2000, 5000, 10000
            ]
              .filter((t) => t >= minPrice && t <= maxPrice)
              .map((threshold) => (
                <button
                  key={threshold}
                  onClick={() => setPriceRange([minPrice, threshold])}
                  className={`text-xs px-2.5 py-1 rounded-full border ${priceRange[0] === minPrice && priceRange[1] === threshold
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
                    }`}
                >
                  Under {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(threshold)}
                </button>
              ))}
            {/* Any */}
            <button
              onClick={() => setPriceRange([minPrice, maxPrice])}
              className={`text-xs px-2.5 py-1 rounded-full border ${priceRange[0] === minPrice && priceRange[1] === maxPrice
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200'
                }`}
            >
              Any
            </button>
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 1 && (
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Brand ({brands.length})</h3>
        <div className="relative mb-3">
          <input
            type="text"
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Search brand"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
          {visibleBrands.map((brand) => (
            <label key={brand} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedBrands.includes(brand)
                ? 'bg-blue-900 border-blue-900'
                : 'border-gray-300'
                }`}>
                {selectedBrands.includes(brand) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span className="text-sm text-gray-700">{brand}</span>
            </label>
          ))}
          {filteredBrands.length === 0 && (
            <div className="text-xs text-gray-500">No brands found</div>
          )}
        </div>
        {filteredBrands.length > 5 && (
          <button onClick={() => setShowAllBrands(!showAllBrands)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
            {showAllBrands ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      )}

      {/* Product Type Filter */}
      {productTypes.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Product Type ({productTypes.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visibleProductTypes.map((productType) => (
              <label key={productType} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProductTypes.includes(productType)}
                  onChange={() => handleProductTypeToggle(productType)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedProductTypes.includes(productType)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedProductTypes.includes(productType) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{productType}</span>
              </label>
            ))}
          </div>
          {productTypes.length > 5 && (
            <button onClick={() => setShowAllProductTypes(!showAllProductTypes)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllProductTypes ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Categories ({categories.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {categories.map((category) => (
              <label key={category} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedCategories.includes(category)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedCategories.includes(category) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Subcategory Filter */}
      {subcategories.length > 1 && (
        <div ref={subcategorySectionRef} className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Subcategory ({subcategories.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visibleSubcategories.map((subcategory) => (
              <label key={subcategory} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSubcategories.includes(subcategory)}
                  onChange={() => handleSubcategoryToggle(subcategory)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedSubcategories.includes(subcategory)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedSubcategories.includes(subcategory) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{subcategory}</span>
              </label>
            ))}
          </div>
          {subcategories.length > 5 && (
            <button onClick={() => setShowAllSubcategories(!showAllSubcategories)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllSubcategories ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Sub-subcategory Filter */}
      {subSubcategories.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Sub-subcategory ({subSubcategories.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visibleSubSubcategories.map((subSubcategory) => (
              <label key={subSubcategory} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSubSubcategories.includes(subSubcategory)}
                  onChange={() => handleSubSubcategoryToggle(subSubcategory)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedSubSubcategories.includes(subSubcategory)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedSubSubcategories.includes(subSubcategory) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{subSubcategory}</span>
              </label>
            ))}
          </div>
          {subSubcategories.length > 5 && (
            <button onClick={() => setShowAllSubSubcategories(!showAllSubSubcategories)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllSubSubcategories ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Power Range Filter */}
      {powerRanges.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Power Range ({powerRanges.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visiblePowerRanges.map((powerRange) => (
              <label key={powerRange} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPowerRanges.includes(powerRange)}
                  onChange={() => handlePowerRangeToggle(powerRange)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedPowerRanges.includes(powerRange)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedPowerRanges.includes(powerRange) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{powerRange}</span>
              </label>
            ))}
          </div>
          {powerRanges.length > 5 && (
            <button onClick={() => setShowAllPowerRanges(!showAllPowerRanges)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllPowerRanges ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Color Filter */}
      {colors.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Color ({colors.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visibleColors.map((color) => (
              <label key={color} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() => handleColorToggle(color)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedColors.includes(color)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedColors.includes(color) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{color}</span>
              </label>
            ))}
          </div>
          {colors.length > 5 && (
            <button onClick={() => setShowAllColors(!showAllColors)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllColors ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Size Filter */}
      {sizes.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Size ({sizes.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visibleSizes.map((size) => (
              <label key={size} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => handleSizeToggle(size)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedSizes.includes(size)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedSizes.includes(size) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{size}</span>
              </label>
            ))}
          </div>
          {sizes.length > 5 && (
            <button onClick={() => setShowAllSizes(!showAllSizes)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllSizes ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Material Filter */}
      {materials.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Material ({materials.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visibleMaterials.map((material) => (
              <label key={material} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(material)}
                  onChange={() => handleMaterialToggle(material)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedMaterials.includes(material)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedMaterials.includes(material) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{material}</span>
              </label>
            ))}
          </div>
          {materials.length > 5 && (
            <button onClick={() => setShowAllMaterials(!showAllMaterials)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllMaterials ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Certification Filter */}
      {certifications.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Certification ({certifications.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visibleCertifications.map((certification) => (
              <label key={certification} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCertifications.includes(certification)}
                  onChange={() => handleCertificationToggle(certification)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedCertifications.includes(certification)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedCertifications.includes(certification) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{certification}</span>
              </label>
            ))}
          </div>
          {certifications.length > 5 && (
            <button onClick={() => setShowAllCertifications(!showAllCertifications)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllCertifications ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {/* Warranty Filter */}
      {warranties.length > 1 && (
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Warranty ({warranties.length})</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {visibleWarranties.map((warranty) => (
              <label key={warranty} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedWarranties.includes(warranty)}
                  onChange={() => handleWarrantyToggle(warranty)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${selectedWarranties.includes(warranty)
                  ? 'bg-blue-900 border-blue-900'
                  : 'border-gray-300'
                  }`}>
                  {selectedWarranties.includes(warranty) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700">{warranty}</span>
              </label>
            ))}
          </div>
          {warranties.length > 5 && (
            <button onClick={() => setShowAllWarranties(!showAllWarranties)} className="mt-3 text-xs text-blue-700 hover:text-blue-900 font-medium">
              {showAllWarranties ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}



      {/* Discount */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Discount</h3>
        <div className="space-y-2 text-sm">
          {[0, 10, 25, 50].map((d) => (
            <label key={d} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="discountBucket"
                checked={selectedDiscountBucket === d}
                onChange={() => setSelectedDiscountBucket(d)}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center mr-3 ${selectedDiscountBucket === d ? 'bg-blue-900 border-blue-900' : 'border-gray-300'
                }`}>
                {selectedDiscountBucket === d && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-gray-700">{d === 0 ? 'Any' : `${d}% or more`}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability & Discount Filters */}
      <div className="space-y-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyDiscounted}
            onChange={(e) => setShowOnlyDiscounted(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${showOnlyDiscounted ? 'bg-blue-900 border-blue-900' : 'border-gray-300'
            }`}>
            {showOnlyDiscounted && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-sm text-gray-700">On Sale Only</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyInStock}
            onChange={(e) => setShowOnlyInStock(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${showOnlyInStock ? 'bg-blue-900 border-blue-900' : 'border-gray-300'
            }`}>
            {showOnlyInStock && <Check className="w-3 h-3 text-white" />}
          </div>
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onChange }) => {
  const go = (p) => onChange(Math.min(Math.max(1, p), totalPages));
  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => go(currentPage - 1)}
        className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        disabled={currentPage === 1}
      >
        Prev
      </button>
      {start > 1 && (
        <>
          <button onClick={() => go(1)} className={`px-3 py-1 rounded border ${currentPage === 1 ? 'bg-blue-900 text-white border-blue-900' : 'bg-white hover:bg-gray-50 border-gray-300'}`}>1</button>
          {start > 2 && <span className="px-1">…</span>}
        </>
      )}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => go(p)}
          className={`px-3 py-1 rounded border ${currentPage === p ? 'bg-blue-900 text-white border-blue-900' : 'bg-white hover:bg-gray-50 border-gray-300'}`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1">…</span>}
          <button onClick={() => go(totalPages)} className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'bg-blue-900 text-white border-blue-900' : 'bg-white hover:bg-gray-50 border-gray-300'}`}>{totalPages}</button>
        </>
      )}
      <button
        onClick={() => go(currentPage + 1)}
        className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default CategoryListPage;
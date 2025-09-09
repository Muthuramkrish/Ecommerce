// Home.load.js - Functions for Home component
import { useState, useEffect, useRef } from 'react';

// Hero slide functionality
export const useHeroSlides = (products = []) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get featured products for hero slides
  const getFeaturedProducts = () => {
    const featured = products.filter(p => p.raw?.marketing?.isFeatured);
    return featured.length >= 4 ? featured.slice(0, 4) : products.slice(0, 4);
  };

  const featuredProducts = getFeaturedProducts();

  const slides = featuredProducts.map((product, index) => {
    const accentColors = [
      "from-blue-600 to-purple-600",
      "from-green-600 to-teal-600", 
      "from-orange-600 to-red-600",
      "from-indigo-600 to-blue-600"
    ];
    
    const category = product.category || product.raw?.anchor?.subcategory || 'Electrical';
    const image = product['image-url'] || product.raw?.characteristics?.images?.primary?.[0] || 
      'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1920';
    
    return {
      id: index + 1,
      product: product,
      title: product['product-title'],
      subtitle: `${category} Collection`,
      description: product.raw?.characteristics?.description || 
        `Discover our premium ${category.toLowerCase()} products. High quality, reliable performance, and excellent value.`,
      image: image,
      cta1: `Shop ${category}`,
      cta2: "View Details",
      accent: accentColors[index % accentColors.length],
      category: category
    };
  });

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // 8 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  // Hero navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return {
    slides,
    currentSlide,
    nextSlide,
    prevSlide,
    goToSlide
  };
};

// Categories scroll functionality
export const useCategoriesScroll = (defaultCategories = []) => {
  const scrollContainer = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainer.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainer.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [defaultCategories]);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: -280, // Width of one card
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({
        left: 280, // Width of one card
        behavior: 'smooth'
      });
    }
  };

  return {
    scrollContainer,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight
  };
};

// Category and hero interaction handlers
export const useHomeHandlers = (onCategorySelect, onOpenDetails) => {
  // Handle category selection
  const handleCategorySelect = (categoryName) => {
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    }
  };

  // Handle hero button clicks
  const handleHeroCta1 = (slide) => {
    if (slide.category) {
      handleCategorySelect(slide.category);
    }
  };

  const handleHeroCta2 = (slide) => {
    if (slide.product && onOpenDetails) {
      onOpenDetails(slide.product);
    }
  };

  return {
    handleCategorySelect,
    handleHeroCta1,
    handleHeroCta2
  };
};

// Product modal state management
export const useProductModal = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return {
    selectedProduct,
    setSelectedProduct
  };
};
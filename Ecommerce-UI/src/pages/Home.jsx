import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Zap, Star, Shield, Truck, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';
import { useReducedMotion, getAnimationClasses } from '../hooks/useReducedMotion';

const Home = ({ products = [], allProducts = [], onAddToCart, onAddToWishlist, onCategorySelect, onOpenDetails, favorites = [], categories = [] }) => {
  // Hero component state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Categories component state
  const scrollContainer = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Scroll animations
  const [trustSectionRef, isTrustVisible] = useScrollAnimation();
  const [categoriesSectionRef, isCategoriesVisible] = useScrollAnimation();
  const [productsSectionRef, isProductsVisible] = useScrollAnimation();
  const [statsSectionRef, isStatsVisible] = useScrollAnimation();
  const [ctaSectionRef, isCtaVisible] = useScrollAnimation();
  
  // Reduced motion support
  const prefersReducedMotion = useReducedMotion();

  const defaultCategories = categories && categories.length ? categories : [];

  // Get featured products for hero slides (memoized for performance)
  const featuredProducts = useMemo(() => {
    const featured = products.filter(p => p.raw?.marketing?.isFeatured);
    return featured.length >= 4 ? featured.slice(0, 4) : products.slice(0, 4);
  }, [products]);

  const normalizeImageUrl = (url) => {
    if (typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed || trimmed.toLowerCase() === 'n/a' || trimmed === '-') return null;
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    return trimmed;
  };

  // Build slides from first offers-image per collection (subcategory), using full list when available
  const sourceForHero = (Array.isArray(allProducts) && allProducts.length) ? allProducts : featuredProducts;
  const slides = sourceForHero.map((product, index) => {
    const accentColors = [
      "from-blue-600 to-purple-600",
      "from-green-600 to-teal-600",
      "from-orange-600 to-red-600",
      "from-indigo-600 to-blue-600"
    ];

    const collection = product.raw?.anchor?.subcategory || product.category || 'Electrical';

    // Prefer backend offer image for hero banner (support multiple possible keys/shapes)
    const rawImages = product?.raw?.characteristics?.images || {};
    const possibleImageSources = [
      rawImages?.offers,
      rawImages?.offer,
      rawImages?.offerImage,
      rawImages?.hero,
      rawImages?.banner,
      rawImages?.promo,
      product?.raw?.marketing?.offerImage,
      product?.raw?.marketing?.heroImage,
      product?.raw?.marketing?.bannerImage,
      product?.['offers-image'],
      product?.['offer-image'],
      product?.['hero-image'],
    ];

    let offersImageUrl = null;
    for (const candidate of possibleImageSources) {
      if (!candidate) continue;
      if (typeof candidate === 'string') {
        const normalized = normalizeImageUrl(candidate);
        if (normalized) { offersImageUrl = normalized; break; }
      } else if (Array.isArray(candidate)) {
        const firstValid = candidate.find((v) => {
          const n = normalizeImageUrl(v);
          return typeof n === 'string' && n.length > 0;
        });
        if (firstValid) { offersImageUrl = normalizeImageUrl(firstValid); break; }
      } else if (typeof candidate === 'object') {
        const url = candidate.url || candidate.src || candidate.href;
        const normalized = normalizeImageUrl(url);
        if (normalized) { offersImageUrl = normalized; break; }
      }
    }

    // If no offers image, skip this product for Hero (do not fall back to primary)
    if (!offersImageUrl) return null;

    return {
      id: index + 1,
      product: product,
      title: product['product-title'],
      subtitle: `${collection} Collection`,
      description: product.raw?.characteristics?.description ||
        `Discover our premium ${collection.toLowerCase()} products. High quality, reliable performance, and excellent value.`,
      image: offersImageUrl,
      cta1: `Shop ${collection}`,
      cta2: "View Details",
      accent: accentColors[index % accentColors.length],
      category: collection
    };
  }).filter(Boolean);

  // Ensure we always have at least one slide with professional content
  const finalSlides = slides.length > 0 ? slides : [{
    id: 1,
    product: null,
    title: 'Professional Electrical Solutions',
    subtitle: 'Premium Quality • Certified Products • Trusted Performance',
    description: 'Discover VIKOSHIYA\'s comprehensive range of professional-grade electrical products. From LED lighting to industrial switches, we provide certified solutions that meet the highest safety and performance standards.',
    image: 'https://www.hafele.co.uk/INTERSHOP/static/WFS/Haefele-HUK-Site/-/Haefele-HUK/en_GB/opentext/assets/huk/special-offers-header.jpg',
    cta1: 'Explore Products',
    cta2: 'Learn More',
    accent: 'from-blue-600 to-indigo-600',
    category: 'Electrical'
  }];

  // Hero Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % finalSlides.length);
    }, 8000); // 8 seconds

    return () => clearInterval(interval);
  }, [finalSlides.length]);

  // Keep currentSlide in range if slides shrink
  useEffect(() => {
    if (currentSlide >= finalSlides.length) {
      setCurrentSlide(0);
    }
  }, [finalSlides.length, currentSlide]);

  // Categories scroll functionality
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

  // Hero navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % finalSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + finalSlides.length) % finalSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Categories scroll functions
  const scrollLeft = () => {
    if (scrollContainer.current) {
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile ? -200 : -280; // Mobile: 200px, Desktop: 280px
      scrollContainer.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile ? 200 : 280; // Mobile: 200px, Desktop: 280px
      scrollContainer.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Handle category selection - use the prop if available, otherwise log (memoized)
  const handleCategorySelect = useCallback((categoryName) => {
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    }
  }, [onCategorySelect]);

  // Handle hero button clicks (memoized)
  const handleHeroCta1 = useCallback((slide) => {
    if (slide.category) {
      handleCategorySelect(slide.category);
    }
  }, [handleCategorySelect]);

  const handleHeroCta2 = useCallback((slide) => {
    if (slide.product && onOpenDetails) {
      onOpenDetails(slide.product);
    }
  }, [onOpenDetails]);



  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Slides */}
        <div className="relative w-full h-full">
          {finalSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-105'
                }`}
            >
              {/* Background Image with Parallax Effect */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title || 'Offer'}
                  className="absolute inset-0 w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-1000"
                  onError={(e) => {
                    const target = e.target;
                    target.src = 'https://www.hafele.co.uk/INTERSHOP/static/WFS/Haefele-HUK-Site/-/Haefele-HUK/en_GB/opentext/assets/huk/special-offers-header.jpg';
                  }}
                />
                {/* Animated overlay gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30"></div>
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} opacity-20 animate-pulse`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-blue-900/30"></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Content with Staggered Animations */}
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-4xl pr-4 sm:pr-8">
                    {/* Professional text content container with enhanced animations */}
                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl transform transition-all duration-1000 hover:scale-105 hover:shadow-3xl">
                      <div className="space-y-6">
                        <div className="inline-block px-4 py-2 bg-yellow-400/20 rounded-full border border-yellow-400/30 animate-bounce">
                          <span className="text-yellow-300 text-sm font-semibold tracking-wide uppercase flex items-center space-x-2">
                            <Star className="w-4 h-4" />
                            <span>Premium Quality</span>
                          </span>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white mb-4 tracking-tight animate-fade-in-up">
                          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-pulse">
                            {slide.title}
                          </span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-3 font-medium leading-relaxed animate-fade-in-up delay-200">
                          {slide.subtitle}
                        </p>

                        <p className="text-base sm:text-lg text-gray-200 mb-6 max-w-3xl leading-relaxed font-light animate-fade-in-up delay-300">
                          {slide.description}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4 animate-fade-in-up delay-500">
                        <button
                          onClick={() => handleHeroCta1(slide)}
                          className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold text-base md:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative z-10">{slide.cta1}</span>
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleHeroCta2(slide)}
                          className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-semibold text-base md:text-lg hover:bg-white/20 transition-all duration-300 border border-white/30 hover:border-white/50 group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative z-10">{slide.cta2}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 z-10 border border-white/30 shadow-xl group"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all duration-300 hover:scale-110 z-10 border border-white/30 shadow-xl group"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Professional Slide Indicators */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
          {finalSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-yellow-400 scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/80 hover:scale-110'
                }`}
            />
          ))}
        </div>

        {/* Professional Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-10">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 transition-all duration-1000 ease-out shadow-lg"
            style={{
              width: `${finalSlides.length ? (((currentSlide + 1) / finalSlides.length) * 100) : 0}%`
            }}
          />
        </div>

        {/* Professional Floating Elements with reduced motion support */}
        <div className={`absolute top-12 md:top-20 right-12 md:right-20 opacity-30 ${getAnimationClasses('animate-bounce', '', prefersReducedMotion)}`}>
          <div className="relative">
            <Zap className="w-10 h-10 md:w-16 md:h-16 text-yellow-400 filter drop-shadow-lg" />
            <div className={`absolute inset-0 ${getAnimationClasses('animate-ping', '', prefersReducedMotion)}`}>
              <Zap className="w-10 h-10 md:w-16 md:h-16 text-yellow-400 opacity-20" />
            </div>
          </div>
        </div>
        <div className={`absolute bottom-20 md:bottom-32 left-12 md:left-20 opacity-20 ${getAnimationClasses('animate-pulse', '', prefersReducedMotion)}`}>
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-xl" />
        </div>
        <div className={`absolute top-1/3 right-1/4 opacity-10 ${getAnimationClasses('animate-bounce', '', prefersReducedMotion)}`}>
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/30" />
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section 
        ref={trustSectionRef}
        className={`py-12 md:py-16 bg-gradient-to-r from-white via-gray-50 to-white border-y border-gray-100 relative overflow-hidden transition-all duration-1000 ${
          isTrustVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center group animate-fade-in-up">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Premium Quality</h3>
              <p className="text-sm md:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Certified electrical products with international standards</p>
            </div>
            
            <div className="text-center group animate-fade-in-up delay-200">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <Truck className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">Fast Delivery</h3>
              <p className="text-sm md:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Quick and secure shipping across India</p>
            </div>
            
            <div className="text-center group animate-fade-in-up delay-400">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">Secure Payment</h3>
              <p className="text-sm md:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Safe and encrypted payment processing</p>
            </div>
            
            <div className="text-center group animate-fade-in-up delay-600">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <Headphones className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:animate-bounce" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">24/7 Support</h3>
              <p className="text-sm md:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Round-the-clock customer assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section 
        ref={categoriesSectionRef}
        className={`py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 transition-all duration-1000 ${
          isCategoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`} 
        id="categories"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block px-6 py-2 bg-blue-100 rounded-full mb-6">
              <span className="text-blue-800 text-sm font-semibold tracking-wide uppercase">Product Categories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Category</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of premium electrical products, carefully organized by category for your convenience
            </p>
          </div>

          <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-2xl rounded-full p-3 md:p-4 hover:bg-blue-50 transition-all duration-300 border border-blue-100 hover:scale-110 group"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-2xl rounded-full p-3 md:p-4 hover:bg-blue-50 transition-all duration-300 border border-blue-100 hover:scale-110 group"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Desktop: Horizontal Scrollable Container */}
            <div className="hidden md:block">
              <div
                ref={scrollContainer}
                className="flex overflow-x-auto scrollbar-hide gap-6 px-12 py-4"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitScrollbar: 'none',
                }}
              >
                {defaultCategories.map((category, index) => (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategorySelect(category.name);
                    }}
                    className={`group block flex-shrink-0 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl hover:border-blue-200 w-[300px] h-fit transform ${
                      isCategoriesVisible 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-8 scale-95'
                    }`}
                    style={{
                      transitionDelay: `${index * 150}ms`
                    }}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-8 text-center">
                      <h3 className="font-bold text-gray-900 mb-3 text-xl leading-tight group-hover:text-blue-700 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-base text-gray-600 font-medium mb-2">
                        {category.productCount} products
                      </p>
                      <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile: Horizontal Scrollable Container */}
            <div className="md:hidden">
              <div
                ref={scrollContainer}
                className="flex overflow-x-auto scrollbar-hide gap-4 px-4 py-4"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitScrollbar: 'none',
                }}
              >
                {defaultCategories.map((category, index) => (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategorySelect(category.name);
                    }}
                    className={`group block flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl w-[200px] h-fit transform ${
                      isCategoriesVisible 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-6 scale-95'
                    }`}
                    style={{
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="relative h-24 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-transparent"></div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm leading-tight group-hover:text-blue-900 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {category.productCount} products
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      {products && products.length > 0 && (
        <section 
          ref={productsSectionRef}
          id="products" 
          className={`py-16 md:py-24 bg-gradient-to-br from-white via-gray-50 to-blue-50 transition-all duration-1000 ${
            isProductsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-block px-6 py-2 bg-yellow-100 rounded-full mb-6">
                <span className="text-yellow-800 text-sm font-semibold tracking-wide uppercase">Best Sellers</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Products</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                Handpicked premium electrical products with exceptional quality and unbeatable prices
              </p>
              <div className="w-24 md:w-32 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <div
                  key={`${product['product-id'] || product['product-title']}-${index}`}
                  className={`cursor-pointer transform transition-all duration-700 ${
                    isProductsVisible 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onAddToWishlist={onAddToWishlist}
                    isFavorite={favorites.some((fav) => 
                      fav['product-id'] === product['product-id'] || 
                      fav['product-title'] === product['product-title']
                    )}
                    onOpenDetails={onOpenDetails}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Professional Statistics Section */}
      <section 
        ref={statsSectionRef}
        className={`py-16 md:py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden transition-all duration-1000 ${
          isStatsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trusted by Thousands of Customers
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join our growing community of satisfied customers across India
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">50K+</div>
              <div className="text-blue-100 text-lg font-medium">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">10K+</div>
              <div className="text-blue-100 text-lg font-medium">Products Sold</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-blue-100 text-lg font-medium">Product Range</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">99%</div>
              <div className="text-blue-100 text-lg font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional CTA Section */}
      <section 
        ref={ctaSectionRef}
        className={`py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white transition-all duration-1000 ${
          isCtaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Power Your Projects?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover our complete range of professional-grade electrical products. 
              From residential to industrial applications, we have everything you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Browse Categories</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-blue-600 hover:bg-blue-50"
              >
                View Featured Products
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = ({ products = [], onAddToCart, onAddToWishlist, onCategorySelect, onOpenDetails, favorites = [], categories = [] }) => {
  // Hero component state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Categories component state
  const scrollContainer = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Product modal state
  const [selectedProduct, setSelectedProduct] = useState(null);

  const defaultCategories = categories && categories.length ? categories : [];

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

  // Hero Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); // 8 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

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
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Categories scroll functions
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

    // Handle category selection - use the prop if available, otherwise log
  const handleCategorySelect = (categoryName) => {
    if (onCategorySelect) {
      onCategorySelect(categoryName);
    } else {

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



  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Slides */}
        <div className="relative w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
              style={{
                backgroundImage: `url('${slide.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50"></div>
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} opacity-20`}></div>
              
              {/* Content */}
              <div className="relative h-full flex items-start pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl">
                    
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight text-white mb-6 animate-fade-in">
                      {slide.title}
                    </h1>
                    
                    <p className="text-xl sm:text-2xl text-blue-100 mb-4 font-medium">
                      {slide.subtitle}
                    </p>
                    
                    <p className="text-lg text-gray-200 mb-8 max-w-2xl leading-relaxed">
                      {slide.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 mb-8">
                      <button 
                        onClick={() => handleHeroCta1(slide)}
                        className={`px-8 py-4 bg-gradient-to-r ${slide.accent} text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300`}
                      >
                        {slide.cta1}
                      </button>
                      <button 
                        onClick={() => handleHeroCta2(slide)}
                        className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
                      >
                        {slide.cta2}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-r-full transition-all duration-300 hover:scale-110 z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-l-full transition-all duration-300 hover:scale-110 z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-10">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-4000 ease-linear"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`
            }}
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 right-20 animate-bounce opacity-20">
          <Zap className="w-16 h-16 text-yellow-300" />
        </div>
        <div className="absolute bottom-32 left-20 animate-pulse opacity-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive range of electrical products organized by category
            </p>
          </div>

          <div className="relative">
            {/* Left Arrow */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
            )}

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
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
                }}
              >
                {defaultCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategorySelect(category.name);
                    }}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100 flex-shrink-0 overflow-hidden block"
                    style={{ width: '280px', height: '220px' }}
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-transparent"></div>
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight group-hover:text-blue-900 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {category.productCount} products
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile: 4 Grid Layout */}
            <div className="md:hidden grid grid-cols-2 gap-4">
              {defaultCategories.slice(0, 4).map((category) => (
                <a
                  key={category.id}
                  href={`#category-${category.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategorySelect(category.name);
                  }}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden block"
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
      </section>

      {/* Professional Electrical Ecommerce Platform Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Advanced Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M50 50m-20 0a20 20 0 1 1 40 0a20 20 0 1 1 -40 0'/%3E%3Cpath d='M30 30l40 40M70 30l-40 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }}></div>
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-32 right-20 w-1 h-1 bg-yellow-400 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute bottom-20 left-32 w-3 h-3 bg-green-400 rounded-full animate-bounce opacity-15"></div>
          <div className="absolute bottom-40 right-40 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-25"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl mb-8 shadow-2xl">
              <Zap className="w-10 h-10 text-slate-900" />
            </div>
            <h2 className="text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Next-Gen Professional
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Electrical Platform
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Revolutionizing electrical procurement with AI-powered recommendations, 
              smart inventory management, and seamless integration for modern professionals.
            </p>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Feature 1: AI-Powered Solutions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 group hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Recommendations</h3>
              <p className="text-slate-300 leading-relaxed">
                Smart product matching with machine learning algorithms. Get personalized recommendations 
                based on project requirements and compatibility analysis.
              </p>
            </div>

            {/* Feature 2: Advanced Analytics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 group hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-r from-violet-400 to-purple-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Analytics Dashboard</h3>
              <p className="text-slate-300 leading-relaxed">
                Real-time insights into procurement patterns, cost optimization suggestions, 
                and predictive maintenance alerts for your electrical infrastructure.
              </p>
            </div>

            {/* Feature 3: Enterprise Integration */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-500 group hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Enterprise Integration</h3>
              <p className="text-slate-300 leading-relaxed">
                Seamless API integration with ERP systems, automated purchase orders, 
                and custom workflows for large-scale electrical projects.
              </p>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="text-center group">
              <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">15K+</div>
              <div className="text-slate-300 font-semibold text-lg">Premium Products</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">200+</div>
              <div className="text-slate-300 font-semibold text-lg">Global Brands</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">500K+</div>
              <div className="text-slate-300 font-semibold text-lg">Satisfied Professionals</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">99.9%</div>
              <div className="text-slate-300 font-semibold text-lg">Platform Uptime</div>
            </div>
          </div>

          {/* Professional Services Enhanced */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-4xl font-bold text-white mb-8">Elite Professional Services</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Enterprise Procurement Hub</h4>
                      <p className="text-slate-300 leading-relaxed">Dedicated procurement portal with volume discounts, custom catalogs, and automated reordering for enterprise clients.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Certified Engineering Support</h4>
                      <p className="text-slate-300 leading-relaxed">Access to licensed electrical engineers for design validation, load calculations, and compliance verification.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Global Supply Chain Network</h4>
                      <p className="text-slate-300 leading-relaxed">International sourcing with local fulfillment centers, ensuring rapid delivery and competitive pricing worldwide.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-10 py-4 rounded-2xl font-bold text-lg hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 hover:scale-105 shadow-2xl">
                    Request Enterprise Demo
                  </button>
                  <button className="bg-white/20 backdrop-blur-sm text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105">
                    View Pricing Plans
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/30 shadow-2xl">
                  <h4 className="text-2xl font-bold text-white mb-6">Platform Advantages</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 group">
                      <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-slate-200 font-medium">Advanced search with technical specifications</span>
                    </div>
                    <div className="flex items-center space-x-4 group">
                      <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-slate-200 font-medium">Real-time inventory with automatic alerts</span>
                    </div>
                    <div className="flex items-center space-x-4 group">
                      <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-slate-200 font-medium">Blockchain-secured transactions and warranties</span>
                    </div>
                    <div className="flex items-center space-x-4 group">
                      <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-slate-200 font-medium">IoT integration for smart project management</span>
                    </div>
                    <div className="flex items-center space-x-4 group">
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-slate-200 font-medium">Carbon footprint tracking and sustainability metrics</span>
                    </div>
                    <div className="flex items-center space-x-4 group">
                      <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-slate-200 font-medium">Augmented reality product visualization</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Floating elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full animate-pulse blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full animate-bounce blur-lg"></div>
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-purple-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-lg rounded-3xl px-12 py-8 border border-white/20 shadow-2xl max-w-4xl mx-auto">
            <h4 className="text-2xl font-bold text-white mb-4">Transform Your Electrical Procurement Today</h4>
            <p className="text-slate-300 mb-6 text-lg">Join thousands of professionals who trust our platform for their electrical needs</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-8 py-3 rounded-2xl font-bold text-lg hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 hover:scale-105 shadow-xl">
                Explore Platform
              </button>
              <button className="bg-transparent text-white px-8 py-3 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 border-2 border-white/30 hover:border-white/50">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid Section */}
      {products && products.length > 0 && (
        <section id="products" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div
                  key={`${product['product-title']}-${index}`}
                  className="cursor-pointer"
                >
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onAddToWishlist={onAddToWishlist}
                    isFavorite={favorites.some((fav) => fav['product-title'] === product['product-title'])}
                    onOpenDetails={onOpenDetails}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      

      {/* Product Details Modal removed; details handled via ProductDetailsPage */}
    </div>
  );
};

export default Home;
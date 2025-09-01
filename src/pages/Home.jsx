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
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center space-x-2 bg-yellow-400/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-yellow-400/30">
              <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-sm font-bold">NEW</span>
              <span className="text-yellow-400 font-semibold">Platform Launch</span>
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-6">
              <Zap className="w-8 h-8 text-blue-900" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Introducing Our New Professional Electrical Platform
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              We're excited to launch our revolutionary professional electrical ecommerce platform! 
              Designed specifically for contractors, electricians, and industry professionals with 
              cutting-edge features and unmatched service quality.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Feature 1: Product Quality */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Premium Product Catalog</h3>
              <p className="text-blue-100 leading-relaxed">
                Launch with 5000+ certified electrical products from top brands. Every item 
                features detailed specifications, installation guides, and professional ratings.
              </p>
            </div>

            {/* Feature 2: Technical Support */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Professional Dashboard</h3>
              <p className="text-blue-100 leading-relaxed">
                Advanced B2B features including bulk ordering, project management tools, 
                custom pricing tiers, and dedicated account management for professionals.
              </p>
            </div>

            {/* Feature 3: Fast Delivery */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-orange-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Logistics</h3>
              <p className="text-blue-100 leading-relaxed">
                Revolutionary supply chain technology with predictive inventory, automated 
                reordering, and real-time delivery tracking for seamless operations.
              </p>
            </div>
          </div>

          {/* Launch Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">Launch</div>
              <div className="text-blue-100 font-medium">Beta Access Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-green-400 mb-2">5000+</div>
              <div className="text-blue-100 font-medium">Products Ready</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-blue-100 font-medium">Partner Brands</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-blue-100 font-medium">Launch Support</div>
            </div>
          </div>

          {/* Professional Services */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-6">Launch Features</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Early Access Program</h4>
                      <p className="text-blue-100">Be among the first professionals to experience our new platform with exclusive launch benefits.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Professional Onboarding</h4>
                      <p className="text-blue-100">Dedicated setup assistance and training to help you maximize the platform's capabilities.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">Launch Incentives</h4>
                      <p className="text-blue-100">Special launch pricing, extended warranties, and priority support for early adopters.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <button className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300 hover:scale-105 shadow-lg">
                    Join Beta Program
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <h4 className="text-xl font-bold text-white mb-4">New Platform Advantages</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-blue-100">Next-generation user interface built for professionals</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-blue-100">AI-powered product recommendations and compatibility checking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-blue-100">Advanced project management and procurement tools</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-blue-100">Integrated digital documentation and compliance tracking</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-blue-100">Mobile-first design with offline capability</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400/20 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20">
            <span className="text-white font-semibold">Ready to be part of the electrical industry's future?</span>
            <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-blue-900 px-6 py-2 rounded-full font-bold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 hover:scale-105">
              Get Early Access
            </button>
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
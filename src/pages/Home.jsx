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
      <section className="relative h-[85vh] overflow-hidden">
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
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl">
                   
                    <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight text-white mb-4 animate-fade-in">
                      {slide.title}
                    </h1>
                   
                    <p className="text-lg sm:text-xl text-blue-100 mb-3 font-medium">
                      {slide.subtitle}
                    </p>
                   
                    <p className="text-base text-gray-200 mb-6 max-w-2xl leading-relaxed">
                      {slide.description}
                    </p>
                   
                    <div className="flex flex-wrap gap-4 mb-6">
                      <button
                        onClick={() => handleHeroCta1(slide)}
                        className={`px-6 py-3 bg-gradient-to-r ${slide.accent} text-white rounded-full font-bold text-base hover:shadow-2xl hover:scale-105 transition-all duration-300`}
                      >
                        {slide.cta1}
                      </button>
                      <button
                        onClick={() => handleHeroCta2(slide)}
                        className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-base hover:bg-white/30 transition-all duration-300 border border-white/30"
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
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
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
        <div className="absolute top-16 right-16 animate-bounce opacity-20">
          <Zap className="w-12 h-12 text-yellow-300" />
        </div>
        <div className="absolute bottom-24 left-16 animate-pulse opacity-10">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
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
import React from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useHeroSlides, useCategoriesScroll, useHomeHandlers, useProductModal } from './Home.load.js';

const Home = ({ products = [], onAddToCart, onAddToWishlist, onCategorySelect, onOpenDetails, favorites = [], categories = [] }) => {
  const defaultCategories = categories && categories.length ? categories : [];

  // Use custom hooks from Home.load.js
  const { slides, currentSlide, nextSlide, prevSlide, goToSlide } = useHeroSlides(products);
  const { scrollContainer, canScrollLeft, canScrollRight, scrollLeft, scrollRight } = useCategoriesScroll(defaultCategories);
  const { handleCategorySelect, handleHeroCta1, handleHeroCta2 } = useHomeHandlers(onCategorySelect, onOpenDetails);
  const { selectedProduct, setSelectedProduct } = useProductModal();



  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[58vh] sm:h-[64vh] md:h-[85vh] overflow-hidden">
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
                  <div className="max-w-3xl pr-4 sm:pr-8">
                   
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold leading-tight text-white mb-3 md:mb-4 animate-fade-in">
                      {slide.title}
                    </h1>
                   
                    <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-2 md:mb-3 font-medium">
                      {slide.subtitle}
                    </p>
                   
                    <p className="text-sm sm:text-base text-gray-200 mb-4 md:mb-6 max-w-2xl leading-relaxed">
                      {slide.description}
                    </p>
                   
                    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                      <button
                        onClick={() => handleHeroCta1(slide)}
                        className={`px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r ${slide.accent} text-white rounded-full font-bold text-sm md:text-base hover:shadow-2xl hover:scale-105 transition-all duration-300`}
                      >
                        {slide.cta1}
                      </button>
                      <button
                        onClick={() => handleHeroCta2(slide)}
                        className="px-4 md:px-6 py-2.5 md:py-3 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold text-sm md:text-base hover:bg-white/30 transition-all duration-300 border border-white/30"
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
          className="absolute left-2 md:left-0 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 md:p-2 rounded-r-full transition-all duration-300 hover:scale-110 z-10"
        >
          <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
        </button>
       
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-0 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 md:p-2 rounded-l-full transition-all duration-300 hover:scale-110 z-10"
        >
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
        </button>
 
        {/* Slide Indicators */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
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
        <div className="absolute top-8 md:top-16 right-8 md:right-16 animate-bounce opacity-20">
          <Zap className="w-8 h-8 md:w-12 md:h-12 text-yellow-300" />
        </div>
        <div className="absolute bottom-16 md:bottom-24 left-8 md:left-16 animate-pulse opacity-10">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Shop by Category</h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
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

            {/* Mobile: 2 Grid Layout */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {defaultCategories.slice(0, 4).map((category) => (
                <a
                  key={category.id}
                  href={`#category-${category.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategorySelect(category.name);
                  }}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden block"
                >
                  <div className="relative h-20 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/40 to-transparent"></div>
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-gray-900 mb-1 text-xs leading-tight group-hover:text-blue-900 transition-colors">
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
        <section id="products" className="py-8 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Featured Products</h2>
              <div className="w-16 md:w-24 h-1 bg-yellow-400 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
    </div>
  );
};

export default Home;
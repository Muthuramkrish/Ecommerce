import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = ({ products = [], allProducts = [], onAddToCart, onAddToWishlist, onCategorySelect, onOpenDetails, favorites = [], categories = [] }) => {
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

  // Ensure we always have at least one slide
  const finalSlides = slides.length > 0 ? slides : [{
    id: 1,
    product: null,
    title: 'Top Electrical Deals',
    subtitle: 'Shop Now',
    description: 'Discover premium electrical products with great offers and reliable performance.',
    image: 'https://www.hafele.co.uk/INTERSHOP/static/WFS/Haefele-HUK-Site/-/Haefele-HUK/en_GB/opentext/assets/huk/special-offers-header.jpg',
    cta1: 'Browse Categories',
    cta2: 'View Details',
    accent: 'from-blue-600 to-purple-600',
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
      <section className="relative h-[58vh] sm:h-[64vh] md:h-[85vh] overflow-hidden">
        {/* Slides */}
        <div className="relative w-full h-full">
          {finalSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
            >
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.title || 'Offer'}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target;
                  target.src = 'https://www.hafele.co.uk/INTERSHOP/static/WFS/Haefele-HUK-Site/-/Haefele-HUK/en_GB/opentext/assets/huk/special-offers-header.jpg';
                }}
              />
              {/* Overlay for better text contrast */}
              <div className="absolute inset-0 bg-black/60"></div>

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} opacity-30`}></div>
              
              {/* Additional overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl pr-4 sm:pr-8">
                    {/* Text content with enhanced background for better contrast */}
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold leading-tight text-white mb-3 md:mb-4 animate-fade-in drop-shadow-2xl">
                        {slide.title}
                      </h1>

                      <p className="text-base sm:text-lg md:text-xl text-white mb-2 md:mb-3 font-medium drop-shadow-lg">
                        {slide.subtitle}
                      </p>

                      <p className="text-sm sm:text-base text-gray-100 mb-4 md:mb-6 max-w-2xl leading-relaxed drop-shadow-md">
                        {slide.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                        <button
                          onClick={() => handleHeroCta1(slide)}
                          className={`px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r ${slide.accent} text-white rounded-full font-bold text-sm md:text-base hover:shadow-2xl hover:scale-105 transition-all duration-300 drop-shadow-lg`}
                        >
                          {slide.cta1}
                        </button>
                        <button
                          onClick={() => handleHeroCta2(slide)}
                          className="px-4 md:px-6 py-2.5 md:py-3 bg-white/30 backdrop-blur-sm text-white rounded-full font-semibold text-sm md:text-base hover:bg-white/40 transition-all duration-300 border border-white/40 drop-shadow-lg"
                        >
                          {slide.cta2}
                        </button>
                      </div>
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
          className="absolute left-2 md:left-0 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-1.5 md:p-2 rounded-r-full transition-all duration-300 hover:scale-110 z-10 border border-white/20 drop-shadow-lg"
        >
          <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 drop-shadow-sm" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-0 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-1.5 md:p-2 rounded-l-full transition-all duration-300 hover:scale-110 z-10 border border-white/20 drop-shadow-lg"
        >
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 drop-shadow-sm" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3 z-10 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
          {finalSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 drop-shadow-sm ${index === currentSlide
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/60 hover:bg-white/80 border border-white/20'
                }`}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/30 z-10 border-t border-white/10">
          <div
            className="h-full bg-gradient-to-r from-white via-blue-200 to-white transition-all duration-4000 ease-linear drop-shadow-sm"
            style={{
              width: `${finalSlides.length ? (((currentSlide + 1) / finalSlides.length) * 100) : 0}%`
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
      <section className="py-8 md:py-16 bg-white" id="categories">
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-2 md:p-3 hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              </button>
            )}

            {/* Right Arrow */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl rounded-full p-2 md:p-3 hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
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
                {defaultCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategorySelect(category.name);
                    }}
                    className="group block flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl w-[280px] h-fit"
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
                {defaultCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`#category-${category.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategorySelect(category.name);
                    }}
                    className="group block flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl w-[200px] h-fit"
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
        <section id="products" className="py-8 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Featured Products</h2>
              <div className="w-16 md:w-24 h-1 bg-yellow-400 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <div
                  key={`${product['product-id'] || product['product-title']}-${index}`}
                  className="cursor-pointer"
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
    </div>
  );
};

export default Home;
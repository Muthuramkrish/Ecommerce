import React, { useEffect } from 'react';
import { Star, Heart, ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import Breadcrumb, { buildProductBreadcrumbs } from '../components/Breadcrumb';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useReducedMotion, getAnimationClasses } from '../hooks/useReducedMotion';

const ProductDetailsPage = ({
  product,
  onBack,
  onAddToCart,
  onAddToWishlist,
  favorites,
  cartItems,
  onNavigate
}) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState('');
  const [selectedVariantIndex, setSelectedVariantIndex] = React.useState(null);
  const variantsRef = React.useRef(null);
  const [variantsHighlighted, setVariantsHighlighted] = React.useState(false);

  // Scroll animations
  const [headerSectionRef, isHeaderVisible] = useScrollAnimation();
  const [breadcrumbSectionRef, isBreadcrumbVisible] = useScrollAnimation();
  const [imagesSectionRef, isImagesVisible] = useScrollAnimation();
  const [infoSectionRef, isInfoVisible] = useScrollAnimation();
  const [specsSectionRef, isSpecsVisible] = useScrollAnimation();
  
  // Reduced motion support
  const prefersReducedMotion = useReducedMotion();

  const isInWishlist = favorites.some(fav => 
    fav['product-id'] === product['product-id'] || 
    fav['product-title'] === product['product-title']
  );
  const cartItem = cartItems.find(item => 
    item['product-id'] === product['product-id'] || 
    item['product-title'] === product['product-title']
  );
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  const handleAddToWishlist = () => {
    onAddToWishlist(product);
  };

  const handleQuantityChange = (newQuantity) => {
    const minQty = 1;
    const maxQty = (product?.raw?.inventory?.availableQuantity ?? (product?.raw?.inventory?.availableQuantity === 0 ? 0 : undefined)) ?? (inventory?.availableQuantity ?? undefined);
    const clamped = Math.max(minQty, maxQty != null ? Math.min(newQuantity, maxQty) : newQuantity);
    if (clamped >= 1) {
      setQuantity(clamped);
    }
  };

  const raw = product.raw || {};
  const images = raw.characteristics?.images?.primary || product.characteristics?.images?.primary || [product['image-url']];
  const offersBanner = raw.characteristics?.images?.offers;
  const specsArray = raw.characteristics?.specifications || [];
  const description = raw.characteristics?.description || product.characteristics?.description || product['product-title'];
  const identifiers = raw.identifiers || product.identifiers || {};
  const anchor = product.anchor || raw.anchor || {};
  const pricing = raw.pricing || {};
  const inventory = raw.inventory || {};
  const classification = raw.classification || {};
  const attributes = classification.attributes || {};
  const marketing = raw.marketing || {};
  const timestamps = raw.timestamps || {};

  const variants = Array.isArray(classification.variants) ? classification.variants : [];
  const selectedVariant =
    selectedVariantIndex !== null && variants[selectedVariantIndex]
      ? variants[selectedVariantIndex]
      : null;
  const displayedImages =
    (selectedVariant && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0)
      ? selectedVariant.images
      : images;

  const displayedPrice =
    (selectedVariant && selectedVariant.price != null)
      ? selectedVariant.price
      : (product['new-price'] ?? pricing.basePrice ?? product['old-price']);

  const displayedTitle =
    (selectedVariant && selectedVariant.name)
      ? `${product['product-title']} — ${selectedVariant.name}`
      : product['product-title'];

  const displayedDescription =
    (selectedVariant && selectedVariant.description)
      ? selectedVariant.description
      : description;

  const displayedSpecs = (() => {
    if (!selectedVariant) return specsArray;
    if (Array.isArray(selectedVariant.specifications) && selectedVariant.specifications.length > 0) {
      return selectedVariant.specifications;
    }
    if (Array.isArray(selectedVariant?.characteristics?.specifications) && selectedVariant.characteristics.specifications.length > 0) {
      return selectedVariant.characteristics.specifications;
    }
    if (Array.isArray(selectedVariant.specs) && selectedVariant.specs.length > 0) {
      return selectedVariant.specs;
    }
    return specsArray;
  })();

  const displayedAttributes =
    (selectedVariant && selectedVariant.attributes && Object.keys(selectedVariant.attributes).length > 0)
      ? selectedVariant.attributes
      : attributes;

  const displayedWeight =
    (selectedVariant && (selectedVariant.weight || selectedVariant?.characteristics?.weight))
      ? (selectedVariant.weight || selectedVariant.characteristics.weight)
      : raw.characteristics?.weight;

  const displayedDimensions =
    (selectedVariant && (selectedVariant.dimensions || selectedVariant?.characteristics?.dimensions))
      ? (selectedVariant.dimensions || selectedVariant.characteristics.dimensions)
      : raw.characteristics?.dimensions;

  const slugify = (text) => {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Helper: when clicking an image, try to infer and select its variant
  const selectVariantByImage = (imageUrl, fallbackIndex = 0) => {
    if (!Array.isArray(variants) || variants.length === 0 || !imageUrl) {
      setSelectedImage(fallbackIndex);
      return;
    }
    let matchedVariantIndex = null;
    let matchedImageIndex = null;
    for (let i = 0; i < variants.length; i++) {
      const imgs = Array.isArray(variants[i].images) ? variants[i].images : [];
      const j = imgs.findIndex((u) => String(u).trim() === String(imageUrl).trim());
      if (j !== -1) {
        matchedVariantIndex = i;
        matchedImageIndex = j;
        break;
      }
    }
    if (matchedVariantIndex !== null) {
      setSelectedVariantIndex(matchedVariantIndex);
      setSelectedImage(matchedImageIndex ?? 0);
    } else {
      // If not found in any variant, just switch the displayed image index
      setSelectedImage(fallbackIndex);
    }
  };

  const navigateTo = (type, value) => {
    if (!value) return;
    let hash;
    const baseSubcategory = anchor.subcategory ? encodeURIComponent(anchor.subcategory) : '';
    const encodedValue = encodeURIComponent(value);
    if (type === 'subcategory' || !baseSubcategory) {
      hash = `#category/${encodeURIComponent(value)}`;
    } else {
      // Deep-link to subcategory list and apply filter facet (preserve case)
      const filterType = type === 'sub-subcategory' ? 'sub-subcategory' : (type === 'brand' ? 'brand' : (type === 'product-type' ? 'product-type' : type));
      hash = `#category/${baseSubcategory}/filter/${filterType}/${encodedValue}`;
    }
    if (window && window.location) {
      if (window.location.hash !== hash) {
        window.location.hash = hash;
      } else {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }
  };

  // Build breadcrumb items from product anchor data
  const breadcrumbItems = React.useMemo(() => {
    return buildProductBreadcrumbs(anchor);
  }, [anchor]);

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigation = (path, type, value) => {
    if (onNavigate) {
      onNavigate(path, type, value);
    } else if (type && value) {
      navigateTo(type, value);
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
        className={`bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 transition-all duration-1000 ${
          isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button 
              onClick={() => window.history.back()}
              className={`flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300 ${getAnimationClasses('animate-slide-in-left', '', prefersReducedMotion)}`}
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            <div className={`flex items-center space-x-4 ${getAnimationClasses('animate-slide-in-right', '', prefersReducedMotion)}`}>
              <a
                href="#wishlist"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToWishlist();
                }}
                className={`p-2 md:p-3 rounded-xl transition-all duration-500 hover:scale-110 group relative overflow-hidden ${isInWishlist
                    ? 'text-red-500 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg border border-red-200 animate-pulse'
                    : 'text-gray-400 hover:text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:shadow-lg border border-gray-200 hover:border-red-200'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Heart className="w-5 h-5 md:w-6 md:h-6 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce" fill={isInWishlist ? 'currentColor' : 'none'} />
              </a>
              <a
                href="#cart"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
                className="flex items-center px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 text-sm md:text-base hover:scale-110 hover:shadow-2xl group relative overflow-hidden border border-blue-500/20 hover:border-blue-400/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2 relative z-10 group-hover:animate-bounce group-hover:scale-110 transition-all duration-300" />
                <span className="relative z-10 font-semibold">Add to Cart</span>
                {cartQuantity > 0 && (
                  <span className="ml-2 bg-white text-blue-600 text-[10px] md:text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center animate-bounce relative z-10 font-bold shadow-sm">
                    {cartQuantity}
                  </span>
                )}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Breadcrumb Navigation */}
      {breadcrumbItems.length > 0 && (
        <div 
          ref={breadcrumbSectionRef}
          className={`bg-white/80 backdrop-blur-sm border-b border-gray-100 transition-all duration-1000 ${
            isBreadcrumbVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div 
            ref={imagesSectionRef}
            className={`space-y-4 transition-all duration-1000 ${
              isImagesVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <div
              className="aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl cursor-pointer group relative hover:shadow-3xl transition-all duration-700 hover:scale-105 border border-gray-100/50 hover:border-blue-200/50"
              onClick={() => {
                if (variants.length && variantsRef.current) {
                  variantsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setVariantsHighlighted(true);
                  window.setTimeout(() => setVariantsHighlighted(false), 1200);
                }
              }}
            >
              {/* Enhanced animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src={displayedImages[selectedImage]}
                alt={product['product-title']}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onClick={(e) => {
                  e.stopPropagation();
                  // Clicking the main photo should not change the selected variant.
                  // No action needed other than stopping propagation.
                }}
              />
              {/* Enhanced shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              {/* Floating particles effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white/60 rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1.5 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            </div>
            {displayedImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Change only the displayed photo, do not switch variant.
                      setSelectedImage(index);
                    }}
                    className={`aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all duration-500 hover:scale-110 hover:shadow-xl group relative ${
                      selectedImage === index 
                        ? 'border-blue-500 shadow-xl ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50'
                    } ${getAnimationClasses('animate-scale-in', '', prefersReducedMotion)}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <img
                      src={image}
                      alt={`${product['product-title']} ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Selection indicator */}
                    {selectedImage === index && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Attributes */}
            {Object.keys(displayedAttributes).length > 0 && (
              <div 
                ref={specsSectionRef}
                className={`transition-all duration-1000 ${
                  isSpecsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${getAnimationClasses('animate-fade-in-up', '', prefersReducedMotion)}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Attributes</h3>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 space-y-2 text-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  {displayedAttributes.material && <div><span className="text-gray-500">Material:</span> <span className="font-medium text-gray-900">{displayedAttributes.material}</span></div>}
                  {Array.isArray(displayedAttributes.certification) && displayedAttributes.certification.length > 0 && (
                    <div><span className="text-gray-500">Certifications:</span> <span className="font-medium text-gray-900">{displayedAttributes.certification.join(', ')}</span></div>
                  )}
                  {displayedAttributes.warrantyPeriod && <div><span className="text-gray-500">Warranty:</span> <span className="font-medium text-gray-900">{displayedAttributes.warrantyPeriod}</span></div>}
                  {displayedAttributes.countryOfOrigin && <div><span className="text-gray-500">Made In:</span> <span className="font-medium text-gray-900">{displayedAttributes.countryOfOrigin}</span></div>}
                </div>
              </div>
            )}

            {/* Specifications (grouped array) */}
            {Array.isArray(displayedSpecs) && displayedSpecs.length > 0 && (
              <div className={getAnimationClasses('animate-fade-in-up delay-200', '', prefersReducedMotion)}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 space-y-2 text-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  {displayedSpecs.map((s, i) => (
                    <div 
                      key={`${s.group}-${s.name}-${i}`} 
                      className="flex justify-between hover:bg-white/50 rounded-lg p-2 -m-2 transition-all duration-300 hover:shadow-sm"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className="text-gray-600">{s.group} — {s.name}</span>
                      <span className="font-medium text-gray-900">{s.value}{s.unit ? ` ${s.unit}` : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Physical */}
            {(displayedWeight || displayedDimensions) && (
              <div className={getAnimationClasses('animate-fade-in-up delay-300', '', prefersReducedMotion)}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Physical</h3>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  {displayedWeight && (
                    <div><span className="text-gray-500">Weight:</span> <span className="font-medium text-gray-900">{displayedWeight.value} {displayedWeight.unit}</span></div>
                  )}
                  {displayedDimensions && (
                    <div><span className="text-gray-500">Dimensions:</span> <span className="font-medium text-gray-900">{displayedDimensions.length} × {displayedDimensions.width} × {displayedDimensions.height} {displayedDimensions.unit}</span></div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div 
            ref={infoSectionRef}
            className={`space-y-6 transition-all duration-1000 ${
              isInfoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className={getAnimationClasses('animate-fade-in-up', '', prefersReducedMotion)}>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 leading-tight animate-pulse-slow">
                {displayedTitle}
              </h1>
              
              <div className={`flex items-center space-x-4 mb-6 ${getAnimationClasses('animate-slide-in-left delay-200', '', prefersReducedMotion)}`}>
                <div className="relative">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse-slow">
                    ₹{displayedPrice}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-lg opacity-0 animate-pulse-slow"></div>
                </div>
                {product['old-price'] !== displayedPrice && product['old-price'] != null && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product['old-price']}
                  </span>
                )}
                {product['old-price'] !== displayedPrice && product['old-price'] != null && (
                  <span className="text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full font-bold shadow-lg animate-bounce border border-green-200 hover:scale-110 transition-all duration-300">
                    {Math.round(((parseFloat(product['old-price']) - parseFloat(displayedPrice)) / parseFloat(product['old-price'])) * 100)}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className={getAnimationClasses('animate-fade-in-up delay-300', '', prefersReducedMotion)}>
              <span className="text-sm text-gray-500">Category:</span>
              <span className="ml-2 text-sm bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 inline-block border border-blue-200 hover:border-blue-300">
                {product.category}
              </span>
            </div>

            {/* Description */}
            <div className={getAnimationClasses('animate-fade-in-up delay-400', '', prefersReducedMotion)}>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-600 leading-relaxed">
                  {displayedDescription}
                </p>
              </div>
            </div>

            

            {/* Pricing */}
            {(pricing.basePrice != null || pricing.comparePrice != null || pricing.currency || pricing.taxRate != null || (pricing.discounts && pricing.discounts.length)) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {pricing.basePrice != null && <div><span className="text-gray-500">Base Price:</span> <span className="font-medium text-gray-900">₹{pricing.basePrice}</span></div>}
                    {pricing.comparePrice != null && <div><span className="text-gray-500">MRP:</span> <span className="font-medium text-gray-900">₹{pricing.comparePrice}</span></div>}
                    {pricing.currency && <div><span className="text-gray-500">Currency:</span> <span className="font-medium text-gray-900">{pricing.currency}</span></div>}
                    {pricing.taxRate != null && <div><span className="text-gray-500">Tax Rate:</span> <span className="font-medium text-gray-900">{pricing.taxRate}%</span></div>}
                  </div>
                  {Array.isArray(pricing.discounts) && pricing.discounts.length > 0 && (
                    <div>
                      <div className="text-gray-700 font-medium mb-1">Active Discounts</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="py-1 pr-3">Type</th>
                              <th className="py-1 pr-3">Value</th>
                              <th className="py-1 pr-3">Min Qty</th>
                              <th className="py-1 pr-3">Valid</th>
                              <th className="py-1 pr-3">Active</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pricing.discounts.map((d, i) => (
                              <tr key={i} className="border-t">
                                <td className="py-1 pr-3 capitalize">{d.type}</td>
                                <td className="py-1 pr-3">{d.value}{d.type === 'percentage' ? '%' : ''}</td>
                                <td className="py-1 pr-3">{d.minQuantity ?? '-'}</td>
                                <td className="py-1 pr-3">{d.validFrom?.slice(0, 10)} – {d.validTo?.slice(0, 10)}</td>
                                <td className="py-1 pr-3">{d.isActive ? 'Yes' : 'No'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Inventory */}
            {inventory.availableQuantity != null && (
              <div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  {(inventory.lowStockThreshold != null && inventory.availableQuantity <= inventory.lowStockThreshold) ? (
                    <div className="font-medium text-red-600">
                      Available Stock: {inventory.availableQuantity}
                      <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">Low stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded">In stock</span>
                      <span className="font-medium text-gray-900">Available Stock: {inventory.availableQuantity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Variants (moved below Inventory) */}
            {variants.length > 0 && (
              <div ref={variantsRef} className={getAnimationClasses('animate-fade-in-up delay-500', '', prefersReducedMotion)}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Variants</h3>
                <div className={`bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 space-y-3 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-md ${variantsHighlighted ? 'ring-2 ring-blue-400 shadow-lg animate-glow' : ''}`}>
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedVariantIndex(i); setSelectedImage(0); }}
                      className={`w-full text-left border rounded-xl p-3 text-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        selectedVariantIndex === i 
                          ? 'border-blue-500 bg-gradient-to-r from-white to-blue-50 shadow-md ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/50'
                      }`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs capitalize">{v.type}</span>
                        <span className="font-medium text-gray-900">{v.name}</span>
                        {v.sku && <span className="text-gray-500">SKU: {v.sku}</span>}
                        {v.price != null && <span className="text-gray-900">₹{v.price}</span>}
                        {v.inventory != null && <span className="text-gray-600">In stock: {v.inventory}</span>}
                        {selectedVariantIndex === i && <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">Selected</span>}
                      </div>
                      {Array.isArray(v.images) && v.images.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {v.images.map((img, j) => (
                            <div
                              key={j}
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); setSelectedVariantIndex(i); setSelectedImage(j); }}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setSelectedVariantIndex(i); setSelectedImage(j); } }}
                              className="rounded overflow-hidden border border-gray-200 hover:border-blue-400 cursor-pointer"
                            >
                              <img src={img} alt={`${v.name}-${j}`} className="w-16 h-16 object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className={getAnimationClasses('animate-fade-in-up delay-500', '', prefersReducedMotion)}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 bg-white hover:scale-105 group">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-3 hover:bg-blue-50 transition-all duration-500 rounded-l-2xl hover:text-blue-600 hover:scale-110 group/btn"
                  >
                    <Minus className="w-4 h-4 group-hover/btn:scale-110 group-hover/btn:animate-bounce transition-all duration-300" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={inventory?.availableQuantity ?? undefined}
                    value={quantity}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      if (isNaN(parsed)) return;
                      const maxQty = inventory?.availableQuantity ?? parsed;
                      const next = Math.min(Math.max(1, parsed), maxQty);
                      handleQuantityChange(next);
                    }}
                    className="w-20 text-center px-3 py-3 text-lg font-bold focus:outline-none focus:bg-blue-50 transition-all duration-300 focus:scale-105"
                  />
                  <button
                    onClick={() => {
                      const maxQty = inventory?.availableQuantity ?? (product?.raw?.inventory?.availableQuantity ?? undefined);
                      if (maxQty != null && quantity >= maxQty) {
                        return; // Prevent increase if already at or above available stock
                      }
                      handleQuantityChange(quantity + 1);
                    }}
                    className={`p-3 transition-all duration-500 rounded-r-2xl group/btn ${
                      (inventory?.availableQuantity ?? (product?.raw?.inventory?.availableQuantity ?? undefined)) != null && 
                      quantity >= (inventory?.availableQuantity ?? (product?.raw?.inventory?.availableQuantity ?? undefined))
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'hover:bg-blue-50 hover:text-blue-600 hover:scale-110'
                    }`}
                    disabled={(inventory?.availableQuantity ?? (product?.raw?.inventory?.availableQuantity ?? undefined)) != null && 
                      quantity >= (inventory?.availableQuantity ?? (product?.raw?.inventory?.availableQuantity ?? undefined))}
                  >
                    <Plus className="w-4 h-4 group-hover/btn:scale-110 group-hover/btn:animate-bounce transition-all duration-300" />
                  </button>
                </div>
                <span className="text-sm text-gray-600 bg-gradient-to-r from-gray-100 to-blue-100 px-4 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200">
                  {quantity} × ₹{displayedPrice} = <span className="font-bold text-blue-600 text-lg">₹{(quantity * parseFloat(displayedPrice)).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex space-x-4 pt-6 ${getAnimationClasses('animate-slide-in-bottom delay-600', '', prefersReducedMotion)}`}>
              <a
                href="#cart"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart();
                }}
                className="flex-1 flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden border border-blue-500/20 hover:border-blue-400/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <ShoppingCart className="w-5 h-5 mr-3 relative z-10 group-hover:animate-bounce group-hover:scale-110 transition-all duration-300" />
                <span className="relative z-10 text-lg">Add to Cart</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </a>
              <a
                href="#wishlist"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToWishlist();
                }}
                className={`flex items-center justify-center px-8 py-4 rounded-2xl border-2 transition-all duration-500 font-bold hover:scale-110 hover:shadow-xl group relative overflow-hidden ${isInWishlist
                    ? 'border-red-500 text-red-500 bg-gradient-to-r from-red-50 to-pink-50 animate-pulse shadow-lg'
                    : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Heart className="w-5 h-5 mr-3 relative z-10 group-hover:scale-110 group-hover:animate-bounce transition-all duration-300" fill={isInWishlist ? 'currentColor' : 'none'} />
                <span className="relative z-10 text-lg">{isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </a>
            </div>

            {/* Enhanced Additional Info */}
            <div className={`bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 ${getAnimationClasses('animate-scale-in delay-700', '', prefersReducedMotion)}`}>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center animate-pulse-slow shadow-md">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-base font-bold text-blue-900 mb-1">Free Shipping</h4>
                  <p className="text-sm text-blue-700 font-medium">Free delivery on orders above ₹500</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;

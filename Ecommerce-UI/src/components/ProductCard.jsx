import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onAddToWishlist, isFavorite = false, onOpenDetails }) => {
  const oldPrice = parseFloat(product['old-price']);
  const newPrice = parseFloat(product['new-price']);
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-white rounded-xl xs:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 xs:hover:-translate-y-2 hover:scale-105 overflow-hidden group cursor-pointer h-full flex flex-col relative"
      onClick={() => onOpenDetails?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Enhanced Animations */}
      <div className="relative overflow-hidden h-40 xs:h-44 sm:h-48">
        <img
          src={product['image-url']}
          alt={product['product-title']}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            const target = e.target;
            target.src = 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/40 transition-all duration-500"></div>
        
        {/* Discount Badge with Animation */}
        {discount > 0 && (
          <div className="absolute top-2 xs:top-3 left-2 xs:left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 xs:px-3 py-0.5 xs:py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
            <span className="flex items-center space-x-1">
              <Zap className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
              <span>{discount}% OFF</span>
            </span>
          </div>
        )}
        
        {/* Special Offer Badge */}
        {((product.raw && (product.raw?.characteristics?.offers || product.raw?.marketing?.promotionText))) && (
          <div className="absolute bottom-2 xs:bottom-3 left-2 xs:left-3 right-2 xs:right-3 bg-gradient-to-r from-blue-900/95 to-indigo-900/95 text-white px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg text-[9px] xs:text-[10px] font-semibold truncate backdrop-blur-sm border border-blue-400/30">
            <span className="flex items-center space-x-1">
              <Star className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-yellow-400" />
              <span>{product.raw?.marketing?.promotionText || 'Special Offer'}</span>
            </span>
          </div>
        )}
        
        {/* Wishlist Button with Enhanced Animation */}
        <a
          href="#favorites"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToWishlist?.(product);
          }}
          className={`absolute top-2 xs:top-3 right-2 xs:right-3 p-2 xs:p-2.5 rounded-full shadow-lg transition-all duration-500 transform ${
            isFavorite
              ? 'bg-red-500 text-white scale-110 animate-pulse'
              : 'bg-white/90 backdrop-blur-sm text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 xs:w-4 xs:h-4 transition-all duration-300 ${isFavorite ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
        </a>
        
        {/* Quick View Button */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenDetails?.(product);
            }}
            className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 bg-white/90 backdrop-blur-sm text-gray-800 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full font-semibold text-xs xs:text-sm flex items-center space-x-1.5 xs:space-x-2 hover:bg-white hover:scale-105"
          >
            <Eye className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
            <span>Quick View</span>
          </button>
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      {/* Content with Enhanced Styling */}
      <div className="p-3 xs:p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 mb-1.5 xs:mb-2 line-clamp-2 text-xs xs:text-sm group-hover:text-blue-600 transition-colors duration-300">
          {product['product-title']}
        </h3>

        {product.category && (
          <p className="text-xs text-gray-500 mb-2 xs:mb-3 font-medium bg-gray-100 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full inline-block w-fit">
            {product.category}
          </p>
        )}

        {/* Price with Enhanced Styling */}
        <div className="flex items-center justify-between mb-3 xs:mb-4">
          <div className="flex items-center space-x-1.5 xs:space-x-2">
            <span className="text-lg xs:text-xl font-bold text-blue-900 group-hover:text-blue-600 transition-colors duration-300">
              ₹{newPrice.toLocaleString()}
            </span>
            {oldPrice > newPrice && (
              <span className="text-xs xs:text-sm text-gray-500 line-through">
                ₹{oldPrice.toLocaleString()}
              </span>
            )}
          </div>
          {oldPrice > newPrice && (
            <div className="text-xs font-bold text-green-600 bg-green-100 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full">
              Save ₹{(oldPrice - newPrice).toLocaleString()}
            </div>
          )}
        </div>

        {/* Add to Cart Button with Enhanced Animation */}
        <a
          href="#cart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 xs:py-3 px-3 xs:px-4 rounded-lg xs:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-1.5 xs:space-x-2 font-semibold inline-block mt-auto group/btn relative overflow-hidden text-xs xs:text-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          <ShoppingCart className="w-3.5 h-3.5 xs:w-4 xs:h-4 relative z-10 group-hover/btn:animate-bounce" />
          <span className="relative z-10">Add to Cart</span>
          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </a>
      </div>
    </div>
  );
};

export default ProductCard;

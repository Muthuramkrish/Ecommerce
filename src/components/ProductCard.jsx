import React from 'react';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import VariantImageSelector from './VariantImageSelector';

const ProductCard = ({ product, onAddToCart, onAddToWishlist, isFavorite = false, onOpenDetails }) => {
  const [selectedVariantIndex, setSelectedVariantIndex] = React.useState(null);
  const [displayData, setDisplayData] = React.useState({
    imageUrl: product['image-url'],
    newPrice: parseFloat(product['new-price']),
    oldPrice: parseFloat(product['old-price'])
  });

  const variants = product.raw?.classification?.variants || [];
  const hasVariants = variants.length > 0;

  const oldPrice = displayData.oldPrice;
  const newPrice = displayData.newPrice;
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  const handleVariantSelect = (variant, variantIndex, e) => {
    e.stopPropagation();
    setSelectedVariantIndex(variantIndex);
    setDisplayData({
      imageUrl: variant.images && variant.images.length > 0 ? variant.images[0] : product['image-url'],
      newPrice: variant.price != null ? variant.price : parseFloat(product['new-price']),
      oldPrice: parseFloat(product['old-price']) // Keep original old price for discount calculation
    });
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer h-full flex flex-col"
      onClick={() => onOpenDetails?.(product)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-48">
        <img
          src={displayData.imageUrl}
          alt={product['product-title']}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          onError={(e) => {
            const target = e.target;
            target.src = 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discount}%
          </div>
        )}
        {((product.raw && (product.raw?.characteristics?.offers || product.raw?.marketing?.promotionText))) && (
          <div className="absolute bottom-2 left-2 right-2 bg-blue-900/90 text-white px-2 py-1 rounded text-[10px] font-semibold truncate">
            {product.raw?.marketing?.promotionText || 'Special Offer'}
          </div>
        )}
        <a
          href="#favorites"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToWishlist?.(product);
          }}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-300 ${isFavorite
              ? 'bg-red-500 text-white opacity-100'
              : 'bg-white text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-gray-50'
            }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </a>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm">
          {product['product-title']}
        </h3>

        {product.category && (
          <p className="text-xs text-gray-500 mb-2">{product.category}</p>
        )}

        {/* Variant thumbnails */}
        {hasVariants && (
          <VariantImageSelector
            variants={variants}
            selectedVariantIndex={selectedVariantIndex}
            onVariantSelect={handleVariantSelect}
            size="normal"
            maxVariants={4}
            showPrices={true}
            className="mb-3"
          />
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-blue-900 transition-all duration-300">
              ₹{newPrice.toLocaleString()}
            </span>
            {oldPrice > newPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{oldPrice.toLocaleString()}
              </span>
            )}
          </div>
          {selectedVariantIndex !== null && (
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {variants[selectedVariantIndex]?.name}
            </span>
          )}
        </div>

        {/* Add to Cart Button pinned at bottom */}
        <a
          href="#cart"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart?.(product);
          }}
          className="w-full bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium inline-block mt-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </a>
      </div>
    </div>
  );
};

export default ProductCard;

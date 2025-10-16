import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const FavoritesPage = ({ favorites = [], onBack, onAddToCart, onAddToWishlist, onOpenDetails }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          <button 
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">My Favorites</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
              <p className="text-gray-600">Browse products and add some to your wishlist.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product, index) => (
                <div key={`${product['product-id'] || product['product-title']}-${index}`} className="cursor-pointer">
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
          )}
        </div>
      </section>
    </div>
  );
};

export default FavoritesPage;

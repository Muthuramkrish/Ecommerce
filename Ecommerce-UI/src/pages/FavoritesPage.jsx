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
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          <button 
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 text-center flex-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">My Favorites</h1>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">No favorites yet</h2>
                <p className="text-gray-600 text-lg">Browse products and add some to your wishlist.</p>
              </div>
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

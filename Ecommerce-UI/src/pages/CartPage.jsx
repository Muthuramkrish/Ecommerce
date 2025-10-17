import React, { useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

const CartPage = ({ items, onBack, onUpdateQuantity, onRemoveItem, onCheckout, clearCart, onOpenDetails, isGuestUser = false }) => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item['new-price']) * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 99;
  // Determine tax per item using product-specific or collection-based tax rates
  const collectionTaxRates = {
    Cables: 0,
    Fans: 0,
    Heaters: 0,
    Lighting: 0,
    Switches: 0
  };

  const getItemTaxRatePercent = (item) => {
    const explicitRate = item?.raw?.pricing?.taxRate ?? item?.pricing?.taxRate;
    if (explicitRate != null && !isNaN(Number(explicitRate))) return Number(explicitRate);
    const subcategory = item?.raw?.anchor?.subcategory;
    const category = item?.raw?.anchor?.category;
    const byCollection = collectionTaxRates[subcategory] ?? collectionTaxRates[category];
    if (byCollection != null && !isNaN(Number(byCollection))) return Number(byCollection);
    // Fallback if nothing available
    return 18;
  };

  const tax = items.reduce((sum, item) => {
    const linePrice = parseFloat(item['new-price']) * item.quantity;
    const ratePercent = getItemTaxRatePercent(item);
    return sum + (linePrice * (ratePercent / 100));
  }, 0);
  const total = subtotal + shipping + tax;
  const roundedTotal = Math.round(total);
  const roundOff = roundedTotal - total;

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
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">Shopping Cart</h1>
            <button 
              onClick={() => clearCart()}
              className="flex items-center text-gray-600 hover:text-red-600 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-red-50/80 hover:shadow-lg border border-gray-200/50 hover:border-red-200"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:scale-110 group-hover:animate-bounce transition-all duration-300" />
              <span className="hidden sm:inline font-medium">Clear Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
            <p className="text-gray-400">Add some products to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 hover:scale-105 group">
                  <button
                    onClick={() => onOpenDetails && onOpenDetails(item)}
                    className="focus:outline-none"
                    title={item['product-title']}
                  >
                    <img
                      src={item['image-url']}
                      alt={item['product-title']}
                      className="w-20 h-20 object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target;
                        target.src = 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=100';
                      }}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onOpenDetails && onOpenDetails(item)}
                      className="text-left text-sm font-semibold text-gray-900 truncate hover:underline hover:text-blue-600 transition-all duration-300"
                      title={item['product-title']}
                    >
                      {item['product-title']}
                    </button>
                    <p className="text-sm font-bold text-blue-600">₹{parseFloat(item['new-price']).toLocaleString()}</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <button onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-blue-50 rounded-xl hover:text-blue-600 hover:scale-110 transition-all duration-300 group/btn">
                        <Minus className="w-4 h-4 group-hover/btn:scale-110 group-hover/btn:animate-bounce transition-all duration-300" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value, 10);
                          if (isNaN(parsed)) return;
                          const minQty = 1;
                          // If availableQuantity can be part of the item, clamp to it; otherwise only enforce min
                          const maxQty = item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity;
                          const clamped = Math.max(minQty, maxQty != null ? Math.min(parsed, maxQty) : parsed);
                          onUpdateQuantity(index, clamped);
                        }}
                        className="w-20 text-center px-3 py-2 text-sm font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus:scale-105"
                      />
                      <button 
                        onClick={() => {
                          const maxQty = item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity;
                          if (maxQty != null && item.quantity >= maxQty) {
                            return; // Prevent increase if already at or above available stock
                          }
                          onUpdateQuantity(index, item.quantity + 1);
                        }} 
                        className={`p-2 rounded-xl transition-all duration-500 group/btn ${
                          (item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity) != null && 
                          item.quantity >= (item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity)
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'hover:bg-blue-50 hover:text-blue-600 hover:scale-110'
                        }`}
                        disabled={(item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity) != null && 
                          item.quantity >= (item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity)}
                      >
                        <Plus className="w-4 h-4 group-hover/btn:scale-110 group-hover/btn:animate-bounce transition-all duration-300" />
                      </button>
                      <button onClick={() => onRemoveItem(index)} className="p-2 hover:bg-red-50 rounded-xl text-red-500 ml-2 hover:scale-110 hover:shadow-lg transition-all duration-300 group/btn">
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 group-hover/btn:animate-bounce transition-all duration-300" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ₹{(parseFloat(item['new-price']) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-fit">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Round Off</span><span>₹{roundOff.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-base border-t pt-3"><span>Grand Total</span><span>₹{roundedTotal.toLocaleString()}</span></div>
              </div>
              <a
                href="#checkout"
                onClick={(e) => { e.preventDefault(); onCheckout(); }}
                className="mt-6 w-full inline-block text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold text-lg hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10">{isGuestUser ? 'Login to Checkout' : 'Proceed to Checkout'}</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

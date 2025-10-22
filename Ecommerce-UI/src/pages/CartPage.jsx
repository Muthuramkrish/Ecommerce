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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex items-center justify-between h-14 xs:h-16">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-xs xs:text-sm md:text-base"
            >
              <ArrowLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 mr-1.5 xs:mr-2" />
              <span className="hidden xs:inline">Back</span>
            </button>
            <h1 className="text-base xs:text-lg font-semibold text-gray-900 text-center flex-1">Shopping Cart</h1>
            <button 
              onClick={() => clearCart()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-xs xs:text-sm md:text-base"
            >
              <Trash2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 mr-1.5 xs:mr-2" />
              <span className="hidden xs:inline">Clear Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-10 py-6 xs:py-8">
        {items.length === 0 ? (
          <div className="text-center py-12 xs:py-16">
            <ShoppingBag className="w-12 h-12 xs:w-16 xs:h-16 text-gray-300 mx-auto mb-3 xs:mb-4" />
            <p className="text-gray-500 text-base xs:text-lg mb-1 xs:mb-2">Your cart is empty</p>
            <p className="text-gray-400 text-sm xs:text-base">Add some products to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xs:gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3 xs:space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 xs:space-x-4 p-3 xs:p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <button
                    onClick={() => onOpenDetails && onOpenDetails(item)}
                    className="focus:outline-none flex-shrink-0"
                    title={item['product-title']}
                  >
                    <img
                      src={item['image-url']}
                      alt={item['product-title']}
                      className="w-16 h-16 xs:w-20 xs:h-20 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target;
                        target.src = 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=100';
                      }}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onOpenDetails && onOpenDetails(item)}
                      className="text-left text-xs xs:text-sm font-medium text-gray-900 truncate hover:underline"
                      title={item['product-title']}
                    >
                      {item['product-title']}
                    </button>
                    <p className="text-xs xs:text-sm text-gray-500">₹{parseFloat(item['new-price']).toLocaleString()}</p>
                    <div className="flex items-center space-x-1.5 xs:space-x-2 mt-1.5 xs:mt-2">
                      <button onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))} className="p-0.5 xs:p-1 hover:bg-gray-100 rounded">
                        <Minus className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
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
                        className="w-12 xs:w-16 text-center px-1.5 xs:px-2 py-0.5 xs:py-1 text-xs xs:text-sm font-medium border border-gray-200 rounded"
                      />
                      <button 
                        onClick={() => {
                          const maxQty = item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity;
                          if (maxQty != null && item.quantity >= maxQty) {
                            return; // Prevent increase if already at or above available stock
                          }
                          onUpdateQuantity(index, item.quantity + 1);
                        }} 
                        className={`p-0.5 xs:p-1 rounded transition-colors ${
                          (item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity) != null && 
                          item.quantity >= (item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity)
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'hover:bg-gray-100'
                        }`}
                        disabled={(item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity) != null && 
                          item.quantity >= (item?.raw?.inventory?.availableQuantity ?? item?.inventory?.availableQuantity)}
                      >
                        <Plus className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                      </button>
                      <button onClick={() => onRemoveItem(index)} className="p-0.5 xs:p-1 hover:bg-red-100 rounded text-red-500 ml-1 xs:ml-2">
                        <Trash2 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs xs:text-sm font-medium text-gray-900 flex-shrink-0">
                    ₹{(parseFloat(item['new-price']) * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 xs:p-6 h-fit">
              <h2 className="text-base xs:text-lg font-semibold text-gray-900 mb-3 xs:mb-4">Order Summary</h2>
              <div className="space-y-1.5 xs:space-y-2 text-xs xs:text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{tax.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Round Off</span><span>₹{roundOff.toFixed(2)}</span></div>
                <div className="flex justify-between font-semibold text-sm xs:text-base border-t pt-2 xs:pt-3"><span>Grand Total</span><span>₹{roundedTotal.toLocaleString()}</span></div>
              </div>
              <a
                href="#checkout"
                onClick={(e) => { e.preventDefault(); onCheckout(); }}
                className="mt-4 xs:mt-6 w-full inline-block text-center bg-blue-900 text-white py-2.5 xs:py-3 px-3 xs:px-4 rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm xs:text-base"
              >
                {isGuestUser ? 'Login to Checkout' : 'Proceed to Checkout'}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

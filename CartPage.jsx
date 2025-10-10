// Complete Cart Page Component using the custom hook
import React, { useState } from 'react';
import { useCart } from './hooks/useCart';
import './CartComponent.css';

const CartPage = () => {
  const {
    cartItems,
    loading,
    error,
    isAuthenticated,
    cartStats,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    clearError
  } = useCart();

  const [success, setSuccess] = useState('');

  // Handle clear cart with confirmation
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
      return;
    }

    const result = await clearCart();
    if (result.success) {
      setSuccess('Cart cleared successfully! 🎉');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Handle remove item with confirmation
  const handleRemoveItem = async (productId, productTitle) => {
    if (!window.confirm(`Remove "${productTitle}" from cart?`)) {
      return;
    }

    const result = await removeItem(productId);
    if (result.success) {
      setSuccess('Item removed from cart');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Handle quantity update
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  // Clear messages
  const clearMessages = () => {
    clearError();
    setSuccess('');
  };

  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h2>🛒 Shopping Cart</h2>
        </div>
        <div className="login-prompt">
          <h3>Please log in to view your cart</h3>
          <p>You need to be logged in to access your cart items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <div>
          <h2>🛒 Shopping Cart</h2>
          {cartStats.itemCount > 0 && (
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>
              {cartStats.totalItems} items • ₹{cartStats.totalPrice.toFixed(2)}
            </p>
          )}
        </div>
        <div className="cart-actions">
          <button 
            className="btn btn-refresh" 
            onClick={refreshCart}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <button 
            className="btn btn-clear" 
            onClick={handleClearCart}
            disabled={loading || cartItems.length === 0}
          >
            🗑️ Clear Cart
          </button>
        </div>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className="message-container">
          {error && (
            <div className="message error">
              {error}
              <button 
                onClick={clearMessages}
                style={{ 
                  float: 'right', 
                  background: 'none', 
                  border: 'none', 
                  color: 'inherit', 
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>
          )}
          {success && (
            <div className="message success">
              {success}
              <button 
                onClick={() => setSuccess('')}
                style={{ 
                  float: 'right', 
                  background: 'none', 
                  border: 'none', 
                  color: 'inherit', 
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading cart...</p>
        </div>
      )}

      {/* Cart content */}
      {!loading && (
        <>
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Browse our products and add items to your cart!</p>
              <button 
                className="btn btn-refresh" 
                onClick={refreshCart}
                style={{ marginTop: '20px' }}
              >
                🔄 Check Again
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={item['product-id'] || index} className="cart-item">
                    {/* Product Image */}
                    <div className="item-image">
                      {item['image-url'] ? (
                        <img 
                          src={item['image-url']} 
                          alt={item['product-title']} 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="no-image" style={{ display: item['image-url'] ? 'none' : 'flex' }}>
                        📦
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="item-details">
                      <h3 className="item-title">
                        {item['product-title'] || 'Unknown Product'}
                      </h3>
                      
                      <div className="item-price">
                        {item['old-price'] && item['old-price'] !== '0' && (
                          <span className="old-price">₹{item['old-price']}</span>
                        )}
                        <span className="new-price">
                          ₹{item['new-price'] || item.price || '0'}
                        </span>
                      </div>
                      
                      {item.category && (
                        <div className="item-category">
                          📂 {item.category}
                        </div>
                      )}

                      <div className="item-subtotal">
                        Subtotal: ₹{(
                          parseFloat(item['new-price'] || item.price || 0) * 
                          parseInt(item.quantity || 1)
                        ).toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Item Controls */}
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item['product-id'], (item.quantity || 1) - 1)}
                          disabled={loading || (item.quantity || 1) <= 1}
                          title="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="quantity">{item.quantity || 1}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleQuantityChange(item['product-id'], (item.quantity || 1) + 1)}
                          disabled={loading}
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        className="btn btn-remove"
                        onClick={() => handleRemoveItem(item['product-id'], item['product-title'])}
                        disabled={loading}
                        title="Remove from cart"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Total Items:</span>
                  <span>{cartStats.totalItems}</span>
                </div>
                <div className="summary-row">
                  <span>Unique Products:</span>
                  <span>{cartStats.itemCount}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total Amount:</span>
                  <span>₹{cartStats.totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="checkout-actions" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                  <button 
                    className="btn btn-clear"
                    onClick={handleClearCart}
                    disabled={loading}
                    style={{ flex: '1' }}
                  >
                    🗑️ Clear All
                  </button>
                  <button 
                    className="btn"
                    style={{ 
                      flex: '2',
                      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                      color: 'white'
                    }}
                    disabled={loading}
                  >
                    🛒 Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;
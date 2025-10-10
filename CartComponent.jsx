import React, { useState, useEffect } from 'react';
import { cartAPI } from './services/cartAPI';
import './CartComponent.css';

const CartComponent = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      loadCart();
    }
  }, []);

  // Load cart items from backend
  const loadCart = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await cartAPI.getCart();
      setCartItems(response.cart || []);
    } catch (err) {
      setError(err.message || 'Failed to load cart');
      if (err.message.includes('unauthorized') || err.message.includes('token')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await cartAPI.clearCart();
      setCartItems([]);
      setSuccess('Cart cleared successfully! 🎉');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to clear cart');
      if (err.message.includes('unauthorized') || err.message.includes('token')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove single item from cart
  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Remove this item from cart?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await cartAPI.removeFromCart(productId);
      await loadCart(); // Reload cart to get updated items
      setSuccess('Item removed from cart');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setLoading(true);
    setError('');

    try {
      await cartAPI.updateCartQuantity(productId, newQuantity);
      await loadCart(); // Reload cart to get updated items
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setCartItems([]);
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item['new-price'] || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0).toFixed(2);
  };

  // If user is not logged in
  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h2>🛒 Shopping Cart</h2>
        </div>
        <div className="login-prompt">
          <p>Please log in to view your cart items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>🛒 Shopping Cart</h2>
        <div className="cart-actions">
          <button 
            className="btn btn-refresh" 
            onClick={loadCart}
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
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {/* Loading state */}
      {loading && (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}

      {/* Cart content */}
      {!loading && (
        <>
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some items to see them here!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={item['product-id'] || index} className="cart-item">
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
                        No Image
                      </div>
                    </div>
                    
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
                          Category: {item.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item['product-id'], (item.quantity || 1) - 1)}
                          disabled={loading || (item.quantity || 1) <= 1}
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity || 1}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => handleUpdateQuantity(item['product-id'], (item.quantity || 1) + 1)}
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        className="btn btn-remove"
                        onClick={() => handleRemoveItem(item['product-id'])}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="total-items">
                  Total Items: {cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </div>
                <div className="total-price">
                  Total: ₹{calculateTotal()}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CartComponent;
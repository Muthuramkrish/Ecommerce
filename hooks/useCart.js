// Custom React hook for cart management
import { useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/cartAPI';

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
    
    if (token) {
      loadCart();
    }
  }, []);

  // Load cart items
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await cartAPI.getCart();
      setCartItems(response.cart || []);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired')) {
        setIsAuthenticated(false);
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addToCart = useCallback(async (product, quantity = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await cartAPI.addToCart(product, quantity);
      setCartItems(response.cart || []);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity < 1) return { success: false, message: 'Quantity must be at least 1' };
    
    setLoading(true);
    setError('');
    
    try {
      const response = await cartAPI.updateCartQuantity(productId, quantity);
      setCartItems(response.cart || []);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove item from cart
  const removeItem = useCallback(async (productId) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await cartAPI.removeFromCart(productId);
      setCartItems(response.cart || []);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await cartAPI.clearCart();
      setCartItems([]);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync cart with backend
  const syncCart = useCallback(async (items) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await cartAPI.syncCart(items);
      setCartItems(response.cart || []);
      return { success: true, message: response.message };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate cart statistics
  const cartStats = {
    totalItems: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
    totalPrice: cartItems.reduce((total, item) => {
      const price = parseFloat(item['new-price'] || item.price || 0);
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0),
    itemCount: cartItems.length
  };

  return {
    // State
    cartItems,
    loading,
    error,
    isAuthenticated,
    cartStats,
    
    // Actions
    loadCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    syncCart,
    
    // Utilities
    clearError: () => setError(''),
    refreshCart: loadCart
  };
};

export default useCart;
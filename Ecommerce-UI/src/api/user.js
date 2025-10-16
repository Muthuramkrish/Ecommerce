import { API_BASE_URL } from './client.js';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      return parsedUser.token;
    } catch (error) {
      console.error('Error parsing user token:', error);
      localStorage.removeItem('currentUser'); // Clear corrupted data
      return null;
    }
  }
  return null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Helper function to get current user info
export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing current user:', error);
      localStorage.removeItem('currentUser');
      return null;
    }
  }
  return null;
};

// Helper function to make authenticated API calls
const apiCall = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('currentUser');
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Access denied. Please log in again.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// ================================
// AUTHENTICATION API CALLS
// ================================

// SIGN UP (REGISTER)
export const signUpUser = async (data = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/user/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Signup failed: ${response.status}`);
  }

  const json = await response.json();
  return json;
};

// SIGN IN (LOGIN)
export const signInUser = async (data = {}) => {
  const response = await fetch(`${API_BASE_URL}/api/user/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Login failed: ${response.status}`);
  }

  const json = await response.json();
  
  // Store user data and token for future requests
  if (json.user && json.token) {
    const userWithToken = { ...json.user, token: json.token };
    localStorage.setItem('currentUser', JSON.stringify(userWithToken));
  }
  
  return json;
};

// ================================
// USER PROFILE API CALLS
// ================================

// Get User Profile
export const getUserProfile = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/profile`);
};

// Get User Data (alias for getUserProfile for compatibility)
export const getUserData = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/data`);
};

// ================================
// FAVORITES API CALLS
// ================================

// Get Favorites
export const getFavorites = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/favorites`);
};

// Add to Favorites
export const addToFavorites = async (product) => {
  return await apiCall(`${API_BASE_URL}/api/user/favorites`, {
    method: 'POST',
    body: JSON.stringify({ product })
  });
};

// Remove from Favorites
export const removeFromFavorites = async (productId) => {
  return await apiCall(`${API_BASE_URL}/api/user/favorites/${productId}`, {
    method: 'DELETE'
  });
};

// ================================
// CART API CALLS
// ================================

// Get Cart
export const getCart = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/cart`);
};

// Add to Cart
export const addToCart = async (product, quantity = 1) => {
  return await apiCall(`${API_BASE_URL}/api/user/cart`, {
    method: 'POST',
    body: JSON.stringify({ product, quantity })
  });
};

// Update Cart Item Quantity
export const updateCartQuantity = async (productId, quantity) => {
  return await apiCall(`${API_BASE_URL}/api/user/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
};

// Remove from Cart
export const removeFromCart = async (productId) => {
  return await apiCall(`${API_BASE_URL}/api/user/cart/${productId}`, {
    method: 'DELETE'
  });
};

// Clear Cart
export const clearCart = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/cart`, {
    method: 'DELETE'
  });
};

// Sync Cart from Frontend
export const syncCart = async (cartItems) => {
  return await apiCall(`${API_BASE_URL}/api/user/cart/sync`, {
    method: 'POST',
    body: JSON.stringify({ cartItems })
  });
};

// ================================
// CHECKOUT/ORDER API CALLS
// ================================

// Create Order (Checkout)
export const createOrder = async (orderData) => {
  return await apiCall(`${API_BASE_URL}/api/user/orders`, {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
};

// Get User Orders
export const getUserOrders = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/orders`);
};

// Get Single Order by ID
export const getOrderById = async (orderId) => {
  return await apiCall(`${API_BASE_URL}/api/user/orders/${orderId}`);
};

// Update Order Status
export const updateOrderStatus = async (orderId, status, trackingId = null) => {
  const body = { status };
  if (trackingId) {
    body.trackingId = trackingId;
  }
  return await apiCall(`${API_BASE_URL}/api/user/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
};

// ================================
// BULK ORDER API CALLS
// ================================

// Create Bulk Order
export const createBulkOrder = async (bulkOrderData) => {
  return await apiCall(`${API_BASE_URL}/api/user/bulk-orders`, {
    method: 'POST',
    body: JSON.stringify(bulkOrderData)
  });
};

// Get User Bulk Orders
export const getUserBulkOrders = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/bulk-orders`);
};

// Get Single Bulk Order by ID
export const getBulkOrderById = async (bulkOrderId) => {
  return await apiCall(`${API_BASE_URL}/api/user/bulk-orders/${bulkOrderId}`);
};

// Update Bulk Order Status
export const updateBulkOrderStatus = async (bulkOrderId, updateData) => {
  return await apiCall(`${API_BASE_URL}/api/user/bulk-orders/${bulkOrderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
};
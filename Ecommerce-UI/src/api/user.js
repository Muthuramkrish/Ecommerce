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
      return null;
    }
  }
  return null;
};

// Helper function to make authenticated API calls
const apiCall = async (url, options = {}) => {
  const token = getAuthToken();
  
  // Check if token exists for protected endpoints
  if (!token) {
    throw new Error('401 - Access denied. No token provided.');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If we can't parse the error response, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      // Include status code in error message for better handling
      throw new Error(`${response.status} - ${errorMessage}`);
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

// Get User Data (profile, cart, and favorites)
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
export const removeFromFavorites = async (productTitle) => {
  const encodedTitle = encodeURIComponent(productTitle);
  return await apiCall(`${API_BASE_URL}/api/user/favorites/${encodedTitle}`, {
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
export const updateCartQuantity = async (productTitle, quantity) => {
  const encodedTitle = encodeURIComponent(productTitle);
  return await apiCall(`${API_BASE_URL}/api/user/cart/${encodedTitle}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
};

// Remove from Cart
export const removeFromCart = async (productTitle) => {
  const encodedTitle = encodeURIComponent(productTitle);
  return await apiCall(`${API_BASE_URL}/api/user/cart/${encodedTitle}`, {
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
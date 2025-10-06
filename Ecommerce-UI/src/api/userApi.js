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
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// User Profile
export const getUserProfile = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/profile`);
};

// Favorites API calls
export const getFavorites = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/favorites`);
};

export const addToFavorites = async (product) => {
  return await apiCall(`${API_BASE_URL}/api/user/favorites`, {
    method: 'POST',
    body: JSON.stringify({ product })
  });
};

export const removeFromFavorites = async (productTitle) => {
  const encodedTitle = encodeURIComponent(productTitle);
  return await apiCall(`${API_BASE_URL}/api/user/favorites/${encodedTitle}`, {
    method: 'DELETE'
  });
};

// Cart API calls
export const getCart = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/cart`);
};

export const addToCart = async (product, quantity = 1) => {
  return await apiCall(`${API_BASE_URL}/api/user/cart`, {
    method: 'POST',
    body: JSON.stringify({ product, quantity })
  });
};

export const updateCartQuantity = async (productTitle, quantity) => {
  const encodedTitle = encodeURIComponent(productTitle);
  return await apiCall(`${API_BASE_URL}/api/user/cart/${encodedTitle}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  });
};

export const removeFromCart = async (productTitle) => {
  const encodedTitle = encodeURIComponent(productTitle);
  return await apiCall(`${API_BASE_URL}/api/user/cart/${encodedTitle}`, {
    method: 'DELETE'
  });
};

export const clearCart = async () => {
  return await apiCall(`${API_BASE_URL}/api/user/cart`, {
    method: 'DELETE'
  });
};

export const syncCart = async (cartItems) => {
  return await apiCall(`${API_BASE_URL}/api/user/cart/sync`, {
    method: 'POST',
    body: JSON.stringify({ cartItems })
  });
};
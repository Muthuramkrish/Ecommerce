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

// User Authentication
export const signUp = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sign up failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

export const signIn = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sign in failed');
    }

    const data = await response.json();
    
    // Store user data and token for future requests
    if (data.user && data.token) {
      const userWithToken = { ...data.user, token: data.token };
      localStorage.setItem('currentUser', JSON.stringify(userWithToken));
    }

    return data;
  } catch (error) {
    console.error('Sign in error:', error);
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

// Helper functions for managing data synchronization
export const syncFavoritesFromLocalStorage = async () => {
  try {
    const user = localStorage.getItem('currentUser');
    if (!user) return;

    const parsedUser = JSON.parse(user);
    const localFavorites = localStorage.getItem(`favorites:${parsedUser.email}`);
    
    if (localFavorites) {
      const favorites = JSON.parse(localFavorites);
      
      // Add each favorite to the database
      for (const favorite of favorites) {
        try {
          await addToFavorites(favorite);
        } catch (error) {
          // Continue with other favorites if one fails
          console.warn('Failed to sync favorite:', favorite['product-title'], error);
        }
      }
      
      // Clear local storage after successful sync
      localStorage.removeItem(`favorites:${parsedUser.email}`);
    }
  } catch (error) {
    console.error('Error syncing favorites from localStorage:', error);
  }
};

export const syncCartFromLocalStorage = async () => {
  try {
    const user = localStorage.getItem('currentUser');
    if (!user) return;

    const parsedUser = JSON.parse(user);
    const localCart = localStorage.getItem(`cart:${parsedUser.email}`) || 
                     localStorage.getItem('guestCart');
    
    if (localCart) {
      const cartItems = JSON.parse(localCart);
      
      if (cartItems.length > 0) {
        await syncCart(cartItems);
        
        // Clear local storage after successful sync
        localStorage.removeItem(`cart:${parsedUser.email}`);
        localStorage.removeItem('guestCart');
      }
    }
  } catch (error) {
    console.error('Error syncing cart from localStorage:', error);
  }
};
import { API_BASE_URL } from './client.js';

// ✅ SIGN UP (REGISTER)
export async function signUpUser(data = {}) {
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
  }
  
  // ✅ SIGN IN (LOGIN)
  export async function signInUser(data = {}) {
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
  }
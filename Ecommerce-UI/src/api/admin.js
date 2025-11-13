import { API_BASE_URL } from './client.js';

// ================================
// 🔐 Helper: Get admin auth token
// ================================
const getAdminToken = () => {
  const admin = localStorage.getItem('currentAdmin');
  if (admin) {
    try {
      const parsed = JSON.parse(admin);
      return parsed.token;
    } catch (err) {
      console.error('Error parsing admin token:', err);
      localStorage.removeItem('currentAdmin');
      return null;
    }
  }
  return null;
};

// Helper to check admin auth
export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  return !!token;
};

// Helper to get current admin
export const getCurrentAdmin = () => {
  const admin = localStorage.getItem('currentAdmin');
  if (admin) {
    try {
      return JSON.parse(admin);
    } catch (err) {
      console.error('Error parsing admin:', err);
      localStorage.removeItem('currentAdmin');
      return null;
    }
  }
  return null;
};

// Unified API caller for admin endpoints
const adminApiCall = async (url, options = {}) => {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('currentAdmin');
        throw new Error('Session expired. Please log in again.');
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Error ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Admin API error:', err);
    throw err;
  }
};

//
// ================================
// 👤 ADMIN AUTH
// ================================
//

// Admin Login
export const adminLogin = async (credentials) => {
  const res = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Login failed');
  }

  const json = await res.json();
  if (json.admin && json.token) {
    const adminWithToken = { ...json.admin, token: json.token };
    localStorage.setItem('currentAdmin', JSON.stringify(adminWithToken));
  }

  return json;
};

// Logout admin
export const adminLogout = () => {
  localStorage.removeItem('currentAdmin');
};

//
// ================================
// 👥 USER MANAGEMENT
// ================================
//

// Get all users
export const getAllUsers = async () => {
  return await adminApiCall(`${API_BASE_URL}/api/admin/users`);
};

// Get single user by ID
export const getUserById = async (userId) => {
  return await adminApiCall(`${API_BASE_URL}/api/admin/users/${userId}`);
};

// Update user role/permissions
export const updateUserRole = async (userId, role, permissions) => {
  return await adminApiCall(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role, permissions }),
  });
};

// Change user status
export const changeUserStatus = async (userId, status) => {
  return await adminApiCall(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};

// Delete user
export const deleteUser = async (userId) => {
  return await adminApiCall(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
};

//
// ================================
// 📦 ORDERS MANAGEMENT
// ================================
//

// Get all orders (from all users)
export const getAllOrders = async () => {
  return await adminApiCall(`${API_BASE_URL}/api/admin/orders`);
};

// Update order status
export const updateOrderStatus = async (userId, orderId, data) => {
  return await adminApiCall(
    `${API_BASE_URL}/api/admin/orders/${userId}/${orderId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};

//
// ================================
// 🏗️ BULK ORDERS MANAGEMENT
// ================================
//

// Get all bulk orders
export const getAllBulkOrders = async () => {
  return await adminApiCall(`${API_BASE_URL}/api/admin/bulk-orders`);
};

// Update bulk order status
export const updateBulkOrderStatus = async (userId, bulkOrderId, data) => {
  return await adminApiCall(
    `${API_BASE_URL}/api/admin/bulk-orders/${userId}/${bulkOrderId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
};

//
// ================================
// 📊 REPORTS (Optional)
// ================================
//

// Get system summary stats
export const getAdminReports = async (url = `${API_BASE_URL}/api/admin/reports`) => {
  return await adminApiCall(url);
};

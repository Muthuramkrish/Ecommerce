export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com' 
  : 'http://localhost:5000';
  

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/api/productList${query ? `?${query}` : ''}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  const json = await response.json();
  return Array.isArray(json?.data) ? json.data : [];
}

export async function fetchAllProducts() {
  const response = await fetch(`${API_BASE_URL}/api/productList?all=true`);
  if (!response.ok) {
    throw new Error(`Failed to fetch all products: ${response.status}`);
  }
  const json = await response.json();
  return Array.isArray(json?.data) ? json.data : [];
}

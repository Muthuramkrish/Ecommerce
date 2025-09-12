export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/productList${query ? `?${query}` : ''}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }
  const json = await response.json();
  console.log(json);
  return Array.isArray(json?.data) ? json.data : [];
}

export async function fetchAllProducts() {
  const response = await fetch('/api/productList?all=true');
  if (!response.ok) {
    throw new Error(`Failed to fetch all products: ${response.status}`);
  }
  const json = await response.json();
  console.log(json);
  return Array.isArray(json?.data) ? json.data : [];
}



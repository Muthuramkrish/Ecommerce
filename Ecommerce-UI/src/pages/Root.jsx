import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Home from './Home';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard.jsx';
import LoginPage from './LoginPage';
import CategoryListPage from './CategoryListPage';
import ProductDetailsPage from './ProductDetailsPage';
import FavoritesPage from './FavoritesPage';
import About from './About';
import Contact from './Contact';
import BulkOrderPage from './BulkOrderPage';
import HelpCenter from './HelpCenter';
import Returns from './Returns';
import ShippingInfo from './ShippingInfo';
import TrackOrder from './TrackOrder';
import Warranty from './Warranty';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';
import OrdersPage from './OrdersPage';
import LoadingPage from '../components/LoadingPage';
import { fetchAllProducts } from '../api/client';
import { 
  addToFavorites as apiAddToFavorites,
  removeFromFavorites as apiRemoveFromFavorites,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
  getUserData,
  getCart,
  getFavorites,
  syncCart as apiSyncCart
} from '../api/user.js';

function Root() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) return null;
      
      const parsedUser = JSON.parse(storedUser);
      
      // Basic validation of stored user data
      if (!parsedUser.token || !parsedUser.email) {
        console.warn('Invalid user data in localStorage, clearing');
        localStorage.removeItem('currentUser');
        return null;
      }
      
      return parsedUser;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('currentUser');
      return null;
    }
  });
  const [cartItems, setCartItems] = useState(() => {
    // Initialize cart from localStorage for guest users
    try {
      const guestCart = localStorage.getItem('guestCart');
      if (guestCart) {
        return JSON.parse(guestCart);
      }
    } catch (error) {
      console.error('Error loading guest cart from localStorage:', error);
    }
    return [];
  });
  const [showCartPage, setShowCartPage] = useState(false);
  const [showCheckoutPage, setShowCheckoutPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [selectedCategoryForList, setSelectedCategoryForList] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailsPage, setShowProductDetailsPage] = useState(false);
  const [showFavoritesPage, setShowFavoritesPage] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false); // Add About page state
  const [showContactPage, setShowContactPage] = useState(false); // Add Contact page state
  const [showBulkOrderPage, setShowBulkOrderPage] = useState(false); // Add BulkOrderPage state
  const [showHelpCenterPage, setShowHelpCenterPage] = useState(false);
  const [showReturnsPage, setShowReturnsPage] = useState(false);
  const [showShippingInfoPage, setShowShippingInfoPage] = useState(false);
  const [showTrackOrderPage, setShowTrackOrderPage] = useState(false);
  const [showWarrantyPage, setShowWarrantyPage] = useState(false);
  const [showTermsOfServicePage, setShowTermsOfServicePage] = useState(false);
  const [showPrivacyPolicyPage, setShowPrivacyPolicyPage] = useState(false);
  const [showOrdersPage, setShowOrdersPage] = useState(false);
  const [previousPage, setPreviousPage] = useState('home');
  const [initialCategoryFilters, setInitialCategoryFilters] = useState({ brand: [], subcategory: [], subSubcategory: [], productType: [] });
  const [rawSource, setRawSource] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [postLoginTarget, setPostLoginTarget] = useState(null); // 'checkout' | 'favorites' | null
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });

  // --- Hash navigation helpers ---
  const slugify = (text) => {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  const setHash = (hash) => {
    if (window && window.location) {
      const newHash = hash.startsWith('#') ? hash : `#${hash}`;
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      } else {
        // Force navigation on same-hash actions (optional: dispatch event)
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }
  };

  const navigateFromHash = () => {
    const raw = (window.location.hash || '').replace(/^#/, '');
    const [route, ...rest] = raw.split('/');

    // Reset base UI state
    setShowCartPage(false);
    setShowCheckoutPage(false);
    setIsLoginOpen(false);
    setShowFavoritesPage(false);
    setShowCategoryList(false);
    setSelectedCategoryForList('');
    setShowProductDetailsPage(false);
    setSelectedProduct(null);
    setShowAboutPage(false); // Reset About page state
    setShowContactPage(false); // Reset Contact page state
    setShowBulkOrderPage(false); // Reset BulkOrderPage state
    setShowHelpCenterPage(false);
    setShowReturnsPage(false);
    setShowShippingInfoPage(false);
    setShowTrackOrderPage(false);
    setShowWarrantyPage(false);
    setShowTermsOfServicePage(false);
    setShowPrivacyPolicyPage(false);
    setShowOrdersPage(false);

    switch (route) {
      case 'cart':
        setShowCartPage(true);
        break;
      case 'checkout':
        setShowCheckoutPage(true);
        break;
      case 'login':
        setIsLoginOpen(true);
        break;
      case 'favorites':
        setShowFavoritesPage(true);
        break;
      case 'about': // Add About route
        setShowAboutPage(true);
        break;
      case 'contact': // Add Contact route
        setShowContactPage(true);
        break;
      case 'bulk-order': // Add Bulk Order route
      case 'bulk-orders': // Consolidated bulk orders route
        setShowBulkOrderPage(true);
        break;
      case 'help':
        setShowHelpCenterPage(true);
        break;
      case 'returns':
        setShowReturnsPage(true);
        break;
      case 'shipping':
        setShowShippingInfoPage(true);
        break;
      case 'track-order':
        setShowTrackOrderPage(true);
        break;
      case 'warranty':
        setShowWarrantyPage(true);
        break;
      case 'terms':
        setShowTermsOfServicePage(true);
        break;
      case 'privacy':
        setShowPrivacyPolicyPage(true);
        break;
      case 'orders':
        setShowOrdersPage(true);
        break;
      case 'category': {
        const categoryParam = rest[0] || '';
        const categoryName = decodeURIComponent(categoryParam.replace(/-/g, ' '));
        if (categoryName) {
          setSelectedCategoryForList(categoryName);
          // Parse optional filter segment: /filter/<type>/<value>
          if (rest[1] === 'filter' && rest.length >= 4) {
            const type = rest[2];
            const valueParam = rest[3];
            const value = decodeURIComponent(valueParam || '');
            const next = { brand: [], subcategory: [], subSubcategory: [], productType: [] };
            if (type === 'brand') next.brand = [value];
            if (type === 'subcategory') next.subcategory = [value];
            if (type === 'sub-subcategory') next.subSubcategory = [value];
            if (type === 'product-type') next.productType = [value];
            setInitialCategoryFilters(next);
          } else {
            setInitialCategoryFilters({ brand: [], subcategory: [], subSubcategory: [], productType: [] });
          }
          setShowCategoryList(true);
        }
        break;
      }
      case 'subcategory': {
        const subcategoryName = decodeURIComponent((rest[0] || '').replace(/-/g, ' '));
        if (subcategoryName) {
          setSelectedCategoryForList(subcategoryName);
          setShowCategoryList(true);
        }
        break;
      }
      case 'sub-subcategory': {
        const subSubcategoryName = decodeURIComponent((rest[0] || '').replace(/-/g, ' '));
        if (subSubcategoryName) {
          setSelectedCategoryForList(subSubcategoryName);
          setShowCategoryList(true);
        }
        break;
      }
      case 'brand': {
        const brandName = decodeURIComponent((rest[0] || '').replace(/-/g, ' '));
        if (brandName) {
          setSelectedCategoryForList(brandName);
          setShowCategoryList(true);
        }
        break;
      }
      case 'manufacturer': {
        const manufacturerName = decodeURIComponent((rest[0] || '').replace(/-/g, ' '));
        if (manufacturerName) {
          setSelectedCategoryForList(manufacturerName);
          setShowCategoryList(true);
        }
        break;
      }
      case 'product-type': {
        const productTypeName = decodeURIComponent((rest[0] || '').replace(/-/g, ' '));
        if (productTypeName) {
          setSelectedCategoryForList(productTypeName);
          setShowCategoryList(true);
        }
        break;
      }
      case 'product': {
        const categoryParam = rest[0] || '';
        const productId = rest[1] || '';
        const productSlug = rest[2] || '';

        if (products.length) {
          const found = products.find(p => {
            const matchId = productId && (p.raw?.identifiers?.productId === productId || String(p.id) === productId);
            const matchSlug = (p.raw?.identifiers?.slug || slugify(p['product-title'])) === productSlug;
            return matchId && matchSlug;
          });

          if (found) {
            setSelectedProduct(found);
            setShowProductDetailsPage(true);
          }
        }
        break;
      }
      case 'home':
      default:
        // Home/reset
        setInitialCategoryFilters({ brand: [], subcategory: [], subSubcategory: [], productType: [] });
        break;
    }
    // Scroll to top after navigation
    scrollToTop();
  };

  const showToast = (message, type = 'info', durationMs = 2500) => {
    setToast({ message, type, visible: true });
    window.clearTimeout(showToast._tid);
    showToast._tid = window.setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, Math.max(1000, durationMs));
  };

  // Load user data (cart and favorites) from database
  const loadUserData = async () => {
    if (!currentUser?.token || !isValidToken(currentUser.token)) {
      console.warn('No valid token available for loading user data');
      return;
    }
    
    try {
      setIsLoadingUserData(true);
      
      // Try to get all user data at once
      try {
        const userData = await getUserData();
        if (userData.cart) setCartItems(userData.cart);
        if (userData.favorites) setFavorites(userData.favorites);
      } catch (error) {
        // Check if it's an authentication error
        if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
          console.warn('Authentication error, clearing user session:', error.message);
          handleTokenExpired();
          return;
        }
        
        // Fallback to individual API calls if getUserData doesn't exist
        console.warn('getUserData not available, using individual calls:', error);
        
        const [cartResponse, favoritesResponse] = await Promise.allSettled([
          getCart().catch(err => {
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
              throw err; // Re-throw auth errors
            }
            return { cart: [] };
          }),
          getFavorites().catch(err => {
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
              throw err; // Re-throw auth errors
            }
            return { favorites: [] };
          })
        ]);
        
        if (cartResponse.status === 'fulfilled' && cartResponse.value?.cart) {
          setCartItems(cartResponse.value.cart);
        }
        
        if (favoritesResponse.status === 'fulfilled' && favoritesResponse.value?.favorites) {
          setFavorites(favoritesResponse.value.favorites);
        }
        
        // Check if any of the fallback calls failed with auth error
        if (cartResponse.status === 'rejected' || favoritesResponse.status === 'rejected') {
          const authError = [cartResponse.reason, favoritesResponse.reason]
            .find(err => err?.message?.includes('401') || err?.message?.includes('Unauthorized'));
          if (authError) {
            console.warn('Authentication error in fallback calls:', authError.message);
            handleTokenExpired();
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
        handleTokenExpired();
      }
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // Handle expired or invalid token
  const handleTokenExpired = () => {
    console.log('Token expired or invalid, logging out user');
    setCurrentUser(null);
    setCartItems([]);
    setFavorites([]);
    localStorage.removeItem('currentUser');
    
    // Don't show toast if user is already on login page or home
    if (!isLoginOpen && (showCartPage || showFavoritesPage || showCheckoutPage)) {
      showToast('Your session has expired. Please login again.', 'warning');
      setShowCartPage(false);
      setShowFavoritesPage(false);
      setShowCheckoutPage(false);
      setHash('home');
      scrollToTop();
    }
  };

  // Check if JWT token is expired (optional - basic check)
  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token has expired
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      console.warn('Error checking token expiration:', error);
      return true; // Assume expired if we can't parse it
    }
  };

  const getProductCategory = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('led') || titleLower.includes('bulb') || titleLower.includes('light')) {
      return 'LED Lighting';
    }
    if (titleLower.includes('wire') || titleLower.includes('cable')) {
      return 'Wires & Cables';
    }
    if (titleLower.includes('switch') || titleLower.includes('regulator')) {
      return 'Switches & Sockets';
    }
    if (titleLower.includes('drill') || titleLower.includes('kettle') || titleLower.includes('heater')) {
      return 'Home Appliances';
    }
    if (titleLower.includes('extension') || titleLower.includes('board')) {
      return 'Circuit Protection';
    }
    return 'General';
  };

  const mapRawToDisplayProduct = (p) => {
    const title = p?.characteristics?.title || 'Untitled Product';
    const imageUrl = p?.characteristics?.images?.primary?.[0]
      || 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400';
    const basePrice = p?.pricing?.basePrice ?? 0;
    const comparePrice = p?.pricing?.comparePrice ?? basePrice;
    const categoryFromData = p?.anchor?.subcategory || p?.anchor?.category || getProductCategory(title);
    return {
      'product-id': p._id || p.id,
      'product-title': title,
      'image-url': imageUrl,
      'old-price': String(comparePrice),
      'new-price': String(basePrice),
      category: categoryFromData,
      rating: Math.floor(Math.random() * 2) + 4,
      reviews: Math.floor(Math.random() * 100) + 10,
      raw: p
    };
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllProducts();
        if (!isMounted) return;
        setRawSource(Array.isArray(data) ? data : []);
        const loadedProducts = (Array.isArray(data) ? data : []).map(mapRawToDisplayProduct);
        setProducts(loadedProducts);
        setFilteredProducts(loadedProducts);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load products:', error);
        if (!isMounted) return;
        setRawSource([]);
        setProducts([]);
        setFilteredProducts([]);
        setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // React to hash on first load and when it changes
  useEffect(() => {
    navigateFromHash();
    const handler = () => navigateFromHash();
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Validate token format (basic check)
  const isValidToken = (token) => {
    if (!token || typeof token !== 'string') return false;
    // Basic JWT format check (should have 3 parts separated by dots)
    const parts = token.split('.');
    return parts.length === 3;
  };

  // Save guest cart to localStorage whenever cartItems changes and user is not logged in
  useEffect(() => {
    if (!currentUser) {
      try {
        localStorage.setItem('guestCart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving guest cart to localStorage:', error);
      }
    }
  }, [cartItems, currentUser]);

  // Load user data when user is available (on page load or login)
  useEffect(() => {
    if (currentUser?.token) {
      if (!isValidToken(currentUser.token)) {
        // Invalid token format, clear user session
        console.warn('Invalid token format detected, clearing session');
        handleTokenExpired();
        return;
      }
      
      if (isTokenExpired(currentUser.token)) {
        // Token has expired, clear user session
        console.warn('Token has expired, clearing session');
        handleTokenExpired();
        return;
      }
      
      // Token is valid, load user data
      loadUserData();
    } else {
      // Clear server-side data when user logs out, but keep guest cart
      setFavorites([]);
      // Don't clear cartItems here as it should persist for guest users
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.token]);


  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product['product-title'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product =>
        product.category && product.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  const subcategories = useMemo(() => {
    const summaries = new Map();
    for (const p of rawSource) {
      const sub = p?.anchor?.subcategory;
      // Skip products without a proper subcategory
      if (!sub || typeof sub !== 'string' || sub.trim() === '') {
        continue;
      }
      const firstImage = p?.characteristics?.images?.primary?.[0]
        || 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300';
      if (!summaries.has(sub)) {
        summaries.set(sub, {
          id: sub.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          name: sub,
          image: firstImage,
          productCount: 0
        });
      }
      const s = summaries.get(sub);
      s.productCount += 1;
    }
    return Array.from(summaries.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [rawSource]);

  const menuTree = useMemo(() => {
    const categoryMap = new Map();
    for (const p of rawSource) {
      const a = (p && p.anchor) || {};
      const categoryName = a.category;
      const subcategoryName = a.subcategory || null;
      const subSubcategoryName = a.subSubcategory || null;

      // Skip products without a proper category
      if (!categoryName || typeof categoryName !== 'string' || categoryName.trim() === '') {
        continue;
      }

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, new Map());
      }
      const subMap = categoryMap.get(categoryName);
      if (subcategoryName) {
        if (!subMap.has(subcategoryName)) {
          subMap.set(subcategoryName, new Set());
        }
        if (subSubcategoryName) {
          subMap.get(subcategoryName).add(subSubcategoryName);
        }
      }
    }

    // Convert to arrays for easier rendering
    return Array.from(categoryMap.entries()).map(([category, subMap]) => ({
      name: category,
      children: Array.from(subMap.entries()).map(([subcategory, subSubs]) => ({
        name: subcategory,
        children: Array.from(subSubs.values()).map((n) => ({ name: n }))
      }))
    }));
  }, [rawSource]);

  const handleNavigateTaxonomy = (level, value) => {
    const allowed = new Set(['category', 'subcategory', 'sub-subcategory']);
    if (!allowed.has(level) || !value) return;
    setPreviousPage('home');
    setSelectedCategoryForList(value);
    
    // Set up appropriate filters based on the level
    const filters = { brand: [], subcategory: [], subSubcategory: [], productType: [] };
    if (level === 'sub-subcategory') {
      filters.subSubcategory = [value];
    } else if (level === 'subcategory') {
      filters.subcategory = [value];
    }
    // For category level, no specific filter needed as it's handled by selectedCategoryForList
    
    setInitialCategoryFilters(filters);
    setHash(`${level}/${encodeURIComponent(slugify(value))}`);
    scrollToTop();
  };

  const handleAddToCart = async (product, quantity = 1) => {
    if (!currentUser) {
      // Handle guest cart - store in localStorage
      const existingIndex = cartItems.findIndex(
        item => item['product-id'] === product['product-id'] || 
               item['product-title'] === product['product-title']
      );
      
      let newCartItems;
      if (existingIndex !== -1) {
        // Update existing item quantity
        newCartItems = [...cartItems];
        newCartItems[existingIndex] = {
          ...newCartItems[existingIndex],
          quantity: newCartItems[existingIndex].quantity + quantity
        };
      } else {
        // Add new item to cart
        const cartItem = {
          ...product,
          quantity: quantity
        };
        newCartItems = [...cartItems, cartItem];
      }
      
      setCartItems(newCartItems);
      showToast('Added to cart.', 'success');
      return;
    }

    try {
      const response = await apiAddToCart(product, quantity);
      setCartItems(response.cart);
      showToast('Added to cart.', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
      // Check if it's a stock-related error
      if (error.message?.includes('Only') && error.message?.includes('available in stock')) {
        showToast(error.message, 'warning');
      } else if (error.message?.includes('Cannot add') && error.message?.includes('items available')) {
        showToast(error.message, 'warning');
      } else if (error.message?.includes('Product not found')) {
        showToast('Product is not available.', 'warning');
      } else {
        // Use the specific error message from server, or fallback to generic message
        showToast(error.message || 'Failed to add to cart. Please try again.', 'warning');
      }
    }
  };

  const handleUpdateQuantity = async (index, quantity) => {
    if (!currentUser) {
      // Handle guest cart - update in localStorage
      if (quantity < 1) return;
      
      const newCartItems = [...cartItems];
      newCartItems[index] = {
        ...newCartItems[index],
        quantity: quantity
      };
      
      setCartItems(newCartItems);
      return;
    }

    try {
      const productId = cartItems[index]['product-id'] || cartItems[index]['product-title'];
      const response = await apiUpdateCartQuantity(productId, quantity);
      setCartItems(response.cart);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
      // Check if it's a stock-related error
      if (error.message?.includes('Only') && error.message?.includes('available in stock')) {
        showToast(error.message, 'warning');
      } else if (error.message?.includes('Cannot') && error.message?.includes('items available')) {
        showToast(error.message, 'warning');
      } else if (error.message?.includes('Product not found')) {
        showToast('Product is not available.', 'warning');
      } else {
        // Use the specific error message from server, or fallback to generic message
        showToast(error.message || 'Failed to update quantity. Please try again.', 'warning');
      }
    }
  };

  const handleRemoveItem = async (index) => {
    const removedTitle = cartItems[index]?.['product-title'] || 'Item';
    
    if (!currentUser) {
      // Handle guest cart - remove from localStorage
      const newCartItems = cartItems.filter((_, i) => i !== index);
      setCartItems(newCartItems);
      showToast(`${removedTitle} removed from cart.`, 'info');
      return;
    }

    try {
      const productId = cartItems[index]['product-id'] || cartItems[index]['product-title'];
      const response = await apiRemoveFromCart(productId);
      setCartItems(response.cart);
      showToast(`${removedTitle} removed from cart.`, 'info');
    } catch (error) {
      console.error('Error removing from cart:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
      showToast('Failed to remove item. Please try again.', 'warning');
    }
  };

  const handleCheckout = () => {
    if (currentUser) {
      setShowCheckoutPage(true);
      setHash('checkout');
      scrollToTop();
    } else {
      // For guest users, require login before checkout
      setPostLoginTarget('checkout');
      setIsLoginOpen(true);
      setHash('login');
      scrollToTop();
    }
  };

  const handleCartClick = () => {
    // Allow cart access for both logged in and guest users
    setShowCartPage(true);
    setHash('cart');
    scrollToTop();
  };

  const handleOrderComplete = async () => {
    if (!currentUser) {
      showToast('Please login to complete order.', 'warning');
      return;
    }

    try {
      await apiClearCart();
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
      // Still clear local state even if API call fails
      setCartItems([]);
    }
    
    setShowCheckoutPage(false);
    setHash('home');
    scrollToTop();
  };

  const handleBackFromCheckout = () => {
    setShowCheckoutPage(false);
    setShowCartPage(true);
    setHash('cart');
  };

  const handleLoginSuccess = async (userResponse) => {
    const user = {
      fullName: userResponse.fullName,
      email: userResponse.email,
      token: userResponse.token
    };
    
    setCurrentUser(user);
    setIsLoginOpen(false);
    
    // Handle guest cart migration to server
    const guestCartItems = [...cartItems]; // Save current guest cart
    
    // Set favorites and cart from login response if available
    if (userResponse.favorites) {
      setFavorites(userResponse.favorites);
    }
    if (userResponse.cart) {
      setCartItems(userResponse.cart);
    }
    
    // Sync guest cart with server cart if there are items in guest cart
    if (guestCartItems.length > 0) {
      try {
        const response = await apiSyncCart(guestCartItems);
        setCartItems(response.cart);
        showToast(`${guestCartItems.length} items from your cart have been synced.`, 'success');
      } catch (error) {
        console.error('Error syncing guest cart:', error);
        // If sync fails, keep the server cart but show a warning
        showToast('Some cart items could not be synced. Please check your cart.', 'warning');
      }
    }
    
    // Clean up guest cart from localStorage
    try {
      localStorage.removeItem(`favorites:${user.email}`);
      localStorage.removeItem(`cart:${user.email}`);
      localStorage.removeItem('guestCart');
      localStorage.removeItem('favorites');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    // Redirect to intended destination if any
    if (postLoginTarget === 'checkout') {
      setShowCheckoutPage(true);
      setPostLoginTarget(null);
      setHash('checkout');
      scrollToTop();
      return;
    }
    if (postLoginTarget === 'favorites') {
      setShowFavoritesPage(true);
      setPostLoginTarget(null);
      setHash('favorites');
      scrollToTop();
      return;
    }
    if (postLoginTarget === 'cart') {
      setShowCartPage(true);
      setPostLoginTarget(null);
      setHash('cart');
      scrollToTop();
      return;
    }
    if (postLoginTarget === 'orders') {
      setShowOrdersPage(true);
      setPostLoginTarget(null);
      setHash('orders');
      scrollToTop();
      return;
    }
    if (postLoginTarget === 'bulk-orders') {
      setShowBulkOrderPage(true);
      setPostLoginTarget(null);
      setHash('bulk-orders');
      scrollToTop();
      return;
    }
    setPostLoginTarget(null);
    setHash('home');
    scrollToTop();
  };

  const handleLoginClose = () => {
    setIsLoginOpen(false);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setHash('login');
    scrollToTop();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    
    // Clear user-specific data but keep guest cart
    setCartItems([]); // This will be repopulated from localStorage for guest users
    setFavorites([]);
    
    // If on protected pages, go home
    if (showFavoritesPage) {
      setShowFavoritesPage(false);
    }
    if (showCheckoutPage) {
      setShowCheckoutPage(false);
    }
    if (showOrdersPage) {
      setShowOrdersPage(false);
    }
    if (showBulkOrderPage) {
      setShowBulkOrderPage(false);
    }
    // Don't close cart page on logout - allow guest to continue shopping
    
    setHash('home');
    scrollToTop();
  };

  const handleAddToWishlist = async (product) => {
    if (!currentUser) {
      showToast('Please login to add items to your wishlist.', 'warning');
      setPostLoginTarget('favorites');
      setIsLoginOpen(true);
      setHash('login');
      scrollToTop();
      return;
    }

    try {
      const isAlreadyFavorite = favorites.find(fav => 
        fav['product-id'] === product['product-id'] || 
        fav['product-title'] === product['product-title']
      );
      
      if (isAlreadyFavorite) {
        // Remove from favorites
        const response = await apiRemoveFromFavorites(product['product-id']);
        setFavorites(response.favorites);
        showToast('Removed from wishlist.', 'info');
      } else {
        // Add to favorites
        const response = await apiAddToFavorites(product);
        setFavorites(response.favorites);
        showToast('Added to wishlist.', 'success');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
      showToast('Failed to update wishlist. Please try again.', 'warning');
    }
  };

  const handleFavoritesClick = () => {
    if (!currentUser) {
      setPostLoginTarget('favorites');
      setIsLoginOpen(true);
      setHash('login');
      scrollToTop();
      return;
    }
    setPreviousPage('home');
    setShowFavoritesPage(true);
    setHash('favorites');
    scrollToTop();
  };

  // Add navigation handlers for About, Contact, and Bulk Order
  const handleAboutClick = () => {
    setShowAboutPage(true);
    setHash('about');
    scrollToTop();
  };

  const handleContactClick = () => {
    setShowContactPage(true);
    setHash('contact');
    scrollToTop();
  };

  const handleBulkOrderClick = () => {
    setShowBulkOrderPage(true);
    setHash('bulk-orders');
    scrollToTop();
  };

  const handleBackFromAbout = () => {
    setShowAboutPage(false);
    setHash('home');
    scrollToTop();
  };

  const handleBackFromContact = () => {
    setShowContactPage(false);
    setHash('home');
    scrollToTop();
  };

  // Customer Service: navigation handlers
  const handleHelpCenterClick = () => {
    setShowHelpCenterPage(true);
    setHash('help');
    scrollToTop();
  };
  const handleReturnsClick = () => {
    setShowReturnsPage(true);
    setHash('returns');
    scrollToTop();
  };
  const handleShippingInfoClick = () => {
    setShowShippingInfoPage(true);
    setHash('shipping');
    scrollToTop();
  };
  const handleTrackOrderClick = () => {
    setShowTrackOrderPage(true);
    setHash('track-order');
    scrollToTop();
  };
  const handleWarrantyClick = () => {
    setShowWarrantyPage(true);
    setHash('warranty');
    scrollToTop();
  };
  const handleTermsOfServiceClick = () => {
    setShowTermsOfServicePage(true);
    setHash('terms');
    scrollToTop();
  };
  const handlePrivacyPolicyClick = () => {
    setShowPrivacyPolicyPage(true);
    setHash('privacy');
    scrollToTop();
  };

  const handleOrdersClick = () => {
    if (!currentUser) {
      setPostLoginTarget('orders');
      setIsLoginOpen(true);
      setHash('login');
      scrollToTop();
      return;
    }
    setShowOrdersPage(true);
    setHash('orders');
    scrollToTop();
  };

  const handleBulkOrdersClick = () => {
    if (!currentUser) {
      setPostLoginTarget('bulk-orders');
      setIsLoginOpen(true);
      setHash('login');
      scrollToTop();
      return;
    }
    setShowBulkOrderPage(true);
    setHash('bulk-orders');
    scrollToTop();
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSelectedCategory('');
      setShowCategoryList(false);
      setSelectedCategoryForList('');
      setHash('home');
    }
  };

  const handleCategorySelect = (category) => {
    setPreviousPage('home');
    setSelectedCategoryForList(category);
    setShowCategoryList(true);
    setSearchQuery('');
    setSelectedCategory('');
    setHash(`category/${encodeURIComponent(slugify(category))}`);
    scrollToTop();
  };

  const handleReturnToHome = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowCategoryList(false);
    setSelectedCategoryForList('');
    setShowFavoritesPage(false);
    setShowProductDetailsPage(false);
    setShowCartPage(false);
    setShowCheckoutPage(false);
    setIsLoginOpen(false);
    setShowAboutPage(false); // Reset About page
    setShowContactPage(false); // Reset Contact page
    setShowBulkOrderPage(false); // Reset BulkOrderPage
    setShowTermsOfServicePage(false); // Reset Terms page
    setShowPrivacyPolicyPage(false); // Reset Privacy page
    setShowOrdersPage(false); // Reset Orders page
    setHash('home');
    scrollToTop();
  };

  const handleBackFromCategoryList = () => {
    setShowCategoryList(false);
    setSelectedCategoryForList('');
    setHash('home');
    scrollToTop();
  };

  const handleOpenProductDetailsPage = (product) => {
    // Track the current page before navigating to product details
    if (showCartPage) {
      setPreviousPage('cart');
    } else if (showFavoritesPage) {
      setPreviousPage('favorites');
    } else if (showCategoryList) {
      setPreviousPage('category');
    } else {
      setPreviousPage('home');
    }
    setSelectedProduct(product);
    setShowProductDetailsPage(true);
    const productId = product.raw?.identifiers?.productId || product.id || '';
    const productSlug = product.raw?.identifiers?.slug || slugify(product['product-title']);
    const productCategory = product.category
      ? slugify(product.category)
      : slugify(product.raw?.anchor?.category || 'general');
    // Final URL format: product/<category>/<id>/<slug>
    setHash(`product/${productCategory}/${productId}/${productSlug}`);
    scrollToTop();
  };

  const handleBackFromProductDetails = () => {
    setShowProductDetailsPage(false);
    setSelectedProduct(null);
    // Navigate back to the previous page
    if (previousPage === 'cart') {
      setShowCartPage(true);
      setHash('cart');
    } else if (previousPage === 'favorites') {
      setShowFavoritesPage(true);
      setHash('favorites');
    } else if (previousPage === 'category') {
      setShowCategoryList(true);
      setHash(`category/${encodeURIComponent(slugify(selectedCategoryForList))}`);
    } else {
      setHash('home');
    }
    scrollToTop();
  };

  const handleClearCart = async () => {
    if (!currentUser) {
      // Handle guest cart - clear localStorage
      setCartItems([]);
      showToast('Cart cleared successfully.', 'success');
      setHash('home');
      scrollToTop();
      return;
    }

    try {
      await apiClearCart();
      setCartItems([]);
      showToast('Cart cleared successfully.', 'success');
      setHash('home');
      scrollToTop();
    } catch (error) {
      console.error('Error clearing cart:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
      showToast('Failed to clear cart. Please try again.', 'warning');
    }
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getGridTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (selectedCategory) {
      return selectedCategory;
    }
    return 'Featured Products';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.visible && (
        <div
          className={`fixed top-4 right-4 z-[1000] px-4 py-3 rounded shadow-lg text-white text-sm md:text-base transition-opacity ${
            toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-yellow-600' : 'bg-gray-800'
          }`}
        >
          {toast.message}
        </div>
      )}
      {isLoading ? (
        <LoadingPage 
          message="Loading your electrical store..." 
          showProgress={false}
        />
      ) : (
        <>
          {!isLoginOpen && (
        <Header
          cartItemCount={getTotalCartItems()}
          favoritesCount={favorites.length}
          onCartClick={handleCartClick}
          onSearchChange={handleSearchChange}
          searchQuery={searchQuery}      
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          onFavoritesClick={handleFavoritesClick}
          onOrdersClick={handleOrdersClick}
          onBulkOrdersClick={handleBulkOrdersClick}
          onLogoClick={handleReturnToHome}
          onHomeClick={handleReturnToHome}
          onAboutClick={handleAboutClick}
          onContactClick={handleContactClick}
          onBulkOrderClick={handleBulkOrderClick}
          menuTree={menuTree}
          onNavigateTaxonomy={handleNavigateTaxonomy}
          isLoggedIn={!!currentUser}
          currentUser={currentUser || undefined}
        />
      )}
      <main className={isLoginOpen ? "" : "pt-14 xs:pt-16 lg:pt-20"}>
        {isLoginOpen ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
          />
        ) : showAboutPage ? (
          <About />
        ) : showContactPage ? (
          <Contact />
        ) : showBulkOrderPage ? (
          <BulkOrderPage 
            onBack={() => {
              setShowBulkOrderPage(false);
              setHash('home');
              scrollToTop();
            }}
          />
        ) : showHelpCenterPage ? (
          <HelpCenter />
        ) : showReturnsPage ? (
          <Returns />
        ) : showShippingInfoPage ? (
          <ShippingInfo />
        ) : showTrackOrderPage ? (
          <TrackOrder />
        ) : showWarrantyPage ? (
          <Warranty />
        ) : showTermsOfServicePage ? (
          <TermsOfService 
            onBack={() => {
              setShowTermsOfServicePage(false);
              setHash('home');
              scrollToTop();
            }}
          />
        ) : showPrivacyPolicyPage ? (
          <PrivacyPolicy 
            onBack={() => {
              setShowPrivacyPolicyPage(false);
              setHash('home');
              scrollToTop();
            }}
          />
        ) : showOrdersPage ? (
          <OrdersPage 
            onBack={() => {
              setShowOrdersPage(false);
              setHash('home');
              scrollToTop();
            }}
          />
        ) : showCartPage ? (
          <CartPage
            items={cartItems}
            onBack={() => setShowCartPage(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onLoginClick={handleLoginClick}
            onCheckout={handleCheckout}
            onOpenDetails={handleOpenProductDetailsPage}
            clearCart={handleClearCart}
            isGuestUser={!currentUser}
          />
        ) : showCheckoutPage ? (
          <CheckoutPage
            items={cartItems}
            onOrderComplete={handleOrderComplete}
            onBack={handleBackFromCheckout}
          />
        ) : showFavoritesPage ? (
          <FavoritesPage
            favorites={favorites}
            onBack={() => {
              setShowFavoritesPage(false);
              setHash('home');
              scrollToTop();
            }}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            onOpenDetails={handleOpenProductDetailsPage}
          />
        ) : showProductDetailsPage && selectedProduct ? (
          <ProductDetailsPage
            product={selectedProduct}
            onBack={handleBackFromProductDetails}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            favorites={favorites}
            cartItems={cartItems}
          />
        ) : showCategoryList ? (
          <CategoryListPage
            category={selectedCategoryForList}
            products={products.filter(product => {
              const p = product.raw || {};
              const a = p.anchor || {};
              const target = slugify(selectedCategoryForList || '');
              const matchesCategory = product.category && slugify(product.category) === target;
              const matchesTopCategory = a.category && slugify(a.category) === target;
              const matchesSubcategory = slugify(a.subcategory || '') === target;
              const matchesSubSubcategory = slugify(a.subSubcategory || '') === target;
              const matchesBrand = slugify(a.brand || '') === target;
              const matchesManufacturer = slugify(a.manufacturer || '') === target;
              const matchesProductType = slugify(a.productType || '') === target;
              return matchesCategory || matchesTopCategory || matchesSubcategory || matchesSubSubcategory || matchesBrand || matchesManufacturer || matchesProductType;
            })}
            onBack={handleBackFromCategoryList}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            onOpenDetails={handleOpenProductDetailsPage}
            favorites={favorites}
            initialFilters={initialCategoryFilters}
          />
        ) : (
          <>
            {!searchQuery && !selectedCategory && (
              <Home
                products={products
                  .filter(p => {
                    const oldP = parseFloat(p['old-price']);
                    const newP = parseFloat(p['new-price']);
                    if (!isFinite(oldP) || oldP <= 0) return false;
                    if (!isFinite(newP) || newP <= 0) return false;
                    const disc = Math.round(((oldP - newP) / oldP) * 100);
                    return disc >= 20;
                  })
                  .slice(0, 12)}
                allProducts={products}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                onCategorySelect={handleCategorySelect}
                onOpenDetails={handleOpenProductDetailsPage}
                favorites={favorites}
                categories={subcategories}
              />
            )}
            {(searchQuery || selectedCategory) && (
              <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                      <button
                        onClick={handleReturnToHome}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base"
                      >
                        <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back</span>
                      </button>
                      <h1 className="text-lg font-semibold text-gray-900">{getGridTitle()}</h1>
                      <div className="w-32" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 sm:py-8">
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 xs:gap-4 sm:gap-5 lg:gap-6 items-stretch">
                    {filteredProducts.map((product, index) => (
                      <div
                        key={`${product['product-id'] || product['product-title']}-${index}`}
                        className="cursor-pointer h-full"
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onAddToWishlist={handleAddToWishlist}
                          isFavorite={favorites.some((fav) => 
                            fav['product-id'] === product['product-id'] || 
                            fav['product-title'] === product['product-title']
                          )}
                          onOpenDetails={handleOpenProductDetailsPage}
                          className="h-full flex flex-col" // <- ensure card fills height
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
       </main>
       {!isLoginOpen && (
         <Footer 
           onHomeClick={handleReturnToHome}
           onCategoriesClick={() => {
             // Go home then smooth scroll to categories
             setHash('home');
             setTimeout(() => {
               const el = document.getElementById('categories');
               if (el) {
                 el.scrollIntoView({ behavior: 'smooth' });
               }
             }, 0);
           }}
           onFeaturedClick={() => {
             // Navigate home; product grid is within Home. Smooth scroll to it.
             setHash('home');
             setTimeout(() => {
               const el = document.getElementById('products');
               if (el) {
                 el.scrollIntoView({ behavior: 'smooth' });
               }
             }, 0);
           }}
           onAboutClick={handleAboutClick}
           onContactClick={handleContactClick}
           onHelpClick={handleHelpCenterClick}
           onReturnsClick={handleReturnsClick}
           onShippingClick={handleShippingInfoClick}
           onTrackOrderClick={handleTrackOrderClick}
           onWarrantyClick={handleWarrantyClick}
           onBulkOrderClick={handleBulkOrderClick}
           onPrivacyPolicyClick={handlePrivacyPolicyClick}
           onTermsOfServiceClick={handleTermsOfServiceClick}
         />
       )}
         </>
       )}
     </div>
   );
 }

export default Root;
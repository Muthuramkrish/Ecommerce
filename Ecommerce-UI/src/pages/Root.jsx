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
import BulkOrderForm from './BulkOrderForm';
import BulkOrders from './BulkOrders';
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
import AddressesPage from './AddressesPage';
import CompanyAddressesPage from './CompanyAddressesPage';

// Admin Panel Imports
import AdminLayout from '../admin/AdminLayout';
import AdminDashboard from '../admin/AdminDashboard';
import AdminOrders from '../admin/AdminOrders';
import AdminProducts from '../admin/AdminProducts';
import AdminUsers from '../admin/AdminUsers';
import AdminReports from '../admin/AdminReports';


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
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [showContactPage, setShowContactPage] = useState(false);
  const [showBulkOrderPage, setShowBulkOrderPage] = useState(false);
  const [showBulkOrderForm, setShowBulkOrderForm] = useState(false);
  const [showAddressesPage, setShowAddressesPage] = useState(false);
  const [showCompanyAddressesPage, setShowCompanyAddressesPage] = useState(false);
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
  const [postLoginTarget, setPostLoginTarget] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
  
  // Admin Panel State
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminCurrentPage, setAdminCurrentPage] = useState('dashboard');

  const slugify = (text) => {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

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
    setShowAboutPage(false);
    setShowContactPage(false);
    setShowBulkOrderForm(false);
    setShowBulkOrderPage(false);
    setShowHelpCenterPage(false);
    setShowReturnsPage(false);
    setShowShippingInfoPage(false);
    setShowTrackOrderPage(false);
    setShowWarrantyPage(false);
    setShowTermsOfServicePage(false);
    setShowPrivacyPolicyPage(false);
    setShowOrdersPage(false);
    setShowAdminPanel(false);
  
    // ✅ Admin routes - handle first with silent protection
    if (route === 'admin') {
      // Check if user is logged in
      if (!currentUser) {
        // Silent redirect to login
        setPostLoginTarget('admin');
        setIsLoginOpen(true);
        setHash('login');
        scrollToTop();
        return;
      }

      // Check if user has admin role
      if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        // Silent redirect to home for non-admin users
        setHash('home');
        scrollToTop();
        return;
      }

      // ✅ Authorized admin: show admin panel
      setShowAdminPanel(true);
      const subRoute = rest[0] || 'dashboard';
      setAdminCurrentPage(subRoute);
      scrollToTop();
      return;
    }

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
      case 'about':
        setShowAboutPage(true);
        break;
      case 'contact':
        setShowContactPage(true);
        break;
      case 'bulk-order':
      case 'bulk-orders':
        setShowBulkOrderPage(true);
        break;

      case 'bulk-order-form':
      case 'create-bulk-order':
        setShowBulkOrderForm(true);
        break;
        case 'addresses':
          setShowAddressesPage(true);
          break;
        case 'company-addresses':
          setShowCompanyAddressesPage(true);
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
          if (rest[1] === 'filter' && rest.length >= 4) {
            const type = rest[2];
            const valueParam = rest[3];
            const value = decodeURIComponent(valueParam || '').replace(/-/g, ' ');
            let filters;
            if (type === 'subcategory' || type === 'sub-subcategory') {
              filters = getOnlyClickedCategoryFilters(type === 'subcategory' ? 'subcategory' : 'sub-subcategory', value);
            } else {
              filters = getOnlyClickedCategoryFilters('category', categoryName);
              if (type === 'brand') filters.brand = [value];
              if (type === 'product-type') filters.productType = [value];
            }
            setInitialCategoryFilters(filters);
          } else {
            setInitialCategoryFilters(getOnlyClickedCategoryFilters('category', categoryName));
          }
          setShowCategoryList(true);
        }
        break;
      }
      case 'subcategory': {
        const subcategoryName = decodeURIComponent((rest[0] || '').replace(/-/g, ' '));
        if (subcategoryName) {
          setSelectedCategoryForList(subcategoryName);
          if (rest[1] === 'filter' && rest.length >= 4) {
            const type = rest[2];
            const valueParam = rest[3];
            const value = decodeURIComponent(valueParam || '').replace(/-/g, ' ');
            let filters = getOnlyClickedCategoryFilters('subcategory', subcategoryName);
            if (type === 'sub-subcategory') {
              filters.subSubcategory = [value];
              try { localStorage.setItem(`lastSubSubcategory:${slugify(subcategoryName)}`, value); } catch (e) {}
            }
            setInitialCategoryFilters(filters);
          } else {
            let pending;
            try { pending = window.__pendingSubSubcategoryFilter; } catch (e) {}
            if (!pending) {
              try { pending = localStorage.getItem(`lastSubSubcategory:${slugify(subcategoryName)}`) || ''; } catch (e) {}
            }
            const filters = getOnlyClickedCategoryFilters('subcategory', subcategoryName);
            if (pending) {
              filters.subSubcategory = [pending];
              try { delete window.__pendingSubSubcategoryFilter; } catch (e) { window.__pendingSubSubcategoryFilter = undefined; }
            }
            setInitialCategoryFilters(filters);
          }
          setShowCategoryList(true);
        }
        break;
      }
      case 'sub-subcategory': {
        const subSubcategoryName = decodeURIComponent((rest[0] || '').replace(/-/g, ' '));
        if (subSubcategoryName) {
          const lower = subSubcategoryName.toLowerCase();
          let parentSubcategory = '';
          const match = (products || []).find((p) => {
            const anchor = (p && p.raw && p.raw.anchor) || (p && p.anchor) || {};
            const subSub = (anchor.subSubcategory || '').toLowerCase();
            return subSub === lower;
          });
          if (match) {
            const anchor = (match.raw && match.raw.anchor) || match.anchor || {};
            parentSubcategory = anchor.subcategory || '';
          }
  
          if (parentSubcategory) {
            setSelectedCategoryForList(parentSubcategory);
            const filters = getOnlyClickedCategoryFilters('subcategory', parentSubcategory);
            filters.subSubcategory = [subSubcategoryName];
            setInitialCategoryFilters(filters);
            try { localStorage.setItem(`lastSubSubcategory:${slugify(parentSubcategory)}`, subSubcategoryName); } catch (e) {}
          } else {
            setSelectedCategoryForList(subSubcategoryName);
            const filters = getOnlyClickedCategoryFilters('sub-subcategory', subSubcategoryName);
            setInitialCategoryFilters(filters);
          }
          setShowCategoryList(true);
        }
        break;
      }
      case 'brand': {
        const brandName = decodeURIComponent((rest[0] || '').replace(/-/g, ' '));
        if (brandName) {
          setSelectedCategoryForList(brandName);
          setInitialCategoryFilters({ brand: [brandName], subcategory: [], subSubcategory: [], productType: [], category: [] });
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
        setInitialCategoryFilters({ brand: [], subcategory: [], subSubcategory: [], productType: [], category: [] });
        break;
    }
    scrollToTop();
  };
  
  const showToast = (message, type = 'info', durationMs = 2500) => {
    setToast({ message, type, visible: true });
    window.clearTimeout(showToast._tid);
    showToast._tid = window.setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, Math.max(1000, durationMs));
  };

  const loadUserData = async () => {
    if (!currentUser?.token || !isValidToken(currentUser.token)) {
      console.warn('No valid token available for loading user data');
      return;
    }
    
    try {
      setIsLoadingUserData(true);
      
      try {
        const userData = await getUserData();
        if (userData.cart) setCartItems(userData.cart);
        if (userData.favorites) setFavorites(userData.favorites);
      } catch (error) {
        if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
          console.warn('Authentication error, clearing user session:', error.message);
          handleTokenExpired();
          return;
        }
        
        console.warn('getUserData not available, using individual calls:', error);
        
        const [cartResponse, favoritesResponse] = await Promise.allSettled([
          getCart().catch(err => {
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
              throw err;
            }
            return { cart: [] };
          }),
          getFavorites().catch(err => {
            if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
              throw err;
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
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized') || error.message?.includes('Invalid token')) {
        handleTokenExpired();
      }
    } finally {
      setIsLoadingUserData(false);
    }
  };

  const handleTokenExpired = () => {
    console.log('Token expired or invalid, logging out user');
    setCurrentUser(null);
    setCartItems([]);
    setFavorites([]);
    localStorage.removeItem('currentUser');
    
    if (!isLoginOpen && (showCartPage || showFavoritesPage || showCheckoutPage)) {
      showToast('Your session has expired. Please login again.', 'warning');
      setShowCartPage(false);
      setShowFavoritesPage(false);
      setShowCheckoutPage(false);
      setHash('home');
      scrollToTop();
    }
  };

  const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      console.warn('Error checking token expiration:', error);
      return true;
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

  useEffect(() => {
    navigateFromHash();
    const handler = () => navigateFromHash();
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, currentUser]); // ✅ Added currentUser dependency to properly check admin access

  const isValidToken = (token) => {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3;
  };

  useEffect(() => {
    if (!currentUser) {
      try {
        localStorage.setItem('guestCart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving guest cart to localStorage:', error);
      }
    }
  }, [cartItems, currentUser]);

  useEffect(() => {
    if (currentUser?.token) {
      if (!isValidToken(currentUser.token)) {
        console.warn('Invalid token format detected, clearing session');
        handleTokenExpired();
        return;
      }
      
      if (isTokenExpired(currentUser.token)) {
        console.warn('Token has expired, clearing session');
        handleTokenExpired();
        return;
      }
      
      loadUserData();
    } else {
      setFavorites([]);
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

    return Array.from(categoryMap.entries()).map(([category, subMap]) => ({
      name: category,
      children: Array.from(subMap.entries()).map(([subcategory, subSubs]) => ({
        name: subcategory,
        children: Array.from(subSubs.values()).map((n) => ({ name: n }))
      }))
    }));
  }, [rawSource]);

  function getOnlyClickedCategoryFilters(type, value) {
    const filters = { brand: [], subcategory: [], subSubcategory: [], productType: [], category: [] };
    if (type === 'category') filters.category = [value];
    else if (type === 'subcategory') filters.subcategory = [value];
    else if (type === 'sub-subcategory') filters.subSubcategory = [value];
    return filters;
  }

  const handleNavigateTaxonomy = (level, value, subSubcategory) => {
    const allowed = new Set(['category', 'subcategory', 'sub-subcategory']);
    if (!allowed.has(level) || !value) return;
    setPreviousPage('home');
    
    let targetHash;
    if (level === 'subcategory' && subSubcategory) {
      targetHash = `subcategory/${encodeURIComponent(slugify(value))}`;
      const current = (window && window.location && (window.location.hash || '').replace(/^#/, '')) || '';
      try { localStorage.setItem(`lastSubSubcategory:${slugify(value)}`, subSubcategory); } catch (e) {}
      if (current === targetHash) {
        setSelectedCategoryForList(value);
        const filters = getOnlyClickedCategoryFilters('subcategory', value);
        filters.subSubcategory = [subSubcategory];
        setInitialCategoryFilters(filters);
        setShowCategoryList(true);
        scrollToTop();
        return;
      } else {
        try { window.__pendingSubSubcategoryFilter = subSubcategory; } catch (e) {}
      }
    } else {
      if (level === 'subcategory') {
        targetHash = `subcategory/${encodeURIComponent(slugify(value))}`;
        try { localStorage.removeItem(`lastSubSubcategory:${slugify(value)}`); } catch (e) {}
        const current = (window && window.location && (window.location.hash || '').replace(/^#/, '')) || '';
        if (current === targetHash) {
          setSelectedCategoryForList(value);
          const filters = getOnlyClickedCategoryFilters('subcategory', value);
          setInitialCategoryFilters(filters);
          setShowCategoryList(true);
          scrollToTop();
          return;
        }
      } else if (level === 'category') {
        targetHash = `category/${encodeURIComponent(slugify(value))}`;
      } else if (level === 'sub-subcategory') {
        targetHash = `sub-subcategory/${encodeURIComponent(slugify(value))}`;
      } else {
        targetHash = `${level}/${encodeURIComponent(slugify(value))}`;
      }
    }
    
    setHash(targetHash);
    scrollToTop();
  };

  const handleAddToCart = async (product, quantity = 1) => {
    // Check stock availability before adding (for guest users)
    if (!currentUser) {
      const inventory = product.raw?.inventory;
      if (inventory?.availableQuantity === 0) {
        showToast('Product is out of stock.', 'error');
        return;
      }
      
      const existingIndex = cartItems.findIndex(
        item => item['product-id'] === product['product-id'] || 
               item['product-title'] === product['product-title']
      );
      
      let newCartItems;
      if (existingIndex !== -1) {
        const newQuantity = cartItems[existingIndex].quantity + quantity;
        
        // Check if requested quantity exceeds available stock
        if (inventory && newQuantity > inventory.availableQuantity) {
          showToast(`Only ${inventory.availableQuantity} items available in stock.`, 'warning');
          return;
        }
        
        newCartItems = [...cartItems];
        newCartItems[existingIndex] = {
          ...newCartItems[existingIndex],
          quantity: newQuantity
        };
      } else {
        // Check if requested quantity exceeds available stock for new item
        if (inventory && quantity > inventory.availableQuantity) {
          showToast(`Only ${inventory.availableQuantity} items available in stock.`, 'warning');
          return;
        }
        
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
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
      // Check for "Only 0 items available" which means out of stock
      if (error.message?.includes('Only 0 items available')) {
        showToast('Product is out of stock.', 'error');
      } else if (error.message?.includes('out of stock') || error.message?.includes('Out of stock')) {
        showToast('Product is out of stock.', 'error');
      } else if (error.message?.includes('Only') && error.message?.includes('available in stock')) {
        showToast(error.message, 'warning');
      } else if (error.message?.includes('Cannot add') && error.message?.includes('items available')) {
        showToast(error.message, 'warning');
      } else if (error.message?.includes('Product not found')) {
        showToast('Product is not available.', 'warning');
      } else {
        showToast(error.message || 'Failed to add to cart. Please try again.', 'warning');
      }
    }
  };

  const handleUpdateQuantity = async (index, quantity) => {
    if (!currentUser) {
      if (quantity < 1) return;
      
      // Check stock availability for guest users
      const product = cartItems[index];
      const inventory = product.raw?.inventory;
      
      if (inventory?.availableQuantity === 0) {
        showToast('Product is out of stock.', 'error');
        return;
      }
      
      if (inventory && quantity > inventory.availableQuantity) {
        showToast(`Only ${inventory.availableQuantity} items available in stock.`, 'warning');
        return;
      }
      
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
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
      // Check for "Only 0 items available" which means out of stock
      if (error.message?.includes('Only 0 items available')) {
        showToast('Product is out of stock.', 'error');
      } else if (error.message?.includes('out of stock') || error.message?.includes('Out of stock')) {
        showToast('Product is out of stock.', 'error');
      } else if (error.message?.includes('Only') && error.message?.includes('available in stock')) {
        showToast(error.message, 'warning');
      } else if (error.message?.includes('Cannot') && error.message?.includes('items available')) {
        showToast(error.message, 'warning');
      } else if (error.message?.includes('Product not found')) {
        showToast('Product is not available.', 'warning');
      } else {
        showToast(error.message || 'Failed to update quantity. Please try again.', 'warning');
      }
    }
  };

  const handleRemoveItem = async (index) => {
    const removedTitle = cartItems[index]?.['product-title'] || 'Item';
    
    if (!currentUser) {
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
      setPostLoginTarget('checkout');
      setIsLoginOpen(true);
      setHash('login');
      scrollToTop();
    }
  };

  const handleCartClick = () => {
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
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        handleTokenExpired();
        return;
      }
      
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
      token: userResponse.token,
      role: userResponse.role
    };
    
    // ✅ Set user state FIRST
    setCurrentUser(user);
    setIsLoginOpen(false);
    
    // ✅ Check if admin BEFORE any cart operations
    const isAdmin = userResponse.role === 'admin' || userResponse.role === 'superadmin';
    
    if (isAdmin) {
      // Load admin data
      if (userResponse.favorites) {
        setFavorites(userResponse.favorites);
      }
      if (userResponse.cart) {
        setCartItems(userResponse.cart);
      }
      
      // Clear localStorage
      try {
        localStorage.removeItem(`favorites:${user.email}`);
        localStorage.removeItem(`cart:${user.email}`);
        localStorage.removeItem('guestCart');
        localStorage.removeItem('favorites');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      // Redirect to admin panel
      setShowAdminPanel(true);
      setAdminCurrentPage('dashboard');
      setPostLoginTarget(null);
      
      setTimeout(() => {
        setHash('admin/dashboard');
        scrollToTop();
      }, 100);
      
      return; // ⚠️ RETURN EARLY - stop here for admin
    }
    
    // ========================================
    // Regular user flow continues below...
    // ========================================
    
    const guestCartItems = [...cartItems];
    
    if (userResponse.favorites) {
      setFavorites(userResponse.favorites);
    }
    if (userResponse.cart) {
      setCartItems(userResponse.cart);
    }
    
    if (guestCartItems.length > 0) {
      try {
        const response = await apiSyncCart(guestCartItems);
        setCartItems(response.cart);
        showToast(`${guestCartItems.length} items from your cart have been synced.`, 'success');
      } catch (error) {
        console.error('Error syncing guest cart:', error);
        showToast('Some cart items could not be synced. Please check your cart.', 'warning');
      }
    }
    
    try {
      localStorage.removeItem(`favorites:${user.email}`);
      localStorage.removeItem(`cart:${user.email}`);
      localStorage.removeItem('guestCart');
      localStorage.removeItem('favorites');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
    
    // Handle post-login targets for regular users
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

    if (postLoginTarget === 'bulk-order-form') {
      setShowBulkOrderForm(true);
      setPostLoginTarget(null);
      setHash('bulk-order-form');
      scrollToTop();
      return;
    }
    
    
    // Default → home
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
    
    setCartItems([]);
    setFavorites([]);
    
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
    if (showBulkOrderForm) {
      setShowBulkOrderForm(false);
    }
    if (showAdminPanel) {
      setShowAdminPanel(false);
    }
    
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
        const response = await apiRemoveFromFavorites(product['product-id']);
        setFavorites(response.favorites);
        showToast('Removed from wishlist.', 'info');
      } else {
        const response = await apiAddToFavorites(product);
        setFavorites(response.favorites);
        showToast('Added to wishlist.', 'success');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      
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
  const handleAddressesClick = () => {
    setShowAddressesPage(true);
    setHash('addresses');
    scrollToTop();
  };
  const handleCompanyAddressesClick = () => {
    setShowCompanyAddressesPage(true);
    setHash('company-addresses');
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

  const handleCreateBulkOrder = () => {
    if (!currentUser) {
      setPostLoginTarget('bulk-order-form');
      setIsLoginOpen(true);
      setHash('login');
      scrollToTop();
      return;
    }
    setShowBulkOrderForm(true);
    setHash('bulk-order-form');
    scrollToTop();
  };

  const handleBulkOrderCreated = async () => {
    // Refresh the orders list after creating a new order
    setShowBulkOrderForm(false);
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
    setShowAboutPage(false);
    setShowContactPage(false);
    setShowBulkOrderPage(false);
    setShowTermsOfServicePage(false);
    setShowPrivacyPolicyPage(false);
    setShowOrdersPage(false);
    setShowAdminPanel(false);
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
    setHash(`product/${productCategory}/${productId}/${productSlug}`);
    scrollToTop();
  };

  const handleBackFromProductDetails = () => {
    setShowProductDetailsPage(false);
    setSelectedProduct(null);
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

  // Admin panel navigation handler
  const handleAdminNavigation = (page) => {
    setAdminCurrentPage(page);
    setHash(`admin/${page}`);
  };

  // Render admin panel content
  const renderAdminContent = () => {
    switch (adminCurrentPage) {
      case 'orders':
        return <AdminOrders />;
      case 'products':
        return <AdminProducts />;
      case 'users':
        return <AdminUsers />;
      case 'reports':
        return <AdminReports />;
      case 'dashboard':
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
      ) : showAdminPanel ? (
        <AdminLayout
          currentPage={adminCurrentPage}
          onNavigate={handleAdminNavigation}
          onLogout={handleLogout}
          currentUser={currentUser}
        >
          {renderAdminContent()}
        </AdminLayout>
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
              onAddressesClick={handleAddressesClick}
              onCompanyAddressesClick={handleCompanyAddressesClick}
              menuTree={menuTree}
              onNavigateTaxonomy={handleNavigateTaxonomy}
              isLoggedIn={!!currentUser}
              currentUser={currentUser || undefined}
              onAdminClick={() => setHash('admin')}
            />
          )}
          <main className={isLoginOpen ? "" : "pt-16 md:pt-20"}>
            {isLoginOpen ? (
              <LoginPage
                onLoginSuccess={handleLoginSuccess}
              />
            ) : showAboutPage ? (
              <About />
            ) : showContactPage ? (
              <Contact />
            ) : showBulkOrderForm ? (
              <BulkOrderForm 
                onBack={() => {
                  setShowBulkOrderForm(false);
                  setHash('home');
                  scrollToTop();
                }}
                onOrderCreated={handleBulkOrderCreated}
              />
            ) : showBulkOrderPage ? (
              <BulkOrders 
                onBack={() => {
                  setShowBulkOrderPage(false);
                  setHash('home');
                  scrollToTop();
                }}
                onCreateNew={handleCreateBulkOrder}
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
            ) :  showAddressesPage ? (
              <AddressesPage 
                onBack={() => {
                  setShowAddressesPage(false);
                  setHash('home');
                  scrollToTop();
                }}
              />
            ) : showCompanyAddressesPage ? (
              <CompanyAddressesPage 
                onBack={() => {
                  setShowCompanyAddressesPage(false);
                  setHash('home');
                  scrollToTop();
                }}
              />
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
                onOpenByProductId={(targetProductId) => {
                  if (!targetProductId) return;
                  const found = products.find((p) => {
                    const rawId = p.raw?.identifiers?.productId || p.id || p._id;
                    return String(rawId) === String(targetProductId);
                  });
                  if (found) {
                    handleOpenProductDetailsPage(found);
                  }
                }}
                allProducts={products}
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

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
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
                              className="h-full flex flex-col"
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
                setHash('home');
                setTimeout(() => {
                  const el = document.getElementById('categories');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 0);
              }}
              onFeaturedClick={() => {
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
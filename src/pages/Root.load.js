// Root.load.js - Functions for Root component
import { useState, useEffect, useMemo } from 'react';
import productsData from '../data/product.json';

// Hash navigation helpers
export const useHashNavigation = () => {
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
        // Force navigation on same-hash actions (optional: dispatch event)
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }
  };

  return { slugify, scrollToTop, setHash };
};

// Product data processing
export const useProductData = () => {
  const rawSource = useMemo(() => {
    return Array.isArray(productsData)
      ? productsData
      : (productsData && Array.isArray(productsData.products) ? productsData.products : []);
  }, []);

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

  return { rawSource, getProductCategory, mapRawToDisplayProduct };
};

// Navigation state management
export const useNavigationState = () => {
  const [showCartPage, setShowCartPage] = useState(false);
  const [showCheckoutPage, setShowCheckoutPage] = useState(false);  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFavoritesPage, setShowFavoritesPage] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showProductDetailsPage, setShowProductDetailsPage] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [showContactPage, setShowContactPage] = useState(false);
  const [showBulkOrderPage, setShowBulkOrderPage] = useState(false);

  const resetNavigationState = () => {
    setShowCartPage(false);
    setShowCheckoutPage(false);
    setIsLoginOpen(false);
    setShowFavorites(false);
    setShowFavoritesPage(false);
    setShowCategoryList(false);
    setShowProductDetailsPage(false);
    setShowAboutPage(false);
    setShowContactPage(false);
    setShowBulkOrderPage(false);
  };

  return {
    showCartPage, setShowCartPage,
    showCheckoutPage, setShowCheckoutPage,
    isLoginOpen, setIsLoginOpen,
    showFavorites, setShowFavorites,
    showFavoritesPage, setShowFavoritesPage,
    showCategoryList, setShowCategoryList,
    showProductDetailsPage, setShowProductDetailsPage,
    showAboutPage, setShowAboutPage,
    showContactPage, setShowContactPage,
    showBulkOrderPage, setShowBulkOrderPage,
    resetNavigationState
  };
};

// Cart management
export const useCartManagement = () => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      }
    } catch (error) {
      console.error('Error parsing stored cart:', error);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item['product-title'] === product['product-title']);
      if (existingItem) {
        return prevItems.map(item =>
          item['product-title'] === product['product-title']
            ? { ...item, quantity: Math.max(1, item.quantity + (quantity || 1)) }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity: Math.max(1, quantity || 1) }];
      }
    });
  };

  const handleUpdateQuantity = (index, quantity) => {
    setCartItems(prevItems =>
      prevItems.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const handleRemoveItem = (index) => {
    setCartItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cartItems,
    setCartItems,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    getTotalCartItems
  };
};

// User authentication management
export const useUserAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return {
    currentUser,
    setCurrentUser,
    handleLoginSuccess,
    handleLogout
  };
};

// Favorites management
export const useFavoritesManagement = () => {
  const [favorites, setFavorites] = useState([]);

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        setFavorites(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Error parsing stored favorites:', error);
      }
    }
  }, []);

  const handleAddToWishlist = (product, currentUser, setIsLoginOpen) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    setFavorites(prevFavorites => {
      const isAlreadyFavorite = prevFavorites.find(fav => fav['product-title'] === product['product-title']);
      if (isAlreadyFavorite) {
        const newFavorites = prevFavorites.filter(fav => fav['product-title'] !== product['product-title']);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        return newFavorites;
      } else {
        const newFavorites = [...prevFavorites, product];
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        return newFavorites;
      }
    });
  };

  return {
    favorites,
    setFavorites,
    handleAddToWishlist
  };
};

// Search and filtering
export const useSearchAndFilter = (products) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

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

  const getGridTitle = () => {
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (selectedCategory) {
      return selectedCategory;
    }
    return 'Featured Products';
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    getGridTitle
  };
};

// Categories and menu management
export const useCategoriesAndMenu = (rawSource) => {
  const subcategories = useMemo(() => {
    const summaries = new Map();
    for (const p of rawSource) {
      const sub = p?.anchor?.subcategory || 'Other';
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
      const categoryName = a.category || 'Other';
      const subcategoryName = a.subcategory || null;
      const subSubcategoryName = a.subSubcategory || null;

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

  return { subcategories, menuTree };
};

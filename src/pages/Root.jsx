import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Home from './Home';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import Footer from '../components/Footer';
import LoginPage from './LoginPage';
import CategoryListPage from './CategoryListPage';
import ProductCard from '../components/ProductCard';
import ProductDetailsPage from './ProductDetailsPage';
import FavoritesPage from './FavoritesPage';
import About from './About'; // Add About component import
import Contact from './Contact'; // Add Contact component import
import BulkOrderPage from './BulkOrderPage'; // Add BulkOrderPage component import
import { fetchAllProducts } from '../api/client';

function Root() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCartPage, setShowCartPage] = useState(false);
  const [showCheckoutPage, setShowCheckoutPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [selectedCategoryForList, setSelectedCategoryForList] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetailsPage, setShowProductDetailsPage] = useState(false);
  const [showFavoritesPage, setShowFavoritesPage] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false); // Add About page state
  const [showContactPage, setShowContactPage] = useState(false); // Add Contact page state
  const [showBulkOrderPage, setShowBulkOrderPage] = useState(false); // Add BulkOrderPage state
  const [previousPage, setPreviousPage] = useState('home');
  const [initialCategoryFilters, setInitialCategoryFilters] = useState({ brand: [], subcategory: [], subSubcategory: [], productType: [] });
  const [rawSource, setRawSource] = useState([]);

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
    setShowFavorites(false);
    setShowFavoritesPage(false);
    setShowCategoryList(false);
    setSelectedCategoryForList('');
    setShowProductDetailsPage(false);
    setSelectedProduct(null);
    setShowAboutPage(false); // Reset About page state
    setShowContactPage(false); // Reset Contact page state
    setShowBulkOrderPage(false); // Reset BulkOrderPage state

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
        setShowBulkOrderPage(true);
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
        setInitialCategoryFilters({ brand: [], subSubcategory: [], productType: [] });
        break;
    }
    // Scroll to top after navigation
    scrollToTop();
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
        const data = await fetchAllProducts();
        if (!isMounted) return;
        setRawSource(Array.isArray(data) ? data : []);
        const loadedProducts = (Array.isArray(data) ? data : []).map(mapRawToDisplayProduct);
        setProducts(loadedProducts);
        setFilteredProducts(loadedProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
        if (!isMounted) return;
        setRawSource([]);
        setProducts([]);
        setFilteredProducts([]);
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

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

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

  const handleNavigateTaxonomy = (level, value) => {
    const allowed = new Set(['category', 'subcategory', 'sub-subcategory']);
    if (!allowed.has(level) || !value) return;
    setPreviousPage('home');
    setSelectedCategoryForList(value);
    setHash(`${level}/${encodeURIComponent(slugify(value))}`);
    scrollToTop();
  };

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

  const handleCheckout = () => {
    if (currentUser) {
      setShowCheckoutPage(true);
      setHash('checkout');
      scrollToTop();
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    setShowCheckoutPage(false);
    setHash('home');
    scrollToTop();
  };

  const handleBackFromCheckout = () => {
    setShowCheckoutPage(false);
    setShowCartPage(true);
    setHash('cart');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
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
  };

  const handleAddToWishlist = (product) => {
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

  const handleFavoritesClick = () => {
    if (!currentUser) {
      setIsLoginOpen(true);
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
    setHash('bulk-order');
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

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setSelectedCategory('');
  };

  const handleCategorySelect = (category) => {
    setPreviousPage('home');
    setSelectedCategoryForList(category);
    setShowCategoryList(true);
    setSearchQuery('');
    setSelectedCategory('');
    setShowFavorites(false);
    setHash(`category/${encodeURIComponent(slugify(category))}`);
    scrollToTop();
  };

  const handleReturnToHome = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowFavorites(false);
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
      {!isLoginOpen && (
        <Header
          cartItemCount={getTotalCartItems()}
          favoritesCount={favorites.length}
          onCartClick={() => { setShowCartPage(true); setHash('cart'); scrollToTop(); }}
          onSearchChange={handleSearchChange}
          onLoginClick={handleLoginClick}
          onLogout={handleLogout}
          onFavoritesClick={handleFavoritesClick}
          onLogoClick={handleReturnToHome}
          onHomeClick={handleReturnToHome}
          onAboutClick={handleAboutClick} // Add About handler to Header props
          onContactClick={handleContactClick} // Add Contact handler to Header props
          onBulkOrderClick={handleBulkOrderClick} // Add Bulk Order handler to Header props
          menuTree={menuTree}
          onNavigateTaxonomy={handleNavigateTaxonomy}
          isLoggedIn={!!currentUser}
          currentUser={currentUser || undefined}
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
        ) : showBulkOrderPage ? (
          <BulkOrderPage />
        ) : showCartPage ? (
          <CartPage
            items={cartItems}
            onBack={() => setShowCartPage(false)}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onLoginClick={handleLoginClick}
            onCheckout={handleCheckout}
            onOpenDetails={handleOpenProductDetailsPage}
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
        ) : showFavorites ? (
          <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <button
                onClick={() => setShowFavorites(false)}
                className="mb-6 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Products</span>
              </button>
            </div>
            <section className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">My Favorites</h2>
                  <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favorites.map((product, index) => (
                    <div key={`${product['product-title']}-${index}`} className="cursor-pointer">
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                        isFavorite={favorites.some((fav) => fav['product-title'] === product['product-title'])}
                        onOpenDetails={handleOpenProductDetailsPage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
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
                    return disc >= 15;
                  })
                  .slice(0, 8)}
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                    {filteredProducts.map((product, index) => (
                      <div
                        key={`${product['product-title']}-${index}`}
                        className="cursor-pointer h-full"
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onAddToWishlist={handleAddToWishlist}
                          isFavorite={favorites.some((fav) => fav['product-title'] === product['product-title'])}
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
      {!isLoginOpen && <Footer />}
    </div>
  );
}

export default Root;
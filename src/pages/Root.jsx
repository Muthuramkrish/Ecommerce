import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Home from './Home';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import Footer from '../components/Footer';
import LoginPage from './LoginPage';
import CategoryListPage from './CategoryListPage';
import ProductCard from '../components/ProductCard';
import ProductDetailsPage from './ProductDetails/ProductDetailsPage';
import FavoritesPage from './FavoritesPage';
import About from './About'; // Add About component import
import Contact from './Contact'; // Add Contact component import
import BulkOrderPage from './BulkOrderPage'; // Add BulkOrderPage component import
import {
  useHashNavigation,
  useProductData,
  useNavigationState,
  useCartManagement,
  useUserAuth,
  useFavoritesManagement,
  useSearchAndFilter,
  useCategoriesAndMenu
} from './Root.load.js';

function Root() {
  // Initialize custom hooks from Root.load.js
  const { slugify, scrollToTop, setHash } = useHashNavigation();
  const { rawSource, mapRawToDisplayProduct } = useProductData();
  const {
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
  } = useNavigationState();

  const {
    cartItems,
    setCartItems,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    getTotalCartItems
  } = useCartManagement();

  const { currentUser, setCurrentUser, handleLoginSuccess, handleLogout } = useUserAuth();
  const { favorites, setFavorites, handleAddToWishlist } = useFavoritesManagement();

  // Local state that doesn't fit in the hooks
  const [products, setProducts] = useState([]);
  const [selectedCategoryForList, setSelectedCategoryForList] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previousPage, setPreviousPage] = useState('home');
  const [initialCategoryFilters, setInitialCategoryFilters] = useState({ brand: [], subSubcategory: [], productType: [] });

  // Search and filter functionality
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    getGridTitle
  } = useSearchAndFilter(products);

  // Categories and menu
  const { subcategories, menuTree } = useCategoriesAndMenu(rawSource);

  const navigateFromHash = () => {
    const raw = (window.location.hash || '').replace(/^#/, '');
    const [route, ...rest] = raw.split('/');

    // Reset base UI state using the hook
    resetNavigationState();
    setSelectedCategoryForList('');
    setSelectedProduct(null);

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
            const next = { brand: [], subSubcategory: [], productType: [] };
            if (type === 'brand') next.brand = [value];
            if (type === 'sub-subcategory') next.subSubcategory = [value];
            if (type === 'product-type') next.productType = [value];
            setInitialCategoryFilters(next);
          } else {
            setInitialCategoryFilters({ brand: [], subSubcategory: [], productType: [] });
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
        const productSlug = rest[0] || '';
        if (productSlug && products.length) {
          const found = products.find(p => slugify(p['product-title']) === productSlug);
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


  useEffect(() => {
    try {
      const loadedProducts = rawSource.map(mapRawToDisplayProduct);
      setProducts(loadedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    }
  }, [rawSource, mapRawToDisplayProduct]);

  // React to hash on first load and when it changes
  useEffect(() => {
    navigateFromHash();
    const handler = () => navigateFromHash();
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);



  const handleNavigateTaxonomy = (level, value) => {
    const allowed = new Set(['category', 'subcategory', 'sub-subcategory']);
    if (!allowed.has(level) || !value) return;
    setPreviousPage('home');
    setSelectedCategoryForList(value);
    setHash(`${level}/${encodeURIComponent(slugify(value))}`);
    scrollToTop();
  };


  const handleCheckout = () => {
    if(currentUser) {
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

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setHash('login');
    scrollToTop();
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
    setHash(`product/${slugify(product['product-title'])}`);
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
              onLoginSuccess={(user) => {
                handleLoginSuccess(user);
                setIsLoginOpen(false);
                setHash('home');
                scrollToTop();
              }}
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
            onAddToWishlist={(product) => handleAddToWishlist(product, currentUser, setIsLoginOpen)}
            onOpenDetails={handleOpenProductDetailsPage}
          />
        ) : showProductDetailsPage && selectedProduct ? (
          <ProductDetailsPage
            product={selectedProduct}
            onBack={handleBackFromProductDetails}
            onAddToCart={handleAddToCart}
            onAddToWishlist={(product) => handleAddToWishlist(product, currentUser, setIsLoginOpen)}
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
              const matchesSubcategory = slugify(a.subcategory || '') === target;
              const matchesSubSubcategory = slugify(a.subSubcategory || '') === target;
              const matchesBrand = slugify(a.brand || '') === target;
              const matchesManufacturer = slugify(a.manufacturer || '') === target;
              const matchesProductType = slugify(a.productType || '') === target;
              return matchesCategory || matchesSubcategory || matchesSubSubcategory || matchesBrand || matchesManufacturer || matchesProductType;
            })}
            onBack={handleBackFromCategoryList}
            onAddToCart={handleAddToCart}
            onAddToWishlist={(product) => handleAddToWishlist(product, currentUser, setIsLoginOpen)}
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
                        onAddToWishlist={(product) => handleAddToWishlist(product, currentUser, setIsLoginOpen)}
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
                onAddToCart={handleAddToCart}
                onAddToWishlist={(product) => handleAddToWishlist(product, currentUser, setIsLoginOpen)}
                onCategorySelect={handleCategorySelect}
                onOpenDetails={handleOpenProductDetailsPage}
                favorites={favorites}
                categories={subcategories}
              />
            )}
            {(searchQuery || selectedCategory) && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <button
                  onClick={handleReturnToHome}
                  className="mb-6 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center space-x-2"
                >
                  <span>←</span>
                  <span>Back to Home</span>
                </button>
              </div>
            )}
            {(searchQuery || selectedCategory) && (
              <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{getGridTitle()}</h2>
                    <div className="w-24 h-1 bg-yellow-400 mx-auto"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                      <div key={`${product['product-title']}-${index}`} className="cursor-pointer">
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onAddToWishlist={(product) => handleAddToWishlist(product, currentUser, setIsLoginOpen)}
                          isFavorite={favorites.some((fav) => fav['product-title'] === product['product-title'])}
                          onOpenDetails={handleOpenProductDetailsPage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      {!isLoginOpen && <Footer />}
    </div>
  );
}

export default Root;
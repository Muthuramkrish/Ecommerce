import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Heart, Package, Menu } from 'lucide-react';
import vLogo from '../assets/v.png';

const Header = ({ 
  cartItemCount, 
  favoritesCount, 
  onCartClick, 
  onSearchChange, 
  onLogoClick,
  onLoginClick, 
  onLogout, 
  onFavoritesClick, 
  isLoggedIn, 
  currentUser,
  onHomeClick,
  onBulkOrderClick,
  onAboutClick,
  onContactClick,
  menuTree,
  onNavigateTaxonomy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [showElectrical, setShowElectrical] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Local helper to build URL-safe anchors
  const slugify = (text) => {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  // Close user and left menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
      if (isLeftMenuOpen && !event.target.closest('.left-menu') && !event.target.closest('.left-menu-toggle')) {
        setIsLeftMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isLeftMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-blue-900 text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-2 relative">
            <button onClick={onLogoClick} className="flex items-center">
              <img src={vLogo} alt="V Logo" className="h-8 md:h-10 w-auto" />
            </button>
            <button
              onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
              className="left-menu-toggle p-2 hover:bg-blue-800 rounded-full transition-colors relative"
              title="Menu"
            >
              <Menu className="w-6 h-6" />
              {isLeftMenuOpen && (
                <span className="absolute left-1/2 -bottom-1 h-2 w-2 bg-white rotate-45 border-l border-t border-gray-100"></span>
              )}
            </button>
            {isLeftMenuOpen && (
              <div
                className="left-menu fixed top-20 left-0 mt-0 bg-white text-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 ring-1 ring-black/5"
                onMouseLeave={() => { setActiveCategory(null); setActiveSubcategory(null); }}
              >
                <div className="flex w-[1000px] max-w-[calc(100vw-1rem)] min-h-[360px]">
                  {/* Left rail: top links + categories */}
                  <div className="w-64 border-r border-gray-100 p-3 bg-white">
                    <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Electrical</div>
                    <div className="rounded-lg overflow-hidden border border-gray-100 bg-white">
                      <div className="max-h-[320px] overflow-auto">
                        {(menuTree || []).map((cat) => (
                          <a
                            key={cat.name}
                            href={`#category/${encodeURIComponent(slugify(cat.name))}`}
                            onMouseEnter={() => { setActiveCategory(cat.name); setActiveSubcategory(null); }}
                            onClick={(e) => { e.preventDefault(); onNavigateTaxonomy && onNavigateTaxonomy('category', cat.name); }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-blue-50 ${activeCategory === cat.name ? 'bg-blue-50 text-blue-900' : ''}`}
                            title={cat.name}
                          >
                            <span className="truncate">{cat.name}</span>
                            <span className="text-xs text-gray-400">›</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right panel: subcategories and sub-subs */}
                  <div className="flex-1 p-4 bg-white">
                    {!activeCategory ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        Hover a category to explore
                      </div>
                    ) : (
                      <div className="h-full">
                        {(() => {
                          const cat = (menuTree || []).find(c => c.name === activeCategory);
                          const subs = (cat && Array.isArray(cat.children)) ? cat.children : [];
                          return (
                            <div className="h-full">
                              {/* <div className="mb-3 flex items-center justify-between">
                                <div className="text-base font-semibold text-gray-900">{activeCategory}</div>
                                <button
                                  onClick={() => { setIsLeftMenuOpen(false); onNavigateTaxonomy && onNavigateTaxonomy('category', activeCategory); }}
                                  className="text-sm text-blue-700 hover:text-blue-900"
                                >
                                  View all
                                </button>
                              </div> */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  {subs.map((sub) => (
                                    <div key={sub.name}>
                                      <a
                                        href={`#subcategory/${encodeURIComponent(slugify(sub.name))}`}
                                        onMouseEnter={() => setActiveSubcategory(sub.name)}
                                        onClick={(e) => { e.preventDefault(); setIsLeftMenuOpen(false); onNavigateTaxonomy && onNavigateTaxonomy('subcategory', sub.name); }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg hover:bg-gray-50 ${activeSubcategory === sub.name ? 'bg-gray-50' : ''}`}
                                        title={sub.name}
                                      >
                                        <span className="truncate font-medium text-gray-800">{sub.name}</span>
                                        <span className="text-xs text-gray-400">›</span>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-l border-gray-100 pl-4">
                                  {(() => {
                                    const sub = subs.find(s => s.name === activeSubcategory) || subs[0];
                                    const subSubs = (sub && Array.isArray(sub.children)) ? sub.children : [];
                                    return (
                                      <div>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">{sub ? sub.name : 'Subcategories'}</div>
                                        <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-auto">
                                          {subSubs.map((ss) => (
                                            <a
                                              key={ss.name}
                                              href={`#sub-subcategory/${encodeURIComponent(slugify(ss.name))}`}
                                              onClick={(e) => { e.preventDefault(); setIsLeftMenuOpen(false); onNavigateTaxonomy && onNavigateTaxonomy('sub-subcategory', ss.name); }}
                                              className="text-left text-sm px-2 py-1.5 rounded hover:bg-gray-50 truncate"
                                              title={ss.name}
                                            >
                                              {ss.name}
                                            </a>
                                          ))}
                                          {subSubs.length === 0 && (
                                            <div className="text-xs text-gray-400">No deeper levels</div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for products, brands, categories..."
                className="w-full px-4 py-3 pl-12 text-gray-900 bg-white rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-1 md:space-x-4">
              {/* Bulk Order Button - Now First */}
              <button 
              onClick={onBulkOrderClick}
              className="hidden sm:flex px-3 md:px-4 py-1.5 md:py-2 bg-white text-blue-900 rounded-full font-semibold hover:bg-blue-50 transition-colors items-center space-x-1 md:space-x-2 text-sm md:text-base"
            >
              <span>Bulk Order</span>
            </button>
            {/* Mobile Bulk Order Icon - left of search icon */}
            <button
              onClick={onBulkOrderClick}
              className="p-1.5 md:hidden hover:bg-blue-800 rounded-full transition-colors"
              aria-label="Bulk Order"
            >
              <Package className="w-5 h-5" />
            </button>
            {/* Mobile Search Icon - placed left to user icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-1.5 md:hidden hover:bg-blue-800 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            
            {/* Login/User Menu - Now Second */}
            {isLoggedIn ? (
              <div className="relative user-menu">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 md:space-x-2 p-1.5 md:p-2 hover:bg-blue-800 rounded-full transition-colors"
                >
                  <span className="hidden sm:block text-xs md:text-sm text-blue-100">Hi, {currentUser?.name}</span>
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-auto min-w-[12rem] max-w-[90vw] sm:max-w-sm bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 space-y-0.5">
                      <div className="font-medium break-words whitespace-normal">{currentUser?.name}</div>
                      <div className="text-gray-500 break-words whitespace-normal">{currentUser?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="hidden sm:flex px-3 md:px-4 py-1.5 md:py-2 bg-white text-blue-900 rounded-full font-semibold hover:bg-blue-50 transition-colors text-sm md:text-base"
                >
                  Login
                </button>
                <div className="relative user-menu sm:hidden">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-1.5 hover:bg-blue-800 rounded-full transition-colors"
                    aria-label="User menu"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLoginClick && onLoginClick();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* Cart - Now Second */}
            <button
              onClick={onCartClick}
              className="relative p-1.5 md:p-2 hover:bg-blue-800 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            {/* Favorites - Now Third */}
            <button 
              onClick={(e) => {
                console.log('Header wishlist button clicked!');
                e.preventDefault();
                onFavoritesClick();
              }}
              className="relative p-1.5 md:p-2 hover:bg-blue-800 rounded-full transition-colors"
            >
              <Heart className="w-5 h-5 md:w-6 md:h-6" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full px-4 py-2.5 pl-10 text-gray-900 bg-white rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        )}

        
      </div>
    </header>
  );
};

export default Header;
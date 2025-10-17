import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  User,
  Heart,
  Package,
  Menu,
  X,
  Home,
  Info,
  Phone,
} from "lucide-react";
import vLogo from "../assets/v1.png";

const Header = ({
  cartItemCount,
  favoritesCount,
  onCartClick,
  onSearchChange,
  searchQuery,
  onLogoClick,
  onLoginClick,
  onLogout,
  onFavoritesClick,
  onOrdersClick,
  onBulkOrdersClick,
  isLoggedIn,
  currentUser,
  onHomeClick,
  onBulkOrderClick,
  onAboutClick,
  onContactClick,
  menuTree,
  onNavigateTaxonomy,
}) => {
  // const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Local helper to build URL-safe anchors
  const slugify = (text) => {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  // Close all menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu")) {
        setIsUserMenuOpen(false);
      }
      if (
        isLeftMenuOpen &&
        !event.target.closest(".left-menu") &&
        !event.target.closest(".left-menu-toggle")
      ) {
        setIsLeftMenuOpen(false);
      }
      if (
        isMobileMenuOpen &&
        !event.target.closest(".mobile-menu") &&
        !event.target.closest(".mobile-menu-toggle")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isLeftMenuOpen, isMobileMenuOpen]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // md breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-blue-900 text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center space-x-2 relative">
            <button onClick={onLogoClick} className="flex items-center">
              <img src={vLogo} alt="V Logo" className="h-8 md:h-10 w-auto" />
            </button>

            {/* Desktop Category Menu Button */}
            <button
              onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
              className="left-menu-toggle hidden md:block p-2 hover:bg-blue-800 rounded-full transition-colors relative mt-3"
              title="Categories"
            >
              <Menu className="w-6 h-6" />
              {isLeftMenuOpen && (
                <span className="absolute left-1/2 -bottom-1 h-2 w-2 bg-white rotate-45 border-l border-t border-gray-100"></span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-toggle md:hidden p-2 hover:bg-blue-800 rounded-full transition-colors relative mt-3"
              title="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Desktop Category Menu */}
            {isLeftMenuOpen && (
              <div
                className="left-menu fixed top-20 left-0 mt-0 bg-white text-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 ring-1 ring-black/5"
                onMouseLeave={() => {
                  setActiveCategory(null);
                  setActiveSubcategory(null);
                }}
              >
                <div className="flex w-[95vw] max-w-[1200px] min-h-[320px] max-h-[80vh] overflow-hidden">
                  {/* Left rail: top links + categories */}
                  <div className="w-64 md:w-72 border-r border-gray-100 p-3 bg-white">
                    <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Category
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-100 bg-white">
                      <div className="max-h-[320px] overflow-auto">
                        {(menuTree || []).map((cat) => (
                          <a
                            key={cat.name}
                            href={`#category/${encodeURIComponent(
                              slugify(cat.name)
                            )}`}
                            onMouseEnter={() => {
                              setActiveCategory(cat.name);
                              setActiveSubcategory(null);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsLeftMenuOpen(false);
                              onNavigateTaxonomy &&
                                onNavigateTaxonomy("category", cat.name);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-base hover:bg-blue-50 ${
                              activeCategory === cat.name
                                ? "bg-blue-50 text-blue-900"
                                : ""
                            }`}
                            title={cat.name}
                          >
                            <span className="truncate">{cat.name}</span>
                            <span className="text-lg text-gray-900 font-bold">
                              ›
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right panel: subcategories and sub-subs */}
                  <div className="flex-1 p-4 bg-white overflow-auto">
                    {!activeCategory ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        Hover a category to explore
                      </div>
                    ) : (
                      <div className="h-full">
                        {(() => {
                          const cat = (menuTree || []).find(
                            (c) => c.name === activeCategory
                          );
                          const subs =
                            cat && Array.isArray(cat.children)
                              ? cat.children
                              : [];
                          return (
                            <div className="h-full">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  {subs.map((sub) => (
                                    <div key={sub.name}>
                                      <a
                                        href={`#subcategory/${encodeURIComponent(
                                          slugify(sub.name)
                                        )}`}
                                        onMouseEnter={() =>
                                          setActiveSubcategory(sub.name)
                                        }
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setIsLeftMenuOpen(false);
                                          onNavigateTaxonomy &&
                                            onNavigateTaxonomy(
                                              "subcategory",
                                              sub.name
                                            );
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 text-base rounded-lg hover:bg-gray-50 ${
                                          activeSubcategory === sub.name
                                            ? "bg-gray-50"
                                            : ""
                                        }`}
                                        title={sub.name}
                                      >
                                        <span className="truncate font-medium text-gray-800">
                                          {sub.name}
                                        </span>
                                        <span className="text-lg text-gray-400">
                                          ›
                                        </span>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-l border-gray-100 pl-4">
                                  {(() => {
                                    const sub =
                                      subs.find(
                                        (s) => s.name === activeSubcategory
                                      ) || subs[0];
                                    const subSubs =
                                      sub && Array.isArray(sub.children)
                                        ? sub.children
                                        : [];
                                    return (
                                      <div>
                                        <div className="text-base font-semibold text-gray-700 mb-2">
                                          {sub ? sub.name : "Subcategories"}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-auto">
                                          {subSubs.map((ss) => (
                                            <a
                                              key={ss.name}
                                              href={`#sub-subcategory/${encodeURIComponent(
                                                slugify(ss.name)
                                              )}`}
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setIsLeftMenuOpen(false);
                                                onNavigateTaxonomy &&
                                                  onNavigateTaxonomy(
                                                    "sub-subcategory",
                                                    ss.name
                                                  );
                                              }}
                                              className="text-left text-base px-2 py-1.5 rounded hover:bg-gray-50 truncate"
                                              title={ss.name}
                                            >
                                              {ss.name}
                                            </a>
                                          ))}
                                          {subSubs.length === 0 && (
                                            <div className="text-xs text-gray-400">
                                              No deeper levels
                                            </div>
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
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="w-full px-4 py-3 pl-12 text-gray-900 bg-white rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-1 md:space-x-4">
            {/* Bulk Order Button - Desktop Only */}
            <button
              onClick={onBulkOrderClick}
              className="hidden md:flex px-3 md:px-4 py-1.5 md:py-2 bg-white text-blue-900 rounded-full font-semibold hover:bg-blue-50 transition-colors items-center space-x-1 md:space-x-2 text-sm md:text-base"
            >
              <span>Bulk Order</span>
            </button>

            {/* Mobile Search Icon - Only visible on mobile */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-1.5 md:hidden hover:bg-blue-800 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Login/User Menu - Desktop Only */}
            {isLoggedIn ? (
              <div className="relative user-menu hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 md:space-x-2 p-1.5 md:p-2 hover:bg-blue-800 rounded-full transition-colors"
                >
                  <span className="text-xs md:text-sm text-blue-100">
                    Hi, {currentUser?.fullName || currentUser?.name || "User"}
                  </span>
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-auto min-w-[12rem] max-w-[90vw] sm:max-w-sm bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 space-y-0.5">
                      <div className="font-medium break-words whitespace-normal">
                        {currentUser?.fullName || currentUser?.name || "User"}
                      </div>
                      <div className="text-gray-500 break-words whitespace-normal">
                        {currentUser?.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOrdersClick && onOrdersClick();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onBulkOrdersClick && onBulkOrdersClick();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      My Bulk Orders
                    </button>
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
              <button
                onClick={onLoginClick}
                className="hidden md:flex px-3 md:px-4 py-1.5 md:py-2 bg-white text-blue-900 rounded-full font-semibold hover:bg-blue-50 transition-colors text-sm md:text-base"
              >
                Login
              </button>
            )}

            {/* Cart Icon - Desktop Only (always visible) */}
            <button
              onClick={onCartClick}
              className="relative hidden md:block p-1.5 md:p-2 hover:bg-blue-800 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Favorites Icon - Desktop Only (hide when logged out) */}
            {isLoggedIn && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onFavoritesClick();
                }}
                className="relative hidden md:block p-1.5 md:p-2 hover:bg-blue-800 rounded-full transition-colors"
              >
                <Heart className="w-5 h-5 md:w-6 md:h-6" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-xs">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {isMobileSearchOpen && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2.5 pl-10 text-gray-900 bg-white rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="mobile-menu fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Mobile Menu Header */}
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={vLogo} alt="V Logo" className="h-8 w-auto" />
                <span className="font-semibold text-lg">Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 hover:bg-blue-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex flex-col h-full bg-white text-gray-800 overflow-y-auto">
              {/* User Section */}
              {isLoggedIn ? (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate">
                        {currentUser?.fullName || currentUser?.name || "User"}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {currentUser?.email}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLoginClick && onLoginClick();
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Main Navigation */}
              <nav className="flex-1 py-4 overflow-y-auto">
                <div className="space-y-2 pb-20">
                  {/* Added padding bottom to ensure scroll clearance */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onHomeClick && onHomeClick();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Home className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Home</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onBulkOrderClick && onBulkOrderClick();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <Package className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Bulk Order</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onCartClick && onCartClick();
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Cart</span>
                    </div>
                    {cartItemCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </button>

                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onFavoritesClick && onFavoritesClick();
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Wishlist</span>
                      </div>
                      {favoritesCount > 0 && (
                        <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {favoritesCount}
                        </span>
                      )}
                    </button>
                  )}

                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOrdersClick && onOrdersClick();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">My Orders</span>
                    </button>
                  )}

                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onBulkOrdersClick && onBulkOrdersClick();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">My Bulk Orders</span>
                    </button>
                  )}

                  {/* Categories Section */}
                  {menuTree && menuTree.length > 0 && (
                    <div className="mt-6">
                      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
                        Categories
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {menuTree.map((category) => (
                          <div key={category.name}>
                            <button
                              onClick={() => {
                                if (expandedCategory === category.name) {
                                  setExpandedCategory(null);
                                } else {
                                  setExpandedCategory(category.name);
                                  setExpandedSubcategory(null);
                                }
                              }}
                              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <span className="font-medium text-base truncate pr-2">
                                {category.name}
                              </span>
                              <span
                                className={`text-gray-400 transform transition-transform text-xl flex-shrink-0 ${
                                  expandedCategory === category.name
                                    ? "rotate-90"
                                    : ""
                                }`}
                              >
                                ›
                              </span>
                            </button>

                            {expandedCategory === category.name &&
                              category.children && (
                                <div className="bg-gray-50 border-l-2 border-gray-200 ml-4">
                                  {/* View All Category Button */}
                                  <button
                                    onClick={() => {
                                      setIsMobileMenuOpen(false);
                                      onNavigateTaxonomy &&
                                        onNavigateTaxonomy(
                                          "category",
                                          category.name
                                        );
                                    }}
                                    className="w-full px-4 py-2 text-left text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-200 truncate"
                                  >
                                    View All {category.name}
                                  </button>

                                  {category.children.map((subcategory) => (
                                    <div key={subcategory.name}>
                                      <button
                                        onClick={() => {
                                          if (
                                            expandedSubcategory ===
                                            subcategory.name
                                          ) {
                                            setExpandedSubcategory(null);
                                          } else {
                                            setExpandedSubcategory(
                                              subcategory.name
                                            );
                                          }
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-2 text-left text-base hover:bg-gray-100 transition-colors"
                                      >
                                        <span className="truncate pr-2 text-base">
                                          {subcategory.name}
                                        </span>
                                        {subcategory.children &&
                                          subcategory.children.length > 0 && (
                                            <span
                                              className={`text-gray-400 transform transition-transform text-lg flex-shrink-0 ${
                                                expandedSubcategory ===
                                                subcategory.name
                                                  ? "rotate-90"
                                                  : ""
                                              }`}
                                            >
                                              ›
                                            </span>
                                          )}
                                      </button>

                                      {expandedSubcategory ===
                                        subcategory.name &&
                                        subcategory.children && (
                                          <div className="bg-gray-100">
                                            {/* View All Subcategory Button */}
                                            <button
                                              onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                onNavigateTaxonomy &&
                                                  onNavigateTaxonomy(
                                                    "subcategory",
                                                    subcategory.name
                                                  );
                                              }}
                                              className="w-full text-left px-6 py-2 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-200 truncate"
                                            >
                                              View All {subcategory.name}
                                            </button>

                                            {subcategory.children.map(
                                              (subSubcategory) => (
                                                <button
                                                  key={subSubcategory.name}
                                                  onClick={() => {
                                                    setIsMobileMenuOpen(false);
                                                    onNavigateTaxonomy &&
                                                      onNavigateTaxonomy(
                                                        "sub-subcategory",
                                                        subSubcategory.name
                                                      );
                                                  }}
                                                  className="w-full text-left px-6 py-2 text-base text-gray-600 hover:bg-gray-200 transition-colors truncate"
                                                >
                                                  {subSubcategory.name}
                                                </button>
                                              )
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Links */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onAboutClick && onAboutClick();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Info className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">About</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onContactClick && onContactClick();
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Contact</span>
                    </button>

                    {/* Sign Out Button - Next to Contact */}
                    {isLoggedIn && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onLogout && onLogout();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 transition-colors text-red-600"
                      >
                        <User className="w-5 h-5 text-red-500" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

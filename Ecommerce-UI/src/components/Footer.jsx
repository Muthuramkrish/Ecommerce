import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import v1Logo from '../assets/logo.png';
const Footer = ({
  onHomeClick,
  onCategoriesClick,
  onFeaturedClick,
  onAboutClick,
  onContactClick,
  onHelpClick,
  onReturnsClick,
  onShippingClick,
  onTrackOrderClick,
  onWarrantyClick,
  onBulkOrderClick,
  onPrivacyPolicyClick,
  onTermsOfServiceClick
}) => {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="container-responsive py-responsive-lg">
        <div className="grid-responsive-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-responsive-sm text-left">
            <div className="flex items-start">
              <img src={v1Logo} alt="Vikoshiya Technologies logo" className="h-10 sm:h-12 bg-gray-50 rounded-full w-auto mb-4" />
            </div>
            <p className="text-blue-100 leading-relaxed text-responsive-sm text-left">
              Vikoshiya – Your trusted destination for high-quality electrical products, built on reliability, safety, and innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-responsive-sm text-left">
            <h4 className="text-responsive-lg font-semibold text-yellow-400 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onHomeClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">
                  Home
                </button>
              </li>
              <li>
                <button onClick={onCategoriesClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">
                  Shop by Category
                </button>
              </li>
              <li>
                <button onClick={onFeaturedClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">
                  Featured Products
                </button>
              </li>
              <li>
                <button onClick={onBulkOrderClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">
                  Bulk Order
                </button>
              </li>
              <li>
                <button onClick={onAboutClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={onContactClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-responsive-sm text-left">
            <h4 className="text-responsive-lg font-semibold text-yellow-400 mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={onHelpClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">Help Center</button>
              </li>
              <li>
                <button onClick={onReturnsClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">Returns</button>
              </li>
              <li>
                <button onClick={onShippingClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">Shipping Info</button>
              </li>
              <li>
                <button onClick={onTrackOrderClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">Track Order</button>
              </li>
              <li>
                <button onClick={onWarrantyClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left w-full justify-start">Warranty</button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-responsive-sm text-left">
            <h4 className="text-responsive-lg font-semibold text-yellow-400 mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100 text-responsive-sm">support@vikoshiya.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100 text-responsive-sm">+91 1234567890</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100 text-responsive-sm">Virudhunagar, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 mt-responsive-md pt-responsive-md">
          <div className="text-center">
            <p className="text-blue-200 text-responsive-sm flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-1">
              <span>© 2025 VIKOSHIYA. All rights reserved.</span>
              <span className="hidden sm:inline">|</span>
              <button 
                onClick={onPrivacyPolicyClick} 
                className="text-blue-200 hover:text-white transition-colors touch-target underline hover:no-underline"
              >
                Privacy Policy
              </button>
              <span className="hidden sm:inline">|</span>
              <button 
                onClick={onTermsOfServiceClick} 
                className="text-blue-200 hover:text-white transition-colors touch-target underline hover:no-underline"
              >
                Terms of Service
              </button>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
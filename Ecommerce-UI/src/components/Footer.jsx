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
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-10 py-8 xs:py-10 sm:py-12">
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8">
          {/* Company Info */}
          <div className="space-y-3 xs:space-y-4 xs:col-span-2 lg:col-span-1">
          <img src={v1Logo} alt="Vikoshiya Technologies logo" className="h-10 xs:h-12 bg-gray-50 rounded-full w-auto mb-3 xs:mb-4" />
          <p className="text-blue-100 leading-relaxed text-sm xs:text-base">
          Vikoshiya – Your trusted destination for high-quality electrical products, built on reliability, safety, and innovation.
            </p>
           
          </div>

          {/* Quick Links */}
          <div className="space-y-3 xs:space-y-4">
            <h4 className="text-base xs:text-lg font-semibold text-yellow-400">Quick Links</h4>
            <ul className="space-y-1.5 xs:space-y-2">
              <li>
                <button onClick={onHomeClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">
                  Home
                </button>
              </li>
              <li>
                <button onClick={onCategoriesClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">
                  shop by category
                </button>
              </li>
              <li>
                <button onClick={onFeaturedClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">
                  featured products
                </button>
              </li>
              <li>
                <button onClick={onBulkOrderClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">
                  Bulk Order
                </button>
              </li>
              <li>
                <button onClick={onAboutClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={onContactClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3 xs:space-y-4">
            <h4 className="text-base xs:text-lg font-semibold text-yellow-400">Customer Service</h4>
            <ul className="space-y-1.5 xs:space-y-2">
              <li>
                <button onClick={onHelpClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">Help Center</button>
              </li>
              <li>
                <button onClick={onReturnsClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">Returns</button>
              </li>
              <li>
                <button onClick={onShippingClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">Shipping Info</button>
              </li>
              <li>
                <button onClick={onTrackOrderClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">Track Order</button>
              </li>
              <li>
                <button onClick={onWarrantyClick} className="text-blue-100 hover:text-white transition-colors text-sm xs:text-base">Warranty</button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 xs:space-y-4 xs:col-span-2 lg:col-span-1">
            <h4 className="text-base xs:text-lg font-semibold text-yellow-400">Contact Us</h4>
            <div className="space-y-2 xs:space-y-3">
              <div className="flex items-center space-x-2 xs:space-x-3">
                <Mail className="w-4 h-4 xs:w-5 xs:h-5 text-White-400 flex-shrink-0" />
                <span className="text-blue-100 text-sm xs:text-base break-all">support@vikoshiya.com</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3">
                <Phone className="w-4 h-4 xs:w-5 xs:h-5 text-White-400 flex-shrink-0" />
                <span className="text-blue-100 text-sm xs:text-base">+91 1234567890</span>
              </div>
              <div className="flex items-start space-x-2 xs:space-x-3">
                  <MapPin className="w-4 h-4 xs:w-5 xs:h-5 text-White-400 flex-shrink-0 mt-0.5" />
                <span className="text-blue-100 text-sm xs:text-base">Virudhunagar, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 mt-6 xs:mt-8 pt-6 xs:pt-8 text-center">
          <p className="text-blue-200 text-sm xs:text-base">
            © 2025 VIKOSHIYA. All rights reserved. | {' '}
            <button 
              onClick={onPrivacyPolicyClick} 
              className="text-blue-200 hover:text-white transition-colors underline"
            >
              Privacy Policy
            </button>
            {' '} | {' '}
            <button 
              onClick={onTermsOfServiceClick} 
              className="text-blue-200 hover:text-white transition-colors underline"
            >
              Terms of Service
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
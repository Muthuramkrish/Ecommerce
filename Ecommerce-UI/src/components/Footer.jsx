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
          <div className="space-responsive-sm">
          <img src={v1Logo} alt="Vikoshiya Technologies logo" className="h-10 sm:h-12 bg-gray-50 rounded-full w-auto mb-4" />
          <p className="text-blue-100 leading-relaxed text-responsive-sm">
          Vikoshiya – Your trusted destination for high-quality electrical products, built on reliability, safety, and innovation.
            </p>
           
          </div>

          {/* Quick Links */}
          <div className="space-responsive-sm">
            <h4 className="text-responsive-lg font-semibold text-yellow-400">Quick Links</h4>
            <ul className="space-responsive-sm">
              <li>
                <button onClick={onHomeClick} className="text-blue-100 hover:text-white transition-colors text-responsive-sm touch-target text-left">
                  Home
                </button>
              </li>
              <li>
                <button onClick={onCategoriesClick} className="text-blue-100 hover:text-white transition-colors">
                  shop by category
                </button>
              </li>
              <li>
                <button onClick={onFeaturedClick} className="text-blue-100 hover:text-white transition-colors">
                  featured products
                </button>
              </li>
              <li>
                <button onClick={onBulkOrderClick} className="text-blue-100 hover:text-white transition-colors">
                  Bulk Order
                </button>
              </li>
              <li>
                <button onClick={onAboutClick} className="text-blue-100 hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={onContactClick} className="text-blue-100 hover:text-white transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-responsive-sm">
            <h4 className="text-responsive-lg font-semibold text-yellow-400">Customer Service</h4>
            <ul className="space-responsive-sm">
              <li>
                <button onClick={onHelpClick} className="text-blue-100 hover:text-white transition-colors">Help Center</button>
              </li>
              <li>
                <button onClick={onReturnsClick} className="text-blue-100 hover:text-white transition-colors">Returns</button>
              </li>
              <li>
                <button onClick={onShippingClick} className="text-blue-100 hover:text-white transition-colors">Shipping Info</button>
              </li>
              <li>
                <button onClick={onTrackOrderClick} className="text-blue-100 hover:text-white transition-colors">Track Order</button>
              </li>
              <li>
                <button onClick={onWarrantyClick} className="text-blue-100 hover:text-white transition-colors">Warranty</button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-responsive-sm">
            <h4 className="text-responsive-lg font-semibold text-yellow-400">Contact Us</h4>
            <div className="space-responsive-sm">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-White-400 flex-shrink-0" />
                <span className="text-blue-100 text-responsive-sm">support@vikoshiya.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-White-400 flex-shrink-0" />
                <span className="text-blue-100 text-responsive-sm">+91 1234567890</span>
              </div>
              <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-White-400 flex-shrink-0" />
                <span className="text-blue-100 text-responsive-sm">Virudhunagar, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 mt-responsive-md pt-responsive-md text-center">
          <p className="text-blue-200 text-responsive-sm">
            © 2025 VIKOSHIYA. All rights reserved. | {' '}
            <button 
              onClick={onPrivacyPolicyClick} 
              className="text-blue-200 hover:text-white transition-colors touch-target"
            >
              Privacy Policy
            </button>
            {' '} | {' '}
            <button 
              onClick={onTermsOfServiceClick} 
              className="text-blue-200 hover:text-white transition-colors touch-target"
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
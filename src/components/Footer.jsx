import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-yellow-400">VIKOSHIYA</h3>
            <p className="text-blue-100 leading-relaxed">
              Your trusted destination for high-quality electrical products. 
              Built on reliability, safety, and innovation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-blue-200 hover:text-yellow-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#Home" className="text-blue-100 hover:text-white transition-colors">Home</a></li>
              <li><a href="#shop by category" className="text-blue-100 hover:text-white transition-colors">shop by category</a></li>
              <li><a href="#featured products" className="text-blue-100 hover:text-white transition-colors">featured products</a></li>
              <li><a href="#about" className="text-blue-100 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-blue-100 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Track Order</a></li>
              <li><a href="#" className="text-blue-100 hover:text-white transition-colors">Warranty</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-400" />
                <span className="text-blue-100">support@vikoshiya.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-yellow-400" />
                <span className="text-blue-100">+91 1234567890</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-yellow-400" />
                <span className="text-blue-100">Virudhunagar, Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 mt-8 pt-8 text-center">
          <p className="text-blue-200">
            © 2025 VIKOSHIYA. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
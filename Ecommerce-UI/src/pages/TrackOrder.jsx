import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Shield,
  Truck,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  X,
  Clock
} from 'lucide-react';

function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleTrack = () => {
    if (!orderId || !email) {
      alert('Please enter both Order Number and Email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Simulated tracking data (replace with real API later)
    const mockStatuses = [
      {
        status: 'Order Confirmed',
        date: 'Nov 10, 2025',
        time: '10:30 AM',
        description:
          'Your electrical product order has been successfully placed and confirmed.',
        icon: ShoppingBag,
        color: 'bg-blue-500',
      },
      {
        status: 'Quality Check & Packing',
        date: 'Nov 11, 2025',
        time: '02:15 PM',
        description:
          'Products are being inspected and safely packed for shipment.',
        icon: Shield,
        color: 'bg-indigo-500',
      },
      {
        status: 'Shipped',
        date: 'Nov 11, 2025',
        time: '06:00 PM',
        description:
          'Your order has been dispatched via our trusted courier partner. Tracking is now live.',
        icon: Truck,
        color: 'bg-purple-500',
      },
      {
        status: 'Out for Delivery',
        date: 'Nov 13, 2025',
        time: '09:00 AM',
        description:
          'The delivery agent is on the way. Please keep your phone available for delivery confirmation.',
        icon: MapPin,
        color: 'bg-green-500',
      },
    ];

    setTrackingResult({
      orderId,
      email,
      currentStatus: 2, // "Shipped"
      timeline: mockStatuses,
      estimatedDelivery: 'Nov 14, 2025',
      carrier: 'BlueDart Express',
      trackingNumber: 'BD' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    });
  };

  const handleReset = () => {
    setOrderId('');
    setEmail('');
    setTrackingResult(null);
  };

  const handleContactSupport = () => {
    setShowSupportModal(true);
  };

  const handleCloseModal = () => {
    setShowSupportModal(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 flex items-center">
            <MapPin size={28} className="mr-2 sm:mr-3 flex-shrink-0" />
            <span>Track Your Order</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-indigo-100">
            Track your electrical shipment in real-time — from packing to delivery
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Track Your Order
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Enter your order number and registered email address to view real-time
            shipment status.
          </p>

          {/* Tracking Form */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., ORD-2025-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleTrack}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex items-center justify-center font-semibold shadow-lg transition text-sm sm:text-base"
              >
                <Search size={18} className="mr-2" /> Track Order
              </button>
              {trackingResult && (
                <button
                  onClick={handleReset}
                  className="sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Tracking Timeline */}
          {trackingResult && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 border-b gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Order: {trackingResult.orderId}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">Live shipment tracking</p>
                </div>
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold w-fit">
                  In Transit
                </span>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Tracking Number</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">{trackingResult.trackingNumber}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Carrier</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">{trackingResult.carrier}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Estimated Delivery</p>
                  <p className="text-sm sm:text-base font-semibold text-indigo-600">{trackingResult.estimatedDelivery}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800 truncate">{trackingResult.email}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4 sm:space-y-6">
                {trackingResult.timeline.map((item, index) => (
                  <div key={index} className="flex gap-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`${item.color} ${
                          index <= trackingResult.currentStatus
                            ? 'opacity-100'
                            : 'opacity-30'
                        } rounded-full p-2 sm:p-3 flex-shrink-0`}
                      >
                        <item.icon size={18} className="text-white sm:w-5 sm:h-5" />
                      </div>
                      {index < trackingResult.timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-12 sm:h-16 ${
                            index < trackingResult.currentStatus
                              ? 'bg-indigo-500'
                              : 'bg-gray-300'
                          }`}
                        ></div>
                      )}
                    </div>
                    <div
                      className={`flex-1 pb-2 ${
                        index <= trackingResult.currentStatus
                          ? 'opacity-100'
                          : 'opacity-50'
                      }`}
                    >
                      <h4 className="font-semibold text-sm sm:text-base text-gray-800">
                        {item.status}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        {item.date} at {item.time}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Expected Next Step */}
              {trackingResult.currentStatus < trackingResult.timeline.length - 1 && (
                <div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Clock size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base text-blue-900 mb-1">Next Step</h4>
                      <p className="text-xs sm:text-sm text-blue-800">
                        {trackingResult.timeline[trackingResult.currentStatus + 1].status} - 
                        Expected within 1-2 days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Support Section */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
              Need Help with Your Order?
            </h3>
            <p className="text-sm sm:text-base text-blue-800 mb-3">
              Can't track your shipment or have delivery concerns? Our team is here
              to assist you 24×7.
            </p>
            <button 
              onClick={handleContactSupport}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition w-full sm:w-auto"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Order Support</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Phone size={20} className="text-indigo-600 mr-2 flex-shrink-0" />
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Phone Support</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Available Mon–Sat: 9AM – 9PM</p>
                <p className="text-base sm:text-lg font-bold text-indigo-600">1800-456-7890</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Mail size={20} className="text-indigo-600 mr-2 flex-shrink-0" />
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Email Support</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Response within 24 hours</p>
                <p className="text-sm sm:text-base font-bold text-indigo-600">orders@electrostore.com</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <MessageCircle size={20} className="text-indigo-600 mr-2 flex-shrink-0" />
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Live Chat</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">24×7 instant support available</p>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition">
                  Start Chat Now
                </button>
              </div>

              {trackingResult && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2 text-sm sm:text-base">Your Order Details</h4>
                  <div className="text-xs sm:text-sm text-green-800 space-y-1">
                    <p><strong>Order:</strong> {trackingResult.orderId}</p>
                    <p><strong>Tracking:</strong> {trackingResult.trackingNumber}</p>
                    <p><strong>Status:</strong> In Transit</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackOrder;
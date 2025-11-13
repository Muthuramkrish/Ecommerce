import React, { useState } from 'react';
import { Truck, Clock, MapPin, ChevronRight, Shield, Package, CheckCircle, X, Search, Phone, Mail, MessageCircle } from 'lucide-react';

function ShippingInfo() {
  const [selectedModal, setSelectedModal] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  const shippingOptions = [
    {
      icon: Truck,
      title: 'Standard Delivery',
      time: '5–7 Business Days',
      cost: 'Free above ₹499',
      description: 'Reliable nationwide delivery for all electrical products.'
    },
    {
      icon: Clock,
      title: 'Express Delivery',
      time: '3-5 Business Days',
      cost: '₹99',
      description: 'Fast-track option for urgent electrical components or spares.'
    },
    {
      icon: MapPin,
      title: 'Within 2 Days Delivery',
      time: '2 Days',
      cost: '₹199',
      description: 'Available in select metro cities for in-stock items.'
    }
  ];

  const shippingProcess = [
    {
      icon: Package,
      title: 'Order Processing',
      description: 'Orders are processed within 1–2 business days once payment is confirmed.'
    },
    {
      icon: Shield,
      title: 'Quality & Safety Check',
      description: 'Each item undergoes visual and packaging inspection before shipping.'
    },
    {
      icon: Truck,
      title: 'Dispatch',
      description: 'Orders are dispatched via trusted courier partners with live tracking.'
    },
    {
      icon: CheckCircle,
      title: 'Delivery',
      description: 'Package arrives safely at your doorstep, fully insured.'
    }
  ];

  const handleContactSupport = () => {
    setSelectedModal('contact');
  };

  const handleTrackOrder = () => {
    setSelectedModal('tracking');
  };

  const handleCheckDelivery = () => {
    setSelectedModal('delivery-check');
  };

  const handleCloseModal = () => {
    setSelectedModal(null);
    setTrackingNumber('');
    setPincode('');
    setDeliveryEstimate(null);
  };

  const handleTrackSubmit = () => {
    if (!trackingNumber) {
      alert('Please enter a tracking number');
      return;
    }
    // Simulate tracking lookup
    alert(`Tracking your order: ${trackingNumber}\n\nStatus: In Transit\nExpected Delivery: 2-3 days\n\nCheck your email for detailed tracking updates.`);
    handleCloseModal();
  };

  const handlePincodeCheck = () => {
    if (!pincode || pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    
    // Simulate pincode check
    const metroAreas = ['110001', '400001', '560001', '600001', '700001'];
    const isMetro = metroAreas.some(metro => pincode.startsWith(metro.substring(0, 3)));
    
    setDeliveryEstimate({
      available: true,
      standard: isMetro ? '5-7 days' : '5-7 days',
      express: isMetro ? '3-5 days' : '3-5 days',
      sameDay: isMetro ? 'Not Available' : 'Not Available',
      cod: true
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 flex items-center">
            <Truck size={28} className="mr-2 sm:mr-3 flex-shrink-0" />
            <span>Shipping Information</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-indigo-100">
            Fast, safe, and insured delivery for all electrical equipment
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Shipping Information</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            We partner with trusted courier services to ensure your electrical items arrive quickly and safely.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button 
              onClick={handleTrackOrder}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              <Search size={18} />
              Track Your Order
            </button>
            <button 
              onClick={handleCheckDelivery}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
            >
              <MapPin size={18} />
              Check Delivery Availability
            </button>
          </div>

          {/* Delivery Options */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Delivery Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {shippingOptions.map((option, index) => (
              <div key={index} className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-400 hover:shadow-lg transition">
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 rounded-full mb-3 sm:mb-4 mx-auto">
                  <option.icon size={24} className="text-indigo-600" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 text-center mb-1">{option.title}</h3>
                <p className="text-center text-indigo-600 font-semibold mb-1 text-sm sm:text-base">{option.time}</p>
                <p className="text-xs sm:text-sm text-gray-600 text-center font-medium mb-2">{option.cost}</p>
                <p className="text-xs sm:text-sm text-gray-500 text-center">{option.description}</p>
              </div>
            ))}
          </div>

          {/* Shipping Process */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">How Shipping Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {shippingProcess.map((step, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-600 text-white rounded-full mx-auto mb-3 sm:mb-4">
                  <step.icon size={24} />
                </div>
                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-2">{step.title}</h4>
                <p className="text-xs sm:text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Shipping Policy Highlights */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3">Shipping Policy Highlights</h3>
            <ul className="space-y-2 text-sm sm:text-base text-blue-800">
              <li className="flex items-start">
                <ChevronRight size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                <span>Orders processed within 1–2 working days</span>
              </li>
              <li className="flex items-start">
                <ChevronRight size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                <span>Free shipping for orders above ₹499</span>
              </li>
              <li className="flex items-start">
                <ChevronRight size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                <span>Real-time tracking updates</span>
              </li>
              <li className="flex items-start">
                <ChevronRight size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                <span>Secure packaging for fragile lighting or appliances</span>
              </li>
              <li className="flex items-start">
                <ChevronRight size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                <span>Cash on Delivery (COD) available on select pin codes</span>
              </li>
              <li className="flex items-start">
                <ChevronRight size={18} className="mr-2 mt-0.5 flex-shrink-0" /> 
                <span>Insurance coverage against transit damage</span>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 sm:p-6 rounded-xl">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Need Help with Delivery?</h3>
            <p className="mb-4 text-sm sm:text-base text-indigo-100">
              Contact our logistics team for order tracking or delivery assistance.
            </p>
            <button 
              onClick={handleContactSupport}
              className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition w-full sm:w-auto"
            >
              Contact Shipping Support
            </button>
          </div>
        </div>
      </div>

      {/* Track Order Modal */}
      {selectedModal === 'tracking' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mx-auto mb-4">
              <Search size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">Track Your Order</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
              Enter your tracking number to get real-time updates
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., TRK123456789"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Tip:</strong> Find your tracking number in the shipping confirmation email or your account dashboard.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleTrackSubmit}
                  className="flex-1 bg-indigo-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition"
                >
                  Track Order
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check Delivery Modal */}
      {selectedModal === 'delivery-check' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative my-8">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <MapPin size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">Check Delivery Availability</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
              Enter your pincode to see delivery options
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g., 110001"
                  maxLength="6"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {deliveryEstimate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3 text-sm sm:text-base">Available Delivery Options:</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-green-800">
                    <p><strong>Standard Delivery:</strong> {deliveryEstimate.standard}</p>
                    <p><strong>Express Delivery:</strong> {deliveryEstimate.express}</p>
                    <p><strong>Same Day Delivery:</strong> {deliveryEstimate.sameDay}</p>
                    <p><strong>Cash on Delivery:</strong> {deliveryEstimate.cod ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handlePincodeCheck}
                  className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition"
                >
                  Check Availability
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support Modal */}
      {selectedModal === 'contact' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Shipping Support</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Phone size={20} className="text-indigo-600 mr-2" />
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Phone Support</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Available Mon–Sat: 9AM – 9PM</p>
                <p className="text-base sm:text-lg font-bold text-indigo-600">1800-456-7890</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Mail size={20} className="text-indigo-600 mr-2" />
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Email Support</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Response within 24 hours</p>
                <p className="text-sm sm:text-base font-bold text-indigo-600">shipping@electrostore.com</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <MessageCircle size={20} className="text-indigo-600 mr-2" />
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Live Chat</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">24×7 instant support</p>
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition">
                  Start Chat Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShippingInfo;
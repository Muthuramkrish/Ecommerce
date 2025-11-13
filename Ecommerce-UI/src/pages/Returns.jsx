import React, { useState } from 'react';
import { RefreshCw, Shield, ChevronRight, Package, ArrowLeft, CheckCircle, Clock, X, AlertCircle } from 'lucide-react';

function Returns() {
  const [selectedModal, setSelectedModal] = useState(null);
  const [returnForm, setReturnForm] = useState({
    orderNumber: '',
    itemName: '',
    reason: '',
    description: ''
  });

  const returnSteps = [
    'Log in to your account and go to "My Orders"',
    'Select the order containing the item you wish to return',
    'Click "Return Item" and choose a reason for return',
    'Print the prepaid return shipping label provided',
    'Pack the product securely in its original packaging',
    'Drop it at the nearest courier center or request a pickup'
  ];

  const nonReturnableItems = [
    'Used or installed electrical items (switches, wires, etc.)',
    'Cut-to-length cables or customized orders',
    'Products marked as "Final Sale" or "Non-returnable"',
    'Gift cards or e-vouchers',
    'Perishable or temperature-sensitive goods',
    'Items damaged due to incorrect installation or misuse'
  ];

  const refundTimeline = [
    {
      icon: Package,
      title: 'Return Initiated',
      time: 'Day 1',
      description: 'You raise a return request from your account.'
    },
    {
      icon: ArrowLeft,
      title: 'Item Shipped Back',
      time: 'Day 2-3',
      description: 'You ship the product using our prepaid label.'
    },
    {
      icon: CheckCircle,
      title: 'Quality Check',
      time: 'Day 5-7',
      description: 'We inspect the item to verify condition and eligibility.'
    },
    {
      icon: Clock,
      title: 'Refund Processed',
      time: 'Day 7-10',
      description: 'Refund is credited to your payment method or as store credit.'
    }
  ];

  const returnReasons = [
    'Product defective or not working',
    'Received wrong item',
    'Product not as described',
    'Damaged during shipping',
    'Changed my mind',
    'Other'
  ];

  const handleStartReturn = () => {
    setSelectedModal('return-form');
  };

  const handleContactSupport = () => {
    setSelectedModal('contact-support');
  };

  const handleCloseModal = () => {
    setSelectedModal(null);
    setReturnForm({
      orderNumber: '',
      itemName: '',
      reason: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReturnForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReturn = () => {
    if (!returnForm.orderNumber || !returnForm.itemName || !returnForm.reason) {
      alert('Please fill in all required fields');
      return;
    }
    // Simulate form submission
    alert('Return request submitted successfully! Check your email for return instructions.');
    handleCloseModal();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 flex items-center">
            <RefreshCw size={28} className="mr-2 sm:mr-3 flex-shrink-0" />
            <span>Returns & Refunds</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-indigo-100">
            Easy returns and quick refunds — built for your satisfaction
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Returns & Refund Policy</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            We understand electrical items must work perfectly. If your product is faulty or not as described,
            we make the return process simple and reliable.
          </p>

          {/* Policy Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-green-50 p-4 sm:p-6 rounded-xl border-l-4 border-green-500">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-green-900 mb-2 sm:mb-3 flex items-center">
                <RefreshCw size={20} className="mr-2 flex-shrink-0" /> 7-Day Return Window
              </h3>
              <p className="text-sm sm:text-base text-green-800">
                Return unused, undamaged products within 7 days of delivery. Items must include all accessories,
                manuals, and original packaging.
              </p>
            </div>
            <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border-l-4 border-blue-500">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-900 mb-2 sm:mb-3 flex items-center">
                <Shield size={20} className="mr-2 flex-shrink-0" /> Quality & Safety Check
              </h3>
              <p className="text-sm sm:text-base text-blue-800">
                Each returned electrical item undergoes a quality and safety inspection before approval to ensure
                compliance with standards.
              </p>
            </div>
          </div>

          {/* Return Process */}
          <div className="mb-8 sm:mb-12">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">How to Return an Item</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <ol className="space-y-3 sm:space-y-4">
                {returnSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 text-indigo-600 rounded-full font-bold mr-3 sm:mr-4 text-sm sm:text-base flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-base text-gray-700 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Refund Timeline */}
          <div className="mb-8 sm:mb-12">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Refund Timeline</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {refundTimeline.map((step, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mx-auto mb-3 sm:mb-4">
                    <step.icon size={24} className="text-indigo-600" />
                  </div>
                  <div className="mb-2">
                    <span className="inline-block px-2 sm:px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                      {step.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-2">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Returnable Items */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-yellow-900 mb-2 sm:mb-3 flex items-center">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              Non-Returnable Items
            </h3>
            <p className="text-sm sm:text-base text-yellow-800 mb-3">
              For safety and customization reasons, the following items are not eligible for return:
            </p>
            <ul className="space-y-2 text-sm sm:text-base text-yellow-800">
              {nonReturnableItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <ChevronRight size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Refund Methods */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3">Refund Methods</h3>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
              <p><strong>Original Payment Method:</strong> Refunds to the same card, wallet, or UPI account used at checkout.</p>
              <p><strong>Store Credit:</strong> Instant store credit available for faster reordering.</p>
              <p><strong>Bank Transfer (COD Orders):</strong> Refund within 3–5 business days after verification.</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 sm:p-6 rounded-xl">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Need Help with Returns?</h3>
            <p className="mb-4 text-sm sm:text-base text-indigo-100">
              Our support team is ready to guide you through returns, exchanges, or refund queries.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              <button 
                onClick={handleStartReturn}
                className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition"
              >
                Start a Return
              </button>
              <button 
                onClick={handleContactSupport}
                className="bg-transparent border-2 border-white text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-indigo-600 transition"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Return Form Modal */}
      {selectedModal === 'return-form' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 relative my-8">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-full mx-auto mb-4">
              <RefreshCw size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">Start a Return</h3>
            <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
              Fill out the form below to initiate your return request
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
                <input
                  type="text"
                  name="orderNumber"
                  value={returnForm.orderNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., ORD-12345"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={returnForm.itemName}
                  onChange={handleInputChange}
                  placeholder="e.g., LED Ceiling Light 20W"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return *</label>
                <select
                  name="reason"
                  value={returnForm.reason}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a reason</option>
                  {returnReasons.map((reason, idx) => (
                    <option key={idx} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                <textarea
                  name="description"
                  value={returnForm.description}
                  onChange={handleInputChange}
                  placeholder="Please provide any additional information..."
                  rows="4"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Note:</strong> Ensure the product is unused, in original packaging with all accessories. 
                  You'll receive a prepaid return label via email within 24 hours.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  onClick={handleSubmitReturn}
                  className="flex-1 bg-indigo-600 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 transition"
                >
                  Submit Return Request
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

      {/* Contact Support Modal */}
      {selectedModal === 'contact-support' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Contact Support</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Phone Support</h4>
                <p className="text-sm text-gray-600 mb-1">Available Mon–Sat: 9AM – 9PM</p>
                <p className="text-lg sm:text-xl font-bold text-indigo-600">1800-456-7890</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Email Support</h4>
                <p className="text-sm text-gray-600 mb-1">Response within 24 hours</p>
                <p className="text-base sm:text-lg font-bold text-indigo-600">returns@electrostore.com</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Live Chat</h4>
                <p className="text-sm text-gray-600 mb-3">24×7 instant support available</p>
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

export default Returns;
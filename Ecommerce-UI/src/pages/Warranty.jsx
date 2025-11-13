import React from 'react';
import { Shield, RefreshCw, HelpCircle, CheckCircle, AlertCircle, FileText, X } from 'lucide-react';

function Warranty() {
  const [showClaimForm, setShowClaimForm] = React.useState(false);
  const [showRegisterForm, setShowRegisterForm] = React.useState(false);
  const [claimFormData, setClaimFormData] = React.useState({
    orderNumber: '',
    productName: '',
    issue: '',
    email: '',
    phone: ''
  });
  const [registerFormData, setRegisterFormData] = React.useState({
    productName: '',
    serialNumber: '',
    purchaseDate: '',
    email: '',
    phone: ''
  });

  const warrantyFeatures = [
    {
      icon: Shield,
      title: 'Manufacturer Warranty',
      description:
        'All electrical products come with manufacturer-backed warranty coverage ranging from 6 months to 2 years depending on the category.',
    },
    {
      icon: RefreshCw,
      title: 'Easy Replacement',
      description:
        'Defective items will be replaced or repaired free of charge within the warranty period once verified by our support team.',
    },
    {
      icon: HelpCircle,
      title: 'Extended Protection',
      description:
        'You can add an extended warranty plan for select electrical and lighting products at checkout for additional peace of mind.',
    },
  ];

  const warrantyCategories = [
    {
      category: 'Electrical Switches & Sockets',
      period: '1 Year',
      coverage:
        'Defects in materials or internal mechanisms due to manufacturing fault',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      category: 'Cables & Wires',
      period: '6-12 Months',
      coverage:
        'Insulation faults or conductor performance issues under normal use',
      color: 'bg-orange-50 border-orange-200',
    },
    {
      category: 'Fans & Heaters',
      period: '1-2 Years',
      coverage:
        'Motor, coil, or electrical component failures due to manufacturing defects',
      color: 'bg-green-50 border-green-200',
    },
    {
      category: 'Lighting Fixtures & LED Products',
      period: '1-2 Years',
      coverage:
        'LED driver or internal circuit failure during normal usage',
      color: 'bg-blue-50 border-blue-200',
    },
  ];

  const claimProcess = [
    {
      step: '1',
      title: 'Contact Us',
      description: 'Reach out to our support team with your order number and details of the issue.'
    },
    {
      step: '2',
      title: 'Verification',
      description: 'Our team verifies your product warranty eligibility and purchase details.'
    },
    {
      step: '3',
      title: 'Inspection',
      description: 'Product is inspected to confirm if the fault is covered under warranty.'
    },
    {
      step: '4',
      title: 'Resolution',
      description: 'Receive a replacement product, repair, or store credit as per policy.'
    }
  ];

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    alert('Warranty claim submitted successfully! Our team will contact you within 24-48 hours.');
    setShowClaimForm(false);
    setClaimFormData({
      orderNumber: '',
      productName: '',
      issue: '',
      email: '',
      phone: ''
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    alert('Product registered successfully! You will receive a confirmation email shortly.');
    setShowRegisterForm(false);
    setRegisterFormData({
      productName: '',
      serialNumber: '',
      purchaseDate: '',
      email: '',
      phone: ''
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 flex items-center">
            <Shield size={28} className="mr-2 sm:mr-3 sm:w-9 sm:h-9" /> Warranty & Protection
          </h1>
          <p className="text-base sm:text-lg text-indigo-100">
            Reliable protection for all your electrical essentials.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Warranty & Protection
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            We stand behind the quality and reliability of every product you
            purchase. Here's everything you need to know about your warranty
            coverage.
          </p>

          {/* Warranty Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {warrantyFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl"
              >
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 rounded-full mb-3 sm:mb-4">
                  <feature.icon size={24} className="text-white sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Warranty Coverage by Product Category */}
          <div className="mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Warranty Coverage by Product Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {warrantyCategories.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 sm:p-6 border-2 rounded-xl ${item.color}`}
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-gray-800">{item.category}</h4>
                    <span className="px-2 sm:px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                      {item.period}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 flex items-start">
                    <CheckCircle
                      size={16}
                      className="mr-2 flex-shrink-0 mt-0.5 text-green-600"
                    />
                    {item.coverage}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* What's Covered */}
          <div className="bg-green-50 border-l-4 border-green-500 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 flex items-center">
              <CheckCircle size={20} className="mr-2 sm:w-5 sm:h-5" /> What's Covered
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-green-800">
              <li>✓ Manufacturing or material defects</li>
              <li>✓ Motor and coil malfunctions</li>
              <li>✓ Electrical component or circuit failure</li>
              <li>✓ Product not performing as per specifications</li>
            </ul>
          </div>

          {/* What's Not Covered */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-3 flex items-center">
              <AlertCircle size={20} className="mr-2 sm:w-5 sm:h-5" /> What's Not Covered
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-red-800">
              <li>✗ Physical damage, burns, or corrosion</li>
              <li>✗ Damage from voltage fluctuations or short circuits</li>
              <li>✗ Unauthorized repairs, tampering, or modifications</li>
              <li>✗ Normal wear, tear, or cosmetic damage</li>
              <li>✗ Damage due to improper installation or misuse</li>
            </ul>
          </div>

          {/* Warranty Claim Process */}
          <div className="mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              How to Claim Warranty
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {claimProcess.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 text-white rounded-full mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-lg mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <FileText size={20} className="mr-2 sm:w-5 sm:h-5" /> Important Information
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-blue-800">
              <li>• Keep your invoice/receipt for warranty claims.</li>
              <li>• Warranty is valid only for the original purchaser.</li>
              <li>• Register your product within 30 days of purchase.</li>
              <li>• Extended warranty must be purchased with the product.</li>
              <li>• Industrial or heavy-duty equipment may have varied warranty terms.</li>
            </ul>
          </div>

          {/* Extended Warranty */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 sm:p-6 rounded-xl mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-2 sm:mb-3">
              Extended Warranty Plans
            </h3>
            <p className="text-xs sm:text-sm text-purple-800 mb-4">
              Extend the life of your electrical investments with our extended
              warranty options.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-2">1 Year Extension</h4>
                <p className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">₹199</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Add 1 year to standard warranty
                </p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-2">2 Year Extension</h4>
                <p className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">₹349</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Add 2 years to standard warranty
                </p>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-sm sm:text-base text-gray-800 mb-2">3 Year Extension</h4>
                <p className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">₹499</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Add 3 years to standard warranty
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 sm:p-6 rounded-xl">
            <h3 className="text-lg sm:text-xl font-bold mb-2">Need to Claim Warranty?</h3>
            <p className="mb-4 text-sm sm:text-base text-indigo-100">
              Contact our support team with your order number and product
              details.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <button 
                onClick={() => setShowClaimForm(true)}
                className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition"
              >
                File a Warranty Claim
              </button>
              <button 
                onClick={() => setShowRegisterForm(true)}
                className="bg-transparent border-2 border-white text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-white hover:text-indigo-600 transition"
              >
                Register Product
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warranty Claim Form Modal */}
      {showClaimForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">File Warranty Claim</h3>
              <button 
                onClick={() => setShowClaimForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Order Number *
                </label>
                <input
                  type="text"
                  value={claimFormData.orderNumber}
                  onChange={(e) => setClaimFormData({...claimFormData, orderNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="ORD-12345"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={claimFormData.productName}
                  onChange={(e) => setClaimFormData({...claimFormData, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="LED Bulb 9W"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Issue Description *
                </label>
                <textarea
                  value={claimFormData.issue}
                  onChange={(e) => setClaimFormData({...claimFormData, issue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  rows="3"
                  placeholder="Describe the issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={claimFormData.email}
                  onChange={(e) => setClaimFormData({...claimFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={claimFormData.phone}
                  onChange={(e) => setClaimFormData({...claimFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClaimSubmit}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
                >
                  Submit Claim
                </button>
                <button
                  onClick={() => setShowClaimForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Registration Form Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Register Product</h3>
              <button 
                onClick={() => setShowRegisterForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={registerFormData.productName}
                  onChange={(e) => setRegisterFormData({...registerFormData, productName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="Ceiling Fan 48 inch"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Serial Number *
                </label>
                <input
                  type="text"
                  value={registerFormData.serialNumber}
                  onChange={(e) => setRegisterFormData({...registerFormData, serialNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="SN123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  value={registerFormData.purchaseDate}
                  onChange={(e) => setRegisterFormData({...registerFormData, purchaseDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={registerFormData.email}
                  onChange={(e) => setRegisterFormData({...registerFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={registerFormData.phone}
                  onChange={(e) => setRegisterFormData({...registerFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRegisterSubmit}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
                >
                  Register Product
                </button>
                <button
                  onClick={() => setShowRegisterForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Warranty;
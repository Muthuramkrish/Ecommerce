import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react';
import { createOrder, isAuthenticated } from '../api/user.js';

const CheckoutPage = ({ items, onOrderComplete, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    paymentMethod: 'cod'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const indianStates = useMemo(() => [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry'
  ], []);

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item['new-price']) * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 99;

  // Determine tax per item using product-specific or collection-based tax rates (case-insensitive)
  const collectionTaxRates = {
    cables: 0,
    fans: 0,
    heaters: 0,
    lighting: 0,
    lights: 0,
    switches: 0
  };

  const getItemTaxRatePercent = (item) => {
    const explicitRate = item?.raw?.pricing?.taxRate ?? item?.pricing?.taxRate;
    if (explicitRate != null && !isNaN(Number(explicitRate))) return Number(explicitRate);
    const subcategory = (item?.raw?.anchor?.subcategory || item?.anchor?.subcategory || '').toString().toLowerCase();
    const category = (item?.raw?.anchor?.category || item?.anchor?.category || '').toString().toLowerCase();
    const byCollection = collectionTaxRates[subcategory] ?? collectionTaxRates[category];
    if (byCollection != null && !isNaN(Number(byCollection))) return Number(byCollection);
    // Fallback if nothing available
    return 18;
  };

  const tax = items.reduce((sum, item) => {
    const linePrice = parseFloat(item['new-price']) * item.quantity;
    const ratePercent = getItemTaxRatePercent(item);
    return sum + (linePrice * (ratePercent / 100));
  }, 0);

  const total = subtotal + shipping + tax;
  const roundedTotal = Math.round(total);
  const roundOff = roundedTotal - total;

  const handleInputChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === 'phone') {
      value = (value || '').replace(/\D/g, '').slice(0, 10);
    }
    if (name === 'pincode') {
      value = (value || '').replace(/\D/g, '').slice(0, 6);
    }
    setFormData({
      ...formData,
      [name]: value
    });
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Auto-fill city and district from Indian PIN code; keep state fixed to Tamil Nadu
  useEffect(() => {
    let timeoutId;
    if (formData.pincode && formData.pincode.length === 6) {
      timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await res.json();
          const info = Array.isArray(data) ? data[0] : null;
          if (info && info.Status === 'Success' && Array.isArray(info.PostOffice) && info.PostOffice.length > 0) {
            const offices = info.PostOffice;
            const mainSO = offices.find(o => o.BranchType === 'Sub Office' && o.DeliveryStatus === 'Delivery')
              || offices.find(o => o.BranchType === 'Sub Office')
              || offices[0];
            const detectedCity = (mainSO && (mainSO.Block || mainSO.Name || mainSO.District)) || '';
            const detectedDistrict = (mainSO && mainSO.District) || '';
            setFormData(prev => ({
              ...prev,
              city: detectedCity || prev.city,
              district: detectedDistrict || prev.district,
              state: 'Tamil Nadu' // keep fixed
            }));
            setFormErrors(prev => ({ ...prev, pincode: '' }));
          } else {
            setFormErrors(prev => ({ ...prev, pincode: 'Could not resolve details from PIN code' }));
          }
        } catch (err) {
          setFormErrors(prev => ({ ...prev, pincode: 'Failed to lookup PIN code' }));
        }
      }, 400);
    }
    return () => clearTimeout(timeoutId);
  }, [formData.pincode]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneRegex = /^\d{10}$/;
    const pinRegex = /^\d{6}$/;

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Enter a valid email';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone)) errors.phone = 'Enter a valid 10-digit phone number';
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.district.trim()) errors.district = 'District is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = 'PIN code is required';
    else if (!pinRegex.test(formData.pincode)) errors.pincode = 'Enter a valid 6-digit PIN code';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const isValid = validateForm();
    if (!isValid) {
      setIsProcessing(false);
      return;
    }

    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        alert('Please log in to place an order.');
        setIsProcessing(false);
        return;
      }

      // Prepare order data
      const orderData = {
        items: items,
        shippingInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          pincode: formData.pincode,
        },
        paymentMethod: formData.paymentMethod,
        orderSummary: {
          subtotal: subtotal,
          shipping: shipping,
          tax: tax,
          roundOff: roundOff,
          total: roundedTotal,
        },
      };

      // Create order via API
      const response = await createOrder(orderData);

      if (response.success) {
        setIsProcessing(false);
        onOrderComplete();
        alert(`Order placed successfully! Your order ID is: ${response.orderId}. You will receive a confirmation email shortly.`);
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setIsProcessing(false);
      alert(`Error placing order: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-10">
            <div className="flex items-center justify-between h-14 xs:h-16">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-xs xs:text-sm md:text-base"
              >
                <ArrowLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5 mr-1.5 xs:mr-2" />
                <span className="hidden xs:inline">Back</span>
              </button>
              <h1 className="text-base xs:text-lg font-semibold text-gray-900 text-center flex-1">Checkout</h1>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 xs:gap-8 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 xl:px-10 py-6 xs:py-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-4 xs:p-6 h-fit">
            <h3 className="text-lg xs:text-xl font-semibold text-gray-900 mb-4 xs:mb-6">Order Summary</h3>

            <div className="space-y-3 xs:space-y-4 mb-4 xs:mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 xs:space-x-3 p-2 xs:p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item['image-url']}
                    alt={item['product-title']}
                    className="w-12 h-12 xs:w-16 xs:h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-2 text-xs xs:text-sm">
                      {item['product-title']}
                    </h4>
                    <p className="text-xs xs:text-sm text-gray-500 mt-0.5 xs:mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900 text-xs xs:text-sm flex-shrink-0">
                    ₹{(parseFloat(item['new-price']) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 xs:space-y-3 border-t pt-3 xs:pt-4">
              <div className="flex justify-between text-gray-600 text-xs xs:text-sm">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-xs xs:text-sm">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Free' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 text-xs xs:text-sm">
                <span>Tax</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-xs xs:text-sm">
                <span>Round Off</span>
                <span>₹{roundOff.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg xs:text-xl text-gray-900 border-t pt-2 xs:pt-3">
                <span>Grand Total</span>
                <span>₹{roundedTotal.toLocaleString()}</span>
              </div>
            </div>

            {shipping === 0 && (
              <div className="mt-3 xs:mt-4 p-2.5 xs:p-3 bg-green-50 rounded-lg">
                <p className="text-xs xs:text-sm text-green-700 font-medium">
                  🎉 You've qualified for free shipping!
                </p>
              </div>
            )}

            {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center text-blue-800 mb-2">
                <Shield className="w-5 h-5 mr-2" />
                <span className="font-medium">Secure Payment Guaranteed</span>
              </div>
              <p className="text-sm text-blue-600">
                Your payment information is encrypted and secure. We use industry-standard SSL encryption.
              </p>
            </div> */}
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-xl shadow-lg p-4 xs:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 xs:space-y-6">
              {/* Shipping Information */}
              <div>
                <h3 className="text-base xs:text-lg font-semibold text-gray-900 mb-3 xs:mb-4 flex items-center">
                  <Truck className="w-4 h-4 xs:w-5 xs:h-5 mr-1.5 xs:mr-2" />
                  Shipping Information
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base ${formErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {formErrors.firstName && <p className="col-span-1 xs:col-span-2 text-xs text-red-600">{formErrors.firstName}</p>}
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base ${formErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {formErrors.lastName && <p className="col-span-1 xs:col-span-2 text-xs text-red-600">{formErrors.lastName}</p>}
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 mt-3 xs:mt-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {formErrors.email && <p className="col-span-1 xs:col-span-2 text-xs text-red-600">{formErrors.email}</p>}
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {formErrors.phone && <p className="col-span-1 xs:col-span-2 text-xs text-red-600">{formErrors.phone}</p>}
                </div>
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base mt-3 xs:mt-4 ${formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                />
                {formErrors.address && <p className="text-xs text-red-600 mt-1">{formErrors.address}</p>}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 mt-3 xs:mt-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base ${formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  <input
                    type="text"
                    name="district"
                    placeholder="District"
                    value={formData.district}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base ${formErrors.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                </div>
                {(formErrors.city || formErrors.district) && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 mt-1">
                    <p className="text-xs text-red-600">{formErrors.city}</p>
                    <p className="text-xs text-red-600">{formErrors.district}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 mt-3 xs:mt-4">
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base ${formErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  >
                    {indianStates.map((state) => (
                      <option key={state} value={state} disabled={state !== 'Tamil Nadu'}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="PIN Code"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 xs:px-4 py-2 xs:py-3 border rounded-lg focus:ring-2 focus:border-transparent text-sm xs:text-base ${formErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                </div>
                {(formErrors.state || formErrors.pincode) && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 mt-1">
                    <p className="text-xs text-red-600">{formErrors.state}</p>
                    <p className="text-xs text-red-600">{formErrors.pincode}</p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-base xs:text-lg font-semibold text-gray-900 mb-3 xs:mb-4 flex items-center">
                  <CreditCard className="w-4 h-4 xs:w-5 xs:h-5 mr-1.5 xs:mr-2" />
                  Payment Method
                </h3>
                <div className="mb-3 xs:mb-4 p-2.5 xs:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs xs:text-sm text-yellow-800">
                    <strong>Note:</strong> At this time, we just offer cash on delivery.
                  </p>
                </div>
                <div className="space-y-2 xs:space-y-3">
                  <label className="flex items-center p-3 xs:p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="mr-2 xs:mr-3 text-blue-600"
                    />
                    <span className="w-4 h-4 xs:w-5 xs:h-5 mr-1.5 xs:mr-2 text-center text-base xs:text-lg">💰</span>
                    <span className="font-medium text-sm xs:text-base">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-blue-900 text-white py-3 xs:py-4 px-4 xs:px-6 rounded-lg hover:bg-blue-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm xs:text-base lg:text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 xs:h-5 xs:w-5 border-b-2 border-white mr-1.5 xs:mr-2"></div>
                    <span className="hidden xs:inline">Processing Order...</span>
                    <span className="xs:hidden">Processing...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 xs:w-5 xs:h-5 mr-1.5 xs:mr-2" />
                    <span className="hidden xs:inline">Place Order - ₹{roundedTotal.toLocaleString()}</span>
                    <span className="xs:hidden">Place Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
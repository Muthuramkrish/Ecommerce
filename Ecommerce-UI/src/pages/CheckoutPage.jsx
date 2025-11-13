import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, Truck, Shield, MapPin, Edit2, Trash2, Plus } from 'lucide-react';
import { createOrder, isAuthenticated, getAddresses, saveAddress, deleteAddress } from '../api/user.js';

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
    paymentMethod: 'cod',
    // New address fields
    saveAddress: false,
    addressLabel: 'home',
    setAsDefault: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Address management states
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

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

  // Load saved addresses on mount
  useEffect(() => {
    const loadAddresses = async () => {
      if (!isAuthenticated()) {
        setIsLoadingAddresses(false);
        setShowAddressForm(true); // Show form if not authenticated
        return;
      }

      try {
        const response = await getAddresses();
        if (response.addresses && Array.isArray(response.addresses)) {
          setSavedAddresses(response.addresses);
          
          if (response.addresses.length === 0) {
            // No saved addresses, show form
            setShowAddressForm(true);
          } else {
            // Auto-select default address if exists
            const defaultAddr = response.addresses.find(addr => addr.isDefault);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr._id);
              populateFormFromAddress(defaultAddr);
            } else if (response.addresses.length > 0) {
              // Select first address if no default
              const firstAddr = response.addresses[0];
              setSelectedAddressId(firstAddr._id);
              populateFormFromAddress(firstAddr);
            }
            setShowAddressForm(false); // Hide form when addresses exist
          }
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);
        setShowAddressForm(true); // Show form on error
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

  const populateFormFromAddress = (address) => {
    const nameParts = address.fullName.split(' ');
    setFormData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: address.email || formData.email || '', // Use address email or keep existing
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
      state: address.state,
      pincode: address.pincode,
      paymentMethod: formData.paymentMethod,
      saveAddress: false,
      addressLabel: address.label,
      setAsDefault: address.isDefault
    });
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find(addr => addr._id === addressId);
    if (selected) {
      populateFormFromAddress(selected);
    }
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: formData.email || '', // Keep existing email
      phone: '',
      address: '',
      city: '',
      district: '',
      state: 'Tamil Nadu',
      pincode: '',
      paymentMethod: formData.paymentMethod,
      saveAddress: false, // Default to NOT saving (will create temporary)
      addressLabel: 'home',
      setAsDefault: false
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await deleteAddress(addressId);
      if (response.addresses) {
        
        // Filter out temporary addresses from the response
        const permanentAddresses = response.addresses.filter(addr => !addr.isTemporary);
        setSavedAddresses(permanentAddresses);
        
        // Clear selection if deleted address was selected
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          
          // If no addresses left, show form
          if (response.addresses.length === 0) {
            setShowAddressForm(true);
            setFormData({
              ...formData,
              firstName: '',
              lastName: '',
              phone: '',
              address: '',
              city: '',
              district: '',
              pincode: '',
              saveAddress: false,
              addressLabel: 'home',
              setAsDefault: false
            });
          } else {
            // Select first remaining address
            const firstAddr = response.addresses[0];
            setSelectedAddressId(firstAddr._id);
            populateFormFromAddress(firstAddr);
          }
        }
      }
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert(`Failed to delete address: ${error.message}`);
    }
  };

  const handleEditAddress = (addressId) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find(addr => addr._id === addressId);
    if (selected) {
      populateFormFromAddress(selected);
      setFormData(prev => ({
        ...prev,
        saveAddress: true, // Enable save mode for editing
        addressLabel: selected.label,
        setAsDefault: selected.isDefault
      }));
    }
    setShowAddressForm(true);
  };

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item['new-price']) * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 99;

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
    const { name, type, checked } = e.target;
    let { value } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
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
    }
    
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Auto-fill city and district from PIN code
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
              state: 'Tamil Nadu'
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
      if (!isAuthenticated()) {
        alert('Please log in to place an order.');
        setIsProcessing(false);
        return;
      }

      let addressIdToUse = selectedAddressId;

      // Only save address if checkbox is explicitly checked
      if (formData.saveAddress) {
        try {
          const addressToSave = {
            label: formData.addressLabel,
            fullName: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            district: formData.district,
            state: formData.state,
            pincode: formData.pincode,
            isDefault: formData.setAsDefault,
            isTemporary: false,
            _id: selectedAddressId || undefined
          };

          const response = await saveAddress(addressToSave);
          
          // If this is a new address, get the ID from the response
          if (!selectedAddressId && response.addresses && response.addresses.length > 0) {
            const savedAddress = response.addresses[response.addresses.length - 1];
            addressIdToUse = savedAddress._id;
            console.log('✅ New address saved with ID:', addressIdToUse);
          }
        } catch (addressError) {
          console.error('Failed to save address:', addressError);
          alert('Failed to save address. Please try again.');
          setIsProcessing(false);
          return;
        }
      } 
      // If not saving and no address is selected, create a temporary address for this order only
      else if (!selectedAddressId) {
        try {
          const temporaryAddress = {
            label: 'other',
            fullName: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            district: formData.district,
            state: formData.state,
            pincode: formData.pincode,
            isDefault: false,
            isTemporary: true // Mark as temporary
          };

          const response = await saveAddress(temporaryAddress);
          
          if (response.addresses && response.addresses.length > 0) {
            const tempAddress = response.addresses[response.addresses.length - 1];
            addressIdToUse = tempAddress._id;
            console.log('✅ Temporary address created with ID:', addressIdToUse);
          }
        } catch (addressError) {
          console.error('Failed to create temporary address:', addressError);
          alert('Failed to process address. Please try again.');
          setIsProcessing(false);
          return;
        }
      }

      // Validate that we have an address ID
      if (!addressIdToUse) {
        alert('Please select or save an address before placing the order.');
        setIsProcessing(false);
        return;
      }

      const orderData = {
        items: items,
        shippingInfo: {
          addressId: addressIdToUse,
          email: formData.email,
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

      console.log('📦 Submitting order with addressId:', addressIdToUse);

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>

          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item['image-url']}
                  alt={item['product-title']}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-2">
                    {item['product-title']}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-900">
                  ₹{(parseFloat(item['new-price']) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                {shipping === 0 ? 'Free' : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Round Off</span>
              <span>₹{roundOff.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-3">
              <span>Grand Total</span>
              <span>₹{roundedTotal.toLocaleString()}</span>
            </div>
          </div>

          {shipping === 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                🎉 You've qualified for free shipping!
              </p>
            </div>
          )}
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Saved Addresses Section - Only show if authenticated and has addresses */}
            {isAuthenticated() && savedAddresses.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Saved Addresses
                  </h3>
                  {!showAddressForm && (
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add New
                    </button>
                  )}
                </div>

                {isLoadingAddresses ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  !showAddressForm && (
                  <div className="space-y-3 mb-6">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === addr._id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAddressSelect(addr._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{addr.fullName}</span>
                              {addr.isDefault && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">
                                {addr.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{addr.phone}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {addr.address}, {addr.city}, {addr.district}, {addr.state} - {addr.pincode}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(addr._id);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit address"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr._id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                )}
              </div>
            )}

            {/* Shipping Information Form - Show only when showAddressForm is true */}
            {showAddressForm && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Information
                  </h3>
                  {isAuthenticated() && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        // Select first address or default
                        const defaultAddr = savedAddresses.find(addr => addr.isDefault);
                        const addrToSelect = defaultAddr || savedAddresses[0];
                        if (addrToSelect) {
                          setSelectedAddressId(addrToSelect._id);
                          populateFormFromAddress(addrToSelect);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {formErrors.firstName && <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {formErrors.lastName && <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {formErrors.address && <p className="text-xs text-red-600 mt-1">{formErrors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="district"
                      placeholder="District"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {formErrors.district && <p className="text-xs text-red-600 mt-1">{formErrors.district}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    >
                      {indianStates.map((state) => (
                        <option key={state} value={state} disabled={state !== 'Tamil Nadu'}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {formErrors.state && <p className="text-xs text-red-600 mt-1">{formErrors.state}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="PIN Code"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    />
                    {formErrors.pincode && <p className="text-xs text-red-600 mt-1">{formErrors.pincode}</p>}
                  </div>
                </div>

                {/* Save Address Options */}
                {isAuthenticated() && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        name="saveAddress"
                        checked={formData.saveAddress}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        Save this address for future orders
                      </span>
                    </label>

                    {formData.saveAddress && (
                      <div className="ml-6 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Label
                          </label>
                          <select
                            name="addressLabel"
                            value={formData.addressLabel}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="home">🏠 Home</option>
                            <option value="work">💼 Work</option>
                            <option value="company">🏢 Company</option>
                            <option value="other">📍 Other</option>
                          </select>
                        </div>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="setAsDefault"
                            checked={formData.setAsDefault}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Set as default address
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Payment Method
              </h3>
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> At this time, we just offer cash on delivery.
                </p>
              </div>
              <div className="space-y-3">
                <label className="flex items-center p-6 border border-gray-300 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all duration-500 hover:scale-105 hover:shadow-lg group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="mr-4 w-5 h-5 text-blue-600"
                  />
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-all duration-300">
                      <span className="text-2xl">💰</span>
                    </div>
                    <span className="font-bold text-lg">Cash on Delivery</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span className="relative z-10">Processing Order...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-3 relative z-10 group-hover:animate-bounce" />
                  <span className="relative z-10">Place Order - ₹{roundedTotal.toLocaleString()}</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
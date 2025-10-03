import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, Package, Users, Truck, Search } from 'lucide-react';
import { fetchAllProducts } from '../api/client';

const BulkOrderPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchAllProducts();
        if (!isMounted) return;
        const mapped = (Array.isArray(data) ? data : []).map(p => ({
          id: p?.identifiers?.productId || '',
          title: p?.characteristics?.title || 'Untitled Product',
          price: p?.pricing?.basePrice || 0,
          taxRate: p?.pricing?.taxRate ?? null,
          image: p?.characteristics?.images?.primary?.[0] || '',
          category: p?.anchor?.subcategory || p?.anchor?.category || 'General',
          collection: p?.collection || 'Unknown',
          stock: (p?.inventory?.availableQuantity ?? 0)
        }));
        setProducts(mapped);
      } catch (e) {
        console.error('Failed to load products for bulk order:', e);
        if (!isMounted) return;
        setProducts([]);
      }
    })();
    return () => { isMounted = false; };
  }, []);

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

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    zipCode: '',
    orderType: 'electrical',
    specialRequirements: '',
    items: [
      {
        productName: '',
        productId: '',
        quantity: '',
        unitPrice: '',
        totalPrice: '',
        searchQuery: '',
        showDropdown: false,
        quantityError: ''
      }
    ]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // State dropdown: default Tamil Nadu; other states disabled for future use
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.product-search-container')) {
        setFormData(prev => ({
          ...prev,
          items: prev.items.map(item => ({ ...item, showDropdown: false }))
        }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === 'phone') {
      value = (value || '').replace(/\D/g, '').slice(0, 10);
    }
    if (name === 'zipCode') {
      value = (value || '').replace(/\D/g, '').slice(0, 6);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear field-specific error on change
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Auto-fill city from Indian PIN code
  useEffect(() => {
    let timeoutId;
    if (formData.zipCode && formData.zipCode.length === 6) {
      timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.zipCode}`);
          const data = await res.json();
          const info = Array.isArray(data) ? data[0] : null;
          if (info && info.Status === 'Success' && Array.isArray(info.PostOffice) && info.PostOffice.length > 0) {
            const offices = info.PostOffice;
            const mainSO = offices.find(o => o.BranchType === 'Sub Office' && o.DeliveryStatus === 'Delivery')
              || offices.find(o => o.BranchType === 'Sub Office')
              || offices[0];
            const detectedCity = (mainSO && (mainSO.Block || mainSO.Name || mainSO.District)) || '';
            const detectedDistrict = (mainSO && mainSO.District) || '';
            setFormData(prev => ({ ...prev, city: detectedCity || prev.city, district: detectedDistrict || prev.district }));
            // Keep state fixed to Tamil Nadu even if API returns otherwise
            setFormErrors(prev => ({ ...prev, zipCode: '' }));
          } else {
            setFormErrors(prev => ({ ...prev, zipCode: 'Could not resolve city from PIN code' }));
          }
        } catch (err) {
          setFormErrors(prev => ({ ...prev, zipCode: 'Failed to lookup PIN code' }));
        }
      }, 400);
    }
    return () => clearTimeout(timeoutId);
  }, [formData.zipCode]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'quantity') {
      // Allow any number but validate and show error if <10 or > stock
      newItems[index][field] = value;
      const selected = products.find(p => p.id === newItems[index].productId);
      const stock = selected?.stock;
      const parsed = parseInt(value, 10);
      let error = '';
      if (value === '') {
        error = 'Quantity is required';
      } else if (isNaN(parsed)) {
        error = 'Enter a valid number';
      } else if (parsed < 10) {
        error = 'Minimum quantity is 10';
      } else if (stock != null && stock > 0 && parsed > stock) {
        error = `Only ${stock} available`;
      }
      newItems[index].quantityError = error;
    } else if (field === 'unitPrice') {
      // Unit price is auto-filled and read-only when product selected; ignore edits
      const currentItem = newItems[index];
      if (currentItem.productId) {
        return; // do not allow manual change after selection
      }
      newItems[index][field] = value;
    } else {
      newItems[index][field] = value;
    }
    
    // Calculate total price for this item
    if (field === 'quantity' || field === 'unitPrice') {
      const quantityStr = field === 'quantity' ? value : newItems[index].quantity;
      const unitPriceStr = field === 'unitPrice' ? value : newItems[index].unitPrice;
      const q = parseFloat(quantityStr);
      const u = parseFloat(unitPriceStr);
      newItems[index].totalPrice = (isFinite(q) && isFinite(u)) ? (q * u).toFixed(2) : '';
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleProductSearch = (index, searchQuery) => {
    const newItems = [...formData.items];
    newItems[index].searchQuery = searchQuery;
    newItems[index].showDropdown = searchQuery.length > 0;
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const handleProductSelect = (index, product) => {
    const newItems = [...formData.items];
    newItems[index].productName = product.title;
    newItems[index].productId = product.id;
    newItems[index].unitPrice = product.price.toString();
    newItems[index].searchQuery = product.title;
    newItems[index].showDropdown = false;
    // If empty, seed quantity to 10, else keep user's value
    if (!newItems[index].quantity) {
      newItems[index].quantity = '10';
    }
    // Validate and set error
    const parsed = parseInt(newItems[index].quantity, 10);
    let error = '';
    if (isNaN(parsed) || parsed < 10) {
      error = 'Minimum quantity is 10';
    } else if (product.stock != null && product.stock > 0 && parsed > product.stock) {
      error = `Only ${product.stock} available`;
    }
    newItems[index].quantityError = error;
    
    // Calculate total price if quantity is already entered
    if (newItems[index].quantity) {
      const quantity = parseFloat(newItems[index].quantity);
      const unitPrice = parseFloat(product.price);
      newItems[index].totalPrice = (quantity * unitPrice).toFixed(2);
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const getFilteredProducts = (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    return products
      .filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 results for performance
  };

  // Tax computation similar to CheckoutPage
  const collectionTaxRates = {
    cables: 0,
    fans: 0,
    heaters: 0,
    lighting: 0,
    lights: 0,
    switches: 0
  };

  const getItemTaxRatePercent = (product) => {
    if (!product) return 18;
    const explicitRate = product?.taxRate;
    if (explicitRate != null && !isNaN(Number(explicitRate))) return Number(explicitRate);
    const subcategory = (product?.category || '').toString().toLowerCase();
    const byCollection = collectionTaxRates[subcategory];
    if (byCollection != null && !isNaN(Number(byCollection))) return Number(byCollection);
    return 18;
  };

  const calculateBreakdown = () => {
    // subtotal from item totals (quantity * unit price)
    const subtotal = formData.items.reduce((total, item) => {
      const line = parseFloat(item.totalPrice) || 0;
      return total + line;
    }, 0);

    // tax using product-specific tax rate when available
    const tax = formData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice);
      if (!isFinite(quantity) || !isFinite(unitPrice)) return sum;
      const product = products.find(p => p.id === item.productId);
      const ratePercent = getItemTaxRatePercent(product);
      const linePrice = quantity * unitPrice;
      return sum + (linePrice * (ratePercent / 100));
    }, 0);

    const total = subtotal + tax;
    const roundedTotal = Math.round(total);
    return {
      subtotal,
      tax,
      total,
      roundedTotal
    };
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productName: '',
        productId: '',
        quantity: '',
        unitPrice: '',
        totalPrice: '',
        searchQuery: '',
        showDropdown: false
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.totalPrice) || 0);
    }, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      alert('Bulk order submitted successfully! We will contact you within 24 hours.');
      setIsSubmitting(false);
    }, 2000);
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneRegex = /^\d{10}$/; // exactly 10 digits
    const zipRegex = /^\d{6}$/; // Indian PIN code

    if (!formData.companyName.trim()) errors.companyName = 'Company name is required';
    if (!formData.contactPerson.trim()) errors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) errors.email = 'Enter a valid email';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone)) errors.phone = 'Enter a valid phone number';
    if (!formData.address.trim()) errors.address = 'Street address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.district.trim()) errors.district = 'District is required';
    if (!formData.state.trim()) errors.state = 'State/Province is required';
    if (!formData.zipCode.trim()) errors.zipCode = 'ZIP/Postal code is required';
    else if (!zipRegex.test(formData.zipCode)) errors.zipCode = 'Enter a valid ZIP/Postal code';
    // country and orderType are not required/removed

    // Validate items
    if (!formData.items.length) {
      errors.items = 'Add at least one product item';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.productId) {
          errors[`item_${index}_product`] = 'Please select a product';
        }
        const qty = parseInt(item.quantity, 10);
        if (!item.quantity) {
          errors[`item_${index}_quantity`] = 'Quantity is required';
        } else if (isNaN(qty) || qty < 10) {
          errors[`item_${index}_quantity`] = 'Minimum quantity is 10';
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm md:text-base"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-base md:text-lg font-semibold text-gray-900">Bulk Order Form</h1>
            <div className="w-32" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Description */}
        <div className="mb-8">
          <div className="text-center">
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Submit your bulk order request for electrical products. Our team will review and get back to you with competitive pricing and delivery options.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulk Pricing</h3>
            <p className="text-gray-600">Get special discounted rates for large quantity orders</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <Truck className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Priority shipping and logistics support for bulk orders</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dedicated Support</h3>
            <p className="text-gray-600">Personal account manager for your bulk order needs</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Order Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter contact person name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="Enter city"
                />
                {formErrors.city && <p className="mt-1 text-xs text-red-600">{formErrors.city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="Enter district"
                />
                {formErrors.district && <p className="mt-1 text-xs text-red-600">{formErrors.district}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
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
                {formErrors.state && <p className="mt-1 text-xs text-red-600">{formErrors.state}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  inputMode="numeric"
                  maxLength={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.zipCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  placeholder="Enter ZIP code"
                />
                {formErrors.zipCode && <p className="mt-1 text-xs text-red-600">{formErrors.zipCode}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements
              </label>
              <textarea
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requirements, certifications, or specifications..."
              />
            </div>

            {/* Product Items */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative product-search-container">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.searchQuery}
                          onChange={(e) => handleProductSearch(index, e.target.value)}
                          required
                          className={`w-full px-3 py-2 pr-8 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors[`item_${index}_product`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                          placeholder="Search for products..."
                        />
                        <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        
                        {/* Search Dropdown */}
                        {item.showDropdown && (
                          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto mt-1 border-t-2 border-t-blue-500">
                            {getFilteredProducts(item.searchQuery).length > 0 ? (
                              <>
                                <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs text-gray-600 font-medium">
                                  {getFilteredProducts(item.searchQuery).length} product{getFilteredProducts(item.searchQuery).length !== 1 ? 's' : ''} found
                                </div>
                                {getFilteredProducts(item.searchQuery).map((product) => (
                                <div
                                  key={product.id}
                                  onClick={() => handleProductSelect(index, product)}
                                  className="flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-12 h-12 object-cover rounded-lg mr-3 border border-gray-200"
                                    onError={(e) => {
                                      e.target.src = 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=100';
                                    }}
                                  />
                                  <div className="flex-1 min-w-0 pr-3">
                                    <div className="font-medium text-gray-900 text-sm truncate">{product.title}</div>
                                    <div className="text-gray-500 text-xs mt-1">{product.category}</div>
                                  </div>
                                  <div className="flex-shrink-0 text-right">
                                    <div className="bg-green-100 text-green-800 font-bold text-sm px-3 py-1 rounded-full">
                                      ₹{product.price.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                ))}
                              </>
                            ) : (
                              <div className="p-4 text-gray-500 text-center">
                                <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                <div className="text-sm">No products found</div>
                                <div className="text-xs text-gray-400 mt-1">Try searching with different keywords</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Selected Product Display */}
                      {item.productName && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-blue-800 font-medium text-sm">Selected: </span>
                              <span className="text-blue-600 text-sm">{item.productName}</span>
                            </div>
                            {item.unitPrice && (
                              <div className="bg-green-100 text-green-800 font-semibold text-xs px-2 py-1 rounded">
                                ₹{parseFloat(item.unitPrice).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Hidden input for form validation */}
                      <input
                        type="hidden"
                        value={item.productName}
                        required
                      />
                      {formErrors[`item_${index}_product`] && (
                        <p className="mt-1 text-xs text-red-600">{formErrors[`item_${index}_product`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        step="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${item.quantityError || formErrors[`item_${index}_quantity`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                        placeholder="Qty"
                      />
                      {(item.quantityError || formErrors[`item_${index}_quantity`]) && (
                        <p className="mt-1 text-xs text-red-600">{item.quantityError || formErrors[`item_${index}_quantity`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price (₹) {item.productId && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        step="0.01"
                        min="0"
                        readOnly={!!item.productId}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${item.productId ? 'bg-green-50 cursor-not-allowed' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Price (₹)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item.totalPrice}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            placeholder="0.00"
                          />
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-6">
              {(() => {
                const { subtotal, tax, total, roundedTotal } = calculateBreakdown();
                const roundOff = roundedTotal - total;
                return (
                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="text-gray-700 text-sm">Subtotal: ₹{subtotal.toFixed(2)}</div>
                      <div className="text-gray-700 text-sm">Tax: ₹{tax.toFixed(2)}</div>
                      <div className="text-gray-700 text-sm">Round Off: ₹{roundOff.toFixed(2)}</div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">Grand Total : ₹{roundedTotal.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Submit Button */}
            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Bulk Order Request'}
              </button>
              <p className="text-center text-sm text-gray-600 mt-3">
                We'll review your request and contact you within 24 hours with pricing and delivery options.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderPage;

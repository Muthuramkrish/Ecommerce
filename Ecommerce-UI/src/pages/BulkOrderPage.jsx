import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, Package, Users, Truck, Search, Eye, Clock, CheckCircle, XCircle, AlertTriangle, Star } from 'lucide-react';
import { fetchAllProducts } from '../api/client';
import { createBulkOrder, getUserBulkOrders, getBulkOrderById, isAuthenticated } from '../api/user.js';

const BulkOrderPage = ({ onBack }) => {
  // View state management
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'details'
  const [bulkOrders, setBulkOrders] = useState([]);
  const [selectedBulkOrder, setSelectedBulkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create order state management
  const [products, setProducts] = useState([]);
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

  const indianStates = useMemo(() => [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry'
  ], []);

  // Load data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load products for create form
        const productsData = await fetchAllProducts();
        const mapped = (Array.isArray(productsData) ? productsData : []).map(p => {
          const productId = p?.identifiers?.productId || p?._id || p?.id || '';
          console.log('Mapping product:', {
            title: p?.characteristics?.title,
            identifiersProductId: p?.identifiers?.productId,
            _id: p?._id,
            id: p?.id,
            finalId: productId
          });
          return {
            id: productId,
            title: p?.characteristics?.title || 'Untitled Product',
            price: p?.pricing?.basePrice || 0,
            taxRate: p?.pricing?.taxRate ?? null,
            image: p?.characteristics?.images?.primary?.[0] || '',
            category: p?.anchor?.subcategory || p?.anchor?.category || 'General',
            collection: p?.collection,
            stock: (p?.inventory?.availableQuantity ?? 0)
          };
        }).filter(product => product.id && product.id.trim() !== ''); // Filter out products with empty IDs
        setProducts(mapped);

        // Load existing bulk orders if user is authenticated
        if (isAuthenticated()) {
          const response = await getUserBulkOrders();
          if (response.success) {
            setBulkOrders(response.bulkOrders || []);
          } else {
            setError(response.message || 'Failed to fetch bulk orders');
          }
        } else {
          setError('Please log in to view your bulk orders.');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message || 'Failed to load data');
        setProducts([]);
        setBulkOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

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

  // Helper functions for status display
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'under_review': return <Eye className="w-5 h-5 text-blue-500" />;
      case 'quoted': return <Star className="w-5 h-5 text-purple-500" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Package className="w-5 h-5 text-indigo-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'under_review': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'quoted': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'processing': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'shipped': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'delivered': return 'text-green-700 bg-green-100 border-green-300';
      case 'cancelled':
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Form handling functions
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
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'quantity') {
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
    
    // Debug logging
    console.log('Selected product:', {
      title: product.title,
      id: product.id,
      price: product.price
    });
    
    if (!newItems[index].quantity) {
      newItems[index].quantity = '10';
    }
    
    const parsed = parseInt(newItems[index].quantity, 10);
    let error = '';
    if (isNaN(parsed) || parsed < 10) {
      error = 'Minimum quantity is 10';
    } else if (product.stock != null && product.stock > 0 && parsed > product.stock) {
      error = `Only ${product.stock} available`;
    }
    newItems[index].quantityError = error;
    
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

  const getFilteredProducts = (searchQuery, currentIndex) => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const selectedProductIds = formData.items
      .filter(item => item.productId)
      .map(item => item.productId);
    
    const currentItemProductId = formData.items[currentIndex]?.productId;
    
    return products
      .filter(product => {
        if (selectedProductIds.includes(product.id) && product.id !== currentItemProductId) {
          return false;
        }
        
        return product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               product.category.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .slice(0, 10);
  };

  // Tax computation
  const collectionTaxRates = {
    cables: 0, fans: 0, heaters: 0, lighting: 0, lights: 0, switches: 0
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
    const subtotal = formData.items.reduce((total, item) => {
      const line = parseFloat(item.totalPrice) || 0;
      return total + line;
    }, 0);

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
    return { subtotal, tax, total, roundedTotal };
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
        showDropdown: false,
        quantityError: ''
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

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneRegex = /^\d{10}$/;
    const zipRegex = /^\d{6}$/;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (!isAuthenticated()) {
        alert('Please log in to submit a bulk order.');
        setIsSubmitting(false);
        return;
      }

      const { subtotal, tax, total, roundedTotal } = calculateBreakdown();

      const bulkOrderData = {
        companyInfo: {
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        items: formData.items.map(item => {
          console.log('Submitting item:', {
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity
          });
          return {
            productId: item.productId,
            productName: item.productName,
            quantity: parseInt(item.quantity, 10),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
            taxRate: getItemTaxRatePercent(products.find(p => p.id === item.productId)),
          };
        }),
        orderType: formData.orderType,
        specialRequirements: formData.specialRequirements,
        orderSummary: {
          subtotal: subtotal,
          tax: tax,
          total: total,
          roundedTotal: roundedTotal,
        },
      };

      const response = await createBulkOrder(bulkOrderData);

      if (response.success) {
        setIsSubmitting(false);
        alert(`Bulk order submitted successfully! Your bulk order ID is: ${response.bulkOrderId}. We will contact you within 24 hours with pricing and delivery options.`);
        
        // Reset form and refresh orders list
        setFormData({
          companyName: '', contactPerson: '', email: '', phone: '', address: '',
          city: '', district: '', state: 'Tamil Nadu', zipCode: '', orderType: 'electrical',
          specialRequirements: '',
          items: [{
            productName: '', productId: '', quantity: '', unitPrice: '', totalPrice: '',
            searchQuery: '', showDropdown: false, quantityError: ''
          }]
        });
        
        // Refresh the orders list and switch to list view
        const ordersResponse = await getUserBulkOrders();
        if (ordersResponse.success) {
          setBulkOrders(ordersResponse.bulkOrders || []);
        }
        setCurrentView('list');
      } else {
        throw new Error(response.message || 'Failed to submit bulk order');
      }
    } catch (error) {
      console.error('Bulk order submission error:', error);
      setIsSubmitting(false);
      alert(`Error submitting bulk order: ${error.message}`);
    }
  };

  const handleViewBulkOrder = async (bulkOrderId) => {
    try {
      const response = await getBulkOrderById(bulkOrderId);
      if (response.success) {
        setSelectedBulkOrder(response.bulkOrder);
        setCurrentView('details');
      } else {
        alert('Failed to load bulk order details');
      }
    } catch (error) {
      console.error('Error fetching bulk order details:', error);
      alert('Failed to load bulk order details');
    }
  };

  // Main render logic based on current view
  const renderHeader = () => {
    let title = 'Bulk Orders';
    let backAction = onBack;

    if (currentView === 'create') {
      title = 'Create Bulk Order';
      backAction = () => setCurrentView('list');
    } else if (currentView === 'details') {
      title = 'Bulk Order Details';
      backAction = () => setCurrentView('list');
    }

    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button 
              onClick={backAction}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            <h1 className="text-base md:text-lg font-semibold text-gray-900 text-center flex-1">{title}</h1>
            {currentView === 'list' && (
              <button
                onClick={() => setCurrentView('create')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 text-sm font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
              >
                <Plus className="w-4 h-4 group-hover:animate-bounce" />
                <span className="hidden sm:inline relative z-10">New Order</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Render based on current view
  if (currentView === 'details' && selectedBulkOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bulk Order #{selectedBulkOrder.bulkOrderId}</h2>
                <p className="text-gray-600">Submitted on {formatDate(selectedBulkOrder.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getPriorityColor(selectedBulkOrder.priority)}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium capitalize">{selectedBulkOrder.priority}</span>
                </div>
                <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(selectedBulkOrder.status)}`}>
                  {getStatusIcon(selectedBulkOrder.status)}
                  <span className="font-medium">{formatStatus(selectedBulkOrder.status)}</span>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-900">{selectedBulkOrder.companyInfo.companyName}</p>
                  <p className="text-gray-600">Contact: {selectedBulkOrder.companyInfo.contactPerson}</p>
                  <p className="text-gray-600">{selectedBulkOrder.companyInfo.email}</p>
                  <p className="text-gray-600">{selectedBulkOrder.companyInfo.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">
                    {selectedBulkOrder.companyInfo.address}<br />
                    {selectedBulkOrder.companyInfo.city}, {selectedBulkOrder.companyInfo.district}<br />
                    {selectedBulkOrder.companyInfo.state} - {selectedBulkOrder.companyInfo.zipCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedBulkOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">Category: {item.category}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{(item.totalPrice).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">₹{item.unitPrice.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Type and Special Requirements */}
            {(selectedBulkOrder.orderType !== 'electrical' || selectedBulkOrder.specialRequirements) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Order Type:</span> {selectedBulkOrder.orderType.charAt(0).toUpperCase() + selectedBulkOrder.orderType.slice(1)}
                  </p>
                  {selectedBulkOrder.specialRequirements && (
                    <p className="text-gray-600">
                      <span className="font-medium">Special Requirements:</span> {selectedBulkOrder.specialRequirements}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Quote Information */}
            {selectedBulkOrder.quotedPrice && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Quote Information</h3>
                <p className="text-green-800">
                  <span className="font-medium">Quoted Price:</span> ₹{selectedBulkOrder.quotedPrice.toLocaleString()}
                </p>
                {selectedBulkOrder.quotedBy && (
                  <p className="text-green-800">
                    <span className="font-medium">Quoted By:</span> {selectedBulkOrder.quotedBy}
                  </p>
                )}
                {selectedBulkOrder.quotedAt && (
                  <p className="text-green-800">
                    <span className="font-medium">Quoted On:</span> {formatDate(selectedBulkOrder.quotedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{selectedBulkOrder.orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹{selectedBulkOrder.orderSummary.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>₹{selectedBulkOrder.orderSummary.roundedTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedBulkOrder.notes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Notes</h3>
                <p className="text-blue-800">{selectedBulkOrder.notes}</p>
              </div>
            )}

            {/* Tracking Information */}
            {selectedBulkOrder.trackingId && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">Tracking Information</h3>
                <p className="text-orange-800">Tracking ID: <span className="font-mono">{selectedBulkOrder.trackingId}</span></p>
              </div>
            )}

            {/* Expected Delivery */}
            {selectedBulkOrder.expectedDelivery && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Expected Delivery</h3>
                <p className="text-green-800">{formatDate(selectedBulkOrder.expectedDelivery)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}
        
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
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                    <span className="relative z-10">Add Item</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
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
                              {getFilteredProducts(item.searchQuery, index).length > 0 ? (
                                <>
                                  <div className="sticky top-0 bg-gray-50 px-3 py-2 border-b border-gray-200 text-xs text-gray-600 font-medium">
                                    {getFilteredProducts(item.searchQuery, index).length} product{getFilteredProducts(item.searchQuery, index).length !== 1 ? 's' : ''} found
                                  </div>
                                  {getFilteredProducts(item.searchQuery, index).map((product) => (
                                  <div
                                    key={product.id}
                                    onClick={() => handleProductSelect(index, product)}
                                    className="flex items-center p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-300 hover:scale-105 hover:shadow-md rounded-lg"
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
                                className="px-3 py-2 text-red-600 hover:text-red-800 transition-all duration-300 flex-shrink-0 hover:scale-110 hover:bg-red-50 rounded-lg group/btn"
                              >
                                <Trash2 className="w-5 h-5 group-hover/btn:animate-bounce" />
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span className="relative z-10">Submitting...</span>
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10">Submit Bulk Order Request</span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </>
                  )}
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
  }

  // Default list view
  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bulk Orders</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
            >
              <span className="relative z-10">Try Again</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </button>
          </div>
        ) : bulkOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bulk Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't submitted any bulk orders yet. Create your first bulk order request!</p>
            <button
              onClick={() => setCurrentView('create')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
            >
              <span className="relative z-10">Create First Bulk Order</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bulkOrders.map((bulkOrder) => (
              <div key={bulkOrder.bulkOrderId} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bulk Order #{bulkOrder.bulkOrderId}</h3>
                    <p className="text-gray-600">Submitted on {formatDate(bulkOrder.createdAt)}</p>
                    <p className="text-sm text-gray-500">{bulkOrder.companyInfo.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full border text-xs ${getPriorityColor(bulkOrder.priority)}`}>
                      {bulkOrder.priority.toUpperCase()}
                    </div>
                    <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(bulkOrder.status)}`}>
                      {getStatusIcon(bulkOrder.status)}
                      <span className="font-medium">{formatStatus(bulkOrder.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">
                      {bulkOrder.items.length} item{bulkOrder.items.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-gray-900">
                        ₹{bulkOrder.orderSummary.roundedTotal.toLocaleString()}
                      </p>
                      {bulkOrder.quotedPrice && (
                        <p className="text-lg font-semibold text-green-600">
                          Quoted: ₹{bulkOrder.quotedPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewBulkOrder(bulkOrder.bulkOrderId)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
                  >
                    <Eye className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="relative z-10">View Details</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </button>
                </div>

                {/* Items Preview */}
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {bulkOrder.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                        {item.productName} ({item.quantity})
                      </div>
                    ))}
                    {bulkOrder.items.length > 3 && (
                      <div className="bg-gray-200 px-3 py-1 rounded-full text-sm text-gray-600">
                        +{bulkOrder.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkOrderPage;
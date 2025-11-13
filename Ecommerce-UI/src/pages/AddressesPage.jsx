import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import { getAddresses, saveAddress, deleteAddress } from '../api/user.js';

const AddressesPage = ({ onBack }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
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
    addressLabel: 'home',
    isDefault: false
  });
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

  useEffect(() => {
    loadAddresses();
  }, []);

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

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      setAddresses(data.addresses || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      alert('Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    try {
      const addressData = {
        label: formData.addressLabel,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: formData.isDefault,
        _id: editingAddress?._id
      };
      
      await saveAddress(addressData);
      await loadAddresses();
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        state: 'Tamil Nadu',
        pincode: '',
        addressLabel: 'home',
        isDefault: false
      });
      setFormErrors({});
    } catch (error) {
      console.error('Error saving address:', error);
      alert(error.message || 'Failed to save address. Please try again.');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    const nameParts = (address.fullName || '').split(' ');
    setFormData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: address.email || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      district: address.district || '',
      state: address.state || 'Tamil Nadu',
      pincode: address.pincode || '',
      addressLabel: address.label || 'home',
      isDefault: address.isDefault || false
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(addressId);
      await loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert(error.message || 'Failed to delete address. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      state: 'Tamil Nadu',
      pincode: '',
      addressLabel: 'home',
      isDefault: false
    });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      {/* Page Header - Simplified without duplicate logo */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">My Addresses</h1>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingAddress(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  address: '',
                  city: '',
                  district: '',
                  state: 'Tamil Nadu',
                  pincode: '',
                  addressLabel: 'home',
                  isDefault: false
                });
                setFormErrors({});
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-xl group relative overflow-hidden"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10 hidden sm:inline">Add</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 animate-slideDown">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      formErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formErrors.firstName && <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      formErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formErrors.lastName && <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formErrors.email && <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    formErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  required
                />
                {formErrors.address && <p className="text-xs text-red-600 mt-1">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      formErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formErrors.city && <p className="text-xs text-red-600 mt-1">{formErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    placeholder="District"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      formErrors.district ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formErrors.district && <p className="text-xs text-red-600 mt-1">{formErrors.district}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      formErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="PIN Code"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 ${
                      formErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {formErrors.pincode && <p className="text-xs text-red-600 mt-1">{formErrors.pincode}</p>}
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Label
                  </label>
                  <select
                    name="addressLabel"
                    value={formData.addressLabel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  >
                    <option value="home">🏠 Home</option>
                    <option value="work">💼 Work</option>
                    <option value="company">🏢 Company</option>
                    <option value="other">📍 Other</option>
                  </select>
                </div>

                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    Set as default address
                  </span>
                </label>
              </div>

              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-105 hover:shadow-xl group relative overflow-hidden"
                >
                  <span className="relative z-10">Save Address</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center hover:shadow-2xl transition-all duration-500 border border-gray-100/50">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500 mb-4 text-lg">No saved addresses yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-700 font-medium hover:scale-110 transition-all duration-300"
            >
              Add your first address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {address.isDefault && (
                        <span className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                          Default Address
                        </span>
                      )}
                      {address.label && (
                        <span className="inline-block bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full capitalize border border-gray-200 shadow-sm">
                          {address.label}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">{address.fullName}</h3>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span>{address.address}</span>
                      </div>
                      <div className="ml-6 text-gray-500">
                        {address.city}, {address.district}, {address.state} - {address.pincode}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                        <span>{address.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span>{address.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(address)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                      title="Edit address"
                    >
                      <Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                      title="Delete address"
                    >
                      <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>
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

export default AddressesPage;
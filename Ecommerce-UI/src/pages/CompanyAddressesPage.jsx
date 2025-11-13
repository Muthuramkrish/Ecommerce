import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, Building, ArrowLeft } from 'lucide-react';
import { getCompanyAddresses, saveCompanyAddress, deleteCompanyAddress } from '../api/user.js';
import React from 'react';


const CompanyAddressesPage = ({ onBack }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
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
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState({});

  const indianStates = useMemo(
    () => [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi",
      "Jammu and Kashmir",
      "Ladakh",
      "Lakshadweep",
      "Puducherry",
    ],
    []
  );

  useEffect(() => {
    loadAddresses();
  }, []);

  // ZIP code auto-lookup
  useEffect(() => {
    let timeoutId;
    if (formData.zipCode && formData.zipCode.length === 6) {
      timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${formData.zipCode}`
          );
          const data = await res.json();
          const info = Array.isArray(data) ? data[0] : null;
          if (
            info &&
            info.Status === "Success" &&
            Array.isArray(info.PostOffice) &&
            info.PostOffice.length > 0
          ) {
            const offices = info.PostOffice;
            const mainSO =
              offices.find(
                (o) =>
                  o.BranchType === "Sub Office" &&
                  o.DeliveryStatus === "Delivery"
              ) ||
              offices.find((o) => o.BranchType === "Sub Office") ||
              offices[0];
            const detectedCity =
              (mainSO && (mainSO.Block || mainSO.Name || mainSO.District)) ||
              "";
            const detectedDistrict = (mainSO && mainSO.District) || "";
            setFormData((prev) => ({
              ...prev,
              city: detectedCity || prev.city,
              district: detectedDistrict || prev.district,
            }));
            setFormErrors((prev) => ({ ...prev, zipCode: "" }));
          } else {
            setFormErrors((prev) => ({
              ...prev,
              zipCode: "Could not resolve city from PIN code",
            }));
          }
        } catch (err) {
          setFormErrors((prev) => ({
            ...prev,
            zipCode: "Failed to lookup PIN code",
          }));
        }
      }, 400);
    }
    return () => clearTimeout(timeoutId);
  }, [formData.zipCode]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getCompanyAddresses();
      setAddresses(data.companyAddresses || []);
    } catch (error) {
      console.error('Error loading company addresses:', error);
      alert('Failed to load company addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "phone") {
      value = (value || "").replace(/\D/g, "").slice(0, 10);
    }
    if (name === "zipCode") {
      value = (value || "").replace(/\D/g, "").slice(0, 6);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneRegex = /^\d{10}$/;
    const zipRegex = /^\d{6}$/;

    if (!formData.companyName.trim())
      errors.companyName = "Company name is required";
    if (!formData.contactPerson.trim())
      errors.contactPerson = "Contact person is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      errors.email = "Enter a valid email";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone))
      errors.phone = "Enter a valid phone number";
    if (!formData.address.trim()) errors.address = "Street address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.district.trim()) errors.district = "District is required";
    if (!formData.state.trim()) errors.state = "State/Province is required";
    if (!formData.zipCode.trim())
      errors.zipCode = "ZIP/Postal code is required";
    else if (!zipRegex.test(formData.zipCode))
      errors.zipCode = "Enter a valid ZIP/Postal code";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const addressData = {
        ...formData,
        _id: editingAddress?._id,
        label: "company",
        isTemporary: false
      };
      
      const response = await saveCompanyAddress(addressData);
      
      await loadAddresses();
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: '',
        state: 'Tamil Nadu',
        zipCode: '',
        isDefault: false
      });
      setFormErrors({});
      alert('Company address saved successfully!');
    } catch (error) {
      console.error('Error saving company address:', error);
      alert(error.message || 'Failed to save company address. Please try again.');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      companyName: address.companyName || '',
      contactPerson: address.contactPerson || '',
      email: address.email || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      district: address.district || '',
      state: address.state || 'Tamil Nadu',
      zipCode: address.zipCode || '',
      isDefault: address.isDefault || false
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this company address?')) return;
    try {
      await deleteCompanyAddress(addressId);
      await loadAddresses();
      alert('Address deleted successfully!');
    } catch (error) {
      console.error('Error deleting company address:', error);
      alert(error.message || 'Failed to delete company address. Please try again.');
    }
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
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">Company Addresses</h1>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingAddress(null);
                setFormData({
                  companyName: '',
                  contactPerson: '',
                  email: '',
                  phone: '',
                  address: '',
                  city: '',
                  district: '',
                  state: 'Tamil Nadu',
                  zipCode: '',
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
              {editingAddress ? 'Edit Company Address' : 'Add New Company Address'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.companyName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {formErrors.companyName && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.companyName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    placeholder="Enter contact person name"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.contactPerson
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {formErrors.contactPerson && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.contactPerson}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={10}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  placeholder="Enter street address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                    formErrors.address
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  rows={3}
                  required
                />
                {formErrors.address && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP/Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Enter ZIP code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    inputMode="numeric"
                    maxLength={6}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.zipCode
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {formErrors.zipCode && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.zipCode}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">City and district will be auto-filled</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.city
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.district
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  />
                  {formErrors.district && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.district}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      formErrors.state
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                  >
                    {indianStates.map((state) => (
                      <option
                        key={state}
                        value={state}
                        disabled={state !== "Tamil Nadu"}
                      >
                        {state}
                      </option>
                    ))}
                  </select>
                  {formErrors.state && (
                    <p className="mt-1 text-xs text-red-600">{formErrors.state}</p>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    Set as default company address
                  </span>
                </label>
              </div>
              <div className="flex space-x-4 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-105 hover:shadow-xl group relative overflow-hidden"
                >
                  <span className="relative z-10">Save Address</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingAddress(null);
                    setFormErrors({});
                  }}
                  className="flex-1 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center hover:shadow-2xl transition-all duration-500 border border-gray-100/50">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500 mb-4 text-lg">No company addresses saved yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 hover:text-blue-700 font-medium hover:scale-110 transition-all duration-300"
            >
              Add your first company address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {address.isDefault && (
                      <span className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-200 shadow-sm">
                        Default Address
                      </span>
                    )}
                    <h3 className="font-bold text-lg flex items-center space-x-2 text-gray-900 mb-3">
                      <Building className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span>{address.companyName}</span>
                    </h3>
                    <div className="space-y-2 text-gray-600 text-sm">
                      <div className="font-semibold text-gray-700">Contact: {address.contactPerson}</div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500 group-hover:scale-110 transition-transform" />
                        <span>{address.address}</span>
                      </div>
                      <div className="ml-6 text-gray-500">
                        {address.city}, {address.district}, {address.state} - {address.zipCode}
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
                      title="Edit company address"
                    >
                      <Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                      title="Delete company address"
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

export default CompanyAddressesPage;
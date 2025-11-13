import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Package,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Ban,
  Truck,
  Edit2,
} from "lucide-react";
import {
  getUserBulkOrders,
  getBulkOrderById,
  cancelBulkOrder,
  getCurrentUser,
  saveCompanyAddress,
  updateBulkOrderCompanyInfo,
} from "../api/user.js";

const BulkOrders = ({ onBack, onCreateNew }) => {
  const [currentView, setCurrentView] = useState("list");
  const [bulkOrders, setBulkOrders] = useState([]);
  const [selectedBulkOrder, setSelectedBulkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isEditingCompanyInfo, setIsEditingCompanyInfo] = useState(false);
  const [editedCompanyInfo, setEditedCompanyInfo] = useState(null);
  const [isSavingCompanyInfo, setIsSavingCompanyInfo] = useState(false);

  useEffect(() => {
    const loadBulkOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        const currentUser = getCurrentUser();

        if (!currentUser) {
          setError("Please log in to view your bulk orders.");
          setLoading(false);
          return;
        }

        if (!currentUser.token) {
          setError("Please log in to view your bulk orders.");
          setLoading(false);
          return;
        }

        // Validate token format (JWT should have 3 parts)
        const tokenParts = currentUser.token.split(".");
        if (tokenParts.length !== 3) {
          localStorage.removeItem("currentUser");
          setError("Your session has expired. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch bulk orders
        const response = await getUserBulkOrders();

        if (response.success) {
          setBulkOrders(response.bulkOrders || []);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch bulk orders");
        }
      } catch (error) {
        console.error("Error loading bulk orders:", error);

        // Check if it's an authentication error
        if (
          error.message?.includes("401") ||
          error.message?.includes("Unauthorized") ||
          error.message?.includes("Access denied") ||
          error.message?.includes("Invalid token")
        ) {
          localStorage.removeItem("currentUser");
          setError("Your session has expired. Please log in again.");
        } else {
          setError(error.message || "Failed to load bulk orders");
        }
        setBulkOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadBulkOrders();
  }, []);

  useEffect(() => {
    let timeoutId;
    if (editedCompanyInfo?.zipCode && editedCompanyInfo.zipCode.length === 6) {
      timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${editedCompanyInfo.zipCode}`
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

            setEditedCompanyInfo((prev) => ({
              ...prev,
              city: detectedCity || prev.city,
              district: detectedDistrict || prev.district,
            }));

            console.log(
              `✅ Auto-filled from ZIP ${editedCompanyInfo.zipCode}:`,
              {
                city: detectedCity,
                district: detectedDistrict,
              }
            );
          } else {
            console.warn("⚠️ Could not resolve city from PIN code");
          }
        } catch (err) {
          console.error("❌ Failed to lookup PIN code:", err);
        }
      }, 400); // Debounce for 400ms
    }

    return () => clearTimeout(timeoutId);
  }, [editedCompanyInfo?.zipCode]);

  // ✅ Updated handleCompanyInfoInputChange with ZIP code validation
  const handleCompanyInfoInputChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    // Validate phone number - only digits, max 10
    if (name === "phone") {
      value = (value || "").replace(/\D/g, "").slice(0, 10);
    }

    // Validate ZIP code - only digits, max 6
    if (name === "zipCode") {
      value = (value || "").replace(/\D/g, "").slice(0, 6);
    }

    setEditedCompanyInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const canCancelBulkOrder = (status) => {
    return ["pending", "under_review", "quoted"].includes(status);
  };

  const handleCancelClick = (bulkOrderId) => {
    setCancellingOrderId(bulkOrderId);
    setCancelReason("");
    setOtherReason("");
    setShowCancelModal(true);
  };

  const handleCancelBulkOrder = async () => {
    const finalReason = cancelReason === "Other" ? otherReason : cancelReason;

    if (!finalReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    try {
      setIsCancelling(true);
      const response = await cancelBulkOrder(cancellingOrderId, finalReason);

      if (response.success) {
        setBulkOrders(
          bulkOrders.map((order) =>
            order.bulkOrderId === cancellingOrderId
              ? {
                  ...order,
                  status: "cancelled",
                  cancellationReason: finalReason,
                  cancelledAt: new Date(),
                }
              : order
          )
        );

        if (
          selectedBulkOrder &&
          selectedBulkOrder.bulkOrderId === cancellingOrderId
        ) {
          setSelectedBulkOrder({
            ...selectedBulkOrder,
            status: "cancelled",
            cancellationReason: finalReason,
            cancelledAt: new Date(),
          });
        }

        alert("Bulk order cancelled successfully");
        setShowCancelModal(false);
        setCancellingOrderId(null);
        setCancelReason("");
        setOtherReason("");
      } else {
        alert(response.message || "Failed to cancel bulk order");
      }
    } catch (error) {
      console.error("Error cancelling bulk order:", error);
      alert(error.message || "Failed to cancel bulk order");
    } finally {
      setIsCancelling(false);
    }
  };

  // Add this new function to check if company info can be edited
  const canEditCompanyInfo = (status) => {
    return ["pending", "under_review", "quoted"].includes(status);
  };

  // Add this handler to start editing company info
  const handleEditCompanyInfo = () => {
    setEditedCompanyInfo({
      companyName: selectedBulkOrder.companyInfo.companyName || "",
      contactPerson: selectedBulkOrder.companyInfo.contactPerson || "",
      email: selectedBulkOrder.companyInfo.email || "",
      phone: selectedBulkOrder.companyInfo.phone || "",
      address: selectedBulkOrder.companyInfo.address || "",
      city: selectedBulkOrder.companyInfo.city || "",
      district: selectedBulkOrder.companyInfo.district || "",
      state: selectedBulkOrder.companyInfo.state || "Tamil Nadu",
      zipCode: selectedBulkOrder.companyInfo.zipCode || "",
    });
    setIsEditingCompanyInfo(true);
  };

  // Add this handler to save company info changes
  const handleSaveCompanyInfo = async () => {
    try {
      setIsSavingCompanyInfo(true);

      // Save as temporary company address
      const addressData = {
        label: "company",
        companyName: editedCompanyInfo.companyName,
        contactPerson: editedCompanyInfo.contactPerson,
        email: editedCompanyInfo.email,
        phone: editedCompanyInfo.phone,
        address: editedCompanyInfo.address,
        city: editedCompanyInfo.city,
        district: editedCompanyInfo.district,
        state: editedCompanyInfo.state,
        zipCode: editedCompanyInfo.zipCode,
        isDefault: false,
        isTemporary: true,
      };

      const addressResponse = await saveCompanyAddress(addressData);

      if (
        addressResponse.success &&
        addressResponse.companyAddresses &&
        addressResponse.companyAddresses.length > 0
      ) {
        const newAddress =
          addressResponse.companyAddresses[
            addressResponse.companyAddresses.length - 1
          ];

        // Update bulk order with new company address using the imported function
        const updateResponse = await updateBulkOrderCompanyInfo(
          selectedBulkOrder.bulkOrderId,
          newAddress._id
        );

        if (updateResponse.success) {
          // Update local state with full address details
          setSelectedBulkOrder({
            ...selectedBulkOrder,
            companyInfo: {
              ...newAddress,
              email: editedCompanyInfo.email,
            },
          });

          // Update bulk orders list
          setBulkOrders(
            bulkOrders.map((order) =>
              order.bulkOrderId === selectedBulkOrder.bulkOrderId
                ? {
                    ...order,
                    companyInfo: {
                      ...newAddress,
                      email: editedCompanyInfo.email,
                    },
                  }
                : order
            )
          );

          setIsEditingCompanyInfo(false);
          alert("Company information updated successfully!");
        } else {
          throw new Error(
            updateResponse.message ||
              "Failed to update bulk order company information"
          );
        }
      } else {
        throw new Error("Failed to save company address");
      }
    } catch (error) {
      console.error("Error updating company info:", error);
      alert("Failed to update company information: " + error.message);
    } finally {
      setIsSavingCompanyInfo(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "confirmed":
      case "under_review":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "quoted":
        return <Star className="w-5 h-5 text-purple-500" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-indigo-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-orange-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "cancelled":
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "returned":
        return <Package className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-700 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 hover:shadow-lg";
      case "confirmed":
      case "under_review":
        return "text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 hover:shadow-lg";
      case "quoted":
        return "text-purple-700 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-300 hover:shadow-lg";
      case "approved":
        return "text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:shadow-lg";
      case "processing":
        return "text-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 hover:shadow-lg";
      case "shipped":
        return "text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 hover:shadow-lg";
      case "delivered":
        return "text-green-800 bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 hover:shadow-lg";
      case "cancelled":
      case "rejected":
        return "text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border-red-300 hover:shadow-lg";
      case "returned":
        return "text-orange-800 bg-gradient-to-r from-orange-100 to-amber-100 border-orange-400 hover:shadow-lg";
      default:
        return "text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 hover:shadow-lg";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const CancelModal = () => {
    const modalRef = React.useRef(null);

    const closeModal = React.useCallback(() => {
      setShowCancelModal(false);
      setCancellingOrderId(null);
      setCancelReason("");
      setOtherReason("");
    }, []);

    React.useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape" && showCancelModal && !isCancelling) {
          closeModal();
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [showCancelModal, isCancelling, closeModal]);

    const handleInnerMouseDown = (e) => {
      e.stopPropagation();
    };

    const handleInnerClick = (e) => {
      e.stopPropagation();
    };

    const handleKeepOrder = (e) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      e.stopPropagation();
      closeModal();
    };

    const handleReasonChange = React.useCallback((e) => {
      e.stopPropagation();
      setCancelReason(e.target.value);
      if (e.target.value !== "Other") {
        setOtherReason("");
      }
    }, []);

    const handleOtherReasonChange = React.useCallback((e) => {
      e.stopPropagation();
      setOtherReason(e.target.value);
    }, []);

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isCancelling) {
            closeModal();
          }
        }}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 relative"
          onMouseDown={handleInnerMouseDown}
          onClick={handleInnerClick}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Cancel Bulk Order
            </h3>
          </div>

          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel this bulk order? Please select a
            reason for cancellation.
          </p>

          <div className="mb-6 space-y-4 relative z-10">
            <div>
              <label
                htmlFor="cancelReasonSelect"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cancellation Reason *
              </label>
              <select
                id="cancelReasonSelect"
                value={cancelReason}
                onChange={handleReasonChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white relative z-20"
              >
                <option value="">Select a reason</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found a better price elsewhere">
                  Found a better price elsewhere
                </option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time too long">
                  Delivery time too long
                </option>
                <option value="Need to change order details">
                  Need to change order details
                </option>
                <option value="Financial constraints">
                  Financial constraints
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {cancelReason === "Other" && (
              <div>
                <label
                  htmlFor="otherReasonTextarea"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Please specify *
                </label>
                <textarea
                  id="otherReasonTextarea"
                  value={otherReason}
                  onChange={handleOtherReasonChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Please tell us your reason..."
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleKeepOrder}
              disabled={isCancelling}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium disabled:opacity-50"
            >
              Keep Order
            </button>

            <button
              type="button"
              onClick={(e) => {
                if (e && typeof e.preventDefault === "function")
                  e.preventDefault();
                e.stopPropagation();
                handleCancelBulkOrder();
              }}
              disabled={
                isCancelling ||
                !cancelReason.trim() ||
                (cancelReason === "Other" && !otherReason.trim())
              }
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-500 font-bold hover:scale-105 hover:shadow-xl group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </div>
              ) : (
                <>
                  <span className="relative z-10">Cancel Order</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleViewBulkOrder = async (bulkOrderId) => {
    try {
      const response = await getBulkOrderById(bulkOrderId);
      if (response.success) {
        setSelectedBulkOrder(response.bulkOrder);
        setCurrentView("details");
      } else {
        alert("Failed to load bulk order details");
      }
    } catch (error) {
      console.error("Error fetching bulk order details:", error);
      alert("Failed to load bulk order details");
    }
  };

  const renderHeader = () => {
    let title = "My Bulk Orders";

    if (currentView === "details") {
      title = "Bulk Order Details";
    }

    return (
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <button
              onClick={() => {
                if (currentView === "details") {
                  setCurrentView("list");
                  setSelectedBulkOrder(null);
                } else {
                  onBack();
                }
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>

            <h1 className="text-base md:text-lg font-semibold text-gray-900 text-center flex-1">
              {title}
            </h1>

            {currentView === "list" && (
              <button
                onClick={onCreateNew}
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-500 text-sm font-bold group relative overflow-hidden border bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-110 hover:shadow-2xl border-blue-500/20"
              >
                <Package className="w-4 h-4 group-hover:animate-bounce" />
                <span className="hidden sm:inline relative z-10">
                  New Order
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              </button>
            )}

            {currentView === "details" && <div className="w-24"></div>}
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

  if (currentView === "details" && selectedBulkOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showCancelModal && <CancelModal />}
        {renderHeader()}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Bulk Order #{selectedBulkOrder.bulkOrderId}
                </h2>
                <p className="text-gray-600">
                  Submitted on {formatDate(selectedBulkOrder.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(
                    selectedBulkOrder.status
                  )}`}
                >
                  {getStatusIcon(selectedBulkOrder.status)}
                  <span className="font-medium">
                    {formatStatus(selectedBulkOrder.status)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Company Information
                </h3>
                {canEditCompanyInfo(selectedBulkOrder.status) &&
                  !isEditingCompanyInfo && (
                    <button
                      onClick={handleEditCompanyInfo}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
              </div>

              {isEditingCompanyInfo ? (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="companyName"
                      placeholder="Company Name"
                      value={editedCompanyInfo.companyName}
                      onChange={handleCompanyInfoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="contactPerson"
                      placeholder="Contact Person"
                      value={editedCompanyInfo.contactPerson}
                      onChange={handleCompanyInfoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={editedCompanyInfo.email}
                      onChange={handleCompanyInfoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      value={editedCompanyInfo.phone}
                      onChange={handleCompanyInfoInputChange}
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={editedCompanyInfo.address}
                    onChange={handleCompanyInfoInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={editedCompanyInfo.city}
                      onChange={handleCompanyInfoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="district"
                      placeholder="District"
                      value={editedCompanyInfo.district}
                      onChange={handleCompanyInfoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={editedCompanyInfo.state}
                      onChange={handleCompanyInfoInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP Code"
                      value={editedCompanyInfo.zipCode}
                      onChange={handleCompanyInfoInputChange}
                      maxLength={6}
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsEditingCompanyInfo(false)}
                      disabled={isSavingCompanyInfo}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCompanyInfo}
                      disabled={isSavingCompanyInfo}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50"
                    >
                      {isSavingCompanyInfo ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedBulkOrder.companyInfo.companyName}
                    </p>
                    <p className="text-gray-600">
                      Contact: {selectedBulkOrder.companyInfo.contactPerson}
                    </p>
                    <p className="text-gray-600">
                      {selectedBulkOrder.companyInfo.email}
                    </p>
                    <p className="text-gray-600">
                      {selectedBulkOrder.companyInfo.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      {selectedBulkOrder.companyInfo.address}
                      <br />
                      {selectedBulkOrder.companyInfo.city},{" "}
                      {selectedBulkOrder.companyInfo.district}
                      <br />
                      {selectedBulkOrder.companyInfo.state} -{" "}
                      {selectedBulkOrder.companyInfo.zipCode}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h3>
              <div className="space-y-4">
                {selectedBulkOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Category: {item.category || "General"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{item.totalPrice.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.unitPrice.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(selectedBulkOrder.orderType !== "electrical" ||
              selectedBulkOrder.specialRequirements) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Order Type:</span>{" "}
                    {selectedBulkOrder.orderType.charAt(0).toUpperCase() +
                      selectedBulkOrder.orderType.slice(1)}
                  </p>
                  {selectedBulkOrder.specialRequirements && (
                    <p className="text-gray-600">
                      <span className="font-medium">Special Requirements:</span>{" "}
                      {selectedBulkOrder.specialRequirements}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedBulkOrder.quotedPrice && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Quote Information
                </h3>
                <p className="text-green-800">
                  <span className="font-medium">Quoted Price:</span> ₹
                  {selectedBulkOrder.quotedPrice.toLocaleString()}
                </p>
                {selectedBulkOrder.quotedBy && (
                  <p className="text-green-800">
                    <span className="font-medium">Quoted By:</span>{" "}
                    {selectedBulkOrder.quotedBy}
                  </p>
                )}
                {selectedBulkOrder.quotedAt && (
                  <p className="text-green-800">
                    <span className="font-medium">Quoted On:</span>{" "}
                    {formatDate(selectedBulkOrder.quotedAt)}
                  </p>
                )}
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    ₹{selectedBulkOrder.orderSummary.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>
                    ₹{selectedBulkOrder.orderSummary.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>
                    ₹
                    {selectedBulkOrder.orderSummary.roundedTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            {/* Cancellation/Return Information */}
            {selectedBulkOrder.cancellationReason && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Cancellation Reason
                </h3>
                <p className="text-red-800">
                  {selectedBulkOrder.cancellationReason}
                </p>
                {selectedBulkOrder.cancelledAt && (
                  <p className="text-sm text-red-600 mt-1">
                    Cancelled on: {formatDate(selectedBulkOrder.cancelledAt)}
                  </p>
                )}
              </div>
            )}

            {selectedBulkOrder.returnedReason && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Return Reason
                </h3>
                <p className="text-orange-800">
                  {selectedBulkOrder.returnedReason}
                </p>
                {selectedBulkOrder.returnedAt && (
                  <p className="text-sm text-orange-600 mt-1">
                    Returned on: {formatDate(selectedBulkOrder.returnedAt)}
                  </p>
                )}
              </div>
            )}

            {selectedBulkOrder.notes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Notes
                </h3>
                <p className="text-blue-800">{selectedBulkOrder.notes}</p>
              </div>
            )}

            {/* Tracking Information */}
            {selectedBulkOrder.trackingId && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Tracking Information
                </h3>
                <p className="text-orange-800">
                  Tracking ID:{" "}
                  <span className="font-mono font-semibold">
                    {selectedBulkOrder.trackingId}
                  </span>
                </p>
                {selectedBulkOrder.status === "shipped" && (
                  <p className="text-sm text-orange-600 mt-2">
                    Your bulk order is on its way! Use this tracking ID to
                    monitor your shipment.
                  </p>
                )}
              </div>
            )}

            {/* Expected Delivery */}
            {selectedBulkOrder.expectedDelivery &&
              selectedBulkOrder.status !== "delivered" &&
              selectedBulkOrder.status !== "cancelled" &&
              selectedBulkOrder.status !== "rejected" &&
              selectedBulkOrder.status !== "returned" && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Expected Delivery
                  </h3>
                  <p className="text-green-800">
                    {formatDate(selectedBulkOrder.expectedDelivery)}
                  </p>
                </div>
              )}

            {canCancelBulkOrder(selectedBulkOrder.status) && (
              <div className="mt-8">
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Need to cancel this order?
                    </h4>
                    <p className="text-sm text-amber-700">
                      You can cancel this bulk order before it's approved.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleCancelClick(selectedBulkOrder.bulkOrderId)
                    }
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl 
                   hover:from-red-700 hover:to-red-800 transition-all duration-500 font-bold 
                   hover:scale-105 hover:shadow-xl group relative overflow-hidden w-full md:w-auto"
                  >
                    <Ban className="w-5 h-5 group-hover:animate-bounce" />
                    <span className="relative z-10">Cancel Order</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showCancelModal && <CancelModal />}
      {renderHeader()}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-4">
                <h2 className="text-xl font-semibold text-amber-900 mb-2">
                  {error.includes("expired") || error.includes("log in")
                    ? "Authentication Required"
                    : "Notice"}
                </h2>
                <p className="text-amber-800 mb-4">{error}</p>
              </div>

              {(error.includes("log in") || error.includes("expired")) && (
                <button
                  onClick={() => {
                    localStorage.removeItem("currentUser");
                    window.location.hash = "login";
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
                >
                  <span className="relative z-10">Login Now</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </button>
              )}
            </div>
          </div>
        ) : bulkOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Bulk Orders Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't submitted any bulk orders yet. Create your first bulk
              order request!
            </p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 rounded-xl transition-all duration-500 font-bold group relative overflow-hidden border bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-110 hover:shadow-2xl border-blue-500/20"
            >
              <span className="relative z-10">Create First Bulk Order</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bulkOrders.map((bulkOrder) => (
              <div
                key={bulkOrder.bulkOrderId}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bulk Order #{bulkOrder.bulkOrderId}
                    </h3>
                    <p className="text-gray-600">
                      Submitted on {formatDate(bulkOrder.createdAt)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {bulkOrder.companyInfo.companyName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(
                        bulkOrder.status
                      )}`}
                    >
                      {getStatusIcon(bulkOrder.status)}
                      <span className="font-medium">
                        {formatStatus(bulkOrder.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600">
                      {bulkOrder.items.length} item
                      {bulkOrder.items.length !== 1 ? "s" : ""}
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
                    {bulkOrder.trackingId && (
                      <p className="text-sm text-orange-600 font-mono mt-1">
                        Tracking: {bulkOrder.trackingId}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {canCancelBulkOrder(bulkOrder.status) && (
                      <button
                        onClick={() => handleCancelClick(bulkOrder.bulkOrderId)}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-xl group relative overflow-hidden"
                      >
                        <Ban className="w-4 h-4 group-hover:animate-bounce" />
                        <span className="relative z-10">Cancel</span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      </button>
                    )}
                    <button
                      onClick={() => handleViewBulkOrder(bulkOrder.bulkOrderId)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
                    >
                      <Eye className="w-4 h-4 group-hover:animate-bounce" />
                      <span className="relative z-10">View</span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {bulkOrder.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                      >
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

export default BulkOrders;

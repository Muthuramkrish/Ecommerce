import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Ban,
  Edit2,
} from "lucide-react";
import {
  getUserOrders,
  getOrderById,
  cancelOrder,
  returnOrder,
  saveAddress,
  updateOrderShipping,
  isAuthenticated,
} from "../api/user.js";

const OrdersPage = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [editedShipping, setEditedShipping] = useState(null);
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [otherReturnReason, setOtherReturnReason] = useState("");
  const [returningOrderId, setReturningOrderId] = useState(null);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let timeoutId;
    if (editedShipping?.pincode && editedShipping.pincode.length === 6) {
      timeoutId = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://api.postalpincode.in/pincode/${editedShipping.pincode}`
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

            setEditedShipping((prev) => ({
              ...prev,
              city: detectedCity || prev.city,
              district: detectedDistrict || prev.district,
            }));

            console.log(`✅ Auto-filled from PIN ${editedShipping.pincode}:`, {
              city: detectedCity,
              district: detectedDistrict,
            });
          } else {
            console.warn("⚠️ Could not resolve city from PIN code");
          }
        } catch (err) {
          console.error("❌ Failed to lookup PIN code:", err);
        }
      }, 400); // Debounce for 400ms
    }

    return () => clearTimeout(timeoutId);
  }, [editedShipping?.pincode]);

  // ✅ Updated handleShippingInputChange with validation
  const handleShippingInputChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    // Validate phone number - only digits, max 10
    if (name === "phone") {
      value = (value || "").replace(/\D/g, "").slice(0, 10);
    }

    // Validate PIN code - only digits, max 6
    if (name === "pincode") {
      value = (value || "").replace(/\D/g, "").slice(0, 6);
    }

    setEditedShipping((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchOrders = async () => {
    try {
      if (!isAuthenticated()) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      const response = await getUserOrders();
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        setError(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await getOrderById(orderId);
      if (response.success) {
        setSelectedOrder(response.order);
        setShowOrderDetails(true);
      } else {
        alert("Failed to load order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Failed to load order details");
    }
  };

  const canCancelOrder = (status) => {
    return ["pending", "confirmed"].includes(status);
  };

  const canEditShipping = (status) => {
    return ["pending", "confirmed"].includes(status);
  };

  const canReturnOrder = (status) => {
    return status === "delivered";
  };

  const handleReturnClick = (orderId) => {
    setReturningOrderId(orderId);
    setReturnReason("");
    setOtherReturnReason("");
    setShowReturnModal(true);
  };

  const handleReturnOrder = async () => {
    const finalReason =
      returnReason === "Other" ? otherReturnReason : returnReason;

    if (!finalReason.trim()) {
      alert("Please provide a reason for return");
      return;
    }

    try {
      setIsReturning(true);
      const response = await returnOrder(returningOrderId, finalReason);

      if (response.success) {
        // Update orders list
        setOrders(
          orders.map((order) =>
            order.orderId === returningOrderId
              ? { ...order, status: "returned", returnedReason: finalReason }
              : order
          )
        );

        // Update selected order if it's the one being returned
        if (selectedOrder && selectedOrder.orderId === returningOrderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: "returned",
            returnedReason: finalReason,
          });
        }

        alert("Return request submitted successfully");
        setShowReturnModal(false);
        setReturningOrderId(null);
        setReturnReason("");
        setOtherReturnReason("");
      } else {
        alert(response.message || "Failed to submit return request");
      }
    } catch (error) {
      console.error("Error returning order:", error);
      alert(error.message || "Failed to submit return request");
    } finally {
      setIsReturning(false);
    }
  };

  const handleEditShipping = () => {
    const addr =
      selectedOrder.shippingInfo?.addressId || selectedOrder.shippingInfo || {};
    const nameParts = (addr.fullName || "").split(" ");

    setEditedShipping({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: addr.email || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      district: addr.district || "",
      state: addr.state || "Tamil Nadu",
      pincode: addr.pincode || "",
    });
    setIsEditingShipping(true);
  };

  const handleSaveShipping = async () => {
    try {
      setIsSavingShipping(true);

      // Save as temporary address
      const addressData = {
        label: "other",
        fullName:
          `${editedShipping.firstName} ${editedShipping.lastName}`.trim(),
        email: editedShipping.email,
        phone: editedShipping.phone,
        address: editedShipping.address,
        city: editedShipping.city,
        district: editedShipping.district,
        state: editedShipping.state,
        pincode: editedShipping.pincode,
        isDefault: false,
        isTemporary: true,
      };

      const addressResponse = await saveAddress(addressData);

      if (addressResponse.addresses && addressResponse.addresses.length > 0) {
        const newAddress =
          addressResponse.addresses[addressResponse.addresses.length - 1];

        // Update order with new address
        const updateResponse = await updateOrderShipping(
          selectedOrder.orderId,
          {
            addressId: newAddress._id,
            email: editedShipping.email,
          }
        );

        if (updateResponse.success) {
          // Update local order state with full address object
          setSelectedOrder({
            ...selectedOrder,
            shippingInfo: {
              addressId: newAddress,
              email: editedShipping.email,
            },
          });

          // Update orders list
          setOrders(
            orders.map((order) =>
              order.orderId === selectedOrder.orderId
                ? {
                    ...order,
                    shippingInfo: {
                      addressId: newAddress,
                      email: editedShipping.email,
                    },
                  }
                : order
            )
          );

          setIsEditingShipping(false);
          alert("Shipping information updated successfully!");
        } else {
          throw new Error(
            updateResponse.message ||
              "Failed to update order shipping information"
          );
        }
      } else {
        throw new Error("Failed to save address");
      }
    } catch (error) {
      console.error("Error updating shipping:", error);
      alert("Failed to update shipping information: " + error.message);
    } finally {
      setIsSavingShipping(false);
    }
  };

  const handleCancelClick = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelReason("");
    setOtherReason("");
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    const finalReason = cancelReason === "Other" ? otherReason : cancelReason;

    if (!finalReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    try {
      setIsCancelling(true);
      const response = await cancelOrder(cancellingOrderId, finalReason);

      if (response.success) {
        // Update orders list
        setOrders(
          orders.map((order) =>
            order.orderId === cancellingOrderId
              ? { ...order, status: "cancelled" }
              : order
          )
        );

        // Update selected order if it's the one being cancelled
        if (selectedOrder && selectedOrder.orderId === cancellingOrderId) {
          setSelectedOrder({ ...selectedOrder, status: "cancelled" });
        }

        alert("Order cancelled successfully");
        setShowCancelModal(false);
        setCancellingOrderId(null);
        setCancelReason("");
        setOtherReason("");
      } else {
        alert(response.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
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

  // Cancel Modal Component
  const CancelModal = React.useMemo(() => {
    const handleReasonChange = (e) => {
      setCancelReason(e.target.value);
      if (e.target.value !== "Other") {
        setOtherReason("");
      }
    };

    const handleOtherReasonChange = (e) => {
      setOtherReason(e.target.value);
    };

    return () => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Are you sure you want to cancel this order? Please select a reason
            for cancellation.
          </p>

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Reason *
              </label>
              <select
                value={cancelReason}
                onChange={handleReasonChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
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
              <div className="animate-slideDown">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify *
                </label>
                <textarea
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
              onClick={() => {
                setShowCancelModal(false);
                setCancellingOrderId(null);
                setCancelReason("");
                setOtherReason("");
              }}
              disabled={isCancelling}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
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
  }, [cancelReason, otherReason, isCancelling]);

  // Return Modal Component
  const ReturnModal = React.useMemo(() => {
    const handleReasonChange = (e) => {
      setReturnReason(e.target.value);
      if (e.target.value !== "Other") {
        setOtherReturnReason("");
      }
    };

    const handleOtherReasonChange = (e) => {
      setOtherReturnReason(e.target.value);
    };

    return () => (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Return Order</h3>
          </div>

          <p className="text-gray-600 mb-4">
            Please select a reason for returning this order. Our team will
            review your request.
          </p>

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Reason *
              </label>
              <select
                value={returnReason}
                onChange={handleReasonChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="">Select a reason</option>
                <option value="Defective or damaged product">
                  Defective or damaged product
                </option>
                <option value="Wrong item received">Wrong item received</option>
                <option value="Product not as described">
                  Product not as described
                </option>
                <option value="Quality issues">Quality issues</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found better alternative">
                  Found better alternative
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {returnReason === "Other" && (
              <div className="animate-slideDown">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify *
                </label>
                <textarea
                  value={otherReturnReason}
                  onChange={handleOtherReasonChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  placeholder="Please tell us your reason..."
                />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowReturnModal(false);
                setReturningOrderId(null);
                setReturnReason("");
                setOtherReturnReason("");
              }}
              disabled={isReturning}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              onClick={handleReturnOrder}
              disabled={
                isReturning ||
                !returnReason.trim() ||
                (returnReason === "Other" && !otherReturnReason.trim())
              }
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-500 font-bold hover:scale-105 hover:shadow-xl group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReturning ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <>
                  <span className="relative z-10">Submit Return</span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }, [returnReason, otherReturnReason, isReturning]);

  if (showOrderDetails && selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showCancelModal && <CancelModal />}
        {showReturnModal && <ReturnModal />}

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setShowOrderDetails(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
                <span className="hidden sm:inline font-medium">Back</span>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">
                Order Details
              </h1>
              <div className="w-24"></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{selectedOrder.orderId}
                </h2>
                <p className="text-gray-600">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${getStatusColor(
                    selectedOrder.status
                  )} group-hover:scale-110 transition-all duration-300 shadow-lg`}
                >
                  <div className="group-hover:animate-bounce">
                    {getStatusIcon(selectedOrder.status)}
                  </div>
                  <span className="font-bold capitalize">
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.productTitle}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.productTitle}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Category: {item.category}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Shipping Information
                </h3>
                {canEditShipping(selectedOrder.status) &&
                  !isEditingShipping && (
                    <button
                      onClick={handleEditShipping}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
              </div>

              {isEditingShipping ? (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={editedShipping.firstName}
                      onChange={handleShippingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={editedShipping.lastName}
                      onChange={handleShippingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={editedShipping.email}
                      onChange={handleShippingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      value={editedShipping.phone}
                      onChange={handleShippingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={editedShipping.address}
                    onChange={handleShippingInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={editedShipping.city}
                      onChange={handleShippingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="district"
                      placeholder="District"
                      value={editedShipping.district}
                      onChange={handleShippingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={editedShipping.state}
                      onChange={handleShippingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="pincode"
                      placeholder="PIN Code"
                      value={editedShipping.pincode}
                      onChange={handleShippingInputChange}
                      maxLength={6}
                      inputMode="numeric"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsEditingShipping(false)}
                      disabled={isSavingShipping}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveShipping}
                      disabled={isSavingShipping}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:opacity-50"
                    >
                      {isSavingShipping ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {(() => {
                    const addr =
                      selectedOrder.shippingInfo?.addressId ||
                      selectedOrder.shippingInfo ||
                      {};
                    const hasData = Object.values(addr).some(
                      (v) => typeof v === "string" && v.trim() !== ""
                    );

                    if (!hasData) {
                      return (
                        <p className="text-gray-500 italic">
                          Shipping details not available.
                        </p>
                      );
                    }

                    return (
                      <>
                        {addr.fullName && (
                          <p className="font-medium text-gray-900">
                            {addr.fullName}
                          </p>
                        )}
                        {addr.email && (
                          <p className="text-gray-600">{addr.email}</p>
                        )}
                        {addr.phone && (
                          <p className="text-gray-600">{addr.phone}</p>
                        )}
                        <p className="text-gray-600 mt-2">
                          {[addr.address, addr.city, addr.district]
                            .filter(Boolean)
                            .join(", ")}
                          <br />
                          {[addr.state, addr.pincode]
                            .filter(Boolean)
                            .join(" - ")}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    ₹{selectedOrder.orderSummary.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    ₹{selectedOrder.orderSummary.shipping.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>
                    ₹{selectedOrder.orderSummary.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Round Off</span>
                  <span>₹{selectedOrder.orderSummary.roundOff.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>
                    ₹{selectedOrder.orderSummary.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation/Return Information */}
            {selectedOrder.cancellationReason && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Cancellation Reason
                </h3>
                <p className="text-red-800">
                  {selectedOrder.cancellationReason}
                </p>
                {selectedOrder.cancelledAt && (
                  <p className="text-sm text-red-600 mt-1">
                    Cancelled on: {formatDate(selectedOrder.cancelledAt)}
                  </p>
                )}
              </div>
            )}

            {selectedOrder.returnedReason && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">
                  Return Reason
                </h3>
                <p className="text-orange-800">
                  {selectedOrder.returnedReason}
                </p>
                {selectedOrder.returnedAt && (
                  <p className="text-sm text-orange-600 mt-1">
                    Returned on: {formatDate(selectedOrder.returnedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Tracking Information */}
            {selectedOrder.trackingId && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Tracking Information
                </h3>
                <p className="text-blue-800">
                  Tracking ID:{" "}
                  <span className="font-mono font-semibold">
                    {selectedOrder.trackingId}
                  </span>
                </p>
                {selectedOrder.status === "shipped" && (
                  <p className="text-sm text-blue-600 mt-2">
                    Your order is on its way! Use this tracking ID to monitor
                    your shipment.
                  </p>
                )}
              </div>
            )}

            {/* Estimated Delivery */}
            {selectedOrder.estimatedDelivery &&
              selectedOrder.status !== "delivered" &&
              selectedOrder.status !== "cancelled" &&
              selectedOrder.status !== "returned" && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Estimated Delivery
                  </h3>
                  <p className="text-green-800">
                    {formatDate(selectedOrder.estimatedDelivery)}
                  </p>
                </div>
              )}

            {/* Cancel Button in Details View */}
            {canCancelOrder(selectedOrder.status) && (
              <div className="mb-6 p-4 bg-amber-50 mt-8 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Need to cancel?
                    </h4>
                    <p className="text-sm text-amber-700">
                      You can cancel this order before it's processed.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancelClick(selectedOrder.orderId)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-xl group relative overflow-hidden whitespace-nowrap"
                  >
                    <Ban className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="relative z-10">Cancel Order</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </button>
                </div>
              </div>
            )}
            {/* Return Button in Details View */}
            {canReturnOrder(selectedOrder.status) && (
              <div className="mb-6 p-4 bg-orange-50 mt-4 border border-orange-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">
                      Need to return?
                    </h4>
                    <p className="text-sm text-orange-700">
                      You can request a return for delivered orders within 7
                      days.
                    </p>
                  </div>
                  <button
                    onClick={() => handleReturnClick(selectedOrder.orderId)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-xl group relative overflow-hidden whitespace-nowrap"
                  >
                    <Package className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="relative z-10">Return Order</span>
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
      {showReturnModal && <ReturnModal />}

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
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">
              My Orders
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Orders
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
            >
              <span className="relative z-10">Try Again</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-600">
              You haven't placed any orders yet. Start shopping to see your
              orders here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.orderId}
                    </h3>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${getStatusColor(
                      order.status
                    )} group-hover:scale-110 transition-all duration-300 shadow-lg`}
                  >
                    <div className="group-hover:animate-bounce">
                      {getStatusIcon(order.status)}
                    </div>
                    <span className="font-bold capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{order.orderSummary.total.toLocaleString()}
                    </p>
                    {order.trackingId && (
                      <p className="text-sm text-blue-600 font-mono mt-1">
                        Tracking: {order.trackingId}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => handleCancelClick(order.orderId)}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-xl group relative overflow-hidden"
                      >
                        <Ban className="w-4 h-4 group-hover:animate-bounce" />
                        <span className="relative z-10">Cancel</span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      </button>
                    )}
                    {canReturnOrder(order.status) && (
                      <button
                        onClick={() => handleReturnClick(order.orderId)}
                        className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-xl group relative overflow-hidden"
                      >
                        <Package className="w-4 h-4 group-hover:animate-bounce" />
                        <span className="relative z-10">Return</span>
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                      </button>
                    )}
                    <button
                      onClick={() => handleViewOrder(order.orderId)}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-xl group relative overflow-hidden"
                    >
                      <Eye className="w-4 h-4 group-hover:animate-bounce" />
                      <span className="relative z-10">View</span>
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </button>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="flex gap-2 overflow-x-auto">
                  {order.items.slice(0, 3).map((item, index) => (
                    <img
                      key={index}
                      src={item.imageUrl}
                      alt={item.productTitle}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-xs font-medium flex-shrink-0">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { getUserOrders, getOrderById, isAuthenticated } from '../api/user.js';

const OrdersPage = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      if (!isAuthenticated()) {
        setError('Please log in to view your orders.');
        setLoading(false);
        return;
      }

      const response = await getUserOrders();
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        setError(response.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to fetch orders');
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
        alert('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 hover:shadow-lg';
      case 'confirmed':
        return 'text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 hover:shadow-lg';
      case 'processing':
        return 'text-purple-700 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-300 hover:shadow-lg';
      case 'shipped':
        return 'text-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 hover:shadow-lg';
      case 'delivered':
        return 'text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:shadow-lg';
      case 'cancelled':
        return 'text-red-700 bg-gradient-to-r from-red-50 to-rose-50 border-red-300 hover:shadow-lg';
      default:
        return 'text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 hover:shadow-lg';
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

  if (showOrderDetails && selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setShowOrderDetails(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-500 text-sm md:text-base hover:scale-110 group bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/80 hover:shadow-lg border border-gray-200/50 hover:border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300" />
                <span className="hidden sm:inline font-medium">Back to Orders</span>
              </button>
              <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">
                Order Details
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.orderId}</h2>
                <p className="text-gray-600">Placed on {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${getStatusColor(selectedOrder.status)} group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                <div className="group-hover:animate-bounce">
                  {getStatusIcon(selectedOrder.status)}
                </div>
                <span className="font-bold capitalize">{selectedOrder.status}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.productTitle}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productTitle}</h4>
                      <p className="text-sm text-gray-500">Category: {item.category}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">
                  {selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}
                </p>
                <p className="text-gray-600">{selectedOrder.shippingInfo.email}</p>
                <p className="text-gray-600">{selectedOrder.shippingInfo.phone}</p>
                <p className="text-gray-600 mt-2">
                  {selectedOrder.shippingInfo.address}<br />
                  {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.district}<br />
                  {selectedOrder.shippingInfo.state} - {selectedOrder.shippingInfo.pincode}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>₹{selectedOrder.orderSummary.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>₹{selectedOrder.orderSummary.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Round Off</span>
                  <span>₹{selectedOrder.orderSummary.roundOff.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>₹{selectedOrder.orderSummary.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {selectedOrder.trackingId && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Tracking Information</h3>
                <p className="text-blue-800">Tracking ID: <span className="font-mono">{selectedOrder.trackingId}</span></p>
              </div>
            )}

            {/* Estimated Delivery */}
            {selectedOrder.estimatedDelivery && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Estimated Delivery</h3>
                <p className="text-green-800">{formatDate(selectedOrder.estimatedDelivery)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold text-gray-900 text-center flex-1">My Orders</h1>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600">You haven't placed any orders yet. Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-500 hover:scale-105 group border border-gray-100/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderId}</h3>
                    <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${getStatusColor(order.status)} group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <div className="group-hover:animate-bounce">
                      {getStatusIcon(order.status)}
                    </div>
                    <span className="font-bold capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{order.orderSummary.total.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewOrder(order.orderId)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-500 font-bold hover:scale-110 hover:shadow-2xl group relative overflow-hidden"
                  >
                    <Eye className="w-4 h-4 group-hover:animate-bounce" />
                    <span className="relative z-10">View Details</span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </button>
                </div>

                {/* Order Items Preview */}
                <div className="mt-4 flex gap-2 overflow-x-auto">
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
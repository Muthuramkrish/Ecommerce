import React, { useEffect, useState, useMemo } from "react";
import {
  PackageCheck,
  Truck,
  XCircle,
  Clock,
  Search,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// The AdminOrders component manages and displays the order list
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // --- Mock Data Loading ---
  useEffect(() => {
    // In a real application, replace this with an API call (e.g., Firestore onSnapshot)
    setOrders([
      {
        _id: "ORD-1001",
        customerName: "Arjun Kumar",
        email: "arjun@example.com",
        total: 1850,
        date: "2025-10-28",
        status: "Pending",
      },
      {
        _id: "ORD-1002",
        customerName: "Priya Sharma",
        email: "priya@example.com",
        total: 2650,
        date: "2025-10-27",
        status: "Shipped",
      },
      {
        _id: "ORD-1003",
        customerName: "Rahul Verma",
        email: "rahul@example.com",
        total: 980,
        date: "2025-10-26",
        status: "Delivered",
      },
      {
        _id: "ORD-1004",
        customerName: "Sita Devi",
        email: "sita@example.com",
        total: 1450,
        date: "2025-10-25",
        status: "Cancelled",
      },
      {
        _id: "ORD-1005",
        customerName: "Karan Singh",
        email: "karan@example.com",
        total: 3200,
        date: "2025-10-24",
        status: "Pending",
      },
    ]);
  }, []);

  // --- Utility Functions ---

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-700 ring-yellow-500/20",
      Shipped: "bg-blue-100 text-blue-700 ring-blue-500/20",
      Delivered: "bg-green-100 text-green-700 ring-green-500/20",
      Cancelled: "bg-red-100 text-red-700 ring-red-500/20",
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  // --- Order Manipulation Handlers ---

  const updateOrderStatus = (id, newStatus) => {
    // NOTE: In a real application, you would also make an API call here to update the backend
    setOrders((prev) =>
      prev.map((order) =>
        order._id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleCancelClick = (orderId) => {
    setOrderToCancel(orderId);
    setShowModal(true);
  };

  const handleConfirmCancel = () => {
    if (orderToCancel) {
      updateOrderStatus(orderToCancel, "Cancelled");
    }
    setOrderToCancel(null);
    setShowModal(false);
  };

  // --- Filtering Logic (Memoized) ---
  const filteredOrders = useMemo(() => {
    let list = orders;

    // 1. Filter by Status
    if (filterStatus !== "All") {
      list = list.filter((order) => order.status === filterStatus);
    }

    // 2. Filter by Search Term (Case-insensitive ID or Customer Name)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      list = list.filter(
        (order) =>
          order._id.toLowerCase().includes(lowerCaseSearch) ||
          order.customerName.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return list;
  }, [orders, filterStatus, searchTerm]);

  // --- Confirmation Modal Component ---
  const ConfirmationModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 scale-100">
          <div className="flex flex-col items-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to cancel order **{orderToCancel}**? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4 w-full">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition flex items-center"
              >
                <XCircle size={16} className="mr-1" />
                Yes, Cancel It
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Order Management</h2>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-xl shadow">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Status Filter Dropdown */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 appearance-none transition"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-800 text-white text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 text-left font-medium">Order ID</th>
              <th className="p-4 text-left font-medium">Customer</th>
              <th className="p-4 text-left font-medium hidden md:table-cell">
                Email
              </th>
              <th className="p-4 text-right font-medium">Total (₹)</th>
              <th className="p-4 text-left font-medium hidden sm:table-cell">
                Date
              </th>
              <th className="p-4 text-center font-medium">Status</th>
              <th className="p-4 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white text-gray-800">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-blue-50/50 transition duration-150">
                  <td className="p-4 font-semibold text-blue-700">
                    {order._id}
                  </td>
                  <td className="p-4 font-medium">{order.customerName}</td>
                  <td className="p-4 text-gray-500 hidden md:table-cell">
                    {order.email}
                  </td>
                  <td className="p-4 text-right font-bold">
                    ₹{order.total.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-gray-500 text-sm hidden sm:table-cell">
                    {order.date}
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center space-x-2 flex-wrap gap-2 min-w-[100px]">
                      {/* Ship button for Pending orders */}
                      {order.status === "Pending" && (
                        <button
                          onClick={() => updateOrderStatus(order._id, "Shipped")}
                          title="Change status to Shipped"
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
                        >
                          <Truck size={16} />
                        </button>
                      )}
                      {/* Deliver button for Shipped orders */}
                      {order.status === "Shipped" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order._id, "Delivered")
                          }
                          title="Change status to Delivered"
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {/* Cancel button for Pending or Shipped orders */}
                      {order.status !== "Cancelled" &&
                        order.status !== "Delivered" && (
                          <button
                            onClick={() => handleCancelClick(order._id)}
                            title="Cancel Order"
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-12 text-lg text-gray-500"
                >
                  <Clock className="inline-block mr-3 text-gray-400 w-6 h-6" />
                  No orders match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
};

export default AdminOrders;
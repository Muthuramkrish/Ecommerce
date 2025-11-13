import React, { useState, useEffect, useCallback } from 'react';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, PlusCircle, BarChart3, List, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// API Base URL - Change this to your backend URL
const API_BASE_URL = 'http://localhost:5000';

// Helper to get admin token
const getAdminToken = () => {
  const admin = localStorage.getItem('currentAdmin');
  if (admin) {
    try {
      const parsed = JSON.parse(admin);
      return parsed.token;
    } catch (err) {
      console.error('Error parsing admin token:', err);
      return null;
    }
  }
  return null;
};

// API call helper
const adminApiCall = async (url, options = {}) => {
  const token = getAdminToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('currentAdmin');
      throw new Error('Session expired. Please log in again.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Error ${response.status}`);
  }

  return await response.json();
};

// KPI Card Component
const KPICard = ({ title, value, growth, icon: Icon, gradient, bgGradient }) => (
  <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 transform hover:scale-105 overflow-hidden">
    <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    <div className="relative p-5">
      <div className="flex justify-between items-center mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {growth && (
          <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>{growth}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-800 break-words">{value}</h3>
      </div>
    </div>
  </div>
);

// Quick Action Button
const QuickActionButton = ({ label, icon: Icon, onClick, color = 'bg-indigo-600' }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center space-x-2 px-4 py-3 ${color} text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl`}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
  </button>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Verify admin token exists
      const token = getAdminToken();
      if (!token) {
        throw new Error('No admin session found. Please log in again.');
      }

      // Fetch users
      const users = await adminApiCall(`${API_BASE_URL}/api/admin/users`);
      
      // Fetch orders
      const orders = await adminApiCall(`${API_BASE_URL}/api/admin/orders`);
      // Calculate stats
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const revenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.orderSummary?.total || 0), 0);

      setStats({
        users: users.length,
        products: 128, // Placeholder
        pendingOrders,
        revenue,
      });

      // Recent orders
      const recent = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(order => ({
          id: order.orderId,
          customer: order.userName || 'Unknown',
          total: order.orderSummary?.total || 0,
          status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
        }));
      setRecentOrders(recent);

      // Generate sales data
      setSalesData(generateMonthlySales(orders));

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlySales = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const monthlyData = {};

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyData[months[monthIndex]] = { sales: 0, orders: 0 };
    }

    orders.forEach(order => {
      if (order.status === 'cancelled') return;
      const orderDate = new Date(order.createdAt);
      const monthName = months[orderDate.getMonth()];
      if (monthlyData[monthName]) {
        monthlyData[monthName].sales += order.orderSummary?.total || 0;
        monthlyData[monthName].orders += 1;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      sales: Math.round(data.sales),
      orders: data.orders,
    }));
  };

  const getStatusStyle = (status) => {
    const styles = {
      Pending: 'text-yellow-700 bg-yellow-100',
      Shipped: 'text-blue-700 bg-blue-100',
      Delivered: 'text-green-700 bg-green-100',
      Cancelled: 'text-red-700 bg-red-100',
    };
    return styles[status] || 'text-gray-700 bg-gray-100';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-red-800 mb-2 text-center">Error Loading Dashboard</h3>
          <p className="text-red-600 text-center">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const cardsData = [
    {
      title: 'Total Customers',
      value: loading ? '...' : stats.users,
      icon: Users,
      gradient: 'from-blue-600 to-blue-700',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Active Products',
      value: loading ? '...' : stats.products,
      icon: Package,
      gradient: 'from-emerald-600 to-emerald-700',
      bgGradient: 'from-emerald-50 to-emerald-100',
    },
    {
      title: 'Orders Pending',
      value: loading ? '...' : stats.pendingOrders,
      icon: ShoppingBag,
      gradient: 'from-amber-600 to-amber-700',
      bgGradient: 'from-amber-50 to-amber-100',
    },
    {
      title: 'Total Revenue',
      value: loading ? '...' : `₹${stats.revenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      gradient: 'from-purple-600 to-purple-700',
      bgGradient: 'from-purple-50 to-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-2 md:p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-indigo-900 mb-1">Admin Dashboard</h1>
          <p className="text-md text-gray-500">Current insights and quick actions for your electrical business.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <QuickActionButton label="New Product" icon={PlusCircle} onClick={() => alert('Navigate to Products/Add')} color="bg-green-600" />
          <QuickActionButton label="View Reports" icon={BarChart3} onClick={() => alert('Navigate to Reports')} color="bg-indigo-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {cardsData.map((card, idx) => (
          <KPICard key={idx} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Revenue & Order Trends</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fill="url(#colorSales)" name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-1 bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle size={22} /> Low Stock Alerts
          </h3>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Stock monitoring coming soon</p>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <List size={20} className="text-indigo-600" /> Recent Orders
          </h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No recent orders</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3 text-right">Total (₹)</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{order.customer}</td>
                        <td className="px-4 py-4 text-sm text-right font-semibold">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="w-full mt-4 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 border-t pt-4">
                View All Orders <ArrowRight size={14} className="inline-block ml-1" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
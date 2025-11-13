import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, RefreshCw, AlertTriangle } from "lucide-react";

// API Base URL
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

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, avgOrder: 0 });

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch orders from backend
      const orders = await adminApiCall(`${API_BASE_URL}/api/admin/orders`);

      // Calculate statistics
      const completedOrders = orders.filter(
        o => o.status !== 'cancelled' && o.status !== 'returned'
      );

      const totalRevenue = completedOrders.reduce(
        (sum, order) => sum + (order.orderSummary?.total || 0),
        0
      );

      const totalOrders = completedOrders.length;
      const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        revenue: totalRevenue,
        orders: totalOrders,
        avgOrder: avgOrder,
      });

      // Generate monthly sales data
      const monthlySales = generateMonthlySales(completedOrders);
      setSalesData(monthlySales);

      // Generate category data
      const categorySales = generateCategorySales(completedOrders);
      setCategoryData(categorySales);

    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const generateMonthlySales = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyData = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyData[months[monthIndex]] = { revenue: 0, orders: 0 };
    }

    // Aggregate order data by month
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthName = months[orderDate.getMonth()];
      
      if (monthlyData[monthName]) {
        monthlyData[monthName].revenue += order.orderSummary?.total || 0;
        monthlyData[monthName].orders += 1;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue),
      orders: data.orders,
    }));
  };

  const generateCategorySales = (orders) => {
    const categoryMap = {};

    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const category = item.category || 'Other';
          if (!categoryMap[category]) {
            categoryMap[category] = 0;
          }
          categoryMap[category] += item.quantity || 0;
        });
      }
    });

    // Convert to array and sort by sales
    const categoryArray = Object.entries(categoryMap)
      .map(([category, sales]) => ({ category, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5 categories

    return categoryArray;
  };

  // Utility function for consistent Indian Rupee formatting
  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-red-800 mb-2 text-center">Error Loading Reports</h3>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchReportsData}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-blue-700 w-7 h-7" /> Reports & Analytics
        </h2>
        <button
          onClick={fetchReportsData}
          className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition flex items-center shadow"
        >
          <RefreshCw size={18} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl shadow-lg p-5 flex items-center justify-between transition-shadow duration-300 hover:shadow-xl">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">
              {formatCurrency(stats.revenue)}
            </h3>
          </div>
          <div className="p-4 bg-green-100 text-green-700 rounded-full">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white rounded-xl shadow-lg p-5 flex items-center justify-between transition-shadow duration-300 hover:shadow-xl">
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Orders</p>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">
              {stats.orders.toLocaleString()}
            </h3>
          </div>
          <div className="p-4 bg-blue-100 text-blue-700 rounded-full">
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Avg Order Value Card */}
        <div className="bg-white rounded-xl shadow-lg p-5 flex items-center justify-between transition-shadow duration-300 hover:shadow-xl">
          <div>
            <p className="text-gray-500 text-sm font-medium">Avg Order Value</p>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-1">
              {formatCurrency(stats.avgOrder.toFixed(2))}
            </h3>
          </div>
          <div className="p-4 bg-purple-100 text-purple-700 rounded-full">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sales Trend Chart */}
        <div className="bg-white shadow-xl rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
            Monthly Revenue Trend (Last 6 Months)
          </h3>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis 
                  stroke="#64748b" 
                  tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          )}
        </div>

        {/* Top Categories Chart */}
        <div className="bg-white shadow-xl rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
            Top Selling Categories (Units)
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => [`${value} Units`, 'Sales']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40} 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
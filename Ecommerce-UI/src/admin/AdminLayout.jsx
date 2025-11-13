import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X
} from "lucide-react";

const AdminLayout = ({ currentPage, onNavigate, onLogout, currentUser, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "orders", label: "Orders", icon: <ShoppingCart size={20} /> },
    { path: "products", label: "Products", icon: <Package size={20} /> },
    { path: "users", label: "Users", icon: <Users size={20} /> },
    { path: "reports", label: "Reports", icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } fixed inset-y-0 left-0 w-64 bg-blue-900 text-white transform transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-blue-700">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          <button
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mt-6 flex flex-col space-y-2 px-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                onNavigate(item.path);
                setSidebarOpen(false);
              }}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition text-left ${
                currentPage === item.path ? 'bg-blue-800' : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="absolute bottom-4 left-4 flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-3 border-b">
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              Welcome, {currentUser?.fullName || "Admin"}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Search..."
              className="hidden sm:block px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.fullName || 'Admin')}&background=0D8ABC&color=fff`}
              alt="admin"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
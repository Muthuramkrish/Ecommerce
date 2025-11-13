import React, { useState, useMemo, useRef } from "react";
import { PlusCircle, Pencil, Trash2, CheckCircle, XCircle, Package, Search, AlertTriangle, Zap, Upload } from "lucide-react";

// Mock data aligned with backend schema
const initialProducts = [
  {
    _id: "P-1001",
    identifiers: {
      productId: "MCB-HD-001",
      name: "Heavy Duty MCB",
      sku: "MCB-HD-001",
    },
    characteristics: {
      images: ["https://images.unsplash.com/photo-1627918882512-321303cc44c2?q=80&w=1780&auto=format&fit=crop"],
      description: "High-quality Miniature Circuit Breaker (MCB) for commercial use.",
    },
    anchor: {
      category: "Protection Devices",
      brand: "StandardElectric",
    },
    pricing: {
      basePrice: 350,
      currency: "INR",
    },
    inventory: {
      totalQuantity: 12,
      availableQuantity: 12,
      lowStockThreshold: 20,
      trackInventory: true,
    },
    marketing: {
      isActive: true,
    },
  },
];

const AdminProducts = () => {
  const [products, setProducts] = useState(initialProducts);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({});

  const LOW_STOCK_THRESHOLD = 20;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const name = p.identifiers?.name || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (filterStatus === "active") {
        matchesStatus = p.marketing?.isActive === true;
      } else if (filterStatus === "draft") {
        matchesStatus = p.marketing?.isActive === false;
      } else if (filterStatus === "low_stock") {
        matchesStatus = (p.inventory?.availableQuantity || 0) < LOW_STOCK_THRESHOLD;
      }

      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, filterStatus]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this product?")) {
      setProducts(products.filter((p) => p._id !== id));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      productId: product.identifiers?.productId || "",
      name: product.identifiers?.name || "",
      sku: product.identifiers?.sku || "",
      category: product.anchor?.category || "",
      brand: product.anchor?.brand || "",
      basePrice: product.pricing?.basePrice || "",
      comparePrice: product.pricing?.comparePrice || "",
      taxRate: product.pricing?.taxRate || "",
      totalQuantity: product.inventory?.totalQuantity || "",
      availableQuantity: product.inventory?.availableQuantity || "",
      lowStockThreshold: product.inventory?.lowStockThreshold || LOW_STOCK_THRESHOLD,
      trackInventory: product.inventory?.trackInventory !== false ? "true" : "false",
      allowBackorder: product.inventory?.allowBackorder ? "true" : "false",
      image: product.characteristics?.images?.[0] || "",
      description: product.characteristics?.description || "",
      isActive: product.marketing?.isActive !== false ? "true" : "false",
      isFeatured: product.marketing?.isFeatured ? "true" : "false",
      tags: product.marketing?.tags?.join(", ") || "",
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      productId: "",
      name: "",
      sku: "",
      category: "",
      brand: "",
      basePrice: "",
      comparePrice: "",
      taxRate: "",
      totalQuantity: "",
      availableQuantity: "",
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      trackInventory: "true",
      allowBackorder: "false",
      image: "",
      description: "",
      isActive: "true",
      isFeatured: "false",
      tags: "",
    });
    setShowModal(true);
  };

  const handleImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected for import:", file.name);
      alert(`File '${file.name}' selected successfully!`);
      e.target.value = null;
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const productData = {
      identifiers: {
        productId: formData.productId,
        name: formData.name,
        sku: formData.sku,
      },
      characteristics: {
        images: [formData.image],
        description: formData.description,
      },
      anchor: {
        category: formData.category,
        brand: formData.brand,
      },
      pricing: {
        basePrice: parseFloat(formData.basePrice),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        currency: "INR",
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : undefined,
      },
      inventory: {
        totalQuantity: parseInt(formData.totalQuantity),
        availableQuantity: parseInt(formData.availableQuantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold) || LOW_STOCK_THRESHOLD,
        trackInventory: formData.trackInventory === "true",
        allowBackorder: formData.allowBackorder === "true",
      },
      marketing: {
        isActive: formData.isActive === "true",
        isFeatured: formData.isFeatured === "true",
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
      },
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === editingProduct._id ? { ...p, ...productData } : p
        )
      );
    } else {
      setProducts([
        ...products,
        {
          _id: "P-" + (1000 + products.length + 1),
          ...productData,
        },
      ]);
    }

    setShowModal(false);
  };

  const getStatusChip = (isActive) => {
    if (isActive) {
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center justify-center">
          <CheckCircle size={14} className="mr-1" /> Active
        </span>
      );
    }
    return (
      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium flex items-center justify-center">
        <XCircle size={14} className="mr-1" /> Draft
      </span>
    );
  };

  const getStockDisplay = (stock) => {
    if (stock < 5) {
      return (
        <span className="text-red-600 font-bold flex items-center">
          <AlertTriangle size={16} className="mr-1" /> {stock} (Critical!)
        </span>
      );
    }
    if (stock < LOW_STOCK_THRESHOLD) {
      return (
        <span className="text-orange-500 font-semibold flex items-center">
          <Zap size={16} className="mr-1" /> {stock} (Low)
        </span>
      );
    }
    return <span className="text-green-600 font-medium">{stock}</span>;
  };

  return (
    <div className="p-4 bg-gray-50 rounded-xl min-h-screen">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        style={{ display: "none" }}
      />

      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-indigo-900 flex items-center gap-3">
          <Package className="text-indigo-600 w-8 h-8" /> Product Catalog ({products.length})
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handleImport}
            className="flex items-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-5 py-2.5 rounded-xl shadow-md transition transform hover:scale-[1.02] bg-white font-medium"
          >
            <Upload size={20} className="mr-2" /> Import File
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition transform hover:scale-[1.02] font-medium"
          >
            <PlusCircle size={20} className="mr-2" /> Add New Product
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4 p-4 bg-white rounded-xl shadow-md">
        <div className="relative w-full md:w-1/3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex space-x-2">
          {["all", "active", "draft", "low_stock"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === status
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {status
                .replace("_", " ")
                .split(" ")
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-xl overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50 text-indigo-800 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Product Name</th>
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-right">Price (₹)</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 divide-y divide-gray-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-indigo-50 transition">
                  <td className="p-4">
                    <img
                      src={p.characteristics?.images?.[0] || "https://via.placeholder.com/150"}
                      alt={p.identifiers?.name}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-200"
                    />
                  </td>
                  <td className="p-4 font-semibold text-gray-900">{p.identifiers?.name}</td>
                  <td className="p-4 text-sm">{p.identifiers?.sku}</td>
                  <td className="p-4 text-sm">{p.anchor?.category}</td>
                  <td className="p-4 text-right font-bold text-indigo-600">
                    ₹{p.pricing?.basePrice?.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-medium">
                    {getStockDisplay(p.inventory?.availableQuantity || 0)}
                  </td>
                  <td className="p-4 text-center">{getStatusChip(p.marketing?.isActive)}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center items-center space-x-3">
                      <button
                        onClick={() => handleEdit(p)}
                        title="Edit"
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                      >
                        <Pencil size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        title="Delete"
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-red-100 hover:bg-red-200 transition"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-10 text-gray-500">
                  <Package size={30} className="inline-block mb-2 text-gray-400" />
                  <p>No products match your current filters.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
        <p>
          Showing {filteredProducts.length} results of {products.length} total products
        </p>
        <div className="space-x-2">
          <button
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            disabled
          >
            Previous
          </button>
          <span className="font-semibold text-indigo-600">1</span>
          <button className="px-3 py-1 border rounded-lg hover:bg-gray-100 transition">
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-indigo-900 mb-6 border-b pb-3">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h3>

            <div className="space-y-6">
              <div className="border-b pb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Product Identifiers</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID *
                    </label>
                    <input
                      value={formData.productId || ""}
                      onChange={(e) => handleFormChange("productId", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      value={formData.name || ""}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU *
                    </label>
                    <input
                      value={formData.sku || ""}
                      onChange={(e) => handleFormChange("sku", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Product Classification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <input
                      value={formData.category || ""}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand
                    </label>
                    <input
                      value={formData.brand || ""}
                      onChange={(e) => handleFormChange("brand", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.basePrice || ""}
                      onChange={(e) => handleFormChange("basePrice", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compare Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.comparePrice || ""}
                      onChange={(e) => handleFormChange("comparePrice", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.taxRate || ""}
                      onChange={(e) => handleFormChange("taxRate", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Inventory</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.totalQuantity || ""}
                      onChange={(e) => handleFormChange("totalQuantity", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.availableQuantity || ""}
                      onChange={(e) => handleFormChange("availableQuantity", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold || ""}
                      onChange={(e) => handleFormChange("lowStockThreshold", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Track Inventory
                    </label>
                    <select
                      value={formData.trackInventory || "true"}
                      onChange={(e) => handleFormChange("trackInventory", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allow Backorder
                    </label>
                    <select
                      value={formData.allowBackorder || "false"}
                      onChange={(e) => handleFormChange("allowBackorder", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-b pb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Product Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL *
                    </label>
                    <input
                      value={formData.image || ""}
                      onChange={(e) => handleFormChange("image", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows="3"
                      value={formData.description || ""}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Marketing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.isActive || "true"}
                      onChange={(e) => handleFormChange("isActive", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Featured Product
                    </label>
                    <select
                      value={formData.isFeatured || "false"}
                      onChange={(e) => handleFormChange("isFeatured", e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      value={formData.tags || ""}
                      onChange={(e) => handleFormChange("tags", e.target.value)}
                      placeholder="e.g., electrical, switches, premium"
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition font-medium shadow-lg"
                >
                  <CheckCircle size={18} className="inline mr-2" />
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
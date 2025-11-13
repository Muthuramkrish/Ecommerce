import mongoose from "mongoose";

// 🛒 Cart Items
const cartItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 },
  },
  { _id: false }
);

// 💳 Checkout Items
const checkoutItemSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productTitle: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// 🏠 Address Schema (moved up before checkout schema)
const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ["home", "work", "other", "company"],
    default: "home",
  },
  fullName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please enter a valid email"],
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
  },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, "Please enter a valid 6-digit PIN code"],
  },
  isDefault: { type: Boolean, default: false },
  isTemporary: { type: Boolean, default: false }, // ✅ NEW: Mark temporary addresses
}, { _id: true, timestamps: true }); // ✅ Add timestamps to track creation

// Add this new schema after the addressSchema and before bulkOrderSchema
const companyAddressSchema = new mongoose.Schema({
  label: {
    type: String,
    default: "company",
  },
  companyName: { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please enter a valid email"],
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
  },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, "Please enter a valid 6-digit ZIP code"],
  },
  isDefault: { type: Boolean, default: false },
  isTemporary: { type: Boolean, default: false },
}, { _id: true, timestamps: true });

// 🧾 Checkout Schema 
const checkoutSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    items: [checkoutItemSchema],
    shippingInfo: {
      addressId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Address'
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/.+@.+\..+/, "Please enter a valid email"],
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cod", "card", "upi"],
      default: "cod",
    },
    orderSummary: {
      subtotal: { type: Number, required: true, min: 0 },
      shipping: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      roundOff: { type: Number, required: true },
      total: { type: Number, required: true, min: 0 },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned"
      ],
      default: "pending",
    },

    cancellationReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    returnedReason: { type: String, default: null },
    returnedAt: { type: Date, default: null },

    trackingId: { type: String, default: null },
    estimatedDelivery: { type: Date, default: null },
  },
  { timestamps: true }
);

// 🏢 Bulk Order Items
const bulkOrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 10 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 18 },
  },
  { _id: false }
);

// 📦 Bulk Order Schema
const bulkOrderSchema = new mongoose.Schema(
  {
    bulkOrderId: { type: String, required: true },
    companyInfo: {
      companyAddressId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'CompanyAddress'
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        match: [/.+@.+\..+/, "Please enter a valid email"],
      },
    },
    items: [bulkOrderItemSchema],
    orderType: {
      type: String,
      enum: ["electrical", "industrial", "commercial", "residential"],
      default: "electrical",
    },
    specialRequirements: { type: String, trim: true, default: "" },
    orderSummary: {
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
      roundedTotal: { type: Number, required: true, min: 0 },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "quoted",
        "approved",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "rejected",
        "returned"
      ],
      default: "pending",
    },

    cancellationReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    returnedReason: { type: String, default: null },
    returnedAt: { type: Date, default: null },

    quotedPrice: { type: Number, default: null },
    quotedBy: { type: String, default: null },
    quotedAt: { type: Date, default: null },
    notes: { type: String, default: "" },
    expectedDelivery: { type: Date, default: null },
    trackingId: { type: String, default: null },
  },
  { timestamps: true }
);

// 👤 User Schema
const userSchema = new mongoose.Schema(
  {
    // 🧑 Basic Info
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    termsAccepted: { type: Boolean, default: false },

    // 🛡️ Role-Based Access
    role: {
      type: String,
      enum: ["user", "admin", "manager", "superadmin"],
      default: "user",
    },
    permissions: {
      canManageOrders: { type: Boolean, default: false },
      canManageProducts: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: true },
    },

    // ⚙️ Admin Section (only for admin users)
    admin: {
      type: {
        assignedStores: [
          {
            storeId: { type: String },
            storeName: { type: String },
          },
        ],
        managedCategories: [{ type: String }],
        approvalLevel: {
          type: String,
          enum: ["level1", "level2", "supervisor", "director"],
          default: "level1",
        },
        accessLogs: [
          {
            action: { type: String },
            timestamp: { type: Date, default: Date.now },
            ipAddress: { type: String },
          },
        ],
      },
      required: false,
      default: undefined,
    },

    // ❤️ User Activity
    favorites: [
      {
        category: { type: String, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      },
    ],
    cart: [cartItemSchema],
    orders: [checkoutSchema],
    addresses: [addressSchema],
    companyAddresses: [companyAddressSchema],
    bulkOrders: [bulkOrderSchema],

    // 📅 Status Tracking
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    lastLogin: { type: Date, default: null },
  },
  { 
    timestamps: true,
    minimize: false // ✅ Keep empty objects
  }
);

// ✅ PRE-SAVE MIDDLEWARE: Auto-initialize admin field for admin users
userSchema.pre('save', function(next) {
  // Only run on new documents or when role changes
  if (this.isNew || this.isModified('role')) {
    const isAdminRole = ['admin', 'manager', 'superadmin'].includes(this.role);
    
    if (isAdminRole && !this.admin) {
      // Initialize admin object with defaults
      this.admin = {
        assignedStores: [],
        managedCategories: [],
        approvalLevel: this.role === 'superadmin' ? 'director' : 
                       this.role === 'manager' ? 'supervisor' : 'level1',
        accessLogs: []
      };
      
      // Set appropriate permissions based on role
      if (this.role === 'superadmin') {
        this.permissions = {
          canManageOrders: true,
          canManageProducts: true,
          canManageUsers: true,
          canViewReports: true,
        };
      } else if (this.role === 'admin') {
        this.permissions = {
          canManageOrders: true,
          canManageProducts: true,
          canManageUsers: false,
          canViewReports: true,
        };
      } else if (this.role === 'manager') {
        this.permissions = {
          canManageOrders: true,
          canManageProducts: false,
          canManageUsers: false,
          canViewReports: true,
        };
      }
    } else if (!isAdminRole && this.admin) {
      // Remove admin field if role changes from admin to user
      this.admin = undefined;
    }
  }
  next();
});

export default mongoose.model("User", userSchema);
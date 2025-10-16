import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    category: {
      type: String, // e.g. "Switches", "Fans"
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Product from that category collection
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const checkoutItemSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    productTitle: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const checkoutSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [checkoutItemSchema],
    shippingInfo: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
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
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      pincode: {
        type: String,
        required: true,
        match: [/^\d{6}$/, "Please enter a valid 6-digit PIN code"],
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cod', 'card', 'upi'],
      default: 'cod',
    },
    orderSummary: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      shipping: {
        type: Number,
        required: true,
        min: 0,
      },
      tax: {
        type: Number,
        required: true,
        min: 0,
      },
      roundOff: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingId: {
      type: String,
      default: null,
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const bulkOrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 10, // Minimum bulk quantity
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 18,
    },
  },
  { _id: false }
);

const bulkOrderSchema = new mongoose.Schema(
  {
    bulkOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    companyInfo: {
      companyName: {
        type: String,
        required: true,
        trim: true,
      },
      contactPerson: {
        type: String,
        required: true,
        trim: true,
      },
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
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      district: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        match: [/^\d{6}$/, "Please enter a valid 6-digit ZIP code"],
      },
    },
    items: [bulkOrderItemSchema],
    orderType: {
      type: String,
      enum: ['electrical', 'industrial', 'commercial', 'residential'],
      default: 'electrical',
    },
    specialRequirements: {
      type: String,
      trim: true,
      default: '',
    },
    orderSummary: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      tax: {
        type: Number,
        required: true,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
      roundedTotal: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'quoted', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    quotedPrice: {
      type: Number,
      default: null,
    },
    quotedBy: {
      type: String,
      default: null,
    },
    quotedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    expectedDelivery: {
      type: Date,
      default: null,
    },
    trackingId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
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
    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },
    favorites: [
      {
        category: {
          type: String, // e.g. "Fans", "Switches"
          required: true,
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
    cart: [cartItemSchema],
    orders: [checkoutSchema],
    bulkOrders: [bulkOrderSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
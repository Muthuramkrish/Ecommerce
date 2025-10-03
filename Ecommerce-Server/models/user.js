import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // Basic Information
    personalInfo: {
      firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        maxlength: [50, "First name cannot exceed 50 characters"],
      },
      lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        maxlength: [50, "Last name cannot exceed 50 characters"],
      },
      email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email address",
        ],
      },
      phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-()]+$/, "Please enter a valid phone number"],
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-to-say"],
      },
    },

    // Authentication
    authentication: {
      password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
      },
      isEmailVerified: {
        type: Boolean,
        default: false,
      },
      emailVerificationToken: String,
      emailVerificationExpires: Date,
      passwordResetToken: String,
      passwordResetExpires: Date,
      lastLogin: Date,
      loginAttempts: {
        type: Number,
        default: 0,
      },
      lockUntil: Date,
    },

    // Profile & Preferences
    profile: {
      avatar: {
        url: String,
        publicId: String, // for cloudinary or similar
      },
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      preferences: {
        newsletter: {
          type: Boolean,
          default: true,
        },
        smsNotifications: {
          type: Boolean,
          default: false,
        },
        emailNotifications: {
          type: Boolean,
          default: true,
        },
        language: {
          type: String,
          default: "en",
        },
        currency: {
          type: String,
          default: "INR",
        },
      },
    },

    // Address Information
    addresses: [
      {
        type: {
          type: String,
          enum: ["home", "work", "billing", "shipping", "other"],
          default: "home",
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        fullName: String,
        addressLine1: {
          type: String,
          required: true,
        },
        addressLine2: String,
        city: {
          type: String,
          required: true,
        },
        state: {
          type: String,
          required: true,
        },
        postalCode: {
          type: String,
          required: true,
        },
        country: {
          type: String,
          required: true,
          default: "India",
        },
        phone: String,
        instructions: String,
      },
    ],

    // E-commerce Related
    ecommerce: {
      // Wishlist/Favorites
      wishlist: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
          collectionName: String, // e.g., "switches", "fans"
          addedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      // Cart (for persistent cart across sessions)
      cart: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
          collectionName: String,
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          selectedVariant: Schema.Types.Mixed, // color, size, etc.
          addedAt: {
            type: Date,
            default: Date.now,
          },
          price: Number, // price at the time of adding to cart
        },
      ],

      // Order History (references to orders)
      orders: [
        {
          orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
          },
          orderNumber: String,
          status: String,
          totalAmount: Number,
          orderDate: Date,
        },
      ],

      // Customer Metrics
      metrics: {
        totalOrders: {
          type: Number,
          default: 0,
        },
        totalSpent: {
          type: Number,
          default: 0,
        },
        averageOrderValue: {
          type: Number,
          default: 0,
        },
        lastOrderDate: Date,
        customerSince: {
          type: Date,
          default: Date.now,
        },
        loyaltyPoints: {
          type: Number,
          default: 0,
        },
        customerTier: {
          type: String,
          enum: ["bronze", "silver", "gold", "platinum"],
          default: "bronze",
        },
      },
    },

    // Account Status & Permissions
    account: {
      status: {
        type: String,
        enum: ["active", "inactive", "suspended", "deleted"],
        default: "active",
      },
      role: {
        type: String,
        enum: ["customer", "admin", "moderator", "vendor"],
        default: "customer",
      },
      permissions: [String], // specific permissions for fine-grained access control
      notes: String, // admin notes about the user
    },

    // Tracking & Analytics
    tracking: {
      registrationSource: String, // web, mobile, social, etc.
      referralCode: String,
      referredBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      utmSource: String,
      utmMedium: String,
      utmCampaign: String,
      ipAddress: String,
      userAgent: String,
      lastActiveAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
userSchema.index({ "personalInfo.email": 1 }, { unique: true });
userSchema.index({ "account.status": 1 });
userSchema.index({ "account.role": 1 });
userSchema.index({ "ecommerce.wishlist.productId": 1 });
userSchema.index({ "ecommerce.cart.productId": 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for account locked status
userSchema.virtual("isLocked").get(function () {
  return !!(this.authentication.lockUntil && this.authentication.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("authentication.password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.authentication.password = await bcrypt.hash(this.authentication.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.authentication.password) return false;
  return bcrypt.compare(candidatePassword, this.authentication.password);
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.authentication.lockUntil && this.authentication.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { "authentication.lockUntil": 1 },
      $set: { "authentication.loginAttempts": 1 },
    });
  }
  
  const updates = { $inc: { "authentication.loginAttempts": 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.authentication.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { "authentication.lockUntil": Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: {
      "authentication.loginAttempts": 1,
      "authentication.lockUntil": 1,
    },
  });
};

// Method to add item to wishlist
userSchema.methods.addToWishlist = function (productId, collectionName) {
  const existingItem = this.ecommerce.wishlist.find(
    (item) => item.productId.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.ecommerce.wishlist.push({
      productId,
      collectionName,
      addedAt: new Date(),
    });
  }
  
  return this.save();
};

// Method to remove item from wishlist
userSchema.methods.removeFromWishlist = function (productId) {
  this.ecommerce.wishlist = this.ecommerce.wishlist.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  
  return this.save();
};

// Method to add item to cart
userSchema.methods.addToCart = function (productId, collectionName, quantity, selectedVariant, price) {
  const existingItem = this.ecommerce.cart.find(
    (item) => 
      item.productId.toString() === productId.toString() &&
      JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.ecommerce.cart.push({
      productId,
      collectionName,
      quantity,
      selectedVariant,
      price,
      addedAt: new Date(),
    });
  }
  
  return this.save();
};

// Method to remove item from cart
userSchema.methods.removeFromCart = function (productId, selectedVariant) {
  this.ecommerce.cart = this.ecommerce.cart.filter(
    (item) => 
      !(item.productId.toString() === productId.toString() &&
        JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant))
  );
  
  return this.save();
};

// Method to clear cart
userSchema.methods.clearCart = function () {
  this.ecommerce.cart = [];
  return this.save();
};

// Method to update last active timestamp
userSchema.methods.updateLastActive = function () {
  this.tracking.lastActiveAt = new Date();
  return this.save();
};

const User = mongoose.model("User", userSchema);

export default User;
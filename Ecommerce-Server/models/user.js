import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    // New ObjectId-based format
    category: {
      type: String, // e.g. "Switches", "Fans"
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    
    // Temporary fallback fields (old format) - for compatibility
    productTitle: String,
    imageUrl: String,
    oldPrice: String,
    newPrice: String,
    rating: Number,
    reviews: Number,
    raw: mongoose.Schema.Types.Mixed,
    addedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { _id: false }
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
        // New ObjectId-based format
        category: {
          type: String, // e.g. "Fans", "Switches"
        },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        
        // Temporary fallback fields (old format) - for compatibility
        productTitle: String,
        imageUrl: String,
        oldPrice: String,
        newPrice: String,
        rating: Number,
        reviews: Number,
        raw: mongoose.Schema.Types.Mixed,
      },
    ],
    cart: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
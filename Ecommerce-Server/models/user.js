import mongoose from "mongoose";

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
    favorites: [{
      productTitle: {
        type: String,
        required: true
      },
      imageUrl: {
        type: String,
        required: true
      },
      oldPrice: {
        type: String,
        required: true
      },
      newPrice: {
        type: String,
        required: true
      },
      category: String,
      rating: Number,
      reviews: Number,
      raw: {
        type: mongoose.Schema.Types.Mixed
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    cart: [{
      productTitle: {
        type: String,
        required: true
      },
      imageUrl: {
        type: String,
        required: true
      },
      oldPrice: {
        type: String,
        required: true
      },
      newPrice: {
        type: String,
        required: true
      },
      category: String,
      rating: Number,
      reviews: Number,
      raw: {
        type: mongoose.Schema.Types.Mixed
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
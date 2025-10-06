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
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
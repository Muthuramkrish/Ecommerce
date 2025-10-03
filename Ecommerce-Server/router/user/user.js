import express from "express";
import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../../controller/user.js";
import { protect } from "../../middleware/auth.js";
import {
  validateAddress,
  validateWishlistItem,
  validateCartItem,
} from "../../middleware/validation.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Address routes
router.route("/addresses")
  .get(getAddresses)
  .post(validateAddress, addAddress);

router.route("/addresses/:addressId")
  .put(validateAddress, updateAddress)
  .delete(deleteAddress);

// Wishlist routes
router.route("/wishlist")
  .get(getWishlist)
  .post(validateWishlistItem, addToWishlist);

router.route("/wishlist/:productId")
  .delete(removeFromWishlist);

// Cart routes
router.route("/cart")
  .get(getCart)
  .post(validateCartItem, addToCart)
  .delete(clearCart);

router.route("/cart/:productId")
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;
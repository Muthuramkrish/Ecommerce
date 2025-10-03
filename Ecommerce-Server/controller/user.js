import User from "../models/user.js";
import { getProductModel } from "../models/products.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

// @desc    Add address
// @route   POST /api/user/addresses
// @access  Private
export const addAddress = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      type = "home",
      fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country = "India",
      phone,
      instructions,
      isDefault = false,
    } = req.body;

    const user = await User.findById(req.user._id);

    // If this is set as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // If this is the first address, make it default
    if (user.addresses.length === 0) {
      isDefault = true;
    }

    const newAddress = {
      type,
      isDefault,
      fullName: fullName || user.fullName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      phone: phone || user.personalInfo.phone,
      instructions,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: {
        address: user.addresses[user.addresses.length - 1],
      },
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding address",
      error: error.message,
    });
  }
};

// @desc    Get user addresses
// @route   GET /api/user/addresses
// @access  Private
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");

    res.status(200).json({
      success: true,
      data: {
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching addresses",
      error: error.message,
    });
  }
};

// @desc    Update address
// @route   PUT /api/user/addresses/:addressId
// @access  Private
export const updateAddress = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Update address fields
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        address[key] = req.body[key];
      }
    });

    // If setting as default, unset other defaults
    if (req.body.isDefault === true) {
      user.addresses.forEach((addr) => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: {
        address,
      },
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating address",
      error: error.message,
    });
  }
};

// @desc    Delete address
// @route   DELETE /api/user/addresses/:addressId
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(addressId);

    // If deleted address was default, make the first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting address",
      error: error.message,
    });
  }
};

// @desc    Add item to wishlist
// @route   POST /api/user/wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { productId, collectionName } = req.body;

    // Verify product exists
    const ProductModel = getProductModel(collectionName);
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.user._id);

    // Check if item already in wishlist
    const existingItem = user.ecommerce.wishlist.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    await user.addToWishlist(productId, collectionName);

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding product to wishlist",
      error: error.message,
    });
  }
};

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("ecommerce.wishlist");

    // Populate product details
    const wishlistWithProducts = await Promise.all(
      user.ecommerce.wishlist.map(async (item) => {
        try {
          const ProductModel = getProductModel(item.collectionName);
          const product = await ProductModel.findById(item.productId);
          
          return {
            _id: item._id,
            productId: item.productId,
            collectionName: item.collectionName,
            addedAt: item.addedAt,
            product: product || null,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return {
            _id: item._id,
            productId: item.productId,
            collectionName: item.collectionName,
            addedAt: item.addedAt,
            product: null,
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: {
        wishlist: wishlistWithProducts,
      },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
      error: error.message,
    });
  }
};

// @desc    Remove item from wishlist
// @route   DELETE /api/user/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const user = await User.findById(req.user._id);
    await user.removeFromWishlist(productId);

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing product from wishlist",
      error: error.message,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/user/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { productId, collectionName, quantity, selectedVariant, price } = req.body;

    // Verify product exists
    const ProductModel = getProductModel(collectionName);
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check inventory if tracking is enabled
    if (product.inventory?.trackInventory) {
      const availableQuantity = product.inventory.availableQuantity || 0;
      if (quantity > availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableQuantity} items available in stock`,
        });
      }
    }

    const user = await User.findById(req.user._id);
    await user.addToCart(productId, collectionName, quantity, selectedVariant, price);

    res.status(201).json({
      success: true,
      message: "Product added to cart",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding product to cart",
      error: error.message,
    });
  }
};

// @desc    Get user cart
// @route   GET /api/user/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("ecommerce.cart");

    // Populate product details and calculate totals
    let cartTotal = 0;
    const cartWithProducts = await Promise.all(
      user.ecommerce.cart.map(async (item) => {
        try {
          const ProductModel = getProductModel(item.collectionName);
          const product = await ProductModel.findById(item.productId);
          
          const itemTotal = item.price * item.quantity;
          cartTotal += itemTotal;
          
          return {
            _id: item._id,
            productId: item.productId,
            collectionName: item.collectionName,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant,
            price: item.price,
            addedAt: item.addedAt,
            itemTotal,
            product: product || null,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
          return {
            _id: item._id,
            productId: item.productId,
            collectionName: item.collectionName,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant,
            price: item.price,
            addedAt: item.addedAt,
            itemTotal: item.price * item.quantity,
            product: null,
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: {
        cart: cartWithProducts,
        summary: {
          totalItems: user.ecommerce.cart.length,
          totalQuantity: user.ecommerce.cart.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: cartTotal,
          // You can add tax, shipping, discounts here
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/user/cart/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, selectedVariant } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const user = await User.findById(req.user._id);

    // Find cart item
    const cartItem = user.ecommerce.cart.find(
      (item) => 
        item.productId.toString() === productId &&
        JSON.stringify(item.selectedVariant) === JSON.stringify(selectedVariant)
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Verify product still exists and check inventory
    const ProductModel = getProductModel(cartItem.collectionName);
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product no longer available",
      });
    }

    if (product.inventory?.trackInventory) {
      const availableQuantity = product.inventory.availableQuantity || 0;
      if (quantity > availableQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableQuantity} items available in stock`,
        });
      }
    }

    cartItem.quantity = quantity;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error.message,
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/user/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { selectedVariant } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const user = await User.findById(req.user._id);
    await user.removeFromCart(productId, selectedVariant);

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing product from cart",
      error: error.message,
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/user/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await user.clearCart();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};

export default {
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
};
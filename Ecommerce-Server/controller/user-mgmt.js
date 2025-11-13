import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "vikoshiya_india_electrical_&_electronics_ecommerce_service_site";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// Helper function to get all collection names dynamically from database
const getAllCollections = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    // Filter out system collections and user collection
    return collections
      .map(col => col.name)
      .filter(name => !name.startsWith('system.') && name !== 'users');
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
};

// Helper function to get product from appropriate collection
const getProductFromCollection = async (category, productId) => {
  try {
    const collectionName = category.toLowerCase();
    const collection = mongoose.connection.db.collection(collectionName);
    const product = await collection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    return product;
  } catch (error) {
    console.error(`Error fetching product from ${category}:`, error);
    return null;
  }
};

// ✅ NEW: Helper function to update product inventory
const updateProductInventory = async (category, productId, quantityToReduce) => {
  try {
    const collectionName = category.toLowerCase();
    const collection = mongoose.connection.db.collection(collectionName);
    
    // Get current product
    const product = await collection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    if (!product) {
      throw new Error(`Product not found in ${category}`);
    }

    const currentAvailable = product.inventory?.availableQuantity ?? 0;
    const currentTotal = product.inventory?.totalQuantity ?? 0;
    const currentReserved = product.inventory?.reservedQuantity ?? 0;

    // Calculate new quantities
    const newAvailable = Math.max(0, currentAvailable - quantityToReduce);
    const newReserved = currentReserved + quantityToReduce;

    // Update the product inventory
    const result = await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      {
        $set: {
          'inventory.availableQuantity': newAvailable,
          'inventory.reservedQuantity': newReserved,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error(`Failed to update inventory for product in ${category}`);
    }

    console.log(`✅ Inventory updated for ${productId}: Available ${currentAvailable} → ${newAvailable}, Reserved ${currentReserved} → ${newReserved}`);
    return true;
  } catch (error) {
    console.error(`Error updating inventory for ${category}/${productId}:`, error);
    throw error;
  }
};

// ✅ NEW: Helper function to restore product inventory (in case of order cancellation or error)
const restoreProductInventory = async (category, productId, quantityToRestore) => {
  try {
    const collectionName = category.toLowerCase();
    const collection = mongoose.connection.db.collection(collectionName);
    
    const product = await collection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    if (!product) {
      console.error(`Product not found in ${category} for inventory restoration`);
      return false;
    }

    const currentAvailable = product.inventory?.availableQuantity ?? 0;
    const currentReserved = product.inventory?.reservedQuantity ?? 0;

    const newAvailable = currentAvailable + quantityToRestore;
    const newReserved = Math.max(0, currentReserved - quantityToRestore);

    await collection.updateOne(
      { _id: new mongoose.Types.ObjectId(productId) },
      {
        $set: {
          'inventory.availableQuantity': newAvailable,
          'inventory.reservedQuantity': newReserved,
          updatedAt: new Date()
        }
      }
    );

    console.log(`🔄 Inventory restored for ${productId}: Available ${currentAvailable} → ${newAvailable}, Reserved ${currentReserved} → ${newReserved}`);
    return true;
  } catch (error) {
    console.error(`Error restoring inventory for ${category}/${productId}:`, error);
    return false;
  }
}

// Helper function to convert database product to frontend format
const convertDbProductToFrontend = (dbProduct, category) => {
  if (!dbProduct) return null;
  
  const productTitle = dbProduct['product-title'] || 
                      dbProduct.characteristics?.title || 
                      dbProduct.title || 
                      'Unknown Product';
                      
  const imageUrl = dbProduct['image-url'] || 
                   dbProduct.characteristics?.images?.primary?.[0] || 
                   dbProduct.imageUrl || 
                   '';
                   
  const oldPrice = dbProduct['old-price'] || 
                   dbProduct.pricing?.comparePrice || 
                   dbProduct.oldPrice || 
                   '0';
                   
  const newPrice = dbProduct['new-price'] || 
                   dbProduct.pricing?.basePrice || 
                   dbProduct.newPrice || 
                   dbProduct.price || 
                   '0';
  
  return {
    'product-title': productTitle,
    'product-id': dbProduct._id,
    'image-url': imageUrl,
    'old-price': String(oldPrice),
    'new-price': String(newPrice),
    category: category,
    _id: dbProduct._id,
    raw:dbProduct
  };
};

// Helper function to populate favorites with product data
const populateFavorites = async (favorites) => {
  const populatedFavorites = [];
  
  for (const fav of favorites) {
    const product = await getProductFromCollection(fav.category, fav.productId);
    if (product) {
      const frontendProduct = convertDbProductToFrontend(product, fav.category);
      if (frontendProduct) {
        populatedFavorites.push(frontendProduct);
      }
    }
  }
  
  return populatedFavorites;
};

// Helper function to populate cart with product data
const populateCart = async (cartItems) => {
  const populatedCart = [];
  
  for (const item of cartItems) {
    const product = await getProductFromCollection(item.category, item.productId);
    if (product) {
      const frontendProduct = convertDbProductToFrontend(product, item.category);
      if (frontendProduct) {
        frontendProduct.quantity = item.quantity;
        populatedCart.push(frontendProduct);
      }
    }
  }
  
  return populatedCart;
};

// Helper function to find product ID and category - DYNAMICALLY from database
const findProductIdAndCategory = async (frontendProduct) => {
  const productId = frontendProduct['product-id'];
  console.log(`🔍 Looking for product with ID: ${productId}`);
  
  // Get all collections dynamically from database
  const collections = await getAllCollections();
  console.log(`📚 Searching in collections: ${collections.join(', ')}`);
  
  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      
      // Try to find by MongoDB _id first (if it's a valid ObjectId)
      let product = null;
      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await collection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
        if (product) console.log(`✅ Found product by _id in ${collectionName}`);
      }
      
      // If not found by _id, try to find by identifiers.productId field
      if (!product) {
        product = await collection.findOne({ 'identifiers.productId': productId });
        if (product) console.log(`✅ Found product by identifiers.productId in ${collectionName}`);
      }
      
      // If still not found, try to find by the productId field directly
      if (!product) {
        product = await collection.findOne({ productId: productId });
        if (product) console.log(`✅ Found product by productId in ${collectionName}`);
      }
      
      if (product) {
        return {
          productId: product._id,
          category: collectionName.charAt(0).toUpperCase() + collectionName.slice(1)
        };
      }
    } catch (error) {
      console.error(`❌ Error searching in ${collectionName}:`, error);
    }
  }
  
  console.log(`❌ Product not found: ${productId}`);
  return null;
};

// Sign Up
export const signUp = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: "Database connection unavailable" 
      });
    }
    
    const { fullName, email, password, termsAccepted } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ message: "You must accept terms & conditions" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      termsAccepted,
      favorites: [],
      cart: []
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        error: err.message 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Email already registered" 
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: err.message
    });
  }
};

// ✅ UPDATED: Sign In - Clear error messages for email not found vs wrong password
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // ✅ If email not found - suggest sign up
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Please sign up first.",
        type: "email_not_found"
      });
    }

    // ✅ Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        type: "wrong_password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Populate user data
    const favorites = await populateFavorites(user.favorites || []);
    const cart = await populateCart(user.cart || []);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Send success response
    res.status(200).json({ 
      success: true,
      message: "Login successful", 
      token, 
      user: { 
        id: user._id,
        fullName: user.fullName, 
        email: user.email,
        role: user.role
      },
      favorites,
      cart
    });
  } catch (err) {
    console.error('Sign in error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error during login", 
      error: err.message 
    });
  }
};

// Get User Data (profile, cart, and favorites)
export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favorites = await populateFavorites(user.favorites || []);
    const cart = await populateCart(user.cart || []);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      },
      favorites,
      cart
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching user data" 
    });
  }
};

// Add to Favorites
export const addToFavorites = async (req, res) => {
  try {
    const { product } = req.body;
    
    if (!product || !product['product-id']) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productInfo = await findProductIdAndCategory(product);
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found in database" });
    }

    const existingIndex = user.favorites.findIndex(
      fav => fav.productId.toString() === productInfo.productId.toString()
    );

    if (existingIndex !== -1) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    user.favorites.push({
      category: productInfo.category,
      productId: productInfo.productId
    });
    await user.save();

    const favorites = await populateFavorites(user.favorites);
    res.status(200).json({ 
      message: "Product added to favorites", 
      favorites 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove from Favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productInfo = await findProductIdAndCategory({ 'product-id': productId });
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found" });
    }

    user.favorites = user.favorites.filter(
      fav => fav.productId.toString() !== productInfo.productId.toString()
    );
    await user.save();

    const favorites = await populateFavorites(user.favorites);
    res.status(200).json({ 
      message: "Product removed from favorites", 
      favorites 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Favorites
export const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favorites = await populateFavorites(user.favorites);
    res.status(200).json({ favorites });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add to Cart
export const addToCart = async (req, res) => {
  try {
    const { product, quantity = 1 } = req.body;
    
    if (!product || !product['product-id']) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productInfo = await findProductIdAndCategory(product);
    if (!productInfo) {
      return res.status(404).json({ 
        message: "Product not found in database"
      });
    }

    // Get the actual product to check stock
    const actualProduct = await getProductFromCollection(productInfo.category.toLowerCase(), productInfo.productId);
    const availableStock = actualProduct?.inventory?.availableQuantity;

    const existingIndex = user.cart.findIndex(
      item => item.productId.toString() === productInfo.productId.toString()
    );

    let newQuantity;
    if (existingIndex !== -1) {
      newQuantity = user.cart[existingIndex].quantity + quantity;
      // Check stock limit if available
      if (availableStock != null && newQuantity > availableStock) {
        return res.status(400).json({ 
          message: `Cannot add more items. Only ${availableStock} items available in stock.`,
          availableStock 
        });
      }
      user.cart[existingIndex].quantity = Math.max(1, newQuantity);
    } else {
      newQuantity = Math.max(1, quantity);
      // Check stock limit if available
      if (availableStock != null && newQuantity > availableStock) {
        return res.status(400).json({ 
          message: `Cannot add ${newQuantity} items. Only ${availableStock} items available in stock.`,
          availableStock 
        });
      }
      user.cart.push({
        category: productInfo.category,
        productId: productInfo.productId,
        quantity: newQuantity
      });
    }

    await user.save();

    const cart = await populateCart(user.cart);
    res.status(200).json({ 
      message: "Product added to cart", 
      cart 
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Cart Item Quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productInfo = await findProductIdAndCategory({ 'product-id': productId });
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get the actual product to check stock
    const actualProduct = await getProductFromCollection(productInfo.category.toLowerCase(), productInfo.productId);
    const availableStock = actualProduct?.inventory?.availableQuantity;

    // Check stock limit if available
    if (availableStock != null && quantity > availableStock) {
      return res.status(400).json({ 
        message: `Cannot set quantity to ${quantity}. Only ${availableStock} items available in stock.`,
        availableStock 
      });
    }

    const itemIndex = user.cart.findIndex(
      item => item.productId.toString() === productInfo.productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    const cart = await populateCart(user.cart);
    res.status(200).json({ 
      message: "Cart quantity updated", 
      cart 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productInfo = await findProductIdAndCategory({ 'product-id': productId });
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found" });
    }

    user.cart = user.cart.filter(
      item => item.productId.toString() !== productInfo.productId.toString()
    );
    await user.save();

    const cart = await populateCart(user.cart);
    res.status(200).json({ 
      message: "Product removed from cart", 
      cart 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const cart = await populateCart(user.cart);
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    await user.save();

    res.status(200).json({ 
      message: "Cart cleared successfully", 
      cart: [] 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Sync Cart from Frontend
export const syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ message: "Invalid cart data" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newCartItems = [];
    
    for (const item of cartItems) {
      if (!item['product-id']) continue;
      
      const productInfo = await findProductIdAndCategory(item);
      if (!productInfo) continue;
      
      const existingIndex = user.cart.findIndex(
        cartItem => cartItem.productId.toString() === productInfo.productId.toString()
      );
      
      // Get the actual product to check stock
      const actualProduct = await getProductFromCollection(productInfo.category.toLowerCase(), productInfo.productId);
      const availableStock = actualProduct?.inventory?.availableQuantity;
      
      if (existingIndex !== -1) {
        const newQuantity = user.cart[existingIndex].quantity + (item.quantity || 1);
        // Check stock limit if available
        if (availableStock != null && newQuantity > availableStock) {
          user.cart[existingIndex].quantity = Math.min(availableStock, user.cart[existingIndex].quantity);
        } else {
          user.cart[existingIndex].quantity = Math.max(1, newQuantity);
        }
      } else {
        const newQuantity = Math.max(1, item.quantity || 1);
        // Check stock limit if available
        if (availableStock != null && newQuantity > availableStock) {
          if (availableStock > 0) {
            newCartItems.push({
              category: productInfo.category,
              productId: productInfo.productId,
              quantity: availableStock
            });
          }
          // If no stock available, don't add to cart
        } else {
          newCartItems.push({
            category: productInfo.category,
            productId: productInfo.productId,
            quantity: newQuantity
          });
        }
      }
    }
    
    user.cart.push(...newCartItems);
    await user.save();

    const cart = await populateCart(user.cart);
    res.status(200).json({ 
      message: "Cart synced successfully", 
      cart 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function to generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
};

// Helper function to generate unique bulk order ID
const generateBulkOrderId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `BULK-${timestamp}-${randomStr}`.toUpperCase();
};

// Helper function to generate unique tracking ID
const generateTrackingId = (orderType = 'ORD') => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  return `TRK${orderType}-${datePart}-${randomPart}-${timestamp.toString(36).toUpperCase()}`;
};

// Helper function to calculate estimated delivery date
const calculateEstimatedDelivery = (shippingMethod = 'standard') => {
  const now = new Date();
  const deliveryDays = shippingMethod === 'express' ? 2 : 5; // 2 days for express, 5 for standard
  const estimatedDate = new Date(now.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
  return estimatedDate;
};

// Helper function to calculateBulkDelivery
const calculateBulkDelivery = () => {
  const now = new Date();
  const deliveryDays = 10; // 10 days for bulk orders
  const expectedDate = new Date(now.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
  return expectedDate;
};

// Create Checkout/Order
export const createOrder = async (req, res) => {
  try {
    const { 
      items, 
      shippingInfo, 
      paymentMethod, 
      orderSummary 
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate shippingInfo contains addressId and email
    if (!shippingInfo || !shippingInfo.addressId || !shippingInfo.email) {
      return res.status(400).json({ 
        message: "Shipping address ID and email are required" 
      });
    }

    // Verify the address exists in user's addresses
    const addressExists = user.addresses.some(
      addr => addr._id.toString() === shippingInfo.addressId
    );

    if (!addressExists) {
      return res.status(404).json({ 
        message: "Selected shipping address not found" 
      });
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!paymentMethod || !orderSummary) {
      return res.status(400).json({ message: "Missing required order information" });
    }

    // Validate and prepare order items
    const orderItems = [];
    const inventoryUpdates = []; // Track inventory updates for rollback if needed
    
    try {
      for (const item of items) {
        if (!item['product-id'] || !item.quantity) {
          continue;
        }

        const productInfo = await findProductIdAndCategory(item);
        if (!productInfo) {
          throw new Error(`Product not found: ${item['product-title'] || 'Unknown'}`);
        }

        // Get actual product to verify availability and get current price
        const actualProduct = await getProductFromCollection(
          productInfo.category.toLowerCase(), 
          productInfo.productId
        );

        if (!actualProduct) {
          throw new Error(`Product no longer available: ${item['product-title'] || 'Unknown'}`);
        }

        // Check stock availability
        const availableStock = actualProduct?.inventory?.availableQuantity;
        if (availableStock != null && item.quantity > availableStock) {
          throw new Error(`Insufficient stock for ${item['product-title']}. Available: ${availableStock}`);
        }

        // ✅ Update inventory - reduce available quantity
        await updateProductInventory(
          productInfo.category.toLowerCase(),
          productInfo.productId,
          item.quantity
        );

        // Track this update for potential rollback
        inventoryUpdates.push({
          category: productInfo.category.toLowerCase(),
          productId: productInfo.productId,
          quantity: item.quantity
        });

        orderItems.push({
          category: productInfo.category,
          productId: productInfo.productId,
          productTitle: item['product-title'],
          imageUrl: item['image-url'],
          price: parseFloat(item['new-price']),
          quantity: item.quantity,
        });
      }

      // Generate unique order ID
      const orderId = generateOrderId();

      // Generate unique Tracking ID
      const trackingId = generateTrackingId('ORD');

      // Create the order with addressId reference
      const newOrder = {
        orderId,
        items: orderItems,
        shippingInfo: {
          addressId: shippingInfo.addressId,
          email: shippingInfo.email,
        },
        paymentMethod,
        orderSummary: {
          subtotal: orderSummary.subtotal,
          shipping: orderSummary.shipping,
          tax: orderSummary.tax,
          roundOff: orderSummary.roundOff,
          total: orderSummary.total,
        },
        status: 'pending',
        trackingId: trackingId,
        estimatedDelivery: calculateEstimatedDelivery(),
      };

      // Add order to user's orders array
      user.orders.push(newOrder);

      // Clear the user's cart after successful order
      user.cart = [];

      await user.save();

      console.log(`✅ Order ${orderId} created successfully with ${orderItems.length} items`);

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order: newOrder,
        orderId: orderId,
        trackingId: trackingId
      });

    } catch (inventoryError) {
      // ❌ Rollback inventory updates if order creation fails
      console.error('❌ Order creation failed, rolling back inventory updates:', inventoryError);
      
      for (const update of inventoryUpdates) {
        await restoreProductInventory(
          update.category,
          update.productId,
          update.quantity
        );
      }
      
      throw inventoryError;
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Error creating order", 
      error: error.message 
    });
  }
};

// Helper function to populate order with full address details
export const getOrderWithFullAddress = (order, user) => {
  if (!order || !order.shippingInfo || !order.shippingInfo.addressId) {
    return order;
  }

  // Find the address in user's addresses array
  const address = user.addresses.find(
    addr => addr._id.toString() === order.shippingInfo.addressId.toString()
  );

  // Return order with populated address
  return {
    ...order.toObject ? order.toObject() : order,
    shippingInfo: {
      ...order.shippingInfo,
      address: address || null, // Include full address object
    }
  };
};

// 📦 Get all orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    if (!user || !user.orders || user.orders.length === 0) {
      return res.status(404).json({ success: false, message: "No orders found" });
    }

    const ordersWithAddress = user.orders.map((order) => {
      // find matching address by ID
      const address =
        user.addresses?.find(
          (a) => a._id.toString() === order.shippingInfo?.addressId?.toString()
        ) || null;

      // attach full address object if found
      if (address) {
        order.shippingInfo = { ...address, email: order.shippingInfo?.email };
      }

      return order;
    });

    res.status(200).json({
      success: true,
      orders: ordersWithAddress,
    });
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// 📦 Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const order = user.orders.find(
      (o) => o.orderId === req.params.orderId
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const address =
      user.addresses?.find(
        (a) => a._id.toString() === order.shippingInfo?.addressId?.toString()
      ) || null;

    if (address) {
      order.shippingInfo = { ...address, email: order.shippingInfo?.email };
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// Update Order Status (for admin use or status updates)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingId } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderIndex = user.orders.findIndex(order => order.orderId === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = user.orders[orderIndex].status;

    // ✅ If order is being cancelled, restore inventory
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      console.log(`🔄 Order ${orderId} cancelled, restoring inventory...`);
      
      for (const item of user.orders[orderIndex].items) {
        try {
          await restoreProductInventory(
            item.category.toLowerCase(),
            item.productId,
            item.quantity
          );
        } catch (error) {
          console.error(`Failed to restore inventory for ${item.productId}:`, error);
        }
      }
    }

    // Update order status
    user.orders[orderIndex].status = status;
    
    // Update tracking ID if provided
    if (trackingId) {
      user.orders[orderIndex].trackingId = trackingId;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: user.orders[orderIndex]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error updating order status" 
    });
  }
};

export const cancelUserOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancellationReason } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderIndex = user.orders.findIndex(order => order.orderId === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = user.orders[orderIndex];

    if (order.status === 'cancelled' || order.status === 'delivered') {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }

    // Restore product inventory
    for (const item of order.items) {
      try {
        await restoreProductInventory(item.category.toLowerCase(), item.productId, item.quantity);
      } catch (err) {
        console.error(`Failed to restore inventory for ${item.productId}:`, err);
      }
    }

    // Update order status and reason
    user.orders[orderIndex].status = 'cancelled';
    user.orders[orderIndex].cancellationReason = cancellationReason || 'User cancelled the order';
    user.orders[orderIndex].cancelledAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: user.orders[orderIndex]
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message
    });
  }
};

// Return Order
export const returnUserOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { returnReason } = req.body;

    if (!returnReason || !returnReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Return reason is required"
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const orderIndex = user.orders.findIndex(order => order.orderId === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    const order = user.orders[orderIndex];

    // Only delivered orders can be returned
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        success: false,
        message: "Only delivered orders can be returned" 
      });
    }

    // Check if order is already returned
    if (order.status === 'returned') {
      return res.status(400).json({ 
        success: false,
        message: "Order is already returned" 
      });
    }

    // Restore product inventory
    for (const item of order.items) {
      try {
        await restoreProductInventory(item.category.toLowerCase(), item.productId, item.quantity);
      } catch (err) {
        console.error(`Failed to restore inventory for ${item.productId}:`, err);
      }
    }

    // Update order status and reason
    user.orders[orderIndex].status = 'returned';
    user.orders[orderIndex].returnedReason = returnReason;
    user.orders[orderIndex].returnedAt = new Date();

    await user.save();

    console.log(`📦 Order ${orderId} returned successfully`);

    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      order: user.orders[orderIndex]
    });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({
      success: false,
      message: "Error processing return request",
      error: error.message
    });
  }
};

// Update Order Shipping Information
export const updateOrderShipping = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { addressId, email } = req.body;

    if (!addressId || !email) {
      return res.status(400).json({ 
        success: false,
        message: "Address ID and email are required" 
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Find the order
    const orderIndex = user.orders.findIndex(order => order.orderId === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    const order = user.orders[orderIndex];

    // Check if order can be edited
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot update shipping for orders in this status" 
      });
    }

    // Verify the address exists in user's addresses
    const addressExists = user.addresses.some(
      addr => addr._id.toString() === addressId.toString()
    );

    if (!addressExists) {
      return res.status(404).json({ 
        success: false,
        message: "Selected address not found" 
      });
    }

    // Update shipping information
    user.orders[orderIndex].shippingInfo = {
      addressId: addressId,
      email: email
    };

    await user.save();

    console.log(`✅ Updated shipping info for order ${orderId}`);

    res.status(200).json({
      success: true,
      message: "Shipping information updated successfully",
      order: user.orders[orderIndex]
    });
  } catch (error) {
    console.error('Update order shipping error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error updating shipping information",
      error: error.message 
    });
  }
};

// ================================
// BULK ORDER OPERATIONS
// ================================

// Create Bulk Order
export const createBulkOrder = async (req, res) => {
  try {
    const { 
      companyAddressId,
      email,
      items, 
      orderType, 
      specialRequirements, 
      orderSummary 
    } = req.body;

    console.log('📦 Received bulk order request:', { 
      companyAddressId, 
      email, 
      itemsCount: items?.length,
      orderSummary 
    });

    // Validate required fields
    if (!companyAddressId) {
      return res.status(400).json({ 
        success: false,
        message: "Company address ID is required" 
      });
    }

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Order items are required" 
      });
    }

    if (!orderSummary) {
      return res.status(400).json({ 
        success: false,
        message: "Order summary is required" 
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // ✅ Verify company address exists and convert to ObjectId
    let addressObjectId;
    try {
      addressObjectId = new mongoose.Types.ObjectId(companyAddressId);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid company address ID format"
      });
    }

    const addressExists = user.companyAddresses.some(
      addr => addr._id.toString() === addressObjectId.toString()
    );

    if (!addressExists) {
      return res.status(404).json({ 
        success: false,
        message: "Selected company address not found" 
      });
    }

    // Validate bulk order items
    const bulkOrderItems = [];
    const inventoryUpdates = [];

    try {
      for (const item of items) {
        if (!item.productId || !item.productName || !item.quantity || !item.unitPrice) {
          return res.status(400).json({ 
            success: false,
            message: `Invalid item data: ${item.productName || 'Unknown product'}` 
          });
        }

        if (item.quantity < 10) {
          return res.status(400).json({ 
            success: false,
            message: `Minimum quantity is 10 for ${item.productName}` 
          });
        }

        const productInfo = await findProductIdAndCategory({ 
          'product-id': item.productId
        });
        
        if (!productInfo) {
          return res.status(404).json({ 
            success: false,
            message: `Product not found: ${item.productName}` 
          });
        }

        const actualProduct = await getProductFromCollection(
          productInfo.category.toLowerCase(), 
          productInfo.productId
        );

        if (!actualProduct) {
          return res.status(404).json({ 
            success: false,
            message: `Product no longer available: ${item.productName}` 
          });
        }

        const availableStock = actualProduct?.inventory?.availableQuantity;
        if (availableStock != null && availableStock !== 999999 && item.quantity > availableStock) {
          return res.status(400).json({ 
            success: false,
            message: `Insufficient stock for ${item.productName}. Available: ${availableStock}` 
          });
        }

        // ✅ Update inventory
        await updateProductInventory(
          productInfo.category.toLowerCase(),
          productInfo.productId,
          item.quantity
        );

        inventoryUpdates.push({
          category: productInfo.category.toLowerCase(),
          productId: productInfo.productId,
          quantity: item.quantity
        });

        bulkOrderItems.push({
          productId: item.productId,
          productName: item.productName,
          category: productInfo.category,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.totalPrice || (item.quantity * item.unitPrice)),
          taxRate: item.taxRate || 18,
        });
      }

      const bulkOrderId = generateBulkOrderId();
      const trackingId = generateTrackingId('BULK');

      // ✅ Create bulk order with proper ObjectId reference
      const newBulkOrder = {
        bulkOrderId,
        companyInfo: {
          companyAddressId: addressObjectId, // Use ObjectId
          email: email,
        },
        items: bulkOrderItems,
        orderType: orderType || 'electrical',
        specialRequirements: specialRequirements || '',
        orderSummary: {
          subtotal: parseFloat(orderSummary.subtotal),
          tax: parseFloat(orderSummary.tax),
          total: parseFloat(orderSummary.total),
          roundedTotal: parseFloat(orderSummary.roundedTotal),
        },
        status: 'pending',
        quotedPrice: null,
        quotedBy: null,
        quotedAt: null,
        notes: '',
        expectedDelivery: null,
        expectedDelivery: calculateBulkDelivery(),
        trackingId: trackingId,
      };

      // ✅ Push to user's bulk orders
      user.bulkOrders.push(newBulkOrder);
      
      // ✅ Save user document
      await user.save();

      console.log(`✅ Bulk order ${bulkOrderId} created successfully with ${bulkOrderItems.length} items`);

      res.status(201).json({
        success: true,
        message: "Bulk order submitted successfully",
        bulkOrder: newBulkOrder,
        bulkOrderId: bulkOrderId,
        trackingId: trackingId
      });

    } catch (inventoryError) {
      console.error('❌ Bulk order creation failed, rolling back inventory updates:', inventoryError);
      
      // Rollback inventory
      for (const update of inventoryUpdates) {
        await restoreProductInventory(
          update.category,
          update.productId,
          update.quantity
        );
      }
      
      throw inventoryError;
    }

  } catch (error) {
    console.error('❌ Create bulk order error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Error creating bulk order", 
      error: error.message 
    });
  }
};

// Get User Bulk Orders
export const getUserBulkOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (!user.bulkOrders || user.bulkOrders.length === 0) {
      return res.status(200).json({ 
        success: true, 
        bulkOrders: [],
        message: "No bulk orders found" 
      });
    }

    const bulkOrdersWithAddress = user.bulkOrders.map((order) => {
      // Find matching company address by ID
      const addressIdStr = order.companyInfo?.companyAddressId?.toString();
      const address = user.companyAddresses?.find(
        (a) => a._id.toString() === addressIdStr
      ) || null;

      // Create a copy of the order
      const orderCopy = { ...order };

      // Attach full address object if found
      if (address) {
        orderCopy.companyInfo = { 
          ...address, 
          email: order.companyInfo?.email || address.email 
        };
      } else {
        console.warn(`⚠️ Address not found for bulk order ${order.bulkOrderId}`);
      }

      return orderCopy;
    });

    // Sort by creation date (newest first)
    bulkOrdersWithAddress.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    res.status(200).json({
      success: true,
      bulkOrders: bulkOrdersWithAddress,
    });
  } catch (error) {
    console.error('❌ Error fetching bulk orders:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching bulk orders",
      error: error.message
    });
  }
};

// Get Single Bulk Order by ID
export const getBulkOrderById = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const bulkOrder = user.bulkOrders.find(
      (o) => o.bulkOrderId === req.params.bulkOrderId
    );

    if (!bulkOrder) {
      return res.status(404).json({ 
        success: false, 
        message: "Bulk order not found" 
      });
    }

    // Find matching address
    const addressIdStr = bulkOrder.companyInfo?.companyAddressId?.toString();
    const address = user.companyAddresses?.find(
      (a) => a._id.toString() === addressIdStr
    ) || null;

    if (address) {
      bulkOrder.companyInfo = { 
        ...address, 
        email: bulkOrder.companyInfo?.email || address.email 
      };
    }

    res.status(200).json({
      success: true,
      bulkOrder,
    });
  } catch (error) {
    console.error("❌ Error fetching bulk order details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bulk order details",
      error: error.message
    });
  }
};

// Update Bulk Order Status (for admin use or status updates)
export const updateBulkOrderStatus = async (req, res) => {
  try {
    const { bulkOrderId } = req.params;
    const { status, quotedPrice, quotedBy, notes, expectedDelivery, trackingId } = req.body;

    const validStatuses = ['pending', 'under_review', 'quoted', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid bulk order status" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderIndex = user.bulkOrders.findIndex(order => order.bulkOrderId === bulkOrderId);
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Bulk order not found" });
    }

    const oldStatus = user.bulkOrders[orderIndex].status;

    // ✅ If bulk order is being cancelled or rejected, restore inventory
    if ((status === 'cancelled' || status === 'rejected') && 
        (oldStatus !== 'cancelled' && oldStatus !== 'rejected')) {
      console.log(`🔄 Bulk order ${bulkOrderId} ${status}, restoring inventory...`);
      
      for (const item of user.bulkOrders[orderIndex].items) {
        try {
          await restoreProductInventory(
            item.category.toLowerCase(),
            item.productId,
            item.quantity
          );
        } catch (error) {
          console.error(`Failed to restore inventory for ${item.productId}:`, error);
        }
      }
    }

    // Update bulk order fields
    if (status) user.bulkOrders[orderIndex].status = status;
    if (quotedPrice !== undefined) {
      user.bulkOrders[orderIndex].quotedPrice = quotedPrice;
      user.bulkOrders[orderIndex].quotedBy = quotedBy || 'System';
      user.bulkOrders[orderIndex].quotedAt = new Date();
    }
    if (notes !== undefined) user.bulkOrders[orderIndex].notes = notes;
    if (expectedDelivery) user.bulkOrders[orderIndex].expectedDelivery = new Date(expectedDelivery);
    if (trackingId) user.bulkOrders[orderIndex].trackingId = trackingId;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Bulk order updated successfully",
      bulkOrder: user.bulkOrders[orderIndex]
    });
  } catch (error) {
    console.error('Update bulk order status error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error updating bulk order status" 
    });
  }
};

export const cancelUserBulkOrder = async (req, res) => {
  try {
    const { bulkOrderId } = req.params;
    const { cancellationReason } = req.body; 

    if (!cancellationReason || !cancellationReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required"
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const bulkOrderIndex = user.bulkOrders.findIndex(order => order.bulkOrderId === bulkOrderId);
    if (bulkOrderIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Bulk order not found" 
      });
    }

    const bulkOrder = user.bulkOrders[bulkOrderIndex];

    if (bulkOrder.status === 'cancelled' || bulkOrder.status === 'delivered') {
      return res.status(400).json({ 
        success: false,
        message: "Bulk order cannot be cancelled" 
      });
    }

    // Restore product inventory
    for (const item of bulkOrder.items) {
      try {
        await restoreProductInventory(item.category.toLowerCase(), item.productId, item.quantity);
      } catch (err) {
        console.error(`Failed to restore inventory for ${item.productId}:`, err);
      }
    }

    // Update order status and reason
    user.bulkOrders[bulkOrderIndex].status = 'cancelled';
    user.bulkOrders[bulkOrderIndex].cancellationReason = cancellationReason; 
    user.bulkOrders[bulkOrderIndex].cancelledAt = new Date();

    await user.save();

    console.log(`🚫 Bulk order ${bulkOrderId} cancelled: ${cancellationReason}`);

    res.status(200).json({
      success: true,
      message: "Bulk order cancelled successfully",
      bulkOrder: user.bulkOrders[bulkOrderIndex]
    });
  } catch (error) {
    console.error('Cancel bulk order error:', error);
    res.status(500).json({
      success: false,
      message: "Error cancelling bulk order",
      error: error.message
    });
  }
};

// Update Bulk Order Company Information
export const updateBulkOrderCompanyInfo = async (req, res) => {
  try {
    const { bulkOrderId } = req.params;
    const { companyAddressId } = req.body;

    console.log('📦 Updating bulk order company info:', { bulkOrderId, companyAddressId });

    if (!companyAddressId) {
      return res.status(400).json({ 
        success: false,
        message: "Company address ID is required" 
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Find the bulk order
    const bulkOrderIndex = user.bulkOrders.findIndex(
      order => order.bulkOrderId === bulkOrderId
    );

    if (bulkOrderIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Bulk order not found" 
      });
    }

    const bulkOrder = user.bulkOrders[bulkOrderIndex];

    // Check if bulk order can be edited
    if (!['pending', 'under_review', 'quoted'].includes(bulkOrder.status)) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot update company information for bulk orders in this status" 
      });
    }

    // Convert to ObjectId
    let addressObjectId;
    try {
      addressObjectId = new mongoose.Types.ObjectId(companyAddressId);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid company address ID format"
      });
    }

    // Verify the company address exists in user's company addresses
    const addressExists = user.companyAddresses.some(
      addr => addr._id.toString() === addressObjectId.toString()
    );

    if (!addressExists) {
      return res.status(404).json({ 
        success: false,
        message: "Selected company address not found" 
      });
    }

    // Update company information
    user.bulkOrders[bulkOrderIndex].companyInfo.companyAddressId = addressObjectId;

    await user.save();

    console.log(`✅ Updated company info for bulk order ${bulkOrderId}`);

    res.status(200).json({
      success: true,
      message: "Company information updated successfully",
      bulkOrder: user.bulkOrders[bulkOrderIndex]
    });
  } catch (error) {
    console.error('❌ Update bulk order company info error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error updating company information",
      error: error.message 
    });
  }
};

// ================================
// USER ADDRESS MANAGEMENT
// ================================

// Add or Update Address
export const saveAddress = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ message: "Address data required" });

    const user = await User.findById(req.userId);
    if (!user || ["admin", "manager", "superadmin"].includes(user.role)) {
      return res.status(403).json({ message: "Address saving not allowed for admin users" });
    }

    // Ensure email is included in address (default to user's registered email)
    if (!address.email) {
      address.email = user.email;
    }

    // If isDefault, make others false
    if (address.isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    // Update or push new
    const existingIndex = user.addresses.findIndex(a => a._id?.toString() === address._id);
    if (existingIndex >= 0) {
      // Updating existing address
      user.addresses[existingIndex] = {
        ...address,
        _id: user.addresses[existingIndex]._id, // Preserve the original _id
      };
      console.log(`✅ Updated address ${address._id} (Temporary: ${address.isTemporary})`);
    } else {
      // Creating new address
      user.addresses.push(address);
      console.log(`✅ Created new address (Temporary: ${address.isTemporary})`);
    }

    await user.save();
    
    res.status(200).json({ 
      message: "Address saved successfully", 
      addresses: user.addresses 
    });
  } catch (error) {
    console.error("Save address error:", error);
    res.status(500).json({ 
      message: "Error saving address", 
      error: error.message 
    });
  }
};

// Get All Addresses
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || ["admin", "manager", "superadmin"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Filter out temporary addresses - only return permanent saved addresses
    const permanentAddresses = (user.addresses || []).filter(addr => !addr.isTemporary);
    
    console.log(`📍 Returning ${permanentAddresses.length} permanent addresses (${user.addresses.length} total)`);

    res.status(200).json({ addresses: permanentAddresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Error fetching addresses", error: error.message });
  }
};

// Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);
    if (!user || ["admin", "manager", "superadmin"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const beforeCount = user.addresses.length;
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    const afterCount = user.addresses.length;
    
    if (beforeCount === afterCount) {
      return res.status(404).json({ message: "Address not found" });
    }

    await user.save();

    console.log(`🗑️ Deleted address ${addressId}`);

    res.status(200).json({ 
      message: "Address deleted successfully", 
      addresses: user.addresses 
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Error deleting address", error: error.message });
  }
};

// Cleanup Temporary Addresses
export const cleanupTemporaryAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find temporary addresses older than 30 days that aren't used in any active orders
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all address IDs used in non-cancelled orders
    const usedAddressIds = new Set(
      user.orders
        .filter(order => order.status !== 'cancelled' && order.status !== 'delivered')
        .map(order => order.shippingInfo.addressId.toString())
    );

    const addressesBeforeCleanup = user.addresses.length;
    
    user.addresses = user.addresses.filter(addr => {
      // Keep if not temporary
      if (!addr.isTemporary) return true;
      
      // Keep if used in an active order
      if (usedAddressIds.has(addr._id.toString())) return true;
      
      // Keep if created less than 30 days ago
      if (addr.createdAt && addr.createdAt > thirtyDaysAgo) return true;
      
      // Remove old unused temporary addresses
      console.log(`🗑️ Removing old temporary address: ${addr._id}`);
      return false;
    });

    const removedCount = addressesBeforeCleanup - user.addresses.length;

    if (removedCount > 0) {
      await user.save();
    }

    console.log(`🧹 Cleaned up ${removedCount} temporary addresses`);

    res.status(200).json({
      success: true,
      message: `Cleaned up ${removedCount} temporary addresses`,
      addressesRemaining: user.addresses.length,
      permanentAddresses: user.addresses.filter(a => !a.isTemporary).length,
      temporaryAddresses: user.addresses.filter(a => a.isTemporary).length
    });
  } catch (error) {
    console.error('Cleanup temporary addresses error:', error);
    res.status(500).json({
      success: false,
      message: "Error cleaning up temporary addresses",
      error: error.message
    });
  }
};

// ================================
// COMPANY ADDRESS MANAGEMENT
// ================================

// Save Company Address
export const saveCompanyAddress = async (req, res) => {
  try {
    const { address } = req.body;
    
    console.log('📝 Saving company address:', address);
    
    if (!address) {
      return res.status(400).json({ 
        success: false,
        message: "Company address data required" 
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Validate required fields
    const requiredFields = ['companyName', 'contactPerson', 'email', 'phone', 'address', 'city', 'district', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!address[field]) {
        return res.status(400).json({ 
          success: false,
          message: `Missing required field: ${field}` 
        });
      }
    }

    // If isDefault, make others false
    if (address.isDefault) {
      user.companyAddresses.forEach(addr => (addr.isDefault = false));
    }

    // Update or push new
    const existingIndex = user.companyAddresses.findIndex(
      a => a._id?.toString() === address._id?.toString()
    );
    
    if (existingIndex >= 0) {
      // Updating existing address - preserve _id
      user.companyAddresses[existingIndex] = {
        ...user.companyAddresses[existingIndex].toObject(),
        label: address.label || "company",
        companyName: address.companyName,
        contactPerson: address.contactPerson,
        email: address.email,
        phone: address.phone,
        address: address.address,
        city: address.city,
        district: address.district,
        state: address.state,
        zipCode: address.zipCode,
        isDefault: address.isDefault || false,
        isTemporary: address.isTemporary || false,
      };
      console.log(`✅ Updated company address ${address._id} (Temporary: ${address.isTemporary})`);
    } else {
      // Creating new address - let MongoDB generate _id
      const newAddress = {
        label: address.label || "company",
        companyName: address.companyName,
        contactPerson: address.contactPerson,
        email: address.email,
        phone: address.phone,
        address: address.address,
        city: address.city,
        district: address.district,
        state: address.state,
        zipCode: address.zipCode,
        isDefault: address.isDefault || false,
        isTemporary: address.isTemporary || false,
      };
      user.companyAddresses.push(newAddress);
      console.log(`✅ Created new company address (Temporary: ${address.isTemporary})`);
    }

    await user.save();
    
    console.log(`✅ Company address saved. Total addresses: ${user.companyAddresses.length}`);
    
    res.status(200).json({ 
      success: true,
      message: "Company address saved successfully", 
      companyAddresses: user.companyAddresses 
    });
  } catch (error) {
    console.error("❌ Save company address error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      success: false,
      message: "Error saving company address", 
      error: error.message 
    });
  }
};

// Get All Company Addresses
export const getCompanyAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out temporary addresses - only return permanent saved addresses
    const permanentAddresses = (user.companyAddresses || []).filter(addr => !addr.isTemporary);
    
    console.log(`🔍 Returning ${permanentAddresses.length} permanent company addresses (${user.companyAddresses.length} total)`);

    res.status(200).json({ companyAddresses: permanentAddresses });
  } catch (error) {
    console.error("Get company addresses error:", error);
    res.status(500).json({ message: "Error fetching company addresses", error: error.message });
  }
};

// Delete Company Address
export const deleteCompanyAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const beforeCount = user.companyAddresses.length;
    user.companyAddresses = user.companyAddresses.filter(addr => addr._id.toString() !== addressId);
    const afterCount = user.companyAddresses.length;
    
    if (beforeCount === afterCount) {
      return res.status(404).json({ message: "Company address not found" });
    }

    await user.save();

    console.log(`🗑️ Deleted company address ${addressId}`);

    res.status(200).json({ 
      message: "Company address deleted successfully", 
      companyAddresses: user.companyAddresses 
    });
  } catch (error) {
    console.error("Delete company address error:", error);
    res.status(500).json({ message: "Error deleting company address", error: error.message });
  }
};
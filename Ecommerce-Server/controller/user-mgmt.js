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

// Sign In
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const favorites = await populateFavorites(user.favorites);
    const cart = await populateCart(user.cart);

    res.status(200).json({ 
      message: "Login successful", 
      token, 
      user: { 
        fullName: user.fullName, 
        email: user.email 
      },
      favorites,
      cart
    });
  } catch (err) {
    console.error('Sign in error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// // Get User Profile
// export const getUserProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).select('-password');
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const favorites = await populateFavorites(user.favorites);
//     const cart = await populateCart(user.cart);

//     res.status(200).json({
//       user: {
//         fullName: user.fullName,
//         email: user.email
//       },
//       favorites,
//       cart
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

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

// Helper function to calculate estimated delivery date
const calculateEstimatedDelivery = (shippingMethod = 'standard') => {
  const now = new Date();
  const deliveryDays = shippingMethod === 'express' ? 2 : 5; // 2 days for express, 5 for standard
  const estimatedDate = new Date(now.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
  return estimatedDate;
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

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!shippingInfo || !paymentMethod || !orderSummary) {
      return res.status(400).json({ message: "Missing required order information" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate and prepare order items
    const orderItems = [];
    for (const item of items) {
      if (!item['product-id'] || !item.quantity) {
        continue;
      }

      const productInfo = await findProductIdAndCategory(item);
      if (!productInfo) {
        return res.status(404).json({ 
          message: `Product not found: ${item['product-title'] || 'Unknown'}` 
        });
      }

      // Get actual product to verify availability and get current price
      const actualProduct = await getProductFromCollection(
        productInfo.category.toLowerCase(), 
        productInfo.productId
      );

      if (!actualProduct) {
        return res.status(404).json({ 
          message: `Product no longer available: ${item['product-title'] || 'Unknown'}` 
        });
      }

      // Check stock availability
      const availableStock = actualProduct?.inventory?.availableQuantity;
      if (availableStock != null && item.quantity > availableStock) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item['product-title']}. Available: ${availableStock}` 
        });
      }

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

    // Create the order
    const newOrder = {
      orderId,
      items: orderItems,
      shippingInfo: {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        district: shippingInfo.district,
        state: shippingInfo.state,
        pincode: shippingInfo.pincode,
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
      estimatedDelivery: calculateEstimatedDelivery(),
    };

    // Add order to user's orders array
    user.orders.push(newOrder);

    // Clear the user's cart after successful order
    user.cart = [];

    await user.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
      orderId: orderId
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error creating order", 
      error: error.message 
    });
  }
};

// Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('orders');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sort orders by creation date (newest first)
    const orders = user.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching orders" 
    });
  }
};

// Get Single Order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const order = user.orders.find(order => order.orderId === orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching order" 
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

// ================================
// BULK ORDER OPERATIONS
// ================================

// Create Bulk Order
export const createBulkOrder = async (req, res) => {
  try {
    const { 
      companyInfo, 
      items, 
      orderType, 
      specialRequirements, 
      orderSummary 
    } = req.body;

    // Validate required fields
    if (!companyInfo || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Company information and items are required" });
    }

    if (!orderSummary) {
      return res.status(400).json({ message: "Order summary is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate bulk order items
    const bulkOrderItems = [];
    for (const item of items) {
      if (!item.productId || !item.productName || !item.quantity || !item.unitPrice) {
        return res.status(400).json({ 
          message: `Invalid item data: ${item.productName || 'Unknown product'}` 
        });
      }

      if (item.quantity < 10) {
        return res.status(400).json({ 
          message: `Minimum quantity is 10 for ${item.productName}` 
        });
      }

      // Verify product exists in database
      // Handle both 'product-id' and 'productId' formats
      const productInfo = await findProductIdAndCategory({ 
        'product-id': item.productId || item['product-id'] 
      });
      if (!productInfo) {
        return res.status(404).json({ 
          message: `Product not found: ${item.productName}` 
        });
      }

      // Get actual product to verify availability
      const actualProduct = await getProductFromCollection(
        productInfo.category.toLowerCase(), 
        productInfo.productId
      );

      if (!actualProduct) {
        return res.status(404).json({ 
          message: `Product no longer available: ${item.productName}` 
        });
      }

      // Check stock availability if available
      const availableStock = actualProduct?.inventory?.availableQuantity;
      if (availableStock != null && item.quantity > availableStock) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.productName}. Available: ${availableStock}` 
        });
      }

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

    // Generate unique bulk order ID
    const bulkOrderId = generateBulkOrderId();

    // Create the bulk order
    const newBulkOrder = {
      bulkOrderId,
      companyInfo: {
        companyName: companyInfo.companyName,
        contactPerson: companyInfo.contactPerson,
        email: companyInfo.email,
        phone: companyInfo.phone,
        address: companyInfo.address,
        city: companyInfo.city,
        district: companyInfo.district,
        state: companyInfo.state,
        zipCode: companyInfo.zipCode,
      },
      items: bulkOrderItems,
      orderType: orderType || 'electrical',
      specialRequirements: specialRequirements || '',
      orderSummary: {
        subtotal: orderSummary.subtotal,
        tax: orderSummary.tax,
        total: orderSummary.total,
        roundedTotal: orderSummary.roundedTotal,
      },
      status: 'pending',
      priority: 'medium',
    };

    // Add bulk order to user's bulk orders array
    user.bulkOrders.push(newBulkOrder);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Bulk order submitted successfully",
      bulkOrder: newBulkOrder,
      bulkOrderId: bulkOrderId
    });

  } catch (error) {
    console.error('Create bulk order error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error creating bulk order", 
      error: error.message 
    });
  }
};

// Get User Bulk Orders
export const getUserBulkOrders = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('bulkOrders');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Sort bulk orders by creation date (newest first)
    const bulkOrders = user.bulkOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      bulkOrders
    });
  } catch (error) {
    console.error('Get user bulk orders error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching bulk orders" 
    });
  }
};

// Get Single Bulk Order by ID
export const getBulkOrderById = async (req, res) => {
  try {
    const { bulkOrderId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bulkOrder = user.bulkOrders.find(order => order.bulkOrderId === bulkOrderId);
    if (!bulkOrder) {
      return res.status(404).json({ message: "Bulk order not found" });
    }

    res.status(200).json({
      success: true,
      bulkOrder
    });
  } catch (error) {
    console.error('Get bulk order by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching bulk order" 
    });
  }
};

// Update Bulk Order Status (for admin use or status updates)
export const updateBulkOrderStatus = async (req, res) => {
  try {
    const { bulkOrderId } = req.params;
    const { status, quotedPrice, quotedBy, notes, expectedDelivery, trackingId, priority } = req.body;

    const validStatuses = ['pending', 'under_review', 'quoted', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid bulk order status" });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority level" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const orderIndex = user.bulkOrders.findIndex(order => order.bulkOrderId === bulkOrderId);
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Bulk order not found" });
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
    if (priority) user.bulkOrders[orderIndex].priority = priority;

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
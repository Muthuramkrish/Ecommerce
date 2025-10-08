import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { getProductModel } from "../models/products.js";

const JWT_SECRET = process.env.JWT_SECRET || "vikoshiya_india_electrical_&_electronics_ecommerce_service_site";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  console.log("🔐 Token verification requested for:", req.path);
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
  if (!token) {
    console.log("❌ No token provided for:", req.path);
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("❌ Invalid token for:", req.path);
    res.status(400).json({ message: "Invalid token." });
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
  
  // Handle the CSV import structure
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
    'image-url': imageUrl,
    'old-price': String(oldPrice),
    'new-price': String(newPrice),
    category: category,
    rating: dbProduct.rating || Math.floor(Math.random() * 2) + 4,
    reviews: dbProduct.reviews || Math.floor(Math.random() * 100) + 10,
    raw: dbProduct,
    _id: dbProduct._id
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

// Helper function to find product ID and category from frontend product data
const findProductIdAndCategory = async (frontendProduct) => {
  const productTitle = frontendProduct['product-title'];
  const collections = ['fans', 'switches', 'heaters', 'lightings', 'cables'];
  
  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      
      // First, let's check what's actually in the database
      const sampleDoc = await collection.findOne({});
      if (sampleDoc) {
        console.log(`📋 Sample document from ${collectionName}:`, Object.keys(sampleDoc));
      }
      
      // Try multiple search strategies based on CSV import structure
      let product = null;
      
      // Strategy 1: Search by characteristics.title (from CSV structure)
      product = await collection.findOne({ 'characteristics.title': productTitle });
      
      // Strategy 2: Direct product-title field (if processed)
      if (!product) {
        product = await collection.findOne({ 'product-title': productTitle });
      }
      
      // Strategy 3: Case-insensitive search on characteristics.title
      if (!product) {
        product = await collection.findOne({ 
          'characteristics.title': { $regex: new RegExp(`^${productTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      }
      
      if (product) {
        return {
          productId: product._id,
          category: collectionName.charAt(0).toUpperCase() + collectionName.slice(1) // "fans" -> "Fans"
        };
      }
    } catch (error) {
      console.error(`Error searching in ${collectionName}:`, error);
    }
  }
  
  return null;
};

// Sign Up
export const signUp = async (req, res) => {
  try {
    console.log("📝 Signup request received:", req.body);
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("❌ MongoDB not connected, readyState:", mongoose.connection.readyState);
      return res.status(503).json({ 
        message: "Database connection unavailable. Please ensure MongoDB is running.",
        details: "MongoDB connection state: " + mongoose.connection.readyState
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
    console.log("✅ User created successfully:", email);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Signup error:", err);
    
    // Provide specific error messages for common issues
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
      error: err.message,
      mongoState: mongoose.connection.readyState
    });
  }
};

// Sign In
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log(token, "token");

    // Populate favorites and cart with actual product data
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
    console.error('Error during sign in:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get User Profile with Favorites and Cart
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favorites = await populateFavorites(user.favorites);
    const cart = await populateCart(user.cart);

    res.status(200).json({
      user: {
        fullName: user.fullName,
        email: user.email
      },
      favorites,
      cart
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get User Data (profile, cart, and favorites) - alias for getUserProfile
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


// ===========================
// Add to Favorites (by productId)
// ===========================
export const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.body; // ✅ Expecting productId from frontend

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the product exists in your Product model
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if product is already in favorites
    const alreadyExists = user.favorites.some(
      fav => fav.productId.toString() === productId
    );

    if (alreadyExists) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    // Add to favorites
    user.favorites.push({
      category: product.category,
      productId: product._id,
    });

    await user.save();

    // Optionally populate favorites
    const favorites = await populateFavorites(user.favorites);

    res.status(200).json({
      message: "Product added to favorites",
      favorites,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===========================
// Remove from Favorites (by productId)
// ===========================
export const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params; // ✅ productId now from URL params

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if product exists in user favorites
    const exists = user.favorites.some(
      fav => fav.productId.toString() === productId
    );

    if (!exists) {
      return res.status(404).json({ message: "Product not found in favorites" });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(
      fav => fav.productId.toString() !== productId
    );

    await user.save();

    const favorites = await populateFavorites(user.favorites);

    res.status(200).json({
      message: "Product removed from favorites",
      favorites,
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

// =======================
// Add to Cart (by productId)
export const addToCart = async (req, res) => {
  try {
    const { productId, category, quantity = 1 } = req.body;

    if (!productId || !category) {
      return res.status(400).json({ message: "Product ID and category are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get correct model for collection
    const ProductModel = getProductModel(category);
    const product = await ProductModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found in database" });

    // Check if product is already in cart
    const existingIndex = user.cart.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingIndex !== -1) {
      user.cart[existingIndex].quantity = Math.max(
        1,
        user.cart[existingIndex].quantity + quantity
      );
    } else {
      user.cart.push({
        category: category,
        productId: product._id,
        quantity: Math.max(1, quantity),
      });
    }

    await user.save();

    const cart = await populateCart(user.cart);

    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =======================
// Update Cart Item Quantity (by productId)
// =======================
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

    const itemIndex = user.cart.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    const cart = await populateCart(user.cart);

    res.status(200).json({
      message: "Cart quantity updated",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =======================
// Remove from Cart (by productId)
// =======================
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = user.cart.some(
      item => item.productId.toString() === productId
    );

    if (!existing) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Remove product
    user.cart = user.cart.filter(
      item => item.productId.toString() !== productId
    );

    await user.save();

    const cart = await populateCart(user.cart);

    res.status(200).json({
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
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

// Clear Cart (useful after checkout)
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

// Sync Cart from Frontend (for migrating localStorage cart to database)
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

    // Convert and merge cart items
    const newCartItems = [];
    
    for (const item of cartItems) {
      if (!item['product-title']) continue;
      
      const productInfo = await findProductIdAndCategory(item);
      if (!productInfo) continue;
      
      // Check if item already exists in current cart
      const existingIndex = user.cart.findIndex(
        cartItem => cartItem.productId.toString() === productInfo.productId.toString()
      );
      
      if (existingIndex !== -1) {
        // Merge quantities
        user.cart[existingIndex].quantity = Math.max(1, user.cart[existingIndex].quantity + (item.quantity || 1));
      } else {
        newCartItems.push({
          category: productInfo.category,
          productId: productInfo.productId,
          quantity: Math.max(1, item.quantity || 1)
        });
      }
    }
    
    // Add new items to cart
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
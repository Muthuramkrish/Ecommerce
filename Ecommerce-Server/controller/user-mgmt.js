import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "vikoshiya_india_electrical_&_electronics_ecommerce_service_site";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
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

// Helper function to get product from appropriate collection
const getProductFromCollection = async (category, productId) => {
  try {
    // Convert category back to collection name (e.g., "Fans" -> "fans")
    const collectionName = category.toLowerCase();
    
    const collection = mongoose.connection.db.collection(collectionName);
    const product = await collection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
    
    return product;
  } catch (error) {
    console.error(`❌ Error fetching product from ${category}:`, error);
    return null;
  }
};

// Helper function to convert database product to frontend format
const convertDbProductToFrontend = (dbProduct, category) => {
  if (!dbProduct) return null;
  
  // Handle different possible data structures from imported CSV
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
    rating: dbProduct.rating || 4,
    reviews: dbProduct.reviews || 0,
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
  const collections = ['fans', 'switches', 'heaters', 'lightings', 'cables']; // Exact collection names
  
  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      
      // Try multiple search strategies
      let product = null;
      
      // Strategy 1: Exact match on product-title
      product = await collection.findOne({ 'product-title': productTitle });
      
      // Strategy 2: Search in characteristics.title if not found
      if (!product) {
        product = await collection.findOne({ 'characteristics.title': productTitle });
      }
      
      // Strategy 3: Search in nested product title fields
      if (!product) {
        product = await collection.findOne({ 'title': productTitle });
      }
      
      if (product) {
        const category = collectionName.charAt(0).toUpperCase() + collectionName.slice(1); // Convert "fans" to "Fans"
        return {
          productId: product._id,
          category: category
        };
      }
    } catch (error) {
      console.error(`❌ Error searching in ${collectionName}:`, error);
    }
  }
  
  return null;
};

// Sign Up
export const signUp = async (req, res) => {
  try {
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
    res.status(500).json({ message: "Server error", error: err.message });
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

// Add to Favorites
export const addToFavorites = async (req, res) => {
  try {
    const { product } = req.body;
    
    if (!product || !product['product-title']) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the product ID and category
    const productInfo = await findProductIdAndCategory(product);
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found in database" });
    }

    // Check if product is already in favorites
    const existingIndex = user.favorites.findIndex(
      fav => fav.productId.toString() === productInfo.productId.toString()
    );

    if (existingIndex !== -1) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    // Add to favorites
    user.favorites.push({
      category: productInfo.category,
      productId: productInfo.productId,
      addedAt: new Date()
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
    const { productTitle } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the product to get its ID
    const productInfo = await findProductIdAndCategory({ 'product-title': productTitle });
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove from favorites
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
    
    if (!product || !product['product-title']) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the product ID and category
    const productInfo = await findProductIdAndCategory(product);
    if (!productInfo) {
      return res.status(404).json({ 
        message: "Product not found in database",
        productTitle: product['product-title'],
        availableCollections: ['fans', 'switches', 'heaters', 'lightings', 'cables']
      });
    }

    // Check if product is already in cart
    const existingIndex = user.cart.findIndex(
      item => item.productId.toString() === productInfo.productId.toString()
    );

    if (existingIndex !== -1) {
      // Update quantity if product already exists
      user.cart[existingIndex].quantity = Math.max(1, user.cart[existingIndex].quantity + quantity);
    } else {
      // Add new item to cart
      user.cart.push({
        category: productInfo.category,
        productId: productInfo.productId,
        quantity: Math.max(1, quantity)
      });
    }

    await user.save();

    const cart = await populateCart(user.cart);
    res.status(200).json({ 
      message: "Product added to cart", 
      cart 
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Cart Item Quantity
export const updateCartQuantity = async (req, res) => {
  try {
    const { productTitle } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the product to get its ID
    const productInfo = await findProductIdAndCategory({ 'product-title': productTitle });
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found" });
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
    const { productTitle } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the product to get its ID
    const productInfo = await findProductIdAndCategory({ 'product-title': productTitle });
    if (!productInfo) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove from cart
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
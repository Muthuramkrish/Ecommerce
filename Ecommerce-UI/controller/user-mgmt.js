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

// Helper function to find product ID and category - DYNAMICALLY from database
const findProductIdAndCategory = async (frontendProduct) => {
  const productId = frontendProduct['product-id'];
  
  // Get all collections dynamically from database
  const collections = await getAllCollections();
  
  for (const collectionName of collections) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      const product = await collection.findOne({ _id: new mongoose.Types.ObjectId(productId) });
      
      if (product) {
        return {
          productId: product._id,
          category: collectionName.charAt(0).toUpperCase() + collectionName.slice(1)
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

    const existingIndex = user.cart.findIndex(
      item => item.productId.toString() === productInfo.productId.toString()
    );

    if (existingIndex !== -1) {
      user.cart[existingIndex].quantity = Math.max(1, user.cart[existingIndex].quantity + quantity);
    } else {
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
      
      if (existingIndex !== -1) {
        user.cart[existingIndex].quantity = Math.max(1, user.cart[existingIndex].quantity + (item.quantity || 1));
      } else {
        newCartItems.push({
          category: productInfo.category,
          productId: productInfo.productId,
          quantity: Math.max(1, item.quantity || 1)
        });
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
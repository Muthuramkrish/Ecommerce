import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

// Helper function to convert frontend product format to database format
const convertProductToDb = (product) => ({
  productTitle: product['product-title'],
  imageUrl: product['image-url'],
  oldPrice: product['old-price'],
  newPrice: product['new-price'],
  category: product.category,
  rating: product.rating,
  reviews: product.reviews,
  raw: product.raw
});

// Helper function to convert database format to frontend format
const convertProductFromDb = (dbProduct) => ({
  'product-title': dbProduct.productTitle,
  'image-url': dbProduct.imageUrl,
  'old-price': dbProduct.oldPrice,
  'new-price': dbProduct.newPrice,
  category: dbProduct.category,
  rating: dbProduct.rating,
  reviews: dbProduct.reviews,
  raw: dbProduct.raw,
  quantity: dbProduct.quantity // Only for cart items
});

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

    // Convert favorites and cart to frontend format
    const favorites = user.favorites.map(convertProductFromDb);
    const cart = user.cart.map(convertProductFromDb);

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

    const favorites = user.favorites.map(convertProductFromDb);
    const cart = user.cart.map(convertProductFromDb);

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

    // Check if product is already in favorites
    const existingIndex = user.favorites.findIndex(
      fav => fav.productTitle === product['product-title']
    );

    if (existingIndex !== -1) {
      return res.status(400).json({ message: "Product already in favorites" });
    }

    // Add to favorites
    const dbProduct = convertProductToDb(product);
    user.favorites.push(dbProduct);
    await user.save();

    const favorites = user.favorites.map(convertProductFromDb);
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

    // Remove from favorites
    user.favorites = user.favorites.filter(
      fav => fav.productTitle !== productTitle
    );
    await user.save();

    const favorites = user.favorites.map(convertProductFromDb);
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

    const favorites = user.favorites.map(convertProductFromDb);
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

    // Check if product is already in cart
    const existingIndex = user.cart.findIndex(
      item => item.productTitle === product['product-title']
    );

    if (existingIndex !== -1) {
      // Update quantity if product already exists
      user.cart[existingIndex].quantity = Math.max(1, user.cart[existingIndex].quantity + quantity);
    } else {
      // Add new item to cart
      const dbProduct = convertProductToDb(product);
      dbProduct.quantity = Math.max(1, quantity);
      user.cart.push(dbProduct);
    }

    await user.save();

    const cart = user.cart.map(convertProductFromDb);
    res.status(200).json({ 
      message: "Product added to cart", 
      cart 
    });
  } catch (error) {
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

    const itemIndex = user.cart.findIndex(
      item => item.productTitle === productTitle
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    const cart = user.cart.map(convertProductFromDb);
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

    // Remove from cart
    user.cart = user.cart.filter(
      item => item.productTitle !== productTitle
    );
    await user.save();

    const cart = user.cart.map(convertProductFromDb);
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

    const cart = user.cart.map(convertProductFromDb);
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
    const newCart = [];
    
    for (const item of cartItems) {
      if (!item['product-title']) continue;
      
      const dbProduct = convertProductToDb(item);
      dbProduct.quantity = Math.max(1, item.quantity || 1);
      
      // Check if item already exists in current cart
      const existingIndex = user.cart.findIndex(
        cartItem => cartItem.productTitle === dbProduct.productTitle
      );
      
      if (existingIndex !== -1) {
        // Merge quantities
        user.cart[existingIndex].quantity = Math.max(1, user.cart[existingIndex].quantity + dbProduct.quantity);
      } else {
        newCart.push(dbProduct);
      }
    }
    
    // Add new items to cart
    user.cart.push(...newCart);
    await user.save();

    const cart = user.cart.map(convertProductFromDb);
    res.status(200).json({ 
      message: "Cart synced successfully", 
      cart 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
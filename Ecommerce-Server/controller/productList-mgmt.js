import mongoose from "mongoose";
import { getProductModel } from "../models/products.js";

// @desc   Get all products from all collections or specific collection
// @route  GET /api/productList?collection=your-collection&all=true
// @access Public (with optional auth for personalized data)
export const getAllProducts = async (req, res) => {
  try {
    const { collection, all, page = 1, limit = 20, search, category, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { 'identifiers.name': { $regex: search, $options: 'i' } },
        { 'identifiers.description': { $regex: search, $options: 'i' } },
        { 'marketing.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Add category filter
    if (category) {
      filter['anchor.category'] = { $regex: category, $options: 'i' };
    }
    
    // Add price range filter
    if (minPrice || maxPrice) {
      filter['pricing.basePrice'] = {};
      if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }
    
    // Only show active products
    filter['marketing.isActive'] = true;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    if (all === 'true') {
      // Get all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections
        .map(col => col.name)
        .filter(name => !name.startsWith('system.') && name !== 'users'); // Exclude system collections and users

      let allProducts = [];
      let totalCount = 0;
      
      // Fetch products from each collection
      for (const collectionName of collectionNames) {
        try {
          const Product = getProductModel(collectionName);
          
          // Get total count for pagination
          const collectionCount = await Product.countDocuments(filter);
          totalCount += collectionCount;
          
          // Get products with pagination
          const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));
          
          // Add collection name to each product for identification
          const productsWithCollection = products.map(product => ({
            ...product.toObject(),
            collection: collectionName
          }));
          
          allProducts = allProducts.concat(productsWithCollection);
        } catch (error) {
          console.warn(`Failed to fetch from collection ${collectionName}:`, error.message);
          // Continue with other collections even if one fails
        }
      }

      // Sort all products again since we combined from multiple collections
      allProducts.sort((a, b) => {
        const aValue = a[sortBy] || a.createdAt;
        const bValue = b[sortBy] || b.createdAt;
        return sortOrder === 'desc' ? 
          new Date(bValue) - new Date(aValue) : 
          new Date(aValue) - new Date(bValue);
      });

      res.status(200).json({
        success: true,
        count: allProducts.length,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        data: allProducts,
        collections: collectionNames,
        filters: {
          search,
          category,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder
        }
      });
    } else {
      // Get products from specific collection (original behavior)
      const targetCollection = collection || "switches"; // default to "switches"
      const Product = getProductModel(targetCollection);

      // Get total count for pagination
      const totalCount = await Product.countDocuments(filter);
      
      // Get products with pagination
      const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        count: products.length,
        totalCount,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        data: products,
        collection: targetCollection,
        filters: {
          search,
          category,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder
        }
      });
    }
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching products",
      error: error.message 
    });
  }
};

// @desc   Get single product by ID
// @route  GET /api/productList/:collection/:productId
// @access Public
export const getProductById = async (req, res) => {
  try {
    const { collection, productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }
    
    const Product = getProductModel(collection);
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    // Check if product is active
    if (!product.marketing?.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product is not available"
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        collection
      }
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
};

// @desc   Get featured products
// @route  GET /api/productList/featured
// @access Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections
      .map(col => col.name)
      .filter(name => !name.startsWith('system.') && name !== 'users');

    let featuredProducts = [];
    
    // Fetch featured products from each collection
    for (const collectionName of collectionNames) {
      try {
        const Product = getProductModel(collectionName);
        const products = await Product.find({
          'marketing.isFeatured': true,
          'marketing.isActive': true
        })
        .sort({ 'marketing.featuredOrder': 1, createdAt: -1 })
        .limit(parseInt(limit));
        
        const productsWithCollection = products.map(product => ({
          ...product.toObject(),
          collection: collectionName
        }));
        
        featuredProducts = featuredProducts.concat(productsWithCollection);
      } catch (error) {
        console.warn(`Failed to fetch featured products from ${collectionName}:`, error.message);
      }
    }
    
    // Sort by featured order and limit results
    featuredProducts.sort((a, b) => {
      const aOrder = a.marketing?.featuredOrder || 999;
      const bOrder = b.marketing?.featuredOrder || 999;
      return aOrder - bOrder;
    });
    
    featuredProducts = featuredProducts.slice(0, parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: featuredProducts.length,
      data: featuredProducts
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message
    });
  }
};

// @desc   Get product categories
// @route  GET /api/productList/categories
// @access Public
export const getCategories = async (req, res) => {
  try {
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections
      .map(col => col.name)
      .filter(name => !name.startsWith('system.') && name !== 'users');

    const categories = new Set();
    const subcategories = new Set();
    const brands = new Set();
    
    // Fetch categories from each collection
    for (const collectionName of collectionNames) {
      try {
        const Product = getProductModel(collectionName);
        const products = await Product.find(
          { 'marketing.isActive': true },
          { 'anchor.category': 1, 'anchor.subcategory': 1, 'anchor.brand': 1 }
        );
        
        products.forEach(product => {
          if (product.anchor?.category) categories.add(product.anchor.category);
          if (product.anchor?.subcategory) subcategories.add(product.anchor.subcategory);
          if (product.anchor?.brand) brands.add(product.anchor.brand);
        });
      } catch (error) {
        console.warn(`Failed to fetch categories from ${collectionName}:`, error.message);
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        categories: Array.from(categories).sort(),
        subcategories: Array.from(subcategories).sort(),
        brands: Array.from(brands).sort(),
        collections: collectionNames
      }
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message
    });
  }
};

// @desc   Search products
// @route  GET /api/productList/search?q=searchterm
// @access Public
export const searchProducts = async (req, res) => {
  try {
    const { q, collection, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long"
      });
    }
    
    const searchRegex = new RegExp(q.trim(), 'i');
    const filter = {
      $or: [
        { 'identifiers.name': searchRegex },
        { 'identifiers.description': searchRegex },
        { 'identifiers.sku': searchRegex },
        { 'marketing.tags': { $in: [searchRegex] } },
        { 'anchor.category': searchRegex },
        { 'anchor.subcategory': searchRegex },
        { 'anchor.brand': searchRegex }
      ],
      'marketing.isActive': true
    };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let results = [];
    let totalCount = 0;
    
    if (collection) {
      // Search in specific collection
      const Product = getProductModel(collection);
      totalCount = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .sort({ 'marketing.isFeatured': -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      results = products.map(product => ({
        ...product.toObject(),
        collection
      }));
    } else {
      // Search in all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections
        .map(col => col.name)
        .filter(name => !name.startsWith('system.') && name !== 'users');
      
      for (const collectionName of collectionNames) {
        try {
          const Product = getProductModel(collectionName);
          const collectionCount = await Product.countDocuments(filter);
          totalCount += collectionCount;
          
          const products = await Product.find(filter)
            .sort({ 'marketing.isFeatured': -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
          
          const productsWithCollection = products.map(product => ({
            ...product.toObject(),
            collection: collectionName
          }));
          
          results = results.concat(productsWithCollection);
        } catch (error) {
          console.warn(`Failed to search in collection ${collectionName}:`, error.message);
        }
      }
      
      // Sort results by relevance (featured first, then by creation date)
      results.sort((a, b) => {
        if (a.marketing?.isFeatured && !b.marketing?.isFeatured) return -1;
        if (!a.marketing?.isFeatured && b.marketing?.isFeatured) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    
    res.status(200).json({
      success: true,
      count: results.length,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      data: results,
      searchQuery: q
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message
    });
  }
};


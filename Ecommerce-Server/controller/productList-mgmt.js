import mongoose from "mongoose";
import { getProductModel } from "../models/products.js";


// @desc   Get all products from all collections or specific collection
// @route  GET /api/productList?collection=your-collection&all=true
export const getAllProducts = async (req, res) => {
  try {
    const { collection, all } = req.query;
    
    if (all === 'true') {
      // Get all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections
        .map(col => col.name)
        .filter(name => !name.startsWith('system.')); // Exclude system collections

      let allProducts = [];
      
      // Fetch products from each collection
      for (const collectionName of collectionNames) {
        try {
          const Product = getProductModel(collectionName);
          const products = await Product.find();
          
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

      res.status(200).json({
        success: true,
        count: allProducts.length,
        data: allProducts,
        collections: collectionNames
      });
    } else {
      // Get products from specific collection (original behavior)
      const targetCollection = collection || "switches"; // default to "switches"
      const Product = getProductModel(targetCollection);

      const products = await Product.find();

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
        collection: targetCollection
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


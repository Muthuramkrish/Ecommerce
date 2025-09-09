import mongoose from "mongoose";
import { getProductModel } from "../models/products.js";

// @desc   Get product by ID
// @route  GET /api/productList/:id?collection=your-collection
export const getProductById = async (req, res) => {
  try {
    const collection = req.query.collection || "switches";
    const Product = getProductModel(collection);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
import mongoose from "mongoose";
import { getProductModel } from "../models/products.js";

// @desc   Get all products
// @route  GET /api/productList?collection=your-collection
export const getAllProducts = async (req, res) => {
  try {
    const collection = req.query.collection || "switches"; // default to "products"
    const Product = getProductModel(collection);

    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


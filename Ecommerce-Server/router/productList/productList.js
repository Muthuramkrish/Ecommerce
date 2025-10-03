import express from "express";
import { 
  getAllProducts, 
  getProductById, 
  getFeaturedProducts, 
  getCategories, 
  searchProducts 
} from "../../controller/productList-mgmt.js";
import { optionalAuth } from "../../middleware/auth.js";

const router = express.Router();

// Public routes with optional authentication for personalized data
router.get("/", optionalAuth, getAllProducts);
router.get("/featured", optionalAuth, getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/search", optionalAuth, searchProducts);
router.get("/:collection/:productId", optionalAuth, getProductById);

export default router;
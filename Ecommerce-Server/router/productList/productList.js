import express from "express";
import { 
  getAllProducts, 
  getProductById, 
  getFeaturedProducts, 
  getCategories, 
  searchProducts 
} from "../../controller/productList-mgmt.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/categories", getCategories);
router.get("/search", searchProducts);
router.get("/:collection/:productId", getProductById);

export default router;
import express from "express";
import {
  getProductById,
} from "../../controller/productDetails-mgmt.js";

const router = express.Router();


// Get product by ID (optional query: ?collection=switches)
router.get("/:id", getProductById);

export default router;
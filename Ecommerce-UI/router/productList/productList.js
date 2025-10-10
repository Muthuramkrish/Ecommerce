import express from "express";
import {
  getAllProducts,
} from "../../controller/productList-mgmt.js";

const router = express.Router();

// List all products (optional query: ?collection=switches&all=true)
router.get("/", getAllProducts);

export default router;
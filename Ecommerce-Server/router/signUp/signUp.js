import express from "express";
import { signUp } from "../../controller/user-mgmt.js";  

const router = express.Router();

router.post("/", signUp);

export default router;
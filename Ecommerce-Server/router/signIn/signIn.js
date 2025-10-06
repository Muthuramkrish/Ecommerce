import express from "express";
import { signIn } from "../../controller/user-mgmt.js";  

const router = express.Router();

router.post("/", signIn);

export default router;
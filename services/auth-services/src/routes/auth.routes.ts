import { Router } from "express";
import { signin, signup, adminSignup } from "../controllers/auth.controller.js";

const router = Router();

// Normal user signup
router.post("/signup", signup);

// Admin signup (creates user with role: "admin")
router.post("/admin/signup", adminSignup);

// Login (both user and admin use this)
router.post("/signin", signin);

export default router;

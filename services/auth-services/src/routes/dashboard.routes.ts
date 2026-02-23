// src/routes/dashboard.routes.ts
import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { getAdminDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", requireAuth, getAdminDashboard);

export default router;
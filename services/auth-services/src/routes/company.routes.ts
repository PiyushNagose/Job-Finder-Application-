import { Router } from "express";
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getCompanies);

router.post("/", requireAuth, requireAdmin, createCompany);
router.put("/:id", requireAuth, requireAdmin, updateCompany);
router.delete("/:id", requireAuth, requireAdmin, deleteCompany);

export default router;

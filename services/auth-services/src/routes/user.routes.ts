import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUserStatus,
  deleteUser,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, getUsers);
router.post("/", requireAuth, requireAdmin, createUser);
router.patch("/:id/status", requireAuth, requireAdmin, updateUserStatus);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

export default router;

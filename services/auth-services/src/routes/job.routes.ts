import { Router } from "express";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.get("/", getJobs);

router.post("/", requireAuth, requireAdmin, createJob);
router.put("/:id", requireAuth, requireAdmin, updateJob);
router.delete("/:id", requireAuth, requireAdmin, deleteJob);

export default router;


import type { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";

export async function getAdminDashboard(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const [users, companies, jobs, activeJobs, recentJobs] = await Promise.all([
      User.countDocuments({}),
      Company.countDocuments({}),
      Job.countDocuments({}),

      Job.countDocuments({ status: "active" }),

      Job.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select("title company location status createdAt")
        .populate("company", "name"),
    ]);

    return res.json({
      stats: { users, companies, jobs, activeJobs },
      recentJobs,
    });
  } catch (err) {
    return next(err);
  }
}

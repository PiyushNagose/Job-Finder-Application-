import type { Request, Response } from "express";
import { Job } from "../models/job.model.js";

export async function getJobs(_req: Request, res: Response) {
  const jobs = await Job.find().populate("company").sort({ createdAt: -1 });

  res.json(jobs);
}

export async function createJob(req: Request, res: Response) {
  const job = await Job.create(req.body);
  res.status(201).json(job);
}

export async function updateJob(req: Request, res: Response) {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(job);
}

export async function deleteJob(req: Request, res: Response) {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}

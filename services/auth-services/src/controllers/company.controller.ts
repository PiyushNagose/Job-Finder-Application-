import type { Request, Response } from "express";
import { Company } from "../models/company.model.js";

export async function getCompanies(_req: Request, res: Response) {
  const companies = await Company.aggregate([
    {
      $lookup: {
        from: "jobs",
        localField: "_id",
        foreignField: "company",
        as: "jobs",
      },
    },
    {
      $addFields: {
        jobsCount: { $size: "$jobs" },
      },
    },
    { $project: { jobs: 0 } },
    { $sort: { createdAt: -1 } },
  ]);

  res.json(companies);
}
export async function createCompany(req: Request, res: Response) {
  const company = await Company.create(req.body);
  res.status(201).json(company);
}

export async function updateCompany(req: Request, res: Response) {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(company);
}

export async function deleteCompany(req: Request, res: Response) {
  await Company.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}

import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    industry: { type: String },
    city: { type: String },
    description: { type: String },
    logoUrl: { type: String },
  },
  { timestamps: true },
);

export const Company = mongoose.model("Company", companySchema);

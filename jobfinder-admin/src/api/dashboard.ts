import { http } from "./http";

export type DashboardStats = {
  users: number;
  companies: number;
  jobs: number;
  activeJobs: number;
};

export type DashboardCompany = {
  _id: string;
  name: string;
};

export type DashboardJob = {
  _id: string;
  title: string;

  company?: string | DashboardCompany;

  location?: string;

  status?: "active" | "paused";

  createdAt?: string;
};

export async function getDashboard() {
  const res = await http.get<{
    stats: DashboardStats;
    recentJobs: DashboardJob[];
  }>("/dashboard");
  return res.data;
}

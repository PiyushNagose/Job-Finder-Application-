import { http } from "./http";

export type Job = {
  _id: string;
  title: string;
  companyId?: string;
  companyName?: string;
  location?: string;
  salary?: string;
  type?: string; // Full-time, Intern, etc
  status?: "Active" | "Paused" | "Closed";
  createdAt?: string;
};

export type CreateJobInput = {
  title: string;
  companyId: string;
  location?: string;
  salary?: string;
  type?: string;
  status?: "Active" | "Paused" | "Closed";
};

export async function getJobs(q?: string) {
  const res = await http.get<{ items: Job[] }>("/jobs", {
    params: q ? { q } : undefined,
  });
  return res.data.items;
}

export async function createJob(input: CreateJobInput) {
  const res = await http.post<Job>("/jobs", input);
  return res.data;
}

export async function updateJob(id: string, patch: Partial<CreateJobInput>) {
  const res = await http.patch<Job>(`/jobs/${id}`, patch);
  return res.data;
}

export async function deleteJob(id: string) {
  await http.delete(`/jobs/${id}`);
}

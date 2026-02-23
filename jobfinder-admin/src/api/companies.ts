import { http } from "./http";

export type Company = {
  _id: string;
  name: string;
  industry?: string;
  city?: string;
  website?: string;
  logo?: string;
  description?: string;
  status?: "Active" | "Inactive";
  createdAt?: string;
};

export type CreateCompanyInput = {
  name: string;
  industry?: string;
  city?: string;
  website?: string;
  logo?: string;
  description?: string;
  status?: "Active" | "Inactive";
};

// ✅ GET companies
export async function getCompanies(q?: string) {
  const res = await http.get<{ items: Company[] }>("/companies", {
    params: q ? { q } : undefined,
  });
  return res.data.items;
}

// ✅ CREATE company
export async function createCompany(input: CreateCompanyInput) {
  const res = await http.post<Company>("/companies", input);
  return res.data;
}

// ✅ UPDATE company
export async function updateCompany(
  id: string,
  patch: Partial<CreateCompanyInput>,
) {
  const res = await http.patch<Company>(`/companies/${id}`, patch);
  return res.data;
}

// ✅ DELETE company
export async function deleteCompany(id: string) {
  await http.delete(`/companies/${id}`);
}

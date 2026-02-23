import { http } from "./http";

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: any;
  message?: string;
};

export type NormalizedAuth = {
  token: string;
  user: any;
};

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

function extractToken(data: AuthResponse) {
  return data.token || data.accessToken;
}

export function saveAdminSession(token: string, user: any) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function assertAdmin(user: any) {
  const role = user?.role;
  const isAdmin = user?.isAdmin;

  if (role === "admin" || isAdmin === true) return;

  const err: any = new Error("Access denied: Admin only");
  err.status = 403;
  throw err;
}

// ✅ ADMIN SIGN IN
export async function adminSignin(
  email: string,
  password: string,
): Promise<NormalizedAuth> {
  const res = await http.post<AuthResponse>("/signin", {
    email,
    password,
  });
  const token = extractToken(res.data);
  if (!token) throw new Error("Token not found in signin response");

  const user = res.data.user ?? null;
  assertAdmin(user);
  saveAdminSession(token, user);

  return { token, user };
}

// ✅ ADMIN SIGN UP
export async function adminSignup(
  name: string,
  email: string,
  password: string,
): Promise<NormalizedAuth> {
  const res = await http.post<AuthResponse>("/admin/signup", {
    name,
    email,
    password,
  });
  const token = extractToken(res.data);
  if (!token) throw new Error("Token not found in signup response");

  const user = res.data.user ?? null;
  assertAdmin(user);
  saveAdminSession(token, user);

  return { token, user };
}

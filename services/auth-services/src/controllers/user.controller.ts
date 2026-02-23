import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";

// ✅ GET /users  (admin panel list)
export async function getUsers(req: Request, res: Response) {
  const q = String(req.query.q ?? "").trim();

  const filter: any = {};
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { role: { $regex: q, $options: "i" } },
    ];
  }

  const users = await User.find(filter)
    .select("_id name email role blocked createdAt")
    .sort({ createdAt: -1 });

  res.json(users);
}

// ✅ POST /users  (admin creates user)
export async function createUser(req: Request, res: Response) {
  const { name, email, password, role } = req.body ?? {};

  if (!name?.trim())
    return res.status(400).json({ message: "Name is required" });
  if (!email?.trim())
    return res.status(400).json({ message: "Email is required" });
  if (!password || String(password).length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const exists = await User.findOne({ email: String(email).trim() });
  if (exists)
    return res.status(409).json({ message: "Email already registered" });

  const passwordHash = await bcrypt.hash(String(password), 10);

  const user = await User.create({
    name: String(name).trim(),
    email: String(email).trim(),
    passwordHash,
    role: role === "admin" ? "admin" : "user",
    blocked: false,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    blocked: (user as any).blocked ?? false,
    createdAt: user.createdAt,
  });
}

// ✅ PATCH /users/:id/status  (block/unblock)
export async function updateUserStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { blocked } = req.body ?? {};

  if (typeof blocked !== "boolean") {
    return res.status(400).json({ message: "blocked must be boolean" });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { blocked },
    { new: true },
  ).select("_id name email role blocked createdAt");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
}

// ✅ DELETE /users/:id
export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "User not found" });

  res.json({ message: "Deleted" });
}

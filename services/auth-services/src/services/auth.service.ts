import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";
import { signAccessToken } from "../utils/jwt.js";

export async function signupUser(input: {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}) {
  const exists = await User.findOne({ email: input.email });
  if (exists) {
    const err = new Error("Email already registered");
    (err as any).status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role ?? "user",
  });

  const token = signAccessToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function signinUser(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    const err = new Error("Invalid email or password");
    (err as any).status = 401;
    throw err;
  }

  if ((user as any).blocked === true) {
    const err = new Error("Account is blocked");
    (err as any).status = 403;
    throw err;
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid email or password");
    (err as any).status = 401;
    throw err;
  }

  const token = signAccessToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

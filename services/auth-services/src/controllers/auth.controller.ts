import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { signupUser, signinUser } from "../services/auth.service.js";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function adminSignup(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const body = signupSchema.parse(req.body);
    const result = await signupUser({ ...body, role: "admin" });
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const body = signupSchema.parse(req.body);
    const result = await signupUser(body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function signin(req: Request, res: Response, next: NextFunction) {
  try {
    const body = signinSchema.parse(req.body);
    const result = await signinUser(body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

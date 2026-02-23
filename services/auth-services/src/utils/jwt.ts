import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  userId: string;
  email: string;
  role: "user" | "admin";
};

const SECRET: Secret = (() => {
  if (!env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  return env.JWT_SECRET;
})();

const signOptions: SignOptions = {
  expiresIn: (env.JWT_EXPIRES_IN ?? "15m") as SignOptions["expiresIn"],
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, signOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as JwtPayload;
}

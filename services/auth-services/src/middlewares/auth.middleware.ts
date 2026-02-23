import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }

    const token = auth.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

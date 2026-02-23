import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(5001),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 chars"),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),

  CORS_ORIGIN: z.string().default("*"),
});

export const ENV = EnvSchema.parse(process.env);

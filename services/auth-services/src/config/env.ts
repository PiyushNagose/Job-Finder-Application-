// src/config/env.ts
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(3000),

  // examples — adjust to your real vars:
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  // ...
});

export const env = (() => {
  const res = envSchema.safeParse(process.env);

  if (!res.success) {
    console.error("❌ Invalid environment variables:");
    console.error(res.error.flatten().fieldErrors);
    console.error(res.error.flatten().formErrors);
    // optional: print issues list
    console.error(res.error.issues);
    throw new Error("Invalid environment variables");
  }

  return res.data;
})();

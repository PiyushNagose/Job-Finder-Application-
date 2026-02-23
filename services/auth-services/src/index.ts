import mongoose from "mongoose";
import { app } from "./app.js";
import { env } from "./config/env.js";

async function start() {
  await mongoose.connect(env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  app.listen(env.PORT, () => {
    console.log(`✅ Auth service running on http://localhost:${env.PORT}`);
  });
}

start().catch((e) => {
  console.error("❌ Failed to start:", e);
  process.exit(1);
});

import mongoose from "mongoose";
import { app } from "./app.js";
import { ENV } from "./config/env.js";

async function start() {
  await mongoose.connect(ENV.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  app.listen(ENV.PORT, () => {
    console.log(`✅ Auth service running on http://localhost:${ENV.PORT}`);
  });
}

start().catch((e) => {
  console.error("❌ Failed to start:", e);
  process.exit(1);
});

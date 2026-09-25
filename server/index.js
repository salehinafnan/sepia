import mongoose from "mongoose";

import app from "./app.js";
import config from "./config.js";

if (!config.mongoUrl) throw new Error("CONNECTION_URL must be set");

await mongoose.connect(config.mongoUrl);
console.log("MongoDB connected");

const server = app.listen(config.port, (error) => {
  if (error) throw error;
  console.log(`Server running on port ${config.port}`);
});

const shutdown = () =>
  server.close(async () => {
    await mongoose.disconnect();
    process.exit(0);
  });
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

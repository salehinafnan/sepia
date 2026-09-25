import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

import config from "./config.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/user.js";

const app = express();

app.set("trust proxy", config.trustProxy);
app.use(
  helmet({
    // A JSON API renders nothing, and the client (another origin) embeds its images.
    contentSecurityPolicy: {
      useDefaults: false,
      directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(cors({ origin: config.clientOrigins, maxAge: 7200 }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later" },
  }),
);

app.get("/", (req, res) => res.json({ status: "ok" }));
app.use("/posts", postRoutes);
app.use("/user", userRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

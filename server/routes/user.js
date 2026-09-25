import express, { Router } from "express";
import { rateLimit } from "express-rate-limit";

import { googleSignin, signin, signup } from "../controllers/user.js";

const router = Router();

// Only failed attempts count, so this throttles password guessing, not sign-ins.
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      message: "Too many attempts, please try again in a few minutes",
    },
  }),
  express.json({ limit: "10kb" }),
);

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/google", googleSignin);

export default router;

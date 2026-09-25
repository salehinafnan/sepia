import express, { Router } from "express";

import {
  createPost,
  deletePost,
  getPostImage,
  getPosts,
  likePost,
  unlikePost,
  updatePost,
} from "../controllers/posts.js";
import auth from "../middleware/auth.js";

const router = Router();
// Parsed after auth so anonymous clients can't make the server buffer large bodies.
const json = express.json({ limit: "3mb" });

router.get("/", getPosts);
router.post("/", auth, json, createPost);
router.get("/:id/image", getPostImage);
router.patch("/:id", auth, json, updatePost);
router.delete("/:id", auth, deletePost);
router.put("/:id/like", auth, likePost);
router.delete("/:id/like", auth, unlikePost);

export default router;

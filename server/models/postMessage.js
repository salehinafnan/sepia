import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    name: String,
    creator: { type: String, required: true },
    tags: { type: [String], default: [] },
    // Base64 data URL. Never loaded unless explicitly selected.
    selectedFile: { type: String, select: false },
    likes: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("PostMessage", postSchema);

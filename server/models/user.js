import mongoose from "mongoose";

export const caseInsensitive = { locale: "en", strength: 2 };

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, select: false },
  googleId: String,
  picture: String,
});

userSchema.index({ email: 1 }, { unique: true, collation: caseInsensitive });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export default mongoose.model("User", userSchema);

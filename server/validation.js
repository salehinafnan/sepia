import { z } from "zod";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));
const name = z
  .string()
  .trim()
  .min(1, "Enter your name")
  .max(50, "Name is too long");

export const signinSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(128),
});

export const signupSchema = z.object({
  firstName: name,
  lastName: name,
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    // bcrypt ignores everything past 72 bytes.
    .refine(
      (password) => Buffer.byteLength(password) <= 72,
      "Password is too long",
    ),
});

export const googleSchema = z.object({
  credential: z.string().min(1).max(4096),
});

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a title")
    .max(100, "Titles can be at most 100 characters"),
  message: z
    .string()
    .trim()
    .max(2000, "Captions can be at most 2000 characters")
    .default(""),
  tags: z
    .array(
      z.string().trim().min(1).max(30, "Tags can be at most 30 characters"),
    )
    .max(10, "Use at most 10 tags")
    .default([])
    .transform((tags) => [...new Set(tags)]),
  // undefined keeps the current image, null removes it.
  selectedFile: z
    .string()
    .max(
      Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 32,
      "Images must be 2 MB or smaller",
    )
    .regex(
      /^data:image\/(?:png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+/]+={0,2}$/,
      "Use a PNG, JPEG, WebP, GIF or AVIF image",
    )
    .nullable()
    .optional(),
});

export const pageSchema = z.object({
  cursor: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid cursor")
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

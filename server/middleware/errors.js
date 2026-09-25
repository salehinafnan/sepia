import mongoose from "mongoose";
import { ZodError } from "zod";

export class HttpError extends Error {
  expose = true;

  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const notFound = () => {
  throw new HttpError(404, "Not found");
};

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof ZodError)
    return res.status(400).json({ message: err.issues[0].message });
  if (err instanceof mongoose.Error.CastError)
    return res.status(404).json({ message: "Not found" });
  if (err.code === 11000)
    return res.status(409).json({ message: "That already exists" });
  if (err.type === "entity.too.large")
    return res.status(413).json({ message: "That upload is too large" });

  // `expose` marks errors meant for clients: ours and body-parser's 4xx errors.
  if (!err.expose) console.error(err);
  res
    .status(err.status ?? 500)
    .json({ message: err.expose ? err.message : "Something went wrong" });
};

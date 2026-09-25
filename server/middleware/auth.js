import { jwtVerify } from "jose";

import config from "../config.js";
import { HttpError } from "./errors.js";

const auth = async (req, res, next) => {
  const [scheme, token] = req.get("Authorization")?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token)
    throw new HttpError(401, "Please sign in to continue");

  try {
    const { payload } = await jwtVerify(token, config.jwtKey, {
      algorithms: ["HS256"],
    });
    req.userId = payload.sub;
  } catch {
    throw new HttpError(401, "Your session has expired, please sign in again");
  }
  next();
};

export default auth;

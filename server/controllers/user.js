import bcrypt from "bcryptjs";
import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";

import config from "../config.js";
import { HttpError } from "../middleware/errors.js";
import PostMessage from "../models/postMessage.js";
import User, { caseInsensitive } from "../models/user.js";
import { googleSchema, signinSchema, signupSchema } from "../validation.js";

const SESSION_SECONDS = 7 * 24 * 60 * 60;
// Checked when an email is unknown so response times don't reveal which accounts exist.
const DUMMY_HASH =
  "$2b$12$rgLvYQ6kaDG53IGTQurRgOg8yZi3.LDxSn5zO0tI1VFllS8ZF9rN2";
const googleKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

const createSession = async ({ _id, name, email, picture }) => {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const token = await new SignJWT()
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(_id))
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(config.jwtKey);
  return {
    user: { _id, name, email, picture },
    token,
    expiresAt: expiresAt * 1000,
  };
};

// Google users used to have no account, so their posts and likes referenced the Google user ID.
const adoptLegacyGoogleContent = (googleId, userId) =>
  Promise.all([
    PostMessage.updateMany(
      { creator: googleId },
      { creator: userId },
      { timestamps: false },
    ),
    PostMessage.updateMany(
      { likes: googleId },
      { $set: { "likes.$": userId } },
      { timestamps: false },
    ),
  ]);

export const signin = async (req, res) => {
  const { email, password } = signinSchema.parse(req.body);
  const user = await User.findOne({ email })
    .collation(caseInsensitive)
    .select("+password")
    .lean();
  const matches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user?.password || !matches)
    throw new HttpError(401, "Incorrect email or password");

  res.json(await createSession(user));
};

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = signupSchema.parse(req.body);
  if (await User.exists({ email }).collation(caseInsensitive))
    throw new HttpError(409, "An account with this email already exists");

  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email,
    password: await bcrypt.hash(password, 12),
  });
  res.status(201).json(await createSession(user));
};

export const googleSignin = async (req, res) => {
  if (!config.googleClientId)
    throw new HttpError(503, "Google sign-in isn't available right now");
  const { credential } = googleSchema.parse(req.body);

  let profile;
  try {
    ({ payload: profile } = await jwtVerify(credential, googleKeys, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: config.googleClientId,
    }));
  } catch {
    throw new HttpError(401, "Google sign-in failed, please try again");
  }
  if (!profile.email_verified)
    throw new HttpError(401, "Your Google email address isn't verified");

  let user = await User.findOneAndUpdate(
    { googleId: profile.sub },
    { picture: profile.picture },
    { returnDocument: "after" },
  ).lean();

  if (!user) {
    // Linking to an unverified password account would let whoever created it into this one.
    if (await User.exists({ email: profile.email }).collation(caseInsensitive))
      throw new HttpError(
        409,
        "An account with this email already exists, sign in with your password",
      );

    user = await User.create({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name || profile.email,
      picture: profile.picture,
    });
    await adoptLegacyGoogleContent(profile.sub, String(user._id));
  }

  res.json(await createSession(user));
};

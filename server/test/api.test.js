import assert from "node:assert/strict";
import { once } from "node:events";
import { after, before, beforeEach, describe, mock, test } from "node:test";

import { SignJWT, exportJWK, generateKeyPair } from "jose";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters";
process.env.GOOGLE_CLIENT_ID = "sepia-test.apps.googleusercontent.com";

const { default: app } = await import("../app.js");
const { default: PostMessage } = await import("../models/postMessage.js");
const { default: User } = await import("../models/user.js");

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const PNG_DATA_URL = `data:image/png;base64,${PNG.toString("base64")}`;

// Google's signing keys, served through a mocked fetch.
const google = await generateKeyPair("RS256");
const googleJwk = { ...(await exportJWK(google.publicKey)), kid: "test" };
const realFetch = globalThis.fetch;
mock.method(globalThis, "fetch", (url, init) =>
  String(url) === "https://www.googleapis.com/oauth2/v3/certs"
    ? Promise.resolve(Response.json({ keys: [googleJwk] }))
    : realFetch(url, init),
);

const googleCredential = ({
  sub = "109876543210987654321",
  aud,
  ...claims
} = {}) =>
  new SignJWT({
    email: "grace@example.com",
    email_verified: true,
    name: "Grace Hopper",
    picture: "https://lh3.googleusercontent.com/a/grace",
    ...claims,
  })
    .setProtectedHeader({ alg: "RS256", kid: "test" })
    .setIssuer("https://accounts.google.com")
    .setAudience(aud ?? process.env.GOOGLE_CLIENT_ID)
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(google.privateKey);

let mongo;
let server;
let baseUrl;
let clientCount = 0;

// Each call comes from a new client IP unless one is given, so rate limits don't leak between tests.
const api = async (method, path, { token, body, ip } = {}) => {
  const res = await realFetch(baseUrl + path, {
    method,
    headers: {
      "X-Forwarded-For":
        ip ?? `10.0.${clientCount >> 8}.${clientCount++ & 255}`,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(body && { "Content-Type": "application/json" }),
    },
    body: body && JSON.stringify(body),
  });
  const isJson = res.headers.get("content-type")?.includes("json");
  return {
    status: res.status,
    headers: res.headers,
    body: isJson ? await res.json() : Buffer.from(await res.arrayBuffer()),
  };
};

const signUp = async (email = "ada@example.com") => {
  const { body } = await api("POST", "/user/signup", {
    body: {
      firstName: "Ada",
      lastName: "Lovelace",
      email,
      password: "correct horse",
    },
  });
  return body;
};

const createPost = async (token, post = {}) =>
  (await api("POST", "/posts", { token, body: { title: "Hello", ...post } }))
    .body;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all([User.init(), PostMessage.init()]);
  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(() => Promise.all([User.deleteMany(), PostMessage.deleteMany()]));

describe("email accounts", () => {
  test("sign up returns a session without the password hash", async () => {
    const { status, body } = await api("POST", "/user/signup", {
      body: {
        firstName: " Ada ",
        lastName: "Lovelace",
        email: "Ada@Example.com",
        password: "correct horse",
      },
    });

    assert.equal(status, 201);
    assert.deepEqual(Object.keys(body.user).sort(), ["_id", "email", "name"]);
    assert.equal(body.user.name, "Ada Lovelace");
    assert.equal(body.user.email, "ada@example.com");
    assert.ok(body.token);
    assert.ok(body.expiresAt > Date.now() + 6 * 24 * 60 * 60 * 1000);
  });

  test("sign up validates input", async () => {
    const signup = (overrides) =>
      api("POST", "/user/signup", {
        body: {
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          password: "correct horse",
          ...overrides,
        },
      });

    assert.deepEqual((await signup({ password: "short" })).body, {
      message: "Password must be at least 8 characters",
    });
    assert.deepEqual((await signup({ email: "nope" })).body, {
      message: "Enter a valid email address",
    });
    assert.equal((await signup({ lastName: "" })).status, 400);
  });

  test("emails are unique regardless of case", async () => {
    await signUp("ada@example.com");
    const { status } = await api("POST", "/user/signup", {
      body: {
        firstName: "A",
        lastName: "L",
        email: "ADA@example.com",
        password: "correct horse",
      },
    });
    assert.equal(status, 409);
  });

  test("sign in accepts any email casing", async () => {
    await signUp("ada@example.com");
    const { status, body } = await api("POST", "/user/signin", {
      body: { email: "ADA@EXAMPLE.COM", password: "correct horse" },
    });
    assert.equal(status, 200);
    assert.equal(body.user.email, "ada@example.com");
  });

  test("unknown emails and wrong passwords are indistinguishable", async () => {
    await signUp("ada@example.com");
    const wrongPassword = await api("POST", "/user/signin", {
      body: { email: "ada@example.com", password: "wrong password" },
    });
    const unknownEmail = await api("POST", "/user/signin", {
      body: { email: "nobody@example.com", password: "wrong password" },
    });

    assert.equal(wrongPassword.status, 401);
    assert.deepEqual(wrongPassword.body, unknownEmail.body);
  });

  test("accounts created by the previous version can still sign in", async () => {
    const bcrypt = (await import("bcryptjs")).default;
    const hash = (await bcrypt.hash("old password", 4)).replace("$2b$", "$2a$");
    await User.collection.insertOne({
      name: "Old Timer ",
      email: "Old@Example.com",
      password: hash,
    });

    const { status } = await api("POST", "/user/signin", {
      body: { email: "old@example.com", password: "old password" },
    });
    assert.equal(status, 200);
  });

  test("repeated failed sign-ins are throttled", async () => {
    const attempt = () =>
      api("POST", "/user/signin", {
        ip: "203.0.113.7",
        body: { email: "ada@example.com", password: "guess" },
      });
    for (let i = 0; i < 10; i++) assert.equal((await attempt()).status, 401);
    assert.equal((await attempt()).status, 429);
  });
});

describe("posts", () => {
  test("writes require a token signed by this server", async () => {
    const forged = await new SignJWT()
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(new mongoose.Types.ObjectId().toString())
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("test"));
    const unsigned = `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from('{"sub":"x"}').toString("base64url")}.`;

    for (const token of [undefined, forged, unsigned, "garbage"]) {
      assert.equal(
        (await api("POST", "/posts", { token, body: { title: "Hi" } })).status,
        401,
      );
    }
  });

  test("the server decides who wrote a post", async () => {
    const { token, user } = await signUp();
    const { status, body } = await api("POST", "/posts", {
      token,
      body: {
        title: " Hello ",
        message: "World",
        tags: ["a", "b", "a"],
        name: "Someone else",
        creator: "someone-else",
        likes: ["1", "2"],
      },
    });

    assert.equal(status, 201);
    assert.equal(body.title, "Hello");
    assert.equal(body.name, "Ada Lovelace");
    assert.equal(body.creator, user._id);
    assert.deepEqual(body.likes, []);
    assert.deepEqual(body.tags, ["a", "b"]);
    assert.equal(body.image, null);
  });

  test("post input is validated", async () => {
    const { token } = await signUp();
    const post = (body) => api("POST", "/posts", { token, body });

    assert.deepEqual((await post({ title: " " })).body, {
      message: "Add a title",
    });
    assert.equal(
      (
        await post({
          title: "Hi",
          selectedFile: "data:image/svg+xml;base64,PHN2Zz4=",
        })
      ).status,
      400,
    );
    assert.equal(
      (await post({ title: "Hi", tags: Array(11).fill("x") })).status,
      400,
    );
  });

  test("the feed is paginated newest first without image data", async () => {
    const { token } = await signUp();
    for (const title of ["one", "two", "three"]) {
      await createPost(token, { title, selectedFile: PNG_DATA_URL });
    }

    const first = await api("GET", "/posts?limit=2");
    assert.deepEqual(
      first.body.posts.map((post) => post.title),
      ["three", "two"],
    );
    assert.ok(first.body.posts.every((post) => !("selectedFile" in post)));
    assert.match(
      first.body.posts[0].image,
      /^\/posts\/[a-f\d]{24}\/image\?v=\d+$/,
    );

    const second = await api(
      "GET",
      `/posts?limit=2&cursor=${first.body.nextCursor}`,
    );
    assert.deepEqual(
      second.body.posts.map((post) => post.title),
      ["one"],
    );
    assert.equal(second.body.nextCursor, null);

    assert.equal((await api("GET", "/posts?cursor=nope")).status, 400);
  });

  test("images are served as cacheable binaries", async () => {
    const { token } = await signUp();
    const post = await createPost(token, { selectedFile: PNG_DATA_URL });

    const { status, headers, body } = await api("GET", post.image);
    assert.equal(status, 200);
    assert.equal(headers.get("content-type"), "image/png");
    assert.equal(
      headers.get("cache-control"),
      "public, max-age=31536000, immutable",
    );
    assert.equal(headers.get("cross-origin-resource-policy"), "cross-origin");
    assert.deepEqual(body, PNG);

    const withoutImage = await createPost(token);
    assert.equal(
      (await api("GET", `/posts/${withoutImage._id}/image`)).status,
      404,
    );
  });

  test("only authors can edit or delete their posts", async () => {
    const author = await signUp("ada@example.com");
    const stranger = await signUp("eve@example.com");
    const post = await createPost(author.token, { selectedFile: PNG_DATA_URL });
    const edit = { title: "Edited", message: "New caption", tags: ["x"] };

    assert.equal(
      (
        await api("PATCH", `/posts/${post._id}`, {
          token: stranger.token,
          body: edit,
        })
      ).status,
      403,
    );
    assert.equal(
      (await api("DELETE", `/posts/${post._id}`, { token: stranger.token }))
        .status,
      403,
    );

    const kept = await api("PATCH", `/posts/${post._id}`, {
      token: author.token,
      body: edit,
    });
    assert.equal(kept.status, 200);
    assert.equal(kept.body.title, "Edited");
    assert.notEqual(kept.body.image, null);
    assert.notEqual(kept.body.image, post.image);

    const removed = await api("PATCH", `/posts/${post._id}`, {
      token: author.token,
      body: { ...edit, selectedFile: null },
    });
    assert.equal(removed.body.image, null);

    assert.equal(
      (await api("DELETE", `/posts/${post._id}`, { token: author.token }))
        .status,
      204,
    );
    assert.equal(
      (await api("DELETE", `/posts/${post._id}`, { token: author.token }))
        .status,
      404,
    );
    assert.equal(
      (
        await api("PATCH", "/posts/not-an-id", {
          token: author.token,
          body: edit,
        })
      ).status,
      404,
    );
  });

  test("likes are idempotent and don't bust the image cache", async () => {
    const { token, user } = await signUp();
    const post = await createPost(token, { selectedFile: PNG_DATA_URL });
    const like = () => api("PUT", `/posts/${post._id}/like`, { token });

    await like();
    assert.deepEqual((await like()).body.likes, [user._id]);
    assert.deepEqual(
      (await api("DELETE", `/posts/${post._id}/like`, { token })).body.likes,
      [],
    );

    const [feedPost] = (await api("GET", "/posts")).body.posts;
    assert.equal(feedPost.image, post.image);
  });

  test("posts stored by the previous version are served", async () => {
    const createdAt = new Date("2024-05-01T12:00:00Z");
    const { insertedId } = await PostMessage.collection.insertOne({
      title: "Legacy",
      message: "From 2024",
      name: "Old Timer",
      creator: "65f000000000000000000000",
      tags: ["old", " spaced"],
      selectedFile: `data:image/jpg;base64,${PNG.toString("base64")}`,
      likes: [],
      createdAt,
      __v: 0,
    });

    const [post] = (await api("GET", "/posts")).body.posts;
    assert.equal(post.title, "Legacy");
    assert.equal(
      post.image,
      `/posts/${insertedId}/image?v=${createdAt.getTime()}`,
    );

    const image = await api("GET", post.image);
    assert.equal(image.headers.get("content-type"), "image/jpeg");
  });
});

describe("Google sign-in", () => {
  test("creates an account and adopts posts and likes from the previous version", async () => {
    const sub = "109876543210987654321";
    const { insertedId } = await PostMessage.collection.insertOne({
      title: "Posted with Google",
      creator: sub,
      likes: [sub, "someone-else"],
      createdAt: new Date(),
    });

    const { status, body } = await api("POST", "/user/google", {
      body: { credential: await googleCredential({ sub }) },
    });
    assert.equal(status, 200);
    assert.equal(body.user.name, "Grace Hopper");
    assert.equal(
      body.user.picture,
      "https://lh3.googleusercontent.com/a/grace",
    );

    const post = await PostMessage.findById(insertedId).lean();
    assert.equal(post.creator, body.user._id);
    assert.deepEqual(post.likes, [body.user._id, "someone-else"]);

    const again = await api("POST", "/user/google", {
      body: { credential: await googleCredential({ sub }) },
    });
    assert.equal(again.body.user._id, body.user._id);
  });

  test("rejects invalid credentials", async () => {
    const signIn = async (claims) =>
      (
        await api("POST", "/user/google", {
          body: { credential: await googleCredential(claims) },
        })
      ).status;

    assert.equal(await signIn({ email_verified: false }), 401);
    assert.equal(await signIn({ aud: "someone-elses-app" }), 401);
    assert.equal(
      (await api("POST", "/user/google", { body: { credential: "garbage" } }))
        .status,
      401,
    );
  });

  test("won't take over an existing password account", async () => {
    await signUp("grace@example.com");
    const { status } = await api("POST", "/user/google", {
      body: { credential: await googleCredential() },
    });
    assert.equal(status, 409);
  });
});

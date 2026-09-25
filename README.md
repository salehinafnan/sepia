# Sepia

A small full-stack social app for sharing photos and moments, built with React, Redux Toolkit, Node.js, Express and MongoDB.

Live at [sepia.onrender.com](https://sepia.onrender.com).

## Features

- Email/password accounts and Google sign-in
- Create, edit and delete posts with a photo, caption and tags
- Like posts, with instant (optimistic) updates
- Infinite-scrolling feed that loads 12 posts at a time
- Light and dark themes, responsive down to small phones
- Images are resized in the browser before upload and served from a cacheable endpoint

## Tech stack

| Client                           | Server                              |
| -------------------------------- | ----------------------------------- |
| React 19 with the React Compiler | Node.js 22.22+ (24 LTS recommended) |
| Vite 8                           | Express 5                           |
| Redux Toolkit 2 and RTK Query    | Mongoose 9 (MongoDB)                |
| React Router 8                   | jose (JWT), bcryptjs                |
| Tailwind CSS 4, lucide icons     | zod, helmet, express-rate-limit     |

## Running locally

You need Node.js 22.22 or newer and a MongoDB database (local or Atlas).

**Server**

```sh
cd server
cp .env.example .env   # then fill in CONNECTION_URL and JWT_SECRET
npm install
npm run dev            # http://localhost:5000
```

Generate a `JWT_SECRET` with:

```sh
node -e "console.log(crypto.randomBytes(48).toString('base64url'))"
```

**Client**

```sh
cd client
npm install
npm run dev            # http://localhost:3000
```

The client talks to `http://localhost:5000` in development and to `https://sepia-server.onrender.com` in production builds. Override either with `VITE_API_URL` in `client/.env.local`.

To enable Google sign-in, create an OAuth client ID in the [Google Cloud console](https://console.cloud.google.com/apis/credentials), add your client origins (for example `http://localhost:3000` and `https://sepia.onrender.com`) to its authorized JavaScript origins, and set it as `GOOGLE_CLIENT_ID` on the server and `VITE_GOOGLE_CLIENT_ID` on the client.

## Environment variables

**Server** (`server/.env`, or the host's environment settings)

| Name               | Required | Description                                                                                          |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `CONNECTION_URL`   | yes      | MongoDB connection string                                                                            |
| `JWT_SECRET`       | yes      | Random string of at least 32 characters used to sign sessions                                        |
| `GOOGLE_CLIENT_ID` | no       | Enables Google sign-in                                                                               |
| `CLIENT_ORIGIN`    | no       | Comma-separated origins allowed by CORS. Default: `https://sepia.onrender.com,http://localhost:3000` |
| `TRUST_PROXY`      | no       | Number of reverse proxies in front of the server, used for rate limiting. Default: `1` (Render)      |
| `PORT`             | no       | Default: `5000`                                                                                      |

**Client** (build-time, public)

| Name                    | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `VITE_API_URL`          | Server URL. Set by `.env.development` and `.env.production` |
| `VITE_GOOGLE_CLIENT_ID` | Shows the "Sign in with Google" button                      |

## Scripts

| Where  | Command         | What it does                                   |
| ------ | --------------- | ---------------------------------------------- |
| server | `npm run dev`   | Start with auto-restart (`node --watch`)       |
| server | `npm start`     | Start for production                           |
| server | `npm test`      | Integration tests against an in-memory MongoDB |
| client | `npm run dev`   | Vite dev server                                |
| client | `npm run build` | Production build into `client/build`           |
| both   | `npm run lint`  | Lint with oxlint                               |

## Deploying (Render)

- **Server** (web service): root directory `server`, build `npm install`, start `npm start`. Set `CONNECTION_URL`, `JWT_SECRET` and optionally `GOOGLE_CLIENT_ID` and `CLIENT_ORIGIN`.
- **Client** (static site): root directory `client`, build `npm install && npm run build`, publish directory `build`. Add a rewrite rule from `/*` to `/index.html` if there isn't one, so routes like `/auth` survive a refresh, and set `VITE_GOOGLE_CLIENT_ID` if you use Google sign-in.

Both `package.json` files pin Node.js with `engines`, which Render uses to choose the version.

### Upgrading an existing deployment from v1

- `JWT_SECRET` is now required. The old hardcoded secret is gone, so everyone has to sign in again once.
- Google sign-in now uses Google Identity Services and is verified on the server. Rename the client variable from `REACT_APP_GOOGLE_CLIENT_ID` to `VITE_GOOGLE_CLIENT_ID` and also set `GOOGLE_CLIENT_ID` on the server.
- Existing posts, images and accounts keep working without a migration. The first time a Google user signs in, their older posts and likes are linked to their new account automatically.

## Security

- Sessions are HS256 JWTs signed with `JWT_SECRET`; Google ID tokens are verified against Google's public keys.
- Only a post's author can edit or delete it, and the author's name and ID come from the session, never from the request.
- Request bodies are validated with zod, size-limited, and images must be PNG, JPEG, WebP, GIF or AVIF under 2 MB.
- Password hashes are never sent to the client, and failed sign-ins look the same whether or not the email exists.
- Failed sign-in attempts are rate limited per IP, and all API requests have a generous global limit.
- The API sends strict security headers (helmet) and only allows CORS from `CLIENT_ORIGIN`.
- The client ships a Content-Security-Policy that only allows its own scripts, the API and Google sign-in.

## Note on performance

The live demo runs on Render's free tier, which sleeps after inactivity. The first request after a while can take up to a minute while the server wakes up; the app shows a notice when that happens.

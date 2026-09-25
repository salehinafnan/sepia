const { env } = process;

if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be set to a random string of at least 32 characters",
  );
}

export default {
  port: Number(env.PORT) || 5000,
  mongoUrl: env.CONNECTION_URL,
  jwtKey: new TextEncoder().encode(env.JWT_SECRET),
  googleClientId: env.GOOGLE_CLIENT_ID,
  clientOrigins: (
    env.CLIENT_ORIGIN ?? "https://sepia.onrender.com,http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim()),
  // Render (and most PaaS) put exactly one proxy in front of the app.
  trustProxy: Number(env.TRUST_PROXY ?? 1),
};

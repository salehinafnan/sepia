import { createHash } from "node:crypto";

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// Production builds get a Content-Security-Policy; inline scripts are allowed by hash.
const contentSecurityPolicy = (apiUrl) => ({
  name: "content-security-policy",
  apply: "build",
  transformIndexHtml(html) {
    const api = new URL(apiUrl).origin;
    const google = "https://accounts.google.com/gsi";
    const inlineScripts = [
      ...html.matchAll(/<script>([\s\S]*?)<\/script>/g),
    ].map(
      ([, code]) =>
        `'sha256-${createHash("sha256").update(code).digest("base64")}'`,
    );
    const policy = [
      "default-src 'self'",
      `script-src 'self' ${inlineScripts.join(" ")} ${google}/client`,
      `style-src 'self' 'unsafe-inline' ${google}/style`,
      `img-src 'self' data: ${api} https://*.googleusercontent.com`,
      `connect-src 'self' ${api} ${google}/`,
      `frame-src ${google}/`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    return html.replace(
      "<head>",
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
    );
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      contentSecurityPolicy(env.VITE_API_URL),
    ],
    server: { port: 3000 },
    preview: { port: 3000 },
    // Kept from Create React App so existing deployments publish the same folder.
    build: { outDir: "build" },
  };
});

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      // Fail instead of silently moving to 5174: Better Auth only trusts the
      // origins listed in the backend's FRONTEND_URLS.
      port: 5173,
      strictPort: true,
      // In development the API is reached through this proxy, so the session
      // cookie is first-party and no CORS is involved.
      proxy: {
        "/api": {
          target: env.API_PROXY_TARGET || "http://localhost:4001",
          changeOrigin: false,
        },
      },
    },
  };
});

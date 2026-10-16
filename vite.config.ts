import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5174,
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

import { defineConfig } from "vite";

const API_ORIGIN = "https://trafikverket-api-production.up.railway.app";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: API_ORIGIN,
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During development the React app runs on port 5173 and the API on 3001.
// This proxy forwards "/api/*" requests to the backend so our frontend code can
// just call "/api/shorten" without worrying about ports or CORS.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: "public",
  server: {
    host: true,
    allowedHosts: ["populational-camren-sketchingly.ngrok-free.dev"],
  },
});

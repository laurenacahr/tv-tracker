import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Pick ports no other app uses (see the table in the root README), so two
// apps can run side by side. /api goes to this app's Node server.
const WEB_PORT = 5180;
const API_PORT = 8790;

export default defineConfig({
  plugins: [react()],
  server: {
    port: WEB_PORT,
    proxy: { "/api": `http://127.0.0.1:${API_PORT}` },
  },
});

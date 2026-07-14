import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vercel serves your app at the domain root, so base is "/".
// (If you ever go back to GitHub Pages, change this to "/your-repo-name/" instead.)
export default defineConfig({
  plugins: [react()],
  base: "/",
});

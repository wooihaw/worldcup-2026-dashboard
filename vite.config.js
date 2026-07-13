import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: set this to your GitHub repo name (with leading and trailing slash)
// e.g. if your repo is github.com/yourname/worldcup-dashboard, use "/worldcup-dashboard/"
// If you're deploying to a custom domain or a "yourname.github.io" root repo, use "/"
export default defineConfig({
  plugins: [react()],
  base: "/worldcup-dashboard/",
});

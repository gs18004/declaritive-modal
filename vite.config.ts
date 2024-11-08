import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{ find: "@src", replacement: resolve(__dirname, "src") }],
  },
  plugins: [react(), tsconfigPaths()],
});

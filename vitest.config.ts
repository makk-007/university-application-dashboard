import { defineConfig } from "vitest/config";
import path from "path";

// Kept separate from vite.config.ts so tests do not load the React and
// Tailwind plugins. The tests are plain logic tests that run in Node.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

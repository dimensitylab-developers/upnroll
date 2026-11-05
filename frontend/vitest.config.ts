import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "../backend/**/*.test.ts"],
  },
  resolve: {
    alias: [
      { find: /^@\/server\//, replacement: path.resolve(__dirname, "../backend") + "/" },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "../backend/**/*.test.ts"],
    // Cold dynamic imports of match/payment service graphs can exceed 5s under parallel load.
    testTimeout: 15_000,
  },
  ssr: {
    resolve: {
      conditions: ["react-server", "node", "import", "module", "default"],
    },
  },
  resolve: {
    alias: [
      { find: "server-only", replacement: path.resolve(__dirname, "./src/test/server-only-stub.ts") },
      { find: /^@\/server\//, replacement: path.resolve(__dirname, "../backend") + "/" },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});

import path from "node:path";
import type { NextConfig } from "next";

const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  // Production traces files outside frontend/, including backend/.
  outputFileTracingRoot: repoRoot,
  // One mongoose instance. Bundling it per server chunk drops the connection.
  serverExternalPackages: ["mongoose"],
  webpack: (config) => {
    // Files in backend/ resolve packages from their own folder upward.
    // Dependencies are installed in frontend/node_modules.
    config.resolve.modules = [
      path.join(__dirname, "node_modules"),
      ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : ["node_modules"]),
    ];
    return config;
  },
};

export default nextConfig;

import path from "node:path";
import type { NextConfig } from "next";

const repoRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Passport photographs travel with the registration server action.
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  // Production traces files outside frontend/, including backend/.
  outputFileTracingRoot: repoRoot,
  // One mongoose instance. Bundling it per server chunk drops the connection.
  serverExternalPackages: ["mongoose", "mongodb", "nodemailer"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // HSTS is ignored on plain HTTP; browsers only arm it after a trusted HTTPS response.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // Report-Only until a nonce/hash strategy for Next.js inline bootstraps is in place.
          // Enforcing script-src 'self' alone would break the App Router runtime.
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "media-src 'self'",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Files in backend/ resolve packages from their own folder upward.
    // Dependencies are installed in frontend/node_modules.
    config.resolve.modules = [
      path.join(__dirname, "node_modules"),
      ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : ["node_modules"]),
    ];
    // The server compilation shares chunks with client references. Those chunks
    // otherwise load server-only's throwing build and fail page-data collection.
    // The browser compilation keeps the real package so a client import still fails.
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "server-only": path.join(__dirname, "node_modules/server-only/empty.js"),
        // backend/ walks up to the repo root, frontend/ has its own copy.
        // Next only externalizes mongoose when both resolutions are the same file.
        // Pin one path so every server layer shares Node's single module instance.
        mongoose: path.join(repoRoot, "node_modules/mongoose"),
        mongodb: path.join(repoRoot, "node_modules/mongodb"),
      };
    }
    return config;
  },
};

export default nextConfig;

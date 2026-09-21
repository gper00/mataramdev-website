import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Server Action bodies are capped at 1MB by default, which silently
      // rejects any upload larger than that (resource files are routinely
      // several MB). Keep this above RESOURCE_MAX_FILE_MB in src/lib/storage.ts
      // — the extra MB covers multipart boundary/header overhead.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
    ],
  },
  // Copy Prisma query engine files for both Windows (local) and Linux (Vercel)
  outputFileTracingIncludes: {
    "/**": [
      "./generated/prisma/**/*.node",
      "./node_modules/.prisma/client/*.node",
    ],
  },
};

export default nextConfig;
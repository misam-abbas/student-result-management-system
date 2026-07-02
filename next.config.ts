import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fail the production build on type errors / lint errors rather than
  // silently shipping broken code.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Used by Server Actions / Route Handlers that accept larger PDFs or
  // bulk student data in the future; keeps the default sane today.
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;

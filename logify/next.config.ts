import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
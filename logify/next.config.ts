import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

export default nextConfig;
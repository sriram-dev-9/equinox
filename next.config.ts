import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
      ignoreDuringBuilds: true,
  }, 
  typescript: {
      ignoreBuildErrors: true
  },
  images: {
      domains: ['static2.finnhub.io']
  }
};

export default nextConfig;

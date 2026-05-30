import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'standalone',
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

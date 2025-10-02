import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // NOTE: Required in order to load images from an external source.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com' }
    ]
  }
};

export default nextConfig;

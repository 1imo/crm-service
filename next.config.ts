import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3006',
        pathname: '/api/media/file/**',
      },
    ],
  },
};

export default nextConfig;

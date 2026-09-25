import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['172.21.120.88'],
  async rewrites() {
    const apiUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
    return [{ source: '/backend/:path*', destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://6d87-105-99-72-20.ngrok-free.app/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;

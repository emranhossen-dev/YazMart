import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/admin/:path(orders|inventory|purchase|finance|marketing|content|reports|staff|settings)/:tab",
        destination: "/admin/:path?tab=:tab",
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The tools moved from /pricing to /studio — keep every old link and bookmark working.
    return [
      { source: "/pricing", destination: "/studio", permanent: true },
      { source: "/pricing/:path*", destination: "/studio/:path*", permanent: true },
    ];
  },
};

export default nextConfig;

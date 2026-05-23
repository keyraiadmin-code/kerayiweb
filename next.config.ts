import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trljhzmegxonhqakcgrn.supabase.co",
      },
    ],
  },
};

export default nextConfig;

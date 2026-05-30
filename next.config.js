/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trljhzmegxonhqakcgrn.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;

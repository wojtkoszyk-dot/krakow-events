import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "media.krakow.travel",
      },
      {
        protocol: "http",
        hostname: "media.krakow.travel",
      },
      {
        protocol: "https",
        hostname: "images.ra.co",
      },
    ],
  },
};

export default nextConfig;
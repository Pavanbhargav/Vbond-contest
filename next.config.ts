import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sgp.cloud.appwrite.io", // Replace if self-hosting Appwrite
        pathname: "/v1/storage/buckets/**", // Adjust to fit your Appwrite endpoint
      },
    ],
  },
};

export default nextConfig;

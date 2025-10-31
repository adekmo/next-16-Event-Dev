import type { NextConfig } from "next";
// import { hostname } from "os";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ]
  },
  // reactCompiler: true,
  // experimental: {
  //   turbopackFileSystemCacheForDev: true,
  // }
};

export default nextConfig;

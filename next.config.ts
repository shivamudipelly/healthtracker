import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'images.unsplash.com',
      pathname: '/**',
    }, {
      protocol: 'https',
      hostname: 'randomuser.me',
      pathname: '/api/portraits/**',
    },


    ], 
  },
  productionBrowserSourceMaps: true,
  staticPageGenerationTimeout: 300,
  reactStrictMode: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'images.unsplash.com',
      pathname: '/**',
    },{
      protocol: 'https',
      hostname: 'randomuser.me',
      pathname: '/**',
    },
  
  ],
  },
};

export default nextConfig;

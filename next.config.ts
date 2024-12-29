import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'asaussier-projects.s3.eu-north-1.amazonaws.com',
      'www.gravatar.com'
    ],
  },
};

export default nextConfig;

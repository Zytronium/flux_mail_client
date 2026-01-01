import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  assetPrefix: './',
  images: {
    unoptimized: true,
  },
  reactCompiler: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Monaco Editor configuration
    config.module.rules.push({
      test: /\.ttf$/,
      type: 'asset/resource',
    });
    return config;
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@monaco-editor/react', 'lucide-react'],
  },
};

export default nextConfig;

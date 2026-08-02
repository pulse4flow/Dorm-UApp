import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,

  // Performance optimizations
  poweredByHeader: false,

  // Output standalone for production deployments
  output: "standalone",

  // Compression
  compress: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // Experimental features for performance
  experimental: {
    // Enable partial prerendering for static content
    ppr: false,
  },

  // Webpack bundle analyzer in production
  ...(process.env.ANALYZE === "true" && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.plugins.push(
          new (require("webpack-bundle-analyzer").BundleAnalyzerPlugin)({
            analyzerMode: "static",
            reportFilename: "../analyze.html",
            openAnalyzer: false,
          })
        );
      }
      return config;
    },
  }),
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,

  // Performance optimizations
  poweredByHeader: false,

  // Output standalone for production deployments
  output: "standalone",

  // Proxy API calls to the backend (keeps the browser same-origin, works behind tunnels)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_PROXY || "http://127.0.0.1:3001"}/:path*`,
      },
    ];
  },

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

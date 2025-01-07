/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Ignore build-time errors
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: ["localhost", "your-image-domain.com"],
    unoptimized: true, // Explicitly handle static files
  },

  // Move server external packages to top-level config
  serverExternalPackages: ["sharp"],

  // Explicitly define public directory
  publicRuntimeConfig: {
    uploadPath: "/public/uploads",
  },

  // Static file serving configuration
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },

  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;

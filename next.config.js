/** @type {import('next').NextConfig} */

const { optimizeImage } = require("next/dist/server/image-optimizer");
const { i18n } = require("./next-i18next.config");

const nextConfig = {
  poweredByHeader: false, 
  trailingSlash: true,
  i18n: {
    ...i18n,
    localeDetection: false,
  },
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  swcMinify: true,
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    contentDispositionType: 'inline',
    // Remote image domains (Azure blob + staging/prod)
    // Allow SVG images (required for site functionality)
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "khansaheb.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api01-khansaheb.e8demo.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "admin-khansaheb.e8demo.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

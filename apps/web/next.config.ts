import type { NextConfig } from "next";

// Origen del api-gateway sin /api (evita duplicar /api en el proxy)
const apiGatewayOrigin =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4174';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
        pathname: "/**",
      },
      // Dev: imágenes servidas localmente (ej. desde api-gateway o storage local)
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    // Proxy /api/* -> api-gateway (una sola vez /api)
    return [
      {
        source: '/api/:path*',
        destination: `${apiGatewayOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

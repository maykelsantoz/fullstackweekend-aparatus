import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // força usar o webpack e parar o circo do turbopack
  // turbopack?: false,

  // Opção 1: Direto no root (padrão dos docs)
  allowedDevOrigins: [
    "localhost:3000",
    "http://192.168.0.3:3000", // Exato, com protocolo e porta
  ],

  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./app/generated/prisma/**/*"],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "192.168.0.3:3000"],
    },
  },
};

export default nextConfig;

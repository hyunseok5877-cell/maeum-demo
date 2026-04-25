import type { NextConfig } from "next";

const isDemo = process.env.NEXT_PUBLIC_DEMO === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/maeum-demo";

const nextConfig: NextConfig = {
  ...(isDemo
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {
        images: {
          remotePatterns: [
            { protocol: "http", hostname: "localhost" },
            { protocol: "https", hostname: "source.unsplash.com" },
            { protocol: "https", hostname: "images.unsplash.com" },
            { protocol: "https", hostname: "picsum.photos" },
          ],
        },
      }),
};

export default nextConfig;

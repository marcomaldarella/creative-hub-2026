import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // c'è un package-lock.json sciolto in ~ — senza root esplicita Turbopack
  // sceglierebbe la home come workspace root
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;

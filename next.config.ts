import path from "node:path";
import type { NextConfig } from "next";

// c'è un package-lock.json sciolto in ~ — senza root esplicita Turbopack
// sceglierebbe la home come workspace root. __dirname non è affidabile nel
// config compilato: gli script npm girano sempre dalla root del pacchetto,
// quindi process.cwd() è corretto.
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;

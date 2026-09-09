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
  async rewrites() {
    // mockup statici del template corso (3 versioni da condividere col
    // cliente): file in public/mockup-corso/, URL puliti senza .html
    return [1, 2, 3].map((n) => ({
      source: `/mockup-corso/v${n}`,
      destination: `/mockup-corso/v${n}.html`,
    }));
  },
};

export default nextConfig;

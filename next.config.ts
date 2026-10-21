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
  async redirects() {
    // incubazione e accelerazione sono la stessa pagina (CreaTech):
    // i vecchi slug — e le loro versioni /en — vanno in 301
    const merged = ["incubazione", "accelerazione"].flatMap((slug) => [
      {
        source: `/innovazione/${slug}`,
        destination: "/innovazione/incubazione-accelerazione",
        permanent: true,
      },
      {
        source: `/en/innovazione/${slug}`,
        destination: "/en/innovazione/incubazione-accelerazione",
        permanent: true,
      },
    ]);
    return merged;
  },
};

export default nextConfig;

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
    // la prenotazione spazi ora vive sotto coworking (wizard, mockup
    // "prenota" ott 2026): il vecchio /prenota — e la versione /en —
    // vanno in 301; le schede prodotto /prenota/[slug] restano dove sono
    const prenota = [
      {
        source: "/prenota",
        destination: "/coworking/prenota",
        permanent: true,
      },
      {
        source: "/en/prenota",
        destination: "/en/coworking/prenota",
        permanent: true,
      },
    ];
    // i corsi finanziati sono passati sotto la loro pagina di categoria
    // (/academy/formazione-finanziata/[corso]): i vecchi URL appesi ad
    // /academy — e le versioni /en — vanno in 301
    const finanziati = [
      "music-data-analyst-and-strategist",
      "sound-design-immersivo",
      "produzione-audio-spaziale-e-suoni-immersivi",
      "multimedia-sound-designer",
      "digital-composer-and-producer",
      "songwriter-and-vocal-artist",
      "tecnico-modellatore-3d",
    ].flatMap((slug) => [
      {
        source: `/academy/${slug}`,
        destination: `/academy/formazione-finanziata/${slug}`,
        permanent: true,
      },
      {
        source: `/en/academy/${slug}`,
        destination: `/en/academy/formazione-finanziata/${slug}`,
        permanent: true,
      },
    ]);
    return [...merged, ...prenota, ...finanziati];
  },
};

export default nextConfig;

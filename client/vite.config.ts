import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const manifestForPlugIn = {
  registerType: "prompt",
  includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
  manifest: {
    name: "LingoMeet",
    short_name: "LingoMeet",
    description: "place where you can meet your language partner",
    icons: [
      {
        src: "/icons/android/android-launchericon-48-48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android/android-launchericon-72-72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android/android-launchericon-96-96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android/android-launchericon-144-144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/android/android-launchericon-192-192.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/android/android-launchericon-512-512.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any",
      },
      {
        src: "/icons/iso/16.png",
        sizes: "16x16",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/20.png",
        sizes: "20x20",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/29.png",
        sizes: "29x29",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/32.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/40.png",
        sizes: "40x40",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/50.png",
        sizes: "50x50",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/57.png",
        sizes: "57x57",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/58.png",
        sizes: "58x58",
        type: "image/png",
        purpose: "any",
      },

      {
        src: "/icons/iso/60.png",
        sizes: "60x60",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/64.png",
        sizes: "64x64",
        type: "image/png",
        purpose: "any",
      },

      {
        src: "/icons/iso/72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },

      {
        src: "/icons/iso/80.png",
        sizes: "680x80",
        type: "image/png",
        purpose: "any",
      },

      {
        src: "/icons/iso/87.png",
        sizes: "87x87",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/iso/100.png",
        sizes: "100x100",
        type: "image/png",
        purpose: "any",
      },
    ],
    theme_color: "#171717",
    background_color: "#f0e7db",
    display: "standalone",
    scope: "/",
    start_url: "/",
    orientation: "portrait",
  },
};

export default defineConfig({
  plugins: [react(), VitePWA(manifestForPlugIn)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

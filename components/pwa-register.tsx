"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    workbox?: any;
  }
}

export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Check if workbox is available (for Next.js PWA plugin)
    if (window.workbox !== undefined) {
      const wb = window.workbox;
      wb.addEventListener("controlling", () => {
        window.location.reload();
      });
      wb.register();
    } else {
      // Manual service worker registration
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration.scope);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}

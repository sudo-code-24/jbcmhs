"use client";
import { useEffect } from "react";

export default function Pwa() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("[PWA] Service worker registration failed:", err);
      });
    };

    // `load` may have already fired before this effect runs (common with App Router).
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
    }
  }, []);

  return null;
}

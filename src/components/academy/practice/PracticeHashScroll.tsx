"use client";

import { useEffect } from "react";

/** Open hash target and scroll into view (works with SSR content + client islands). */
export function PracticeHashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
      }
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);
  return null;
}

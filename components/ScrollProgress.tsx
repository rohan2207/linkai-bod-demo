"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [w, setW] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      setW(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[200] h-0.5 bg-gradient-to-r from-pp via-pm to-pa transition-[width] duration-100 ease-linear"
      style={{ width: `${w}%` }}
      aria-hidden
    />
  );
}

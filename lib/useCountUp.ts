"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `target` over `duration` ms using ease-out curve.
 * Starts counting when the returned `ref` element enters the viewport.
 * Plays only once (once: true).
 */
export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          observer.disconnect();

          const start = performance.now();
          function tick(now: number) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

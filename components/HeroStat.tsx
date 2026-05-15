"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-viewport "killer stat" section.
 * 121 releases in 13 months. Up from quarterly.
 * Number counts up on viewport entry. Supporting text and rules fade in sequentially.
 */
export function HeroStat() {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"idle" | "counting" | "done">("idle");
  const numberRef = useRef<HTMLSpanElement>(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    const el = numberRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          observer.disconnect();
          setPhase("counting");

          const target = 121;
          const duration = 1200;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setCount(Math.round(eased * target));
            if (t < 1) {
              requestAnimationFrame(tick);
            } else {
              setPhase("done");
            }
          }
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const contextVisible = phase === "done";
  const rulesVisible = phase === "done";

  return (
    <section
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 py-[12vh]"
      style={{ background: "var(--gl-bg-gradient)" }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(255,131,0,0.06)] blur-[120px]" />
      </div>

      <div className="relative z-[1] text-center">
        {/* The number */}
        <div className="flex items-end justify-center gap-1">
          <span
            ref={numberRef}
            className="font-sans font-extrabold leading-none text-[#FF8300]"
            style={{ fontSize: "clamp(6rem, 18vw, 10rem)" }}
          >
            {count}
          </span>
        </div>

        {/* Context lines - fade in 400ms after counter finishes */}
        <div
          className="mt-4 transition-all duration-500"
          style={{
            opacity: contextVisible ? 1 : 0,
            transform: contextVisible ? "translateY(0)" : "translateY(8px)",
            transitionDelay: contextVisible ? "0ms" : "0ms",
          }}
        >
          <p className="font-sans text-[clamp(1.25rem,3vw,1.75rem)] font-bold text-white">
            releases in 13 months.
          </p>
          <p className="mt-2 font-sans text-[clamp(1.1rem,2.5vw,1.5rem)] font-semibold text-[#D1C1FF]">
            Up from quarterly.
          </p>
        </div>

        {/* Horizontal rules + context - fade in 200ms after context */}
        <div
          className="mt-10 transition-all duration-500"
          style={{
            opacity: rulesVisible ? 1 : 0,
            transform: rulesVisible ? "translateY(0)" : "translateY(8px)",
            transitionDelay: rulesVisible ? "200ms" : "0ms",
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-[rgba(209,193,255,0.3)]" />
            <p className="font-body text-[0.875rem] font-semibold uppercase tracking-[0.2em] text-[rgba(209,193,255,0.6)]">
              Same team. No new headcount.
            </p>
            <span className="h-px w-12 bg-[rgba(209,193,255,0.3)]" />
          </div>
          <p className="mt-4 font-body text-[0.8rem] font-normal text-[rgba(209,193,255,0.4)]">
            DORA Elite tier - 4.3 day mean lead time
          </p>
        </div>
      </div>
    </section>
  );
}

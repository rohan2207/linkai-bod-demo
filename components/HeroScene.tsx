"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { createTimeline, stagger } from "animejs";
import { HERO_COPY, STORY_SCENE_VH } from "@/lib/flywheelData";
import { smoothstep01 } from "@/lib/animationUtils";

type HeroSceneProps = {
  progress: number;
};

export function HeroScene({ progress }: HeroSceneProps) {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const words = useMemo(
    () =>
      `${HERO_COPY.headlinePrefix} in the ${HERO_COPY.headlineEmphasis} ${HERO_COPY.headlineSuffix}`
        .split(" ")
        .filter(Boolean),
    [],
  );

  useLayoutEffect(() => {
    const nodes = wordRefs.current.filter(Boolean);
    if (!nodes.length) return;
    const tl = createTimeline({ defaults: { ease: "out(3)" } });
    tl.add(nodes, {
      opacity: [0, 1],
      y: [22, 0],
      rotateX: [16, 0],
      duration: 760,
      delay: stagger(45),
    });
    return () => {
      tl.revert();
    };
  }, []);

  const p = smoothstep01(progress);

  return (
    <section className="relative" style={{ minHeight: `${STORY_SCENE_VH.hero}vh` }}>
      <div className="sticky top-0 min-h-[100dvh] overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 70% 30%, rgba(98,62,221,.2) 0%, transparent 70%),
              radial-gradient(ellipse 50% 50% at 20% 80%, rgba(213,81,201,.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 90% 90%, rgba(255,131,0,.08) 0%, transparent 60%),
              #0c0916`,
          }}
        />
        <div
          className="absolute -right-[5%] -top-[10%] h-[520px] w-[520px] rounded-full bg-[rgba(98,62,221,.14)] blur-[90px]"
          style={{ transform: `translate3d(0, ${-p * 44}px, 0) scale(${1 + p * 0.07})` }}
        />
        <div
          className="absolute right-[30%] top-[40%] h-[320px] w-[320px] rounded-full bg-[rgba(213,81,201,.10)] blur-[85px]"
          style={{ transform: `translate3d(0, ${-p * 26}px, 0)` }}
        />
        <div
          className="absolute bottom-[10%] left-[15%] h-[260px] w-[260px] rounded-full bg-[rgba(255,131,0,.08)] blur-[80px]"
          style={{ transform: `translate3d(0, ${-p * 14}px, 0)` }}
        />
        <div className="relative z-[1] flex min-h-[100dvh] flex-col justify-end px-6 pb-[10vh] pt-24 md:px-[8vw]">
          <p className="mb-8 text-[0.68rem] uppercase tracking-[0.28em] text-[var(--mu)]">{HERO_COPY.eyebrow}</p>
          <h1
            className="max-w-[900px] font-serif text-[clamp(3.2rem,7vw,7.6rem)] font-light leading-[0.95] tracking-tight"
            style={{ transform: `translate3d(0, ${p * -28}px, 0) scale(${1 - p * 0.05})`, opacity: 1 - p * 0.35 }}
          >
            {words.map((word, i) => {
              const clean = word.replace(/[^\w]/g, "").toLowerCase();
              const isEmphasis = clean === "age" || clean === "ai";
              return (
                <span
                  key={`${word}-${i}`}
                  ref={(node) => {
                    wordRefs.current[i] = node;
                  }}
                  className={`inline-block pr-[0.32ch] ${isEmphasis ? "bg-gradient-to-br from-white via-pp to-pa bg-clip-text text-transparent" : ""}`}
                  style={{ opacity: 0, transform: "translate3d(0,22px,0)" }}
                >
                  {word}
                </span>
              );
            })}
          </h1>
          <p className="mt-12 max-w-[520px] text-base font-light leading-relaxed text-[rgba(240,236,255,0.72)]">{HERO_COPY.body}</p>
          <div className="absolute bottom-12 right-6 z-[1] flex flex-col items-center gap-2 opacity-40 md:right-16">
            <ArrowDown className="size-3.5" strokeWidth={1.5} />
            <span className="text-[0.6rem] uppercase tracking-[0.2em]">Scroll</span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";
import { STORY_FLY_THROUGH_WORDS, STORY_PIVOT_COPY, STORY_SCENE_VH } from "@/lib/flywheelData";
import { smoothstep01 } from "@/lib/animationUtils";

type TextFlywheelTransitionProps = {
  progress: number;
};

export function TextFlywheelTransition({ progress }: TextFlywheelTransitionProps) {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const words = wordRefs.current.filter(Boolean);
    if (!words.length) return;
    const tl = createTimeline({ defaults: { ease: "out(4)" } });
    tl.add(words, {
      opacity: [0, 1],
      y: [20, 0],
      duration: 540,
      delay: stagger(55),
    });
    return () => {
      tl.revert();
    };
  }, []);

  useEffect(() => {
    const words = wordRefs.current;
    const stage = stageRef.current;
    const p = smoothstep01(progress);
    for (let i = 0; i < words.length; i++) {
      const node = words[i];
      if (!node) continue;
      const dir = i % 2 === 0 ? 1 : -1;
      const offset = (i - words.length / 2) * 8;
      const z = -520 * p + i * 6;
      const x = dir * p * (40 + Math.abs(offset) * 0.45);
      const r = dir * p * 18;
      node.style.transform = `translate3d(${x}px, ${-10 * p}px, ${z}px) rotateY(${r}deg)`;
      node.style.opacity = String(Math.max(0, 1 - p * 1.18));
      node.style.filter = `blur(${Math.max(0, p * 4 - 0.8)}px)`;
    }
    if (stage) {
      stage.style.transform = `translate3d(0, ${-p * 22}px, 0)`;
      stage.style.opacity = String(Math.max(0.25, 1 - p * 0.65));
    }
  }, [progress]);

  const p = smoothstep01(progress);

  return (
    <section className="relative border-y border-[var(--ln)]" style={{ minHeight: "100vh" }}>
      <div className="sticky top-0 flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 md:px-[8vw]">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(98,62,221,0.08)] to-[rgba(213,81,201,0.04)]" />
        <div ref={stageRef} className="relative z-[2] max-w-[980px] text-center [perspective:1300px] [transform-style:preserve-3d]">
          <p className="mb-8 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-pp">{STORY_PIVOT_COPY.eyebrow}</p>
          <blockquote className="font-sans text-[clamp(1.9rem,4vw,2.8rem)] font-bold italic leading-tight text-[#D1C1FF] [transform-style:preserve-3d]">
            {STORY_FLY_THROUGH_WORDS.map((word, i) => (
              <span
                key={`${word}-${i}`}
                ref={(node) => {
                  wordRefs.current[i] = node;
                }}
                className="inline-block px-[0.22ch] will-change-transform"
                style={{ opacity: 0, transform: "translate3d(0,20px,0)" }}
              >
                {word}
              </span>
            ))}
          </blockquote>
          <p className="mx-auto mt-8 max-w-[620px] font-body text-[1.125rem] font-normal leading-relaxed text-[rgba(209,193,255,0.58)]">{STORY_PIVOT_COPY.body}</p>
        </div>

        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[min(36vw,360px)] w-[min(36vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-[radial-gradient(circle,rgba(98,62,221,.42)_0%,rgba(12,9,22,.8)_58%,transparent_72%)]"
          style={{
            transform: `translate(-50%, -50%) scale(${0.32 + p * 0.8})`,
            opacity: Math.max(0, p * 1.3 - 0.25),
            filter: `drop-shadow(0 0 ${18 + p * 30}px rgba(155,109,255,${0.28 + p * 0.35}))`,
          }}
        />
      </div>
    </section>
  );
}

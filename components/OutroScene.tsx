"use client";

import { useLayoutEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";
import { LogoMark } from "@/components/LogoMark";
import { OUTRO_COPY, STORY_SCENE_VH } from "@/lib/flywheelData";
import { smoothstep01 } from "@/lib/animationUtils";

type OutroSceneProps = {
  progress: number;
};

export function OutroScene({ progress }: OutroSceneProps) {
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useLayoutEffect(() => {
    const lines = lineRefs.current.filter(Boolean);
    if (!lines.length) return;
    const tl = createTimeline({ defaults: { ease: "out(4)" } });
    tl.add(lines, { opacity: [0, 1], y: [8, 0], duration: 500, delay: stagger(130) });
    return () => {
      tl.revert();
    };
  }, []);

  const p = smoothstep01(progress);

  return (
    <section className="relative" style={{ minHeight: `${STORY_SCENE_VH.outro}vh` }}>
      <div className="sticky top-0 flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 py-[12vh] text-center md:px-[8vw]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_50%,rgba(98,62,221,0.2),rgba(213,81,201,0.08)_50%,transparent_78%)]" />
        <div className="relative z-[1] flex max-w-[760px] flex-col items-center">
          <div
            className="mb-16 w-[240px]"
            style={{
              transform: `translate3d(0, ${28 * (1 - p)}px, 0) scale(${0.82 + p * 0.26}) rotate(${(1 - p) * -2}deg)`,
              opacity: 0.35 + p * 0.65,
              filter: `drop-shadow(0 0 ${10 + p * 16}px rgba(155,109,255,.25))`,
            }}
          >
            <LogoMark className="h-auto w-full" />
          </div>

          <p
            ref={(node) => {
              lineRefs.current[0] = node;
            }}
            className="mb-10 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[var(--mu)]"
            style={{ opacity: 0 }}
          >
            {OUTRO_COPY.eyebrow}
          </p>

          <blockquote className="font-sans text-[clamp(2rem,4vw,2.8rem)] font-bold leading-tight text-[#D1C1FF]">
            {OUTRO_COPY.statement.map((line, i) => (
              <p
                key={line}
                ref={(node) => {
                  lineRefs.current[i + 1] = node;
                }}
                style={{ opacity: 0 }}
              >
                {line}
              </p>
            ))}
          </blockquote>

          <p
            ref={(node) => {
              lineRefs.current[4] = node;
            }}
            className="mt-8 font-body text-[1.25rem] font-semibold text-[#D1C1FF]"
            style={{ opacity: 0 }}
          >
            121 releases. One team.
          </p>

          <p
            ref={(node) => {
              lineRefs.current[5] = node;
            }}
            className="mt-12 font-body text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-[rgba(209,193,255,0.25)]"
            style={{ opacity: 0 }}
          >
            {OUTRO_COPY.footer}
          </p>
        </div>
      </div>
    </section>
  );
}

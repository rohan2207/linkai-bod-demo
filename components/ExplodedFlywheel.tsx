"use client";

import { useLayoutEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";
import { FlywheelSvg } from "@/components/FlywheelSvg";
import { FLYWHEEL_STEPS } from "@/lib/flywheelData";
import { smoothstep01 } from "@/lib/animationUtils";

type ExplodedFlywheelProps = {
  progress: number;
  activeIndex: number;
  /** Index of the incoming step during a cross-fade. Same as activeIndex when not transitioning. */
  nextIndex: number;
  /** 0 = activeIndex fully highlighted, 1 = nextIndex fully highlighted. */
  blend: number;
};

const CARD_ANGLES = FLYWHEEL_STEPS.map((_, i) => (i / FLYWHEEL_STEPS.length) * Math.PI * 2 - Math.PI / 2);

export function ExplodedFlywheel({ progress, activeIndex, nextIndex, blend }: ExplodedFlywheelProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wheelWrapRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    const wrap = wheelWrapRef.current;
    const tl = createTimeline({ defaults: { ease: "cubicBezier(0.16,1,0.3,1)" } });
    if (wrap) {
      tl.add(wrap, { opacity: [0, 1], scale: [0.92, 1], y: [12, 0], duration: 500 });
    }
    if (cards.length) {
      tl.add(cards, { opacity: [0, 1], y: [8, 0], duration: 300, delay: stagger(60) }, 70);
    }
    readyRef.current = true;
    return () => {
      tl.revert();
    };
  }, []);

  const intro = smoothstep01(progress < 0.38 ? progress / 0.38 : 1);
  const explode = smoothstep01(progress < 0.68 ? (progress - 0.24) / 0.44 : 1);
  const collapse = smoothstep01(progress < 0.82 ? 0 : (progress - 0.82) / 0.18);
  const spread = explode * (1 - collapse);
  const radius = 210 * spread;
  const depth = 120 * spread;

  return (
    <div className="relative h-[min(88vh,860px)] w-full [perspective:1400px] [transform-style:preserve-3d]">
      <div
        ref={wheelWrapRef}
        className="absolute left-1/2 top-1/2 z-[6] w-[min(84vw,500px)] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          transform: `translate3d(-50%, -50%, ${90 * intro}px) scale(${0.72 + intro * 0.42}) rotate(${progress * -32}deg)`,
          filter: `drop-shadow(0 0 ${18 + intro * 30}px rgba(155,109,255,.35))`,
          opacity: readyRef.current ? 1 : undefined,
        }}
      >
        <div className="rounded-[28px] border border-white/[0.08] bg-[rgba(12,9,22,0.42)] p-3 shadow-[0_0_70px_rgba(98,62,221,0.18)] backdrop-blur-md md:p-4">
          <FlywheelSvg
            activeIndex={blend > 0.5 ? nextIndex : activeIndex}
            className="h-auto w-full"
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[7]">
        {FLYWHEEL_STEPS.map((step, i) => {
          const angle = CARD_ANGLES[i];
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius * 0.7;
          const z = depth - i * 8;
          const drift = (i % 2 === 0 ? 1 : -1) * Math.sin(progress * Math.PI * 5 + i) * 7 * spread;
          // Continuous active weight: interpolates between prev and next step highlight
          const aw =
            i === activeIndex && i === nextIndex ? 1 :           // same step, no transition
            i === activeIndex                    ? (1 - blend) :  // outgoing
            i === nextIndex                      ? blend       :  // incoming
            0;                                                     // inactive

          return (
            <div
              key={step.id}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              className="absolute left-1/2 top-1/2 min-w-[150px] max-w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/[0.12] bg-[rgba(12,9,22,0.56)] px-4 py-4 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              style={{
                transform: `translate3d(${x}px, ${y + drift}px, ${z}px) rotateY(${Math.cos(angle) * 20 * spread}deg) scale(${0.92 + spread * 0.08 + aw * 0.06})`,
                opacity: spread < 0.02 ? 0 : (0.55 + spread * 0.45) * (0.85 + aw * 0.15),
                boxShadow: aw > 0 ? `0 0 ${Math.round(36 * aw)}px ${step.color}${Math.round(68 * aw).toString(16).padStart(2, "0")}, 0 20px 60px rgba(0,0,0,0.5)` : undefined,
              }}
            >
              <span className="font-sans text-[0.6rem] font-extrabold uppercase tracking-[0.15em] text-[#FF8300]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 font-sans text-[1.1rem] font-bold text-white">{step.label}</p>
              <p className="badge-shimmer mt-2 inline-block rounded-full px-2.5 py-0.5 font-body text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[#FF8300]">AI-augmented</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

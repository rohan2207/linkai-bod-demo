"use client";

import { useLayoutEffect, useRef } from "react";
import { createTimeline, stagger } from "animejs";
import { ChartDeployLead, ChartPrThroughput, ChartTestGrowth } from "@/components/Charts";
import { OPPORTUNITY_COPY, STORY_SCENE_VH } from "@/lib/flywheelData";
import { smoothstep01 } from "@/lib/animationUtils";

type ProofChartsProps = {
  progress: number;
};

export function ProofCharts({ progress }: ProofChartsProps) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return;
    const tl = createTimeline({ defaults: { ease: "cubicBezier(0.16,1,0.3,1)" } });
    tl.add(cards, {
      opacity: [0, 1],
      y: [8, 0],
      duration: 300,
      delay: stagger(80),
    });
    return () => {
      tl.revert();
    };
  }, []);

  const p = smoothstep01(progress);

  return (
    <section className="relative border-y border-[var(--ln)] bg-[#0c0916]" style={{ minHeight: `${STORY_SCENE_VH.proof}vh` }}>
      <div className="sticky top-0 min-h-[100dvh] overflow-hidden px-6 py-[10vh] md:px-[8vw]">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(98,62,221,0.08)] via-[rgba(12,9,22,0.95)] to-[rgba(213,81,201,0.06)]" />
        <div className="relative z-[1] mx-auto max-w-[1240px]">
          <p className="mb-4 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-pp">{OPPORTUNITY_COPY.eyebrow}</p>
          <h2
            className="max-w-[900px] font-sans text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.08] tracking-tight"
            style={{ transform: `translate3d(0, ${-p * 16}px, 0)` }}
          >
            Technology now advances
            <br />
            at the speed of <span className="text-[#D1C1FF]">intelligence.</span>
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {OPPORTUNITY_COPY.pillars.map((item, i) => (
              <div
                key={item}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className="rounded-xl border border-white/[0.08] bg-[rgba(12,9,22,0.52)] p-5 font-body text-[1rem] font-normal leading-relaxed text-[rgba(240,236,255,0.82)] backdrop-blur-xl"
              >
                <p className="mb-2 font-sans text-[0.65rem] font-extrabold uppercase tracking-[0.25em] text-[#FF8300]">{String(i + 1).padStart(2, "0")}</p>
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] bg-[rgba(12,9,22,0.55)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <p className="mb-2 font-body text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[rgba(209,193,255,0.45)]">Throughput trend</p>
              <ChartPrThroughput />
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[rgba(12,9,22,0.55)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <p className="mb-2 font-body text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[rgba(209,193,255,0.45)]">Validation growth</p>
              <ChartTestGrowth />
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[rgba(12,9,22,0.55)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <p className="mb-2 font-body text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[rgba(209,193,255,0.45)]">Delivery lead time</p>
              <ChartDeployLead />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

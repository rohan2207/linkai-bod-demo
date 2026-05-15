"use client";

import { useEffect, useMemo, useState } from "react";
import { ExplodedFlywheel } from "@/components/ExplodedFlywheel";
import { StepPanel } from "@/components/FlywheelStepPanel";
import { FlywheelStoryReduced } from "@/components/FlywheelStoryReduced";
import { JourneyBefore } from "@/components/JourneyBefore";
import {
  FLYWHEEL_STEPS,
  JOURNEY_ADOPTION_LINE,
  JOURNEY_AFTER_EYEBROW,
  JOURNEY_AFTER_LINE,
  STORY_SCENE_VH,
} from "@/lib/flywheelData";
import { clamp01, remap, smoothstep01 } from "@/lib/animationUtils";

type FlywheelStoryProps = {
  progress: number;
};

/** Progress bands within the flywheel scene (0..1). */
const P_BEFORE_END = 0.22;
const P_MORPH_END  = 0.32;
const P_DOCK_START = 0.52;
const P_DOCK_END   = 1.0;

/**
 * Fraction of each step's dockProgress band used as the cross-fade
 * transition window. During this window blend goes 0→1 via smoothstep,
 * driving both the outgoing and incoming panel opacity simultaneously.
 * Identical physics to the line-to-circle morph.
 */
const BLEND_WINDOW = 0.14;

export function FlywheelStory({ progress }: FlywheelStoryProps) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const beforeProgress = remap(progress, 0, P_MORPH_END);
  const introProgress  = smoothstep01(remap(progress, P_MORPH_END, P_DOCK_START + 0.04));
  const dockProgress   = smoothstep01(remap(progress, P_DOCK_START - 0.04, P_DOCK_END));

  const showBefore = progress < P_MORPH_END + 0.01;
  const docked     = progress > P_DOCK_START;

  // Build cumulative weight table once
  const stepBoundaries = useMemo(() => {
    const weights = FLYWHEEL_STEPS.map((s) => s.scrollWeight ?? 1);
    const tw = weights.reduce((a, b) => a + b, 0);
    let cum = 0;
    return weights.map((w) => {
      const start = cum / tw;
      cum += w;
      return { start, end: cum / tw };
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // SCROLL-SCRUBBED step derivation — no useState, no discrete snap.
  // All values are pure math derived on every scroll frame.
  // ─────────────────────────────────────────────────────────────────

  // stepIndex: which step band dockProgress currently sits in
  let stepIndex = 0;
  for (let i = stepBoundaries.length - 1; i >= 0; i--) {
    if (dockProgress >= stepBoundaries[i].start) { stepIndex = i; break; }
  }

  const bandEnd    = stepBoundaries[stepIndex].end;
  const blendStart = bandEnd - BLEND_WINDOW;

  // blend: 0 = showing prevStep fully, 1 = showing nextStep fully
  const blend = smoothstep01(remap(dockProgress, blendStart, bandEnd));

  const prevStep = stepIndex;
  const nextStep = Math.min(stepIndex + 1, FLYWHEEL_STEPS.length - 1);

  // frameProgress: 0→1 within prevStep's content zone (before blend window)
  const frameProgress = clamp01(
    remap(dockProgress, stepBoundaries[stepIndex].start, Math.max(stepBoundaries[stepIndex].start + 0.001, blendStart)),
  );

  // For display indicators, show nextStep as "active" once blend crosses midpoint
  const displayStep = blend > 0.5 ? nextStep : prevStep;

  if (reduced) return <FlywheelStoryReduced />;

  // Opacity layers
  const beforeLayerOpacity = showBefore ? 1 : Math.max(0, 1 - (progress - P_MORPH_END) * 22);
  const wheelLayerOpacity  = Math.max(0, Math.min(1, (progress - 0.37) / 0.10));
  const afterHeaderOpacity = Math.max(
    0,
    Math.min(1, (progress - 0.35) / 0.08) * (1 - smoothstep01(remap(progress, P_DOCK_START - 0.04, P_DOCK_END)) * 0.5),
  );

  return (
    <section className="relative bg-[#0A0620]" style={{ minHeight: `${STORY_SCENE_VH.flywheel}vh` }}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(98,62,221,0.14),transparent_74%)]" />

        {/* BEFORE → morph layer */}
        <div
          className="absolute inset-0 z-[10] flex items-center justify-center px-6 md:px-[8vw]"
          style={{ opacity: beforeLayerOpacity, pointerEvents: showBefore ? "auto" : "none" }}
        >
          <JourneyBefore progress={beforeProgress} />
        </div>

        {/* AFTER (wheel + docked story) */}
        <div
          className="relative z-[20] mx-auto flex h-full w-full max-w-[1700px] flex-col px-6 pb-6 pt-16 md:px-[8vw] md:pt-20"
          style={{ opacity: wheelLayerOpacity }}
        >
          {!docked ? (
            <div
              className="mx-auto max-w-[820px] flex-shrink-0 text-center transition-opacity duration-300"
              style={{ opacity: afterHeaderOpacity }}
            >
              <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#D551C9]">{JOURNEY_AFTER_EYEBROW}</p>
              <p className="mt-3 font-sans text-[clamp(1.35rem,2.5vw,2rem)] font-bold leading-snug text-[#D1C1FF]">{JOURNEY_AFTER_LINE}</p>
              <p className="mx-auto mt-4 max-w-[620px] font-body text-[1rem] font-normal text-[rgba(209,193,255,0.62)]">{JOURNEY_ADOPTION_LINE}</p>
            </div>
          ) : null}

          <div
            className={`mt-6 flex min-h-0 flex-1 flex-col gap-6 transition-all duration-500 md:mt-4 md:gap-10 ${docked ? "md:grid md:grid-cols-[minmax(260px,1fr)_minmax(0,3fr)] md:items-stretch" : "items-center justify-center"}`}
          >
            <div className="relative flex min-h-[40vh] w-full items-center justify-center md:min-h-0">
              <ExplodedFlywheel
                progress={introProgress}
                activeIndex={prevStep}
                nextIndex={nextStep}
                blend={blend}
              />
            </div>

            <div
              className={`relative flex min-h-0 w-full flex-col justify-center transition-all duration-500 ${docked ? "opacity-100 md:pl-4" : "pointer-events-none opacity-0 md:translate-x-16"}`}
            >
              <div className="w-full max-w-xl md:max-w-none md:pr-4">
                <StepPanel
                  prevIndex={prevStep}
                  nextIndex={nextStep}
                  blend={blend}
                  visible={docked}
                  compact={docked}
                  frameProgress={frameProgress}
                />
              </div>
            </div>
          </div>

          {docked ? (
            <div className="mt-3 flex justify-center gap-1.5 md:mt-4">
              {Array.from({ length: FLYWHEEL_STEPS.length }).map((_, i) => (
                <span
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === displayStep ? "24px" : "6px",
                    background: i === displayStep ? "#D551C9" : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export { FlywheelStoryReduced };
export { StepPanel };

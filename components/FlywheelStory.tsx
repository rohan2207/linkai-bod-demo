"use client";

import { createTimeline, stagger } from "animejs";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
const P_BEFORE_END = 0.22; // sequential timeline drawing
const P_MORPH_END = 0.32; // line bends into a loop
const P_DOCK_START = 0.52; // dock left + step 0 visible
const P_DOCK_END = 1.0;

export function FlywheelStory({ progress }: FlywheelStoryProps) {
  const [reduced, setReduced] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const beforeProgress = remap(progress, 0, P_MORPH_END);
  const introProgress = smoothstep01(remap(progress, P_MORPH_END, P_DOCK_START + 0.04));
  const dockProgress = smoothstep01(remap(progress, P_DOCK_START - 0.04, P_DOCK_END));

  const showBefore = progress < P_MORPH_END + 0.01;
  const docked = progress > P_DOCK_START;

  // Build cumulative weight table for weighted step advancement
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

  const nextStep = useMemo(() => {
    if (progress < P_DOCK_START) return 0;
    // Find which step we're in based on weighted boundaries
    for (let i = stepBoundaries.length - 1; i >= 0; i--) {
      if (dockProgress >= stepBoundaries[i].start - 0.001) return i;
    }
    return 0;
  }, [dockProgress, progress, stepBoundaries]);

  // frameProgress: 0→1 within the current step's scroll budget
  const frameProgress = useMemo(() => {
    if (!stepBoundaries[activeStep]) return 0;
    const { start, end } = stepBoundaries[activeStep];
    return clamp01(remap(dockProgress, start, end));
  }, [dockProgress, activeStep, stepBoundaries]);

  useEffect(() => {
    if (nextStep !== activeStep) setActiveStep(nextStep);
  }, [activeStep, nextStep]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const layers = Array.from(panel.querySelectorAll("[data-step-layer]"));
    if (!layers.length) return;
    const tl = createTimeline({ defaults: { ease: "cubicBezier(0.16,1,0.3,1)" } });
    tl.add(layers, {
      opacity: [0, 1],
      y: [8, 0],
      duration: 300,
      delay: stagger(80),
    });
    return () => {
      tl.revert();
    };
  }, [activeStep]);

  if (reduced) return <FlywheelStoryReduced />;

  // JourneyBefore fades out fast once morph is done — completely gone by ~0.37
  const beforeLayerOpacity = showBefore ? 1 : Math.max(0, 1 - (progress - P_MORPH_END) * 22);

  // Wheel only starts fading IN after JourneyBefore has cleared (~0.37)
  const wheelLayerOpacity = Math.max(0, Math.min(1, (progress - 0.37) / 0.10));

  // AFTER text: fades in brightly right after morph, holds well into docking
  const afterHeaderOpacity = Math.max(
    0,
    Math.min(1, (progress - 0.35) / 0.08) * (1 - dockProgress * 0.5),
  );

  return (
    <section className="relative bg-[#0c0916]" style={{ minHeight: `${STORY_SCENE_VH.flywheel}vh` }}>
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(98,62,221,0.14),transparent_74%)]" />

        {/* BEFORE → morph layer (sequential timeline, fades into wheel) */}
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
              <ExplodedFlywheel progress={introProgress} activeIndex={activeStep} />
            </div>

            <div
              ref={panelRef}
              className={`relative flex min-h-0 w-full flex-col justify-center transition-all duration-500 ${docked ? "opacity-100 md:pl-4" : "pointer-events-none opacity-0 md:translate-x-16"}`}
            >
              <div className="w-full max-w-xl md:max-w-none md:pr-4">
                <StepPanel index={activeStep} visible={docked} compact={docked} frameProgress={frameProgress} />
              </div>
            </div>
          </div>

          {docked ? (
            <div className="mt-3 flex justify-center gap-1.5 md:mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 w-6 rounded-full transition-colors duration-300 ${i === activeStep ? "bg-[#D551C9]" : "bg-white/10"}`}
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

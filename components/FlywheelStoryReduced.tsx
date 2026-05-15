"use client";

import { FlywheelSvg } from "@/components/FlywheelSvg";
import { StepPanel } from "@/components/FlywheelStepPanel";
import { FLYWHEEL_STEPS } from "@/lib/flywheelData";

/** Reduced motion: readable linear story without pinned scrub */
export function FlywheelStoryReduced() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0c0916] py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#D551C9]">LinkAI flywheel</p>
        <h2 className="mt-4 font-sans text-4xl font-light text-white md:text-5xl">How we build now</h2>
        <p className="mt-4 max-w-2xl text-sm font-light text-[rgba(209,193,255,0.55)]">
          Each spoke pairs a role with AI tools and measurable velocity. (Animations reduced for accessibility.)
        </p>
        <div className="mx-auto mt-16 flex max-w-md justify-center">
          <div className="w-[min(100%,380px)]">
            <FlywheelSvg activeIndex={0} className="h-auto w-full" />
          </div>
        </div>
        <div className="mt-20 space-y-24">
          {FLYWHEEL_STEPS.map((_, i) => (
            <StepPanel key={FLYWHEEL_STEPS[i].id} prevIndex={i} nextIndex={i} blend={0} visible />
          ))}
        </div>
      </div>
    </section>
  );
}

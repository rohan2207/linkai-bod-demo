"use client";

import { AssetStage } from "@/components/AssetStage";
import { MetricCard } from "@/components/MetricCard";
import { ChartDeployLead, ChartPrThroughput, ChartTestGrowth } from "@/components/Charts";
import { HumanAiSplit } from "@/components/HumanAiSplit";
import { FrameSequence } from "@/components/FrameSequence";
import { ValidateFrame1, ValidateFrame2 } from "@/components/ValidateFrames";
import { BuildFrame1, BuildFrame2 } from "@/components/BuildFrames";
import { FLYWHEEL_STEPS, type FlywheelFrame } from "@/lib/flywheelData";
import { cn } from "@/lib/cn";

const BUILD_FRAMES: FlywheelFrame[] = [
  {
    component: <BuildFrame1 />,
    headline: "More releases. Smaller changes.",
    caption: "As shipping frequency went up, average diff size came down. The scissors crossed in late 2025.",
  },
  {
    component: <BuildFrame2 />,
    headline: "The verdict: DORA Elite.",
    caption: "4.3 days mean lead time. 121 production deploys. Top tier by any measure.",
  },
];

const VALIDATE_FRAMES: FlywheelFrame[] = [
  {
    component: <ValidateFrame1 />,
    headline: "The scale of the shift.",
    caption: "Nov 2025 vs May 2026 - every number changed by an order of magnitude.",
  },
  {
    component: <ValidateFrame2 />,
    headline: "+690% in six months.",
    caption: "30 test files to 237. Quality scaled with the team, not against it.",
  },
];

type StepPanelProps = {
  /** Index of the outgoing (fully visible) step. */
  prevIndex: number;
  /** Index of the incoming (fading in) step. */
  nextIndex: number;
  /**
   * Scroll-scrubbed blend value: 0 = prevIndex fully visible,
   * 1 = nextIndex fully visible. Driven directly by scroll position,
   * identical physics to the line-to-circle morph.
   */
  blend: number;
  visible: boolean;
  compact?: boolean;
  /** 0→1 within prevIndex's content zone for FrameSequence. */
  frameProgress?: number;
};

export function StepPanel({
  prevIndex,
  nextIndex,
  blend,
  visible,
  compact = false,
  frameProgress = 0,
}: StepPanelProps) {
  const prevStep = FLYWHEEL_STEPS[prevIndex];
  const nextStep = FLYWHEEL_STEPS[nextIndex];
  if (!prevStep) return null;

  if (!compact) {
    // Prose fallback (reduced motion / non-docked) — only show prevStep
    return <ProsePanel step={prevStep} visible={visible} />;
  }

  const showBoth = prevIndex !== nextIndex && !!nextStep;

  return (
    <div
      className={cn(
        "relative w-full",
        visible ? "pointer-events-auto" : "pointer-events-none opacity-0",
      )}
      aria-live="polite"
    >
      {/*
       * Outgoing panel — ALWAYS position:relative so it sets the container
       * height. Fades out / drifts up as blend increases.
       */}
      <div
        style={{
          opacity: 1 - blend,
          transform: `translateY(${blend * -6}px)`,
          pointerEvents: blend > 0.5 ? "none" : "auto",
          willChange: "opacity, transform",
        }}
      >
        <SlidePanel step={prevStep} frameProgress={frameProgress} />
      </div>

      {/*
       * Incoming panel — ALWAYS position:absolute so it never pushes layout.
       * Pre-mounted whenever the indices differ (not gated on blend > 0) so
       * there is zero mount-cost at transition start.
       */}
      {showBoth ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: blend,
            transform: `translateY(${(1 - blend) * 8}px)`,
            pointerEvents: blend <= 0.5 ? "none" : "auto",
            willChange: "opacity, transform",
          }}
        >
          <SlidePanel step={nextStep!} frameProgress={0} />
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPACT SLIDE — one step's content, no opacity logic (parent drives that)  */
/* -------------------------------------------------------------------------- */

function SlidePanel({
  step,
  frameProgress,
}: {
  step: (typeof FLYWHEEL_STEPS)[number];
  frameProgress: number;
}) {
  const accent = step.color;
  const hasChart = step.chart && step.chart !== "none";
  const headline = step.tagline ?? step.title.replace(/\n/g, " ");

  const resolvedFrames: FlywheelFrame[] =
    step.id === "build"    ? BUILD_FRAMES    :
    step.id === "validate" ? VALIDATE_FRAMES :
    (step.frames ?? []);
  const hasFrames = resolvedFrames.length > 0;

  return (
    <article className="flex w-full flex-col gap-5">
      <div className="flex items-center gap-3">
        <p className="font-sans text-[0.75rem] font-extrabold uppercase tracking-[0.32em] text-[#FF8300]">
          {step.eyebrow}
        </p>
        <span className="badge-shimmer rounded-full px-2.5 py-0.5 font-sans text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#FF8300]">
          AI-augmented
        </span>
        <span
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, ${accent}66, ${accent}1a, transparent)`,
          }}
        />
      </div>

      <h2 className="font-sans text-[clamp(1.65rem,2.7vw,2.5rem)] font-bold leading-[1.08] tracking-tight text-white">
        {headline}
      </h2>

      {hasFrames ? (
        <FrameSequence frames={resolvedFrames} progress={frameProgress} accent={accent} />
      ) : step.bullets?.length ? (
        <ul className="flex flex-col gap-2.5">
          {step.bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 font-body text-[1rem] font-medium leading-snug text-white"
            >
              <span
                className="mt-[0.55rem] size-1.5 shrink-0 rounded-full"
                style={{ background: accent, boxShadow: `0 0 10px ${accent}99` }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {!hasFrames && step.humanAi ? (
        <HumanAiSplit data={step.humanAi} />
      ) : !hasFrames && hasChart ? (
        <div className="rounded-lg border border-white/[0.06] bg-[rgba(12,9,22,0.55)] p-3">
          {step.chart === "pr"     ? <ChartPrThroughput compact /> : null}
          {step.chart === "tests"  ? <ChartTestGrowth compact />   : null}
          {step.chart === "deploy" ? <ChartDeployLead compact />   : null}
          {step.legend?.length ? (
            <div className="mt-1 flex flex-wrap gap-3 text-[0.62rem] text-[rgba(209,193,255,0.45)]">
              {step.legend.map((leg) => (
                <div key={leg.text} className="flex items-center gap-2">
                  {leg.type === "dot"  ? <span className="size-2 shrink-0 rounded-full" style={{ background: leg.color }} /> : null}
                  {leg.type === "line" ? <span className="h-0.5 w-4 shrink-0 rounded-sm" style={{ background: leg.color }} /> : null}
                  {leg.type === "dash" ? <span className="w-4 shrink-0 border-t border-dashed border-[rgba(209,193,255,0.25)]" /> : null}
                  <span>{leg.text}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="font-body text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[rgba(209,193,255,0.4)]">
          Stack
        </span>
        <span className="h-px w-4 bg-[rgba(209,193,255,0.18)]" />
        {step.tools.map((t) => (
          <span
            key={t}
            className="rounded-sm border px-2 py-0.5 font-body text-[0.65rem] font-semibold uppercase tracking-[0.16em]"
            style={{
              borderColor: `${accent}40`,
              color: "rgba(240,236,255,0.78)",
              background: `${accent}10`,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* PROSE FALLBACK — reduced-motion / non-compact contexts                      */
/* -------------------------------------------------------------------------- */

function ProsePanel({
  step,
  visible,
}: {
  step: (typeof FLYWHEEL_STEPS)[number];
  visible: boolean;
}) {
  const hasChart = step.chart && step.chart !== "none";

  return (
    <article
      className={cn(
        "w-full max-w-xl space-y-4 md:max-w-none",
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3">
        <p className="text-[0.6rem] font-medium uppercase tracking-[0.28em] text-[#D551C9]">
          {step.eyebrow}
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-[rgba(213,81,201,0.5)] via-[rgba(213,81,201,0.18)] to-transparent" />
      </div>

      <h2 className="text-3xl font-light leading-[1.08] tracking-tight text-white sm:text-4xl">
        {step.title.split("\n").map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 ? <br /> : null}
          </span>
        ))}
      </h2>

      <p className="max-w-xl text-sm font-light leading-relaxed text-[rgba(240,236,255,0.85)]">
        {step.lead}
      </p>

      {step.humanAi ? (
        <HumanAiSplit data={step.humanAi} />
      ) : (
        <div className="flex gap-3 rounded-md border border-white/[0.08] bg-gradient-to-br from-[rgba(98,62,221,0.12)] to-[rgba(213,81,201,0.06)] p-4">
          <div className="w-0.5 shrink-0 rounded-sm bg-gradient-to-b from-[#623EDD] to-[#D551C9]" />
          <div className="min-w-0">
            <p className="mb-0.5 text-[0.55rem] font-medium uppercase tracking-[0.22em] text-[#F7B334]">
              {step.personaRole} - <span className="text-white/90">{step.personaName}</span>
            </p>
            <p className="text-[0.82rem] font-light leading-snug text-[rgba(240,236,255,0.78)]">
              {step.personaLine}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {step.metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {hasChart ? (
        <div className="rounded-lg border border-white/[0.06] bg-[rgba(12,9,22,0.55)] p-3">
          {step.chart === "pr"     ? <ChartPrThroughput /> : null}
          {step.chart === "tests"  ? <ChartTestGrowth />   : null}
          {step.chart === "deploy" ? <ChartDeployLead />   : null}
        </div>
      ) : (
        <AssetStage
          url={step.assetPath}
          browserUrl={step.browserUrl}
          placeholderLabel={step.placeholderLabel}
          accent={step.color}
        />
      )}

      <div className="flex flex-wrap gap-1.5">
        {step.tools.map((t) => (
          <span
            key={t}
            className="border border-white/[0.12] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.14em] text-[rgba(209,193,255,0.45)]"
          >
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

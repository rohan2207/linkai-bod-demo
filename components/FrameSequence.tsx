"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import type { FlywheelFrame } from "@/lib/flywheelData";
import { clamp01, remap } from "@/lib/animationUtils";

type Props = {
  frames: FlywheelFrame[];
  /** 0→1 over the scroll budget allocated to this step */
  progress: number;
  accent: string;
};

/**
 * Renders frames one at a time driven by scroll progress.
 * Each frame occupies a 1/N slice of the progress range.
 * – Enters with a subtle scale + fade from below
 * – Stays fully visible while in its window
 * – Fades out at the top of its window as the next frame enters
 */
export function FrameSequence({ frames, progress, accent }: Props) {
  const n = frames.length;

  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Compute per-frame opacity/transform imperatively so they're GPU-driven
  useLayoutEffect(() => {
    if (!n) return;
    const sliceSize = 1 / n;

    frames.forEach((_, i) => {
      const frameStart = i * sliceSize;
      const frameEnd = (i + 1) * sliceSize;

      // Raw position within this frame's window (can exceed 0-1)
      const raw = remap(progress, frameStart, frameEnd);

      // Enter: 0→0.10 of the window (quick arrive)
      const enterT = clamp01(remap(raw, 0, 0.10));
      // Exit: 0.90→1.0 of the window — 10% (last frame never exits)
      // Hold window: 0.10–0.90 = 80% fully visible so board can read comfortably
      const exitT = i < n - 1 ? clamp01(remap(raw, 0.90, 1.0)) : 0;

      const opacity = enterT * (1 - exitT);
      const translateY = (1 - enterT) * 14 - exitT * 8; // enter from below, exit up
      const scale = 0.97 + enterT * 0.03 - exitT * 0.012;
      // Lighter blur - 2px entering, 1.5px exiting
      const blur = (1 - enterT) * 2 + exitT * 1.5;

      const el = frameRefs.current[i];
      const cap = captionRefs.current[i];
      if (el) {
        el.style.opacity = String(opacity);
        el.style.transform = `translateY(${translateY}px) scale(${scale})`;
        el.style.filter = blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : "";
        el.style.pointerEvents = opacity > 0.1 ? "auto" : "none";
      }
      if (cap) {
        // Caption lags slightly behind frame for cinematic stagger
        const capEnter = clamp01(remap(raw, 0.08, 0.18));
        const capExit = i < n - 1 ? clamp01(remap(raw, 0.92, 1.0)) : 0;
        cap.style.opacity = String(capEnter * (1 - capExit));
        cap.style.transform = `translateY(${(1 - capEnter) * 10}px)`;
      }
    });
  }, [frames, progress, n]);

  // Track index for the progress indicator
  const sliceSize = n > 0 ? 1 / n : 1;
  const activeIdx = Math.min(n - 1, Math.max(0, Math.floor(progress / sliceSize)));

  if (!n) return null;

  return (
    <div className="relative w-full select-none">
      {/* Frame stack — all frames are absolute-positioned so they overlap */}
      <div className="relative w-full" style={{ aspectRatio: "16/9", minHeight: "200px" }}>
        {frames.map((frame, i) => (
          <div
            key={frame.src ?? `frame-${i}`}
            ref={(el) => { frameRefs.current[i] = el; }}
            className="absolute inset-0 will-change-transform"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            {/* Screen chrome */}
            <div
              className="relative h-full w-full overflow-hidden rounded-xl border"
              style={{
                borderColor: `${accent}33`,
                boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${accent}18, inset 0 1px 0 ${accent}22`,
              }}
            >
              {/* Browser bar */}
              <div
                className="flex h-7 shrink-0 items-center gap-2 border-b px-3"
                style={{
                  background: "rgba(10,7,20,0.92)",
                  borderColor: `${accent}22`,
                }}
              >
                <span className="size-2 rounded-full bg-[#FF5F57]" />
                <span className="size-2 rounded-full bg-[#FEBC2E]" />
                <span className="size-2 rounded-full bg-[#28C840]" />
                {frame.timestamp ? (
                  <span
                    className="ml-auto font-mono text-[0.52rem] uppercase tracking-[0.16em]"
                    style={{ color: `${accent}99` }}
                  >
                    {frame.timestamp}
                  </span>
                ) : null}
              </div>

              {/* Content — either a React component or a screenshot */}
              <div className="relative h-[calc(100%-1.75rem)] w-full overflow-hidden bg-[#0a0714]">
                {frame.component ? (
                  <div className="h-full w-full">{frame.component}</div>
                ) : frame.src ? (
                  <Image
                    src={frame.src}
                    alt={frame.headline}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority={true}
                  />
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Caption band — sits below the frame */}
      <div className="relative mt-4 min-h-[4rem]">
        {frames.map((frame, i) => (
          <div
            key={`cap-${i}`}
            ref={(el) => { captionRefs.current[i] = el; }}
            className="absolute inset-0 will-change-transform"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <p
              className="text-[1rem] font-semibold leading-tight text-white"
            >
              {frame.headline}
            </p>
            <p className="mt-1 text-[0.82rem] font-light leading-snug text-[rgba(240,236,255,0.7)]">
              {frame.caption}
            </p>
          </div>
        ))}
      </div>

      {/* Dot progress indicator */}
      <div className="mt-5 flex items-center gap-2">
        {frames.map((_, i) => (
          <span
            key={i}
            className="h-[3px] rounded-full transition-all duration-300"
            style={{
              width: i === activeIdx ? "24px" : "8px",
              background:
                i === activeIdx
                  ? accent
                  : i < activeIdx
                  ? `${accent}55`
                  : "rgba(255,255,255,0.1)",
              boxShadow: i === activeIdx ? `0 0 8px ${accent}88` : "none",
            }}
          />
        ))}
        <span className="ml-auto font-mono text-[0.58rem] tracking-widest text-[rgba(209,193,255,0.35)]">
          {activeIdx + 1} / {n}
        </span>
      </div>
    </div>
  );
}

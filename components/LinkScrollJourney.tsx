"use client";

import { useLayoutEffect, useRef, useState, useId } from "react";
import { createTimeline, onScroll } from "animejs";
import gsap from "gsap";
import { FlywheelSvg } from "@/components/FlywheelSvg";
import { StepPanel } from "@/components/FlywheelStepPanel";
import { FlywheelStoryReduced } from "@/components/FlywheelStoryReduced";
import {
  FLYWHEEL_STEPS,
  JOURNEY_ADOPTION_LINE,
  JOURNEY_AFTER_EYEBROW,
  JOURNEY_AFTER_LINE,
  JOURNEY_MORPH_CUE,
  OLD_WAY_STAGES,
} from "@/lib/flywheelData";
import { FW_CX, FW_CY, fwSegMidpoints } from "@/lib/flywheelGeometry";

/** Timeline duration (ms); scroll maps 0–1 onto this span via anime.js ScrollObserver. */
const JOURNEY_TL_MS = 10000;

const SCROLL_MULT = 9.6;

/** Global progress breakpoints (0–1) */
const P_OLD = 0.145;
const P_MORPH = 0.255;
const P_CUE = 0.295;
const P_DOCK = 0.625;

function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

function smoothstep01(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function remap(p: number, a: number, b: number) {
  return clamp01((p - a) / (b - a));
}

function MorphMiniRing({ className }: { className?: string }) {
  const raw = useId().replace(/:/g, "");
  const segs = fwSegMidpoints(FLYWHEEL_STEPS.length);
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id={`mr-${raw}-cg`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(98,62,221,.25)" />
          <stop offset="100%" stopColor="rgba(12,9,22,.92)" />
        </radialGradient>
      </defs>
        <circle cx={FW_CX} cy={FW_CY} r={36} fill={`url(#mr-${raw}-cg)`} stroke="rgba(209,193,255,.12)" strokeWidth={0.4} />
      {segs.map((g, i) => {
        const s = FLYWHEEL_STEPS[i];
        return <path key={s.id} d={g.d} fill={s.color} opacity={0.92} />;
      })}
    </svg>
  );
}

function OldWayStatic() {
  return (
    <div className="border-y border-white/[0.06] bg-[#0c0916] py-20">
      <div className="mx-auto max-w-[780px] px-6 md:px-[8vw]">
        <p className="mb-4 text-[0.62rem] font-medium uppercase tracking-[0.3em] text-red-400">Before</p>
        <h2 className="font-serif text-[clamp(2rem,4.5vw,4.2rem)] font-light leading-tight tracking-tight">
          From <em className="italic text-red-300/90">idea</em> to <em className="italic text-red-300/90">user</em>.
          <br />
          One stage at a time.
        </h2>
        <p className="mt-5 max-w-[560px] text-[0.95rem] font-light leading-relaxed text-[rgba(209,193,255,0.55)]">
          Each stage waited on the one before it. Six handoffs, six places to stall. By the time a feature reached a single user, the team had already moved on.
        </p>
        <div className="relative mb-6 mt-10 h-[120px] w-full max-md:h-[100px]">
          <div className="absolute left-[5%] right-[5%] top-[30px] h-px bg-[rgba(209,193,255,0.08)]" />
          <div
            className="absolute left-[5%] top-[30px] h-px w-[90%] origin-left bg-gradient-to-r from-red-400 via-[#D551C9] to-[#F7B334]"
          />
          <div className="absolute inset-0 flex justify-between px-[5%]">
            {OLD_WAY_STAGES.map((st) => (
              <div key={st.label} className="relative flex w-[14%] flex-col items-center">
                <div className="relative z-[2] mt-[23px] size-3.5 rounded-full border border-[rgba(213,81,201,0.55)] bg-[rgba(213,81,201,0.45)]" />
                <div className="mt-4 text-center text-[0.65rem] uppercase tracking-[0.18em] text-[rgba(240,236,255,0.9)] max-md:text-[0.55rem]">
                  <div>{st.label}</div>
                  <div className="mt-1 font-serif text-[0.6rem] italic text-[#D551C9]">{st.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[140px] max-w-[720px]">
          <p className="mb-2 text-[0.55rem] uppercase tracking-[0.25em] text-[#D551C9]">Stage 06</p>
          <h3 className="font-serif text-[clamp(1.5rem,2.6vw,2.2rem)] font-light tracking-tight">
            {OLD_WAY_STAGES[5].title}
          </h3>
          <p className="mt-3 max-w-[560px] text-[0.92rem] font-light leading-relaxed text-[rgba(209,193,255,0.62)]">
            {OLD_WAY_STAGES[5].text}
          </p>
        </div>
        <div className="mt-10 max-w-[300px]">
          <p className="text-[0.55rem] uppercase tracking-[0.28em] text-red-400/70">Total: idea → user</p>
          <p className="bg-gradient-to-br from-red-400 to-[#F7B334] bg-clip-text font-serif text-[clamp(3rem,6vw,5.5rem)] font-light leading-none text-transparent">
            12+ wks
          </p>
          <p className="mt-2 text-[0.78rem] font-light italic leading-snug text-[rgba(209,193,255,0.42)]">
            Per release. Sequential. Nothing in parallel.
          </p>
        </div>
      </div>
    </div>
  );
}

function JourneyReduced() {
  return (
    <>
      <OldWayStatic />
      <FlywheelStoryReduced />
    </>
  );
}

export function LinkScrollJourney() {
  const [reduced, setReduced] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [oldStage, setOldStage] = useState(-1);

  const journeyOuterRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const oldLayerRef = useRef<HTMLDivElement>(null);
  const flyLayerRef = useRef<HTMLDivElement>(null);
  const flyIntroRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const trackLineRef = useRef<HTMLDivElement>(null);
  const lineWrapRef = useRef<HTMLDivElement>(null);
  const nodeColRefs = useRef<(HTMLDivElement | null)[]>([]);
  const morphMiniRef = useRef<HTMLDivElement>(null);
  const morphCopyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const svgRotRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<(HTMLDivElement | null)[]>([]);
  const rightRef = useRef<HTMLDivElement>(null);

  const lastStep = useRef(-1);
  const lastOldStage = useRef(-99);
  const nodeGeom = useRef<{ cx: number; cy: number; x: number[]; y: number[] } | null>(null);
  const measured = useRef(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    if (reduced) return;
    const journey = journeyOuterRef.current;
    const sticky = stickyRef.current;
    if (!journey || !sticky) return;

    const fill = fillRef.current;
    const trackLine = trackLineRef.current;
    const oldLayer = oldLayerRef.current;
    const flyLayer = flyLayerRef.current;
    const flyIntro = flyIntroRef.current;
    const lineWrap = lineWrapRef.current;
    const morphMini = morphMiniRef.current;
    const morphCopy = morphCopyRef.current;
    const stage = stageRef.current;
    const left = leftRef.current;
    const svgBox = svgRotRef.current;
    const right = rightRef.current;
    if (!fill || !trackLine || !oldLayer || !flyLayer || !flyIntro || !lineWrap || !morphMini || !morphCopy || !stage || !left || !svgBox || !right)
      return;

    const pieces = piecesRef.current.filter(Boolean) as HTMLDivElement[];
    const angles = FLYWHEEL_STEPS.map((_, i) => (i / 6) * Math.PI * 2 - Math.PI / 2);
    const rad = () => Math.min(window.innerWidth, window.innerHeight) * 0.19;

    const measureNodes = () => {
      const wrap = lineWrapRef.current;
      if (!wrap) return;
      const wr = wrap.getBoundingClientRect();
      const xs: number[] = [];
      const ys: number[] = [];
      for (let i = 0; i < 6; i++) {
        const el = nodeColRefs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        xs.push(r.left + r.width / 2 - wr.left);
        ys.push(r.top + r.height / 2 - wr.top);
      }
      nodeGeom.current = { cx: wr.width / 2, cy: ys[0] ?? 40, x: xs, y: ys };
      measured.current = true;
    };

    gsap.set(svgBox, { transformOrigin: "50% 50%", rotation: 0, scale: 0.88, willChange: "transform" });
    gsap.set(pieces, { x: 0, y: 0, scale: 0.35, opacity: 0, filter: "blur(0px)" });
    gsap.set(right, { opacity: 0, x: 48, pointerEvents: "none" });
    gsap.set(flyLayer, { opacity: 0, pointerEvents: "none" });
    gsap.set(flyIntro, { opacity: 0, y: 8 });
    gsap.set(morphMini, { opacity: 0, scale: 0.35, transformOrigin: "50% 50%" });
    gsap.set(morphCopy, { opacity: 0, y: 12 });
    gsap.set(left, { alignItems: "center", justifyContent: "center", paddingTop: 0 });

    function applyJourneyProgress(p: number) {
      const f = fillRef.current;
      const tl = trackLineRef.current;
      if (!f || !tl) return;
      /* —— Old way (0 .. P_OLD) —— */
      if (p <= P_OLD) {
        const t = p / P_OLD;
        let s = -1;
        if (t < 0.06) s = -1;
        else if (t < 0.18) s = 0;
        else if (t < 0.3) s = 1;
        else if (t < 0.42) s = 2;
        else if (t < 0.54) s = 3;
        else if (t < 0.66) s = 4;
        else if (t < 0.78) s = 5;
        else s = 6;
        if (s !== lastOldStage.current) {
          lastOldStage.current = s;
          setOldStage(s);
        }
        const fp = Math.min(1, Math.max(0, (t - 0.06) / 0.7));
        f.style.width = `${fp * 90}%`;
        f.style.opacity = "1";
        tl.style.opacity = "1";
      } else {
        f.style.width = "90%";
        f.style.opacity = "1";
        tl.style.opacity = "1";
        if (lastOldStage.current !== 6) {
          lastOldStage.current = 6;
          setOldStage(6);
        }
      }

      /* —— Morph (P_OLD .. P_MORPH) —— */
      const m = remap(p, P_OLD, P_MORPH);
      const ms = smoothstep01(m);
      if (p > P_OLD - 0.02 && !measured.current) measureNodes();
      gsap.set(oldLayer, { opacity: 1 - ms * 0.97, pointerEvents: ms > 0.92 ? "none" : "auto" });
      const flyOp = p <= P_OLD ? 0 : Math.min(1, smoothstep01(remap(p, P_OLD, P_MORPH + 0.04)) * (0.05 + ms * 0.95));
      gsap.set(flyLayer, {
        opacity: flyOp,
        pointerEvents: flyOp > 0.35 ? "auto" : "none",
        visibility: flyOp < 0.02 ? "hidden" : "visible",
      });
      gsap.set(morphMini, { opacity: smoothstep01(remap(p, P_OLD + 0.02, P_MORPH)), scale: 0.35 + 0.65 * ms });
      tl.style.opacity = String(Math.max(0.08, 1 - ms * 0.92));
      f.style.opacity = String(Math.max(0.12, 1 - ms * 0.88));
      const cueVis = smoothstep01(remap(p, P_MORPH, P_CUE + 0.12)) * (1 - smoothstep01(remap(p, P_CUE + 0.2, P_DOCK)));
      gsap.set(morphCopy, {
        opacity: cueVis,
        y: 12 * (1 - smoothstep01(remap(p, P_MORPH, P_MORPH + 0.08))),
      });

      const g = nodeGeom.current;
      const wrap = lineWrapRef.current;
      if (g && wrap && p >= P_OLD && p <= P_MORPH + 0.02) {
        const R = Math.min(wrap.clientWidth, 280) * 0.32;
        for (let i = 0; i < 6; i++) {
          const el = nodeColRefs.current[i];
          if (!el) continue;
          const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const tx = g.cx + Math.cos(ang) * R;
          const ty = g.cy + Math.sin(ang) * R;
          const dx = (tx - g.x[i]) * ms;
          const dy = (ty - g.y[i]) * ms;
          gsap.set(el, { x: dx, y: dy, force3D: true });
        }
      } else if (p > P_MORPH + 0.02) {
        for (let i = 0; i < 6; i++) {
          const el = nodeColRefs.current[i];
          if (el) gsap.set(el, { x: 0, y: 0 });
        }
      }

      /* —— Fly phases —— */
      const flyRamp = remap(p, P_MORPH + 0.02, P_DOCK);
      const explode = smoothstep01(remap(flyRamp, 0, 0.55));
      const collapseT = smoothstep01(remap(flyRamp, 0.48, 0.78));
      const dockT = smoothstep01(remap(flyRamp, 0.62, 1));

      pieces.forEach((el, i) => {
        const ex = Math.cos(angles[i]) * rad() * explode * (1 - collapseT * 0.98);
        const ey = Math.sin(angles[i]) * rad() * explode * (1 - collapseT * 0.98);
        const sc = gsap.utils.interpolate(0.35, 1, Math.min(1, explode * 2.2)) * (1 - collapseT * 0.82);
        const op = explode < 0.08 ? explode / 0.08 : Math.min(1, explode * 1.2);
        gsap.set(el, {
          x: ex,
          y: ey,
          scale: Math.max(0.12, sc),
          opacity: op * (1 - collapseT),
          filter: collapseT > 0.4 ? `blur(${8 * (collapseT - 0.4) / 0.6}px)` : "blur(0px)",
        });
      });

      gsap.set(svgBox, {
        filter: collapseT > 0.35 ? `blur(${(collapseT - 0.35) * 12}px)` : "blur(0px)",
      });

      gsap.set(left, {
        alignItems: dockT > 0.5 ? "flex-start" : "center",
        justifyContent: dockT > 0.5 ? "flex-start" : "center",
        paddingTop: 24 * dockT,
      });

      gsap.set(right, {
        opacity: dockT,
        x: 48 * (1 - dockT),
        pointerEvents: dockT > 0.85 ? "auto" : "none",
      });

      const dockOn = p >= P_DOCK - 0.02;
      if (stage) {
        if (dockOn) stage.classList.add("journey-docked");
        else stage.classList.remove("journey-docked");
      }

      const introVis = smoothstep01(remap(dockT, 0.35, 0.95));
      gsap.set(flyIntro, { opacity: introVis, y: 8 * (1 - introVis) });

      const baseScale =
        gsap.utils.interpolate(0.88, 1.02, Math.min(1, explode * 1.1)) * gsap.utils.interpolate(1, 0.58, dockT);
      if (p < P_DOCK) {
        gsap.set(svgBox, { rotation: 0, scale: baseScale });
        if (lastStep.current !== 0) {
          lastStep.current = 0;
          setActiveStep(0);
        }
      } else {
        const sub = (p - P_DOCK) / (1 - P_DOCK);
        const step = Math.min(5, Math.max(0, Math.floor(sub * 6 + 0.0001)));
        if (step !== lastStep.current) {
          lastStep.current = step;
          setActiveStep(step);
        }
        gsap.set(svgBox, { rotation: -step * 60, filter: "blur(0px)", scale: baseScale });
      }

      const busy = p > P_CUE && p < P_DOCK + 0.08;
      gsap.set(svgBox, { willChange: busy ? "transform" : "auto" });
      gsap.set(right, { willChange: p > P_DOCK - 0.05 && p < P_DOCK + 0.2 ? "opacity, transform" : "auto" });
    }

    const scrollDriver = { _: 0 };
    const journeyTl = createTimeline({
      autoplay: onScroll({
        target: journey,
        sync: 0.14,
        repeat: true,
        enter: "top top",
        leave: "bottom top",
        axis: "y",
        onUpdate: (obs) => {
          const linked = obs.linked as { progress?: number } | null;
          if (linked && typeof linked.progress === "number") {
            applyJourneyProgress(clamp01(linked.progress));
          }
        },
        onResize: () => {
          measured.current = false;
        },
      }),
    });
    journeyTl.add(scrollDriver, { _: 1, duration: JOURNEY_TL_MS, ease: "linear" });

    applyJourneyProgress(0);

    void document.fonts?.ready?.then(() => journeyTl.refresh());

    return () => {
      journeyTl.revert();
    };
  }, [reduced]);

  if (reduced) return <JourneyReduced />;

  const allDone = oldStage >= 6;
  const detailIndex = allDone ? 5 : Math.max(0, Math.min(oldStage, 5));

  return (
    <section
      ref={journeyOuterRef}
      className="relative bg-[#0c0916]"
      style={{ height: `${SCROLL_MULT * 100}vh` }}
    >
      <div ref={stickyRef} className="sticky top-0 min-h-[100dvh] w-full overflow-hidden">
        <div
          ref={oldLayerRef}
          className="absolute inset-0 z-[30] flex flex-col justify-center px-6 py-[8vh] md:px-[8vw]"
        >
          <div className="max-w-[780px]">
            <p className="mb-4 text-[0.62rem] font-medium uppercase tracking-[0.3em] text-red-400">Before</p>
            <h2 className="font-serif text-[clamp(2rem,4.5vw,4.2rem)] font-light leading-tight tracking-tight">
              From <em className="italic text-red-300/90">idea</em> to <em className="italic text-red-300/90">user</em>.
              <br />
              One stage at a time.
            </h2>
            <p className="mt-5 max-w-[560px] text-[0.95rem] font-light leading-relaxed text-[rgba(209,193,255,0.55)]">
              Each stage waited on the one before it. Six handoffs, six places to stall. By the time a feature reached a
              single user, the team had already moved on.
            </p>
          </div>

          <div ref={lineWrapRef} className="relative mb-6 mt-10 h-[120px] w-full max-w-[900px] max-md:h-[100px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] w-[min(200px,42vw)] -translate-x-1/2 -translate-y-[20%]">
              <div ref={morphMiniRef}>
                <MorphMiniRing className="h-auto w-full drop-shadow-[0_0_24px_rgba(155,109,255,0.35)]" />
              </div>
            </div>
            <div
              ref={trackLineRef}
              className="absolute left-[5%] right-[5%] top-[30px] h-px bg-[rgba(209,193,255,0.08)]"
            />
            <div
              ref={fillRef}
              className="absolute left-[5%] top-[30px] h-px origin-left bg-gradient-to-r from-red-400 via-[#D551C9] to-[#F7B334]"
              style={{ width: "0%" }}
            />
            <div className="absolute inset-0 flex justify-between px-[5%]">
              {OLD_WAY_STAGES.map((st, i) => {
                const active = !allDone && i === oldStage;
                const done = allDone || (oldStage >= 0 && i < oldStage);
                return (
                  <div
                    key={st.label}
                    ref={(el) => {
                      nodeColRefs.current[i] = el;
                    }}
                    className="relative flex w-[14%] flex-col items-center will-change-transform"
                  >
                    <div
                      className={`relative z-[2] mt-[23px] size-3.5 rounded-full border transition-all duration-500 ${
                        active
                          ? "scale-125 border-[#D551C9] bg-[#D551C9] shadow-[0_0_16px_rgba(213,81,201,0.55)]"
                          : done
                            ? "border-[rgba(213,81,201,0.55)] bg-[rgba(213,81,201,0.45)]"
                            : "border-[rgba(209,193,255,0.18)] bg-[rgba(209,193,255,0.12)]"
                      }`}
                    />
                    <div className="mt-4 text-center text-[0.65rem] uppercase tracking-[0.18em] text-[rgba(209,193,255,0.4)] max-md:text-[0.55rem]">
                      <div className={active || done ? "text-[rgba(240,236,255,0.9)]" : ""}>{st.label}</div>
                      <div
                        className={`mt-1 font-serif text-[0.6rem] italic ${
                          active ? "text-[#D551C9]" : "text-[rgba(209,193,255,0.3)]"
                        }`}
                      >
                        {st.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={morphCopyRef} className="pointer-events-none mx-auto mt-2 max-w-lg px-2 text-center md:mt-4">
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-[rgba(209,193,255,0.45)]">
              {JOURNEY_MORPH_CUE}
            </p>
            <p className="mt-3 font-serif text-[clamp(1rem,2.4vw,1.35rem)] font-light leading-snug text-[#D1C1FF]">
              {JOURNEY_AFTER_LINE}
            </p>
          </div>

          <div className="relative mt-6 min-h-[140px] max-w-[720px]">
            {OLD_WAY_STAGES.map((st, i) => (
              <div
                key={st.title}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  oldStage >= 0 && i === detailIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="mb-2 text-[0.55rem] uppercase tracking-[0.25em] text-[#D551C9]">
                  Stage {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-serif text-[clamp(1.5rem,2.6vw,2.2rem)] font-light tracking-tight">{st.title}</h3>
                <p className="mt-3 max-w-[560px] text-[0.92rem] font-light leading-relaxed text-[rgba(209,193,255,0.62)]">
                  {st.text}
                </p>
              </div>
            ))}
          </div>

          <div
            className={`absolute right-[8vw] top-1/2 max-w-[300px] -translate-y-1/2 translate-x-10 text-right transition-all duration-700 max-md:relative max-md:right-auto max-md:top-auto max-md:mt-8 max-md:translate-x-0 max-md:text-left ${
              oldStage >= 6 ? "translate-x-0 opacity-100" : "opacity-0"
            }`}
          >
            <p className="text-[0.55rem] uppercase tracking-[0.28em] text-red-400/70">Total: idea → user</p>
            <p className="bg-gradient-to-br from-red-400 to-[#F7B334] bg-clip-text font-serif text-[clamp(3rem,6vw,5.5rem)] font-light leading-none text-transparent">
              12+ wks
            </p>
            <p className="mt-2 text-[0.78rem] font-light italic leading-snug text-[rgba(209,193,255,0.42)]">
              Per release. Sequential. Nothing in parallel.
            </p>
          </div>
        </div>

        <div ref={flyLayerRef} className="absolute inset-0 z-[10] flex items-center justify-center">
          <div
            ref={flyIntroRef}
            className="pointer-events-none absolute left-0 right-0 top-[4.5rem] z-[20] mx-auto max-w-2xl px-6 text-center md:left-8 md:right-auto md:mx-0 md:max-w-md md:text-left"
          >
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#D551C9]">{JOURNEY_AFTER_EYEBROW}</p>
            <p className="mt-2 font-serif text-[clamp(1.15rem,2.2vw,1.5rem)] font-light leading-snug text-[rgba(240,236,255,0.92)]">
              {JOURNEY_ADOPTION_LINE}
            </p>
          </div>
          <div
            ref={stageRef}
            className="journey-stage relative flex h-[100dvh] w-full max-w-[1700px] flex-col items-center justify-center gap-8 px-5 pb-16 pt-20 md:gap-10 md:px-10 md:pb-12 md:pt-16"
          >
            <div
              ref={leftRef}
              className="journey-wheel-col relative flex min-h-[45vh] flex-1 items-center justify-center md:min-h-0"
            >
              <div
                ref={svgRotRef}
                className="journey-svg-box relative z-[1] w-[min(92vw,440px)] md:w-[min(36vw,440px)]"
              >
                <div className="journey-wheel-glass rounded-[28px] border border-white/[0.08] bg-[rgba(12,9,22,0.35)] p-3 shadow-[0_0_60px_rgba(98,62,221,0.12)] backdrop-blur-md md:p-4">
                  <FlywheelSvg activeIndex={activeStep} className="h-auto w-full" />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
                {FLYWHEEL_STEPS.map((s, i) => (
                  <div
                    key={s.id}
                    ref={(el) => {
                      piecesRef.current[i] = el;
                    }}
                    className="absolute flex min-w-[140px] max-w-[46vw] flex-col items-center rounded-2xl border border-white/[0.12] bg-[rgba(12,9,22,0.55)] px-4 py-4 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl will-change-transform md:max-w-[200px]"
                    style={{ borderColor: `${s.color}44` }}
                  >
                    <span className="text-[0.55rem] uppercase tracking-[0.2em] text-[rgba(209,193,255,0.45)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-2 font-serif text-xl font-light text-white">{s.label}</span>
                    <span className="mt-1 text-[0.65rem] font-light text-[rgba(209,193,255,0.45)]">AI-augmented</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              ref={rightRef}
              className="journey-content-col relative flex min-h-[40vh] w-full flex-1 items-start justify-center md:min-h-0 md:items-center md:pl-2"
            >
              <div className="relative w-full max-w-xl md:max-w-none md:pr-8">
                <StepPanel prevIndex={activeStep} nextIndex={activeStep} blend={0} visible />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useMemo } from "react";
import { OLD_WAY_STAGES, JOURNEY_AFTER_LINE } from "@/lib/flywheelData";
import { clamp01, lerp, remap, smoothstep01 } from "@/lib/animationUtils";

type Props = {
  /** 0..1 over the full BEFORE → 4-cycle loop → text beat */
  progress: number;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Layout constants                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
const W  = 800;
const H  = 440;
const CX = W / 2;
const CY = H / 2 + 10;
const N  = OLD_WAY_STAGES.length; // 6

/** Single radius — all 4 cycles are the same size (same 12-week loop) */
const R    = 120;
const CIRC = 2 * Math.PI * R;

/** Horizontal positions for the initial line */
const LINE_Y = CY;
const lineXs = Array.from({ length: N }, (_, i) => lerp(80, W - 80, i / (N - 1)));

/** Circular positions — 9-o'clock start, clockwise */
const cp = Array.from({ length: N }, (_, i) => {
  const angle = Math.PI + (i / N) * 2 * Math.PI;
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
});

/**
 * Cycle label anchor positions — staggered around the ring so all 4 labels
 * are readable simultaneously in Phase 5.
 *   C1 → 10-o'clock (top-left)
 *   C2 → 2-o'clock  (top-right)
 *   C3 → 4-o'clock  (right)
 *   C4 → 12-o'clock (top-centre)
 */
const CYCLE_LABEL_POS = [
  { x: CX - R * 0.65 - 4, y: CY - R * 0.76 - 10, anchor: "end" as const },
  { x: CX + R * 0.65 + 4, y: CY - R * 0.76 - 10, anchor: "start" as const },
  { x: CX + R * 0.87 + 8, y: CY + R * 0.45,       anchor: "start" as const },
  { x: CX,                  y: CY - R - 20,           anchor: "middle" as const },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Catmull-Rom → cubic Bézier (Phase 0 only — line-to-circle morph)           */
/* ─────────────────────────────────────────────────────────────────────────── */
function catmullRomToBezier(
  pts: { x: number; y: number }[],
  closed: boolean,
  tension = 0.5,
): string {
  if (pts.length < 2) return "";
  const p = closed ? [...pts, pts[0], pts[1]] : pts;
  let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  const src = closed ? [...pts] : pts;
  const len = src.length;
  for (let i = 0; i < (closed ? len : len - 1); i++) {
    const p0 = src[(i - 1 + len) % len];
    const p1 = src[i];
    const p2 = src[(i + 1) % len];
    const p3 = src[(i + 2) % len];
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3;
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  if (closed) d += " Z";
  void p;
  return d;
}

function approxPathLength(pts: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.hypot(dx, dy);
  }
  return len * 1.15;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
export function JourneyBefore({ progress }: Props) {
  const p = clamp01(progress);

  /* ── Phase 0: line draw (p: 0 → 0.20) ── */
  const sweep1 = smoothstep01(clamp01(remap(p, 0, 0.20)));

  /* ── Phase 1: morph line → Circle 1 (p: 0.16 → 0.32) ── */
  const morph1 = smoothstep01(clamp01(remap(p, 0.16, 0.32)));

  /* ── Phase 2: Circle 2 draws in (p: 0.34 → 0.50) ── */
  const sweep2 = smoothstep01(clamp01(remap(p, 0.34, 0.50)));

  /* ── Phase 3: Circle 3 draws in (p: 0.52 → 0.66) ── */
  const sweep3 = smoothstep01(clamp01(remap(p, 0.52, 0.66)));

  /* ── Phase 4: Circle 4 draws in (p: 0.68 → 0.82) ── */
  const sweep4 = smoothstep01(clamp01(remap(p, 0.68, 0.82)));

  /* ── Ghost transitions: each ring dims as the next one arrives ── */
  const ghost1 = smoothstep01(clamp01(remap(p, 0.34, 0.48)));
  const ghost2 = smoothstep01(clamp01(remap(p, 0.52, 0.64)));
  const ghost3 = smoothstep01(clamp01(remap(p, 0.68, 0.80)));

  /* ── Phase 5: final text reveal (p: 0.82 → 0.94) ── */
  const afterTextT = smoothstep01(clamp01(remap(p, 0.82, 0.94)));

  /* Headline fades out as C1 morphs in */
  const introOpacity = 1 - smoothstep01(clamp01(remap(p, 0.20, 0.35)));

  /* "Learn. Iterate." sub-caption: visible during C4 phase */
  const learnCapT = smoothstep01(clamp01(remap(p, 0.68, 0.78))) *
    (1 - smoothstep01(clamp01(remap(p, 0.80, 0.88))));

  /* ── Phase 0+1: morphing dots for Circle 1 ── */
  const activeIdx1 = Math.floor(sweep1 * (N + 0.4));
  const pathClosed = morph1 > 0.85;

  const dots1 = useMemo(
    () =>
      OLD_WAY_STAGES.map((st, i) => ({
        ...st,
        x: lerp(lineXs[i], cp[i].x, morph1),
        y: lerp(LINE_Y,    cp[i].y, morph1),
      })),
    [morph1],
  );

  const pathD   = useMemo(
    () => catmullRomToBezier(dots1.map((d) => ({ x: d.x, y: d.y })), pathClosed, 0.45),
    [dots1, pathClosed],
  );
  const pathLen    = useMemo(() => approxPathLength(dots1.map((d) => ({ x: d.x, y: d.y }))), [dots1]);
  const dashOffset = pathLen * (1 - sweep1);
  const closingOp  = clamp01(remap(morph1, 0.75, 1.0)) * (1 - ghost1);

  /* Active dot index for each later circle (same sweep pattern) */
  const activeIdx2 = Math.floor(sweep2 * (N + 0.4));
  const activeIdx3 = Math.floor(sweep3 * (N + 0.4));
  const activeIdx4 = Math.floor(sweep4 * (N + 0.4));

  /* ── Cycle label positions ── */
  const lp = CYCLE_LABEL_POS;

  return (
    <div className="relative mx-auto w-full max-w-[900px]">
      {/* Headline — fades out once Circle 1 forms */}
      <div
        className="text-center"
        style={{ opacity: introOpacity, transform: `translateY(${-morph1 * 14}px)` }}
      >
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-red-300/85">
          Before
        </p>
        <h2 className="mt-2 font-sans text-[clamp(1.75rem,3.2vw,2.6rem)] font-bold leading-tight tracking-tight text-white">
          From <em className="italic text-red-200/90">idea</em> to{" "}
          <em className="italic text-red-200/90">user</em>.
          <br className="hidden md:inline" />
          <span className="text-white/85">One stage at a time.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-[580px] font-body text-[1rem] font-normal leading-relaxed text-[rgba(240,236,255,0.72)]">
          Each stage waited on the one before it. Six handoffs, six places to stall.
        </p>
      </div>

      {/* "Learn. Iterate." — appears during Cycle 4 */}
      <div
        className="text-center"
        style={{
          opacity: learnCapT,
          transform: `translateY(${(1 - learnCapT) * 6}px)`,
        }}
      >
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#9B6DFF]">
          Learn · Iterate · Repeat
        </p>
      </div>

      {/* ── SVG canvas ── */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full"
        style={{ overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="jb-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F87171" stopOpacity="0.95" />
            <stop offset="45%"  stopColor="#D551C9" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#F7B334" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="jb-grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#9B6DFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#D551C9" stopOpacity="0.95" />
          </linearGradient>
          <filter id="jb-glow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="jb-glow-sm">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── GHOST RINGS — all 4 persist once ghosted ── */}

        {/* C1 ghost — dim red dashes */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none" stroke="rgba(248,113,113,0.55)" strokeWidth={1.5}
          strokeDasharray="3 8"
          opacity={ghost1 * 0.9}
        />
        {/* C2 ghost — pink dashes */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none" stroke="rgba(213,81,201,0.55)" strokeWidth={1.5}
          strokeDasharray="4 6"
          opacity={ghost2 * 0.9}
        />
        {/* C3 ghost — purple dashes */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none" stroke="rgba(155,109,255,0.55)" strokeWidth={1.5}
          strokeDasharray="5 4"
          opacity={ghost3 * 0.9}
        />

        {/* ── Ghost dots for C1 ── */}
        {cp.map((pos, i) => (
          <circle
            key={`c1g-${i}`}
            cx={pos.x} cy={pos.y} r={3}
            fill="rgba(248,113,113,0.35)"
            opacity={ghost1 * 0.8}
          />
        ))}

        {/* ── Ghost dots for C2 ── */}
        {cp.map((pos, i) => (
          <circle
            key={`c2g-${i}`}
            cx={pos.x} cy={pos.y} r={3}
            fill="rgba(213,81,201,0.35)"
            opacity={ghost2 * 0.8}
          />
        ))}

        {/* ── Ghost dots for C3 ── */}
        {cp.map((pos, i) => (
          <circle
            key={`c3g-${i}`}
            cx={pos.x} cy={pos.y} r={3}
            fill="rgba(155,109,255,0.35)"
            opacity={ghost3 * 0.8}
          />
        ))}

        {/* ── PHASE 0+1: Line draw → morph to Circle 1 ── */}

        {/* Straight track (fades as morph progresses) */}
        <line
          x1={80} y1={LINE_Y} x2={W - 80} y2={LINE_Y}
          stroke="rgba(209,193,255,0.08)"
          strokeWidth={1}
          opacity={1 - morph1}
        />
        {/* Faint circle guide */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="rgba(209,193,255,0.06)"
          strokeWidth={1}
          opacity={morph1}
        />
        {/* Animated spline */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#jb-grad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
          filter="url(#jb-glow)"
          opacity={1 - ghost1}
        />
        {/* Closing arc overlay when morph ≈ 1 */}
        {closingOp > 0 && (
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="url(#jb-grad)"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={closingOp}
            filter="url(#jb-glow)"
          />
        )}

        {/* Stage dots for C1 — with sweep + labels */}
        {dots1.map((dot, i) => {
          const isActive = i === activeIdx1 && sweep1 < 0.98;
          const isDone   = activeIdx1 > i || sweep1 >= 0.98;
          const dotOp    = 1 - ghost1;
          return (
            <g key={`c1d-${dot.label}`} opacity={dotOp}>
              {isActive && (
                <circle cx={dot.x} cy={dot.y} r={10}
                  fill="rgba(213,81,201,0.18)"
                  stroke="rgba(213,81,201,0.35)"
                  strokeWidth={1}
                />
              )}
              <circle
                cx={dot.x} cy={dot.y}
                r={isActive ? 5.5 : 4}
                fill={isActive ? "#D551C9" : isDone ? "rgba(213,81,201,0.6)" : "rgba(209,193,255,0.22)"}
                stroke={isActive ? "#D551C9" : isDone ? "rgba(213,81,201,0.7)" : "rgba(209,193,255,0.3)"}
                strokeWidth={1}
              />
              <text
                x={dot.x} y={dot.y + 24}
                textAnchor="middle" fontSize={11}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={700} letterSpacing="0.02em"
                fill="rgba(240,236,255,0.95)"
                style={{ textTransform: "uppercase", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
              >
                {dot.label}
              </text>
              <text
                x={dot.x} y={dot.y + 37}
                textAnchor="middle" fontSize={9}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={600}
                fill="#D1C1FF"
                opacity={0.9}
              >
                {dot.time}
              </text>
            </g>
          );
        })}

        {/* C1 cycle label (10-o'clock) */}
        <text
          x={lp[0].x} y={lp[0].y}
          textAnchor={lp[0].anchor} fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700} fill="#F87171"
          opacity={morph1 * 0.75}
        >
          Cycle 1 · 12 wks
        </text>

        {/* ── PHASE 2: Circle 2 draws in ── */}

        {/* Active ring */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="url(#jb-grad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - sweep2)}
          opacity={sweep2 * (1 - ghost2)}
          filter="url(#jb-glow-sm)"
          style={{ transformOrigin: `${CX}px ${CY}px`, transform: "rotate(-90deg)" }}
        />

        {/* C2 active dots */}
        {cp.map((pos, i) => {
          const isActive = i === activeIdx2 && sweep2 < 0.98;
          const isDone   = activeIdx2 > i || sweep2 >= 0.98;
          const dotOp    = clamp01(sweep2 * 3) * (1 - ghost2);
          return (
            <g key={`c2d-${i}`} opacity={dotOp}>
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={10}
                  fill="rgba(213,81,201,0.18)"
                  stroke="rgba(213,81,201,0.35)"
                  strokeWidth={1}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y}
                r={isActive ? 5.5 : 4}
                fill={isActive ? "#D551C9" : isDone ? "rgba(213,81,201,0.6)" : "rgba(209,193,255,0.22)"}
                stroke={isActive ? "#D551C9" : isDone ? "rgba(213,81,201,0.7)" : "rgba(209,193,255,0.3)"}
                strokeWidth={1}
              />
              <text
                x={pos.x} y={pos.y + 24}
                textAnchor="middle" fontSize={11}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={700} letterSpacing="0.02em"
                fill="rgba(240,236,255,0.95)"
                style={{ textTransform: "uppercase" }}
              >
                {OLD_WAY_STAGES[i].label}
              </text>
            </g>
          );
        })}

        {/* C2 label (2-o'clock) */}
        <text
          x={lp[1].x} y={lp[1].y}
          textAnchor={lp[1].anchor} fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700} fill="#D551C9"
          opacity={sweep2 * 0.85}
        >
          Cycle 2 · 12 wks
        </text>

        {/* ── PHASE 3: Circle 3 draws in ── */}

        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="url(#jb-grad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - sweep3)}
          opacity={sweep3 * (1 - ghost3)}
          filter="url(#jb-glow-sm)"
          style={{ transformOrigin: `${CX}px ${CY}px`, transform: "rotate(-90deg)" }}
        />

        {/* C3 active dots */}
        {cp.map((pos, i) => {
          const isActive = i === activeIdx3 && sweep3 < 0.98;
          const isDone   = activeIdx3 > i || sweep3 >= 0.98;
          const dotOp    = clamp01(sweep3 * 3) * (1 - ghost3);
          return (
            <g key={`c3d-${i}`} opacity={dotOp}>
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={10}
                  fill="rgba(155,109,255,0.18)"
                  stroke="rgba(155,109,255,0.35)"
                  strokeWidth={1}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y}
                r={isActive ? 5.5 : 4}
                fill={isActive ? "#9B6DFF" : isDone ? "rgba(155,109,255,0.6)" : "rgba(209,193,255,0.22)"}
                stroke={isActive ? "#9B6DFF" : isDone ? "rgba(155,109,255,0.7)" : "rgba(209,193,255,0.3)"}
                strokeWidth={1}
              />
              <text
                x={pos.x} y={pos.y + 24}
                textAnchor="middle" fontSize={11}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={700} letterSpacing="0.02em"
                fill="rgba(240,236,255,0.95)"
                style={{ textTransform: "uppercase" }}
              >
                {OLD_WAY_STAGES[i].label}
              </text>
            </g>
          );
        })}

        {/* C3 label (4-o'clock) */}
        <text
          x={lp[2].x} y={lp[2].y}
          textAnchor={lp[2].anchor} fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700} fill="#9B6DFF"
          opacity={sweep3 * 0.85}
        >
          Cycle 3 · 12 wks
        </text>

        {/* ── PHASE 4: Circle 4 draws in (the transforming ring) ── */}

        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="url(#jb-grad4)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - sweep4)}
          opacity={sweep4}
          filter="url(#jb-glow)"
          style={{ transformOrigin: `${CX}px ${CY}px`, transform: "rotate(-90deg)" }}
        />

        {/* C4 active dots */}
        {cp.map((pos, i) => {
          const isActive = i === activeIdx4 && sweep4 < 0.98;
          const isDone   = activeIdx4 > i || sweep4 >= 0.98;
          const dotOp    = clamp01(sweep4 * 3);
          return (
            <g key={`c4d-${i}`} opacity={dotOp}>
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={11}
                  fill="rgba(155,109,255,0.20)"
                  stroke="rgba(155,109,255,0.40)"
                  strokeWidth={1}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y}
                r={isActive ? 6 : 4.5}
                fill={isActive ? "#9B6DFF" : isDone ? "rgba(155,109,255,0.7)" : "rgba(209,193,255,0.22)"}
                stroke={isActive ? "#9B6DFF" : isDone ? "rgba(155,109,255,0.8)" : "rgba(209,193,255,0.3)"}
                strokeWidth={1}
              />
              <text
                x={pos.x} y={pos.y + 24}
                textAnchor="middle" fontSize={11}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={700} letterSpacing="0.02em"
                fill="rgba(240,236,255,0.95)"
                style={{ textTransform: "uppercase" }}
              >
                {OLD_WAY_STAGES[i].label}
              </text>
            </g>
          );
        })}

        {/* C4 label (12-o'clock) */}
        <text
          x={lp[3].x} y={lp[3].y}
          textAnchor={lp[3].anchor} fontSize={11}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700} fill="#9B6DFF"
          opacity={sweep4 * 0.95}
        >
          Cycle 4 · 12 wks
        </text>

        {/* ── Phase 5: "same loop" annotation — visible once all 4 rings shown ── */}
        <text
          x={CX - R - 18} y={CY}
          textAnchor="end" fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} fill="rgba(209,193,255,0.55)"
          opacity={afterTextT}
        >
          Same 12 weeks.
        </text>
        <text
          x={CX - R - 18} y={CY + 16}
          textAnchor="end" fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} fill="rgba(209,193,255,0.55)"
          opacity={afterTextT}
        >
          Every time.
        </text>
      </svg>

      {/* ── PHASE 5: JOURNEY_AFTER_LINE text ── */}
      <div
        className="mt-2 text-center"
        style={{
          opacity: afterTextT,
          transform: `translateY(${(1 - afterTextT) * 14}px)`,
        }}
      >
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#9B6DFF]">
          The loop changes
        </p>
        <p className="mx-auto mt-3 max-w-[600px] font-sans text-[clamp(1.05rem,2vw,1.45rem)] font-bold leading-snug text-[#D1C1FF]">
          {JOURNEY_AFTER_LINE}
        </p>
      </div>
    </div>
  );
}

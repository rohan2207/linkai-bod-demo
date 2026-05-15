"use client";

import { useMemo } from "react";
import { OLD_WAY_STAGES, JOURNEY_AFTER_LINE } from "@/lib/flywheelData";
import { clamp01, lerp, remap, smoothstep01 } from "@/lib/animationUtils";

type Props = {
  /** 0..1 over the full BEFORE → 4-cycle step sequence → text beat */
  progress: number;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Layout constants                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
const W   = 800;
const H   = 420;
const CY  = 210; // shared vertical centre for all circles

/**
 * 4 circles, same radius, arranged horizontally.
 * R=72, diameter=144, gap between edges=44 → total span=4*144+3*44=708.
 * Left/right margin=(800-708)/2=46.
 */
const R    = 72;
const GAP  = 44;
const CIRC = 2 * Math.PI * R;

const CX1 = 46 + R;           //  118
const CX2 = CX1 + 2 * R + GAP; //  306
const CX3 = CX2 + 2 * R + GAP; //  494
const CX4 = CX3 + 2 * R + GAP; //  682

const N = OLD_WAY_STAGES.length; // 6

/** Horizontal positions for the initial draw-in line (Phase 0, full width) */
const LINE_Y = CY;
const lineXs = Array.from({ length: N }, (_, i) => lerp(50, W - 50, i / (N - 1)));

/** Generate 6 clock positions for a circle centred at (cx, cy) with radius r */
function makeCP(cx: number, cy: number, r: number) {
  return Array.from({ length: N }, (_, i) => {
    const angle = Math.PI + (i / N) * 2 * Math.PI; // 9-o'clock start, CW
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

const cp1 = makeCP(CX1, CY, R);
const cp2 = makeCP(CX2, CY, R);
const cp3 = makeCP(CX3, CY, R);
const cp4 = makeCP(CX4, CY, R);

/* Arrow tip positions (edge-to-edge between adjacent circles) */
const ARR = [
  { x1: CX1 + R + 6, x2: CX2 - R - 6, y: CY },
  { x1: CX2 + R + 6, x2: CX3 - R - 6, y: CY },
  { x1: CX3 + R + 6, x2: CX4 - R - 6, y: CY },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* Catmull-Rom → cubic Bézier (Phase 0 — line to Circle 1 morph)              */
/* ─────────────────────────────────────────────────────────────────────────── */
function catmullRomToBezier(
  pts: { x: number; y: number }[],
  closed: boolean,
  tension = 0.45,
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
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len * 1.15;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
export function JourneyBefore({ progress }: Props) {
  const p = clamp01(progress);

  /* ── Phase 0: line draw (p: 0 → 0.22) ── */
  const sweep1 = smoothstep01(clamp01(remap(p, 0, 0.22)));

  /* ── Phase 1: morph line → Circle 1 (p: 0.18 → 0.33) ── */
  const morph1 = smoothstep01(clamp01(remap(p, 0.18, 0.33)));

  /* ── Arrow 1 fades in (p: 0.30 → 0.38) ── */
  const arr1T = smoothstep01(clamp01(remap(p, 0.30, 0.38)));

  /* ── Phase 2: Circle 2 draws in (p: 0.34 → 0.50) ── */
  const sweep2 = smoothstep01(clamp01(remap(p, 0.34, 0.50)));

  /* ── Arrow 2 fades in (p: 0.48 → 0.56) ── */
  const arr2T = smoothstep01(clamp01(remap(p, 0.48, 0.56)));

  /* ── Phase 3: Circle 3 draws in (p: 0.52 → 0.66) ── */
  const sweep3 = smoothstep01(clamp01(remap(p, 0.52, 0.66)));

  /* ── Arrow 3 fades in (p: 0.64 → 0.72) ── */
  const arr3T = smoothstep01(clamp01(remap(p, 0.64, 0.72)));

  /* ── Phase 4: Circle 4 draws in (p: 0.68 → 0.82) ── */
  const sweep4 = smoothstep01(clamp01(remap(p, 0.68, 0.82)));

  /* ── Ghost: each circle dims as the next one arrives ── */
  const ghost1 = smoothstep01(clamp01(remap(p, 0.34, 0.48)));
  const ghost2 = smoothstep01(clamp01(remap(p, 0.52, 0.64)));
  const ghost3 = smoothstep01(clamp01(remap(p, 0.68, 0.80)));

  /* ── Phase 5: text + all-circles hold (p: 0.82 → 0.94) ── */
  const afterTextT = smoothstep01(clamp01(remap(p, 0.82, 0.94)));

  /* Headline fades out as C1 forms */
  const introOpacity = 1 - smoothstep01(clamp01(remap(p, 0.20, 0.36)));

  /* Active dot index per circle */
  const ai1 = Math.floor(sweep1 * (N + 0.4));
  const ai2 = Math.floor(sweep2 * (N + 0.4));
  const ai3 = Math.floor(sweep3 * (N + 0.4));
  const ai4 = Math.floor(sweep4 * (N + 0.4));

  /* Phase 0 morphing dots for C1 */
  const pathClosed = morph1 > 0.85;
  const dots1 = useMemo(
    () => OLD_WAY_STAGES.map((st, i) => ({
      ...st,
      x: lerp(lineXs[i], cp1[i].x, morph1),
      y: lerp(LINE_Y,    cp1[i].y, morph1),
    })),
    [morph1],
  );
  const pathD   = useMemo(
    () => catmullRomToBezier(dots1.map((d) => ({ x: d.x, y: d.y })), pathClosed),
    [dots1, pathClosed],
  );
  const pathLen    = useMemo(() => approxPathLength(dots1.map((d) => ({ x: d.x, y: d.y }))), [dots1]);
  const dashOffset = pathLen * (1 - sweep1);
  const closingOp  = clamp01(remap(morph1, 0.75, 1.0)) * (1 - ghost1);

  /* Ghost opacity values — dim but still visible to show accumulation */
  const g1op = lerp(1, 0.28, ghost1);
  const g2op = lerp(1, 0.28, ghost2);
  const g3op = lerp(1, 0.28, ghost3);

  return (
    <div className="relative mx-auto w-full max-w-[900px]">

      {/* Headline — visible during line draw, fades as C1 forms */}
      <div
        className="text-center"
        style={{ opacity: introOpacity, transform: `translateY(${-morph1 * 10}px)` }}
      >
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-red-300/85">
          Before
        </p>
        <h2 className="mt-2 font-sans text-[clamp(1.5rem,2.8vw,2.2rem)] font-bold leading-tight tracking-tight text-white">
          From <em className="italic text-red-200/90">idea</em> to{" "}
          <em className="italic text-red-200/90">user</em>.{" "}
          <span className="text-white/80">One stage at a time.</span>
        </h2>
        <p className="mx-auto mt-2 max-w-[560px] font-body text-[0.95rem] font-normal leading-relaxed text-[rgba(240,236,255,0.68)]">
          Each stage waited on the one before it. Six handoffs, six places to stall.
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
          {/* Shared gradient for C1 / C2 / C3 */}
          <linearGradient id="jb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#F87171" stopOpacity="0.95" />
            <stop offset="50%"  stopColor="#D551C9" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#9B6DFF" stopOpacity="0.95" />
          </linearGradient>
          {/* Final circle C4 — brightest purple */}
          <linearGradient id="jb-grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#9B6DFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#D551C9" stopOpacity="1" />
          </linearGradient>
          <filter id="jb-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="jb-glow-sm">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Arrowhead marker */}
          <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="rgba(209,193,255,0.55)" />
          </marker>
        </defs>

        {/* ════════════════════════════════════════════════════════ */}
        {/* PHASE 0+1: Line draw → morph to Circle 1               */}
        {/* ════════════════════════════════════════════════════════ */}

        {/* Straight guide track */}
        <line
          x1={50} y1={LINE_Y} x2={W - 50} y2={LINE_Y}
          stroke="rgba(209,193,255,0.07)" strokeWidth={1}
          opacity={1 - morph1}
        />
        {/* Faint circle guide for C1 */}
        <circle
          cx={CX1} cy={CY} r={R}
          fill="none" stroke="rgba(209,193,255,0.07)" strokeWidth={1}
          opacity={morph1}
        />

        {/* Animated spline (line → circle) */}
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
          opacity={g1op}
        />
        {/* Closing arc for C1 once morph ≈ 1 */}
        {closingOp > 0 && (
          <circle
            cx={CX1} cy={CY} r={R}
            fill="none" stroke="url(#jb-grad)"
            strokeWidth={2} strokeLinecap="round"
            opacity={closingOp} filter="url(#jb-glow)"
          />
        )}

        {/* Stage dots for C1 — with sweep + labels on C1 only */}
        {dots1.map((dot, i) => {
          const isActive = i === ai1 && sweep1 < 0.98;
          const isDone   = ai1 > i || sweep1 >= 0.98;
          return (
            <g key={`c1d-${dot.label}`} opacity={g1op}>
              {isActive && (
                <circle cx={dot.x} cy={dot.y} r={9}
                  fill="rgba(213,81,201,0.18)" stroke="rgba(213,81,201,0.35)" strokeWidth={1}
                />
              )}
              <circle
                cx={dot.x} cy={dot.y}
                r={isActive ? 5 : 3.5}
                fill={isActive ? "#D551C9" : isDone ? "rgba(213,81,201,0.65)" : "rgba(209,193,255,0.25)"}
                stroke={isActive ? "#D551C9" : isDone ? "rgba(213,81,201,0.75)" : "rgba(209,193,255,0.3)"}
                strokeWidth={1}
              />
              {/* Stage labels — only on C1, fade with ghost */}
              <text
                x={dot.x} y={dot.y + 20}
                textAnchor="middle" fontSize={9}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={700} letterSpacing="0.04em"
                fill="rgba(240,236,255,0.9)"
                style={{ textTransform: "uppercase" }}
                opacity={1 - ghost1}
              >
                {dot.label}
              </text>
            </g>
          );
        })}

        {/* C1 cycle label */}
        <text
          x={CX1} y={CY - R - 14}
          textAnchor="middle" fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700} fill="#F87171"
          opacity={morph1 * g1op}
        >
          Cycle 1
        </text>
        <text
          x={CX1} y={CY + R + 22}
          textAnchor="middle" fontSize={9}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} fill="rgba(240,236,255,0.5)"
          opacity={morph1 * g1op}
        >
          12 wks
        </text>

        {/* ════════════════════════════════════════════════════════ */}
        {/* ARROW 1 → C2                                           */}
        {/* ════════════════════════════════════════════════════════ */}
        <line
          x1={ARR[0].x1} y1={ARR[0].y} x2={ARR[0].x2} y2={ARR[0].y}
          stroke="rgba(209,193,255,0.5)" strokeWidth={1.5}
          markerEnd="url(#arrowhead)"
          opacity={arr1T}
          strokeDasharray="3 4"
        />
        <text
          x={(ARR[0].x1 + ARR[0].x2) / 2} y={ARR[0].y - 9}
          textAnchor="middle" fontSize={8}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} letterSpacing="0.08em"
          fill="rgba(209,193,255,0.45)"
          opacity={arr1T}
          style={{ textTransform: "uppercase" }}
        >
          learned
        </text>

        {/* ════════════════════════════════════════════════════════ */}
        {/* CIRCLE 2                                               */}
        {/* ════════════════════════════════════════════════════════ */}
        <circle
          cx={CX2} cy={CY} r={R}
          fill="none" stroke="url(#jb-grad)"
          strokeWidth={2} strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - sweep2)}
          opacity={sweep2 * g2op}
          filter="url(#jb-glow-sm)"
          style={{ transformOrigin: `${CX2}px ${CY}px`, transform: "rotate(-90deg)" }}
        />
        {/* C2 dots (no labels) */}
        {cp2.map((pos, i) => {
          const isActive = i === ai2 && sweep2 < 0.98;
          const isDone   = ai2 > i || sweep2 >= 0.98;
          return (
            <g key={`c2d-${i}`} opacity={clamp01(sweep2 * 4) * g2op}>
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={9}
                  fill="rgba(213,81,201,0.18)" stroke="rgba(213,81,201,0.35)" strokeWidth={1}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={isActive ? 5 : 3.5}
                fill={isActive ? "#D551C9" : isDone ? "rgba(213,81,201,0.65)" : "rgba(209,193,255,0.25)"}
                stroke={isActive ? "#D551C9" : isDone ? "rgba(213,81,201,0.75)" : "rgba(209,193,255,0.3)"}
                strokeWidth={1}
              />
            </g>
          );
        })}
        <text
          x={CX2} y={CY - R - 14}
          textAnchor="middle" fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700} fill="#D551C9"
          opacity={sweep2 * g2op}
        >
          Cycle 2
        </text>
        <text
          x={CX2} y={CY + R + 22}
          textAnchor="middle" fontSize={9}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} fill="rgba(240,236,255,0.5)"
          opacity={sweep2 * g2op}
        >
          12 wks
        </text>

        {/* ════════════════════════════════════════════════════════ */}
        {/* ARROW 2 → C3                                           */}
        {/* ════════════════════════════════════════════════════════ */}
        <line
          x1={ARR[1].x1} y1={ARR[1].y} x2={ARR[1].x2} y2={ARR[1].y}
          stroke="rgba(209,193,255,0.5)" strokeWidth={1.5}
          markerEnd="url(#arrowhead)"
          opacity={arr2T}
          strokeDasharray="3 4"
        />
        <text
          x={(ARR[1].x1 + ARR[1].x2) / 2} y={ARR[1].y - 9}
          textAnchor="middle" fontSize={8}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} letterSpacing="0.08em"
          fill="rgba(209,193,255,0.45)"
          opacity={arr2T}
          style={{ textTransform: "uppercase" }}
        >
          iterated
        </text>

        {/* ════════════════════════════════════════════════════════ */}
        {/* CIRCLE 3                                               */}
        {/* ════════════════════════════════════════════════════════ */}
        <circle
          cx={CX3} cy={CY} r={R}
          fill="none" stroke="url(#jb-grad)"
          strokeWidth={2} strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - sweep3)}
          opacity={sweep3 * g3op}
          filter="url(#jb-glow-sm)"
          style={{ transformOrigin: `${CX3}px ${CY}px`, transform: "rotate(-90deg)" }}
        />
        {/* C3 dots */}
        {cp3.map((pos, i) => {
          const isActive = i === ai3 && sweep3 < 0.98;
          const isDone   = ai3 > i || sweep3 >= 0.98;
          return (
            <g key={`c3d-${i}`} opacity={clamp01(sweep3 * 4) * g3op}>
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={9}
                  fill="rgba(155,109,255,0.18)" stroke="rgba(155,109,255,0.35)" strokeWidth={1}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={isActive ? 5 : 3.5}
                fill={isActive ? "#9B6DFF" : isDone ? "rgba(155,109,255,0.65)" : "rgba(209,193,255,0.25)"}
                stroke={isActive ? "#9B6DFF" : isDone ? "rgba(155,109,255,0.75)" : "rgba(209,193,255,0.3)"}
                strokeWidth={1}
              />
            </g>
          );
        })}
        <text
          x={CX3} y={CY - R - 14}
          textAnchor="middle" fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700} fill="#9B6DFF"
          opacity={sweep3 * g3op}
        >
          Cycle 3
        </text>
        <text
          x={CX3} y={CY + R + 22}
          textAnchor="middle" fontSize={9}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} fill="rgba(240,236,255,0.5)"
          opacity={sweep3 * g3op}
        >
          12 wks
        </text>

        {/* ════════════════════════════════════════════════════════ */}
        {/* ARROW 3 → C4                                           */}
        {/* ════════════════════════════════════════════════════════ */}
        <line
          x1={ARR[2].x1} y1={ARR[2].y} x2={ARR[2].x2} y2={ARR[2].y}
          stroke="rgba(209,193,255,0.5)" strokeWidth={1.5}
          markerEnd="url(#arrowhead)"
          opacity={arr3T}
          strokeDasharray="3 4"
        />
        <text
          x={(ARR[2].x1 + ARR[2].x2) / 2} y={ARR[2].y - 9}
          textAnchor="middle" fontSize={8}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} letterSpacing="0.08em"
          fill="rgba(209,193,255,0.45)"
          opacity={arr3T}
          style={{ textTransform: "uppercase" }}
        >
          improved
        </text>

        {/* ════════════════════════════════════════════════════════ */}
        {/* CIRCLE 4 — the final ring, brighter, becomes flywheel  */}
        {/* ════════════════════════════════════════════════════════ */}
        <circle
          cx={CX4} cy={CY} r={R}
          fill="none" stroke="url(#jb-grad4)"
          strokeWidth={2.5} strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - sweep4)}
          opacity={sweep4}
          filter="url(#jb-glow)"
          style={{ transformOrigin: `${CX4}px ${CY}px`, transform: "rotate(-90deg)" }}
        />
        {/* C4 dots */}
        {cp4.map((pos, i) => {
          const isActive = i === ai4 && sweep4 < 0.98;
          const isDone   = ai4 > i || sweep4 >= 0.98;
          return (
            <g key={`c4d-${i}`} opacity={clamp01(sweep4 * 4)}>
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={10}
                  fill="rgba(155,109,255,0.22)" stroke="rgba(155,109,255,0.45)" strokeWidth={1}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y} r={isActive ? 5.5 : 4}
                fill={isActive ? "#9B6DFF" : isDone ? "rgba(155,109,255,0.75)" : "rgba(209,193,255,0.25)"}
                stroke={isActive ? "#9B6DFF" : isDone ? "rgba(155,109,255,0.85)" : "rgba(209,193,255,0.3)"}
                strokeWidth={1}
              />
            </g>
          );
        })}
        <text
          x={CX4} y={CY - R - 14}
          textAnchor="middle" fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700} fill="#9B6DFF"
          opacity={sweep4}
        >
          Cycle 4
        </text>
        <text
          x={CX4} y={CY + R + 22}
          textAnchor="middle" fontSize={9}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} fill="rgba(240,236,255,0.5)"
          opacity={sweep4}
        >
          12 wks
        </text>

        {/* ── Phase 5: "with every iteration" annotation ── */}
        <text
          x={W / 2} y={H - 18}
          textAnchor="middle" fontSize={10}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={600} letterSpacing="0.12em"
          fill="rgba(209,193,255,0.45)"
          opacity={afterTextT}
          style={{ textTransform: "uppercase" }}
        >
          Every iteration builds on the last
        </text>
      </svg>

      {/* ── Phase 5: JOURNEY_AFTER_LINE ── */}
      <div
        className="mt-1 text-center"
        style={{
          opacity: afterTextT,
          transform: `translateY(${(1 - afterTextT) * 14}px)`,
        }}
      >
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#9B6DFF]">
          The loop changes
        </p>
        <p className="mx-auto mt-3 max-w-[600px] font-sans text-[clamp(1.05rem,2vw,1.4rem)] font-bold leading-snug text-[#D1C1FF]">
          {JOURNEY_AFTER_LINE}
        </p>
      </div>
    </div>
  );
}

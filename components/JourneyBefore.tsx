"use client";

import { useMemo } from "react";
import { OLD_WAY_STAGES } from "@/lib/flywheelData";
import { clamp01, lerp, smoothstep01 } from "@/lib/animationUtils";

type Props = {
  /** 0..1 over the BEFORE → morph beat */
  progress: number;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Layout constants                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
const W = 800;
const H = 380;
const CX = W / 2;           // circle centre X
const CY = H / 2 + 20;     // circle centre Y (slightly below mid for headline room)
const R  = 110;             // circle radius
const N  = OLD_WAY_STAGES.length; // 6

/** Horizontal positions along the line */
const LINE_Y = CY;
const lineXs = Array.from({ length: N }, (_, i) =>
  lerp(80, W - 80, i / (N - 1)),
);

/** Circular positions — start from the left (9 o'clock), go clockwise */
const circlePositions = Array.from({ length: N }, (_, i) => {
  const angle = Math.PI + (i / N) * 2 * Math.PI; // start at left
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
});

/* ─────────────────────────────────────────────────────────────────────────── */
/* Catmull-Rom → cubic Bézier spline builder                                  */
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
  // suppress the unused 'p' variable from the outer scope
  void p;
  return d;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Approximate path length for stroke-dashoffset draw-in                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function approxPathLength(pts: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    len += Math.hypot(dx, dy);
  }
  return len * 1.15; // slight overestimate for smooth draw-in
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
export function JourneyBefore({ progress }: Props) {
  const p     = clamp01(progress);
  const sweep = smoothstep01(Math.min(1, p / 0.55));
  const morph = smoothstep01(Math.max(0, (p - 0.45) / 0.55));

  const introOpacity  = Math.max(0, 1 - morph * 1.6);
  const labelOpacity  = Math.max(0, 1 - morph * 2.0);
  const taglineOpacity = morph;

  /* interpolated dot positions */
  const dots = useMemo(
    () =>
      OLD_WAY_STAGES.map((st, i) => ({
        ...st,
        x: lerp(lineXs[i], circlePositions[i].x, morph),
        y: lerp(LINE_Y,    circlePositions[i].y, morph),
        active: Math.floor(sweep * (N + 0.4)) === i,
        done:   Math.floor(sweep * (N + 0.4)) > i || sweep >= 0.98,
      })),
    [morph, sweep],
  );

  /* spline path through all 6 dots */
  const pathClosed = morph > 0.85;
  const pathD = useMemo(
    () => catmullRomToBezier(dots.map(d => ({ x: d.x, y: d.y })), pathClosed, 0.45),
    [dots, pathClosed],
  );

  /* stroke-dashoffset draw-in (only active during sweep, pre-morph) */
  const pathLen   = useMemo(
    () => approxPathLength(dots.map(d => ({ x: d.x, y: d.y }))),
    [dots],
  );
  const dashArray  = pathLen;
  const dashOffset = pathLen * (1 - sweep);

  /* closing arc opacity */
  const closingOpacity = clamp01((morph - 0.75) / 0.25);

  /* active stage index for dot glow */
  const activeIdx = Math.floor(sweep * (N + 0.4));

  return (
    <div className="relative mx-auto w-full max-w-[900px]">
      {/* Headline — fades out as morph progresses */}
      <div
        className="text-center"
        style={{ opacity: introOpacity, transform: `translateY(${-morph * 14}px)` }}
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

      {/* Single SVG — everything morphs inside it */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-6 w-full"
        style={{ overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="jb-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F87171" stopOpacity="0.9" />
            <stop offset="45%"  stopColor="#D551C9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F7B334" stopOpacity="0.9" />
          </linearGradient>
          <filter id="jb-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint straight track (fades as morph increases) */}
        <line
          x1={80} y1={LINE_Y} x2={W - 80} y2={LINE_Y}
          stroke="rgba(209,193,255,0.08)"
          strokeWidth={1}
          opacity={1 - morph}
        />

        {/* Faint circle guide (fades in as morph increases) */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="rgba(209,193,255,0.08)"
          strokeWidth={1}
          opacity={morph}
        />

        {/* Animated spline path */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#jb-grad)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          filter="url(#jb-glow)"
        />

        {/* Closing arc overlay — snaps the circle shut at morph ≈ 1 */}
        {closingOpacity > 0 && (
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="url(#jb-grad)"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={closingOpacity}
            filter="url(#jb-glow)"
          />
        )}

        {/* Stage dots */}
        {dots.map((dot, i) => {
          const isActive = i === activeIdx && sweep < 0.98;
          const isDone   = activeIdx > i || sweep >= 0.98;
          return (
            <g key={dot.label}>
              {/* Glow ring for active dot */}
              {isActive && (
                <circle
                  cx={dot.x} cy={dot.y} r={10}
                  fill="rgba(213,81,201,0.18)"
                  stroke="rgba(213,81,201,0.35)"
                  strokeWidth={1}
                />
              )}
              <circle
                cx={dot.x}
                cy={dot.y}
                r={isActive ? 5.5 : 4}
                fill={
                  isActive ? "#D551C9"
                  : isDone  ? "rgba(213,81,201,0.6)"
                  :           "rgba(209,193,255,0.22)"
                }
                stroke={
                  isActive ? "#D551C9"
                  : isDone  ? "rgba(213,81,201,0.7)"
                  :           "rgba(209,193,255,0.3)"
                }
                strokeWidth={1}
              />

              {/* Stage label — fades out as morph progresses */}
              <text
                x={dot.x}
                y={dot.y + 24}
                textAnchor="middle"
                fontSize={11}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={700}
                letterSpacing="0.02em"
                fill="rgba(240,236,255,0.95)"
                style={{
                  textTransform: "uppercase",
                  opacity: labelOpacity,
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                }}
              >
                {dot.label}
              </text>
              <text
                x={dot.x}
                y={dot.y + 37}
                textAnchor="middle"
                fontSize={9}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={600}
                fill="#D1C1FF"
                style={{ opacity: labelOpacity * 0.9 }}
              >
                {dot.time}
              </text>
            </g>
          );
        })}
      </svg>

      {/* "The line bends into a loop" tagline */}
      <div
        className="mt-2 text-center"
        style={{
          opacity: taglineOpacity,
          transform: `translateY(${(1 - taglineOpacity) * 8}px)`,
        }}
      >
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#D551C9]">
          The line bends into a loop
        </p>
      </div>
    </div>
  );
}

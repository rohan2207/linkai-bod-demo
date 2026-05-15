"use client";

import { useMemo } from "react";
import { OLD_WAY_STAGES, JOURNEY_AFTER_LINE } from "@/lib/flywheelData";
import { clamp01, lerp, remap, smoothstep01 } from "@/lib/animationUtils";

type Props = {
  /** 0..1 over the full BEFORE → multi-circle → text beat */
  progress: number;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Layout constants                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
const W  = 800;
const H  = 420;
const CX = W / 2;
const CY = H / 2 + 10;
const N  = OLD_WAY_STAGES.length; // 6

/* Three circle radii — outer = slow waterfall, inner = continuous */
const R1 = 130;   // "12 wks per cycle"
const R2 = 96;    // "~6 wks"
const R3 = 64;    // "Continuous"

/* Circumferences for stroke-dashoffset draw-in */
const CIRC1 = 2 * Math.PI * R1;
const CIRC2 = 2 * Math.PI * R2;
const CIRC3 = 2 * Math.PI * R3;

/** Horizontal positions along the line (Phase 0 only) */
const LINE_Y = CY;
const lineXs = Array.from({ length: N }, (_, i) => lerp(80, W - 80, i / (N - 1)));

/** Circular positions — start from the left (9 o'clock), go clockwise */
function makeCirclePositions(r: number) {
  return Array.from({ length: N }, (_, i) => {
    const angle = Math.PI + (i / N) * 2 * Math.PI;
    return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
  });
}

const cp1 = makeCirclePositions(R1);
const cp2 = makeCirclePositions(R2);
const cp3 = makeCirclePositions(R3);

/* ─────────────────────────────────────────────────────────────────────────── */
/* Catmull-Rom → cubic Bézier spline builder (Phase 0 only)                   */
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

  /* ── Phase 0: line draw + morph to Circle 1 (p: 0 → 0.30) ── */
  const sweep  = smoothstep01(clamp01(remap(p, 0, 0.22)));
  const morph1 = smoothstep01(clamp01(remap(p, 0.16, 0.30)));

  /* ── Phase 1: Circle 2 materialises (p: 0.30 → 0.52) ── */
  const appear2 = smoothstep01(clamp01(remap(p, 0.30, 0.46)));
  const ghost1  = smoothstep01(clamp01(remap(p, 0.32, 0.50))); // C1 → ghost

  /* ── Phase 2: Circle 3 materialises (p: 0.54 → 0.74) ── */
  const appear3 = smoothstep01(clamp01(remap(p, 0.54, 0.70)));
  const ghost2  = smoothstep01(clamp01(remap(p, 0.56, 0.72))); // C2 → ghost

  /* ── Phase 3: "small iterations" text reveal (p: 0.75 → 0.90) ── */
  const afterTextT = smoothstep01(clamp01(remap(p, 0.75, 0.90)));

  /* headline fades as C2 appears */
  const introOpacity  = 1 - smoothstep01(clamp01(remap(p, 0.28, 0.44)));
  /* label opacities: visible while active, fade when ghosted */
  const c1LabelOpacity = morph1 * (1 - ghost1);
  const c2LabelOpacity = appear2 * (1 - ghost2);
  const c3LabelOpacity = appear3;
  /* ghost track opacities */
  const c1GhostOp = ghost1 * 0.20;
  const c2GhostOp = ghost2 * 0.20;

  /* ── Phase 0 spline through morphing dots ── */
  const activeIdx   = Math.floor(sweep * (N + 0.4));
  const pathClosed  = morph1 > 0.85;
  const dots1 = useMemo(
    () =>
      OLD_WAY_STAGES.map((st, i) => ({
        ...st,
        x: lerp(lineXs[i], cp1[i].x, morph1),
        y: lerp(LINE_Y,    cp1[i].y, morph1),
      })),
    [morph1],
  );
  const pathD = useMemo(
    () => catmullRomToBezier(dots1.map((d) => ({ x: d.x, y: d.y })), pathClosed, 0.45),
    [dots1, pathClosed],
  );
  const pathLen    = useMemo(() => approxPathLength(dots1.map((d) => ({ x: d.x, y: d.y }))), [dots1]);
  const dashOffset = pathLen * (1 - sweep);
  const closingOp  = clamp01(remap(morph1, 0.75, 1.0)) * (1 - ghost1);

  /* "Same loop" sub-caption, visible only during Phase 1 */
  const loopCaption = appear2 * (1 - appear3);

  return (
    <div className="relative mx-auto w-full max-w-[900px]">
      {/* Headline — fades out as C2 arrives */}
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

      {/* "Same loop — getting faster." sub-caption during Phase 1 */}
      <div
        className="text-center"
        style={{
          opacity: loopCaption,
          transform: `translateY(${(1 - loopCaption) * 8}px)`,
          marginTop: introOpacity > 0.05 ? 0 : undefined,
        }}
      >
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[#D551C9]">
          Same loop - getting faster
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
          {/* C1 — warm red gradient */}
          <linearGradient id="jb-grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#F87171" stopOpacity="0.95" />
            <stop offset="50%"  stopColor="#D551C9" stopOpacity="0.90" />
            <stop offset="100%" stopColor="#F7B334" stopOpacity="0.95" />
          </linearGradient>
          {/* C2 — pink/purple gradient */}
          <linearGradient id="jb-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#D551C9" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#9B6DFF" stopOpacity="0.95" />
          </linearGradient>
          {/* C3 — bright purple gradient */}
          <linearGradient id="jb-grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#9B6DFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#6EE7F7" stopOpacity="0.90" />
          </linearGradient>
          <filter id="jb-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="jb-glow-soft">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── GHOST RINGS — persistent dim tracks once ghosted ── */}
        <circle
          cx={CX} cy={CY} r={R1}
          fill="none" stroke="rgba(248,113,113,0.5)" strokeWidth={1.5}
          strokeDasharray="4 6"
          opacity={c1GhostOp}
        />
        <circle
          cx={CX} cy={CY} r={R2}
          fill="none" stroke="rgba(213,81,201,0.5)" strokeWidth={1.5}
          strokeDasharray="4 6"
          opacity={c2GhostOp}
        />

        {/* ── PHASE 0: straight track + morphing spline ── */}
        <line
          x1={80} y1={LINE_Y} x2={W - 80} y2={LINE_Y}
          stroke="rgba(209,193,255,0.08)"
          strokeWidth={1}
          opacity={1 - morph1}
        />
        <circle
          cx={CX} cy={CY} r={R1}
          fill="none"
          stroke="rgba(209,193,255,0.06)"
          strokeWidth={1}
          opacity={morph1}
        />
        <path
          d={pathD}
          fill="none"
          stroke="url(#jb-grad1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
          filter="url(#jb-glow)"
          opacity={1 - ghost1}
        />
        {/* Closing arc once morph ≈ 1 */}
        {closingOp > 0 && (
          <circle
            cx={CX} cy={CY} r={R1}
            fill="none"
            stroke="url(#jb-grad1)"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={closingOp}
            filter="url(#jb-glow)"
          />
        )}

        {/* Phase 0 dots */}
        {dots1.map((dot, i) => {
          const isActive = i === activeIdx && sweep < 0.98;
          const isDone   = activeIdx > i || sweep >= 0.98;
          return (
            <g key={dot.label} opacity={1 - ghost1}>
              {isActive && (
                <circle cx={dot.x} cy={dot.y} r={10} fill="rgba(213,81,201,0.18)" stroke="rgba(213,81,201,0.35)" strokeWidth={1} />
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
                style={{ textTransform: "uppercase", opacity: c1LabelOpacity, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}
              >
                {dot.label}
              </text>
              <text
                x={dot.x} y={dot.y + 37}
                textAnchor="middle" fontSize={9}
                fontFamily="'Montserrat', system-ui, sans-serif"
                fontWeight={600}
                fill="#D1C1FF"
                style={{ opacity: c1LabelOpacity * 0.9 }}
              >
                {dot.time}
              </text>
            </g>
          );
        })}

        {/* C1 cycle-time badge — top of ring */}
        <text
          x={CX} y={CY - R1 - 16}
          textAnchor="middle" fontSize={11}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700}
          fill="#F87171"
          opacity={c1LabelOpacity}
        >
          12 wks per cycle
        </text>

        {/* ── PHASE 1: Circle 2 draw-in ── */}
        <circle
          cx={CX} cy={CY} r={R2}
          fill="none"
          stroke="url(#jb-grad2)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={CIRC2}
          strokeDashoffset={CIRC2 * (1 - appear2)}
          opacity={appear2 * (1 - ghost2)}
          filter="url(#jb-glow-soft)"
          style={{ transformOrigin: `${CX}px ${CY}px`, transform: "rotate(-90deg)" }}
        />
        {/* C2 dots */}
        {cp2.map((pos, i) => (
          <circle
            key={`c2d-${i}`}
            cx={pos.x} cy={pos.y} r={4}
            fill="#D551C9" stroke="rgba(213,81,201,0.4)" strokeWidth={1}
            opacity={appear2 * (1 - ghost2)}
          />
        ))}
        {/* C2 badge */}
        <text
          x={CX} y={CY - R2 - 14}
          textAnchor="middle" fontSize={11}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700}
          fill="#D551C9"
          opacity={c2LabelOpacity}
        >
          ~6 wks
        </text>

        {/* ── PHASE 2: Circle 3 draw-in ── */}
        <circle
          cx={CX} cy={CY} r={R3}
          fill="none"
          stroke="url(#jb-grad3)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={CIRC3}
          strokeDashoffset={CIRC3 * (1 - appear3)}
          opacity={appear3}
          filter="url(#jb-glow)"
          style={{ transformOrigin: `${CX}px ${CY}px`, transform: "rotate(-90deg)" }}
        />
        {/* C3 dots */}
        {cp3.map((pos, i) => (
          <circle
            key={`c3d-${i}`}
            cx={pos.x} cy={pos.y} r={4}
            fill="#9B6DFF" stroke="rgba(155,109,255,0.4)" strokeWidth={1}
            opacity={appear3}
          />
        ))}
        {/* C3 badge */}
        <text
          x={CX} y={CY - R3 - 12}
          textAnchor="middle" fontSize={11}
          fontFamily="'Montserrat', system-ui, sans-serif"
          fontWeight={700}
          fill="#9B6DFF"
          opacity={c3LabelOpacity}
        >
          Continuous
        </text>

        {/* ── Concentric ring "compression" labels on the right side ── */}
        {/* These appear once all 3 rings are visible, anchoring the narrative */}
        {appear3 > 0.3 && (
          <>
            <text
              x={CX + R1 + 18} y={CY + 5}
              textAnchor="start" fontSize={10}
              fontFamily="'Montserrat', system-ui, sans-serif"
              fontWeight={600} fill="#F87171"
              opacity={(appear3 - 0.3) / 0.5 * c1GhostOp * 5}
            >
              12 wks
            </text>
            <text
              x={CX + R2 + 18} y={CY + 5}
              textAnchor="start" fontSize={10}
              fontFamily="'Montserrat', system-ui, sans-serif"
              fontWeight={600} fill="#D551C9"
              opacity={(appear3 - 0.3) / 0.5 * c2GhostOp * 5}
            >
              6 wks
            </text>
            <text
              x={CX + R3 + 18} y={CY + 5}
              textAnchor="start" fontSize={10}
              fontFamily="'Montserrat', system-ui, sans-serif"
              fontWeight={600} fill="#9B6DFF"
              opacity={clamp01((appear3 - 0.3) / 0.5)}
            >
              days
            </text>
          </>
        )}
      </svg>

      {/* ── PHASE 3: "Small iterations. Tight feedback." text reveal ── */}
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

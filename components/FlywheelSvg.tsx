"use client";

import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useId,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import { createTimeline } from "animejs";
import { FLYWHEEL_STEPS } from "@/lib/flywheelData";
import { FW_CX, FW_CY, FW_RO, FW_RI, fwPolar, fwSegMidpoints } from "@/lib/flywheelGeometry";

type Props = {
  activeIndex: number;
  className?: string;
};

export const FlywheelSvg = forwardRef<SVGSVGElement, Props>(function FlywheelSvg(
  { activeIndex, className },
  ref,
) {
  const uid = useId().replace(/:/g, "");
  const cgId = `cg-${uid}`;
  const localRef = useRef<SVGSVGElement | null>(null);
  const shellRefs = useRef<(SVGGElement | null)[]>([]);
  const innerRefs = useRef<(SVGGElement | null)[]>([]);

  const setRefs = useCallback(
    (node: SVGSVGElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as MutableRefObject<SVGSVGElement | null>).current = node;
    },
    [ref],
  );

  const N = FLYWHEEL_STEPS.length;
  const segments = useMemo(() => {
    const geo = fwSegMidpoints(N);
    return FLYWHEEL_STEPS.map((s, i) => ({ ...s, ...geo[i] }));
  }, [N]);

  useLayoutEffect(() => {
    const tl = createTimeline({ defaults: { ease: "out(4)" } });

    for (let i = 0; i < segments.length; i++) {
      const shell = shellRefs.current[i];
      const inner = innerRefs.current[i];
      if (!shell || !inner) continue;

      const dist = Math.abs(i - activeIndex);
      const ringDist = Math.min(dist, segments.length - dist);
      const active = ringDist === 0;
      const near = ringDist === 1;

      tl.add(
        shell,
        {
          scale: active ? 1.13 : near ? 1.02 : 0.94,
          y: active ? -3.4 : near ? -1.1 : 0,
          rotateZ: active ? -2 : 0,
          duration: active ? 520 : 360,
        },
        0,
      );

      tl.add(
        inner,
        {
          opacity: active ? 1 : near ? 0.74 : 0.38,
          filter: `brightness(${active ? 1.18 : near ? 1.04 : 0.82}) saturate(${active ? 1.24 : near ? 1.05 : 0.68})`,
          duration: active ? 520 : 340,
        },
        0,
      );
    }

    const activeShell = shellRefs.current[activeIndex];
    if (activeShell) {
      tl.add(
        activeShell,
        {
          keyframes: [
            { scale: 1.17, duration: 120 },
            { scale: 1.13, duration: 240 },
          ],
        },
        70,
      );
    }

    return () => {
      tl.revert();
    };
  }, [activeIndex, segments.length]);

  return (
    <svg
      ref={setRefs}
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        {segments.map((_, i) => (
          <filter key={i} id={`gf-${uid}-${i}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={i === activeIndex ? 3.2 : 2} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
        <radialGradient id={cgId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(98,62,221,.3)" />
          <stop offset="100%" stopColor="rgba(12,9,22,.95)" />
        </radialGradient>
        <marker id={`arr-${uid}`} markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
          <path d="M 0 0 L 5 2.5 L 0 5 z" fill="rgba(209,193,255,.25)" />
        </marker>
      </defs>
      <circle
        cx={FW_CX}
        cy={FW_CY}
        r={(FW_RO + FW_RI) / 2}
        fill="none"
        stroke="rgba(209,193,255,.05)"
        strokeWidth={FW_RO - FW_RI}
      />
      {segments.map((s, i) => {
        const active = i === activeIndex;
        const base = active ? 1.06 : 0.96;
        return (
          <g
            key={s.id}
            data-fw-seg={i}
            data-step={i}
            ref={(node) => {
              shellRefs.current[i] = node;
            }}
            transform={`translate(${s.lx} ${s.ly}) scale(${base}) translate(${-s.lx} ${-s.ly})`}
            style={{
              filter: active ? `drop-shadow(0 0 14px ${s.color}99)` : undefined,
              transformBox: "fill-box",
              transformOrigin: "center",
              willChange: "transform",
            }}
          >
            <g
              className="fw-seg-inner"
              ref={(node) => {
                innerRefs.current[i] = node;
              }}
              style={{ willChange: "opacity, filter" }}
            >
              <path
                d={s.d}
                fill={s.color}
                filter={`url(#gf-${uid}-${i})`}
                stroke={active ? "rgba(255,255,255,.35)" : "none"}
                strokeWidth={active ? 0.35 : 0}
                style={{
                  opacity: active ? 1 : 0.32,
                }}
              />
              <text
                x={s.lx}
                y={s.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-space), system-ui, sans-serif"
                fontSize={6}
                fontWeight={500}
                fill="rgba(240,236,255,.9)"
                style={{ opacity: active ? 1 : 0.55 }}
                transform={`rotate(${s.md - 90}, ${s.lx}, ${s.ly})`}
              >
                {s.label}
              </text>
            </g>
          </g>
        );
      })}
      <circle
        cx={FW_CX}
        cy={FW_CY}
        r={FW_RI - 2}
        fill={`url(#${cgId})`}
        stroke="rgba(209,193,255,.1)"
        strokeWidth={0.5}
      />
      {(() => {
        const ar2 = FW_RI - 9;
        const [aa1x, aa1y] = fwPolar(ar2, 35);
        const [aa2x, aa2y] = fwPolar(ar2, 315);
        return (
          <path
            d={`M${aa1x} ${aa1y}A${ar2} ${ar2} 0 1 0 ${aa2x} ${aa2y}`}
            fill="none"
            stroke="rgba(209,193,255,.12)"
            strokeWidth={0.8}
            strokeDasharray="2 3"
            markerEnd={`url(#arr-${uid})`}
          />
        );
      })()}
    </svg>
  );
});

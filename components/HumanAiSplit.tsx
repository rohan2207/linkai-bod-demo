"use client";

import {
  BarChart3,
  Compass,
  Network,
  Scale,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FlywheelHumanAi, FlywheelHumanAiSide } from "@/lib/flywheelData";

const ICONS: Record<string, LucideIcon> = {
  Compass,
  Scale,
  Users,
  BarChart3,
  Network,
  Sparkles,
};

const HUMAN_DEFAULT = "#F7B334";
const AI_DEFAULT = "#9B6DFF";

function SideCard({
  side,
  role,
  accentFallback,
}: {
  side: FlywheelHumanAiSide;
  role: "human" | "ai";
  accentFallback: string;
}) {
  const accent = side.accent ?? accentFallback;
  const isAi = role === "ai";

  return (
    <div
      className="relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-white/[0.1] bg-[rgba(18,12,32,0.7)] p-4 backdrop-blur-md"
      style={{
        boxShadow: `0 18px 48px rgba(0,0,0,0.45), inset 0 0 0 1px ${accent}22, 0 0 28px ${accent}1f`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)` }}
        aria-hidden
      />

      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-2 py-[3px] text-[0.52rem] font-semibold uppercase tracking-[0.2em]"
          style={{
            color: accent,
            background: `${accent}1a`,
            border: `1px solid ${accent}55`,
          }}
        >
          {isAi ? "AI" : "Human"}
        </span>
        <p className="truncate text-[0.78rem] font-medium text-white">{side.label}</p>
      </div>

      <p className="font-serif text-[0.98rem] font-light italic leading-snug text-[rgba(240,236,255,0.92)]">
        {side.tagline}
      </p>

      <ul className="mt-1 flex flex-col gap-2">
        {side.items.map((item) => {
          const Icon = item.icon ? ICONS[item.icon] : null;
          return (
            <li key={item.text} className="flex items-start gap-2.5">
              <span
                className="mt-[2px] flex size-6 shrink-0 items-center justify-center rounded-md"
                style={{ background: `${accent}22`, color: accent }}
                aria-hidden
              >
                {Icon ? <Icon className="size-3.5" strokeWidth={1.6} /> : null}
              </span>
              <span className="text-[0.82rem] font-medium leading-snug text-[rgba(240,236,255,0.94)]">
                {item.text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function HumanAiSplit({ data }: { data: FlywheelHumanAi }) {
  const humanAccent = data.human.accent ?? HUMAN_DEFAULT;
  const aiAccent = data.ai.accent ?? AI_DEFAULT;
  const aiPct = typeof data.aiPercent === "number" ? Math.max(0, Math.min(100, data.aiPercent)) : null;
  const humanPct = aiPct == null ? null : 100 - aiPct;

  return (
    <div className="flex flex-col gap-3">
      {aiPct != null ? (
        <div className="rounded-lg border border-white/[0.06] bg-[rgba(12,9,22,0.5)] px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.2em]">
            <span className="flex items-center gap-1.5" style={{ color: humanAccent }}>
              <span className="size-1.5 rounded-full" style={{ background: humanAccent }} />
              Human · {humanPct}%
            </span>
            <span className="flex items-center gap-1.5" style={{ color: aiAccent }}>
              AI · {aiPct}%
              <span className="size-1.5 rounded-full" style={{ background: aiAccent }} />
            </span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <span
              className="absolute inset-y-0 left-0"
              style={{
                width: `${humanPct}%`,
                background: `linear-gradient(90deg, ${humanAccent}cc, ${humanAccent}66)`,
              }}
            />
            <span
              className="absolute inset-y-0 right-0"
              style={{
                width: `${aiPct}%`,
                background: `linear-gradient(270deg, ${aiAccent}cc, ${aiAccent}66)`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <SideCard side={data.human} role="human" accentFallback={HUMAN_DEFAULT} />
        <SideCard side={data.ai} role="ai" accentFallback={AI_DEFAULT} />
      </div>
    </div>
  );
}

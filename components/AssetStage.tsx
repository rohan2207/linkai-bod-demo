"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  url: string;
  browserUrl: string;
  placeholderLabel: string;
  accent?: string;
};

export function AssetStage({ url, browserUrl, placeholderLabel, accent }: Props) {
  const [ok, setOk] = useState(true);

  return (
    <div
      className={cn(
        "mt-4 overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(12,9,22,0.55)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl",
        "ring-1 ring-inset ring-white/[0.06]",
      )}
      style={
        accent
          ? ({ boxShadow: `0 24px 80px rgba(0,0,0,0.45), 0 0 60px ${accent}22` } as React.CSSProperties)
          : undefined
      }
    >
      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-gradient-to-b from-[rgba(30,25,45,0.95)] to-[rgba(18,14,30,0.9)] px-3 py-2">
        <div className="flex shrink-0 gap-1.5">
          <span className="size-2 rounded-full bg-[#ff5f57] opacity-60" />
          <span className="size-2 rounded-full bg-[#febc2e] opacity-60" />
          <span className="size-2 rounded-full bg-[#28c840] opacity-60" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md border border-white/[0.06] bg-black/25 px-2 py-1 font-mono text-[0.58rem] tracking-wide text-[rgba(209,193,255,0.35)]">
          {browserUrl}
        </div>
      </div>
      <div className="relative aspect-video min-h-[160px] bg-gradient-to-br from-[rgba(98,62,221,0.08)] to-[rgba(12,9,22,0.95)]">
        {ok ? (
          <Image
            src={url}
            alt=""
            fill
            className="object-cover opacity-90"
            sizes="(max-width: 768px) 100vw, 640px"
            onError={() => setOk(false)}
            unoptimized
          />
        ) : null}
        {!ok ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[rgba(209,193,255,0.25)] to-transparent" aria-hidden />
            <p className="max-w-xs text-[0.58rem] uppercase leading-relaxed tracking-[0.2em] text-[rgba(209,193,255,0.28)]">
              {placeholderLabel}
            </p>
            <p className="text-[0.55rem] text-[rgba(209,193,255,0.18)]">Optional: add PNG to /public/assets/</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

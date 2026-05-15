"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { chartFont } from "@/lib/chartTheme";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const ACCENT = "#F7674A";
const PURPLE = "#9B6DFF";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Frame 1 — The Scale Shift                                                   */
/* Pure typography: before (dim) vs after (glowing). No chart.                 */
/* ─────────────────────────────────────────────────────────────────────────── */

const BEFORE = [
  { label: "Tests per release", value: "71" },
  { label: "Test files",        value: "30" },
  { label: "Assertions",        value: "~145" },
  { label: "Acceptance tests",  value: "0" },
];

const AFTER = [
  { label: "Tests per release", value: "2,600" },
  { label: "Test files",        value: "237" },
  { label: "Assertions",        value: "4,200" },
  { label: "Acceptance tests",  value: "43" },
];

export function ValidateFrame1() {
  return (
    <div className="flex h-full w-full items-stretch">
      {/* Before */}
      <div className="flex flex-1 flex-col justify-center gap-5 px-6 py-4">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[rgba(209,193,255,0.3)]">
          Nov 2025
        </p>
        {BEFORE.map((row) => (
          <div key={row.label}>
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-[rgba(209,193,255,0.28)]">
              {row.label}
            </p>
            <p className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-light text-[rgba(209,193,255,0.22)] leading-tight">
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="flex flex-col items-center justify-center gap-1 py-6">
        <div className="w-px flex-1" style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}66, transparent)` }} />
        <span className="rotate-90 text-[0.5rem] font-medium uppercase tracking-widest text-[rgba(209,193,255,0.2)]">
          vs
        </span>
        <div className="w-px flex-1" style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}66, transparent)` }} />
      </div>

      {/* After */}
      <div className="flex flex-1 flex-col justify-center gap-5 px-6 py-4">
        <p
          className="text-[0.6rem] font-semibold uppercase tracking-[0.28em]"
          style={{ color: ACCENT }}
        >
          May 2026
        </p>
        {AFTER.map((row, i) => (
          <div key={row.label}>
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-[rgba(209,193,255,0.45)]">
              {row.label}
            </p>
            <p
              className="font-serif text-[clamp(1.4rem,2.8vw,2rem)] font-semibold leading-tight text-white"
              style={{ textShadow: i < 2 ? `0 0 20px ${ACCENT}55` : undefined }}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Frame 2 — The One Number                                                    */
/* Two bars only (Nov vs May), "+690%" floating badge on the May bar.          */
/* ─────────────────────────────────────────────────────────────────────────── */
export function ValidateFrame2() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-2 px-8 py-4">
      {/* The big number — anchors attention before the eye goes to the chart */}
      <div className="text-center">
        <p
          className="font-serif text-[clamp(3rem,7vw,5.5rem)] font-bold leading-none tracking-tight"
          style={{ color: ACCENT, textShadow: `0 0 48px ${ACCENT}66` }}
        >
          +690%
        </p>
        <p className="mt-1 text-[0.75rem] font-medium text-[rgba(209,193,255,0.55)] uppercase tracking-[0.2em]">
          test file growth · 6 months
        </p>
      </div>

      {/* Two-bar chart — just context, the number is the hero */}
      <div className="relative mt-4 h-[110px] w-full max-w-[280px]">
        <Bar
          data={{
            labels: ["Nov 2025", "May 2026"],
            datasets: [
              {
                data: [30, 237],
                backgroundColor: [
                  "rgba(209,193,255,0.12)",
                  PURPLE + "cc",
                ],
                borderWidth: 0,
                borderRadius: 4,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            font: { family: chartFont, size: 10 },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(12,9,22,.95)",
                borderColor: "rgba(209,193,255,.14)",
                borderWidth: 1,
                titleColor: "rgba(209,193,255,.9)",
                bodyColor: "rgba(209,193,255,.6)",
                padding: 8,
                callbacks: { label: (c) => `  ${c.parsed.y} test files` },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: "rgba(209,193,255,0.4)", font: { size: 9 } },
                border: { display: false },
              },
              y: {
                display: false,
              },
            },
          }}
        />
        {/* Floating "237 files" label on May bar */}
        <div
          className="pointer-events-none absolute right-[14%] top-[4px] rounded-sm px-1.5 py-0.5 text-[0.58rem] font-semibold text-white"
          style={{ background: PURPLE + "cc" }}
        >
          237 files
        </div>
      </div>
    </div>
  );
}

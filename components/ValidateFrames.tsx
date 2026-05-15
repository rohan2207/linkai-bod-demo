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

/* ─────────────────────────────────────────────────────────────────────────── */
/* Single combined frame — before/after numbers (left) + +690% stat (right)  */
/* ─────────────────────────────────────────────────────────────────────────── */
export function ValidateFrame1() {
  return (
    <div className="flex h-full w-full gap-0">

      {/* LEFT — before / after numbers */}
      <div className="flex flex-1 items-stretch">
        {/* Before column */}
        <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-4">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-[rgba(209,193,255,0.3)]">
            Nov 2025
          </p>
          {BEFORE.map((row) => (
            <div key={row.label}>
              <p className="text-[0.55rem] uppercase tracking-[0.14em] text-[rgba(209,193,255,0.28)]">
                {row.label}
              </p>
              <p className="font-sans text-[clamp(1.15rem,2.2vw,1.65rem)] font-light leading-tight text-[rgba(209,193,255,0.22)]">
                {row.value}
              </p>
            </div>
          ))}
        </div>

        {/* vs divider */}
        <div className="flex flex-col items-center justify-center gap-1 py-6">
          <div
            className="w-px flex-1"
            style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}55, transparent)` }}
          />
          <span className="rotate-90 text-[0.45rem] font-medium uppercase tracking-widest text-[rgba(209,193,255,0.2)]">
            vs
          </span>
          <div
            className="w-px flex-1"
            style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}55, transparent)` }}
          />
        </div>

        {/* After column */}
        <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-4">
          <p
            className="text-[0.58rem] font-semibold uppercase tracking-[0.28em]"
            style={{ color: ACCENT }}
          >
            May 2026
          </p>
          {AFTER.map((row, i) => (
            <div key={row.label}>
              <p className="text-[0.55rem] uppercase tracking-[0.14em] text-[rgba(209,193,255,0.45)]">
                {row.label}
              </p>
              <p
                className="font-sans text-[clamp(1.15rem,2.2vw,1.65rem)] font-semibold leading-tight text-white"
                style={{ textShadow: i < 2 ? `0 0 18px ${ACCENT}55` : undefined }}
              >
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Vertical divider */}
      <div
        className="my-6 w-px self-stretch"
        style={{ background: "rgba(209,193,255,0.07)" }}
      />

      {/* RIGHT — +690% big number + mini bar */}
      <div className="flex w-[40%] flex-col items-center justify-center gap-3 px-4 py-6">
        <p
          className="font-sans text-[clamp(2.6rem,6vw,4.8rem)] font-bold leading-none tracking-tight"
          style={{ color: ACCENT, textShadow: `0 0 40px ${ACCENT}66` }}
        >
          +690%
        </p>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[rgba(209,193,255,0.5)] text-center">
          test file growth<br />6 months
        </p>

        <div className="relative mt-2 h-[90px] w-full max-w-[200px]">
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
              font: { family: chartFont, size: 9 },
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
                  ticks: { color: "rgba(209,193,255,0.4)", font: { size: 8 } },
                  border: { display: false },
                },
                y: { display: false },
              },
            }}
          />
          <div
            className="pointer-events-none absolute right-[10%] top-[4px] rounded-sm px-1.5 py-0.5 text-[0.55rem] font-semibold text-white"
            style={{ background: PURPLE + "cc" }}
          >
            237 files
          </div>
        </div>
      </div>

    </div>
  );
}

/* Keep exported so any stale imports don't break the build */
export function ValidateFrame2() { return <ValidateFrame1 />; }

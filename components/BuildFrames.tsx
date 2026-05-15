"use client";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { CHART_PR } from "@/lib/flywheelData";
import { chartFont } from "@/lib/chartTheme";

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

const PURPLE = "#9B6DFF";
const CORAL  = "#C4405E";
const GREEN  = "#4ADE80";
const TICK   = "rgba(209,193,255,0.28)";
const GRID   = "rgba(209,193,255,0.04)";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Frame 1 — The Scissors                                                      */
/* Bar+line chart stripped to its core. Floating annotation callouts name the  */
/* crossover. No axis titles, minimal ticks.                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
export function BuildFrame1() {
  return (
    <div className="relative flex h-full w-full flex-col px-2 pt-3 pb-2">
      {/* Floating annotations — positioned over the chart */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {/* "More releases" — top right, over the tall bars */}
        <div
          className="absolute right-[8%] top-[12%] flex items-center gap-1.5"
        >
          <span
            className="rounded-sm px-2 py-0.5 text-[0.65rem] font-bold text-white"
            style={{ background: PURPLE + "ee" }}
          >
            20 releases/week
          </span>
          <span className="text-[0.7rem] text-[rgba(209,193,255,0.5)]">↑</span>
        </div>
        {/* "Smaller diffs" — bottom right, over the low end of the coral line */}
        <div
          className="absolute bottom-[22%] right-[8%] flex items-center gap-1.5"
        >
          <span className="text-[0.7rem] text-[rgba(209,193,255,0.5)]">↓</span>
          <span
            className="rounded-sm px-2 py-0.5 text-[0.65rem] font-bold text-white"
            style={{ background: CORAL + "ee" }}
          >
            ~1k lines avg
          </span>
        </div>
      </div>

      <div className="relative flex-1">
        <Chart
          type="bar"
          data={{
            labels: CHART_PR.labels,
            datasets: [
              {
                type: "bar" as const,
                data: CHART_PR.bars,
                backgroundColor: PURPLE + "bb",
                borderWidth: 0,
                borderRadius: 3,
                yAxisID: "yL",
                order: 2,
              },
              {
                type: "line" as const,
                data: CHART_PR.lines,
                borderColor: CORAL,
                backgroundColor: "transparent",
                borderWidth: 2.5,
                pointBackgroundColor: CORAL,
                pointRadius: 2,
                tension: 0.35,
                spanGaps: true,
                yAxisID: "yR",
                order: 1,
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
                callbacks: {
                  label: (c) =>
                    c.datasetIndex === 0
                      ? `  PRs: ${c.parsed.y}`
                      : `  Lines: ${(c.parsed.y as number).toLocaleString()}`,
                },
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: TICK, font: { size: 7 }, maxRotation: 40, autoSkip: true, maxTicksLimit: 8 },
                border: { display: false },
              },
              yL: {
                type: "linear",
                position: "left",
                min: 0,
                max: 24,
                grid: { color: GRID },
                ticks: { color: TICK, font: { size: 7 }, stepSize: 8 },
                border: { display: false },
              },
              yR: {
                type: "linear",
                position: "right",
                min: 0,
                max: 10000,
                grid: { drawOnChartArea: false },
                ticks: {
                  color: TICK,
                  font: { size: 7 },
                  callback: (v) =>
                    Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v,
                },
                border: { display: false },
              },
            },
          }}
        />
      </div>

      {/* Minimal inline legend — below chart, no header */}
      <div className="flex justify-center gap-5 pt-1">
        <span className="flex items-center gap-1.5 text-[0.58rem] text-[rgba(209,193,255,0.4)]">
          <span className="size-2 rounded-full" style={{ background: PURPLE }} />
          Releases / week
        </span>
        <span className="flex items-center gap-1.5 text-[0.58rem] text-[rgba(209,193,255,0.4)]">
          <span className="inline-block h-[2px] w-4 rounded-sm" style={{ background: CORAL }} />
          Avg lines / release
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Frame 2 — The Multiplier                                                    */
/* Full-frame centered stat: 10x deployment increase, 2 supporting facts.     */
/* ─────────────────────────────────────────────────────────────────────────── */
export function BuildFrame2() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 px-6 py-6">
      {/* 10x headline */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-[rgba(209,193,255,0.38)]">
          Deployment frequency
        </p>
        <p
          className="font-sans font-extrabold leading-none"
          style={{
            fontSize: "clamp(4rem,9vw,6.5rem)",
            background: `linear-gradient(135deg, ${PURPLE}, #D551C9)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 28px ${PURPLE}66)`,
          }}
        >
          10×
        </p>
        <p className="text-[0.78rem] font-semibold text-[rgba(209,193,255,0.65)]">
          more releases than two years ago
        </p>
      </div>

      {/* Divider */}
      <div className="h-px w-16" style={{ background: "rgba(209,193,255,0.1)" }} />

      {/* Two supporting facts */}
      <div className="flex gap-8">
        <div className="flex flex-col items-center gap-1 text-center">
          <p
            className="font-sans text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-none"
            style={{ color: PURPLE }}
          >
            ~2 / wk
          </p>
          <p className="mt-1 text-[0.58rem] uppercase tracking-[0.18em] text-[rgba(209,193,255,0.35)]">
            2022 – 2024
          </p>
        </div>
        <div className="flex items-center">
          <span className="text-[1.1rem] text-[rgba(209,193,255,0.25)]">→</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p
            className="font-sans text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-none"
            style={{ color: GREEN }}
          >
            20 / wk
          </p>
          <p className="mt-1 text-[0.58rem] uppercase tracking-[0.18em] text-[rgba(209,193,255,0.35)]">
            Peak 2026
          </p>
        </div>
      </div>
    </div>
  );
}

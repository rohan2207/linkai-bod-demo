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
/* Single combined frame — scissors chart (left) + 10× multiplier (right)    */
/* ─────────────────────────────────────────────────────────────────────────── */
export function BuildFrame1() {
  return (
    <div className="flex h-full w-full gap-0">

      {/* LEFT — scissors chart */}
      <div className="relative flex flex-1 flex-col px-2 pt-3 pb-2">
        {/* Floating callouts */}
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute right-[6%] top-[10%] flex items-center gap-1">
            <span
              className="rounded-sm px-1.5 py-0.5 text-[0.6rem] font-bold text-white"
              style={{ background: PURPLE + "ee" }}
            >
              20 releases/week
            </span>
          </div>
          <div className="absolute bottom-[22%] right-[6%] flex items-center gap-1">
            <span
              className="rounded-sm px-1.5 py-0.5 text-[0.6rem] font-bold text-white"
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

        <div className="flex justify-center gap-4 pt-1">
          <span className="flex items-center gap-1 text-[0.55rem] text-[rgba(209,193,255,0.4)]">
            <span className="size-2 rounded-full" style={{ background: PURPLE }} />
            Releases / week
          </span>
          <span className="flex items-center gap-1 text-[0.55rem] text-[rgba(209,193,255,0.4)]">
            <span className="inline-block h-[2px] w-3 rounded-sm" style={{ background: CORAL }} />
            Avg lines / release
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        className="my-6 w-px self-stretch"
        style={{ background: "rgba(209,193,255,0.07)" }}
      />

      {/* RIGHT — 10× multiplier */}
      <div className="flex w-[42%] flex-col items-center justify-center gap-4 px-4 py-6">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-[rgba(209,193,255,0.38)]">
          Deployment frequency
        </p>
        <p
          className="font-sans font-extrabold leading-none"
          style={{
            fontSize: "clamp(3.2rem,7vw,5.5rem)",
            background: `linear-gradient(135deg, ${PURPLE}, #D551C9)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 22px ${PURPLE}66)`,
          }}
        >
          10×
        </p>
        <p className="text-[0.72rem] font-semibold text-[rgba(209,193,255,0.6)] text-center">
          more releases than<br />two years ago
        </p>

        <div className="h-px w-12" style={{ background: "rgba(209,193,255,0.1)" }} />

        <div className="flex gap-5">
          <div className="flex flex-col items-center gap-0.5 text-center">
            <p
              className="font-sans text-[clamp(1.2rem,2.5vw,1.8rem)] font-bold leading-none"
              style={{ color: PURPLE }}
            >
              ~2/wk
            </p>
            <p className="text-[0.52rem] uppercase tracking-[0.16em] text-[rgba(209,193,255,0.32)]">
              2022 – 2024
            </p>
          </div>
          <div className="flex items-center">
            <span className="text-[1rem] text-[rgba(209,193,255,0.22)]">→</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-center">
            <p
              className="font-sans text-[clamp(1.2rem,2.5vw,1.8rem)] font-bold leading-none"
              style={{ color: GREEN }}
            >
              20/wk
            </p>
            <p className="text-[0.52rem] uppercase tracking-[0.16em] text-[rgba(209,193,255,0.32)]">
              Peak 2026
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

/* Keep exported so any stale imports don't break the build */
export function BuildFrame2() { return <BuildFrame1 />; }

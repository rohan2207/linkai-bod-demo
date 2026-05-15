"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { CHART_DEPLOY, CHART_PR, CHART_TESTS } from "@/lib/flywheelData";
import { baseChartOptions, chartFont } from "@/lib/chartTheme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

const common = {
  ...baseChartOptions,
  plugins: {
    ...baseChartOptions.plugins,
    legend: { display: false },
  },
};

export function ChartPrThroughput({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`relative mb-2 w-full ${compact ? "h-[140px]" : "h-[180px]"}`}>
      <Chart
        type="bar"
        data={{
          labels: CHART_PR.labels,
          datasets: [
            {
              data: CHART_PR.bars,
              backgroundColor: "rgba(98,62,221,0.78)",
              borderWidth: 0,
              borderRadius: 2,
              yAxisID: "yL",
              order: 2,
            },
            {
              type: "line",
              data: CHART_PR.lines,
              borderColor: "#D551C9",
              backgroundColor: "transparent",
              borderWidth: 2,
              pointBackgroundColor: "#D551C9",
              pointRadius: 2,
              tension: 0.3,
              spanGaps: true,
              yAxisID: "yR",
              order: 1,
            },
          ],
        }}
        options={{
          ...common,
          font: { family: chartFont, size: 10 },
          plugins: {
            ...common.plugins,
            tooltip: {
              ...common.plugins?.tooltip,
              callbacks: {
                label: (c) =>
                  c.datasetIndex === 0
                    ? `  PRs: ${c.parsed.y}`
                    : `  Lines: ${c.parsed.y != null ? (c.parsed.y as number).toLocaleString() : "—"}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(209,193,255,.04)" },
              ticks: { color: "rgba(209,193,255,.38)", font: { size: 8 }, maxRotation: 35 },
              border: { display: false },
            },
            yL: {
              type: "linear",
              position: "left",
              min: 0,
              max: 22,
              grid: { color: "rgba(209,193,255,.04)" },
              ticks: { color: "rgba(209,193,255,.38)", font: { size: 8 }, stepSize: 5 },
              border: { display: false },
            },
            yR: {
              type: "linear",
              position: "right",
              min: 0,
              max: 10000,
              grid: { drawOnChartArea: false },
              ticks: {
                color: "rgba(209,193,255,.38)",
                font: { size: 8 },
                callback: (v) => (Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : v),
              },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  );
}

export function ChartTestGrowth({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={`relative mb-2 w-full ${compact ? "h-[140px]" : "h-[180px]"}`}>
      <Chart
        type="bar"
        data={{
          labels: CHART_TESTS.labels,
          datasets: [
            {
              label: "Nov 2025",
              data: CHART_TESTS.nov2025,
              backgroundColor: "rgba(209,193,255,.18)",
              borderWidth: 0,
              borderRadius: 2,
            },
            {
              label: "May 2026",
              data: CHART_TESTS.may2026,
              backgroundColor: ["#9B6DFF", "#F7B334", "#4ADE80", "rgba(209,193,255,.45)"],
              borderWidth: 0,
              borderRadius: 2,
            },
          ],
        }}
        options={{
          ...common,
          font: { family: chartFont, size: 10 },
          plugins: {
            legend: {
              display: true,
              position: "top",
              align: "end",
              labels: { color: "rgba(209,193,255,.45)", font: { size: 8 }, boxWidth: 8, padding: 10 },
            },
            tooltip: common.plugins?.tooltip,
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: "rgba(209,193,255,.45)", font: { size: 9 } },
              border: { display: false },
            },
            y: {
              grid: { color: "rgba(209,193,255,.04)" },
              ticks: { color: "rgba(209,193,255,.38)", font: { size: 8 } },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  );
}

export function ChartDeployLead({ compact = false }: { compact?: boolean } = {}) {
  const avgL = new Array(CHART_DEPLOY.labels.length).fill(4.3);

  return (
    <div className={`relative mb-2 w-full ${compact ? "h-[140px]" : "h-[180px]"}`}>
      <Chart
        type="bar"
        data={{
          labels: CHART_DEPLOY.labels,
          datasets: [
            {
              data: CHART_DEPLOY.deploys,
              backgroundColor: "rgba(98,62,221,0.75)",
              borderWidth: 0,
              borderRadius: 2,
              yAxisID: "yL",
              order: 2,
            },
            {
              type: "line",
              data: CHART_DEPLOY.leadDays,
              borderColor: "#F7B334",
              backgroundColor: "transparent",
              borderWidth: 2,
              pointBackgroundColor: (ctx) => {
                const v = ctx.parsed.y;
                if (v == null) return "#F7B334";
                return v < 1 ? "#4ADE80" : v <= 7 ? "#F7B334" : "#fb923c";
              },
              pointRadius: 3,
              tension: 0.4,
              yAxisID: "yR",
              order: 1,
            },
            {
              type: "line",
              data: avgL,
              borderColor: "rgba(209,193,255,.2)",
              borderWidth: 1,
              borderDash: [4, 4],
              pointRadius: 0,
              yAxisID: "yR",
              order: 3,
            },
          ],
        }}
        options={{
          ...common,
          font: { family: chartFont, size: 10 },
          plugins: {
            ...common.plugins,
            tooltip: {
              ...common.plugins?.tooltip,
              filter: (i) => i.datasetIndex < 2,
              callbacks: {
                label: (c) =>
                  c.datasetIndex === 0 ? `  Deploys: ${c.parsed.y}` : `  Lead: ${c.parsed.y}d`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(209,193,255,.04)" },
              ticks: { color: "rgba(209,193,255,.38)", font: { size: 8 }, maxRotation: 35 },
              border: { display: false },
            },
            yL: {
              type: "linear",
              position: "left",
              min: 0,
              grid: { color: "rgba(209,193,255,.04)" },
              ticks: { color: "rgba(209,193,255,.38)", font: { size: 8 } },
              border: { display: false },
            },
            yR: {
              type: "linear",
              position: "right",
              min: 0,
              max: 24,
              grid: { drawOnChartArea: false },
              ticks: { color: "rgba(209,193,255,.38)", font: { size: 8 } },
              border: { display: false },
            },
          },
        }}
      />
    </div>
  );
}

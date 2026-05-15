import type { ChartOptions } from "chart.js";

export const chartFont = "'Space Grotesk', system-ui, sans-serif";

export const baseChartOptions: ChartOptions<"bar" | "line"> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(12,9,22,.95)",
      borderColor: "rgba(209,193,255,.14)",
      borderWidth: 1,
      titleColor: "rgba(209,193,255,.9)",
      bodyColor: "rgba(209,193,255,.6)",
      padding: 8,
    },
  },
};

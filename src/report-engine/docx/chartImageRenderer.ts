/**
 * Isolated util to generate a PNG image of a Recharts chart.
 * Renders the same chart component as the front in an off-screen container,
 * captures with html2canvas, returns base64 data URL. No a4WrapperRef, ExportPreview, or DOM clone.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { componentRegistry } from "@/components/survey/common/ComponentRegistry";

const CHART_TYPES = new Set([
  "barChart",
  "sentimentDivergentChart",
  "sentimentThreeColorChart",
  "npsStackedChart",
  "lineChart",
  "paretoChart",
  "scatterPlot",
  "histogram",
  "quadrantChart",
  "heatmap",
  "sankeyDiagram",
  "stackedBarMECE",
  "evolutionaryScorecard",
  "slopeGraph",
  "waterfallChart",
]);

const CONTAINER_WIDTH = 640;
const CONTAINER_HEIGHT = 400;
const POST_RENDER_DELAY_MS = 300;
const SVG_READY_TIMEOUT_MS = 2000;

export type ChartImageComponent = {
  type?: string;
  config?: Record<string, unknown>;
  dataPath?: string;
  data?: unknown;
  [key: string]: unknown;
};

export type ResolvedData = Record<string, unknown>;

function waitForSVG(container: HTMLElement): Promise<void> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      if (container.querySelector("svg")) {
        resolve();
        return;
      }
      if (Date.now() - start >= SVG_READY_TIMEOUT_MS) {
        resolve();
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  });
}

/**
 * Renders the chart component in an off-screen div, captures it with html2canvas, returns PNG data URL.
 * Full cleanup: unmount + remove node.
 */
export async function generateChartImage(
  component: ChartImageComponent,
  resolvedData: ResolvedData
): Promise<string> {
  const type = component?.type ?? "";
  if (!CHART_TYPES.has(type)) {
    return "";
  }

  const ChartComponent = componentRegistry[type as keyof typeof componentRegistry];
  if (!ChartComponent || typeof ChartComponent !== "function") {
    return "";
  }

  const normalizedComponent = {
    ...component,
    config: component.config ?? {},
  };

  const container = document.createElement("div");
  container.setAttribute("data-chart-image-render", "true");
  container.style.cssText = [
    "position:fixed",
    "left:-9999px",
    "top:0",
    `width:${CONTAINER_WIDTH}px`,
    `height:${CONTAINER_HEIGHT}px`,
    "background:#fff",
    "z-index:-1",
  ].join(";");

  document.body.appendChild(container);

  let root: ReturnType<typeof createRoot> | null = null;
  try {
    root = createRoot(container);
    root.render(
      React.createElement(ChartComponent, {
        component: normalizedComponent,
        data: resolvedData,
        isExport: true,
        isExportImage: true,
      })
    );

    await new Promise((r) => setTimeout(r, POST_RENDER_DELAY_MS));
    await waitForSVG(container);
    await document.fonts.ready;

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl;
  } finally {
    if (root) {
      root.unmount();
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Dynamic registry for DOCX component handlers.
 * Resolves data via resolveDataPath, dispatches by component.type, returns DocxBlock[].
 * Chart handler is applied dynamically when type includes "Chart" or is in known chart types.
 * No fixed switch; unknown types log warning and return [] without breaking export.
 */

import { resolveDataPath } from "@/report-engine/dataResolvers";
import type { DocxRenderContext, DocxComponent, DocxBlock, DocxComponentHandler } from "./types";
import { handleCard } from "./componentHandlers/card";
import { handleTable } from "./componentHandlers/table";
import { handleChart } from "./componentHandlers/chart";
import { handleText } from "./componentHandlers/text";
import { handleNoop } from "./componentHandlers/noop";

/** Known chart types (no "Chart" in name or for explicit registration). */
const KNOWN_CHART_TYPES = new Set([
  "barChart",
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
  "sentimentDivergentChart",
  "sentimentThreeColorChart",
  "npsStackedChart",
]);

function isChartType(type: string): boolean {
  return type.length > 0 && (type.includes("Chart") || KNOWN_CHART_TYPES.has(type));
}

const componentHandlers: Record<string, DocxComponentHandler> = {
  card: handleCard,
  npsScoreCard: handleCard,
  topCategoriesCards: handleCard,
  kpiCard: handleCard,

  recommendationsTable: handleTable,
  segmentationTable: handleTable,
  distributionTable: handleTable,
  sentimentTable: handleTable,
  npsDistributionTable: handleTable,
  npsTable: handleTable,
  sentimentImpactTable: handleTable,
  positiveCategoriesTable: handleTable,
  negativeCategoriesTable: handleTable,
  analyticalTable: handleTable,

  text: handleText,
  h3: handleText,
  h4: handleText,

  container: handleNoop,
  "grid-container": handleNoop,
  questionsList: handleNoop,
  filterPills: handleNoop,
  accordion: handleNoop,
  wordCloud: handleNoop,
};

function getHandler(type: string): DocxComponentHandler | null {
  const direct = componentHandlers[type];
  if (direct) return direct;
  if (isChartType(type)) return handleChart;
  return null;
}

function warnUnknownType(type: string): void {
  if (typeof console !== "undefined" && console.warn) {
    console.warn(`[DocxRenderer] Unknown component type: "${type}". Returning no blocks.`);
  }
}

function warnHandlerError(type: string, err: unknown): void {
  if (typeof console !== "undefined" && console.warn) {
    console.warn(`[DocxRenderer] Error rendering component type "${type}":`, err);
  }
}

/**
 * Renders a single component: resolves data, resolves handler (registry + dynamic chart), returns DOCX blocks.
 * Unknown types log warning and return []. Handler errors are caught so export does not break.
 */
export async function renderComponent(
  context: DocxRenderContext,
  component: DocxComponent
): Promise<DocxBlock[]> {
  const type = component.type ?? "";
  const resolvedData = context.resolvedData as Record<string, unknown> | null | undefined;
  const dataPath = component.dataPath;
  const fallback = component.data;
  const data = resolveDataPath(resolvedData, dataPath ?? null, fallback);

  const handler = getHandler(type);
  if (!handler) {
    warnUnknownType(type || "none");
    return [];
  }

  try {
    return await handler(component, data, context);
  } catch (err) {
    warnHandlerError(type || "none", err);
    return [];
  }
}

/**
 * Register a handler for a component type (for extensibility).
 */
export function registerComponentHandler(type: string, handler: DocxComponentHandler): void {
  componentHandlers[type] = handler;
}

/**
 * Check if a component type is registered (including dynamic chart types).
 */
export function isComponentTypeRegistered(type: string): boolean {
  return getHandler(type) !== null;
}

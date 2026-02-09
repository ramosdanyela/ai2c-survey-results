import {
  SentimentDivergentChart,
  SentimentThreeColorChart,
  NPSStackedChart,
} from "../widgets/charts/Charts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/lib/colors";
import { LineChart } from "../widgets/charts/LineChart";
import { ParetoChart } from "../widgets/charts/ParetoChart";
import { ScatterPlot } from "../widgets/charts/ScatterPlot";
import { Histogram } from "../widgets/charts/Histogram";
import { QuadrantChart } from "../widgets/charts/QuadrantChart";
import { Heatmap } from "../widgets/charts/Heatmap";
import { SankeyDiagram } from "../widgets/charts/SankeyDiagram";
import { StackedBarMECE } from "../widgets/charts/StackedBarMECE";
import { EvolutionaryScorecard } from "../widgets/charts/EvolutionaryScorecard";
import { SlopeGraph } from "../widgets/SlopeGraph";
import { WaterfallChart } from "../widgets/WaterfallChart";
import { resolveDataPath } from "@/services/dataResolver";
import { useIsMobile } from "@/hooks/use-mobile";

// Defaults for dynamic bar chart height (few bars = compact, many bars = more space for labels)
const BAR_CHART_HEIGHT_PER_BAR = 32;
const BAR_CHART_MIN_HEIGHT = 200;
const BAR_CHART_MAX_HEIGHT = 720;
const BAR_CHART_MANY_BARS_THRESHOLD = 8;

/**
 * Compute bar chart height from number of bars (flexible layout: compact when few, roomy when many)
 */
export function getBarChartHeightFromCount(barCount, config = {}) {
  if (!barCount) return config.height || BAR_CHART_MIN_HEIGHT;
  const heightPerBar = config.heightPerBar ?? BAR_CHART_HEIGHT_PER_BAR;
  const minH = config.minHeight ?? BAR_CHART_MIN_HEIGHT;
  const maxH = config.maxHeight ?? BAR_CHART_MAX_HEIGHT;
  const margin = config.margin || { top: 10, right: 80, left: 120, bottom: 10 };
  const totalMargin = (margin.top ?? 10) + (margin.bottom ?? 10);
  const contentHeight = barCount * heightPerBar;
  const height = contentHeight + totalMargin;
  return Math.min(maxH, Math.max(minH, Math.round(height)));
}

/**
 * Get bar chart config defaults based on context
 * All styling/config is determined programmatically
 */
export function getBarChartConfig(component, isMobile) {
  const config = component.config || {};
  const preset = config.preset; // Use preset from JSON instead of checking dataPath
  const dataPath = component.dataPath || "";
  const isDistributionChart =
    preset === "distribution" ||
    dataPath.toLowerCase().includes("distribution");
  // yAxisDataKey: explicit config wins; distribution charts default to "segment", others to "label"
  const yAxisDataKey =
    config.yAxisDataKey !== undefined && config.yAxisDataKey !== ""
      ? config.yAxisDataKey
      : isDistributionChart
      ? "segment"
      : "label";
  const isIntentChart =
    preset === "respondentIntent" ||
    yAxisDataKey === "intent" ||
    dataPath.includes("Intent");

  // Determine defaults based on preset (from JSON) or fallback to defaults
  let height = config.height || 256;
  let margin = config.margin || { top: 10, right: 80, left: 120, bottom: 10 };
  let yAxisWidth = config.yAxisWidth || 110;

  // dataKey: explicit config wins; distribution charts default to "percentage"; others to "value"
  const dataKey =
    config.dataKey !== undefined && config.dataKey !== ""
      ? config.dataKey
      : isDistributionChart
      ? "percentage"
      : "value";

  // Use preset to determine chart configuration
  if (isIntentChart) {
    // Intention-style charts: long Y-axis labels need more space so legendas don't overlap
    height = isMobile ? 400 : 256;
    margin = isMobile
      ? { top: 10, right: 50, left: 12, bottom: 10 }
      : { top: 10, right: 80, left: 260, bottom: 10 };
    yAxisWidth = isMobile ? 160 : 250;
  } else if (preset === "distribution") {
    height = 400;
    margin = { top: 10, right: 80, left: 120, bottom: 10 };
    yAxisWidth = config.yAxisWidth || 110;
  }

  // Ensure tooltipFormatter is a function or undefined
  let tooltipFormatter = config.tooltipFormatter;
  if (tooltipFormatter && typeof tooltipFormatter !== "function") {
    // If it's not a function, use default (silently)
    tooltipFormatter = undefined;
  }

  // Ensure labelFormatter is a function or undefined
  let labelFormatter = config.labelFormatter;
  if (labelFormatter && typeof labelFormatter !== "function") {
    // If it's not a function, use default (silently)
    labelFormatter = undefined;
  }

  // Intention charts: more vertical space per bar so long Y-axis labels don't overlap
  const heightPerBar =
    config.heightPerBar ?? (isIntentChart ? 44 : BAR_CHART_HEIGHT_PER_BAR);
  const minHeight = config.minHeight ?? BAR_CHART_MIN_HEIGHT;
  const maxHeight = config.maxHeight ?? BAR_CHART_MAX_HEIGHT;

  return {
    height,
    margin,
    yAxisWidth,
    dataKey,
    yAxisDataKey,
    fillColor: config.fillColor,
    showLabels: config.showLabels !== false,
    labelFormatter: labelFormatter,
    tooltipFormatter: tooltipFormatter,
    sortData: config.sortData !== false,
    sortDirection: config.sortDirection || "desc",
    hideXAxis: config.hideXAxis !== false,
    dynamicHeight: config.dynamicHeight !== false,
    heightPerBar,
    minHeight,
    maxHeight,
    manyBarsThreshold:
      config.manyBarsThreshold ?? BAR_CHART_MANY_BARS_THRESHOLD,
  };
}

/**
 * Render a bar chart component based on schema
 */
export function SchemaBarChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const isMobile = useIsMobile();

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  const chartConfig = getBarChartConfig(component, isMobile);
  const barCount = chartData.length;

  // Flexible height: few bars = compact, many bars = more space so labels don't overlap
  const height = chartConfig.dynamicHeight
    ? getBarChartHeightFromCount(barCount, {
        heightPerBar: chartConfig.heightPerBar,
        minHeight: chartConfig.minHeight,
        maxHeight: chartConfig.maxHeight,
        margin: chartConfig.margin,
      })
    : chartConfig.height;

  const manyBarsThreshold = chartConfig.manyBarsThreshold ?? 8;
  const barSizeWhenMany = 28;
  const sortedData = chartConfig.sortData
    ? [...chartData].sort((a, b) => {
        const aVal = a[chartConfig.dataKey];
        const bVal = b[chartConfig.dataKey];
        if (typeof aVal !== "number" || typeof bVal !== "number") return 0;
        return chartConfig.sortDirection === "desc" ? bVal - aVal : aVal - bVal;
      })
    : chartData;

  const chart = (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={chartConfig.margin}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
            hide={chartConfig.hideXAxis}
            allowDataOverflow={false}
          />
          <YAxis
            type="category"
            dataKey={chartConfig.yAxisDataKey}
            width={chartConfig.yAxisWidth}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            formatter={
              chartConfig.tooltipFormatter &&
              typeof chartConfig.tooltipFormatter === "function"
                ? (value, name, props) => {
                    try {
                      const result = chartConfig.tooltipFormatter(
                        value,
                        name,
                        props
                      );
                      if (Array.isArray(result)) return result;
                      return [result, name || ""];
                    } catch {
                      return [`${value}%`, name || ""];
                    }
                  }
                : (value, name) => [`${value}%`, name || ""]
            }
          />
          <Bar
            dataKey={chartConfig.dataKey}
            fill={chartConfig.fillColor || CHART_COLORS.primary}
            radius={[0, 4, 4, 0]}
            barSize={
              sortedData.length >= manyBarsThreshold
                ? barSizeWhenMany
                : undefined
            }
          >
            {chartConfig.showLabels && (
              <LabelList
                dataKey={chartConfig.dataKey}
                position="right"
                formatter={
                  chartConfig.labelFormatter || ((value) => `${value}%`)
                }
                style={{
                  fill: CHART_COLORS.foreground,
                  fontSize: "12px",
                }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // Use wrapperClassName from component config or preset-based wrapper (bar chart centered vertically in wrapper)
  const wrapperClassName = component.wrapperClassName;
  if (wrapperClassName || component.config?.preset === "distribution") {
    const centerClass = "flex items-center justify-center";
    const baseClass = "flex-shrink-0 mb-4";
    const finalClassName = wrapperClassName
      ? `${centerClass} ${baseClass} ${wrapperClassName}`.trim()
      : `${centerClass} ${baseClass}`.trim();
    const wrapperStyle =
      component.wrapperStyle ||
      (component.config?.preset === "distribution"
        ? { height: "400px" }
        : undefined);
    return (
      <div className={finalClassName} style={wrapperStyle}>
        {chart}
      </div>
    );
  }

  return chart;
}

/**
 * Get sentiment divergent chart config based on context
 */
export function getSentimentDivergentChartConfig(component) {
  const config = component.config || {};

  return {
    height: 320,
    margin: { top: 20, right: 30, left: 100, bottom: 20 },
    xAxisDomain: config.xAxisDomain,
    yAxisDataKey: config.yAxisDataKey || "category",
    yAxisWidth: config.yAxisWidth || 90,
    showGrid: false,
    showLegend: config.showLegend !== false,
    axisLine: false,
    tickLine: false,
    barSize: config.barSize,
    allowDataOverflow: config.allowDataOverflow,
    legendWrapperStyle: config.legendWrapperStyle,
    legendIconType: config.legendIconType,
    labels: config.labels,
  };
}

/**
 * Render a sentiment divergent chart component based on schema
 */
export function SchemaSentimentDivergentChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  const chartConfig = getSentimentDivergentChartConfig(component);

  return (
    <SentimentDivergentChart
      data={chartData}
      height={chartConfig.height}
      margin={chartConfig.margin}
      xAxisDomain={chartConfig.xAxisDomain}
      yAxisDataKey={chartConfig.yAxisDataKey}
      yAxisWidth={chartConfig.yAxisWidth}
      showGrid={chartConfig.showGrid}
      showLegend={chartConfig.showLegend}
      axisLine={chartConfig.axisLine}
      tickLine={chartConfig.tickLine}
      barSize={chartConfig.barSize}
      allowDataOverflow={chartConfig.allowDataOverflow}
      legendWrapperStyle={chartConfig.legendWrapperStyle}
      legendIconType={chartConfig.legendIconType}
      labels={chartConfig.labels}
    />
  );
}

/**
 * Get sentiment three color chart config based on context
 */
export function getSentimentThreeColorChartConfig(component) {
  const config = component.config || {};

  return {
    height: 192,
    margin: { top: 10, right: 30, left: 20, bottom: 10 },
    showGrid: false,
    showLegend: false,
    axisLine: false,
    tickLine: false,
  };
}

/**
 * Render a sentiment three color chart component based on schema
 */
export function SchemaSentimentThreeColorChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  const chartConfig = getSentimentThreeColorChartConfig(component);

  return (
    <SentimentThreeColorChart
      data={chartData}
      height={chartConfig.height}
      margin={chartConfig.margin}
      showGrid={chartConfig.showGrid}
      showLegend={chartConfig.showLegend}
    />
  );
}

/**
 * Get NPS stacked chart config based on context
 */
export function getNPSStackedChartConfig(component) {
  const config = component.config || {};

  return {
    height: 256,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    showGrid: config.showGrid !== undefined ? config.showGrid : true,
    showLegend: config.showLegend !== false,
    hideXAxis: true,
    showPercentagesInLegend: true,
    chartName: config.chartName || "NPS",
    ranges: config.ranges,
  };
}

/**
 * Render an NPS stacked chart component based on schema
 */
export function SchemaNPSStackedChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);

  if (!chartData) {
    return null;
  }

  const chartConfig = getNPSStackedChartConfig(component);

  // Data format: object with Detratores/Neutros/Promotores
  // If data is not in the expected format, return null
  if (!chartData || typeof chartData !== "object" || Array.isArray(chartData)) {
    return null;
  }

  return (
    <NPSStackedChart
      data={chartData}
      height={chartConfig.height}
      margin={chartConfig.margin}
      showGrid={chartConfig.showGrid}
      showLegend={chartConfig.showLegend}
      hideXAxis={chartConfig.hideXAxis}
      showPercentagesInLegend={chartConfig.showPercentagesInLegend}
      chartName={chartConfig.chartName}
      ranges={chartConfig.ranges}
    />
  );
}

/**
 * Render Line Chart component based on schema
 */
export function SchemaLineChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  return (
    <LineChart
      data={chartData}
      xAxisDataKey={config.xAxisDataKey || "x"}
      lines={config.lines || []}
      height={config.height || 400}
      margin={config.margin}
      showGrid={config.showGrid !== false}
      showLegend={config.showLegend !== false}
      showTooltip={config.showTooltip !== false}
      xAxisFormatter={config.xAxisFormatter}
      yAxisFormatter={config.yAxisFormatter}
      tooltipFormatter={config.tooltipFormatter}
    />
  );
}

/**
 * Render Pareto Chart component based on schema
 */
export function SchemaParetoChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  return (
    <ParetoChart
      data={chartData}
      categoryKey={config.categoryKey || "category"}
      valueKey={config.valueKey || "value"}
      height={config.height || 400}
      margin={config.margin}
      showCumulative={config.showCumulative !== false}
      cumulativeThreshold={config.cumulativeThreshold || 80}
      showGrid={config.showGrid !== false}
      showLegend={config.showLegend !== false}
    />
  );
}

/**
 * Render Scatter Plot component based on schema
 */
export function SchemaScatterPlot({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  return (
    <ScatterPlot
      data={chartData}
      xAxisDataKey={config.xAxisDataKey || "x"}
      yAxisDataKey={config.yAxisDataKey || "y"}
      sizeKey={config.sizeKey}
      colorKey={config.colorKey}
      height={config.height || 400}
      margin={config.margin}
      showGrid={config.showGrid !== false}
      showLegend={config.showLegend !== false}
      xAxisFormatter={config.xAxisFormatter}
      yAxisFormatter={config.yAxisFormatter}
      colorMap={config.colorMap}
    />
  );
}

/**
 * Render Histogram component based on schema
 */
export function SchemaHistogram({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData) {
    return null;
  }

  return (
    <Histogram
      data={Array.isArray(chartData) ? chartData : [chartData]}
      valueKey={config.valueKey || "value"}
      bins={config.bins}
      showDensity={config.showDensity || false}
      height={config.height || 400}
      margin={config.margin}
      showLabels={config.showLabels !== false}
      showGrid={config.showGrid !== false}
    />
  );
}

/**
 * Render Quadrant Chart component based on schema
 */
export function SchemaQuadrantChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  return (
    <QuadrantChart
      data={chartData}
      xAxisDataKey={config.xAxisDataKey || "x"}
      yAxisDataKey={config.yAxisDataKey || "y"}
      labelKey={config.labelKey || "label"}
      sizeKey={config.sizeKey}
      quadrants={config.quadrants}
      showQuadrantLabels={config.showQuadrantLabels !== false}
      height={config.height || 400}
      margin={config.margin}
      showGrid={config.showGrid !== false}
    />
  );
}

/**
 * Render Heatmap component based on schema
 */
export function SchemaHeatmap({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  return (
    <Heatmap
      data={chartData}
      xKey={config.xKey || "x"}
      yKey={config.yKey || "y"}
      valueKey={config.valueKey || "value"}
      xCategories={config.xCategories}
      yCategories={config.yCategories}
      colorScale={config.colorScale || "viridis"}
      height={config.height || 400}
      showValues={config.showValues !== false}
      valueFormatter={config.valueFormatter}
    />
  );
}

/**
 * Render Sankey Diagram component based on schema
 */
export function SchemaSankeyDiagram({ component, data }) {
  const sankeyData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!sankeyData) {
    return null;
  }

  // Support both { nodes, links } object and separate paths
  const nodes =
    sankeyData.nodes || resolveDataPath(data, config.nodesPath) || [];
  const links =
    sankeyData.links || resolveDataPath(data, config.linksPath) || [];

  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    // No nodes found - expected in some cases
    return null;
  }

  if (!links || !Array.isArray(links) || links.length === 0) {
    // No links found - expected in some cases
    return null;
  }

  return (
    <SankeyDiagram
      nodes={nodes}
      links={links}
      nodeKey={config.nodeKey || "id"}
      nodeLabel={config.nodeLabel || "label"}
      linkSource={config.linkSource || "source"}
      linkTarget={config.linkTarget || "target"}
      linkValue={config.linkValue || "value"}
      height={config.height || 400}
      width={config.width}
      nodeWidth={config.nodeWidth}
      nodePadding={config.nodePadding}
    />
  );
}

/**
 * Render Stacked Bar MECE component based on schema
 */
export function SchemaStackedBarMECE({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  return (
    <StackedBarMECE
      data={chartData}
      yAxisDataKey={config.yAxisDataKey ?? config.categoryKey ?? "option"}
      {...(config.categoryKey != null && { categoryKey: config.categoryKey })}
      series={config.series || []}
      height={config.height || 400}
      margin={config.margin}
      showGrid={config.showGrid !== false}
      showLegend={config.showLegend !== false}
    />
  );
}

/**
 * Render Evolutionary Scorecard component based on schema
 */
export function SchemaEvolutionaryScorecard({ component, data }) {
  const scorecardData = resolveDataPath(
    data,
    component.dataPath,
    component.data
  );
  const config = component.config || {};

  if (!scorecardData) {
    return null;
  }

  // Support both object and direct values
  const value =
    typeof scorecardData === "object"
      ? scorecardData[config.valueKey || "value"]
      : scorecardData;
  const target =
    typeof scorecardData === "object"
      ? scorecardData[config.targetKey || "target"]
      : config.target;
  const delta =
    typeof scorecardData === "object"
      ? scorecardData[config.deltaKey || "delta"]
      : config.delta;
  const trend =
    typeof scorecardData === "object"
      ? scorecardData[config.trendKey || "trend"]
      : config.trend;
  const label =
    typeof scorecardData === "object"
      ? scorecardData[config.labelKey || "label"]
      : config.label || "KPI";

  return (
    <EvolutionaryScorecard
      value={value}
      target={target}
      delta={delta}
      trend={trend}
      label={label}
      format={config.format}
      className={config.className}
    />
  );
}

/**
 * Render Slope Graph component based on schema
 */
export function SchemaSlopeGraph({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  return (
    <SlopeGraph
      data={chartData}
      categoryKey={config.categoryKey || "category"}
      beforeKey={config.beforeKey || "before"}
      afterKey={config.afterKey || "after"}
      height={config.height || 400}
      margin={config.margin}
      showLabels={config.showLabels !== false}
      showDelta={config.showDelta !== false}
      showGrid={config.showGrid !== false}
    />
  );
}

/**
 * Render Waterfall Chart component based on schema
 */
export function SchemaWaterfallChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath, component.data);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }

  return (
    <WaterfallChart
      data={chartData}
      labelKey={config.labelKey || "label"}
      valueKey={config.valueKey || "value"}
      typeKey={config.typeKey || "type"}
      height={config.height || 400}
      margin={config.margin}
      showLabels={config.showLabels !== false}
      showGrid={config.showGrid !== false}
    />
  );
}

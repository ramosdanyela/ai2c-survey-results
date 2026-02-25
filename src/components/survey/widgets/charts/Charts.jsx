import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  ReferenceLine,
} from "recharts";
import { NPS_COLOR_MAP, SENTIMENT_COLOR_MAP, CHART_COLORS } from "@/lib/colors";

// ============================================================
// SURVEY CHARTS - All charts used in the project
// ============================================================
// This file contains all chart components used
// in the survey components.
//
// Available components:
// 1. SentimentDivergentChart - Divergent sentiment chart
// 2. SentimentThreeColorChart - Three-color sentiment chart
// 3. NPSStackedChart - NPS stacked chart

// ============================================================
// 1. SENTIMENT DIVERGENT CHART (UNIFIED COMPONENT)
// ============================================================
// Divergent chart where negative appears on the left and positive on the right
// Used in: SupportAnalysis - Sentiment Analysis
//           AttributeDeepDive - Sentiment by Segment
//           ResponseDetails - Sentiment Analysis

const EXPORT_IMAGE_WIDTH = 800;
const EXPORT_IMAGE_HEIGHT = 400;

export function SentimentDivergentChart({
  data,
  height = 320,
  margin = { top: 20, right: 55, left: 50, bottom: 20 },
  xAxisDomain,
  yAxisDataKey = "category",
  yAxisWidth = 160,
  showGrid = false,
  showLegend = true,
  axisLine = false,
  tickLine = false,
  barSize,
  allowDataOverflow = false,
  legendWrapperStyle,
  legendIconType,
  labels,
  isExportImage = false,
  tickFontSize = 12,
}) {
  // Extract labels from data or use provided labels
  // Try to get labels from first data item if available
  const defaultLabels =
    data && data.length > 0
      ? {
          positive: data[0].positiveLabel || "Positive",
          negative: data[0].negativeLabel || "Negative",
        }
      : { positive: "Positive", negative: "Negative" };

  const chartLabels = labels || defaultLabels;
  // Default values specific to SentimentDivergentChart (when not specified)
  const finalBarSize =
    barSize === null ? undefined : barSize !== undefined ? barSize : 40;
  const finalLegendWrapperStyle =
    legendWrapperStyle === null
      ? undefined
      : legendWrapperStyle !== undefined
        ? legendWrapperStyle
        : { paddingTop: "20px" };
  const finalLegendIconType =
    legendIconType === null
      ? undefined
      : legendIconType !== undefined
        ? legendIconType
        : "square";
  // Transform data: negative values become negative for divergent display
  // Only plot positive and negative, ignore neutral completely
  const transformedData = data.map((item) => {
    // Try to get the category value from various possible keys
    const categoryValue =
      item[yAxisDataKey] || item.category || item.segment || item.value || "";
    return {
      [yAxisDataKey]: categoryValue,
      positive: item.positive,
      negative: -item.negative,
    };
  });

  // Calculate dynamic domain if not provided
  const maxValue = Math.max(
    ...transformedData.flatMap((item) => [
      Math.abs(item.positive),
      Math.abs(item.negative),
    ]),
  );
  const domain = xAxisDomain || [
    -Math.ceil(maxValue * 1.1),
    Math.ceil(maxValue * 1.1),
  ];

  // Dynamic height: each category needs 2 bars + gap.
  // With barSize=40, two bars per row = ~95px per category + overhead (margins + legend).
  // Using Math.max ensures the chart never shrinks below the caller's preferred height.
  const effectiveBarSize = finalBarSize !== undefined ? finalBarSize : 40;
  const PER_CATEGORY_H = effectiveBarSize * 2 + 16;
  const OVERHEAD_H = margin.top + margin.bottom + (showLegend ? 60 : 10);
  const minH = transformedData.length * PER_CATEGORY_H + OVERHEAD_H;
  const chartHeight = isExportImage ? EXPORT_IMAGE_HEIGHT : Math.max(height, minH);
  const chartWidth = isExportImage ? EXPORT_IMAGE_WIDTH : "100%";

  return (
    <div style={{ height: chartHeight, width: isExportImage ? EXPORT_IMAGE_WIDTH : undefined }}>
      <ResponsiveContainer
        width={isExportImage ? EXPORT_IMAGE_WIDTH : "100%"}
        height={isExportImage ? EXPORT_IMAGE_HEIGHT : "100%"}
      >
        <BarChart
          data={transformedData}
          layout="vertical"
          margin={margin}
          isAnimationActive={!isExportImage}
        >
          {/* Dashed line only at the 0 mark */}
          <ReferenceLine
            x={0}
            stroke={CHART_COLORS.foreground}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {/* No grid - CartesianGrid completely removed */}
          <XAxis
            type="number"
            domain={domain}
            tickFormatter={(value) => {
              if (value === 0) return "0%";
              return "";
            }}
            ticks={[0]}
            axisLine={axisLine}
            tickLine={tickLine}
            allowDataOverflow={allowDataOverflow}
          />
          <YAxis
            type="category"
            dataKey={yAxisDataKey}
            width={yAxisWidth}
            axisLine={axisLine}
            tickLine={tickLine}
            interval={0}
            tick={{ fontSize: tickFontSize }}
          />
          {!isExportImage && (
          <Tooltip
            formatter={(value, name) => {
              if (name === chartLabels.negative || name === "negative") {
                return [`${Math.abs(value)}%`, chartLabels.negative];
              }
              return [`${Math.abs(value)}%`, chartLabels.positive];
            }}
          />
          )}
          {showLegend && (
            <Legend
              {...(finalLegendWrapperStyle !== undefined && {
                wrapperStyle: finalLegendWrapperStyle,
              })}
              {...(finalLegendIconType !== undefined && {
                iconType: finalLegendIconType,
              })}
              formatter={(value) => {
                // Only show negative and positive, filter out neutral
                if (value === "neutral" || value === "Neutral") {
                  return "";
                }
                return value === "negative" || value === "Negative"
                  ? chartLabels.negative
                  : value === "positive" || value === "Positive"
                    ? chartLabels.positive
                    : "";
              }}
            />
          )}
          <Bar
            dataKey="negative"
            name={chartLabels.negative}
            fill={CHART_COLORS.negative}
            radius={[4, 4, 4, 4]}
            {...(finalBarSize !== undefined && { barSize: finalBarSize })}
          >
            <LabelList
              dataKey="negative"
              position="right"
              formatter={(value) => `${Math.abs(value)}%`}
              style={{
                fill: CHART_COLORS.foreground,
                fontSize: "12px",
              }}
            />
          </Bar>
          <Bar
            dataKey="positive"
            name={chartLabels.positive}
            fill={CHART_COLORS.positive}
            radius={[4, 4, 4, 4]}
            {...(finalBarSize !== undefined && { barSize: finalBarSize })}
          >
            <LabelList
              dataKey="positive"
              position="right"
              formatter={(value) => `${value}%`}
              style={{
                fill: CHART_COLORS.foreground,
                fontSize: "12px",
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// 2. SENTIMENT THREE COLOR CHART
// ============================================================
// Three-color sentiment chart (Positive/Negative/Not applicable)
// Used in: AttributeDeepDive - Sentiment Analysis by Customer Type

/** Resolve sentiment color from map; match is case-insensitive so "negativo" and "Negativo" both work */
function getSentimentFill(sentiment, colorMap) {
  if (!sentiment) return CHART_COLORS.primary;
  if (colorMap[sentiment]) return colorMap[sentiment];
  const lower = String(sentiment).toLowerCase();
  const key = Object.keys(colorMap).find((k) => k.toLowerCase() === lower);
  return key ? colorMap[key] : CHART_COLORS.primary;
}

export function SentimentThreeColorChart({
  data,
  height = 80,
  margin = { top: 10, right: 30, left: 20, bottom: 10 },
  showGrid = false,
  showLegend = true,
  isExportImage = false,
}) {
  // Colors for each sentiment (from centralized color config)
  const sentimentColors = SENTIMENT_COLOR_MAP;

  // Extract sentiment labels dynamically from data
  const sentimentKeys = data.map((item) => item.sentiment).filter(Boolean);
  const uniqueSentiments = [...new Set(sentimentKeys)];

  // Dynamically extract segments (excluding "sentiment")
  const segments =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => key !== "sentiment")
      : [];

  // Create data for each segment
  const chartDataBySegment = segments.map((segment) => {
    const chartDataItem = { name: segment };

    // Dynamically add sentiment values using actual sentiment keys from data
    uniqueSentiments.forEach((sentiment) => {
      chartDataItem[sentiment] =
        data.find((item) => item.sentiment === sentiment)?.[segment] || 0;
    });

    const chartData = [chartDataItem];
    return { segment, chartData, sentiments: uniqueSentiments };
  });

  const chartHeight = isExportImage ? EXPORT_IMAGE_HEIGHT : height;
  const segmentHeight = isExportImage ? EXPORT_IMAGE_HEIGHT : height;

  return (
    <div className="space-y-6">
      {chartDataBySegment.map(({ segment, chartData, sentiments }) => (
        <div key={segment} className="space-y-2">
          {!isExportImage && (
          <div className="font-semibold text-sm mb-2">{segment}</div>
          )}
          <div style={{ height: segmentHeight, width: isExportImage ? EXPORT_IMAGE_WIDTH : undefined }}>
            <ResponsiveContainer
              width={isExportImage ? EXPORT_IMAGE_WIDTH : "100%"}
              height={isExportImage ? EXPORT_IMAGE_HEIGHT : "100%"}
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={margin}
                isAnimationActive={!isExportImage}
              >
                {showGrid && (
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                )}
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={120} hide />
                {!isExportImage && (
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  filterNull={true}
                />
                )}
                {sentiments.map((sentiment, index) => (
                  <Bar
                    key={sentiment}
                    dataKey={sentiment}
                    name={sentiment}
                    fill={getSentimentFill(sentiment, sentimentColors)}
                    stackId="a"
                    radius={
                      index === sentiments.length - 1
                        ? [4, 4, 4, 4]
                        : [0, 0, 0, 0]
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Labels with values - dynamically generated from sentiments */}
          {!isExportImage && (
          <div
            className="grid gap-2 text-xs text-center"
            style={{ gridTemplateColumns: `repeat(${sentiments.length}, 1fr)` }}
          >
            {sentiments.map((sentiment) => (
              <div key={sentiment}>
                <div className="font-bold">{chartData[0][sentiment]}%</div>
                <div className="text-muted-foreground">{sentiment}</div>
              </div>
            ))}
          </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 3. NPS STACKED CHART
// ============================================================
// NPS stacked chart (Detractors/Neutrals/Promoters)
// Used in: SupportAnalysis - NPS Distribution
// Render order is always: Detrator, Neutro, Promotor (data may be sent in any order).

const NPS_DISPLAY_ORDER = [
  "Detrator",
  "Neutro",
  "Promotor",
  "Detratores",
  "Neutros",
  "Promotores",
];

function sortNpsKeys(keys) {
  const orderMap = new Map(NPS_DISPLAY_ORDER.map((k, i) => [k, i]));
  return [...keys].sort((a, b) => {
    const ia = orderMap.get(a) ?? 999;
    const ib = orderMap.get(b) ?? 999;
    return ia - ib;
  });
}

export function NPSStackedChart({
  data,
  height = 256,
  margin = { top: 20, right: 30, left: 20, bottom: 20 },
  showGrid = true,
  showLegend = true,
  hideXAxis = false,
  showPercentagesInLegend = false,
  chartName = "NPS",
  ranges,
  isExportImage = false,
}) {
  // Extract keys from data; order always Detrator → Neutro → Promotor for rendering
  const rawKeys = Object.keys(data).filter(
    (key) => typeof data[key] === "number",
  );
  const dataKeys = sortNpsKeys(rawKeys);

  // Create chart data dynamically from data keys
  const chartData = [
    {
      name: chartName,
      ...dataKeys.reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {}),
    },
  ];

  // Range mapping for NPS categories - use provided ranges or extract from data
  // Try to get ranges from data first (if data has range information)
  const defaultRanges = ranges || {};

  // Get color for a key, fallback to primary if not in map
  const getColor = (key) => NPS_COLOR_MAP[key] || CHART_COLORS.primary;

  // Get range for a key, return empty string if not in map
  const getRange = (key) => defaultRanges[key] || "";

  const chartHeight = isExportImage ? EXPORT_IMAGE_HEIGHT : height;

  return (
    <div style={{ height: chartHeight, width: isExportImage ? EXPORT_IMAGE_WIDTH : undefined }}>
      <ResponsiveContainer
        width={isExportImage ? EXPORT_IMAGE_WIDTH : "100%"}
        height={isExportImage ? EXPORT_IMAGE_HEIGHT : "100%"}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={margin}
          isAnimationActive={!isExportImage}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          )}
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            hide={hideXAxis}
          />
          <YAxis type="category" dataKey="name" width={60} hide />
          {!isExportImage && (
          <Tooltip formatter={(value, name) => [`${value}%`, name || ""]} />
          )}
          {showLegend && (
            <Legend
              formatter={(value) => {
                const percentage = data[value];
                const range = getRange(value);
                const label = range ? `${value} ${range}` : value;
                if (showPercentagesInLegend && percentage !== undefined) {
                  return `${label} - ${percentage}%`;
                }
                return label;
              }}
            />
          )}
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={getColor(key)}
              stackId="a"
              radius={
                index === dataKeys.length - 1 ? [4, 4, 4, 4] : [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

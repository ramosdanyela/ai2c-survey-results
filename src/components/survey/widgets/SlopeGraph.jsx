import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { CHART_COLORS } from "@/lib/colors";

/**
 * Slope Graph Component (Before vs. After)
 * 
 * Displays comparison between two states (before/after) with connecting lines.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array with category, before, after
 * @param {string} [props.categoryKey="category"] - Key for category name
 * @param {string} [props.beforeKey="before"] - Key for before value
 * @param {string} [props.afterKey="after"] - Key for after value
 * @param {number} [props.height=400] - Chart height
 * @param {Object} [props.margin] - Chart margins
 * @param {boolean} [props.showLabels=true] - Show values on points
 * @param {boolean} [props.showDelta=true] - Show delta (difference) labels
 * @param {boolean} [props.showGrid=true] - Show grid
 */
export function SlopeGraph({
  data = [],
  categoryKey = "category",
  beforeKey = "before",
  afterKey = "after",
  height = 400,
  margin = { top: 20, right: 30, left: 20, bottom: 60 },
  showLabels = true,
  showDelta = true,
  showGrid = true,
}) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 text-muted-foreground"
        style={{ height }}
      >
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  // Transform data for chart
  const chartData = data.map((item) => {
    const before = item[beforeKey] || 0;
    const after = item[afterKey] || 0;
    const delta = after - before;
    const deltaPercent = before !== 0 ? ((delta / before) * 100).toFixed(1) : 0;

    return {
      category: item[categoryKey],
      before,
      after,
      delta,
      deltaPercent,
    };
  });

  // Calculate domain for Y axis
  const allValues = chartData.flatMap((item) => [item.before, item.after]);
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.1;

  return (
    <div role="img" aria-label="Gráfico de comparação antes e depois">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={margin}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.foreground}
              opacity={0.1}
            />
          )}
          <XAxis
            dataKey="category"
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "delta") {
                return [`${value > 0 ? "+" : ""}${value}`, "Diferença"];
              }
              return [value, name === "before" ? "Antes" : "Depois"];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: `1px solid ${CHART_COLORS.foreground}`,
              borderRadius: "4px",
            }}
          />
          
          {/* Before points */}
          <Line
            type="monotone"
            dataKey="before"
            stroke={CHART_COLORS.negative}
            strokeWidth={2}
            dot={{ r: 6, fill: CHART_COLORS.negative }}
            activeDot={{ r: 8 }}
            name="Antes"
          >
            {showLabels && (
              <LabelList
                dataKey="before"
                position="top"
                formatter={(value) => value}
                style={{ fill: CHART_COLORS.negative, fontSize: "12px" }}
              />
            )}
          </Line>

          {/* After points */}
          <Line
            type="monotone"
            dataKey="after"
            stroke={CHART_COLORS.positive}
            strokeWidth={2}
            dot={{ r: 6, fill: CHART_COLORS.positive }}
            activeDot={{ r: 8 }}
            name="Depois"
          >
            {showLabels && (
              <LabelList
                dataKey="after"
                position="top"
                formatter={(value) => value}
                style={{ fill: CHART_COLORS.positive, fontSize: "12px" }}
              />
            )}
          </Line>

          {/* Connecting lines (custom rendering would be needed for true slope graph) */}
          {/* For now, we use two separate lines. A true slope graph would need custom rendering */}
        </LineChart>
      </ResponsiveContainer>

      {/* Delta information */}
      {showDelta && (
        <div className="mt-4 space-y-1.5 pt-2">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-muted-foreground">{item.category}:</span>
              <span
                className={`font-semibold ${
                  item.delta > 0
                    ? "text-green-600 dark:text-green-400"
                    : item.delta < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                {item.delta > 0 ? "+" : ""}
                {item.delta} ({item.deltaPercent > 0 ? "+" : ""}
                {item.deltaPercent}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import { CHART_COLORS } from "@/lib/colors";

const EXPORT_IMAGE_WIDTH = 800;
const EXPORT_IMAGE_HEIGHT = 400;

/**
 * Pareto Chart Component
 * 
 * Displays a Pareto chart (bar chart + cumulative line) showing the 80/20 principle.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of objects with category and value
 * @param {string} props.categoryKey - Key for category name
 * @param {string} props.valueKey - Key for value
 * @param {number} [props.height=400] - Chart height
 * @param {Object} [props.margin] - Chart margins
 * @param {boolean} [props.showCumulative=true] - Show cumulative line
 * @param {number} [props.cumulativeThreshold=80] - Threshold for cumulative line (e.g., 80%)
 * @param {boolean} [props.showGrid=true] - Show grid
 * @param {boolean} [props.showLegend=true] - Show legend
 */
export function ParetoChart({
  data = [],
  categoryKey = "category",
  valueKey = "value",
  height = 400,
  margin = { top: 20, right: 30, left: 20, bottom: 100 },
  showCumulative = true,
  cumulativeThreshold = 80,
  showGrid = true,
  showLegend = true,
  isExportImage = false,
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

  // Sort data by value descending
  const sortedData = [...data].sort((a, b) => {
    const aVal = a[valueKey] || 0;
    const bVal = b[valueKey] || 0;
    return bVal - aVal;
  });

  // Calculate total and cumulative percentages
  const total = sortedData.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  
  // Calculate cumulative percentages iteratively
  let runningCumulative = 0;
  const chartData = sortedData.map((item) => {
    const value = item[valueKey] || 0;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    runningCumulative += percentage;
    const cumulativePercentage = runningCumulative;

    return {
      ...item,
      [categoryKey]: item[categoryKey],
      [valueKey]: value,
      percentage,
      cumulativePercentage,
    };
  });

  // Find index where cumulative reaches threshold
  const thresholdIndex = chartData.findIndex(
    (item) => item.cumulativePercentage >= cumulativeThreshold
  );

  const chartHeight = isExportImage ? EXPORT_IMAGE_HEIGHT : height;

  return (
    <div style={{ height: chartHeight, width: isExportImage ? EXPORT_IMAGE_WIDTH : undefined }} role="img" aria-label="Gráfico de Pareto">
      <ResponsiveContainer
        width={isExportImage ? EXPORT_IMAGE_WIDTH : "100%"}
        height={isExportImage ? EXPORT_IMAGE_HEIGHT : "100%"}
      >
        <ComposedChart data={chartData} margin={margin} isAnimationActive={!isExportImage}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.foreground}
              opacity={0.1}
            />
          )}
          <XAxis
            dataKey={categoryKey}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            label={{ value: "Valor", angle: -90, position: "insideLeft" }}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          {showCumulative && (
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "Cumulativo (%)", angle: 90, position: "insideRight" }}
              stroke={CHART_COLORS.foreground}
              tick={{ fill: CHART_COLORS.foreground }}
              domain={[0, 100]}
            />
          )}
          {!isExportImage && (
          <Tooltip
            formatter={(value, name) => {
              if (name === "cumulativePercentage") {
                return [`${value.toFixed(1)}%`, "Cumulativo"];
              }
              return [value, "Valor"];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: `1px solid ${CHART_COLORS.foreground}`,
              borderRadius: "4px",
            }}
          />
          )}
          {showLegend && <Legend />}
          <Bar
            yAxisId="left"
            dataKey={valueKey}
            fill={CHART_COLORS.primary}
            name="Valor"
          />
          {showCumulative && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativePercentage"
              stroke={CHART_COLORS.foreground}
              strokeWidth={2}
              dot={false}
              name="Cumulativo (%)"
            />
          )}
          {thresholdIndex >= 0 && showCumulative && (
            <ReferenceLine
              yAxisId="right"
              y={cumulativeThreshold}
              stroke="#ff6b6b"
              strokeDasharray="5 5"
              label={{ value: `${cumulativeThreshold}%`, position: "right" }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}


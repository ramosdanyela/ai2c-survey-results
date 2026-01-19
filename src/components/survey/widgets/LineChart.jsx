import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/lib/colors";

/**
 * Line Chart Component
 * 
 * Displays temporal evolution data as a line chart.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {string} props.xAxisDataKey - Key for X axis data
 * @param {Array} props.lines - Array of line configurations: [{ dataKey, name, color, strokeWidth }]
 * @param {number} [props.height=400] - Chart height
 * @param {Object} [props.margin] - Chart margins
 * @param {boolean} [props.showGrid=true] - Show grid
 * @param {boolean} [props.showLegend=true] - Show legend
 * @param {boolean} [props.showTooltip=true] - Show tooltip
 * @param {Function} [props.xAxisFormatter] - X axis tick formatter
 * @param {Function} [props.yAxisFormatter] - Y axis tick formatter
 * @param {Function} [props.tooltipFormatter] - Tooltip formatter
 */
export function LineChart({
  data = [],
  xAxisDataKey = "x",
  lines = [],
  height = 400,
  margin = { top: 20, right: 30, left: 20, bottom: 60 },
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
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

  if (!lines || lines.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 text-muted-foreground"
        style={{ height }}
      >
        <p>Nenhuma linha configurada</p>
      </div>
    );
  }

  // Default formatters
  const defaultXFormatter = xAxisFormatter || ((value) => value);
  const defaultYFormatter = yAxisFormatter || ((value) => value);
  const defaultTooltipFormatter =
    tooltipFormatter ||
    ((value, name) => {
      const line = lines.find((l) => l.dataKey === name);
      return [value, line?.name || name];
    });

  return (
    <div style={{ height }} role="img" aria-label="Gráfico de linha">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={margin}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.foreground}
              opacity={0.1}
            />
          )}
          <XAxis
            dataKey={xAxisDataKey}
            tickFormatter={defaultXFormatter}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <YAxis
            tickFormatter={defaultYFormatter}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          {showTooltip && (
            <Tooltip
              formatter={defaultTooltipFormatter}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: `1px solid ${CHART_COLORS.foreground}`,
                borderRadius: "4px",
              }}
            />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />
          )}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey || index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || CHART_COLORS.primary}
              strokeWidth={line.strokeWidth || 2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}


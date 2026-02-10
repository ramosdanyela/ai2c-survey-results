import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { CHART_COLORS, CHART_PALETTE_MECE } from "@/lib/colors";

/**
 * Stacked Bar MECE Chart (Generic)
 *
 * Generic stacked bar chart that supports multiple series with flexible color configuration.
 *
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {string} [props.yAxisDataKey="option"] - Key for category/option on Y axis (aligned with barChart)
 * @param {string} [props.categoryKey] - Fallback for Y axis key (use yAxisDataKey when from JSON config)
 * @param {Array} props.series - Array of series configs: [{ dataKey, name, color }]
 * @param {number} [props.height=320] - Chart height
 * @param {Object} [props.margin] - Chart margins (default: extra right for labels, padding-friendly)
 * @param {boolean} [props.showGrid=true] - Show grid
 * @param {boolean} [props.showLegend=true] - Show legend
 */
const DEFAULT_MARGIN = {
  top: 16,
  right: 80,
  left: 12,
  bottom: 56,
};

export function StackedBarMECE({
  data = [],
  yAxisDataKey,
  categoryKey,
  series = [],
  height = 320,
  margin,
  showGrid = true,
  showLegend = true,
}) {
  const axisKey = yAxisDataKey ?? categoryKey ?? "option";
  const chartMargin = { ...DEFAULT_MARGIN, ...margin };

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

  if (!series || series.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 text-muted-foreground"
        style={{ height }}
      >
        <p>Nenhuma série configurada</p>
      </div>
    );
  }

  return (
    <div
      className="min-w-0 overflow-hidden p-2"
      style={{ height }}
      role="img"
      aria-label="Gráfico de barras empilhadas MECE"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={chartMargin} layout="vertical">
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.foreground}
              opacity={0.1}
              horizontal={false}
            />
          )}
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <YAxis
            type="category"
            dataKey={axisKey}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, ""]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: `1px solid ${CHART_COLORS.foreground}`,
              borderRadius: "4px",
            }}
          />
          {showLegend && <Legend />}
          {series.map((serie, index) => (
            <Bar
              key={serie.dataKey || index}
              dataKey={serie.dataKey}
              stackId="a"
              fill={serie.color ?? CHART_PALETTE_MECE[index % CHART_PALETTE_MECE.length]}
              name={serie.name}
              radius={index === series.length - 1 ? [4, 4, 4, 4] : [0, 0, 0, 0]}
            >
              <LabelList
                dataKey={serie.dataKey}
                position="right"
                formatter={(value) => `${value}%`}
                style={{
                  fill: CHART_COLORS.foreground,
                  fontSize: "12px",
                }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


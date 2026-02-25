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
  right: 20,
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
  yAxisWidth = 130,
  isExportImage = false,
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

  const EXPORT_W = 800;
  const EXPORT_H = 400;

  // Dynamic height: ensure legend is never clipped.
  // Estimate legend height based on series count (conservative ~3 items per row).
  const legendRows = showLegend ? Math.ceil(series.length / 3) : 0;
  const legendH = showLegend ? legendRows * 36 + 20 : 0;
  // Bottom margin must be at least as tall as the legend
  const effectiveBottom = Math.max(chartMargin.bottom, legendH);
  const effectiveMargin = { ...chartMargin, bottom: effectiveBottom };
  // Minimum chart height: each bar ~44px + x-axis ~30px + top/bottom margins
  const BAR_SLOT = 44;
  const minRequired = data.length * BAR_SLOT + effectiveMargin.top + 30 + effectiveBottom;
  const chartHeight = isExportImage ? EXPORT_H : Math.max(height, minRequired);

  return (
    <div
      className="min-w-0 p-2"
      style={{ height: chartHeight, width: isExportImage ? EXPORT_W : undefined }}
      role="img"
      aria-label="Gráfico de barras empilhadas MECE"
    >
      <ResponsiveContainer
        width={isExportImage ? EXPORT_W : "100%"}
        height={isExportImage ? EXPORT_H : "100%"}
      >
        <BarChart data={data} margin={effectiveMargin} layout="vertical" isAnimationActive={!isExportImage}>
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
            tick={{ fill: CHART_COLORS.foreground, fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey={axisKey}
            width={yAxisWidth}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground, fontSize: 11 }}
          />
          {!isExportImage && (
          <Tooltip
            formatter={(value) => [`${value}%`, ""]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: `1px solid ${CHART_COLORS.foreground}`,
              borderRadius: "4px",
            }}
          />
          )}
          {showLegend && <Legend />}
          {series.map((serie, index) => (
            <Bar
              key={serie.dataKey || index}
              dataKey={serie.dataKey}
              stackId="a"
              fill={serie.color ?? CHART_PALETTE_MECE[index % CHART_PALETTE_MECE.length]}
              name={serie.name}
              maxBarSize={50}
              radius={index === series.length - 1 ? [4, 4, 4, 4] : [0, 0, 0, 0]}
            >
              <LabelList
                dataKey={serie.dataKey}
                content={({ viewBox, value }) => {
                  if (!value || Number(value) < 8) return null;
                  const { x, y, width, height } = viewBox;
                  return (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="500"
                    >
                      {`${value}%`}
                    </text>
                  );
                }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


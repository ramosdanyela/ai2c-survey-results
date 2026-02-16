import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { CHART_COLORS } from "@/lib/colors";

const EXPORT_IMAGE_WIDTH = 800;
const EXPORT_IMAGE_HEIGHT = 400;

/**
 * Scatter Plot Component
 * 
 * Displays relationship between two variables as scatter points.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of objects with x, y coordinates
 * @param {string} [props.xAxisDataKey="x"] - Key for X axis data
 * @param {string} [props.yAxisDataKey="y"] - Key for Y axis data
 * @param {string} [props.sizeKey] - Key for point size (optional)
 * @param {string} [props.colorKey] - Key for point color (optional)
 * @param {number} [props.height=400] - Chart height
 * @param {Object} [props.margin] - Chart margins
 * @param {boolean} [props.showGrid=true] - Show grid
 * @param {boolean} [props.showLegend=true] - Show legend
 * @param {Function} [props.xAxisFormatter] - X axis formatter
 * @param {Function} [props.yAxisFormatter] - Y axis formatter
 * @param {Object} [props.colorMap] - Map of colorKey values to colors
 */
export function ScatterPlot({
  data = [],
  xAxisDataKey = "x",
  yAxisDataKey = "y",
  sizeKey,
  colorKey,
  height = 400,
  margin = { top: 20, right: 30, left: 20, bottom: 60 },
  showGrid = true,
  showLegend = true,
  xAxisFormatter,
  yAxisFormatter,
  colorMap,
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

  // Get unique categories for color mapping
  const categories = colorKey
    ? [...new Set(data.map((item) => item[colorKey]).filter(Boolean))]
    : [];

  // Default color map
  const defaultColorMap = colorMap || {};
  const getColor = (category) => {
    if (defaultColorMap[category]) return defaultColorMap[category];
    // Generate color from category index
    const colors = [
      CHART_COLORS.primary,
      CHART_COLORS.positive,
      CHART_COLORS.negative,
      "#9b59b6",
      "#e67e22",
      "#3498db",
    ];
    return colors[categories.indexOf(category) % colors.length];
  };

  // Calculate size range if sizeKey is provided
  const sizeRange = sizeKey
    ? (() => {
        const sizes = data.map((item) => item[sizeKey] || 0);
        const minSize = Math.min(...sizes);
        const maxSize = Math.max(...sizes);
        return { min: Math.max(minSize, 5), max: Math.min(maxSize, 30) };
      })()
    : null;

  const getSize = (item) => {
    if (!sizeKey || !sizeRange) return 8;
    const value = item[sizeKey] || 0;
    const normalized =
      sizeRange.max !== sizeRange.min
        ? ((value - sizeRange.min) / (sizeRange.max - sizeRange.min)) *
            (sizeRange.max - sizeRange.min) +
          sizeRange.min
        : sizeRange.min;
    return Math.max(5, Math.min(30, normalized));
  };

  const chartHeight = isExportImage ? EXPORT_IMAGE_HEIGHT : height;

  return (
    <div style={{ height: chartHeight, width: isExportImage ? EXPORT_IMAGE_WIDTH : undefined }} role="img" aria-label="Gráfico de dispersão">
      <ResponsiveContainer
        width={isExportImage ? EXPORT_IMAGE_WIDTH : "100%"}
        height={isExportImage ? EXPORT_IMAGE_HEIGHT : "100%"}
      >
        <ScatterChart data={data} margin={margin} isAnimationActive={!isExportImage}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.foreground}
              opacity={0.1}
            />
          )}
          <XAxis
            type="number"
            dataKey={xAxisDataKey}
            tickFormatter={xAxisFormatter}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <YAxis
            type="number"
            dataKey={yAxisDataKey}
            tickFormatter={yAxisFormatter}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          {!isExportImage && (
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name, props) => {
              const item = props.payload;
              if (name === xAxisDataKey) {
                return [value, "X"];
              }
              if (name === yAxisDataKey) {
                return [value, "Y"];
              }
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: `1px solid ${CHART_COLORS.foreground}`,
              borderRadius: "4px",
            }}
          />
          )}
          {showLegend && categories.length > 0 && <Legend />}
          
          {colorKey && categories.length > 0 ? (
            // Render separate scatter for each category
            categories.map((category) => (
              <Scatter
                key={category}
                name={category}
                data={data.filter((item) => item[colorKey] === category)}
                fill={getColor(category)}
              >
                {data
                  .filter((item) => item[colorKey] === category)
                  .map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getColor(category)}
                      r={getSize(entry)}
                    />
                  ))}
              </Scatter>
            ))
          ) : (
            // Single scatter without categories
            <Scatter data={data} fill={CHART_COLORS.primary}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS.primary}
                  r={getSize(entry)}
                />
              ))}
            </Scatter>
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}


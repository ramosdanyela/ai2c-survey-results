import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { CHART_COLORS } from "@/lib/colors";

/**
 * Histogram / Distribution Chart Component
 * 
 * Displays statistical distribution of data as a histogram.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of values or objects with value key
 * @param {string} [props.valueKey="value"] - Key for value in data objects
 * @param {number} [props.bins] - Number of bins (auto-calculated if not provided)
 * @param {boolean} [props.showDensity=false] - Show density instead of count
 * @param {number} [props.height=400] - Chart height
 * @param {Object} [props.margin] - Chart margins
 * @param {boolean} [props.showLabels=true] - Show count/density labels
 * @param {boolean} [props.showGrid=true] - Show grid
 */
export function Histogram({
  data = [],
  valueKey = "value",
  bins,
  showDensity = false,
  height = 400,
  margin = { top: 20, right: 30, left: 20, bottom: 60 },
  showLabels = true,
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

  // Extract values
  const values = data.map((item) => {
    if (typeof item === "number") return item;
    return item[valueKey] || 0;
  }).filter((v) => typeof v === "number" && !isNaN(v));

  if (values.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-8 text-muted-foreground"
        style={{ height }}
      >
        <p>Nenhum valor numérico válido encontrado</p>
      </div>
    );
  }

  // Calculate bins
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const numBins = bins || Math.ceil(Math.sqrt(values.length));
  const binWidth = range / numBins;

  // Create bins
  const binData = Array.from({ length: numBins }, (_, i) => {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = values.filter(
      (v) => v >= binStart && (i === numBins - 1 ? v <= binEnd : v < binEnd)
    ).length;

    return {
      bin: i,
      binStart: binStart.toFixed(2),
      binEnd: binEnd.toFixed(2),
      label: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
      count,
      density: count / (values.length * binWidth),
    };
  });

  // Calculate total for density normalization
  const total = values.length;
  const maxCount = Math.max(...binData.map((b) => b.count));

  const chartData = binData.map((bin) => ({
    ...bin,
    value: showDensity ? bin.density : bin.count,
    displayValue: showDensity
      ? bin.density.toFixed(4)
      : `${bin.count} (${((bin.count / total) * 100).toFixed(1)}%)`,
  }));

  return (
    <div style={{ height }} role="img" aria-label="Histograma de distribuição">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={margin}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.foreground}
              opacity={0.1}
            />
          )}
          <XAxis
            dataKey="label"
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            label={{
              value: showDensity ? "Densidade" : "Frequência",
              angle: -90,
              position: "insideLeft",
            }}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <Tooltip
            formatter={(value, name) => {
              const item = name;
              return [item.displayValue, showDensity ? "Densidade" : "Frequência"];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: `1px solid ${CHART_COLORS.foreground}`,
              borderRadius: "4px",
            }}
          />
          <Bar
            dataKey="value"
            fill={CHART_COLORS.primary}
            radius={[4, 4, 0, 0]}
          >
            {showLabels && (
              <LabelList
                dataKey="count"
                position="top"
                formatter={(value) => value}
                style={{ fill: CHART_COLORS.foreground, fontSize: "12px" }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


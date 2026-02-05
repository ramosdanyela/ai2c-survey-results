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
 * Supports two data formats:
 * 1) Pre-binned: array of { bin, value } — bin = faixa (eixo X), value = contagem (altura da barra).
 * 2) Raw values: array of numbers or { value } — component computes bins automatically.
 *
 * @param {Object} props
 * @param {Array} props.data - Pre-binned: [{ bin: "0-10", value: 5 }, ...]. Raw: [1, 2, 3] or [{ value: 1 }, ...]
 * @param {string} [props.binKey="bin"] - Key for bin label in pre-binned data
 * @param {string} [props.valueKey="value"] - Key for value/count in data objects
 * @param {number} [props.bins] - Number of bins when using raw values (auto if not provided)
 * @param {boolean} [props.showDensity=false] - Show density instead of count
 * @param {number} [props.height=400] - Chart height
 * @param {Object} [props.margin] - Chart margins
 * @param {boolean} [props.showLabels=true] - Show count/density labels
 * @param {boolean} [props.showGrid=true] - Show grid
 */
export function Histogram({
  data = [],
  binKey = "bin",
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

  // Pre-binned: every item has binKey (faixa) and valueKey (contagem) — use as-is
  const isPreBinned =
    data.length > 0 &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item != null &&
        binKey in item &&
        valueKey in item &&
        typeof item[valueKey] === "number"
    );

  let chartData;

  if (isPreBinned) {
    const total = data.reduce((acc, item) => acc + (item[valueKey] || 0), 0);
    chartData = data.map((item) => {
      const count = Number(item[valueKey]) || 0;
      const pct = total > 0 ? (count / total) * 100 : 0;
      return {
        label: item[binKey] != null ? String(item[binKey]) : "",
        value: showDensity && total > 0 ? count / total : count,
        count,
        displayValue: showDensity
          ? (total > 0 ? count / total : 0).toFixed(4)
          : `${count} (${pct.toFixed(1)}%)`,
      };
    });
  } else {
    // Raw values: extract numbers and compute bins
    const values = data
      .map((item) => {
        if (typeof item === "number") return item;
        return item[valueKey] != null ? item[valueKey] : 0;
      })
      .filter((v) => typeof v === "number" && !isNaN(v));

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

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const numBins = bins || Math.ceil(Math.sqrt(values.length)) || 1;
    const binWidth = range / numBins;

    const binData = Array.from({ length: numBins }, (_, i) => {
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      const count = values.filter(
        (v) => v >= binStart && (i === numBins - 1 ? v <= binEnd : v < binEnd)
      ).length;
      return {
        label: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        count,
        density:
          values.length * binWidth > 0 ? count / (values.length * binWidth) : 0,
      };
    });

    const total = values.length;
    chartData = binData.map((b) => ({
      ...b,
      value: showDensity ? b.density : b.count,
      displayValue: showDensity
        ? b.density.toFixed(4)
        : `${b.count} (${
            total > 0 ? ((b.count / total) * 100).toFixed(1) : 0
          }%)`,
    }));
  }

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
            formatter={(value, name, props) => {
              const display =
                props?.payload?.displayValue != null
                  ? props.payload.displayValue
                  : value;
              return [display, showDensity ? "Densidade" : "Frequência"];
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

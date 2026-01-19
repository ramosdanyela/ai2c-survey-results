import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
  Label,
} from "recharts";
import { CHART_COLORS } from "@/lib/colors";

/**
 * Quadrant / 2x2 / Bubble Chart Component
 * 
 * Displays data in a 2x2 quadrant matrix for executive prioritization.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array with x, y, label, size (optional)
 * @param {string} [props.xAxisDataKey="x"] - Key for X axis data
 * @param {string} [props.yAxisDataKey="y"] - Key for Y axis data
 * @param {string} [props.labelKey="label"] - Key for label
 * @param {string} [props.sizeKey="size"] - Key for bubble size (optional)
 * @param {Object} [props.quadrants] - Quadrant configuration: { xThreshold, yThreshold, labels, colors }
 * @param {boolean} [props.showQuadrantLabels=true] - Show quadrant labels
 * @param {boolean} [props.showQuadrantColors=true] - Show quadrant background colors
 * @param {number} [props.height=400] - Chart height
 * @param {Object} [props.margin] - Chart margins
 * @param {boolean} [props.showGrid=true] - Show grid
 */
export function QuadrantChart({
  data = [],
  xAxisDataKey = "x",
  yAxisDataKey = "y",
  labelKey = "label",
  sizeKey = "size",
  quadrants = {
    xThreshold: 50,
    yThreshold: 50,
    labels: ["Baixo Impacto", "Alto Impacto", "Baixo Esforço", "Alto Esforço"],
    colors: ["#e5e7eb", "#fef3c7", "#fee2e2", "#d1fae5"], // Gray, Yellow, Red, Green
  },
  showQuadrantLabels = true,
  showQuadrantColors = true,
  height = 400,
  margin = { top: 20, right: 30, left: 20, bottom: 60 },
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

  const { xThreshold, yThreshold, labels, colors = ["#e5e7eb", "#fef3c7", "#fee2e2", "#d1fae5"] } = quadrants;

  // Calculate size range if sizeKey is provided
  const sizeRange = sizeKey
    ? (() => {
        const sizes = data.map((item) => item[sizeKey] || 0).filter((s) => s > 0);
        if (sizes.length === 0) return null;
        const minSize = Math.min(...sizes);
        const maxSize = Math.max(...sizes);
        return { min: Math.max(minSize, 5), max: Math.min(maxSize, 30) };
      })()
    : null;

  const getSize = (item) => {
    if (!sizeKey || !sizeRange) return 8;
    const value = item[sizeKey] || 0;
    if (value === 0) return 8;
    const normalized =
      sizeRange.max !== sizeRange.min
        ? ((value - sizeRange.min) / (sizeRange.max - sizeRange.min)) *
            (sizeRange.max - sizeRange.min) +
          sizeRange.min
        : sizeRange.min;
    return Math.max(5, Math.min(30, normalized));
  };

  // Calculate domain
  const xValues = data.map((item) => item[xAxisDataKey] || 0);
  const yValues = data.map((item) => item[yAxisDataKey] || 0);
  const xMin = Math.min(...xValues, 0);
  const xMax = Math.max(...xValues, 100);
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues, 100);

  return (
    <div role="img" aria-label="Gráfico de quadrantes">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart data={data} margin={margin}>
          {/* Quadrant background colors using ReferenceArea */}
          {showQuadrantColors && (
            <>
              {/* Q1: Bottom Left - Baixa Prioridade (Gray) */}
              <ReferenceArea
                x1={xMin}
                x2={xThreshold}
                y1={yMin}
                y2={yThreshold}
                fill={colors[0] || "#e5e7eb"}
                fillOpacity={0.3}
              />
              {/* Q2: Bottom Right - Quick Wins (Green) */}
              <ReferenceArea
                x1={xThreshold}
                x2={xMax}
                y1={yMin}
                y2={yThreshold}
                fill={colors[3] || "#d1fae5"}
                fillOpacity={0.3}
              />
              {/* Q3: Top Left - Monitorar (Yellow) */}
              <ReferenceArea
                x1={xMin}
                x2={xThreshold}
                y1={yThreshold}
                y2={yMax}
                fill={colors[1] || "#fef3c7"}
                fillOpacity={0.3}
              />
              {/* Q4: Top Right - Urgente (Red) */}
              <ReferenceArea
                x1={xThreshold}
                x2={xMax}
                y1={yThreshold}
                y2={yMax}
                fill={colors[2] || "#fee2e2"}
                fillOpacity={0.3}
              />
            </>
          )}
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
            domain={[xMin, xMax]}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <YAxis
            type="number"
            dataKey={yAxisDataKey}
            domain={[yMin, yMax]}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          
          {/* Quadrant lines */}
          <ReferenceLine
            x={xThreshold}
            stroke={CHART_COLORS.foreground}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <ReferenceLine
            y={yThreshold}
            stroke={CHART_COLORS.foreground}
            strokeWidth={2}
            strokeDasharray="5 5"
          />

          {/* Quadrant labels */}
          {showQuadrantLabels && labels && labels.length >= 4 && (
            <>
              <Label
                value={labels[0] || "Q1"}
                position="insideBottomLeft"
                offset={10}
                style={{ fill: CHART_COLORS.foreground, fontSize: "12px" }}
              />
              <Label
                value={labels[1] || "Q2"}
                position="insideBottomRight"
                offset={10}
                style={{ fill: CHART_COLORS.foreground, fontSize: "12px" }}
              />
              <Label
                value={labels[2] || "Q3"}
                position="insideTopLeft"
                offset={10}
                style={{ fill: CHART_COLORS.foreground, fontSize: "12px" }}
              />
              <Label
                value={labels[3] || "Q4"}
                position="insideTopRight"
                offset={10}
                style={{ fill: CHART_COLORS.foreground, fontSize: "12px" }}
              />
            </>
          )}

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
              if (name === labelKey) {
                return [value, "Label"];
              }
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: `1px solid ${CHART_COLORS.foreground}`,
              borderRadius: "4px",
            }}
          />

          <Scatter data={data} fill={CHART_COLORS.primary}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS.primary}
                r={getSize(entry)}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend with labels */}
      {data.length > 0 && (
        <div className="mt-4 space-y-1.5 pt-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CHART_COLORS.primary }}
              />
              <span className="text-muted-foreground">
                {item[labelKey] || `Item ${index + 1}`}: ({item[xAxisDataKey]}, {item[yAxisDataKey]})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


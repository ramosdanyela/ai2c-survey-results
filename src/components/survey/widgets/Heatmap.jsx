import { useMemo } from "react";
import { CHART_COLORS } from "@/lib/colors";
import { scaleSequential } from "d3-scale";
import {
  interpolateViridis,
  interpolatePlasma,
  interpolateRdBu,
  interpolateGreens,
  interpolateReds,
  interpolateYlOrRd,
  interpolateBlues,
} from "d3-scale-chromatic";

/**
 * Heatmap Component
 * 
 * Displays multidimensional cross-referencing data as a heatmap.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of objects with x, y, value
 * @param {string} [props.xKey="x"] - Key for X category
 * @param {string} [props.yKey="y"] - Key for Y category
 * @param {string} [props.valueKey="value"] - Key for value
 * @param {Array} [props.xCategories] - X axis categories (auto-detected if not provided)
 * @param {Array} [props.yCategories] - Y axis categories (auto-detected if not provided)
 * @param {string} [props.colorScale="classic"] - Color scale: "classic" | "heatmap" | "viridis" | "plasma" | "red-blue" | "green-red" | "yellow-red" | "blues"
 * @param {number} [props.height=400] - Chart height
 * @param {boolean} [props.showValues=true] - Show values in cells
 * @param {Function} [props.valueFormatter] - Custom value formatter
 */
export function Heatmap({
  data = [],
  xKey = "x",
  yKey = "y",
  valueKey = "value",
  xCategories,
  yCategories,
  colorScale = "classic",
  height = 400,
  showValues = true,
  valueFormatter,
}) {
  // Extract categories if not provided
  const xCats = useMemo(() => {
    if (xCategories) return xCategories;
    return [...new Set(data.map((item) => item[xKey]).filter(Boolean))].sort();
  }, [data, xKey, xCategories]);

  const yCats = useMemo(() => {
    if (yCategories) return yCategories;
    return [...new Set(data.map((item) => item[yKey]).filter(Boolean))].sort();
  }, [data, yKey, yCategories]);

  // Create data matrix
  const dataMatrix = useMemo(() => {
    const matrix = {};
    data.forEach((item) => {
      const x = item[xKey];
      const y = item[yKey];
      const value = item[valueKey] || 0;
      const key = `${x}-${y}`;
      matrix[key] = value;
    });
    return matrix;
  }, [data, xKey, yKey, valueKey]);

  // Calculate value range for color scale
  const valueRange = useMemo(() => {
    const values = data.map((item) => item[valueKey] || 0);
    if (values.length === 0) return [0, 1];
    return [Math.min(...values), Math.max(...values)];
  }, [data, valueKey]);

  // Classic heatmap color interpolation: Blue -> Yellow -> Red
  const interpolateHeatmap = (t) => {
    // t is normalized value between 0 and 1
    if (t <= 0.5) {
      // Blue to Yellow (0 to 0.5)
      const localT = t * 2; // Scale to 0-1
      const r = Math.round(localT * 255);
      const g = Math.round(localT * 255);
      const b = Math.round((1 - localT) * 255);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Yellow to Red (0.5 to 1)
      const localT = (t - 0.5) * 2; // Scale to 0-1
      const r = 255;
      const g = Math.round((1 - localT) * 255);
      const b = 0;
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  // Color scale functions
  const getColor = (value) => {
    const [min, max] = valueRange;
    if (max === min) return "#0066cc"; // Default blue for single value

    const normalized = (value - min) / (max - min);

    switch (colorScale) {
      case "classic":
      case "heatmap":
        // Classic heatmap: Blue -> Yellow -> Red
        return interpolateHeatmap(normalized);
      case "viridis":
        // Viridis-like color scale (blue to yellow)
        return scaleSequential(interpolateViridis).domain([min, max])(value);
      case "plasma":
        // Plasma-like color scale (purple to yellow)
        return scaleSequential(interpolatePlasma).domain([min, max])(value);
      case "red-blue":
        // Red to blue
        return scaleSequential(interpolateRdBu).domain([min, max])(value);
      case "green-red":
        // Green to red
        return normalized < 0.5
          ? scaleSequential(interpolateGreens).domain([min, (min + max) / 2])(value)
          : scaleSequential(interpolateReds).domain([(min + max) / 2, max])(value);
      case "yellow-red":
        // Yellow to Red (classic heatmap alternative)
        return scaleSequential(interpolateYlOrRd).domain([min, max])(value);
      case "blues":
        // Blues scale
        return scaleSequential(interpolateBlues).domain([min, max])(value);
      default:
        return interpolateHeatmap(normalized); // Default to classic heatmap
    }
  };

  // Calculate cell dimensions
  const cellWidth = 100 / xCats.length;
  const cellHeight = 100 / yCats.length;

  const formatValue = (value) => {
    if (valueFormatter) return valueFormatter(value);
    return typeof value === "number" ? value.toFixed(1) : value;
  };

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

  return (
    <div style={{ height }} role="img" aria-label="Mapa de calor">
      <div className="relative w-full h-full">
        {/* Y axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-around pr-2">
          {yCats.map((cat, index) => (
            <div
              key={cat}
              className="text-xs text-muted-foreground text-right"
              style={{ height: `${cellHeight}%` }}
            >
              {cat}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div
          className="relative ml-20 mr-4"
          style={{ height: "100%" }}
        >
          <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${xCats.length}, 1fr)` }}>
            {yCats.map((yCat) =>
              xCats.map((xCat) => {
                const key = `${xCat}-${yCat}`;
                const value = dataMatrix[key] || 0;
                const color = getColor(value);
                const [min, max] = valueRange;
                const normalized = max !== min ? (value - min) / (max - min) : 0;

                return (
                  <div
                    key={key}
                    className="border border-border flex items-center justify-center relative group"
                    style={{
                      backgroundColor: color,
                      minHeight: `${cellHeight}%`,
                    }}
                  >
                    {showValues && (
                      <span
                        className={`text-xs font-semibold ${
                          normalized > 0.5
                            ? "text-white"
                            : normalized > 0.3
                            ? "text-gray-900"
                            : "text-white"
                        }`}
                        style={{
                          textShadow: normalized > 0.3 && normalized < 0.7 
                            ? "0 1px 2px rgba(0,0,0,0.3)" 
                            : "none"
                        }}
                      >
                        {formatValue(value)}
                      </span>
                    )}
                    <div
                      className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"
                      title={`${xCat} × ${yCat}: ${formatValue(value)}`}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* X axis labels */}
        <div className="absolute bottom-0 left-20 right-4 flex justify-around">
          {xCats.map((cat) => (
            <div
              key={cat}
              className="text-xs text-muted-foreground text-center"
              style={{ width: `${cellWidth}%` }}
            >
              {cat}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4">
        <span className="text-xs text-muted-foreground">Legenda:</span>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatValue(valueRange[0])}
          </span>
          <div
            className="flex-1 h-4 rounded"
            style={{
              background: `linear-gradient(to right, ${getColor(
                valueRange[0]
              )}, ${getColor(valueRange[1])})`,
            }}
          />
          <span className="text-xs text-muted-foreground">
            {formatValue(valueRange[1])}
          </span>
        </div>
      </div>
    </div>
  );
}


import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { CHART_COLORS, COLOR_BLUE_CUSTOM } from "@/lib/colors";

/**
 * Waterfall Chart Component (Bridge Chart)
 * 
 * Displays cumulative changes showing how an initial value is affected by a series of positive or negative changes.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array with label, value, type ("start" | "positive" | "negative" | "end")
 * @param {string} [props.labelKey="label"] - Key for label
 * @param {string} [props.valueKey="value"] - Key for value
 * @param {string} [props.typeKey="type"] - Key for type
 * @param {number} [props.height=400] - Chart height
 * @param {Object} [props.margin] - Chart margins
 * @param {boolean} [props.showLabels=true] - Show values on bars
 * @param {boolean} [props.showGrid=true] - Show grid
 */
export function WaterfallChart({
  data = [],
  labelKey = "label",
  valueKey = "value",
  typeKey = "type",
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

  // Transform data to calculate cumulative values
  let runningTotal = 0;
  const chartData = data.map((item, index) => {
    const value = item[valueKey] || 0;
    const type = item[typeKey] || "positive";
    const label = item[labelKey] || `Item ${index + 1}`;

    let startValue, endValue, displayValue;

    if (type === "start") {
      startValue = 0;
      endValue = value;
      displayValue = value;
      runningTotal = value;
    } else if (type === "end") {
      // End shows the final total value
      startValue = 0; // End bar starts from 0 to show total
      endValue = value; // Use the provided value as final total
      displayValue = value; // Show final total
      runningTotal = value;
    } else {
      startValue = runningTotal;
      if (type === "positive") {
        endValue = runningTotal + value;
        displayValue = value;
      } else {
        // negative
        endValue = runningTotal - value;
        displayValue = -value;
      }
      runningTotal = endValue;
    }

    return {
      ...item,
      label,
      startValue,
      endValue,
      displayValue,
      type,
      // For bar rendering - use startValue as base and barValue as height
      base: type === "start" || type === "end" ? 0 : startValue,
      barValue: type === "start" || type === "end" ? endValue : endValue - startValue,
    };
  });

  // Get color based on type
  const getColor = (type) => {
    switch (type) {
      case "start":
      case "end":
        return "#10b981"; // Verde para início e fim
      case "positive":
        return COLOR_BLUE_CUSTOM; // Azul para valores positivos
      case "negative":
        return "#f97316"; // Laranja para valores negativos
      default:
        return CHART_COLORS.primary;
    }
  };

  return (
    <div style={{ height }} role="img" aria-label="Gráfico de cascata">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={margin}>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={CHART_COLORS.foreground}
              opacity={0.1}
            />
          )}
          <XAxis
            dataKey={labelKey}
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke={CHART_COLORS.foreground}
            tick={{ fill: CHART_COLORS.foreground }}
          />
          <Tooltip
            formatter={(value, name, props) => {
              const item = props.payload;
              if (name === "barValue" || name === "endValue") {
                return [
                  item.type === "start" || item.type === "end"
                    ? item.endValue
                    : `${item.displayValue > 0 ? "+" : ""}${item.displayValue}`,
                  item.type === "start" || item.type === "end"
                    ? "Total"
                    : item.type === "positive"
                    ? "Aumento"
                    : "Redução",
                ];
              }
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: `1px solid ${CHART_COLORS.foreground}`,
              borderRadius: "4px",
            }}
          />
          {/* Base bars (invisible) for intermediate values to create suspended effect */}
          <Bar dataKey="base" stackId="base" fill="transparent" />
          {/* Actual change bars */}
          <Bar
            dataKey="barValue"
            stackId="change"
            radius={[0, 0, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
            ))}
            {showLabels && (
              <LabelList
                dataKey="displayValue"
                position="top"
                formatter={(value, name, props) => {
                  // props.payload contains the data entry
                  const entry = props?.payload;
                  if (!entry || !entry.type) return value;
                  
                  if (entry.type === "start" || entry.type === "end") {
                    return entry.endValue;
                  }
                  return (value > 0 ? "+" : "") + value;
                }}
                style={{ fill: CHART_COLORS.foreground, fontSize: "12px" }}
              />
            )}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
  ReferenceLine,
} from "recharts";

// ============================================================
// SURVEY CHARTS - Todos os gráficos utilizados no projeto
// ============================================================
// Este arquivo contém todos os componentes de gráficos usados
// nos componentes de pesquisa (survey).
//
// Componentes disponíveis:
// 1. SentimentDivergentChart - Gráfico divergente de sentimento
// 2. SentimentStackedChart - Gráfico empilhado de sentimento
// 3. NPSStackedChart - Gráfico empilhado NPS
// 4. SimpleBarChart - Gráfico de barras simples
//
// ============================================================
// TYPES (JSDoc)
// ============================================================

/**
 * @typedef {Object} SentimentDataItem
 * @property {string} [category]
 * @property {string} [segment]
 * @property {number} positive
 * @property {number} neutral
 * @property {number} negative
 */

/**
 * @typedef {Object} NPSData
 * @property {number} Detratores
 * @property {number} Neutros
 * @property {number} Promotores
 */

/**
 * @typedef {Object} SimpleBarDataItem
 * @property {string|number|undefined} [key]
 */

// ============================================================
// 1. SENTIMENT DIVERGENT CHART
// ============================================================
// Gráfico divergente onde negativo aparece à esquerda e positivo à direita
// Usado em: SupportAnalysis - Análise de Sentimento

/**
 * @param {Object} props
 * @param {SentimentDataItem[]} props.data
 * @param {number|string} [props.height]
 * @param {Object} [props.margin]
 * @param {[number, number]} [props.xAxisDomain]
 * @param {boolean} [props.showGrid]
 */
export function SentimentDivergentChart({
  data,
  height = 320,
  margin = { top: 20, right: 30, left: 100, bottom: 20 },
  xAxisDomain,
  showGrid = true,
}) {
  // Transform data: negative values become negative for divergent display
  // Only plot positive and negative, ignore neutral completely
  const divergentData = data.map((item) => {
    const transformed = {
      category: item.category || item.segment || "",
      positive: item.positive,
      negative: -item.negative,
    };
    return transformed;
  });

  // Calculate dynamic domain if not provided
  const maxValue = Math.max(
    ...divergentData.flatMap((item) => [
      Math.abs(item.positive),
      Math.abs(item.negative),
    ])
  );
  const domain = xAxisDomain || [
    -Math.ceil(maxValue * 1.1),
    Math.ceil(maxValue * 1.1),
  ];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={divergentData} layout="vertical" margin={margin}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          )}
          <XAxis
            type="number"
            domain={domain}
            tickFormatter={(value) => `${Math.abs(value)}%`}
          />
          <YAxis type="category" dataKey="category" width={90} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "neutral") return null;
              return [
                `${Math.abs(value)}%`,
                name === "negative" ? "Negativo" : "Positivo",
              ];
            }}
            filterNull={true}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="square"
            formatter={(value) => {
              // Only show negative and positive, filter out neutral
              if (value === "neutral" || value === "Neutro") {
                return "";
              }
              return value === "negative" || value === "Negativo"
                ? "Negativo"
                : value === "positive" || value === "Positivo"
                ? "Positivo"
                : "";
            }}
          />
          <Bar
            dataKey="negative"
            name="Negativo"
            fill="hsl(var(--chart-negative))"
            radius={[4, 4, 4, 4]}
          >
            <LabelList
              dataKey="negative"
              position="right"
              formatter={(value) => `${Math.abs(value)}%`}
              style={{
                fill: "hsl(var(--foreground))",
                fontSize: "12px",
              }}
            />
          </Bar>
          <Bar
            dataKey="positive"
            name="Positivo"
            fill="hsl(var(--chart-positive))"
            radius={[4, 4, 4, 4]}
          >
            <LabelList
              dataKey="positive"
              position="right"
              formatter={(value) => `${value}%`}
              style={{
                fill: "hsl(var(--foreground))",
                fontSize: "12px",
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// 2. SENTIMENT STACKED CHART
// ============================================================
// Gráfico empilhado de sentimento (0-100%)
// Usado em: AttributeDeepDive - Sentiment by Segment
//           ResponseDetails - Sentiment Analysis

/**
 * @param {Object} props
 * @param {SentimentDataItem[]} props.data
 * @param {number|string} [props.height]
 * @param {Object} [props.margin]
 * @param {string} [props.yAxisDataKey]
 * @param {number} [props.yAxisWidth]
 * @param {boolean} [props.showGrid]
 * @param {boolean} [props.showLegend]
 * @param {boolean} [props.axisLine]
 * @param {boolean} [props.tickLine]
 */
export function SentimentStackedChart({
  data,
  height = 256,
  margin = { top: 10, right: 30, left: 100, bottom: 10 },
  yAxisDataKey = "category",
  yAxisWidth = 90,
  showGrid = true,
  showLegend = true,
  axisLine = true,
  tickLine = true,
}) {
  // Transform data: negative values become negative for divergent display
  // Remove neutral, keep original positive and negative values
  const transformedData = data.map((item) => {
    const categoryValue = item.category || item.segment || "";
    return {
      [yAxisDataKey]: categoryValue,
      positive: item.positive,
      negative: -item.negative, // Negative values go to the left
    };
  });

  // Calculate dynamic domain based on data
  const maxValue = Math.max(
    ...transformedData.flatMap((item) => [
      Math.abs(item.positive),
      Math.abs(item.negative),
    ])
  );
  const domain = [-Math.ceil(maxValue * 1.1), Math.ceil(maxValue * 1.1)];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={transformedData} layout="vertical" margin={margin}>
          <ReferenceLine
            x={0}
            stroke="hsl(var(--foreground))"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <XAxis
            type="number"
            domain={domain}
            tickFormatter={(v) => {
              if (v === 0) return "0%";
              return "";
            }}
            ticks={[0]}
            axisLine={axisLine}
            tickLine={tickLine}
          />
          <YAxis
            type="category"
            dataKey={yAxisDataKey}
            width={yAxisWidth}
            axisLine={axisLine}
            tickLine={tickLine}
          />
          <Tooltip
            formatter={(v, name) => {
              if (name === "neutral") return null;
              return [
                `${Math.abs(v)}%`,
                name === "negative" ? "Negativo" : "Positivo",
              ];
            }}
            filterNull={true}
          />
          {showLegend && (
            <Legend
              formatter={(value) => {
                if (value === "neutral" || value === "Neutro") return "";
                return value === "negative" || value === "Negativo"
                  ? "Negativo"
                  : value === "positive" || value === "Positivo"
                  ? "Positivo"
                  : "";
              }}
            />
          )}
          <Bar
            dataKey="negative"
            name="Negativo"
            fill="hsl(var(--chart-negative))"
            radius={[4, 4, 4, 4]}
          >
            <LabelList
              dataKey="negative"
              position="right"
              formatter={(value) => `${Math.abs(value)}%`}
              style={{
                fill: "hsl(var(--foreground))",
                fontSize: "12px",
              }}
            />
          </Bar>
          <Bar
            dataKey="positive"
            name="Positivo"
            fill="hsl(var(--chart-positive))"
            radius={[4, 4, 4, 4]}
          >
            <LabelList
              dataKey="positive"
              position="right"
              formatter={(value) => `${value}%`}
              style={{
                fill: "hsl(var(--foreground))",
                fontSize: "12px",
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// 3. NPS STACKED CHART
// ============================================================
// Gráfico empilhado NPS (Detratores/Neutros/Promotores)
// Usado em: SupportAnalysis - Distribuição NPS

/**
 * @param {Object} props
 * @param {NPSData} props.data
 * @param {number|string} [props.height]
 * @param {Object} [props.margin]
 * @param {boolean} [props.showGrid]
 * @param {boolean} [props.showLegend]
 */
export function NPSStackedChart({
  data,
  height = 256,
  margin = { top: 20, right: 30, left: 20, bottom: 20 },
  showGrid = true,
  showLegend = true,
}) {
  const chartData = [
    {
      name: "NPS",
      Detratores: data.Detratores,
      Neutros: data.Neutros,
      Promotores: data.Promotores,
    },
  ];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={margin}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          )}
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis type="category" dataKey="name" width={60} hide />
          <Tooltip
            formatter={(value, name) => [
              `${value}%`,
              name === "Detratores"
                ? "Detratores"
                : name === "Neutros"
                ? "Neutros"
                : "Promotores",
            ]}
          />
          {showLegend && (
            <Legend
              formatter={(value) =>
                value === "Detratores"
                  ? "Detratores (0-6)"
                  : value === "Neutros"
                  ? "Neutros (7-8)"
                  : "Promotores (9-10)"
              }
            />
          )}
          <Bar
            dataKey="Detratores"
            fill="hsl(var(--chart-negative))"
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="Neutros"
            fill="hsl(var(--chart-neutral))"
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="Promotores"
            fill="hsl(var(--chart-positive))"
            stackId="a"
            radius={[4, 4, 4, 4]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// 4. SIMPLE BAR CHART
// ============================================================
// Gráfico de barras simples (estilo Nussbaumer)
// Usado em: AttributeDeepDive - Distribuição
//           ResponseDetails - Questões fechadas
//           SupportAnalysis - Outras Intenções
// NOTA: Sempre usa escala fixa de 0-100% para mostrar proporções reais

/**
 * @param {Object} props
 * @param {SimpleBarDataItem[]} props.data
 * @param {string} props.dataKey
 * @param {string} props.yAxisDataKey
 * @param {number|string} [props.height]
 * @param {Object} [props.margin]
 * @param {number} [props.yAxisWidth]
 * @param {string} [props.fillColor]
 * @param {boolean} [props.showLabels]
 * @param {Function} [props.labelFormatter]
 * @param {Function} [props.tooltipFormatter]
 * @param {boolean} [props.sortData]
 * @param {("asc"|"desc")} [props.sortDirection]
 * @param {boolean} [props.hideXAxis]
 */
export function SimpleBarChart({
  data,
  dataKey,
  yAxisDataKey,
  height = 256,
  margin = { top: 10, right: 80, left: 120, bottom: 10 },
  yAxisWidth = 110,
  fillColor = "hsl(var(--primary))",
  showLabels = true,
  labelFormatter = (value) => `${value}%`,
  tooltipFormatter,
  sortData = true,
  sortDirection = "desc",
  hideXAxis = false,
}) {
  const sortedData = sortData
    ? [...data].sort((a, b) => {
        const aVal = a[dataKey];
        const bVal = b[dataKey];
        // Validar que são números
        if (typeof aVal !== "number" || typeof bVal !== "number") {
          return 0;
        }
        return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
      })
    : data;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} layout="vertical" margin={margin}>
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            axisLine={false}
            tickLine={false}
            hide={hideXAxis}
            allowDataOverflow={false}
          />
          <YAxis
            type="category"
            dataKey={yAxisDataKey}
            width={yAxisWidth}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={tooltipFormatter || ((value) => [`${value}%`, ""])}
          />
          <Bar dataKey={dataKey} fill={fillColor} radius={[0, 4, 4, 0]}>
            {showLabels && (
              <LabelList
                dataKey={dataKey}
                position="right"
                formatter={labelFormatter}
                style={{
                  fill: "hsl(var(--foreground))",
                  fontSize: "12px",
                }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

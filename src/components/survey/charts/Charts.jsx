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
  showGrid = false,
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
          {/* Linha tracejada apenas no marco 0 */}
          <ReferenceLine
            x={0}
            stroke="hsl(var(--foreground))"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {/* Sem grid - removido CartesianGrid completamente */}
          <XAxis
            type="number"
            domain={domain}
            tickFormatter={(value) => {
              if (value === 0) return "0%";
              return "";
            }}
            ticks={[0]}
            axisLine={false}
            tickLine={false}
            allowDataOverflow={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={90}
            axisLine={false}
            tickLine={false}
          />
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
            barSize={40}
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
            barSize={40}
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
          {/* Linha tracejada apenas no marco 0 */}
          <ReferenceLine
            x={0}
            stroke="hsl(var(--foreground))"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {/* Sem grid - removido CartesianGrid */}
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
// 3. SENTIMENT THREE COLOR CHART
// ============================================================
// Gráfico de sentimento com três cores (Positivo/Negativo/Não aplicável)
// Usado em: AttributeDeepDive - Análise de Sentimento por Tipo de Cliente

/**
 * @param {Object} props
 * @param {Array<{sentiment: string, Controle: number, "Pré-pago": number, "Pós-pago": number}>} props.data
 * @param {number|string} [props.height]
 * @param {Object} [props.margin]
 * @param {boolean} [props.showGrid]
 * @param {boolean} [props.showLegend]
 */
export function SentimentThreeColorChart({
  data,
  height = 80,
  margin = { top: 10, right: 30, left: 20, bottom: 10 },
  showGrid = false,
  showLegend = true,
}) {
  // Cores para cada sentimento
  const sentimentColors = {
    Negativo: "hsl(var(--chart-negative))",
    "Não aplicável": "hsl(var(--chart-neutral))",
    Positivo: "hsl(var(--chart-positive))",
  };

  // Extrair dinamicamente os segmentos (excluindo "sentiment")
  const segments =
    data.length > 0
      ? Object.keys(data[0]).filter((key) => key !== "sentiment")
      : [];

  // Criar dados para cada segmento
  const chartDataBySegment = segments.map((segment) => {
    const chartData = [
      {
        name: segment,
        Negativo:
          data.find((item) => item.sentiment === "Negativo")?.[segment] || 0,
        "Não aplicável":
          data.find((item) => item.sentiment === "Não aplicável")?.[segment] ||
          0,
        Positivo:
          data.find((item) => item.sentiment === "Positivo")?.[segment] || 0,
      },
    ];
    return { segment, chartData };
  });

  return (
    <div className="space-y-6">
      {chartDataBySegment.map(({ segment, chartData }) => (
        <div key={segment} className="space-y-2">
          <div className="font-semibold text-sm mb-2">{segment}</div>
          <div style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={margin}>
                {showGrid && (
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                )}
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" width={120} hide />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  filterNull={true}
                />
                <Bar
                  dataKey="Negativo"
                  name="Negativo"
                  fill={sentimentColors.Negativo}
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Não aplicável"
                  name="Não aplicável"
                  fill={sentimentColors["Não aplicável"]}
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Positivo"
                  name="Positivo"
                  fill={sentimentColors.Positivo}
                  stackId="a"
                  radius={[4, 4, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Labels com valores */}
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div>
              <div className="font-bold">{chartData[0].Negativo}%</div>
              <div className="text-muted-foreground">Negativo</div>
            </div>
            <div>
              <div className="font-bold">{chartData[0]["Não aplicável"]}%</div>
              <div className="text-muted-foreground">Não aplicável</div>
            </div>
            <div>
              <div className="font-bold">{chartData[0].Positivo}%</div>
              <div className="text-muted-foreground">Positivo</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 4. NPS STACKED CHART
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
 * @param {boolean} [props.hideXAxis]
 * @param {boolean} [props.showPercentagesInLegend]
 */
export function NPSStackedChart({
  data,
  height = 256,
  margin = { top: 20, right: 30, left: 20, bottom: 20 },
  showGrid = true,
  showLegend = true,
  hideXAxis = false,
  showPercentagesInLegend = false,
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
            hide={hideXAxis}
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
              formatter={(value) => {
                if (showPercentagesInLegend) {
                  const percentage =
                    value === "Detratores"
                      ? data.Detratores
                      : value === "Neutros"
                      ? data.Neutros
                      : data.Promotores;
                  const label =
                    value === "Detratores"
                      ? "Detratores (0-6)"
                      : value === "Neutros"
                      ? "Neutros (7-8)"
                      : "Promotores (9-10)";
                  return `${label} - ${percentage}%`;
                }
                return value === "Detratores"
                  ? "Detratores (0-6)"
                  : value === "Neutros"
                  ? "Neutros (7-8)"
                  : "Promotores (9-10)";
              }}
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
// 5. SIMPLE BAR CHART
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
  hideXAxis = true,
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
            interval={0}
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

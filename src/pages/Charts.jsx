import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SentimentDivergentChart,
  SentimentThreeColorChart,
  NPSStackedChart,
} from "@/components/survey/widgets/charts/Charts";
import { SchemaBarChart } from "@/components/survey/common/ChartRenderers";
import {
  SchemaRecommendationsTable,
  SchemaSegmentationTable,
  SchemaDistributionTable,
  SchemaNPSDistributionTable,
  SchemaNPSTable,
  SchemaSentimentImpactTable,
  SchemaPositiveCategoriesTable,
  SchemaNegativeCategoriesTable,
} from "@/components/survey/common/TableRenderers";
import { WordCloud } from "@/components/survey/widgets/WordCloud";
import { KPICard } from "@/components/survey/widgets/KPICard";
import { LineChart } from "@/components/survey/widgets/charts/LineChart";
import { ParetoChart } from "@/components/survey/widgets/charts/ParetoChart";
import { AnalyticalTable } from "@/components/survey/widgets/AnalyticalTable";
import { SlopeGraph } from "@/components/survey/widgets/SlopeGraph";
import { WaterfallChart } from "@/components/survey/widgets/WaterfallChart";
import { ScatterPlot } from "@/components/survey/widgets/charts/ScatterPlot";
import { Histogram } from "@/components/survey/widgets/charts/Histogram";
import { QuadrantChart } from "@/components/survey/widgets/charts/QuadrantChart";
import { Heatmap } from "@/components/survey/widgets/charts/Heatmap";
import { SankeyDiagram } from "@/components/survey/widgets/charts/SankeyDiagram";
import { StackedBarMECE } from "@/components/survey/widgets/charts/StackedBarMECE";
import { EvolutionaryScorecard } from "@/components/survey/widgets/charts/EvolutionaryScorecard";

export default function Charts() {
  // Dados de exemplo para SentimentDivergentChart
  const sentimentDivergentData = [
    { category: "Atendimento", positive: 45, negative: 15 },
    { category: "Qualidade", positive: 60, negative: 10 },
    { category: "Preço", positive: 30, negative: 40 },
    { category: "Entrega", positive: 55, negative: 20 },
  ];

  // Dados de exemplo para SentimentThreeColorChart
  const sentimentThreeColorData = [
    { sentiment: "Positivo", "Tipo A": 45, "Tipo B": 55, "Tipo C": 40 },
    { sentiment: "Negativo", "Tipo A": 25, "Tipo B": 20, "Tipo C": 30 },
    { sentiment: "Não aplicável", "Tipo A": 30, "Tipo B": 25, "Tipo C": 30 },
  ];

  // Dados de exemplo para NPSStackedChart
  const npsData = {
    Detratores: 20,
    Neutros: 30,
    Promotores: 50,
  };

  // Dados de exemplo para WordCloud
  const wordCloudData = [
    { text: "Qualidade", value: 85 },
    { text: "Atendimento", value: 72 },
    { text: "Preço", value: 65 },
    { text: "Entrega", value: 58 },
    { text: "Produto", value: 52 },
    { text: "Serviço", value: 48 },
    { text: "Suporte", value: 42 },
    { text: "Experiência", value: 38 },
    { text: "Satisfação", value: 35 },
    { text: "Confiança", value: 32 },
    { text: "Eficiência", value: 28 },
    { text: "Rapidez", value: 25 },
  ];

  // Dados de exemplo para KPI Card
  const kpiData = {
    value: 1250,
    label: "Total de Vendas",
    delta: 150,
    trend: "up",
    target: 1200,
  };

  // Dados de exemplo para Line Chart
  const lineChartData = [
    { date: "Jan", value1: 100, value2: 80 },
    { date: "Fev", value1: 120, value2: 90 },
    { date: "Mar", value1: 110, value2: 95 },
    { date: "Abr", value1: 130, value2: 100 },
    { date: "Mai", value1: 125, value2: 105 },
  ];

  // Dados de exemplo para Pareto Chart
  const paretoData = [
    { category: "Problema A", value: 45 },
    { category: "Problema B", value: 30 },
    { category: "Problema C", value: 15 },
    { category: "Problema D", value: 7 },
    { category: "Problema E", value: 3 },
  ];

  // Dados de exemplo para Analytical Table
  const analyticalTableData = [
    { rank: 1, name: "Item A", value: 95, category: "Alta" },
    { rank: 2, name: "Item B", value: 87, category: "Alta" },
    { rank: 3, name: "Item C", value: 72, category: "Média" },
    { rank: 4, name: "Item D", value: 65, category: "Média" },
    { rank: 5, name: "Item E", value: 58, category: "Baixa" },
  ];

  // Dados de exemplo para Slope Graph
  const slopeGraphData = [
    { category: "Atendimento", before: 60, after: 75 },
    { category: "Qualidade", before: 70, after: 85 },
    { category: "Preço", before: 50, after: 65 },
    { category: "Entrega", before: 55, after: 70 },
  ];

  // Dados de exemplo para Waterfall Chart - Demonstração clara de valores suspensos
  const waterfallData = [
    { label: "Start", value: 4000, type: "start" },
    { label: "Jan", value: 1707, type: "positive" },
    { label: "Feb", value: -1425, type: "negative" },
    { label: "Mar", value: -1030, type: "negative" },
    { label: "Apr", value: 1812, type: "positive" },
    { label: "May", value: -1067, type: "negative" },
    { label: "Jun", value: -1481, type: "negative" },
    { label: "Jul", value: 1228, type: "positive" },
    { label: "Aug", value: 1176, type: "positive" },
    { label: "Sep", value: 1146, type: "positive" },
    { label: "Oct", value: 1205, type: "positive" },
    { label: "Nov", value: -1388, type: "negative" },
    { label: "Dec", value: 1492, type: "positive" },
    { label: "End", value: 7375, type: "end" },
  ];

  // Dados de exemplo para Scatter Plot
  const scatterData = [
    { x: 10, y: 20, size: 5, category: "A" },
    { x: 15, y: 30, size: 8, category: "A" },
    { x: 20, y: 25, size: 6, category: "B" },
    { x: 25, y: 40, size: 10, category: "B" },
    { x: 30, y: 35, size: 7, category: "C" },
  ];

  // Dados de exemplo para Histogram
  const histogramData = [
    12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48, 50, 52, 55, 58,
    60,
  ];

  // Dados de exemplo para Quadrant Chart
  const quadrantData = [
    { x: 30, y: 70, label: "Alta Prioridade", size: 10 },
    { x: 70, y: 80, label: "Urgente", size: 15 },
    { x: 20, y: 30, label: "Baixa Prioridade", size: 5 },
    { x: 80, y: 20, label: "Monitorar", size: 8 },
  ];

  // Dados de exemplo para Heatmap
  const heatmapData = [
    { x: "Segunda", y: "Manhã", value: 85 },
    { x: "Segunda", y: "Tarde", value: 72 },
    { x: "Terça", y: "Manhã", value: 90 },
    { x: "Terça", y: "Tarde", value: 68 },
    { x: "Quarta", y: "Manhã", value: 88 },
    { x: "Quarta", y: "Tarde", value: 75 },
  ];

  // Dados de exemplo para Sankey Diagram
  const sankeyNodes = [
    { id: "source1", label: "Fonte 1" },
    { id: "source2", label: "Fonte 2" },
    { id: "intermediate", label: "Intermediário" },
    { id: "target1", label: "Destino 1" },
    { id: "target2", label: "Destino 2" },
  ];
  const sankeyLinks = [
    { source: "source1", target: "intermediate", value: 50 },
    { source: "source2", target: "intermediate", value: 30 },
    { source: "intermediate", target: "target1", value: 40 },
    { source: "intermediate", target: "target2", value: 40 },
  ];

  // Dados de exemplo para Stacked Bar MECE
  const stackedMECEData = [
    { category: "Categoria 1", series1: 40, series2: 30, series3: 30 },
    { category: "Categoria 2", series1: 50, series2: 25, series3: 25 },
    { category: "Categoria 3", series1: 35, series2: 35, series3: 30 },
  ];

  // Dados de exemplo para Evolutionary Scorecard
  const scorecardData = {
    value: 85,
    target: 90,
    delta: 5,
    trend: "up",
    label: "Satisfação do Cliente",
  };

  // Dados de exemplo para Bar Chart (tipo barChart do JSON)
  const barChartData = [
    { label: "Categoria A", value: 72 },
    { label: "Categoria B", value: 85 },
    { label: "Categoria C", value: 58 },
    { label: "Categoria D", value: 91 },
    { label: "Categoria E", value: 64 },
  ];
  const barChartComponent = {
    type: "barChart",
    config: { dataKey: "value", yAxisDataKey: "label", height: 280 },
    dataPath: "",
    data: barChartData,
  };

  // Dados de exemplo para Recommendations Table
  const recommendationsData = {
    config: {
      severityLabels: {
        high: "Alto",
        medium: "Médio",
        low: "Baixo",
        critical: "Crítico",
      },
    },
    items: [
      {
        id: 1,
        recommendation: "Exemplo de recomendação prioritária",
        severity: "high",
        stakeholders: ["Área 1", "Área 2"],
        tasks: [
          { task: "Tarefa de implementação 1", owner: "Área 1" },
          { task: "Tarefa de implementação 2", owner: "Área 2" },
        ],
      },
      {
        id: 2,
        recommendation: "Exemplo de recomendação média",
        severity: "medium",
        stakeholders: ["Área 3"],
        tasks: [],
      },
    ],
  };
  const recommendationsComponent = {
    type: "recommendationsTable",
    dataPath: "",
    data: recommendationsData,
  };

  // Dados de exemplo para Segmentation Table
  const segmentationTableData = [
    {
      cluster: "Cluster Satisfeitos",
      description: "Perfil de alta satisfação",
      percentage: 42,
      id: "C1",
    },
    {
      cluster: "Cluster Neutros",
      description: "Perfil neutro",
      percentage: 35,
      id: "C2",
    },
    {
      cluster: "Cluster Insatisfeitos",
      description: "Perfil de baixa satisfação",
      percentage: 23,
      id: "C3",
    },
  ];
  const segmentationComponent = {
    type: "segmentationTable",
    dataPath: "",
    data: segmentationTableData,
  };

  // Dados de exemplo para Distribution Table
  const distributionTableData = [
    { segment: "Segmento A", count: 450, percentage: 38 },
    { segment: "Segmento B", count: 320, percentage: 27 },
    { segment: "Segmento C", count: 280, percentage: 23 },
    { segment: "Segmento D", count: 150, percentage: 12 },
  ];
  const distributionComponent = {
    type: "distributionTable",
    dataPath: "",
    data: distributionTableData,
  };

  // Dados de exemplo para NPS Distribution Table
  const npsDistributionTableData = [
    { segment: "Tipo A", promoters: 55, neutrals: 25, detractors: 20 },
    { segment: "Tipo B", promoters: 48, neutrals: 30, detractors: 22 },
    { segment: "Tipo C", promoters: 62, neutrals: 22, detractors: 16 },
  ];
  const npsDistributionComponent = {
    type: "npsDistributionTable",
    dataPath: "",
    data: npsDistributionTableData,
    config: { yAxisDataKey: "segment" },
  };

  // Dados de exemplo para NPS Table
  const npsTableData = [
    { segment: "Tipo A", NPS: 35 },
    { segment: "Tipo B", NPS: 26 },
    { segment: "Tipo C", NPS: 46 },
  ];
  const npsTableComponent = {
    type: "npsTable",
    dataPath: "",
    data: npsTableData,
    categoryName: "Segmento",
    config: { yAxisDataKey: "segment" },
  };

  // Dados de exemplo para Sentiment Impact Table
  const sentimentImpactTableData = [
    { sentiment: "Positivo", "Tipo A": 45, "Tipo B": 55, "Tipo C": 40 },
    { sentiment: "Negativo", "Tipo A": 25, "Tipo B": 20, "Tipo C": 30 },
    { sentiment: "Não aplicável", "Tipo A": 30, "Tipo B": 25, "Tipo C": 30 },
  ];
  const sentimentImpactComponent = {
    type: "sentimentImpactTable",
    dataPath: "",
    data: sentimentImpactTableData,
  };

  // Dados de exemplo para Positive Categories Table
  const positiveCategoriesTableData = [
    { category: "Atendimento", "Tipo A": 72, "Tipo B": 68, "Tipo C": 75 },
    { category: "Qualidade", "Tipo A": 80, "Tipo B": 78, "Tipo C": 82 },
    { category: "Preço", "Tipo A": 55, "Tipo B": 60, "Tipo C": 58 },
  ];
  const positiveCategoriesComponent = {
    type: "positiveCategoriesTable",
    dataPath: "",
    data: positiveCategoriesTableData,
  };

  // Dados de exemplo para Negative Categories Table
  const negativeCategoriesTableData = [
    { category: "Atendimento", "Tipo A": 12, "Tipo B": 15, "Tipo C": 10 },
    { category: "Qualidade", "Tipo A": 8, "Tipo B": 10, "Tipo C": 7 },
    { category: "Preço", "Tipo A": 28, "Tipo B": 25, "Tipo C": 30 },
  ];
  const negativeCategoriesComponent = {
    type: "negativeCategoriesTable",
    dataPath: "",
    data: negativeCategoriesTableData,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gráficos do Sistema</h1>
          <p className="text-muted-foreground">
            Visualização de todos os tipos de gráficos disponíveis
          </p>
        </div>

        {/* SentimentDivergentChart */}
        <Card>
          <CardHeader>
            <CardTitle>1. SentimentDivergentChart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico divergente de sentimento (negativo à esquerda, positivo à
              direita)
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SentimentDivergentChart
              data={sentimentDivergentData}
              height={320}
            />
          </CardContent>
        </Card>

        {/* SentimentThreeColorChart */}
        <Card>
          <CardHeader>
            <CardTitle>2. SentimentThreeColorChart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de três cores (Positivo/Negativo/Não aplicável)
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SentimentThreeColorChart
              data={sentimentThreeColorData}
              height={120}
            />
          </CardContent>
        </Card>

        {/* NPSStackedChart */}
        <Card>
          <CardHeader>
            <CardTitle>3. NPSStackedChart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico empilhado de NPS (Detratores/Neutros/Promotores)
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <NPSStackedChart data={npsData} height={256} />
          </CardContent>
        </Card>

        {/* WordCloud */}
        <Card>
          <CardHeader>
            <CardTitle>4. WordCloud</CardTitle>
            <p className="text-sm text-muted-foreground">
              Nuvem de palavras interativa
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <WordCloud words={wordCloudData} maxWords={12} />
          </CardContent>
        </Card>

        {/* KPI Card */}
        <Card>
          <CardHeader>
            <CardTitle>5. KPI Card</CardTitle>
            <p className="text-sm text-muted-foreground">
              Card de indicador chave de performance com valor, delta, tendência
              e meta
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <KPICard
              value={kpiData.value}
              label={kpiData.label}
              delta={kpiData.delta}
              trend={kpiData.trend}
              target={kpiData.target}
            />
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>6. Line Chart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de linha para evolução temporal
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <LineChart
              data={lineChartData}
              xAxisDataKey="date"
              lines={[
                { dataKey: "value1", name: "Série 1", color: "#ff9e2b" },
                { dataKey: "value2", name: "Série 2", color: "#1982d8" },
              ]}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Pareto Chart */}
        <Card>
          <CardHeader>
            <CardTitle>7. Pareto Chart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de Pareto (80/20) com barras e linha cumulativa
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-12">
            <ParetoChart
              data={paretoData}
              categoryKey="category"
              valueKey="value"
              height={450}
            />
          </CardContent>
        </Card>

        {/* Analytical Table */}
        <Card>
          <CardHeader>
            <CardTitle>8. Analytical Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela analítica com ranking e ordenação
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <AnalyticalTable
              data={analyticalTableData}
              columns={[
                { key: "rank", label: "Rank", sortable: true },
                { key: "name", label: "Nome", sortable: true },
                { key: "value", label: "Valor", sortable: true },
                { key: "category", label: "Categoria", sortable: true },
              ]}
              showRanking={true}
            />
          </CardContent>
        </Card>

        {/* Slope Graph */}
        <Card>
          <CardHeader>
            <CardTitle>9. Slope Graph</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de comparação antes vs. depois
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-16">
            <SlopeGraph
              data={slopeGraphData}
              categoryKey="category"
              beforeKey="before"
              afterKey="after"
              height={350}
              showDelta={true}
            />
          </CardContent>
        </Card>

        {/* Waterfall Chart */}
        <Card>
          <CardHeader>
            <CardTitle>10. Waterfall Chart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de cascata mostrando decomposição causal
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <WaterfallChart
              data={waterfallData}
              labelKey="label"
              valueKey="value"
              typeKey="type"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle>11. Scatter Plot</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de dispersão para relação entre variáveis
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <ScatterPlot
              data={scatterData}
              xAxisDataKey="x"
              yAxisDataKey="y"
              sizeKey="size"
              colorKey="category"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Histogram */}
        <Card>
          <CardHeader>
            <CardTitle>12. Histogram</CardTitle>
            <p className="text-sm text-muted-foreground">
              Histograma de distribuição estatística
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <Histogram
              data={histogramData}
              valueKey="value"
              bins={10}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Quadrant Chart */}
        <Card>
          <CardHeader>
            <CardTitle>13. Quadrant Chart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de quadrantes 2x2 para priorização executiva
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-16">
            <QuadrantChart
              data={quadrantData}
              xAxisDataKey="x"
              yAxisDataKey="y"
              labelKey="label"
              sizeKey="size"
              quadrants={{
                xThreshold: 50,
                yThreshold: 50,
                labels: [
                  "Baixa Prioridade",
                  "Quick Wins",
                  "Monitorar",
                  "Urgente",
                ],
                colors: [
                  "#e5e7eb", // Gray - Baixa Prioridade (Bottom Left)
                  "#fef3c7", // Yellow - Monitorar (Top Left)
                  "#fee2e2", // Red - Urgente (Top Right)
                  "#d1fae5", // Green - Quick Wins (Bottom Right)
                ],
              }}
              showQuadrantColors={true}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>14. Heatmap</CardTitle>
            <p className="text-sm text-muted-foreground">
              Mapa de calor para cruzamento multidimensional
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <Heatmap
              data={heatmapData}
              xKey="x"
              yKey="y"
              valueKey="value"
              xCategories={["Segunda", "Terça", "Quarta"]}
              yCategories={["Manhã", "Tarde"]}
              height={320}
            />
          </CardContent>
        </Card>

        {/* Sankey Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>15. Sankey Diagram</CardTitle>
            <p className="text-sm text-muted-foreground">
              Diagrama de Sankey para fluxo e jornada
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <div className="w-full max-w-full">
              <SankeyDiagram
                nodes={sankeyNodes}
                links={sankeyLinks}
                height={350}
                width={800}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stacked Bar MECE */}
        <Card>
          <CardHeader>
            <CardTitle>16. Stacked Bar MECE (Aprimorado)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de barras empilhadas genérico e flexível
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <StackedBarMECE
              data={stackedMECEData}
              categoryKey="category"
              series={[
                { dataKey: "series1", name: "Série 1", color: "#ff9e2b" },
                { dataKey: "series2", name: "Série 2", color: "#1982d8" },
                { dataKey: "series3", name: "Série 3", color: "#10b981" },
              ]}
              height={350}
            />
          </CardContent>
        </Card>

        {/* Evolutionary Scorecard */}
        <Card>
          <CardHeader>
            <CardTitle>17. Evolutionary Scorecard (Aprimorado)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Scorecard evolutivo com meta, delta e tendência
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <EvolutionaryScorecard
              value={scorecardData.value}
              target={scorecardData.target}
              delta={scorecardData.delta}
              trend={scorecardData.trend}
              label={scorecardData.label}
            />
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>18. Bar Chart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de barras horizontal (tipo barChart do JSON)
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <SchemaBarChart component={barChartComponent} data={{}} />
          </CardContent>
        </Card>

        {/* Recommendations Table */}
        <Card>
          <CardHeader>
            <CardTitle>19. Recommendations Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela de recomendações com tarefas expansíveis
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SchemaRecommendationsTable
              component={recommendationsComponent}
              data={{}}
            />
          </CardContent>
        </Card>

        {/* Segmentation Table */}
        <Card>
          <CardHeader>
            <CardTitle>20. Segmentation Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela de segmentação por clusters
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SchemaSegmentationTable
              component={segmentationComponent}
              data={{}}
            />
          </CardContent>
        </Card>

        {/* Distribution Table */}
        <Card>
          <CardHeader>
            <CardTitle>21. Distribution Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela de distribuição (segmento, quantidade, percentual)
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SchemaDistributionTable
              component={distributionComponent}
              data={{}}
            />
          </CardContent>
        </Card>

        {/* NPS Distribution Table */}
        <Card>
          <CardHeader>
            <CardTitle>22. NPS Distribution Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela de distribuição NPS (Promotores / Neutros / Detratores)
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SchemaNPSDistributionTable
              component={npsDistributionComponent}
              data={{}}
            />
          </CardContent>
        </Card>

        {/* NPS Table */}
        <Card>
          <CardHeader>
            <CardTitle>23. NPS Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela NPS por segmento (score NPS)
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SchemaNPSTable component={npsTableComponent} data={{}} />
          </CardContent>
        </Card>

        {/* Sentiment Impact Table */}
        <Card>
          <CardHeader>
            <CardTitle>24. Sentiment Impact Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela de impacto de sentimento por segmentos
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SchemaSentimentImpactTable
              component={sentimentImpactComponent}
              data={{}}
            />
          </CardContent>
        </Card>

        {/* Positive Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>25. Positive Categories Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela de categorias positivas por segmento
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SchemaPositiveCategoriesTable
              component={positiveCategoriesComponent}
              data={{}}
            />
          </CardContent>
        </Card>

        {/* Negative Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>26. Negative Categories Table</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tabela de categorias negativas por segmento
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <SchemaNegativeCategoriesTable
              component={negativeCategoriesComponent}
              data={{}}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

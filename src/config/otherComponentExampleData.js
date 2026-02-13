/**
 * Exemplos de dados para componentes da aba "Data Path" do JsonReference.
 * Usado quando o relatório carregado não possui dados para um tipo de componente;
 * assim cada tipo pode ser visualizado com um mock isolado do código da página.
 */

// barChart: array com label/option e value/percentage
const barChart = {
  component: {
    type: "barChart",
    index: 0,
    dataPath: "sectionData.barChart",
    config: { dataKey: "percentage", yAxisDataKey: "option" },
  },
  data: {
    sectionData: {
      barChart: [
        { option: "Muito bom", value: 221, percentage: 26 },
        { option: "Bom", value: 221, percentage: 26 },
        { option: "Regular", value: 238, percentage: 28 },
        { option: "Ruim", value: 136, percentage: 16 },
        { option: "Muito ruim", value: 34, percentage: 4 },
      ],
    },
  },
};

const sentimentDivergentChart = {
  component: {
    type: "sentimentDivergentChart",
    index: 0,
    dataPath: "sectionData.sentimentDivergentChart",
    config: { yAxisDataKey: "category" },
  },
  data: {
    sectionData: {
      sentimentDivergentChart: [
        { category: "serviço de rede", positive: 10.5, negative: 38.1 },
        { category: "suporte ao cliente", positive: 6.4, negative: 10.5 },
        { category: "cobertura de rede", positive: 1.8, negative: 13.6 },
        { category: "oferta e preços", positive: 3.3, negative: 6.6 },
      ],
    },
  },
};

const sentimentThreeColorChart = {
  component: {
    type: "sentimentThreeColorChart",
    index: 0,
    dataPath: "sectionData.sentimentThreeColorChart",
    config: {},
  },
  data: {
    sectionData: {
      sentimentThreeColorChart: [
        { sentiment: "Negativo", "Segmento A": 35, "Segmento B": 42, "Segmento C": 28 },
        { sentiment: "Não aplicável", "Segmento A": 30, "Segmento B": 25, "Segmento C": 40 },
        { sentiment: "Positivo", "Segmento A": 35, "Segmento B": 33, "Segmento C": 32 },
      ],
    },
  },
};

const npsStackedChart = {
  component: {
    type: "npsStackedChart",
    index: 0,
    dataPath: "sectionData.npsStackedChart",
    config: {},
  },
  data: {
    sectionData: {
      npsStackedChart: [
        { option: "Detrator", value: 51, percentage: 51.0 },
        { option: "Neutro", value: 19, percentage: 19.0 },
        { option: "Promotor", value: 30, percentage: 30.0 },
      ],
    },
  },
};

const lineChart = {
  component: {
    type: "lineChart",
    index: 0,
    dataPath: "sectionData.lineChart",
    config: {
      xAxisDataKey: "name",
      lines: [{ dataKey: "value", stroke: "#8884d8" }],
    },
  },
  data: {
    sectionData: {
      lineChart: [
        { name: "Jan", value: 400 },
        { name: "Fev", value: 300 },
        { name: "Mar", value: 600 },
      ],
    },
  },
};

const paretoChart = {
  component: {
    type: "paretoChart",
    index: 0,
    dataPath: "sectionData.paretoChart",
    config: { categoryKey: "category", valueKey: "value" },
  },
  data: {
    sectionData: {
      paretoChart: [
        { category: "A", value: 100 },
        { category: "B", value: 80 },
        { category: "C", value: 60 },
      ],
    },
  },
};

const scatterPlot = {
  component: {
    type: "scatterPlot",
    index: 0,
    dataPath: "sectionData.scatterPlot",
    config: { xAxisDataKey: "x", yAxisDataKey: "y" },
  },
  data: {
    sectionData: {
      scatterPlot: [
        { x: 100, y: 200 },
        { x: 120, y: 180 },
        { x: 150, y: 150 },
      ],
    },
  },
};

const histogram = {
  component: {
    type: "histogram",
    index: 0,
    dataPath: "sectionData.histogram",
    config: { valueKey: "value" },
  },
  data: {
    sectionData: {
      histogram: [
        { bin: "0-10", value: 5 },
        { bin: "10-20", value: 12 },
        { bin: "20-30", value: 8 },
      ],
    },
  },
};

const quadrantChart = {
  component: {
    type: "quadrantChart",
    index: 0,
    dataPath: "sectionData.quadrantChart",
    config: { xAxisDataKey: "x", yAxisDataKey: "y", labelKey: "label" },
  },
  data: {
    sectionData: {
      quadrantChart: [
        { label: "A", x: 0.2, y: 0.8 },
        { label: "B", x: 0.7, y: 0.3 },
        { label: "C", x: 0.5, y: 0.5 },
      ],
    },
  },
};

const heatmap = {
  component: {
    type: "heatmap",
    index: 0,
    dataPath: "sectionData.heatmap",
    config: { xKey: "x", yKey: "y", valueKey: "value" },
  },
  data: {
    sectionData: {
      heatmap: [
        { x: "A", y: "1", value: 10 },
        { x: "B", y: "1", value: 20 },
        { x: "A", y: "2", value: 15 },
        { x: "B", y: "2", value: 25 },
      ],
    },
  },
};

const sankeyDiagram = {
  component: {
    type: "sankeyDiagram",
    index: 0,
    dataPath: "sectionData.sankeyDiagram",
    config: {},
  },
  data: {
    sectionData: {
      sankeyDiagram: {
        nodes: [
          { id: "A", label: "Origem" },
          { id: "B", label: "Destino 1" },
          { id: "C", label: "Destino 2" },
        ],
        links: [
          { source: "A", target: "B", value: 10 },
          { source: "A", target: "C", value: 5 },
        ],
      },
    },
  },
};

const stackedBarMECE = {
  component: {
    type: "stackedBarMECE",
    index: 0,
    dataPath: "sectionData.stackedBarMECE",
    config: {
      yAxisDataKey: "option",
      series: [
        { dataKey: "Paraná", name: "Paraná (%)" },
        { dataKey: "Rio Grande do Sul", name: "Rio Grande do Sul (%)" },
        { dataKey: "Santa Catarina", name: "Santa Catarina (%)" },
      ],
    },
  },
  data: {
    sectionData: {
      stackedBarMECE: [
        { option: "5", Paraná: 50.0, "Rio Grande do Sul": 59.7, "Santa Catarina": 52.5 },
        { option: "4", Paraná: 42.9, "Rio Grande do Sul": 16.4, "Santa Catarina": 19.0 },
        { option: "3", Paraná: 7.1, "Rio Grande do Sul": 8.8, "Santa Catarina": 13.2 },
        { option: "2", Paraná: 0.0, "Rio Grande do Sul": 3.1, "Santa Catarina": 8.9 },
        { option: "1", Paraná: 0.0, "Rio Grande do Sul": 11.9, "Santa Catarina": 6.4 },
      ],
    },
  },
};

const evolutionaryScorecard = {
  component: {
    type: "evolutionaryScorecard",
    index: 0,
    dataPath: "sectionData.evolutionaryScorecard",
    config: {
      valueKey: "value",
      targetKey: "target",
      deltaKey: "delta",
      labelKey: "label",
    },
  },
  data: {
    sectionData: {
      evolutionaryScorecard: {
        value: 75,
        target: 80,
        delta: 5,
        trend: "up",
        label: "Evolução (exemplo)",
      },
    },
  },
};

const slopeGraph = {
  component: {
    type: "slopeGraph",
    index: 0,
    dataPath: "sectionData.slopeGraph",
    config: {
      categoryKey: "category",
      beforeKey: "before",
      afterKey: "after",
    },
  },
  data: {
    sectionData: {
      slopeGraph: [
        { category: "A", before: 10, after: 20 },
        { category: "B", before: 30, after: 25 },
        { category: "C", before: 15, after: 35 },
      ],
    },
  },
};

const waterfallChart = {
  component: {
    type: "waterfallChart",
    index: 0,
    dataPath: "sectionData.waterfallChart",
    config: {
      labelKey: "label",
      valueKey: "value",
      typeKey: "type",
    },
  },
  data: {
    sectionData: {
      waterfallChart: [
        { label: "Início", value: 100, type: "start" },
        { label: "Variação", value: -20, type: "negative" },
        { label: "Fim", value: 80, type: "end" },
      ],
    },
  },
};

const npsScoreCard = {
  component: {
    type: "npsScoreCard",
    index: 0,
    dataPath: "sectionData.npsScore",
    config: {},
  },
  data: {
    sectionData: {
      npsScore: { npsScore: 35 },
    },
  },
};

const topCategoriesCards = {
  component: {
    type: "topCategoriesCards",
    index: 0,
    dataPath: "sectionData.topCategoriesCards",
    config: {},
  },
  data: {
    sectionData: {
      topCategoriesCards: [
        {
          rank: 1,
          category: "Categoria A",
          mentions: 100,
          percentage: 100,
          topics: [{ topic: "tema 1", sentiment: "positive" }],
        },
      ],
    },
  },
};

const kpiCard = {
  component: {
    type: "kpiCard",
    index: 0,
    dataPath: "sectionData.kpiCard",
    config: { title: "KPI", valueKey: "value", labelKey: "label" },
  },
  data: {
    sectionData: {
      kpiCard: { label: "Meta", value: 85 },
    },
  },
};

const distributionTable = {
  component: {
    type: "distributionTable",
    index: 0,
    dataPath: "sectionData.distributionTable",
    config: {},
  },
  data: {
    sectionData: {
      distributionTable: [
        { segment: "Opção A", count: 100, percentage: 50 },
        { segment: "Opção B", count: 100, percentage: 50 },
      ],
    },
  },
};

const sentimentTable = {
  component: {
    type: "sentimentTable",
    index: 0,
    dataPath: "sectionData.sentimentTable",
    config: {},
  },
  data: {
    sectionData: {
      sentimentTable: [
        { segment: "Segmento", positive: 60, neutral: 25, negative: 15 },
      ],
    },
  },
};

const analyticalTable = {
  component: {
    type: "analyticalTable",
    index: 0,
    dataPath: "sectionData.analyticalTable",
    config: {},
  },
  data: {
    sectionData: {
      analyticalTable: [
        { segment: "5", Paraná: 50.0, "Rio Grande do Sul": 59.7, "Santa Catarina": 52.5 },
        { segment: "4", Paraná: 42.9, "Rio Grande do Sul": 16.4, "Santa Catarina": 19.0 },
        { segment: "3", Paraná: 7.1, "Rio Grande do Sul": 8.8, "Santa Catarina": 13.2 },
        { segment: "2", Paraná: 0.0, "Rio Grande do Sul": 3.1, "Santa Catarina": 8.9 },
        { segment: "1", Paraná: 0.0, "Rio Grande do Sul": 11.9, "Santa Catarina": 6.4 },
      ],
    },
  },
};

const filterPills = {
  component: {
    type: "filterPills",
    index: 0,
    dataPath: "sectionData.filterPills",
    config: {},
  },
  data: {
    sectionData: {
      filterPills: [{ id: "f1", label: "Filtro 1" }],
    },
  },
};

const wordCloud = {
  component: {
    type: "wordCloud",
    index: 0,
    dataPath: "sectionData.wordCloud",
    config: { title: "Nuvem de palavras" },
  },
  data: {
    sectionData: {
      wordCloud: [
        { text: "palavra1", value: 50 },
        { text: "palavra2", value: 30 },
        { text: "palavra3", value: 20 },
      ],
    },
  },
};

const recommendationsTable = {
  component: {
    type: "recommendationsTable",
    index: 0,
    dataPath: "sectionData.recommendationsTable",
    config: {
      severityLabels: { high: "Alto", medium: "Médio", low: "Baixo", critical: "Crítico" },
    },
  },
  data: {
    sectionData: {
      recommendationsTable: {
        config: {
          severityLabels: { high: "Alto", medium: "Médio", low: "Baixo", critical: "Crítico" },
        },
        items: [
          {
            id: "rec1",
            recommendation: "Priorize a resolução de problemas de velocidade e estabilidade da rede",
            severity: "high",
            stakeholders: ["Operações de Rede", "Engenharia"],
            tasks: [
              { task: "Auditoria de desempenho da rede", owner: "Operações" },
              { task: "Implementar melhorias identificadas", owner: "Engenharia" },
            ],
          },
          {
            id: "rec2",
            recommendation: "Reforce o suporte ao cliente nos canais digitais",
            severity: "medium",
            stakeholders: ["Atendimento"],
            tasks: [{ task: "Capacitar equipe em novos canais", owner: "Atendimento" }],
          },
        ],
      },
    },
  },
};

const segmentationTable = {
  component: {
    type: "segmentationTable",
    index: 0,
    dataPath: "sectionData.segmentationTable",
    config: {},
  },
  data: {
    sectionData: {
      segmentationTable: [
        { cluster: "Passivo — serviço de rede", percent: 25, description: "Clientes insatisfeitos com a rede" },
        { cluster: "Neutro — preço", percent: 40, description: "Avaliam preço como regular" },
        { cluster: "Promotor — atendimento", percent: 35, description: "Satisfeitos com o suporte" },
      ],
    },
  },
};

const npsDistributionTable = {
  component: {
    type: "npsDistributionTable",
    index: 0,
    dataPath: "sectionData.npsDistributionTable",
    config: { yAxisDataKey: "segment" },
  },
  data: {
    sectionData: {
      npsDistributionTable: [
        { segment: "Paraná", promoters: 57.9, neutrals: 21.1, detractors: 21.1 },
        { segment: "Rio Grande do Sul", promoters: 69.0, neutrals: 14.4, detractors: 16.6 },
        { segment: "Santa Catarina", promoters: 55.3, neutrals: 22.4, detractors: 22.4 },
      ],
    },
  },
};

const npsTable = {
  component: {
    type: "npsTable",
    index: 0,
    dataPath: "sectionData.npsTable",
    config: { dataKey: "NPS", yAxisDataKey: "segment" },
  },
  data: {
    sectionData: {
      npsTable: [
        { segment: "Paraná", NPS: 36.8 },
        { segment: "Rio Grande do Sul", NPS: 52.4 },
        { segment: "Santa Catarina", NPS: 29.4 },
      ],
    },
  },
};

const sentimentImpactTable = {
  component: {
    type: "sentimentImpactTable",
    index: 0,
    dataPath: "sectionData.satisfactionImpactSentimentTable",
    config: {},
  },
  data: {
    sectionData: {
      satisfactionImpactSentimentTable: [
        { sentiment: "negativo", "Segmento A": 58.8, "Segmento B": 49.4, "Segmento C": 62.6 },
        { sentiment: "não aplicável", "Segmento A": 0.0, "Segmento B": 0.0, "Segmento C": 0.3 },
        { sentiment: "positivo", "Segmento A": 41.2, "Segmento B": 50.6, "Segmento C": 37.1 },
      ],
    },
  },
};

const positiveCategoriesTable = {
  component: {
    type: "positiveCategoriesTable",
    index: 0,
    dataPath: "sectionData.positiveCategoriesTable",
    config: {},
  },
  data: {
    sectionData: {
      positiveCategoriesTable: [
        { category: "suporte ao cliente", mentions: 50, percentage: 47.1 },
        { category: "atendimento", mentions: 35, percentage: 32.9 },
        { category: "resolução de problemas", mentions: 21, percentage: 19.8 },
      ],
    },
  },
};

const negativeCategoriesTable = {
  component: {
    type: "negativeCategoriesTable",
    index: 0,
    dataPath: "sectionData.negativeCategoriesTable",
    config: {},
  },
  data: {
    sectionData: {
      negativeCategoriesTable: [
        { category: "serviço de rede", mentions: 30, percentage: 35.0 },
        { category: "preço", mentions: 22, percentage: 25.6 },
        { category: "cobertura", mentions: 18, percentage: 20.9 },
      ],
    },
  },
};

export const otherComponentExampleData = {
  barChart,
  sentimentDivergentChart,
  sentimentThreeColorChart,
  npsStackedChart,
  lineChart,
  paretoChart,
  scatterPlot,
  histogram,
  quadrantChart,
  heatmap,
  sankeyDiagram,
  stackedBarMECE,
  evolutionaryScorecard,
  slopeGraph,
  waterfallChart,
  npsScoreCard,
  topCategoriesCards,
  kpiCard,
  distributionTable,
  sentimentTable,
  analyticalTable,
  filterPills,
  wordCloud,
  recommendationsTable,
  segmentationTable,
  npsDistributionTable,
  npsTable,
  sentimentImpactTable,
  positiveCategoriesTable,
  negativeCategoriesTable,
};

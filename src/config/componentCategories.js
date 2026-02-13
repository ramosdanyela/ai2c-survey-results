/**
 * Categorias de componentes para Inventário, Tabelas e aba Componentes do Json Reference.
 * Manter alinhado com ComponentRegistry.jsx: ao adicionar um tipo no registry,
 * incluí-lo na categoria adequada aqui.
 */
export const componentCategories = {
  Charts: [
    "barChart",
    "sentimentDivergentChart",
    "sentimentThreeColorChart",
    "npsStackedChart",
    "lineChart",
    "paretoChart",
    "scatterPlot",
    "histogram",
    "quadrantChart",
    "heatmap",
    "sankeyDiagram",
    "stackedBarMECE",
    "evolutionaryScorecard",
    "slopeGraph",
    "waterfallChart",
  ],
  Cards: ["card", "npsScoreCard", "topCategoriesCards", "kpiCard"],
  Tables: [
    "recommendationsTable",
    "segmentationTable",
    "distributionTable",
    "sentimentTable",
    "npsDistributionTable",
    "npsTable",
    "sentimentImpactTable",
    "positiveCategoriesTable",
    "negativeCategoriesTable",
    "analyticalTable",
  ],
  Widgets: ["filterPills", "wordCloud"],
  Containers: ["container", "grid-container"],
};

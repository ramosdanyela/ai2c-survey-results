/**
 * Component Registry - Factory Pattern para renderização de componentes
 *
 * Este registry substitui o switch/case extenso, facilitando:
 * - Adicionar novos tipos de componentes sem modificar o switch
 * - Manter todos os mapeamentos em um único lugar
 * - Melhorar manutenibilidade e legibilidade
 *
 * @example
 * import { renderComponent } from "./ComponentRegistry";
 *
 * return renderComponent(component, data, { subSection, isExport, exportWordCloud });
 */

import React from "react";
import { logger } from "@/utils/logger";
import {
  SchemaBarChart,
  SchemaSentimentDivergentChart,
  SchemaSentimentStackedChart,
  SchemaSentimentThreeColorChart,
  SchemaNPSStackedChart,
  SchemaLineChart,
  SchemaParetoChart,
  SchemaScatterPlot,
  SchemaHistogram,
  SchemaQuadrantChart,
  SchemaHeatmap,
  SchemaSankeyDiagram,
  SchemaStackedBarMECE,
  SchemaEvolutionaryScorecard,
  SchemaSlopeGraph,
  SchemaWaterfallChart,
} from "./ChartRenderers";
import {
  SchemaCard,
  SchemaNPSScoreCard,
  SchemaTopCategoriesCards,
  SchemaKPICard,
} from "./CardRenderers";
import {
  SchemaRecommendationsTable,
  SchemaSegmentationTable,
  SchemaDistributionTable,
  SchemaSentimentTable,
  SchemaNPSDistributionTable,
  SchemaNPSTable,
  SchemaSentimentImpactTable,
  SchemaPositiveCategoriesTable,
  SchemaNegativeCategoriesTable,
  SchemaAnalyticalTable,
} from "./TableRenderers";
import {
  SchemaFilterPills,
  SchemaWordCloud,
  SchemaAccordion,
  SchemaQuestionsList,
} from "./WidgetRenderers";
import { wrapWithTooltip } from "./tooltipDataSourceApi";

/**
 * Registry de componentes por tipo
 * Facilita adicionar novos tipos sem modificar switch/case
 */
export const componentRegistry = {
  // Charts
  barChart: SchemaBarChart,
  sentimentDivergentChart: SchemaSentimentDivergentChart,
  sentimentStackedChart: SchemaSentimentStackedChart,
  sentimentThreeColorChart: SchemaSentimentThreeColorChart,
  npsStackedChart: SchemaNPSStackedChart,
  lineChart: SchemaLineChart,
  paretoChart: SchemaParetoChart,
  scatterPlot: SchemaScatterPlot,
  histogram: SchemaHistogram,
  quadrantChart: SchemaQuadrantChart,
  heatmap: SchemaHeatmap,
  sankeyDiagram: SchemaSankeyDiagram,
  stackedBarMECE: SchemaStackedBarMECE,
  evolutionaryScorecard: SchemaEvolutionaryScorecard,
  slopeGraph: SchemaSlopeGraph,
  waterfallChart: SchemaWaterfallChart,

  // Cards
  card: SchemaCard,
  npsScoreCard: SchemaNPSScoreCard,
  topCategoriesCards: SchemaTopCategoriesCards,
  kpiCard: SchemaKPICard,

  // Tables
  recommendationsTable: SchemaRecommendationsTable,
  segmentationTable: SchemaSegmentationTable,
  distributionTable: SchemaDistributionTable,
  sentimentTable: SchemaSentimentTable,
  npsDistributionTable: SchemaNPSDistributionTable,
  npsTable: SchemaNPSTable,
  sentimentImpactTable: SchemaSentimentImpactTable,
  positiveCategoriesTable: SchemaPositiveCategoriesTable,
  negativeCategoriesTable: SchemaNegativeCategoriesTable,
  analyticalTable: SchemaAnalyticalTable,

  // Widgets
  questionsList: SchemaQuestionsList,
  filterPills: SchemaFilterPills,
  wordCloud: SchemaWordCloud,
  accordion: SchemaAccordion,
};

/**
 * Renderiza um componente baseado no tipo usando o registry
 *
 * @param {Object} component - Componente schema do JSON
 * @param {Object} data - Dados do contexto
 * @param {Object} props - Props adicionais (subSection, isExport, exportWordCloud, etc.)
 * @returns {React.ReactElement|null} - Componente renderizado ou null
 */
export const renderComponent = (component, data, props = {}) => {
  const { subSection, isExport = false, exportWordCloud = true } = props;
  const Component = componentRegistry[component.type];

  if (!Component) {
    logger.warnCritical(`Unknown component type: ${component.type || "none"}`);
    return null;
  }

  // Props padrão para todos os componentes
  const componentProps = {
    component,
    data,
    ...props,
  };

  // Casos especiais que precisam de props adicionais
  if (component.type === "questionsList") {
    return wrapWithTooltip(
      component,
      isExport,
      <Component
        component={component}
        data={data}
        subSection={subSection}
        isExport={isExport}
        exportWordCloud={exportWordCloud}
      />,
    );
  }

  if (component.type === "accordion") {
    // Accordion precisa de renderSchemaComponent para renderizar componentes aninhados
    if (!props.renderSchemaComponent) {
      logger.error(
        "Accordion: renderSchemaComponent is required but not provided",
      );
      return null;
    }

    return wrapWithTooltip(
      component,
      isExport,
      <Component
        component={component}
        data={data}
        renderSchemaComponent={props.renderSchemaComponent}
      />,
    );
  }

  // Renderização padrão para a maioria dos componentes
  try {
    const rendered = <Component {...componentProps} />;

    // Garante que o resultado é um elemento React válido
    if (rendered === null || rendered === undefined) {
      // Tabelas podem retornar null quando não há dados - comportamento esperado
      return null;
    }

    // CRÍTICO: Verifica se é um objeto vazio (não válido como React child)
    if (typeof rendered === "object" && !React.isValidElement(rendered)) {
      logger.error(
        `Componente ${component.type} retornou objeto inválido (não é elemento React):`,
        rendered,
      );
      return null;
    }

    if (React.isValidElement(rendered)) {
      const wrapped = wrapWithTooltip(component, isExport, rendered);
      // Garante que o wrapped também é válido
      if (
        wrapped === null ||
        wrapped === undefined ||
        React.isValidElement(wrapped)
      ) {
        return wrapped;
      }
      logger.warnCritical(
        `wrapWithTooltip retornou valor inválido para ${component.type}:`,
        wrapped,
      );
      return null;
    }

    logger.warnCritical(
      `Componente ${component.type} retornou elemento inválido:`,
      rendered,
      typeof rendered,
    );
    return null;
  } catch (error) {
    logger.error(`Erro ao renderizar componente ${component.type}:`, error, {
      component,
      dataPath: component.dataPath,
      errorStack: error.stack,
    });
    return null;
  }
};

/**
 * Verifica se um tipo de componente está registrado
 *
 * @param {string} type - Tipo do componente
 * @returns {boolean} - true se o tipo está registrado
 */
export const isComponentTypeRegistered = (type) => {
  return type in componentRegistry;
};

/**
 * Obtém a lista de todos os tipos de componentes registrados
 *
 * @returns {string[]} - Array com todos os tipos registrados
 */
export const getRegisteredComponentTypes = () => {
  return Object.keys(componentRegistry);
};

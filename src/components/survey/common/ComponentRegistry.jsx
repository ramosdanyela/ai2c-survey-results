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

/**
 * Component types that should be captured as PNG images in Word export.
 * Used by renderComponent to wrap these with data-word-export="image".
 */
const IMAGE_EXPORT_TYPES = new Set([
  // Charts
  "barChart", "sentimentDivergentChart", "sentimentThreeColorChart",
  "npsStackedChart", "lineChart", "paretoChart", "scatterPlot",
  "histogram", "quadrantChart", "heatmap", "sankeyDiagram",
  "stackedBarMECE", "evolutionaryScorecard", "slopeGraph", "waterfallChart",
  // Tables
  "recommendationsTable", "segmentationTable", "distributionTable",
  "sentimentTable", "npsDistributionTable", "npsTable",
  "sentimentImpactTable", "positiveCategoriesTable", "negativeCategoriesTable",
  "analyticalTable",
  // Visual cards/widgets
  "npsScoreCard", "topCategoriesCards", "kpiCard", "wordCloud",
]);

/**
 * Registry de componentes por tipo
 * Facilita adicionar novos tipos sem modificar switch/case
 */
export const componentRegistry = {
  // Charts
  barChart: SchemaBarChart,
  sentimentDivergentChart: SchemaSentimentDivergentChart,
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

  // Normalize: config is optional in JSON; renderers expect component.config to be an object
  const normalizedComponent = {
    ...component,
    config: component.config ?? {},
  };

  const Component = componentRegistry[normalizedComponent.type];

  if (!Component) {
    logger.warnCritical(
      `Unknown component type: ${normalizedComponent.type || "none"}`
    );
    return null;
  }

  // Props padrão para todos os componentes
  const componentProps = {
    component: normalizedComponent,
    data,
    ...props,
  };

  // Casos especiais que precisam de props adicionais
  if (normalizedComponent.type === "questionsList") {
    return (
      <Component
        component={normalizedComponent}
        data={data}
        subSection={subSection}
        isExport={isExport}
        exportWordCloud={exportWordCloud}
      />
    );
  }

  if (normalizedComponent.type === "accordion") {
    // Accordion precisa de renderSchemaComponent para renderizar componentes aninhados
    if (!props.renderSchemaComponent) {
      logger.error(
        "Accordion: renderSchemaComponent is required but not provided"
      );
      return null;
    }

    return (
      <Component
        component={component}
        data={data}
        renderSchemaComponent={props.renderSchemaComponent}
      />
    );
  }

  // Card com componentes aninhados: renderiza os filhos e passa como children ao SchemaCard
  if (normalizedComponent.type === "card") {
    const nested = normalizedComponent.components;
    if (Array.isArray(nested) && nested.length > 0) {
      const nestedRendered = nested
        .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
        .map((comp, idx) => {
          const key = `card-nested-${normalizedComponent.index ?? 0}-${
            comp.index ?? idx
          }-${comp.type}-${idx}`;
          const el = renderComponent(comp, data, props);
          return el != null ? (
            <React.Fragment key={key}>{el}</React.Fragment>
          ) : null;
        })
        .filter(Boolean);
      return (
        <Component component={normalizedComponent} data={data} {...props}>
          {nestedRendered}
        </Component>
      );
    }
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
        `Componente ${normalizedComponent.type} retornou objeto inválido (não é elemento React):`,
        rendered
      );
      return null;
    }

    if (React.isValidElement(rendered)) {
      // In export mode, wrap visual components with data-word-export="image".
      // min-w-0 + w-full ensure the wrapper never expands a CSS grid/flex parent
      // beyond the A4 container width, preventing horizontal overflow for all chart types.
      // recommendationsTable in export already outputs N image divs (one per recommendation).
      if (isExport && IMAGE_EXPORT_TYPES.has(normalizedComponent.type)) {
        if (normalizedComponent.type === "recommendationsTable") {
          return rendered;
        }
        // sentimentThreeColorChart: extra vertical padding so Word export doesn't clip top/bottom legends
        if (normalizedComponent.type === "sentimentThreeColorChart") {
          return (
            <div
              data-word-export="image"
              className="min-w-0 w-full py-5"
            >
              {rendered}
            </div>
          );
        }
        return <div data-word-export="image" className="min-w-0 w-full">{rendered}</div>;
      }
      return rendered;
    }

    logger.warnCritical(
      `Componente ${normalizedComponent.type} retornou elemento inválido:`,
      rendered,
      typeof rendered
    );
    return null;
  } catch (error) {
    logger.error(
      `Erro ao renderizar componente ${normalizedComponent.type}:`,
      error,
      {
        component: normalizedComponent,
        dataPath: normalizedComponent.dataPath,
        errorStack: error.stack,
      }
    );
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

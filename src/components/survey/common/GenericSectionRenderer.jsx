import React, { useMemo, useState, useEffect, useCallback } from "react";
import { SubsectionTitle } from "../widgets/SubsectionTitle";
import { Progress } from "@/components/ui/progress";
import { Award, CheckSquare, FileText, TrendingUp, Cloud } from "@/lib/icons";
import {
  COLOR_ORANGE_PRIMARY,
  RGBA_ORANGE_SHADOW_15,
  RGBA_ORANGE_SHADOW_20,
  RGBA_BLACK_SHADOW_30,
  severityColors,
} from "@/lib/colors";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WordCloud } from "../widgets/WordCloud";
import { KPICard } from "../widgets/KPICard";
import { AnalyticalTable } from "../widgets/AnalyticalTable";
import { SlopeGraph } from "../widgets/SlopeGraph";
import { WaterfallChart } from "../widgets/WaterfallChart";
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
} from "./ChartRenderers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getIcon } from "@/lib/icons";
import { useSurveyData } from "@/hooks/useSurveyData";
import {
  RecommendationsTable,
  TasksTable,
  SegmentationTable,
  DistributionTable,
  SentimentTable,
  NPSDistributionTable,
  NPSTable,
  SentimentImpactTable,
  PositiveCategoriesTable,
  NegativeCategoriesTable,
} from "../widgets/Tables";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuestionsList } from "./QuestionsList";
import { enrichComponentWithStyles } from "@/services/styleResolver";
import {
  resolveText,
  resolveDataPath,
  resolveTemplate,
  getQuestionsFromData,
} from "@/services/dataResolver";

// Helper function to get questions from responseDetails
function getQuestionsFromResponseDetails(responseDetails) {
  if (!responseDetails) return [];

  // If questions exists, use it
  if (responseDetails.questions && Array.isArray(responseDetails.questions)) {
    return responseDetails.questions;
  }

  // Otherwise, combine closedQuestions and openQuestions
  const closed = responseDetails.closedQuestions || [];
  const open = responseDetails.openQuestions || [];

  // Combine and sort by index
  return [...closed, ...open].sort((a, b) => (a.index || 0) - (b.index || 0));
}

/** Chaves NPS tratadas em conjunto: mostrar se qualquer uma existir. */
const NPS_ATTR_KEYS = ["npsSummary", "npsDistribution", "nps"];

/**
 * Monta a árvore de componentes da subseção de um atributo a partir dos dados do attr.
 * Nada é pre-setado no JSON: a estrutura é 100% derivada do que existe em attr.
 * Regras: summary → card Sumário; distribution/sentiment → cards Distribuição e Sentimento;
 * npsSummary|npsDistribution|nps → card NPS; satisfactionImpactSummary → card Satisfação (e blocos internos se houver dados).
 */
function buildAttributeComponents(attr) {
  const out = [];
  let idx = 0;

  if (attr.summary) {
    out.push({
      type: "card",
      index: idx++,
      title: "Sumário",
      content: "{{currentAttribute.summary}}",
      styleVariant: "default",
    });
  }

  const hasDist = attr.distribution && attr.distribution.length > 0;
  const hasSent = attr.sentiment && attr.sentiment.length > 0;
  if (hasDist || hasSent) {
    const cards = [];
    if (hasDist) {
      cards.push({
        type: "card",
        index: 0,
        title: "Distribuição dos respondentes",
        styleVariant: "flex-column",
        contentStyleVariant: "with-charts",
        components: [
          {
            type: "barChart",
            index: 0,
            dataPath: "currentAttribute.distribution",
            config: { dataKey: "percentage", yAxisDataKey: "segment", tooltipFormatter: "respondentes" },
          },
          { type: "distributionTable", index: 1, dataPath: "currentAttribute.distribution", attributeName: "{{currentAttribute.name}}" },
        ],
      });
    }
    if (hasSent) {
      cards.push({
        type: "card",
        index: 1,
        title: "Análise de sentimento",
        styleVariant: "flex-column",
        contentStyleVariant: "with-charts",
        components: [
          { type: "sentimentStackedChart", index: 0, dataPath: "currentAttribute.sentiment", config: { yAxisDataKey: "segment" } },
          { type: "sentimentTable", index: 1, dataPath: "currentAttribute.sentiment" },
        ],
      });
    }
    out.push({
      wrapper: "div",
      wrapperProps: {},
      index: idx++,
      components: cards,
    });
  }

  const hasNps = attr.npsSummary || (attr.npsDistribution && attr.npsDistribution.length > 0) || (attr.nps != null);
  if (hasNps) {
    const npsBlocks = [];
    if (attr.npsSummary) {
      npsBlocks.push({
        wrapper: "div",
        index: 0,
        components: [
          { wrapper: "h3", wrapperProps: {}, index: 0, content: "Sumário" },
          { wrapper: "div", wrapperProps: {}, index: 1, content: "{{currentAttribute.npsSummary}}" },
        ],
      });
    }
    const hasNpsTables = (attr.npsDistribution && attr.npsDistribution.length > 0) || (attr.nps != null);
    if (hasNpsTables) {
      npsBlocks.push({
        wrapper: "div",
        index: 1,
        components: [
          { wrapper: "h3", wrapperProps: {}, index: 0, content: "Respostas" },
          {
            wrapper: "div",
            wrapperProps: {},
            index: 1,
            components: [
              {
                wrapper: "div",
                index: 0,
                components: [
                  { wrapper: "h4", wrapperProps: {}, index: 0, content: "Promotores, Neutros, Detratores" },
                  { type: "npsDistributionTable", index: 1, dataPath: "currentAttribute.npsDistribution", attributeName: "{{currentAttribute.name}}" },
                ],
              },
              {
                wrapper: "div",
                index: 1,
                components: [
                  { wrapper: "h4", wrapperProps: {}, index: 0, content: "NPS" },
                  { type: "npsTable", index: 1, dataPath: "currentAttribute.nps", attributeName: "{{currentAttribute.name}}" },
                ],
              },
            ],
          },
        ],
      });
    }
    if (npsBlocks.length > 0) {
      out.push({
        type: "card",
        index: idx++,
        title: "Qual é a probabilidade de você recomendar nossa empresa como um ótimo lugar para trabalhar?",
        styleVariant: "default",
        contentStyleVariant: "with-tables",
        components: npsBlocks,
      });
    }
  }

  if (attr.satisfactionImpactSummary) {
    const satBlocks = [
      {
        wrapper: "div",
        index: 0,
        components: [
          { wrapper: "h3", wrapperProps: {}, index: 0, content: "Sumário" },
          { wrapper: "div", wrapperProps: {}, index: 1, content: "{{currentAttribute.satisfactionImpactSummary}}" },
        ],
      },
    ];
    if (attr.satisfactionImpactSentiment && (Array.isArray(attr.satisfactionImpactSentiment) ? attr.satisfactionImpactSentiment.length > 0 : attr.satisfactionImpactSentiment)) {
      satBlocks.push({
        wrapper: "div",
        index: 1,
        components: [
          { wrapper: "h3", wrapperProps: {}, index: 0, content: "Análise de sentimento" },
          { type: "sentimentThreeColorChart", index: 1, dataPath: "currentAttribute.satisfactionImpactSentiment", config: {} },
          { type: "sentimentImpactTable", index: 2, dataPath: "currentAttribute.satisfactionImpactSentiment" },
        ],
      });
    }
    if (attr.positiveCategories && (Array.isArray(attr.positiveCategories) ? attr.positiveCategories.length > 0 : attr.positiveCategories)) {
      satBlocks.push({
        wrapper: "div",
        index: satBlocks.length,
        components: [
          { wrapper: "h3", wrapperProps: {}, index: 0, content: "Categorias com sentimento positivo - Top 3" },
          { type: "positiveCategoriesTable", index: 1, dataPath: "currentAttribute.positiveCategories" },
        ],
      });
    }
    if (attr.negativeCategories && (Array.isArray(attr.negativeCategories) ? attr.negativeCategories.length > 0 : attr.negativeCategories)) {
      satBlocks.push({
        wrapper: "div",
        index: satBlocks.length,
        components: [
          { wrapper: "h3", wrapperProps: {}, index: 0, content: "Categorias com sentimento negativo - Top 3" },
          { type: "negativeCategoriesTable", index: 1, dataPath: "currentAttribute.negativeCategories" },
        ],
      });
    }
    out.push({
      type: "card",
      index: idx++,
      title: "Quais são os principais fatores que impactam sua satisfação no trabalho?",
      styleVariant: "default",
      contentStyleVariant: "with-tables",
      components: satBlocks,
    });
  }

  return out;
}

/**
 * Enriquece schema do JSON com estilos do código
 * Aplica variantes de estilo baseadas em styleVariant do JSON
 */
function enrichSchemaWithStyles(schema, data, sectionData) {
  const processComponent = (component) => {
    // Enriquece componente com estilos resolvidos
    let enriched = enrichComponentWithStyles(component);

    // Processa componentes filhos recursivamente
    if (enriched.components) {
      enriched.components = enriched.components.map(processComponent);
    }

    return enriched;
  };

  // Processa subsections
  if (schema.subsections) {
    schema.subsections = schema.subsections.map((subsection) => ({
      ...subsection,
      components: subsection.components?.map(processComponent) || [],
    }));
  }

  // Processa componentes diretos
  if (schema.components) {
    schema.components = schema.components.map(processComponent);
  }

  return schema;
}

/**
 * Render a card component based on schema
 * Usa styleVariant do JSON para aplicar estilos do código
 */
function SchemaCard({ component, data, children }) {
  // Debug: verify uiTexts is available and has attributeDeepDive
  if (
    component.title &&
    component.title.includes("uiTexts.attributeDeepDive")
  ) {
    console.log("SchemaCard DEBUG:", {
      title: component.title,
      hasData: !!data,
      hasUiTexts: !!data?.uiTexts,
      hasAttributeDeepDive: !!data?.uiTexts?.attributeDeepDive,
      attributeDeepDiveKeys: data?.uiTexts?.attributeDeepDive
        ? Object.keys(data.uiTexts.attributeDeepDive)
        : [],
      uiTextsKeys: data?.uiTexts ? Object.keys(data.uiTexts) : [],
      dataKeys: data ? Object.keys(data) : [],
    });
  }

  const title = resolveTemplate(component.title || "", data);
  const content = resolveTemplate(component.content || "", data);

  // Debug: log if title was not resolved
  if (
    component.title &&
    component.title.includes("uiTexts") &&
    title === component.title
  ) {
    console.warn("SchemaCard: Title not resolved!", {
      original: component.title,
      resolved: title,
      hasUiTexts: !!data?.uiTexts,
    });
  }

  // Usa className do componente enriquecido (resolvido de styleVariant)
  const styleClass = component.className || "card-elevated";

  // Build style object - adiciona cor da borda para variantes highlight e border-left
  const styleObj = {};
  if (
    component.styleVariant === "highlight" ||
    component.styleVariant === "border-left"
  ) {
    styleObj.borderLeftColor = COLOR_ORANGE_PRIMARY;
  }

  const useDescription = component.useDescription === true;
  const ContentWrapper = useDescription ? CardDescription : "div";
  const contentClassName = useDescription
    ? "text-base leading-relaxed space-y-3"
    : "text-muted-foreground font-normal leading-relaxed space-y-3";

  // If children are provided, render them instead of content
  const hasChildren = children && React.Children.count(children) > 0;
  const hasContent = content && content.trim() !== "";

  // Usa className do componente enriquecido ou fallback
  const titleClassName =
    component.titleClassName || "text-xl font-bold text-card-foreground";
  const finalContentClassName = component.contentClassName || "";

  return (
    <Card
      className={styleClass}
      style={Object.keys(styleObj).length > 0 ? styleObj : undefined}
    >
      {title && (
        <CardHeader>
          <CardTitle className={titleClassName}>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={finalContentClassName}>
        {/* Render content first if it exists */}
        {hasContent && (
          <ContentWrapper className={contentClassName}>
            {content.split("\n").map((line, index) => (
              <p key={index} className={line.trim() ? "" : "h-3"}>
                {line}
              </p>
            ))}
          </ContentWrapper>
        )}
        {/* Then render children if they exist */}
        {hasChildren && children}
      </CardContent>
    </Card>
  );
}

/**
 * Render a recommendations table component based on schema
 * This component needs state management for expand/collapse
 */
function SchemaRecommendationsTable({ component, data }) {
  const recommendations = resolveDataPath(data, component.dataPath);
  const severityLabels =
    component.severityLabels ??
    resolveDataPath(data, component.severityLabelsPath || "uiTexts.severityLabels");

  if (!recommendations || !Array.isArray(recommendations)) {
    console.warn(
      `RecommendationsTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  const [expandedRecs, setExpandedRecs] = useState(new Set());
  const [checkedTasks, setCheckedTasks] = useState({});

  const toggleRecExpansion = (recId) => {
    setExpandedRecs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recId)) {
        newSet.delete(recId);
      } else {
        newSet.add(recId);
      }
      return newSet;
    });
  };

  const toggleTask = (recId, taskIndex) => {
    const key = `rec-${recId}-task-${taskIndex}`;
    setCheckedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getRecTasks = (recId) => {
    const rec = recommendations.find((r) => r.id === recId);
    return rec?.tasks || [];
  };

  return (
    <RecommendationsTable
      recommendations={recommendations}
      severityLabels={severityLabels || {}}
      severityColors={severityColors}
      expandedRecs={expandedRecs}
      onToggleRec={toggleRecExpansion}
      getRecTasks={getRecTasks}
      renderTasksTable={(recId, tasks) => (
        <TasksTable
          tasks={tasks}
          recId={recId}
          checkedTasks={checkedTasks}
          onToggleTask={toggleTask}
        />
      )}
    />
  );
}

/**
 * Render a segmentation table component based on schema
 */
function SchemaSegmentationTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(
      `SegmentationTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return <SegmentationTable data={tableData} />;
}

/**
 * Render a distribution table component based on schema
 */
function SchemaDistributionTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);
  const attributeName = resolveTemplate(component.attributeName || "", data);

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(
      `DistributionTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return <DistributionTable data={tableData} attributeName={attributeName} />;
}

/**
 * Render a sentiment table component based on schema
 */
function SchemaSentimentTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(
      `SentimentTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return <SentimentTable data={tableData} />;
}

/**
 * Render an NPS distribution table component based on schema
 */
function SchemaNPSDistributionTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);
  const attributeName = resolveTemplate(component.attributeName || "", data);

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(
      `NPSDistributionTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return (
    <NPSDistributionTable data={tableData} attributeName={attributeName} />
  );
}

/**
 * Render an NPS table component based on schema
 */
function SchemaNPSTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);
  const attributeName = resolveTemplate(component.attributeName || "", data);

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(`NPSTable: Data not found at path "${component.dataPath}"`);
    return null;
  }

  return <NPSTable data={tableData} attributeName={attributeName} />;
}

/**
 * Render a sentiment impact table component based on schema
 */
function SchemaSentimentImpactTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(
      `SentimentImpactTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return <SentimentImpactTable data={tableData} />;
}

/**
 * Render a positive categories table component based on schema
 */
function SchemaPositiveCategoriesTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(
      `PositiveCategoriesTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return <PositiveCategoriesTable data={tableData} />;
}

/**
 * Render a negative categories table component based on schema
 */
function SchemaNegativeCategoriesTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(
      `NegativeCategoriesTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return <NegativeCategoriesTable data={tableData} />;
}

/**
 * Render an NPS score card component based on schema
 * All styling is hardcoded - no config needed
 */
function SchemaNPSScoreCard({ component, data }) {
  const surveyInfo = resolveDataPath(data, component.dataPath || "surveyInfo");
  const uiTexts = resolveDataPath(data, "uiTexts");

  if (!surveyInfo || !uiTexts) {
    console.warn(
      `NPSScoreCard: Data not found at path "${
        component.dataPath || "surveyInfo"
      }"`
    );
    return null;
  }

  return (
    <div className="mb-6 flex justify-center">
      <div
        className="p-4 rounded-2xl highlight-container-light border-0 w-full max-w-md"
        style={{
          boxShadow: `0 4px 16px ${RGBA_ORANGE_SHADOW_15}`,
        }}
      >
        <div className="text-center mb-4">
          <div className="text-5xl font-bold text-foreground mb-2">
            {surveyInfo.nps}
          </div>
          <div className="text-base font-semibold text-foreground mb-3">
            {uiTexts.responseDetails?.npsScore || "NPS Score"}
          </div>
          {/* Simple bar with score for quick visualization */}
          <Progress value={(surveyInfo.nps + 100) / 2} className="h-3 mb-2" />
          <div className="inline-block px-3 py-1 rounded-full highlight-container text-base font-semibold">
            {surveyInfo.npsCategory}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Render top categories cards component based on schema
 * All styling is hardcoded - no config needed
 */
function SchemaTopCategoriesCards({ component, data }) {
  const categoriesData = resolveDataPath(data, component.dataPath);
  const uiTexts = resolveDataPath(data, "uiTexts");

  if (!categoriesData || !Array.isArray(categoriesData)) {
    console.warn(
      `TopCategoriesCards: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  const title = resolveTemplate(
    component.config?.title || "{{uiTexts.responseDetails.top3Categories}}",
    data
  );

  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <Award className="w-4 h-4" style={{ color: COLOR_ORANGE_PRIMARY }} />
        {title ||
          uiTexts?.responseDetails?.top3Categories ||
          "Top 3 Categories"}
      </h4>
      <div className="grid md:grid-cols-3 gap-4">
        {categoriesData.map((cat) => {
          // Separate topics by sentiment
          const positiveTopics = (cat.topics || [])
            .map((topicItem) => {
              const topic =
                typeof topicItem === "string" ? topicItem : topicItem.topic;
              const sentiment =
                typeof topicItem === "string" ? null : topicItem.sentiment;
              return { topic, sentiment };
            })
            .filter((item) => item.sentiment === "positive");

          const negativeTopics = (cat.topics || [])
            .map((topicItem) => {
              const topic =
                typeof topicItem === "string" ? topicItem : topicItem.topic;
              const sentiment =
                typeof topicItem === "string" ? null : topicItem.sentiment;
              return { topic, sentiment };
            })
            .filter((item) => item.sentiment === "negative");

          return (
            <div
              key={cat.rank}
              className="p-4 rounded-lg bg-muted/10 border-0 transition-all duration-300"
              style={{
                boxShadow: `0 4px 16px ${RGBA_BLACK_SHADOW_30}`,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = `0 8px 32px ${RGBA_ORANGE_SHADOW_20}`)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.boxShadow = `0 4px 16px ${RGBA_BLACK_SHADOW_30}`)
              }
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">
                  {cat.rank}
                </span>
                <span className="font-bold text-sm">{cat.category}</span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {cat.mentions}{" "}
                {uiTexts?.responseDetails?.mentions || "mentions"} (
                {cat.percentage}%)
              </div>
              {cat.topics && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Positive Column */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                      {uiTexts?.responseDetails?.positive || "Positive"}
                    </div>
                    {positiveTopics.length > 0 ? (
                      positiveTopics.map((item, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-start gap-1.5"
                        >
                          <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                            •
                          </span>
                          <span className="text-foreground">{item.topic}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        {uiTexts?.responseDetails?.noPositiveTopics ||
                          "No positive topics"}
                      </div>
                    )}
                  </div>

                  {/* Negative Column */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                      {uiTexts?.responseDetails?.negative || "Negative"}
                    </div>
                    {negativeTopics.length > 0 ? (
                      negativeTopics.map((item, index) => (
                        <div
                          key={index}
                          className="text-sm flex items-start gap-1.5"
                        >
                          <span className="text-red-600 dark:text-red-400 mt-0.5">
                            •
                          </span>
                          <span className="text-foreground">{item.topic}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground italic">
                        {uiTexts?.responseDetails?.noNegativeTopics ||
                          "No negative topics"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Render filter pills component based on schema
 * Renders question type filter badges and word cloud toggle
 * Shares state with QuestionsList via data context
 * All styling is hardcoded - no config needed
 */
function SchemaFilterPills({ component, data }) {
  const [questionFilter, setQuestionFilter] = useState("all");
  const [showWordCloud, setShowWordCloud] = useState(true);

  // Get texts from sectionData.uiTexts (section-specific) or root uiTexts (global)
  // Priority: sectionData.uiTexts > root uiTexts.responseDetails
  const sectionUiTexts = data?.sectionData?.uiTexts || {};
  const rootUiTexts = resolveDataPath(data, "uiTexts") || {};

  // For responses section, texts are directly in sectionData.uiTexts (all, openField, etc.)
  // But also check root uiTexts.responseDetails for backward compatibility
  const uiTexts = {
    ...rootUiTexts,
    responseDetails: {
      ...rootUiTexts?.responseDetails,
      ...sectionUiTexts, // sectionData.uiTexts has the texts directly (all, openField, nps, wordCloud, etc.)
    },
  };

  const config = component.config || {};
  const showWordCloudToggle = config.showWordCloudToggle !== false;

  // Create wrapper functions that update both state and data._filterPillsState
  const handleQuestionFilterChange = useCallback(
    (value) => {
      setQuestionFilter(value);
      if (data && typeof data === "object" && !Array.isArray(data)) {
        if (data._filterPillsState) {
          data._filterPillsState.questionFilter = value;
        }
      }
    },
    [data]
  );

  const handleShowWordCloudChange = useCallback(
    (value) => {
      setShowWordCloud(value);
      if (data && typeof data === "object" && !Array.isArray(data)) {
        if (data._filterPillsState) {
          data._filterPillsState.showWordCloud = value;
        }
      }
    },
    [data]
  );

  // Initialize and update data._filterPillsState whenever state changes
  useEffect(() => {
    if (data && typeof data === "object" && !Array.isArray(data)) {
      data._filterPillsState = {
        questionFilter,
        setQuestionFilter: handleQuestionFilterChange,
        showWordCloud,
        setShowWordCloud: handleShowWordCloudChange,
      };
    }
  }, [
    questionFilter,
    showWordCloud,
    handleQuestionFilterChange,
    handleShowWordCloudChange,
    data,
  ]);

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6">
      <Badge
        variant={questionFilter === "all" ? "default" : "outline"}
        className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full ${
          questionFilter === "all"
            ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
            : ""
        }`}
        onClick={() => setQuestionFilter("all")}
      >
        {sectionUiTexts?.all || rootUiTexts?.responseDetails?.all || "Todos"}
      </Badge>
      <Badge
        variant={questionFilter === "open" ? "default" : "outline"}
        className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
          questionFilter === "open"
            ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
            : ""
        }`}
        onClick={() => setQuestionFilter("open")}
      >
        <FileText className="w-3 h-3" />
        {sectionUiTexts?.openField ||
          rootUiTexts?.responseDetails?.openField ||
          "Campo Aberto"}
      </Badge>
      <Badge
        variant={questionFilter === "closed" ? "default" : "outline"}
        className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
          questionFilter === "closed"
            ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
            : ""
        }`}
        onClick={() => setQuestionFilter("closed")}
      >
        <CheckSquare className="w-3 h-3" />
        {sectionUiTexts?.multipleChoice ||
          rootUiTexts?.responseDetails?.multipleChoice ||
          "Múltipla Escolha"}
      </Badge>
      <Badge
        variant={questionFilter === "nps" ? "default" : "outline"}
        className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
          questionFilter === "nps"
            ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
            : ""
        }`}
        onClick={() => setQuestionFilter("nps")}
      >
        <TrendingUp className="w-3 h-3" />
        {sectionUiTexts?.nps || rootUiTexts?.responseDetails?.nps || "NPS"}
      </Badge>
      {/* Word Cloud Toggle */}
      {showWordCloudToggle && (
        <div className="flex items-center gap-2 ml-auto">
          <Label
            htmlFor="word-cloud-toggle"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            {sectionUiTexts?.wordCloud ||
              rootUiTexts?.responseDetails?.wordCloud ||
              "Nuvem de Palavras"}
          </Label>
          <Switch
            id="word-cloud-toggle"
            checked={showWordCloud}
            onCheckedChange={setShowWordCloud}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Render word cloud component based on schema
 * All styling is hardcoded - only data path and title from config
 */
function SchemaWordCloud({ component, data }) {
  const wordCloudData = resolveDataPath(data, component.dataPath);
  const uiTexts = resolveDataPath(data, "uiTexts");

  if (!wordCloudData || !Array.isArray(wordCloudData)) {
    console.warn(`WordCloud: Data not found at path "${component.dataPath}"`);
    return null;
  }

  const config = component.config || {};
  const title = resolveTemplate(
    config.title || "{{uiTexts.responseDetails.wordCloud}}",
    data
  );

  return (
    <div>
      {title && (
        <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Cloud className="w-4 h-4" style={{ color: COLOR_ORANGE_PRIMARY }} />
          {title}
        </h4>
      )}
      <div className="flex justify-center items-center p-6 bg-muted/30 rounded-lg min-h-[200px]">
        <WordCloud
            words={wordCloudData}
            maxWords={config.maxWords || 15}
            config={{
              // Permite sobrescrever configurações do JSON, com defaults estilo imagem
              colorScheme: config.colorScheme || "image-style",
              minFontSize: config.minFontSize || 14,
              maxFontSize: config.maxFontSize || 56,
              enableShadows:
                config.enableShadows !== undefined
                  ? config.enableShadows
                  : false,
              fontWeight: config.fontWeight || "medium",
              minOpacity: config.minOpacity || 0.8,
              maxOpacity: config.maxOpacity || 1.0,
              enableHover:
                config.enableHover !== undefined ? config.enableHover : true,
              enableAnimations:
                config.enableAnimations !== undefined
                  ? config.enableAnimations
                  : true,
              minRotation:
                config.minRotation !== undefined ? config.minRotation : -20,
              maxRotation:
                config.maxRotation !== undefined ? config.maxRotation : 20,
              enableRotation:
                config.enableRotation !== undefined
                  ? config.enableRotation
                  : false, // Horizontal por padrão
              spacing: config.spacing !== undefined ? config.spacing : 8,
            }}
          />
      </div>
    </div>
  );
}

/**
 * Render KPI Card component based on schema
 */
function SchemaKPICard({ component, data }) {
  const kpiData = resolveDataPath(data, component.dataPath);
  const config = component.config || {};

  if (!kpiData) {
    console.warn(`KPICard: Data not found at path "${component.dataPath}"`);
    return null;
  }

  // Support both object and direct value
  const value =
    typeof kpiData === "object" ? kpiData[config.valueKey || "value"] : kpiData;
  const label =
    typeof kpiData === "object"
      ? kpiData[config.labelKey || "label"]
      : config.label || "KPI";
  const delta =
    typeof kpiData === "object"
      ? kpiData[config.deltaKey || "delta"]
      : config.delta;
  const trend =
    typeof kpiData === "object"
      ? kpiData[config.trendKey || "trend"]
      : config.trend;
  const target =
    typeof kpiData === "object"
      ? kpiData[config.targetKey || "target"]
      : config.target;

  return (
    <KPICard
      value={value}
      label={label}
      delta={delta}
      trend={trend}
      target={target}
      format={config.format}
      className={config.className}
    />
  );
}

/**
 * Render Analytical Table component based on schema
 */
function SchemaAnalyticalTable({ component, data }) {
  const tableData = resolveDataPath(data, component.dataPath);
  const config = component.config || {};

  if (!tableData || !Array.isArray(tableData)) {
    console.warn(
      `AnalyticalTable: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return (
    <AnalyticalTable
      data={tableData}
      columns={config.columns || []}
      showRanking={config.showRanking !== false}
      defaultSort={config.defaultSort}
      rankingKey={config.rankingKey}
    />
  );
}

/**
 * Render Slope Graph component based on schema
 */
function SchemaSlopeGraph({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    console.warn(`SlopeGraph: Data not found at path "${component.dataPath}"`);
    return null;
  }

  return (
    <SlopeGraph
      data={chartData}
      categoryKey={config.categoryKey || "category"}
      beforeKey={config.beforeKey || "before"}
      afterKey={config.afterKey || "after"}
      height={config.height || 400}
      margin={config.margin}
      showLabels={config.showLabels !== false}
      showDelta={config.showDelta !== false}
      showGrid={config.showGrid !== false}
    />
  );
}

/**
 * Render Waterfall Chart component based on schema
 */
function SchemaWaterfallChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath);
  const config = component.config || {};

  if (!chartData || !Array.isArray(chartData)) {
    console.warn(
      `WaterfallChart: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  return (
    <WaterfallChart
      data={chartData}
      labelKey={config.labelKey || "label"}
      valueKey={config.valueKey || "value"}
      typeKey={config.typeKey || "type"}
      height={config.height || 400}
      margin={config.margin}
      showLabels={config.showLabels !== false}
      showGrid={config.showGrid !== false}
    />
  );
}

/**
 * Render accordion component based on schema
 */
function SchemaAccordion({ component, data }) {
  const [openValue, setOpenValue] = useState(
    component.defaultValue || undefined
  );

  const config = component.config || {};
  const accordionValue =
    component.value !== undefined ? component.value : openValue;
  const onValueChange = component.onValueChange || setOpenValue;

  // Support items array or single item structure
  const items =
    component.items ||
    (component.value ? [{ value: component.value, ...component }] : []);

  if (items.length === 0 && !component.components) {
    console.warn("Accordion: No items or components provided");
    return null;
  }

  // If no items but has components, create a single item
  const accordionItems =
    items.length > 0 ? items : [{ value: "default", ...component }];

  return (
    <Accordion
      type={config.type || "single"}
      collapsible={config.collapsible !== false}
      value={accordionValue}
      onValueChange={onValueChange}
      className={config.className || "card-elevated px-0 overflow-hidden"}
    >
      {accordionItems.map((item, index) => {
        const itemValue = item.value || `${index}`;

        // Get components for this item (from item.components or component.components)
        const itemComponents = item.components || component.components || [];

        const nestedComponents = itemComponents
          .sort((a, b) => {
            const indexA = a.index !== undefined ? a.index : 999;
            const indexB = b.index !== undefined ? b.index : 999;
            return indexA - indexB;
          })
          .map((comp, idx) => (
            <SchemaComponent
              key={`accordion-content-${
                comp.index !== undefined ? comp.index : idx
              }`}
              component={comp}
              data={data}
            />
          ));

        const trigger = resolveTemplate(
          item.trigger || item.title || `Item ${index + 1}`,
          data
        );

        return (
          <AccordionItem
            key={itemValue}
            value={itemValue}
            className={item.className || config.itemClassName || "border-0"}
          >
            <AccordionTrigger
              className={
                item.triggerClassName ||
                config.triggerClassName ||
                "px-6 py-4 hover:no-underline hover:bg-muted/30"
              }
            >
              {trigger}
            </AccordionTrigger>
            <AccordionContent
              className={
                item.contentClassName || config.contentClassName || "px-6 pb-6"
              }
            >
              {nestedComponents.length > 0
                ? nestedComponents
                : item.content || null}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

/**
 * Render a questions list component based on schema
 * This component handles all the complex logic for rendering questions with filters, accordions, etc.
 */
function SchemaQuestionsList({
  component,
  data,
  subSection,
  isExport = false,
  exportWordCloud = true,
}) {
  // Extract questionId from subSection (e.g., "responses-1" -> 1)
  let questionId = null;
  if (subSection && subSection.startsWith("responses-")) {
    const match = subSection.match(/responses-(\d+)/);
    if (match) {
      questionId = parseInt(match[1], 10);
    }
  }

  // Also check component config
  if (!questionId && component.questionId) {
    questionId = component.questionId;
  }

  // Debug log
  if (isExport) {
    console.log("🔍 DEBUG SchemaQuestionsList:", {
      subSection,
      questionId,
      isExport,
      exportWordCloud,
      hasExportMode: !!data?._exportMode,
    });
  }

  // Use sectionData if dataPath is not specified or is legacy
  const dataPath =
    component.dataPath || (data.sectionData ? "sectionData" : null);
  const config = component.config || {};

  // Get filter state from filterPills if available, or use export state
  // Read directly from data._filterPillsState to get the latest values
  let filterState = null;
  if (isExport) {
    // In export mode, create filter state with wordCloud control
    filterState = {
      questionFilter: questionId ? null : "all", // If specific question, don't filter by type
      setQuestionFilter: () => {},
      showWordCloud: exportWordCloud,
      setShowWordCloud: () => {},
    };
  } else {
    // Use filter state from filterPills, reading the current values directly
    // IMPORTANT: Always read from data._filterPillsState directly to get latest values
    const pillsState = data?._filterPillsState;
    if (pillsState) {
      // Read current values directly from _filterPillsState (not from pillsState variable)
      // This ensures we get the latest values even if the object was mutated
      filterState = {
        questionFilter: data._filterPillsState.questionFilter || "all", // Default to "all" if null
        setQuestionFilter: data._filterPillsState.setQuestionFilter,
        showWordCloud: data._filterPillsState.showWordCloud ?? true, // Default to true if undefined
        setShowWordCloud: data._filterPillsState.setShowWordCloud,
      };
    } else {
      // If filterPills hasn't been rendered yet, create a default state
      // This ensures filters work even if filterPills component isn't in the schema
      // Create handler functions first
      const handleQuestionFilterChange = (value) => {
        // Initialize _filterPillsState if it doesn't exist
        if (data && typeof data === "object" && !Array.isArray(data)) {
          if (!data._filterPillsState) {
            data._filterPillsState = {
              questionFilter: value,
              setQuestionFilter: handleQuestionFilterChange,
              showWordCloud: true,
              setShowWordCloud: handleShowWordCloudChange,
            };
          } else {
            data._filterPillsState.questionFilter = value;
            if (data._filterPillsState.setQuestionFilter) {
              data._filterPillsState.setQuestionFilter(value);
            }
          }
        }
      };

      const handleShowWordCloudChange = (value) => {
        // Initialize _filterPillsState if it doesn't exist
        if (data && typeof data === "object" && !Array.isArray(data)) {
          if (!data._filterPillsState) {
            data._filterPillsState = {
              questionFilter: "all",
              setQuestionFilter: handleQuestionFilterChange,
              showWordCloud: value,
              setShowWordCloud: handleShowWordCloudChange,
            };
          } else {
            data._filterPillsState.showWordCloud = value;
            if (data._filterPillsState.setShowWordCloud) {
              data._filterPillsState.setShowWordCloud(value);
            }
          }
        }
      };

      filterState = {
        questionFilter: "all",
        setQuestionFilter: handleQuestionFilterChange,
        showWordCloud: true,
        setShowWordCloud: handleShowWordCloudChange,
      };
    }
  }

  return (
    <QuestionsList
      questionId={questionId}
      dataPath={dataPath}
      hideFilterPills={config.hideFilterPills || isExport} // Hide pills in export mode
      externalFilterState={filterState}
      data={data} // Pass enhancedData (with sectionData injected)
    />
  );
}

/**
 * Extrai currentAttribute.KEY do componente (content {{}} ou dataPath) ou de descendentes.
 * Usado para decidir visibilidade em attributes; a lógica fica no código, não no JSON.
 */
function getCurrentAttributeKey(comp) {
  if (!comp) return null;
  if (comp.content && typeof comp.content === "string") {
    const m = comp.content.match(/\{\{currentAttribute\.([a-zA-Z]+)\}\}/);
    if (m) return m[1];
  }
  if (comp.dataPath && typeof comp.dataPath === "string" && comp.dataPath.startsWith("currentAttribute.")) {
    const key = comp.dataPath.replace("currentAttribute.", "").split(".")[0];
    if (key) return key;
  }
  if (comp.components && Array.isArray(comp.components)) {
    for (const c of comp.components) {
      const k = getCurrentAttributeKey(c);
      if (k) return k;
    }
  }
  return null;
}

/**
 * Decide se o componente deve ser exibido. Lógica no código (não em condition no JSON).
 * - attributes: exibe se currentAttribute.KEY (inferido de dataPath/content) for truthy.
 * - responses: por tipo (npsScoreCard, npsStackedChart, barChart, etc.) e dados (question.data, sentimentData, topCategories, wordCloud, showWordCloud).
 */
function shouldShowComponent(component, data) {
  // attributes: visibilidade por currentAttribute.KEY (grupo NPS: qualquer uma)
  if (data?.currentAttribute) {
    const key = getCurrentAttributeKey(component);
    if (key) {
      if (NPS_ATTR_KEYS.includes(key)) {
        return !!(
          data.currentAttribute.npsSummary ||
          (data.currentAttribute.npsDistribution && (Array.isArray(data.currentAttribute.npsDistribution) ? data.currentAttribute.npsDistribution.length > 0 : true)) ||
          data.currentAttribute.nps != null
        );
      }
      const v = resolveDataPath(data, `currentAttribute.${key}`);
      return v != null && v !== false && v !== "";
    }
    return true;
  }
  // responses: visibilidade por tipo de componente e dados da questão
  if (data?.question) {
    const q = data.question;
    switch (component.type) {
      case "npsScoreCard":
        return true;
      case "npsStackedChart":
        return !!(q.data);
      case "barChart":
        return q.id !== 1 && !!q.data;
      case "sentimentStackedChart":
        return !!q.sentimentData;
      case "topCategoriesCards":
        return !!q.topCategories;
      case "wordCloud":
        return !!(q.wordCloud && data.showWordCloud !== false);
      default:
        return true;
    }
  }
  return true;
}

/**
 * Render a component based on its type
 */
function SchemaComponent({
  component,
  data,
  subSection,
  isExport = false,
  exportWordCloud = true,
}) {
  if (!shouldShowComponent(component, data)) {
    return null;
  }

  /**
   * Get hardcoded className for wrapper based on context
   */
  function getWrapperClassName(component, data) {
    const wrapper = component.wrapper || "div";
    const wrapperProps = component.wrapperProps || {};

    // Use className from wrapperProps if provided, otherwise use wrapper type mapping
    if (wrapperProps.className) {
      return wrapperProps.className;
    }

    // div wrappers - use layout property from JSON instead of checking component types
    if (wrapper === "div") {
      // Use layout property from component config
      const componentLayout = component.layout || component.gridType;
      if (componentLayout) {
        const layoutMap = {
          "two-cards": "grid gap-6 md:grid-cols-2",
          "chart-pair": "grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch",
          "nps-tables": "space-y-6",
          "text-content": "text-muted-foreground leading-relaxed space-y-3",
        };
        return layoutMap[componentLayout] || "";
      }

      // Fallback: check component types only if layout not specified (backward compatibility)
      if (
        component.components &&
        component.components.length === 2 &&
        component.components.every((c) => c.type === "card")
      ) {
        return "grid gap-6 md:grid-cols-2";
      }

      if (
        component.components &&
        component.components.length === 2 &&
        component.components.some((c) => c.type === "barChart") &&
        component.components.some((c) => c.type === "sentimentStackedChart")
      ) {
        return "grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch";
      }

      if (
        component.components &&
        (component.components.some((c) => c.type === "npsDistributionTable") ||
          component.components.some((c) => c.type === "npsTable"))
      ) {
        return "space-y-6";
      }

      // Use layout property from component config instead of checking component structure
      const wrapperLayout = component.layout;
      if (wrapperLayout) {
        const wrapperLayoutMap = {
          "legend-container": "flex justify-center mb-4",
          "legend-items": "flex gap-4 text-xs",
          "legend-item": "flex items-center gap-1",
          "color-indicator": "w-3 h-3 rounded",
        };
        const layoutClassName = wrapperLayoutMap[wrapperLayout];
        if (layoutClassName) {
          return layoutClassName;
        }
      }

      // Fallback: check component structure only if layout not specified (backward compatibility)
      if (component.components && component.components.length === 1) {
        const firstChild = component.components[0];
        if (
          firstChild.wrapper === "div" &&
          firstChild.components &&
          firstChild.components.length === 3 &&
          firstChild.components.every(
            (c) =>
              c.wrapper === "div" && c.components && c.components.length === 2
          )
        ) {
          return "flex justify-center mb-4";
        }
      }

      if (
        component.components &&
        component.components.length === 3 &&
        component.components.every(
          (c) =>
            c.wrapper === "div" &&
            c.components &&
            c.components.length === 2 &&
            c.components[0].wrapper === "div" &&
            c.components[1].wrapper === "span"
        )
      ) {
        return "flex gap-4 text-xs";
      }

      if (
        component.components &&
        component.components.length === 2 &&
        component.components[0].wrapper === "div" &&
        component.components[0].components &&
        component.components[0].components.length === 0 &&
        component.components[1].wrapper === "span"
      ) {
        return "flex items-center gap-1";
      }

      if (
        component.components &&
        component.components.length === 0 &&
        wrapper === "div"
      ) {
        const parentHasSentimentContent =
          data?.currentAttribute?.satisfactionImpactSentiment;
        if (parentHasSentimentContent) {
          return "w-3 h-3 rounded";
        }
      }

      // Use layout or className from component config
      if (component.layout === "after-chart" || component.className) {
        return component.className || "mt-4";
      }

      // Fallback: check component type only if layout not specified (backward compatibility)
      if (
        component.components &&
        component.components.length === 1 &&
        component.components[0].type === "sentimentImpactTable"
      ) {
        return "mt-4";
      }
    }

    // Map wrapper types to default classNames (based on type from JSON)
    const wrapperTypeMap = {
      h3: "text-lg font-bold text-foreground mb-3",
      h4: "text-base font-semibold text-foreground mb-3",
      span: "",
      div: "",
    };

    // Get base className from wrapper type
    let baseClassName = wrapperTypeMap[wrapper] || "";

    // Special case for h3 with "Respostas" content (can be overridden by className in wrapperProps)
    if (wrapper === "h3" && !wrapperProps.className) {
      const content = resolveTemplate(component.content || "", data);
      if (
        content &&
        (content.includes("Respostas") || content.includes("responses"))
      ) {
        baseClassName = "text-lg font-bold text-foreground mb-4";
      }
    }

    return baseClassName;
  }

  /**
   * Get hardcoded style for wrapper based on context
   */
  function getWrapperStyle(component, data) {
    const wrapper = component.wrapper || "div";

    // Color indicator wrapper for sentiment legend
    // Detected by: empty div wrapper with no children, inside sentiment impact section
    // Structure: parent div has 2 children: empty div (this) + span with label
    if (
      wrapper === "div" &&
      component.components &&
      component.components.length === 0
    ) {
      // Check if we're in a sentiment impact context
      const hasSentimentContext =
        data?.currentAttribute?.satisfactionImpactSentiment;

      if (hasSentimentContext) {
        // The structure is: wrapper div with 2 children
        // - index 0: empty div (this component) - color indicator
        // - index 1: span with label text
        // We need to check if there's a sibling span to determine the color
        // Since we don't have direct access to siblings, we use index-based heuristics
        // In the JSON structure, the order is: Negative (index 0), Neutral (index 1), Positive (index 2)
        // But we're at the component level, so we check the parent's structure

        // Actually, we can check if this is the first child (index 0) of a parent with 2 children
        // where the second child is a span. The span content tells us which color.
        // For now, use index-based approach since the structure is consistent:
        // - First legend item (index 0 in parent): Negative
        // - Second legend item (index 1 in parent): Neutral
        // - Third legend item (index 2 in parent): Positive

        // We'll determine by checking if we're in a legend container structure
        // The parent should have 3 children, each with 2 children (div + span)
        // Since we can't easily access parent, we'll use a simpler approach:
        // Check the data context to see if we have sentiment data, then use index

        // Actually, the best approach is to check the component's index relative to its siblings
        // But since we don't have that info easily, we'll use a pattern match:
        // If this empty div is part of a structure with a span sibling, check the span content
        // For now, we'll use index 0/1/2 pattern which matches the JSON structure

        // Use sentimentType or color from component config instead of index
        const sentimentType = component.sentimentType || component.color;
        if (sentimentType) {
          const colorMap = {
            negative: "hsl(var(--chart-negative))",
            neutral: "hsl(var(--chart-neutral))",
            positive: "hsl(var(--chart-positive))",
          };
          const backgroundColor = colorMap[sentimentType] || component.color;
          if (backgroundColor) {
            return { backgroundColor };
          }
        }

        // Fallback: use index only if sentimentType/color not specified (backward compatibility)
        if (component.index === 0) {
          return { backgroundColor: "hsl(var(--chart-negative))" };
        }
        if (component.index === 1) {
          return { backgroundColor: "hsl(var(--chart-neutral))" };
        }
        if (component.index === 2) {
          return { backgroundColor: "hsl(var(--chart-positive))" };
        }
      }
    }

    return null;
  }

  // Handle wrapper components (components that wrap other components or content)
  if (component.wrapper) {
    const ComponentWrapper = component.wrapper || "div";
    const wrapperProps = component.wrapperProps || {};

    // Get hardcoded className
    const wrapperClassName = getWrapperClassName(component, data);

    // Get hardcoded style based on context
    const wrapperStyle = getWrapperStyle(component, data);

    // Merge style if provided
    const finalWrapperProps = {
      ...wrapperProps,
      className: wrapperClassName || "",
    };

    // Apply hardcoded style if determined, otherwise use wrapperProps.style if provided
    if (wrapperStyle) {
      finalWrapperProps.style = wrapperStyle;
    } else if (wrapperProps.style && typeof wrapperProps.style === "object") {
      finalWrapperProps.style = wrapperProps.style;
    }

    // If wrapper has nested components, render them
    if (component.components && Array.isArray(component.components)) {
      const nestedComponents = component.components
        .sort((a, b) => {
          const indexA = a.index !== undefined ? a.index : 999;
          const indexB = b.index !== undefined ? b.index : 999;
          return indexA - indexB;
        })
        .map((comp, idx) => {
          // Generate unique key: parent index + child index + child type + array idx
          const parentKey =
            component.index !== undefined ? component.index : "wrapper";
          const childKey = comp.index !== undefined ? comp.index : idx;
          const childType = comp.type || "unknown";
          const uniqueKey = `nested-${parentKey}-${childKey}-${childType}-${idx}`;
          return (
            <SchemaComponent
              key={uniqueKey}
              component={comp}
              data={data}
              subSection={subSection}
              isExport={isExport}
              exportWordCloud={exportWordCloud}
            />
          );
        });

      return (
        <ComponentWrapper {...finalWrapperProps}>
          {nestedComponents}
        </ComponentWrapper>
      );
    }

    // If wrapper has content (text), render it
    if (component.content) {
      const content = resolveTemplate(component.content, data);
      // Handle multi-line content like summary
      if (content.includes("\n")) {
        return (
          <ComponentWrapper {...finalWrapperProps}>
            {content.split("\n").map((line, index) => (
              <p key={index} className={line.trim() ? "" : "h-3"}>
                {line}
              </p>
            ))}
          </ComponentWrapper>
        );
      }
      return (
        <ComponentWrapper {...finalWrapperProps}>{content}</ComponentWrapper>
      );
    }

    // Empty wrapper
    return <ComponentWrapper {...finalWrapperProps} />;
  }

  switch (component.type) {
    case "card":
      // If card has nested components, render them as children
      if (component.components && Array.isArray(component.components)) {
        const nestedComponents = component.components
          .sort((a, b) => {
            const indexA = a.index !== undefined ? a.index : 999;
            const indexB = b.index !== undefined ? b.index : 999;
            return indexA - indexB;
          })
          .map((comp, idx) => {
            // Generate unique key: parent index + child index + child type + array idx
            const parentKey =
              component.index !== undefined ? component.index : "wrapper";
            const childKey = comp.index !== undefined ? comp.index : idx;
            const childType = comp.type || "unknown";
            const uniqueKey = `nested-${parentKey}-${childKey}-${childType}-${idx}`;
            return (
              <SchemaComponent
                key={uniqueKey}
                component={comp}
                data={data}
                subSection={subSection}
              />
            );
          });
        return (
          <SchemaCard component={component} data={data}>
            {nestedComponents}
          </SchemaCard>
        );
      }
      return <SchemaCard component={component} data={data} />;
    case "barChart":
      return <SchemaBarChart component={component} data={data} />;
    case "sentimentDivergentChart":
      return (
        <SchemaSentimentDivergentChart component={component} data={data} />
      );
    case "sentimentStackedChart":
      return <SchemaSentimentStackedChart component={component} data={data} />;
    case "sentimentThreeColorChart":
      return (
        <SchemaSentimentThreeColorChart component={component} data={data} />
      );
    case "recommendationsTable":
      return <SchemaRecommendationsTable component={component} data={data} />;
    case "segmentationTable":
      return <SchemaSegmentationTable component={component} data={data} />;
    case "distributionTable":
      return <SchemaDistributionTable component={component} data={data} />;
    case "sentimentTable":
      return <SchemaSentimentTable component={component} data={data} />;
    case "npsDistributionTable":
      return <SchemaNPSDistributionTable component={component} data={data} />;
    case "npsTable":
      return <SchemaNPSTable component={component} data={data} />;
    case "sentimentImpactTable":
      return <SchemaSentimentImpactTable component={component} data={data} />;
    case "positiveCategoriesTable":
      return (
        <SchemaPositiveCategoriesTable component={component} data={data} />
      );
    case "negativeCategoriesTable":
      return (
        <SchemaNegativeCategoriesTable component={component} data={data} />
      );
    case "questionsList":
      return (
        <SchemaQuestionsList
          component={component}
          data={data}
          subSection={subSection}
          isExport={isExport}
          exportWordCloud={exportWordCloud}
        />
      );
    case "npsStackedChart":
      return <SchemaNPSStackedChart component={component} data={data} />;
    case "npsScoreCard":
      return <SchemaNPSScoreCard component={component} data={data} />;
    case "topCategoriesCards":
      return <SchemaTopCategoriesCards component={component} data={data} />;
    case "filterPills":
      return <SchemaFilterPills component={component} data={data} />;
    case "wordCloud":
      return <SchemaWordCloud component={component} data={data} />;
    case "accordion":
      return <SchemaAccordion component={component} data={data} />;
    case "kpiCard":
      return <SchemaKPICard component={component} data={data} />;
    case "lineChart":
      return <SchemaLineChart component={component} data={data} />;
    case "paretoChart":
      return <SchemaParetoChart component={component} data={data} />;
    case "analyticalTable":
      return <SchemaAnalyticalTable component={component} data={data} />;
    case "slopeGraph":
      return <SchemaSlopeGraph component={component} data={data} />;
    case "waterfallChart":
      return <SchemaWaterfallChart component={component} data={data} />;
    case "scatterPlot":
      return <SchemaScatterPlot component={component} data={data} />;
    case "histogram":
      return <SchemaHistogram component={component} data={data} />;
    case "quadrantChart":
      return <SchemaQuadrantChart component={component} data={data} />;
    case "heatmap":
      return <SchemaHeatmap component={component} data={data} />;
    case "sankeyDiagram":
      return <SchemaSankeyDiagram component={component} data={data} />;
    case "stackedBarMECE":
      return <SchemaStackedBarMECE component={component} data={data} />;
    case "evolutionaryScorecard":
      return <SchemaEvolutionaryScorecard component={component} data={data} />;
    default:
      // If no type but has wrapper, it's a wrapper component
      if (component.wrapper) {
        const ComponentWrapper = component.wrapper || "div";
        const wrapperProps = component.wrapperProps || {};
        return <ComponentWrapper {...wrapperProps} />;
      }
      console.warn(`Unknown component type: ${component.type || "none"}`);
      return null;
  }
}

/**
 * Generic Section Renderer - Renders sections based on schema from JSON
 *
 * @param {string} sectionId - ID of the section (e.g., "nova-secao")
 * @param {string} subSection - ID of the subsection (e.g., "subsec-1")
 * @param {boolean} isExport - If true, hides filter pills and shows only selected question
 * @param {boolean} exportWordCloud - Controls word cloud visibility in export mode
 */
export function GenericSectionRenderer({
  sectionId,
  subSection,
  isExport = false,
  exportWordCloud = true,
}) {
  const { data } = useSurveyData();

  // Debug log
  if (isExport && sectionId === "responses") {
    console.log("🔍 DEBUG GenericSectionRenderer - Rendering:", {
      sectionId,
      subSection,
      isExport,
      exportWordCloud,
    });
  }

  // Get section config from sectionsConfig (must be defined before sectionData)
  const sectionConfig = useMemo(() => {
    if (!data?.sectionsConfig?.sections) return null;
    return data.sectionsConfig.sections.find((s) => s.id === sectionId) || null;
  }, [data, sectionId]);

  // Find section data by ID
  const sectionData = useMemo(() => {
    if (!data || !sectionId) return null;

    // Priority 1: sectionConfig.data (new structure - preferred)
    if (sectionConfig?.data) {
      return sectionConfig.data;
    }

    // Priority 2: dataPath configured in sectionConfig
    if (sectionConfig?.dataPath) {
      const resolved = resolveDataPath(data, sectionConfig.dataPath);
      if (resolved) return resolved;
    }

    // Priority 3: Try sectionId directly
    if (data[sectionId]) {
      return data[sectionId];
    }

    return null;
  }, [data, sectionId, sectionConfig]);

  // Get render schema
  // Priority: sectionConfig.data.renderSchema (new structure) > sectionData.renderSchema
  const renderSchema = useMemo(() => {
    // Try sectionConfig.data.renderSchema first (new structure)
    if (sectionConfig?.data?.renderSchema) {
      return sectionConfig.data.renderSchema;
    }

    // Try sectionData.renderSchema
    if (sectionData?.renderSchema) {
      return sectionData.renderSchema;
    }

    return null;
  }, [sectionData, sectionConfig]);

  // Check if section has subsections
  const hasSubsections = useMemo(() => {
    // attributes: sempre dinâmico a partir de sectionData.attributes
    if (sectionId === "attributes") {
      const attrs = sectionData?.attributes || resolveDataPath(sectionData, "attributes");
      return !!(attrs && Array.isArray(attrs) && attrs.length > 0);
    }
    // responses: sempre dinâmico (questions)
    if (sectionId === "responses") {
      const questions = getQuestionsFromData(data);
      if (questions.length > 0) return true;
    }

    // Priority 1: Check sectionConfig first (fixed subsections)
    if (
      sectionConfig?.subsections &&
      Array.isArray(sectionConfig.subsections) &&
      sectionConfig.subsections.length > 0
    ) {
      return true;
    }
    // Priority 2: Check sectionConfig.hasSubsections flag
    if (sectionConfig?.hasSubsections !== undefined) {
      return sectionConfig.hasSubsections;
    }
    // Priority 3: Check renderSchema.hasSubsections flag
    if (renderSchema?.hasSubsections !== undefined) {
      return renderSchema.hasSubsections;
    }
    // Priority 4: Default: check if renderSchema subsections array exists and has items
    return (
      renderSchema?.subsections &&
      Array.isArray(renderSchema.subsections) &&
      renderSchema.subsections.length > 0
    );
  }, [sectionConfig, renderSchema, sectionId, data]);

  // Get subsections sorted by index
  // attributes: 100% dinâmico a partir de sectionData.attributes; componentes montados em buildAttributeComponents
  const subsections = useMemo(() => {
    if (sectionId === "attributes") {
      const attrs =
        sectionData?.attributes || resolveDataPath(sectionData, "attributes");
      if (attrs && Array.isArray(attrs) && attrs.length > 0) {
        return attrs
          .filter((a) => a.icon)
          .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
          .map((attr) => ({
            id: `attributes-${attr.id}`,
            index: attr.index ?? 999,
            name: attr.name,
            icon: attr.icon,
            components: buildAttributeComponents(attr),
          }));
      }
      return [];
    }

    // Priority 1: Use fixed subsections from sectionConfig if available (não usado por attributes)
    if (
      sectionConfig?.subsections &&
      Array.isArray(sectionConfig.subsections)
    ) {
      // For other sections (like executive), merge fixed subsections with renderSchema components
      if (
        renderSchema?.subsections &&
        Array.isArray(renderSchema.subsections)
      ) {
        return sectionConfig.subsections
          .sort((a, b) => (a.index || 0) - (b.index || 0))
          .map((fixedSub) => {
            // Find matching subsection in renderSchema by ID
            const schemaSub = renderSchema.subsections.find(
              (sub) => sub.id === fixedSub.id
            );
            // Merge: use fixedSub config (id, index, name, icon) and get components from renderSchema
            // Metadados (name, icon, index) vêm apenas de section.subsections, não de renderSchema
            const mergedSub = {
              ...fixedSub, // Use all metadata from section.subsections (id, index, name, icon)
              ...(schemaSub?.components && {
                components: schemaSub.components,
              }),
              ...(schemaSub?.componentsContainerClassName && {
                componentsContainerClassName:
                  schemaSub.componentsContainerClassName,
              }),
            };

            // CRITICAL: Ensure components are always available
            // Priority: renderSchema.components > fixedSub.components
            if (!mergedSub.components) {
              if (schemaSub?.components) {
                mergedSub.components = schemaSub.components;
              } else if (fixedSub.components) {
                mergedSub.components = fixedSub.components;
              }
            }

            return mergedSub;
          });
      }

      // Fallback: use fixed subsections as-is (no components from renderSchema)
      // But try to get components from renderSchema if available
      return sectionConfig.subsections
        .sort((a, b) => {
          const indexA = a.index !== undefined ? a.index : 999;
          const indexB = b.index !== undefined ? b.index : 999;
          return indexA - indexB;
        })
        .map((fixedSub) => {
          // Even if renderSchema.subsections doesn't exist, try to find components in renderSchema
          // Metadados (name, icon, index) vêm apenas de section.subsections
          if (renderSchema?.subsections) {
            const schemaSub = renderSchema.subsections.find(
              (sub) => sub.id === fixedSub.id
            );
            if (schemaSub?.components) {
              return {
                ...fixedSub, // Use all metadata from section.subsections
                components: schemaSub.components,
              };
            }
          }
          return fixedSub;
        });
    }

    // Priority 2: Dynamic generation for responses (always works, even if hasSubsections is false)
    // This matches the behavior in SurveySidebar.getDynamicSubsections
    if (sectionId === "responses") {
      const questions = getQuestionsFromData(data)
        .sort((a, b) => (a.index || 0) - (b.index || 0));

      // Use components from renderSchema if available
      const baseComponents = renderSchema?.components || [];

      return questions.map((question) => ({
        id: `responses-${question.id}`,
        name: question.question,
        icon: question.icon,
        index: question.index ?? 999,
        question: question, // Keep full question object for special rendering
        // Use components from renderSchema for each question subsection
        components: baseComponents.length > 0 ? baseComponents : undefined,
      }));
    }

    // Priority 3: Use renderSchema subsections (fallback) - only if hasSubsections is true
    if (
      hasSubsections &&
      renderSchema?.subsections &&
      Array.isArray(renderSchema.subsections)
    ) {
      // Fallback: renderSchema.subsections no longer has index
      // This should rarely be used since section.subsections should always exist
      // Return as-is without sorting (order should come from section.subsections)
      return [...renderSchema.subsections];
    }

    return [];
  }, [
    renderSchema,
    sectionId,
    data,
    hasSubsections,
    sectionConfig,
    sectionData,
  ]);

  // Find the active subsection
  const activeSubsection = useMemo(() => {
    if (!subSection) {
      // Return first subsection if none specified
      return subsections[0] || null;
    }

    // Try exact match first (this will work for dynamic subsections like "responses-1")
    let found = subsections.find((sub) => sub.id === subSection);

    if (!found) {
      // Debug: log what we're looking for
      console.warn(
        "GenericSectionRenderer: Subsection not found in subsections array",
        {
          sectionId,
          subSection,
          subsectionsCount: subsections.length,
          subsectionsIds: subsections.map((s) => s.id),
          lookingFor: subSection,
        }
      );
    }

    return found || null;
  }, [subsections, subSection, sectionId]);

  // Get components sorted by index and enriched with styles
  const components = useMemo(() => {
    let rawComponents = [];

    // If no subsections, get components directly from renderSchema
    if (!hasSubsections) {
      if (
        !renderSchema?.components ||
        !Array.isArray(renderSchema.components)
      ) {
        return [];
      }
      rawComponents = [...renderSchema.components];
    } else {
      // Otherwise, get from activeSubsection
      if (
        !activeSubsection?.components ||
        !Array.isArray(activeSubsection.components)
      ) {
        return [];
      }
      rawComponents = [...activeSubsection.components];
    }

    // Sort by index
    const sorted = rawComponents.sort((a, b) => {
      const indexA = a.index !== undefined ? a.index : 999;
      const indexB = b.index !== undefined ? b.index : 999;
      return indexA - indexB;
    });

    // Enriquece componentes com estilos (aplica styleVariant)
    return sorted.map((component) => enrichComponentWithStyles(component));
  }, [activeSubsection?.components, hasSubsections, renderSchema?.components]);

  // For attributes section, resolve current attribute and add to data context
  // Also merge section-specific uiTexts into data context
  const enhancedData = useMemo(() => {
    if (!data) {
      console.error("GenericSectionRenderer: data is null/undefined");
      return { uiTexts: {} };
    }

    // Debug: verify data.uiTexts has attributeDeepDive BEFORE any processing
    if (
      sectionId === "attributes" &&
      data?.uiTexts &&
      !data.uiTexts.attributeDeepDive
    ) {
      console.error(
        "GenericSectionRenderer: data.uiTexts missing attributeDeepDive BEFORE processing!",
        {
          sectionId,
          hasDataUiTexts: !!data.uiTexts,
          dataUiTextsKeys: Object.keys(data.uiTexts),
        }
      );
    }

    // CRITICAL: Always preserve uiTexts from data
    // Start with data spread, but ensure uiTexts is explicitly preserved
    let enhanced = { ...data };

    // If data has uiTexts, use it; otherwise create empty object
    // This ensures uiTexts is always an object (never undefined)
    if (!enhanced.uiTexts) {
      enhanced.uiTexts = data?.uiTexts || {};
    }

    // Debug: verify enhanced.uiTexts after initial setup
    if (
      sectionId === "attributes" &&
      enhanced.uiTexts &&
      !enhanced.uiTexts.attributeDeepDive
    ) {
      console.warn(
        "GenericSectionRenderer: enhanced.uiTexts missing attributeDeepDive after initial setup!",
        {
          sectionId,
          hasEnhancedUiTexts: !!enhanced.uiTexts,
          enhancedUiTextsKeys: Object.keys(enhanced.uiTexts),
          hasDataUiTexts: !!data?.uiTexts,
          dataUiTextsKeys: data?.uiTexts ? Object.keys(data.uiTexts) : [],
        }
      );
    }

    // Add sectionData to context for relative paths (sectionData.*)
    if (sectionData) {
      enhanced.sectionData = sectionData;
    }

    // Add section-specific uiTexts to data context
    // CRITICAL FIX: Always use data.uiTexts directly as the base (not enhanced.uiTexts)
    // This ensures ALL root properties like attributeDeepDive are preserved
    const rootUiTexts = data?.uiTexts || {};

    // Debug: verify rootUiTexts has attributeDeepDive
    if (sectionId === "attributes" && !rootUiTexts.attributeDeepDive) {
      console.error(
        "GenericSectionRenderer: rootUiTexts missing attributeDeepDive!",
        {
          sectionId,
          hasRootUiTexts: !!rootUiTexts,
          rootUiTextsKeys: Object.keys(rootUiTexts),
          hasDataUiTexts: !!data?.uiTexts,
          dataUiTextsKeys: data?.uiTexts ? Object.keys(data.uiTexts) : [],
        }
      );
    }

    // ALWAYS start with a complete copy of rootUiTexts to preserve ALL properties
    // This is the key fix - we must use data.uiTexts directly, not enhanced.uiTexts
    enhanced.uiTexts = rootUiTexts ? { ...rootUiTexts } : {};

    // If there are section-specific uiTexts, merge them on top
    // But NEVER lose root properties like attributeDeepDive
    if (sectionConfig?.data?.uiTexts) {
      const sectionUiTexts = sectionConfig.data.uiTexts;

      // Merge section-specific uiTexts (deep merge for nested objects)
      // This only ADDS or OVERRIDES, never removes root properties
      Object.keys(sectionUiTexts).forEach((key) => {
        if (
          typeof sectionUiTexts[key] === "object" &&
          !Array.isArray(sectionUiTexts[key]) &&
          rootUiTexts[key] &&
          typeof rootUiTexts[key] === "object"
        ) {
          // If both are objects, merge them deeply (section takes precedence for overlapping keys)
          // But preserve all root properties
          enhanced.uiTexts[key] = {
            ...rootUiTexts[key],
            ...sectionUiTexts[key],
          };
        } else {
          // Section uiTexts override root for this key, but other root keys remain
          enhanced.uiTexts[key] = sectionUiTexts[key];
        }
      });
    }

    // FINAL SAFETY CHECK: Ensure ALL root uiTexts properties are present
    // This is critical - if any root property was lost, restore it
    if (data?.uiTexts) {
      Object.keys(data.uiTexts).forEach((key) => {
        // Only add if it's missing (don't override section-specific overrides)
        if (!(key in enhanced.uiTexts)) {
          enhanced.uiTexts[key] = data.uiTexts[key];
        } else if (
          typeof data.uiTexts[key] === "object" &&
          !Array.isArray(data.uiTexts[key])
        ) {
          // For objects, ensure all nested properties from root are present
          if (
            typeof enhanced.uiTexts[key] === "object" &&
            !Array.isArray(enhanced.uiTexts[key])
          ) {
            Object.keys(data.uiTexts[key]).forEach((nestedKey) => {
              if (!(nestedKey in enhanced.uiTexts[key])) {
                enhanced.uiTexts[key][nestedKey] = data.uiTexts[key][nestedKey];
              }
            });
          }
        }
      });
    }

    if (sectionId === "attributes" && subSection) {
      // Extract attributeId from subSection (e.g., "attributes-customerType" -> "customerType")
      const attributeIdMatch = subSection.match(/attributes-(.+)/);
      const attributeId = attributeIdMatch
        ? attributeIdMatch[1]
        : subSection.replace("attributes-", "");

      // Find the attribute in sectionData
      const attributes =
        sectionData?.attributes || resolveDataPath(sectionData, "attributes");
      if (attributes && Array.isArray(attributes)) {
        const currentAttribute = attributes.find(
          (attr) => attr.id === attributeId
        );
        if (currentAttribute) {
          // Add currentAttribute to data context for easier access in schema
          // Also add dynamic yAxisWidth based on attributeId
          // IMPORTANT: Preserve uiTexts from enhanced
          enhanced = {
            ...enhanced,
            currentAttribute,
            // Also add index for array access
            currentAttributeIndex: attributes.findIndex(
              (attr) => attr.id === attributeId
            ),
            // Dynamic yAxisWidth for distribution chart
            currentAttributeYAxisWidth: attributeId === "state" ? 150 : 110,
          };
        }
      }
    }

    // Add export mode state to data for QuestionsList and FilterPills
    if (isExport) {
      enhanced._exportMode = true;
      enhanced._exportWordCloud = exportWordCloud;
    }

    // Debug: verify uiTexts is present in final enhancedData
    if (!enhanced.uiTexts) {
      console.error("GenericSectionRenderer: enhancedData missing uiTexts!", {
        sectionId,
        subSection,
        hasData: !!data,
        hasDataUiTexts: !!data?.uiTexts,
        dataKeys: data ? Object.keys(data) : [],
        enhancedKeys: Object.keys(enhanced),
      });
    } else if (
      sectionId === "attributes" &&
      !enhanced.uiTexts.attributeDeepDive
    ) {
      console.warn(
        "GenericSectionRenderer: enhancedData.uiTexts missing attributeDeepDive",
        {
          sectionId,
          subSection,
          uiTextsKeys: Object.keys(enhanced.uiTexts),
        }
      );
    }

    return enhanced;
  }, [
    data,
    sectionId,
    subSection,
    sectionConfig,
    sectionData,
    isExport,
    exportWordCloud,
  ]);

  // attributes (e responses) montam componentes dinamicamente; não exigem renderSchema no JSON
  const canRenderWithoutSchema = sectionId === "attributes" || sectionId === "responses";
  if (!renderSchema && !canRenderWithoutSchema) {
    console.warn(`No renderSchema found for section: ${sectionId}`);
    return (
      <div className="space-y-8 animate-fade-in">
        <p>Seção não encontrada ou sem schema de renderização.</p>
      </div>
    );
  }

  // Special handling for responses section with dynamic question subsections
  // Even though hasSubsections is false, we may receive subSection like "responses-1"
  // In this case, we should use the components directly and pass questionId to questionsList
  const isResponsesWithQuestionId =
    sectionId === "responses" &&
    subSection &&
    subSection.startsWith("responses-") &&
    !hasSubsections;

  // If has subsections, require activeSubsection (unless it's responses with questionId)
  if (hasSubsections && !activeSubsection && !isResponsesWithQuestionId) {
    // Debug: log what we're looking for
    console.warn("GenericSectionRenderer: Subsection not found", {
      sectionId,
      subSection,
      hasSubsections,
      subsectionsCount: subsections.length,
      subsectionsIds: subsections.map((s) => s.id),
      sectionConfigSubsections: sectionConfig?.subsections?.map((s) => s.id),
      renderSchemaSubsections: renderSchema?.subsections?.map((s) => s.id),
    });
    return (
      <div className="space-y-8 animate-fade-in">
        <p>Subseção não encontrada: {subSection || "nenhuma especificada"}</p>
        <p className="text-sm text-muted-foreground">
          Subseções disponíveis:{" "}
          {subsections.map((s) => s.id).join(", ") || "nenhuma"}
        </p>
      </div>
    );
  }

  // Get icon for subsection (only if has subsections)
  const SubsectionIcon =
    hasSubsections && activeSubsection?.icon
      ? getIcon(activeSubsection.icon)
      : null;

  // Get container className - hardcoded based on context
  let containerClassName = "space-y-6"; // default

  if (hasSubsections) {
    // For subsections, check the subsection structure
    if (activeSubsection) {
      // Attribute deep dive subsections - check if there are wrapper components with two cards
      if (sectionId === "attributes") {
        // Check if any component is a wrapper with two card children
        const hasTwoCardWrapper = components.some(
          (comp) =>
            comp.wrapper === "div" &&
            comp.components &&
            comp.components.length === 2 &&
            comp.components.every((c) => c.type === "card")
        );

        if (hasTwoCardWrapper) {
          // Use space-y-6 for the main container, but the wrapper will handle the grid layout
          containerClassName = "space-y-6";
        } else {
          containerClassName = "space-y-6";
        }
      } else {
        // Other subsections use grid gap-6
        containerClassName = "grid gap-6";
      }
    }
  } else {
    // For sections without subsections
    // Response details section uses space-y-6
    if (sectionId === "responses") {
      containerClassName = "space-y-6";
    } else {
      containerClassName = "space-y-6";
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <div className="space-y-6">
          {/* Subsection Title - show only if has subsections */}
          {hasSubsections && activeSubsection ? (
            <SubsectionTitle
              title={activeSubsection?.name || "Subseção"}
              icon={SubsectionIcon}
            />
          ) : null}

          {/* Render components in order */}
          {components.length > 0 && (
            <div className={containerClassName}>
              {components.map((component, idx) => {
                // In export mode, hide filterPills component
                if (isExport && component.type === "filterPills") {
                  return null;
                }

                return (
                  <SchemaComponent
                    key={`component-${
                      component.index !== undefined ? component.index : idx
                    }`}
                    component={component}
                    data={enhancedData}
                    subSection={subSection}
                    isExport={isExport}
                    exportWordCloud={exportWordCloud}
                  />
                );
              })}
            </div>
          )}

          {components.length === 0 && (
            <p className="text-muted-foreground">
              Nenhum componente definido para esta{" "}
              {hasSubsections ? "subseção" : "seção"}.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

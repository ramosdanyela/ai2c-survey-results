import React, { useMemo, useState } from "react";
import { SubsectionTitle } from "../widgets/SubsectionTitle";
import {
  SimpleBarChart,
  SentimentDivergentChart,
  SentimentStackedChart,
  SentimentThreeColorChart,
  NPSStackedChart,
} from "../widgets/Charts";
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
  const title = resolveTemplate(component.title || "", data);
  const content = resolveTemplate(component.content || "", data);

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
 * Get chart config defaults based on context
 * All styling/config is determined programmatically
 */
function getBarChartConfig(component, data, isMobile) {
  const config = component.config || {};
  const preset = config.preset; // Use preset from JSON instead of checking dataPath

  // Determine defaults based on preset (from JSON) or fallback to defaults
  let height = config.height || 256;
  let margin = config.margin || { top: 10, right: 80, left: 120, bottom: 10 };
  let yAxisWidth = config.yAxisWidth || 110;

  // Use preset to determine chart configuration
  if (preset === "respondentIntent") {
    height = isMobile ? 400 : 256;
    margin = isMobile
      ? { top: 10, right: 35, left: 4, bottom: 10 }
      : { top: 10, right: 80, left: 250, bottom: 10 };
    yAxisWidth = isMobile ? 130 : 240;
  } else if (preset === "distribution") {
    height = 400;
    margin = { top: 10, right: 80, left: 120, bottom: 10 };
    yAxisWidth = data.currentAttributeYAxisWidth || 110;
  }

  // Ensure tooltipFormatter is a function or undefined
  let tooltipFormatter = config.tooltipFormatter;
  if (tooltipFormatter && typeof tooltipFormatter !== "function") {
    // If it's a string template, try to resolve it (though it should be a function)
    console.warn(
      `BarChart: tooltipFormatter must be a function, got ${typeof tooltipFormatter}. Using default.`
    );
    tooltipFormatter = undefined;
  }

  // Ensure labelFormatter is a function or undefined
  let labelFormatter = config.labelFormatter;
  if (labelFormatter && typeof labelFormatter !== "function") {
    console.warn(
      `BarChart: labelFormatter must be a function, got ${typeof labelFormatter}. Using default.`
    );
    labelFormatter = undefined;
  }

  return {
    height,
    margin,
    yAxisWidth,
    dataKey: config.dataKey || "value",
    yAxisDataKey: config.yAxisDataKey || "label",
    fillColor: config.fillColor,
    showLabels: config.showLabels !== false,
    labelFormatter: labelFormatter,
    tooltipFormatter: tooltipFormatter,
    sortData: config.sortData !== false,
    sortDirection: config.sortDirection || "desc",
    hideXAxis: config.hideXAxis !== false,
  };
}

/**
 * Render a bar chart component based on schema
 */
function SchemaBarChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath);
  const isMobile = useIsMobile();

  if (!chartData || !Array.isArray(chartData)) {
    console.warn(`BarChart: Data not found at path "${component.dataPath}"`);
    return null;
  }

  const chartConfig = getBarChartConfig(component, data, isMobile);

  const chart = (
    <SimpleBarChart
      data={chartData}
      dataKey={chartConfig.dataKey}
      yAxisDataKey={chartConfig.yAxisDataKey}
      height={chartConfig.height}
      margin={chartConfig.margin}
      yAxisWidth={chartConfig.yAxisWidth}
      fillColor={chartConfig.fillColor}
      showLabels={chartConfig.showLabels}
      labelFormatter={chartConfig.labelFormatter}
      tooltipFormatter={chartConfig.tooltipFormatter}
      sortData={chartConfig.sortData}
      sortDirection={chartConfig.sortDirection}
      hideXAxis={chartConfig.hideXAxis}
    />
  );

  // Use wrapperClassName from component config or preset-based wrapper
  const wrapperClassName = component.wrapperClassName;
  if (wrapperClassName || component.config?.preset === "distribution") {
    const finalClassName = wrapperClassName || "flex-shrink-0 mb-4";
    const wrapperStyle =
      component.wrapperStyle ||
      (component.config?.preset === "distribution"
        ? { height: "400px" }
        : undefined);
    return (
      <div className={finalClassName} style={wrapperStyle}>
        {chart}
      </div>
    );
  }

  return chart;
}

/**
 * Get sentiment divergent chart config based on context
 */
function getSentimentDivergentChartConfig(component, data) {
  const config = component.config || {};

  return {
    height: 320,
    margin: { top: 20, right: 30, left: 100, bottom: 20 },
    xAxisDomain: config.xAxisDomain,
    yAxisDataKey: config.yAxisDataKey || "category",
    yAxisWidth: config.yAxisWidth || 90,
    showGrid: false,
    showLegend: config.showLegend !== false,
    axisLine: false,
    tickLine: false,
    barSize: config.barSize,
    allowDataOverflow: config.allowDataOverflow,
    legendWrapperStyle: config.legendWrapperStyle,
    legendIconType: config.legendIconType,
    labels: config.labels,
  };
}

/**
 * Render a sentiment divergent chart component based on schema
 */
function SchemaSentimentDivergentChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath);

  if (!chartData || !Array.isArray(chartData)) {
    console.warn(
      `SentimentDivergentChart: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  const chartConfig = getSentimentDivergentChartConfig(component, data);

  return (
    <SentimentDivergentChart
      data={chartData}
      height={chartConfig.height}
      margin={chartConfig.margin}
      xAxisDomain={chartConfig.xAxisDomain}
      yAxisDataKey={chartConfig.yAxisDataKey}
      yAxisWidth={chartConfig.yAxisWidth}
      showGrid={chartConfig.showGrid}
      showLegend={chartConfig.showLegend}
      axisLine={chartConfig.axisLine}
      tickLine={chartConfig.tickLine}
      barSize={chartConfig.barSize}
      allowDataOverflow={chartConfig.allowDataOverflow}
      legendWrapperStyle={chartConfig.legendWrapperStyle}
      legendIconType={chartConfig.legendIconType}
      labels={chartConfig.labels}
    />
  );
}

/**
 * Render a recommendations table component based on schema
 * This component needs state management for expand/collapse
 */
function SchemaRecommendationsTable({ component, data }) {
  const recommendations = resolveDataPath(data, component.dataPath);
  const severityLabels = resolveDataPath(
    data,
    component.severityLabelsPath || "uiTexts.severityLabels"
  );

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
 * Get sentiment stacked chart config based on context
 */
function getSentimentStackedChartConfig(component, data) {
  const config = component.config || {};
  const preset = config.preset; // Use preset from JSON instead of checking dataPath

  // Defaults - use config values or fallback to defaults
  let height = config.height || 256;
  let margin = config.margin || { top: 10, right: 30, left: 100, bottom: 10 };
  let showGrid = config.showGrid !== undefined ? config.showGrid : true;
  let axisLine = config.axisLine !== undefined ? config.axisLine : true;
  let tickLine = config.tickLine !== undefined ? config.tickLine : true;

  // Use preset to determine chart configuration
  if (preset === "attributeSentiment") {
    height = 400;
    showGrid = false;
  } else if (preset === "questionSentiment") {
    height = 192;
    showGrid = false;
    axisLine = false;
    tickLine = false;
  }

  return {
    height,
    margin: config.margin || margin,
    yAxisDataKey: config.yAxisDataKey || "category",
    yAxisWidth: config.yAxisWidth || 90,
    showGrid: config.showGrid !== undefined ? config.showGrid : showGrid,
    showLegend: config.showLegend !== false,
    axisLine: config.axisLine !== undefined ? config.axisLine : axisLine,
    tickLine: config.tickLine !== undefined ? config.tickLine : tickLine,
  };
}

/**
 * Render a sentiment stacked chart component based on schema
 */
function SchemaSentimentStackedChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath);

  if (!chartData || !Array.isArray(chartData)) {
    console.warn(
      `SentimentStackedChart: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  const chartConfig = getSentimentStackedChartConfig(component, data);

  const chart = (
    <SentimentStackedChart
      data={chartData}
      height={chartConfig.height}
      margin={chartConfig.margin}
      yAxisDataKey={chartConfig.yAxisDataKey}
      yAxisWidth={chartConfig.yAxisWidth}
      showGrid={chartConfig.showGrid}
      showLegend={chartConfig.showLegend}
      axisLine={chartConfig.axisLine}
      tickLine={chartConfig.tickLine}
    />
  );

  // Use wrapperClassName from component config or preset-based wrapper
  const wrapperClassName = component.wrapperClassName;
  if (wrapperClassName || component.config?.preset === "attributeSentiment") {
    const finalClassName = wrapperClassName || "flex-shrink-0 mb-4";
    const wrapperStyle =
      component.wrapperStyle ||
      (component.config?.preset === "attributeSentiment"
        ? { height: "400px" }
        : undefined);
    return (
      <div className={finalClassName} style={wrapperStyle}>
        {chart}
      </div>
    );
  }

  return chart;
}

/**
 * Get sentiment three color chart config based on context
 */
function getSentimentThreeColorChartConfig(component, data) {
  const config = component.config || {};

  return {
    height: 192,
    margin: { top: 10, right: 30, left: 20, bottom: 10 },
    showGrid: false,
    showLegend: false,
    axisLine: false,
    tickLine: false,
  };
}

/**
 * Render a sentiment three color chart component based on schema
 */
function SchemaSentimentThreeColorChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath);

  if (!chartData || !Array.isArray(chartData)) {
    console.warn(
      `SentimentThreeColorChart: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  const chartConfig = getSentimentThreeColorChartConfig(component, data);

  return (
    <SentimentThreeColorChart
      data={chartData}
      height={chartConfig.height}
      margin={chartConfig.margin}
      showGrid={chartConfig.showGrid}
      showLegend={chartConfig.showLegend}
    />
  );
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
 * Get NPS stacked chart config based on context
 */
function getNPSStackedChartConfig(component, data) {
  const config = component.config || {};

  return {
    height: 256,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
    showGrid: config.showGrid !== undefined ? config.showGrid : true,
    showLegend: config.showLegend !== false,
    hideXAxis: true,
    showPercentagesInLegend: true,
    chartName: config.chartName || "NPS",
    ranges: config.ranges,
  };
}

/**
 * Render an NPS stacked chart component based on schema
 */
function SchemaNPSStackedChart({ component, data }) {
  const chartData = resolveDataPath(data, component.dataPath);

  if (!chartData) {
    console.warn(
      `NPSStackedChart: Data not found at path "${component.dataPath}"`
    );
    return null;
  }

  const chartConfig = getNPSStackedChartConfig(component, data);

  // Handle data format - can be object with Detratores/Neutros/Promotores or array
  let npsData = chartData;
  if (Array.isArray(chartData) && chartData.length > 0) {
    // Convert array format to object format
    const detrator = chartData.find((d) => d.option === "Detrator");
    const promotor = chartData.find((d) => d.option === "Promotor");
    const neutro = chartData.find((d) => d.option === "Neutro");
    npsData = {
      Detratores: detrator?.percentage || 0,
      Neutros: neutro?.percentage || 0,
      Promotores: promotor?.percentage || 0,
    };
  }

  return (
    <NPSStackedChart
      data={npsData}
      height={chartConfig.height}
      margin={chartConfig.margin}
      showGrid={chartConfig.showGrid}
      showLegend={chartConfig.showLegend}
      hideXAxis={chartConfig.hideXAxis}
      showPercentagesInLegend={chartConfig.showPercentagesInLegend}
      chartName={chartConfig.chartName}
      ranges={chartConfig.ranges}
    />
  );
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

  const uiTexts = resolveDataPath(data, "uiTexts");

  if (!uiTexts) {
    console.warn(`FilterPills: uiTexts not found`);
    return null;
  }

  const config = component.config || {};
  const showWordCloudToggle = config.showWordCloudToggle !== false;

  const contextValue = {
    questionFilter,
    setQuestionFilter,
    showWordCloud,
    setShowWordCloud,
  };

  // Store in data for QuestionsList to access
  if (data && typeof data === "object" && !Array.isArray(data)) {
    data._filterPillsState = contextValue;
  }

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
        {uiTexts.responseDetails?.all || "Todos"}
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
        {uiTexts.responseDetails?.openField || "Campo Aberto"}
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
        {uiTexts.responseDetails?.multipleChoice || "Múltipla Escolha"}
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
        {uiTexts.responseDetails?.nps || "NPS"}
      </Badge>
      {/* Word Cloud Toggle */}
      {showWordCloudToggle && (
        <div className="flex items-center gap-2 ml-auto">
          <Label
            htmlFor="word-cloud-toggle"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            {uiTexts.responseDetails?.wordCloud || "Nuvem de Palavras"}
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
  const useStaticImage = config.useStaticImage !== false;
  const staticImagePath = config.staticImagePath || "/nuvem.png";

  return (
    <div>
      {title && (
        <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Cloud className="w-4 h-4" style={{ color: COLOR_ORANGE_PRIMARY }} />
          {title}
        </h4>
      )}
      <div className="flex justify-center items-center p-6 bg-muted/30 rounded-lg min-h-[200px]">
        {useStaticImage && wordCloudData.length === 0 ? (
          <img
            src={staticImagePath}
            alt={uiTexts?.responseDetails?.wordCloud || "Word Cloud"}
            className="max-w-full h-auto"
            style={{ maxHeight: "500px" }}
          />
        ) : (
          <WordCloud words={wordCloudData} maxWords={config.maxWords || 15} />
        )}
      </div>
    </div>
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
function SchemaQuestionsList({ component, data, subSection, isExport = false, exportWordCloud = true }) {
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
  let filterState = data?._filterPillsState;
  
  // In export mode, create filter state with wordCloud control
  if (isExport) {
    filterState = {
      questionFilter: questionId ? null : "all", // If specific question, don't filter by type
      setQuestionFilter: () => {},
      showWordCloud: exportWordCloud,
      setShowWordCloud: () => {},
    };
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
 * Check if a component condition is met
 */
function checkCondition(condition, data) {
  if (!condition) return true;

  // Resolve condition path
  const conditionValue = resolveDataPath(data, condition);

  // Check if condition is truthy
  return (
    conditionValue !== null &&
    conditionValue !== undefined &&
    conditionValue !== false &&
    conditionValue !== ""
  );
}

/**
 * Render a component based on its type
 */
function SchemaComponent({ component, data, subSection, isExport = false, exportWordCloud = true }) {
  // Check condition first
  if (component.condition && !checkCondition(component.condition, data)) {
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
            <SchemaComponent key={uniqueKey} component={comp} data={data} />
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
export function GenericSectionRenderer({ sectionId, subSection, isExport = false, exportWordCloud = true }) {
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
  }, [sectionConfig, renderSchema]);

  // Get subsections sorted by index
  // Priority: sectionConfig.subsections (fixed) > dynamic generation > renderSchema.subsections
  const subsections = useMemo(() => {
    if (!hasSubsections) {
      return [];
    }

    // Priority 1: Use fixed subsections from sectionConfig if available
    if (
      sectionConfig?.subsections &&
      Array.isArray(sectionConfig.subsections)
    ) {
      // For attributes section, merge fixed subsections with template components
      if (sectionId === "attributes" && renderSchema?.subsections) {
        const template = renderSchema.subsections.find(
          (sub) =>
            sub.id === "attribute-template" || sub.id?.includes("template")
        );
        if (template) {
          // Merge fixed subsection config with template components
          return sectionConfig.subsections
            .sort((a, b) => (a.index || 0) - (b.index || 0))
            .map((fixedSub) => ({
              ...fixedSub,
              components: template.components, // Use template components
            }));
        }
      }

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
            // Merge: use fixedSub config but get components from renderSchema if available
            return {
              ...fixedSub,
              ...(schemaSub?.components && {
                components: schemaSub.components,
              }),
              ...(schemaSub?.componentsContainerClassName && {
                componentsContainerClassName:
                  schemaSub.componentsContainerClassName,
              }),
            };
          });
      }

      // Fallback: use fixed subsections as-is (no components from renderSchema)
      return [...sectionConfig.subsections].sort((a, b) => {
        const indexA = a.index !== undefined ? a.index : 999;
        const indexB = b.index !== undefined ? b.index : 999;
        return indexA - indexB;
      });
    }

    // Priority 2: Dynamic generation for attributes (if no fixed subsections)
    if (sectionId === "attributes") {
      const attributes =
        sectionData?.attributes || resolveDataPath(sectionData, "attributes");
      if (attributes && Array.isArray(attributes) && attributes.length > 0) {
        // Find template subsection
        const template = renderSchema?.subsections?.find(
          (sub) =>
            sub.id === "attribute-template" || sub.id?.includes("template")
        );
        if (template) {
          // Generate one subsection per attribute
          return attributes
            .filter((attr) => attr.icon) // Only attributes with icons
            .sort((a, b) => (a.index || 0) - (b.index || 0))
            .map((attr) => ({
              ...template,
              id: `attributes-${attr.id}`,
              index: attr.index || 0,
              name: attr.name,
              icon: attr.icon,
            }));
        }
      }
    }

    // Priority 3: Use renderSchema subsections (fallback)
    if (renderSchema?.subsections && Array.isArray(renderSchema.subsections)) {
      return [...renderSchema.subsections].sort((a, b) => {
        const indexA = a.index !== undefined ? a.index : 999;
        const indexB = b.index !== undefined ? b.index : 999;
        return indexA - indexB;
      });
    }

    return [];
  }, [renderSchema, sectionId, data, hasSubsections, sectionConfig]);

  // Find the active subsection
  const activeSubsection = useMemo(() => {
    if (!subSection) {
      // Return first subsection if none specified
      return subsections[0] || null;
    }

    // For responses section, if subSection is like "responses-1", find the base "responses" subsection
    if (sectionId === "responses" && subSection.startsWith("responses-")) {
      const baseSubsection = subsections.find((sub) => sub.id === "responses");
      if (baseSubsection) return baseSubsection;
    }

    return subsections.find((sub) => sub.id === subSection) || null;
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
    let enhanced = { ...data };

    // Add sectionData to context for relative paths (sectionData.*)
    if (sectionData) {
      enhanced.sectionData = sectionData;
    }

    // Add section-specific uiTexts to data context
    // Priority: sectionConfig.data.uiTexts (new structure) > root uiTexts
    if (sectionConfig?.data?.uiTexts) {
      const sectionUiTexts = sectionConfig.data.uiTexts;

      // Merge section uiTexts with root uiTexts
      // Section uiTexts take precedence
      enhanced = {
        ...enhanced,
        uiTexts: {
          ...(data?.uiTexts || {}), // Root uiTexts (global ones)
          ...sectionUiTexts, // Section-specific uiTexts (direct access)
        },
      };
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
          return {
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

    return enhanced;
  }, [data, sectionId, subSection, sectionConfig, sectionData, isExport, exportWordCloud]);

  // Check for errors AFTER all hooks are called
  if (!renderSchema) {
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
  const isResponsesWithQuestionId = sectionId === "responses" && 
    subSection && 
    subSection.startsWith("responses-") && 
    !hasSubsections;

  // If has subsections, require activeSubsection (unless it's responses with questionId)
  if (hasSubsections && !activeSubsection && !isResponsesWithQuestionId) {
    return (
      <div className="space-y-8 animate-fade-in">
        <p>Subseção não encontrada.</p>
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

  // For responses section with questionId, get question title
  const questionTitle = useMemo(() => {
    if (isResponsesWithQuestionId && subSection) {
      const match = subSection.match(/responses-(\d+)/);
      if (match) {
        const questionId = parseInt(match[1], 10);
        const responseDetails = data?.responseDetails;
        const allQuestions = getQuestionsFromResponseDetails(responseDetails);
        const question = allQuestions.find((q) => q.id === questionId);
        if (question) {
          return question.question;
        }
      }
    }
    return null;
  }, [isResponsesWithQuestionId, subSection, data]);

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <div className="space-y-6">
          {/* Subsection Title - show if has subsections OR if responses with questionId */}
          {(hasSubsections && activeSubsection) || (isResponsesWithQuestionId && questionTitle) ? (
            <SubsectionTitle
              title={
                (hasSubsections && activeSubsection?.name) ||
                questionTitle ||
                "Subseção"
              }
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

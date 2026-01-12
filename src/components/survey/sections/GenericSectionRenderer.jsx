import React, { useMemo, useState } from "react";
import { SubsectionTitle } from "../widgets/SubsectionTitle";
import { SimpleBarChart, SentimentDivergentChart } from "../widgets/Charts";
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
} from "../widgets/Tables";
import { COLOR_ORANGE_PRIMARY, severityColors } from "@/lib/colors";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Resolve data path from nested object
 * @param {Object} data - Root data object
 * @param {string} path - Dot-separated path (e.g., "novaSecao.grafico.dados")
 * @returns {*} - Resolved value or null
 */
function resolveDataPath(data, path) {
  if (!data || !path) return null;

  const keys = path.split(".");
  let current = data;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Resolve template strings with {{path}} syntax
 * @param {string} template - Template string with {{path}} placeholders
 * @param {Object} data - Root data object
 * @returns {string} - Resolved string
 */
function resolveTemplate(template, data) {
  if (!template || typeof template !== "string") return template;

  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = resolveDataPath(data, path.trim());
    return value !== null && value !== undefined ? String(value) : match;
  });
}

/**
 * Render a card component based on schema
 */
function SchemaCard({ component, data, children }) {
  const title = resolveTemplate(component.title || "", data);
  const content = resolveTemplate(component.content || "", data);

  // Build className from style config
  let styleClass = component.style === "elevated" ? "card-elevated" : "";
  if (component.className) {
    styleClass = `${styleClass} ${component.className}`.trim();
  }

  // Build style object
  const styleObj = {};
  if (component.borderLeftColor) {
    styleObj.borderLeftColor =
      component.borderLeftColor === "orange"
        ? COLOR_ORANGE_PRIMARY
        : component.borderLeftColor;
  }
  if (component.styleObj) {
    Object.assign(styleObj, component.styleObj);
  }

  const useDescription = component.useDescription === true;
  const ContentWrapper = useDescription ? CardDescription : "div";
  const contentClassName = useDescription
    ? "text-base leading-relaxed space-y-3"
    : "text-muted-foreground font-normal leading-relaxed space-y-3";

  // If children are provided, render them instead of content
  const hasChildren = children && React.Children.count(children) > 0;
  const hasContent = content && content.trim() !== "";

  return (
    <Card
      className={styleClass}
      style={Object.keys(styleObj).length > 0 ? styleObj : undefined}
    >
      {title && (
        <CardHeader>
          <CardTitle className="text-xl font-bold text-card-foreground">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={component.contentClassName || ""}>
        {hasChildren ? (
          children
        ) : hasContent ? (
          <ContentWrapper className={contentClassName}>
            {content.split("\n").map((line, index) => (
              <p key={index} className={line.trim() ? "" : "h-3"}>
                {line}
              </p>
            ))}
          </ContentWrapper>
        ) : null}
      </CardContent>
    </Card>
  );
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

  const config = component.config || {};

  // Handle mobile-specific config
  const height =
    isMobile && config.heightMobile
      ? config.heightMobile
      : config.height || 256;
  const margin =
    isMobile && config.marginMobile
      ? config.marginMobile
      : config.margin || { top: 10, right: 80, left: 120, bottom: 10 };
  const yAxisWidth =
    isMobile && config.yAxisWidthMobile
      ? config.yAxisWidthMobile
      : config.yAxisWidth || 110;

  return (
    <SimpleBarChart
      data={chartData}
      dataKey={config.dataKey || "value"}
      yAxisDataKey={config.yAxisDataKey || "label"}
      height={height}
      margin={margin}
      yAxisWidth={yAxisWidth}
      fillColor={config.fillColor}
      showLabels={config.showLabels !== false}
      labelFormatter={config.labelFormatter}
      tooltipFormatter={config.tooltipFormatter}
      sortData={config.sortData !== false}
      sortDirection={config.sortDirection || "desc"}
      hideXAxis={config.hideXAxis !== false}
    />
  );
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

  const config = component.config || {};

  return (
    <SentimentDivergentChart
      data={chartData}
      height={config.height || 320}
      margin={config.margin || { top: 20, right: 30, left: 100, bottom: 20 }}
      xAxisDomain={config.xAxisDomain}
      yAxisDataKey={config.yAxisDataKey || "category"}
      yAxisWidth={config.yAxisWidth || 90}
      showGrid={config.showGrid !== undefined ? config.showGrid : false}
      showLegend={config.showLegend !== false}
      axisLine={config.axisLine !== undefined ? config.axisLine : false}
      tickLine={config.tickLine !== undefined ? config.tickLine : false}
      barSize={config.barSize}
      allowDataOverflow={config.allowDataOverflow}
      legendWrapperStyle={config.legendWrapperStyle}
      legendIconType={config.legendIconType}
      labels={config.labels}
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
 * Render a component based on its type
 */
function SchemaComponent({ component, data }) {
  // Handle wrapper components (components that wrap other components)
  if (
    component.wrapper &&
    component.components &&
    Array.isArray(component.components)
  ) {
    const ComponentWrapper = component.wrapper || "div";
    const wrapperProps = component.wrapperProps || {};
    const nestedComponents = component.components
      .sort((a, b) => {
        const indexA = a.index !== undefined ? a.index : 999;
        const indexB = b.index !== undefined ? b.index : 999;
        return indexA - indexB;
      })
      .map((comp, idx) => (
        <SchemaComponent
          key={`nested-${comp.index !== undefined ? comp.index : idx}`}
          component={comp}
          data={data}
        />
      ));

    return (
      <ComponentWrapper {...wrapperProps}>{nestedComponents}</ComponentWrapper>
    );
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
          .map((comp, idx) => (
            <SchemaComponent
              key={`nested-${comp.index !== undefined ? comp.index : idx}`}
              component={comp}
              data={data}
            />
          ));
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
    case "recommendationsTable":
      return <SchemaRecommendationsTable component={component} data={data} />;
    case "segmentationTable":
      return <SchemaSegmentationTable component={component} data={data} />;
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
 */
export function GenericSectionRenderer({ sectionId, subSection }) {
  const { data } = useSurveyData();

  // Get error messages from uiTexts with fallback
  const errorMessages = useMemo(() => {
    return {
      sectionNotFound:
        data?.uiTexts?.errors?.sectionNotFound ||
        "Seção não encontrada ou sem schema de renderização.",
      subsectionNotFound:
        data?.uiTexts?.errors?.subsectionNotFound || "Subseção não encontrada.",
      noComponents:
        data?.uiTexts?.errors?.noComponents ||
        "Nenhum componente definido para esta subseção.",
      subsectionFallback:
        data?.uiTexts?.errors?.subsectionFallback || "Subseção",
    };
  }, [data]);

  // Find section data by ID
  const sectionData = useMemo(() => {
    if (!data || !sectionId) return null;

    // Try to find section in root level
    if (data[sectionId]) {
      return data[sectionId];
    }

    // Try to find in common locations
    const commonPaths = [`sections.${sectionId}`, `data.${sectionId}`];

    for (const path of commonPaths) {
      const found = resolveDataPath(data, path);
      if (found) return found;
    }

    return null;
  }, [data, sectionId]);

  // Get render schema
  const renderSchema = sectionData?.renderSchema;

  if (!renderSchema) {
    console.warn(`No renderSchema found for section: ${sectionId}`);
    return (
      <div className="space-y-8 animate-fade-in">
        <p>{errorMessages.sectionNotFound}</p>
      </div>
    );
  }

  // Get subsections sorted by index
  const subsections = useMemo(() => {
    if (!renderSchema.subsections || !Array.isArray(renderSchema.subsections)) {
      return [];
    }

    return [...renderSchema.subsections].sort((a, b) => {
      const indexA = a.index !== undefined ? a.index : 999;
      const indexB = b.index !== undefined ? b.index : 999;
      return indexA - indexB;
    });
  }, [renderSchema.subsections]);

  // Find the active subsection
  const activeSubsection = useMemo(() => {
    if (!subSection) {
      // Return first subsection if none specified
      return subsections[0] || null;
    }

    return subsections.find((sub) => sub.id === subSection) || null;
  }, [subsections, subSection]);

  if (!activeSubsection) {
    return (
      <div className="space-y-8 animate-fade-in">
        <p>{errorMessages.subsectionNotFound}</p>
      </div>
    );
  }

  // Get components sorted by index
  const components = useMemo(() => {
    if (
      !activeSubsection.components ||
      !Array.isArray(activeSubsection.components)
    ) {
      return [];
    }

    return [...activeSubsection.components].sort((a, b) => {
      const indexA = a.index !== undefined ? a.index : 999;
      const indexB = b.index !== undefined ? b.index : 999;
      return indexA - indexB;
    });
  }, [activeSubsection.components]);

  // Get icon for subsection
  const SubsectionIcon = activeSubsection.icon
    ? getIcon(activeSubsection.icon)
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <div className="space-y-6">
          {/* Subsection Title */}
          <SubsectionTitle
            title={activeSubsection.name || errorMessages.subsectionFallback}
            icon={SubsectionIcon}
          />

          {/* Render components in order */}
          {components.length > 0 && (
            <div
              className={
                activeSubsection.componentsContainerClassName || "grid gap-6"
              }
            >
              {components.map((component, idx) => (
                <SchemaComponent
                  key={`component-${
                    component.index !== undefined ? component.index : idx
                  }`}
                  component={component}
                  data={data}
                />
              ))}
            </div>
          )}

          {components.length === 0 && (
            <p className="text-muted-foreground">
              {errorMessages.noComponents}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

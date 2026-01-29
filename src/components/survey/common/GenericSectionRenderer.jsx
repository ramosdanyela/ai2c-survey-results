import React, { useMemo } from "react";
import { logger } from "@/utils/logger";
import { SubsectionTitle } from "../widgets/SubsectionTitle";
import { wrapWithTooltip } from "./tooltipDataSourceApi";
import { SchemaCard } from "./CardRenderers";
import { renderComponent } from "./ComponentRegistry";
import { getIcon } from "@/lib/icons";
import { useSurveyData } from "@/hooks/useSurveyData";
import { enrichComponentWithStyles } from "@/services/styleResolver";
import { breakLinesAfterPeriod } from "@/lib/utils";
import { resolveDataPath, getQuestionsFromData } from "@/services/dataResolver";

/**
 * Decide se o componente deve ser exibido. Lógica no código (não em condition no JSON).
 * - responses: por tipo e dados da questão (barChart, sentimentStackedChart, etc.).
 */
function shouldShowComponent(component, data) {
  // responses: visibilidade por tipo de componente e dados da questão
  if (data?.question) {
    const q = data.question;
    switch (component.type) {
      case "barChart":
        // Verificar apenas se há dados, sem filtrar por ID
        return !!q.data;
      case "sentimentStackedChart":
        // Para questões open-ended, sentimentData está dentro de question.data
        return !!q.data?.sentimentData || !!q.sentimentData;
      default:
        return true;
    }
  }
  return true;
}

/**
 * Render a component based on its type from JSON config
 */
function ComponentRenderer({
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
    // Use type: "h3"/"h4" for headings, otherwise "div"
    const wrapper =
      component.type === "h3" || component.type === "h4"
        ? component.type
        : "div";
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

      // Use layout or className from component config
      if (component.layout === "after-chart" || component.className) {
        return component.className || "mt-4";
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

    // Special case for h3 with "Respostas" text (can be overridden by className in wrapperProps)
    if (wrapper === "h3" && !wrapperProps.className) {
      const resolvedText = component.text || component.content || "";
      if (
        resolvedText &&
        (resolvedText.includes("Respostas") ||
          resolvedText.includes("responses"))
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
    // Use type: "h3"/"h4" for headings, otherwise "div"
    const wrapper =
      component.type === "h3" || component.type === "h4"
        ? component.type
        : "div";

    // Color indicator wrapper for sentiment legend
    // Detected by: empty div wrapper with no children, inside sentiment impact section
    // Structure: parent div has 2 children: empty div (this) + span with label
    if (
      wrapper === "div" &&
      component.components &&
      component.components.length === 0
    ) {
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
    }

    return null;
  }

  // Handle heading components (type: "h3"/"h4")
  const isHeadingComponent = component.type === "h3" || component.type === "h4";

  if (isHeadingComponent) {
    // Use type as wrapper tag
    const wrapperTag = component.type;
    const wrapperProps = component.wrapperProps || {};
    const ComponentWrapper = wrapperTag;

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
          try {
            const rendered = (
              <ComponentRenderer
                key={uniqueKey}
                component={comp}
                data={data}
                subSection={subSection}
                isExport={isExport}
                exportWordCloud={exportWordCloud}
              />
            );
            // Garante que o resultado é um elemento React válido
            if (rendered && React.isValidElement(rendered)) {
              return rendered;
            }
            logger.warnCritical(
              `ComponentRenderer retornou valor inválido para ${comp.type} no heading:`,
              rendered,
            );
            return null;
          } catch (err) {
            logger.error(
              `Erro ao renderizar componente ${comp.type} no heading:`,
              err,
            );
            return null;
          }
        })
        .filter((item) => {
          // Remove apenas null e undefined - permite elementos React válidos e valores primitivos
          if (item === null || item === undefined) return false;
          // Se for um elemento React válido, mantém
          if (React.isValidElement(item)) return true;
          // Permite valores primitivos (string, number, boolean)
          if (typeof item !== "object") return true;
          // Se for um objeto que não é um elemento React válido, remove silenciosamente
          return false;
        });

      return wrapWithTooltip(
        component,
        isExport,
        <ComponentWrapper {...finalWrapperProps}>
          {nestedComponents}
        </ComponentWrapper>,
      );
    }

    // If wrapper has text, render it
    if (component.text || component.content) {
      const rawText = component.text || component.content || "";
      const resolvedText = breakLinesAfterPeriod(rawText);
      // Handle multi-line text like summary
      if (resolvedText.includes("\n")) {
        return wrapWithTooltip(
          component,
          isExport,
          <ComponentWrapper {...finalWrapperProps}>
            {resolvedText.split("\n").map((line, index) => (
              <p key={index} className={line.trim() ? "" : "h-3"}>
                {line}
              </p>
            ))}
          </ComponentWrapper>,
        );
      }
      return wrapWithTooltip(
        component,
        isExport,
        <ComponentWrapper {...finalWrapperProps}>
          {resolvedText}
        </ComponentWrapper>,
      );
    }

    // Empty wrapper
    return wrapWithTooltip(
      component,
      isExport,
      <ComponentWrapper {...finalWrapperProps} />,
    );
  }

  // Casos especiais que precisam de lógica customizada antes do registry
  if (component.type === "grid-container") {
    // div com layout em grid explícito (className)
    const className = component.className || "grid gap-6 md:grid-cols-2";
    const nested = (component.components || [])
      .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
      .map((comp, idx) => {
        const parentKey =
          component.index !== undefined ? component.index : "grid";
        const childKey = comp.index !== undefined ? comp.index : idx;
        const childType = comp.type || "unknown";
        try {
          const rendered = (
            <ComponentRenderer
              key={`nested-${parentKey}-${childKey}-${childType}-${idx}`}
              component={comp}
              data={data}
              subSection={subSection}
              isExport={isExport}
              exportWordCloud={exportWordCloud}
            />
          );
          // Garante que o resultado é um elemento React válido
          if (rendered && React.isValidElement(rendered)) {
            return rendered;
          }
          logger.warnCritical(
            `ComponentRenderer retornou valor inválido para ${comp.type}:`,
            rendered,
          );
          return null;
        } catch (err) {
          logger.error(
            `Erro ao renderizar componente ${comp.type} no grid-container:`,
            err,
          );
          return null;
        }
      })
      .filter((item) => {
        // Remove apenas null e undefined - permite elementos React válidos e valores primitivos
        if (item === null || item === undefined) return false;
        // Se for um elemento React válido, mantém
        if (React.isValidElement(item)) return true;
        // Permite valores primitivos (string, number, boolean)
        if (typeof item !== "object") return true;
        // Se for um objeto que não é um elemento React válido, remove e loga
        // Removendo objeto inválido do array - comportamento esperado
        return false;
      });
    return wrapWithTooltip(
      component,
      isExport,
      <div className={className}>{nested}</div>,
    );
  }

  if (component.type === "container") {
    // div sem grid explícito; o layout é inferido pelos filhos (ex.: 2 cards → grid 2 colunas)
    // Se o container tem className definido, use-o; caso contrário, infira do número de filhos
    let containerClassName = component.className;

    if (!containerClassName) {
      // Tenta obter className da função getWrapperClassName
      containerClassName = getWrapperClassName(component, data);

      // Se ainda não tiver className e tiver 2 cards, aplica grid automático
      if (
        !containerClassName &&
        component.components &&
        component.components.length === 2
      ) {
        const allCards = component.components.every((c) => c.type === "card");
        if (allCards) {
          containerClassName = "grid gap-6 md:grid-cols-2";
        }
      }
    }

    const wrapperStyle = getWrapperStyle(component, data);
    const nested = (component.components || [])
      .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
      .map((comp, idx) => {
        const parentKey =
          component.index !== undefined ? component.index : "container";
        const childKey = comp.index !== undefined ? comp.index : idx;
        const childType = comp.type || "unknown";
        try {
          const rendered = (
            <ComponentRenderer
              key={`nested-${parentKey}-${childKey}-${childType}-${idx}`}
              component={comp}
              data={data}
              subSection={subSection}
              isExport={isExport}
              exportWordCloud={exportWordCloud}
            />
          );
          // Garante que o resultado é um elemento React válido
          if (rendered && React.isValidElement(rendered)) {
            return rendered;
          }
          logger.warnCritical(
            `ComponentRenderer retornou valor inválido para ${comp.type}:`,
            rendered,
          );
          return null;
        } catch (err) {
          logger.error(
            `Erro ao renderizar componente ${comp.type} no container:`,
            err,
          );
          return null;
        }
      })
      .filter((item) => {
        // Remove apenas null e undefined - permite elementos React válidos e valores primitivos
        if (item === null || item === undefined) return false;
        // Se for um elemento React válido, mantém
        if (React.isValidElement(item)) return true;
        // Permite valores primitivos (string, number, boolean)
        if (typeof item !== "object") return true;
        // Se for um objeto que não é um elemento React válido, remove e loga
        // Removendo objeto inválido do array - comportamento esperado
        return false;
      });
    return wrapWithTooltip(
      component,
      isExport,
      <div
        className={containerClassName || ""}
        style={wrapperStyle || undefined}
      >
        {nested}
      </div>,
    );
  }

  if (component.type === "card") {
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
            <ComponentRenderer
              key={uniqueKey}
              component={comp}
              data={data}
              subSection={subSection}
              isExport={isExport}
              exportWordCloud={exportWordCloud}
            />
          );
        });
      return wrapWithTooltip(
        component,
        isExport,
        <SchemaCard component={component} data={data}>
          {nestedComponents}
        </SchemaCard>,
      );
    }
    return wrapWithTooltip(
      component,
      isExport,
      <SchemaCard component={component} data={data} />,
    );
  }

  // Usa o Component Registry para todos os outros tipos
  try {
    const rendered = renderComponent(component, data, {
      subSection,
      isExport,
      exportWordCloud,
      renderComponentRenderer: (comp, idx) => (
        <ComponentRenderer
          key={`nested-${comp.index !== undefined ? comp.index : idx}-${comp.type || "unknown"}-${idx}`}
          component={comp}
          data={data}
          subSection={subSection}
          isExport={isExport}
          exportWordCloud={exportWordCloud}
        />
      ),
    });

    if (rendered) {
      // Valida se é um elemento React válido
      if (React.isValidElement(rendered)) {
        return rendered;
      }
      // Se não for um elemento válido mas não for null, loga o problema
      if (rendered !== null && rendered !== undefined) {
        logger.warnCritical(
          `Component ${component.type} retornou valor inválido:`,
          rendered,
        );
      }
      // Retorna null se não houver dados (comportamento esperado para tabelas sem dados)
      return null;
    }
  } catch (error) {
    logger.error(`Erro ao renderizar componente ${component.type}:`, error, {
      component,
      dataPath: component.dataPath,
      hasData: !!data,
    });
    // Retorna um elemento de erro em vez de quebrar a aplicação
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          Erro ao renderizar {component.type}
        </p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  // Se chegou aqui, o tipo não foi encontrado
  logger.warnCritical(`Unknown component type: ${component.type || "none"}`);
  return null;
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

  // Get section from sections array (must be defined before sectionData)
  const section = useMemo(() => {
    if (!data?.sections) return null;
    return data.sections.find((s) => s.id === sectionId) || null;
  }, [data, sectionId]);

  // Find section data by ID
  const sectionData = useMemo(() => {
    if (!data || !sectionId) return null;

    // Se a seção tem subseções cujos ids seguem "{sectionId}-*", monta sectionData a partir de subsection.data
    if (section?.subsections?.length > 0) {
      const prefix = `${sectionId}-`;
      const allHavePrefix = section.subsections.every(
        (sub) => sub.id && sub.id.startsWith(prefix),
      );
      if (allHavePrefix) {
        return section.subsections.reduce((acc, sub) => {
          if (sub.data && sub.id?.startsWith(prefix)) {
            acc[sub.id.replace(prefix, "")] = sub.data;
          }
          return acc;
        }, {});
      }
    }

    // Special handling for responses section: include questions directly in sectionData
    if (sectionId === "responses") {
      const responsesData = {};

      // Include questions if they exist directly in section
      if (section?.questions && Array.isArray(section.questions)) {
        responsesData.questions = section.questions;
      }

      // Also include section.data if it exists (for uiTexts, etc.)
      if (section?.data) {
        Object.assign(responsesData, section.data);
        // Ensure questions from section.questions takes precedence
        if (section.questions && Array.isArray(section.questions)) {
          responsesData.questions = section.questions;
        }
      }

      // If we have questions, return the data object
      if (responsesData.questions || Object.keys(responsesData).length > 0) {
        return responsesData;
      }
    }

    // Priority 1: section.data
    if (section?.data) {
      return section.data;
    }

    // Priority 2: dataPath configured in section
    if (section?.dataPath) {
      const resolved = resolveDataPath(data, section.dataPath);
      if (resolved) return resolved;
    }

    return null;
  }, [data, sectionId, section]);

  // Get subsections sorted by index
  // Components directly in subsections[].components
  const subsections = useMemo(() => {
    // Priority 1: Use fixed subsections from section if available
    if (section?.subsections && Array.isArray(section.subsections)) {
      // Process subsections with components directly in subsection
      const processedSubsections = section.subsections
        .sort((a, b) => (a.index || 0) - (b.index || 0))
        .map((subsection) => {
          // Components directly in subsection
          if (subsection.components && Array.isArray(subsection.components)) {
            // Return subsection with components preserved
            return {
              ...subsection,
              components: [...subsection.components], // Ensure components array is preserved
            };
          }

          // No components found - return subsection as-is (navigation only)
          return subsection;
        });

      return processedSubsections;
    }

    // Priority 2: Dynamic generation for responses (always works, even if hasSubsections is false)
    // This matches the behavior in SurveySidebar.getDynamicSubsections
    if (sectionId === "responses") {
      const questions = getQuestionsFromData(data).sort(
        (a, b) => (a.index || 0) - (b.index || 0),
      );

      // Use components from section
      const baseComponents = section?.components || [];

      return questions.map((question) => ({
        id: `responses-${question.id}`,
        name: question.question,
        index: question.index ?? 999,
        question: question, // Keep full question object for special rendering
        // Use components from section for each question subsection
        components: baseComponents.length > 0 ? baseComponents : undefined,
      }));
    }

    return [];
  }, [sectionId, data, section, sectionData]);

  // Derive hasSubsections from subsections array (simpler and more reliable)
  const hasSubsections = subsections.length > 0;

  // Find the active subsection
  const activeSubsection = useMemo(() => {
    if (!subSection) {
      // Special handling for responses: when no subSection is specified,
      // don't return the first subsection automatically - we want to show the questions list
      if (sectionId === "responses") {
        return null;
      }
      // Return first subsection if none specified (for other sections)
      return subsections[0] || null;
    }

    // Try exact match first (this will work for dynamic subsections like "responses-1")
    let found = subsections.find((sub) => sub.id === subSection);

    // Subsection not found - expected in some cases

    return found || null;
  }, [subsections, subSection, sectionId]);

  // Get components sorted by index and enriched with styles
  // Components directly in section.components or subsection.components
  const components = useMemo(() => {
    let rawComponents = [];

    // If no subsections, get components from section directly
    if (!hasSubsections) {
      // Components directly in section
      if (section?.components && Array.isArray(section.components)) {
        rawComponents = [...section.components];
      } else {
        return [];
      }
    } else {
      // With subsections, get from activeSubsection
      // Special handling for responses section: if activeSubsection has a question object,
      // use the questionType template instead of components from config
      if (!activeSubsection) {
        return [];
      }

      if (sectionId === "responses" && activeSubsection.question) {
        const questionsListComponent = {
          type: "questionsList",
          index: 0,
          dataPath: "sectionData",
          config: {},
        };
        rawComponents = [questionsListComponent];
      } else {
        // Normal case: use components from activeSubsection
        if (
          !activeSubsection?.components ||
          !Array.isArray(activeSubsection.components)
        ) {
          return [];
        }
        rawComponents = [...activeSubsection.components];
      }
    }

    if (sectionId === "responses") {
      // Filter out any existing filterPills from JSON to avoid duplicates
      rawComponents = rawComponents.filter(
        (comp) => comp.type !== "filterPills",
      );

      // Find the index of the first questionsList component
      const questionsListIndex = rawComponents.findIndex(
        (comp) => comp.type === "questionsList",
      );

      // Create filterPills component
      // FilterPills must appear right after SurveyHeader, before QuestionsList
      const filterPillsComponent = {
        type: "filterPills",
        index: questionsListIndex >= 0 ? questionsListIndex - 1 : -1, // Always before questionsList
        config: {},
      };

      // Insert filterPills before questionsList, or at the beginning if no questionsList found
      if (questionsListIndex >= 0) {
        rawComponents.splice(questionsListIndex, 0, filterPillsComponent);
      } else {
        rawComponents.unshift(filterPillsComponent);
      }
    }

    // Sort by index
    const sorted = rawComponents.sort((a, b) => {
      const indexA = a.index !== undefined ? a.index : 999;
      const indexB = b.index !== undefined ? b.index : 999;
      return indexA - indexB;
    });

    // Enriquece componentes com estilos (aplica cardStyleVariant)
    return sorted.map((component) => enrichComponentWithStyles(component));
  }, [
    activeSubsection,
    activeSubsection?.components,
    activeSubsection?.question,
    hasSubsections,
    section?.components,
    sectionId,
  ]);

  // Merge section-specific uiTexts into data context
  const enhancedData = useMemo(() => {
    if (!data) {
      logger.error("GenericSectionRenderer: data is null/undefined");
      return { uiTexts: {} };
    }

    // CRITICAL: Always preserve uiTexts from data
    // Start with data spread, but ensure uiTexts is explicitly preserved
    let enhanced = { ...data };

    // If data has uiTexts, use it; otherwise create empty object
    // This ensures uiTexts is always an object (never undefined)
    if (!enhanced.uiTexts) {
      enhanced.uiTexts = data?.uiTexts || {};
    }

    // Add sectionData to context for relative paths (sectionData.*)
    // Always add sectionData, even if empty, to prevent errors in components
    enhanced.sectionData = sectionData || {};

    // Use uiTexts from root only (no section-specific uiTexts)
    enhanced.uiTexts = data?.uiTexts || {};

    // Add export mode state to data for QuestionsList and FilterPills
    if (isExport) {
      enhanced._exportMode = true;
      enhanced._exportWordCloud = exportWordCloud;
    }

    // Special handling for responses section: if a specific question is selected,
    // add the question object to enhancedData so components can access it
    if (sectionId === "responses" && activeSubsection?.question) {
      enhanced.question = activeSubsection.question;
    }

    // Debug: verify uiTexts is present in final enhancedData
    if (!enhanced.uiTexts) {
      logger.error("GenericSectionRenderer: enhancedData missing uiTexts!", {
        sectionId,
        subSection,
        hasData: !!data,
        hasDataUiTexts: !!data?.uiTexts,
        dataKeys: data ? Object.keys(data) : [],
        enhancedKeys: Object.keys(enhanced),
      });
    }

    return enhanced;
  }, [
    data,
    sectionId,
    subSection,
    section,
    sectionData,
    isExport,
    exportWordCloud,
    activeSubsection,
  ]);

  // Early validation: if no section and not responses, can't render
  if (!section && sectionId !== "responses") {
    logger.warnCritical(`Section config not found for section: ${sectionId}`);
    return (
      <div className="space-y-8 animate-fade-in">
        <p>Seção não encontrada: {sectionId}</p>
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

  // Special handling for responses section: if no subSection specified, render questionsList at root
  // This handles the case where the section has questions but no specific subsection is selected
  // For "responses" section, when no subSection is specified, we want to show all questions in a list,
  // not the first question as a subsection
  if (sectionId === "responses" && !subSection && !isExport) {
    const questions = getQuestionsFromData(data);
    if (questions.length > 0) {
      const questionsListComponent = {
        type: "questionsList",
        index: 0,
        dataPath: "sectionData",
        config: {},
      };

      // Also add filterPills before questionsList
      const filterPillsComponent = {
        type: "filterPills",
        index: 0,
        config: {},
      };

      return (
        <div className="space-y-8 animate-fade-in">
          <section>
            <div className="space-y-6">
              {renderComponent(filterPillsComponent, enhancedData, {
                subSection,
                isExport,
                exportWordCloud,
              })}
              {renderComponent(questionsListComponent, enhancedData, {
                subSection,
                isExport,
                exportWordCloud,
              })}
            </div>
          </section>
        </div>
      );
    }
  }

  // If has subsections, require activeSubsection (unless it's responses with questionId or responses without subSection)
  // Special case: for responses section, when no subSection is specified, we want to show the questions list,
  // so we allow hasSubsections=true with activeSubsection=null
  const isResponsesWithoutSubSection = sectionId === "responses" && !subSection;

  if (
    hasSubsections &&
    !activeSubsection &&
    !isResponsesWithQuestionId &&
    !isResponsesWithoutSubSection
  ) {
    // Subsection not found - expected in some cases (e.g., loading state)
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
    // For subsections, use grid layout
    if (activeSubsection) {
      containerClassName = "grid gap-6";
    }
  } else {
    // For sections without subsections, use space-y-6
    containerClassName = "space-y-6";
  }

  // Special handling for responses section: when showing an individual question,
  // don't use SubsectionTitle - use the old question structure instead
  const isResponsesQuestion =
    sectionId === "responses" && activeSubsection?.question;

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <div className="space-y-6">
          {/* Subsection Title - show only if has subsections and activeSubsection exists */}
          {/* For responses section with individual question: use old question structure (no SubsectionTitle) */}
          {/* For other sections or responses without question: use SubsectionTitle */}
          {hasSubsections && activeSubsection && !isResponsesQuestion ? (
            <SubsectionTitle
              title={activeSubsection?.name || "Subseção"}
              icon={SubsectionIcon}
              summary={activeSubsection?.summary}
            />
          ) : null}

          {/* For responses section: Don't show individual question title/summary */}
          {/* QuestionsList will handle showing all questions with accordions */}
          {/* The selected question will be opened automatically via questionId prop */}

          {/* For responses section: ALWAYS render FilterPills before components */}
          {/* FilterPills must appear right after SurveyHeader, before QuestionsList */}
          {/* This ensures FilterPills is always visible, even when a specific question is selected */}
          {sectionId === "responses" &&
            !isExport &&
            (() => {
              const hasFilterPills = components.some(
                (c) => c.type === "filterPills",
              );
              if (!hasFilterPills) {
                const filterPillsComponent = {
                  type: "filterPills",
                  index: -1, // Render before all other components
                  config: {},
                };
                return (
                  <div
                    key={`${sectionId}-${subSection || "root"}-filterPills-auto`}
                    className="mb-6"
                  >
                    <ComponentRenderer
                      component={filterPillsComponent}
                      data={enhancedData}
                      subSection={subSection}
                      isExport={isExport}
                      exportWordCloud={exportWordCloud}
                    />
                  </div>
                );
              }
              return null;
            })()}

          {/* Render components in order */}
          {components.length > 0 && (
            <div className={containerClassName}>
              {components.map((component, idx) => {
                // In export mode, hide filterPills component
                if (isExport && component.type === "filterPills") {
                  return null;
                }

                // Generate unique key: sectionId + subSection + component index + array idx + component type
                const componentIndex =
                  component.index !== undefined ? component.index : idx;
                const componentType = component.type || "unknown";
                const uniqueKey = `${sectionId}-${subSection || "root"}-${componentIndex}-${componentType}-${idx}`;

                return (
                  <ComponentRenderer
                    key={uniqueKey}
                    component={component}
                    data={enhancedData}
                    subSection={subSection}
                    isExport={isExport}
                    exportWordCloud={exportWordCloud}
                  />
                );
              })}

              {/* For responses section without subsections: automatically render questionsList if not present */}
              {sectionId === "responses" &&
                !hasSubsections &&
                !isExport &&
                (() => {
                  const hasQuestionsList = components.some(
                    (c) => c.type === "questionsList",
                  );
                  const questions = getQuestionsFromData(data);

                  if (!hasQuestionsList && questions.length > 0) {
                    const questionsListComponent = {
                      type: "questionsList",
                      index: 999, // Render after filterPills
                      dataPath: "sectionData",
                      config: {},
                    };

                    return (
                      <React.Fragment
                        key={`${sectionId}-${subSection || "root"}-auto-questionsList`}
                      >
                        {renderComponent(questionsListComponent, enhancedData, {
                          subSection,
                          isExport,
                          exportWordCloud,
                        })}
                      </React.Fragment>
                    );
                  }
                  return null;
                })()}
            </div>
          )}

          {/* For responses section: render questionsList even if no components or when hasSubsections but no activeSubsection */}
          {sectionId === "responses" &&
            !isExport &&
            ((!hasSubsections && components.length === 0) ||
              (hasSubsections &&
                !activeSubsection &&
                components.length === 0)) &&
            (() => {
              const questions = getQuestionsFromData(data);
              if (questions.length > 0) {
                // Add filterPills before questionsList
                const filterPillsComponent = {
                  type: "filterPills",
                  index: 0,
                  config: {},
                };

                const questionsListComponent = {
                  type: "questionsList",
                  index: 1,
                  dataPath: "sectionData",
                  config: {},
                };

                return (
                  <div className={containerClassName}>
                    {renderComponent(filterPillsComponent, enhancedData, {
                      subSection,
                      isExport,
                      exportWordCloud,
                    })}
                    {renderComponent(questionsListComponent, enhancedData, {
                      subSection,
                      isExport,
                      exportWordCloud,
                    })}
                  </div>
                );
              }
              return (
                <p className="text-muted-foreground">
                  Nenhum componente definido para esta{" "}
                  {hasSubsections ? "subseção" : "seção"}.
                </p>
              );
            })()}

          {sectionId !== "responses" && components.length === 0 && (
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

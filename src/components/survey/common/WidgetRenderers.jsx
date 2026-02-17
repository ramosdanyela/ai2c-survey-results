import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CheckSquare,
  CircleDot,
  FileText,
  TrendingUp,
  Cloud,
} from "@/lib/icons";
import { COLOR_ORANGE_PRIMARY } from "@/lib/colors";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WordCloud } from "../widgets/WordCloud";
import { QuestionsList } from "./QuestionsList";
import { breakLinesAfterPeriod } from "@/lib/utils";
import { resolveDataPath, getQuestionsFromData } from "@/services/dataResolver";
import { useQuestionTypeFilter } from "@/hooks/useQuestionTypeFilter";

/**
 * Render filter pills component based on schema
 * Renders question type filter badges and word cloud toggle
 * Shares state with QuestionsList via data context
 * All styling is hardcoded - no config needed
 */
export function SchemaFilterPills({ component, data }) {
  // Use unified hook for question type filter and word cloud
  const {
    questionTypeFilter,
    setQuestionTypeFilter,
    showWordCloud,
    setShowWordCloud,
  } = useQuestionTypeFilter({
    data,
    initialQuestionTypeFilter: "all",
    initialShowWordCloud: true,
  });

  // Get texts from sectionData.uiTexts (section-specific) or root uiTexts (global)
  // Priority: sectionData.uiTexts > root uiTexts.responseDetails
  const sectionUiTexts = data?.sectionData?.uiTexts || {};
  const rootUiTexts = resolveDataPath(data, "uiTexts") || {};

  // For responses section, texts are directly in sectionData.uiTexts (all, open-ended, etc.)
  // But also check root uiTexts.responseDetails for backward compatibility
  const uiTexts = {
    ...rootUiTexts,
    responseDetails: {
      ...rootUiTexts?.responseDetails,
      ...sectionUiTexts, // sectionData.uiTexts has the texts directly (all, open-ended, nps, wordCloud, etc.)
    },
  };

  const config = component.config || {};

  // Get all questions and determine available types
  const questions = getQuestionsFromData(data);

  // Get unique question types from available questions
  const availableTypes = new Set(
    questions.map((q) => q.questionType).filter(Boolean),
  );

  // Verificar se há questões do tipo "open-ended" (campo aberto)
  // Todas as questões open-ended podem ter wordCloud no template (questionTemplates.js)
  // O toggle deve aparecer sempre que houver questões do tipo "open-ended"
  const hasOpenEndedQuestions = questions.some(
    (q) => q.questionType === "open-ended",
  );

  // Mostrar toggle de WordCloud sempre que houver questões do tipo "open-ended"
  const showWordCloudToggle = hasOpenEndedQuestions;

  // Initialize _filterPillsState handlers (hook already manages state and updates _filterPillsState)
  // This effect just ensures handlers are set for backward compatibility
  useEffect(() => {
    if (data && typeof data === "object" && !Array.isArray(data)) {
      if (!data._filterPillsState) {
        data._filterPillsState = {};
      }
      // Set handlers from hook (hook setters already update _filterPillsState)
      data._filterPillsState.setQuestionTypeFilter = setQuestionTypeFilter;
      data._filterPillsState.setShowWordCloud = setShowWordCloud;
      // Backward compatibility
      data._filterPillsState.setQuestionFilter = setQuestionTypeFilter;
      // Sync current values (hook already keeps these in sync)
      data._filterPillsState.questionTypeFilter = questionTypeFilter;
      data._filterPillsState.showWordCloud = showWordCloud;
      // Backward compatibility
      data._filterPillsState.questionFilter = questionTypeFilter;
    }
  }, [
    data,
    questionTypeFilter,
    showWordCloud,
    setQuestionTypeFilter,
    setShowWordCloud,
  ]);

  // Define filter badge configurations
  const filterBadges = [
    {
      type: "open-ended",
      icon: FileText,
      label:
        sectionUiTexts?.["open-ended"] ||
        rootUiTexts?.responseDetails?.["open-ended"] ||
        "Campo Aberto",
    },
    {
      type: "multiple-choice",
      icon: CheckSquare,
      label:
        sectionUiTexts?.["multiple-choice"] ||
        rootUiTexts?.responseDetails?.["multiple-choice"] ||
        "Múltipla Escolha",
    },
    {
      type: "single-choice",
      icon: CircleDot,
      label:
        sectionUiTexts?.["single-choice"] ||
        rootUiTexts?.responseDetails?.["single-choice"] ||
        "Escolha única",
    },
    {
      type: "nps",
      icon: TrendingUp,
      label: sectionUiTexts?.nps || rootUiTexts?.responseDetails?.nps || "NPS",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6">
      <Badge
        variant={questionTypeFilter === "all" ? "default" : "outline"}
        className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full ${
          questionTypeFilter === "all"
            ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
            : ""
        }`}
        onClick={() => setQuestionTypeFilter("all")}
      >
        {sectionUiTexts?.all || rootUiTexts?.responseDetails?.all || "Todos"}
      </Badge>
      {/* Only show filter badges for question types that exist in the data */}
      {filterBadges
        .filter((badge) => availableTypes.has(badge.type))
        .map((badge) => {
          const Icon = badge.icon;
          return (
            <Badge
              key={badge.type}
              variant={
                questionTypeFilter === badge.type ? "default" : "outline"
              }
              className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
                questionTypeFilter === badge.type
                  ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                  : ""
              }`}
              onClick={() => setQuestionTypeFilter(badge.type)}
            >
              <Icon className="w-3 h-3" />
              {badge.label}
            </Badge>
          );
        })}
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
export function SchemaWordCloud({
  component,
  data,
  exportWordCloud = true,
  isExport = false,
}) {
  // Use unified hook for word cloud state
  const { showWordCloud } = useQuestionTypeFilter({
    data,
    initialShowWordCloud: exportWordCloud,
  });

  // Check if wordCloud should be shown
  // Priority: 1) data.showWordCloud (from context), 2) hook value, 3) exportWordCloud prop
  const shouldShowWordCloud = useMemo(() => {
    // First check if showWordCloud is directly in data (from context)
    if (data?.showWordCloud !== undefined) {
      return data.showWordCloud;
    }
    // Then use hook value (which reads from _filterPillsState)
    if (showWordCloud !== undefined) {
      return showWordCloud;
    }
    // Fallback to exportWordCloud prop
    return exportWordCloud;
  }, [data?.showWordCloud, showWordCloud, exportWordCloud]);

  // If showWordCloud is false, don't render
  if (!shouldShowWordCloud) {
    return null;
  }

  const wordCloudData = resolveDataPath(
    data,
    component.dataPath,
    component.data,
  );
  const uiTexts = resolveDataPath(data, "uiTexts");

  if (!wordCloudData || !Array.isArray(wordCloudData)) {
    return null;
  }

  const config = component.config || {};
  const title =
    uiTexts?.responseDetails?.wordCloud ||
    config.title ||
    "Nuvem de Palavras";

  return (
    <div>
      {title && (
        <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Cloud className="w-4 h-4" style={{ color: COLOR_ORANGE_PRIMARY }} />
          {title}
        </h4>
      )}
      <div
        className={`flex justify-center items-center p-6 bg-muted/30 rounded-lg min-h-[200px] ${isExport ? "export-word-cloud-wrapper" : ""}`.trim()}
      >
        <WordCloud
          words={wordCloudData}
          maxWords={config.maxWords || 15}
          config={{
            // Permite sobrescrever configurações do JSON, com defaults estilo imagem
            colorScheme: config.colorScheme || "image-style",
            minFontSize: config.minFontSize || 14,
            maxFontSize: config.maxFontSize || 56,
            enableShadows:
              config.enableShadows !== undefined ? config.enableShadows : false,
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
 * Render accordion component based on schema
 * @param {Object} component - Component schema
 * @param {Object} data - Data context
 * @param {Function} renderSchemaComponent - Function to render nested SchemaComponent (to avoid circular dependency)
 */
export function SchemaAccordion({ component, data, renderSchemaComponent }) {
  const [openValue, setOpenValue] = useState(
    component.defaultValue || undefined,
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
    // No items or components - expected in some cases
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
          .map((comp, idx) => {
            if (!renderSchemaComponent) {
              logger.error(
                "SchemaAccordion: renderSchemaComponent is required but not provided",
              );
              return null;
            }
            return renderSchemaComponent(comp, idx);
          });

        const trigger = item.trigger || item.title || `Item ${index + 1}`;

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
                item.textClassName || config.textClassName || "px-6 pb-6"
              }
            >
              {nestedComponents.length > 0
                ? nestedComponents
                : (() => {
                    const text = breakLinesAfterPeriod(item.text || "");
                    if (!text) return null;
                    if (text.includes("\n")) {
                      return (
                        <div className="space-y-3">
                          {text.split("\n").map((line, i) => (
                            <p key={i} className={line.trim() ? "" : "h-3"}>
                              {line}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return text;
                  })()}
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
export function SchemaQuestionsList({
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

  // Use sectionData if dataPath is not specified
  const dataPath =
    component.dataPath || (data.sectionData ? "sectionData" : null);
  const config = component.config || {};

  // Get filter state - use hook for unified state management
  // In export mode, create simple state; otherwise use hook which reads from _filterPillsState
  const {
    questionTypeFilter,
    setQuestionTypeFilter,
    showWordCloud,
    setShowWordCloud,
  } = useQuestionTypeFilter({
    data,
    initialQuestionTypeFilter: isExport && questionId ? null : "all",
    initialShowWordCloud: isExport ? exportWordCloud : true,
  });

  // Create filterState object for QuestionsList (with backward compatibility)
  const filterState = {
    questionTypeFilter: isExport && questionId ? null : questionTypeFilter,
    setQuestionTypeFilter: isExport ? () => {} : setQuestionTypeFilter,
    showWordCloud: isExport ? exportWordCloud : showWordCloud,
    setShowWordCloud: isExport ? () => {} : setShowWordCloud,
    // Backward compatibility
    questionFilter: isExport && questionId ? null : questionTypeFilter,
    setQuestionFilter: isExport ? () => {} : setQuestionTypeFilter,
  };

  return (
    <QuestionsList
      questionId={questionId}
      dataPath={dataPath}
      hideFilterPills={isExport}
      externalFilterState={filterState}
      data={data} // Pass enhancedData (with sectionData injected)
      isExport={isExport}
      exportWordCloud={exportWordCloud}
    />
  );
}

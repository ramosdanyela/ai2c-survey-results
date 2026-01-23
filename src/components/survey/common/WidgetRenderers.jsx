import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckSquare, CircleDot, FileText, TrendingUp, Cloud } from "@/lib/icons";
import { COLOR_ORANGE_PRIMARY } from "@/lib/colors";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WordCloud } from "../widgets/WordCloud";
import { QuestionsList } from "./QuestionsList";
import { resolveDataPath, resolveTemplate, getQuestionsFromData } from "@/services/dataResolver";

/**
 * Render filter pills component based on schema
 * Renders question type filter badges and word cloud toggle
 * Shares state with QuestionsList via data context
 * All styling is hardcoded - no config needed
 */
export function SchemaFilterPills({ component, data }) {
  const [questionFilter, setQuestionFilter] = useState("all");
  const [showWordCloud, setShowWordCloud] = useState(true);

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
  
  // Verificar se há questões do tipo "open-ended" que têm wordCloud
  // Apenas questões open-ended têm wordCloud no template (questionTemplates.js)
  const questions = getQuestionsFromData(data);
  const hasWordCloudQuestions = questions.some(
    (q) => q.type === "open-ended" && q.data?.wordCloud
  );
  
  // Padrão: true, mas só mostrar se houver questões com wordCloud
  const showWordCloudToggle = hasWordCloudQuestions;

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
        variant={questionFilter === "open-ended" ? "default" : "outline"}
        className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
          questionFilter === "open-ended"
            ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
            : ""
        }`}
        onClick={() => setQuestionFilter("open-ended")}
      >
        <FileText className="w-3 h-3" />
        {sectionUiTexts?.["open-ended"] ||
          rootUiTexts?.responseDetails?.["open-ended"] ||
          "Campo Aberto"}
      </Badge>
      <Badge
        variant={questionFilter === "multiple-choice" ? "default" : "outline"}
        className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
          questionFilter === "multiple-choice"
            ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
            : ""
        }`}
        onClick={() => setQuestionFilter("multiple-choice")}
      >
        <CheckSquare className="w-3 h-3" />
        {sectionUiTexts?.["multiple-choice"] ||
          rootUiTexts?.responseDetails?.["multiple-choice"] ||
          "Múltipla Escolha"}
      </Badge>
      <Badge
        variant={questionFilter === "single-choice" ? "default" : "outline"}
        className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
          questionFilter === "single-choice"
            ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
            : ""
        }`}
        onClick={() => setQuestionFilter("single-choice")}
      >
        <CircleDot className="w-3 h-3" />
        {sectionUiTexts?.["single-choice"] ||
          rootUiTexts?.responseDetails?.["single-choice"] ||
          "Escolha única"}
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
export function SchemaWordCloud({ component, data }) {
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
          .map((comp, idx) => {
            if (renderSchemaComponent) {
              return renderSchemaComponent(comp, idx);
            }
            // Fallback if renderSchemaComponent not provided
            return (
              <div key={`accordion-content-${comp.index !== undefined ? comp.index : idx}`}>
                Component rendering not available
              </div>
            );
          });

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
                item.textClassName || config.textClassName || "px-6 pb-6"
              }
            >
              {nestedComponents.length > 0
                ? nestedComponents
                : item.text || null}
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
      hideFilterPills={isExport}
      externalFilterState={filterState}
      data={data} // Pass enhancedData (with sectionData injected)
    />
  );
}

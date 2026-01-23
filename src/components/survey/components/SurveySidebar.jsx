import {
  ChevronDown,
  ChevronRight,
  Users,
  TrendingUp,
  ClipboardList,
  X,
  getIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useSurveyData } from "@/hooks/useSurveyData";
import { getAttributesFromData, getQuestionsFromData } from "@/services/dataResolver";
import { forwardRef, useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { resolveDataPath } from "@/services/dataResolver";
import {
  RGBA_BLACK_SHADOW_20,
  RGBA_ORANGE_SHADOW_20,
  COLOR_ORANGE_PRIMARY,
  COLOR_LIGHT_BACKGROUND,
  RGBA_ORANGE_SHADOW_15,
  COLOR_GRAY_DARK,
  RGBA_BLACK_SHADOW_08,
  RGBA_BLACK_SHADOW_10,
} from "@/lib/colors";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper: monta itens do menu a partir de sections e injeta Export (nome/ícone de uiTexts; sempre no fim)
function getMenuItems(sections, uiTexts) {
  const sectionsList = sections ?? [];
  // Ordena seções por index antes de mapear
  const sortedSections = [...sectionsList].sort(
    (a, b) => (a.index ?? 999) - (b.index ?? 999)
  );
  const items = sortedSections.map((section) => ({
    ...section,
    icon: getIcon(section.icon),
  }));
  items.push({
    id: "export",
    name: uiTexts?.export?.title ?? "Export",
    icon: getIcon("Download"),
  });
  return items;
}

/**
 * Helper function to check if a section has subsections
 */
function hasSubsections(item, data) {
  // Priority 1: Check if has subsections in config
  if (
    item.subsections &&
    Array.isArray(item.subsections) &&
    item.subsections.length > 0
  ) {
    return true;
  }

  // Priority 2: Check if has renderSchema with subsections
  if (
    item.data?.renderSchema?.subsections &&
    Array.isArray(item.data.renderSchema.subsections) &&
    item.data.renderSchema.subsections.length > 0
  ) {
    return true;
  }

  // Priority 3: Check dynamic subsections (attributes, responses) - even without dynamicSubsections flag
  // Check attributes (known dynamic section)
  if (item.id === "attributes") {
    const attrs = getAttributesFromData(data);
    return attrs.filter((a) => a.icon).length > 0;
  }

  // Check responses (known dynamic section)
  if (item.id === "responses") {
    const questions = getQuestionsFromData(data);
    return questions.length > 0;
  }

  // Priority 4: Check if has dynamicSubsections flag with config
  if (item.dynamicSubsections) {
    const config = item.dynamicSubsectionsConfig || {};
    const dataPath = config.dataPath;
    if (dataPath) {
      const items = resolveDataPath(data, dataPath) || [];
      return items.length > 0;
    }
  }

  return false;
}

/**
 * Helper function to get dynamic subsections based on configuration
 */
function getDynamicSubsections(section, data) {
  // Special handling for attributes (always works, even without dynamicSubsections flag)
  if (section.id === "attributes") {
    const attrs = getAttributesFromData(data);
    const filtered = attrs
      .filter((attr) => attr.icon)
      .sort((a, b) => (a.index || 0) - (b.index || 0));
    return filtered.map((attr) => ({
      id: `attributes-${attr.id}`,
      name: attr.name,
      icon: attr.icon,
      index: attr.index ?? 999,
    }));
  }

  // Special handling for responses (always works, even without dynamicSubsections flag)
  if (section.id === "responses") {
    const questions = getQuestionsFromData(data)
      .sort((a, b) => (a.index || 0) - (b.index || 0));
    return questions.map((question) => ({
      id: `responses-${question.id}`,
      name: question.question,
      index: question.index ?? 999,
      question: question, // Keep full question object for special rendering
    }));
  }

  // Generic handling for other dynamic sections (requires dynamicSubsections flag)
  if (!section.dynamicSubsections) return [];

  const config = section.dynamicSubsectionsConfig || {};
  const dataPath = config.dataPath;
  const idPrefix = config.idPrefix || `${section.id}-`;
  const filterKey = config.filter; // ex: "icon"
  const sortBy = config.sortBy || "index";
  const nameKey = config.nameKey || "name";

  // Resolve dataPath
  const items = resolveDataPath(data, dataPath) || [];

  // Apply filter if specified
  let filtered = items;
  if (filterKey) {
    filtered = items.filter((item) => item[filterKey]);
  }

  // Não aplicar filtros que ocultam questões - todas as questões devem ser exibidas

  // Sort
  filtered.sort((a, b) => {
    const aVal = a[sortBy] ?? 999;
    const bVal = b[sortBy] ?? 999;
    return aVal - bVal;
  });

  // Map to subsection format
  return filtered.map((item) => ({
    id: `${idPrefix}${item.id}`,
    name: item[nameKey] || item.question || item.cluster || String(item.id),
    icon: item.icon,
    index: item.index ?? 999,
  }));
}

/**
 * Helper function to get the first subsection of a section
 */
function getFirstSubsectionHelper(sectionId, data) {
  if (!data?.sections) {
    // Fallback for known sections (backward compatibility)
    const fallbacks = {
      executive: "executive-summary",
      support: "support-sentiment",
    };
    return fallbacks[sectionId] || null;
  }

  const section = data.sections.find((s) => s.id === sectionId);
  if (!section) return null;

  // attributes: sempre dinâmico a partir de data
  if (sectionId === "attributes") {
    const subs = getDynamicSubsections(section, data);
    if (subs.length > 0) return subs[0].id;
  }

  // Priority 1: Subsections from config
  if (section.subsections?.length > 0) {
    const sorted = [...section.subsections].sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999)
    );
    return sorted[0].id;
  }

  // Priority 2: RenderSchema subsections (fallback - should use section.subsections instead)
  // Note: renderSchema.subsections no longer has index - order should come from section.subsections
  if (section.data?.renderSchema?.subsections?.length > 0) {
    // No sorting since index was removed - use as-is
    const sorted = [...section.data.renderSchema.subsections];
    return sorted[0].id;
  }

  // Priority 3: Dynamic subsections
  if (section.dynamicSubsections) {
    const dynamicSubs = getDynamicSubsections(section, data);
    if (dynamicSubs.length > 0) return dynamicSubs[0].id;
  }

  return null;
}

// Internal component to render sidebar content
function SidebarContent({ activeSection, onSectionChange, onItemClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = useSurveyData();

  // Get surveyInfo from data (JSON) - must come from hook
  const currentSurveyInfo = data?.surveyInfo;
  
  // Get uiTexts from data (JSON) - must come from hook
  const currentUiTexts = data?.uiTexts;
  
  // Get sections from data (JSON) - must come from hook
  const sections = data?.sections;
  
  // Get menu items from sections + Export (injetado; nome em uiTexts.export.title)
  const menuItems = useMemo(
    () => getMenuItems(sections, currentUiTexts),
    [sections, currentUiTexts]
  );

  // State to control which sections are expanded - initialize dynamically
  const [expandedSections, setExpandedSections] = useState(() => {
    if (!data?.sections) {
      // Fallback for known sections (backward compatibility)
      return {
        executive: true,
        support: true,
        attributes: true,
        responses: true,
      };
    }

    const initialState = {};
    data.sections.forEach((section) => {
      initialState[section.id] = section.defaultExpanded ?? true;
    });

    return initialState;
  });

  // Update expanded sections when data changes (for new sections added dynamically)
  useEffect(() => {
    if (data?.sections) {
      setExpandedSections((prev) => {
        const updated = { ...prev };
        data.sections.forEach((section) => {
          if (!(section.id in updated)) {
            updated[section.id] = section.defaultExpanded ?? true;
          }
        });
        return updated;
      });
    }
  }, [data?.sections]);

  // Get all questions for "responses" section (sorted by index)
  // Uses getQuestionsFromData to support both new (sectionConfig.questions) and old structures
  const allQuestions = useMemo(() => {
    const questions = getQuestionsFromData(data);
    return questions.sort((a, b) => (a.index || 0) - (b.index || 0));
  }, [data]);

  // Simplified function: sets state directly based on value received from Collapsible
  const setSectionExpanded = (sectionId, isOpen) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: isOpen,
    }));
  };

  // Function to get the first subsection of a section
  const getFirstSubsection = useCallback(
    (sectionId) => {
      // Use helper function with data from hook
      const result = getFirstSubsectionHelper(sectionId, data);

      // Fallback for legacy behavior if helper returns null
      if (!result) {
        if (sectionId === "attributes") {
          const allAttributes = getAttributesFromData(data)
            .filter((attr) => attr.icon)
            .sort((a, b) => (a.index || 0) - (b.index || 0));
          return allAttributes.length > 0
            ? `attributes-${allAttributes[0].id}`
            : null;
        }
        if (sectionId === "responses") {
          return allQuestions.length > 0
            ? `responses-${allQuestions[0].id}`
            : null;
        }
      }

      return result;
    },
    [data, allQuestions]
  );

  // Handler for when a section is expanded/collapsed
  const handleSectionToggle = (sectionId, isOpen) => {
    setSectionExpanded(sectionId, isOpen);
  };

  // Handler for when clicking the main section button
  // For responses section: navigate to section without subSection to show all questions with accordions
  // For other sections: navigate to first subsection
  // If closed, Collapsible will open automatically
  const handleSectionClick = (sectionId) => {
    // Special handling for responses section: show all questions with accordions
    if (sectionId === "responses") {
      // Navigate to responses section without subSection to show all questions
      if (onSectionChange) {
        onSectionChange("responses");
      }
    } else {
      // For other sections, navigate to first subsection
      const firstSubsection = getFirstSubsection(sectionId);
      if (firstSubsection && onSectionChange) {
        onSectionChange(firstSubsection);
      }
    }

    // If there's an item click callback (mobile), call it too
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full px-2 sm:px-3 w-full overflow-x-hidden">
        {/* Close button on mobile */}
        <div className="lg:hidden flex justify-end pt-2 sm:pt-3 pb-1.5 sm:pb-2">
          <button
            onClick={onItemClick}
            className="rounded-lg p-1.5 sm:p-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 transition-all duration-200"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="pt-2 sm:pt-3 mb-3 sm:mb-4 pb-3 sm:pb-4">
          <div className="flex items-start justify-end gap-2 mb-3">
            <ThemeToggle className="shrink-0 hidden" />
          </div>
          {/* Survey Info Card */}
          <div
            className="rounded-lg p-2 sm:p-3 border border-border/50"
            style={{
              backgroundColor: COLOR_LIGHT_BACKGROUND,
              boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_08}`,
            }}
          >
            <div className="space-y-1.5 sm:space-y-2">
              {/* Survey Title */}
              <div className="mb-0.5">
                <h2 className="text-sm sm:text-lg font-bold text-foreground leading-tight">
                  {currentSurveyInfo?.title || "Carregando..."}
                </h2>
              </div>

              {/* Company */}
              <div className="mb-0.5">
                <div className="text-[10px] sm:text-xs font-normal text-foreground">
                  {currentSurveyInfo?.company || ""}
                </div>
              </div>

              {/* Period */}
              <div className="mb-2 sm:mb-3">
                <div className="text-[9px] sm:text-[10px] font-normal text-foreground">
                  {currentSurveyInfo?.period || ""}
                </div>
              </div>

              {/* Metrics Cards - Horizontal Layout */}
              <div className="flex items-stretch gap-1.5 sm:gap-2">
                {/* Total Respondents */}
                <div
                  className="flex-1 rounded-lg p-1.5 sm:p-2 bg-white min-w-0"
                  style={{
                    boxShadow: `0 1px 3px ${RGBA_BLACK_SHADOW_10}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: RGBA_ORANGE_SHADOW_15,
                      }}
                    >
                      <Users
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        style={{ color: COLOR_ORANGE_PRIMARY }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm sm:text-lg font-bold mb-0.5 truncate"
                        style={{ color: COLOR_GRAY_DARK }}
                      >
                        {currentSurveyInfo?.totalRespondents?.toLocaleString(
                          "pt-BR"
                        ) || "0"}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        {currentUiTexts?.surveySidebar?.respondents || "Respondentes"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Rate */}
                <div
                  className="flex-1 rounded-lg p-1.5 sm:p-2 bg-white min-w-0"
                  style={{
                    boxShadow: `0 1px 3px ${RGBA_BLACK_SHADOW_10}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: RGBA_ORANGE_SHADOW_15,
                      }}
                    >
                      <TrendingUp
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        style={{ color: COLOR_ORANGE_PRIMARY }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm sm:text-lg font-bold mb-0.5 truncate"
                        style={{ color: COLOR_GRAY_DARK }}
                      >
                        {currentSurveyInfo?.responseRate ? Math.round(currentSurveyInfo.responseRate) : 0}%
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        {currentUiTexts?.surveySidebar?.responseRate || "Taxa de Adesão"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Number of Questions */}
                <div
                  className="flex-1 rounded-lg p-1.5 sm:p-2 bg-white min-w-0"
                  style={{
                    boxShadow: `0 1px 3px ${RGBA_BLACK_SHADOW_10}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: RGBA_ORANGE_SHADOW_15,
                      }}
                    >
                      <ClipboardList
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        style={{ color: COLOR_ORANGE_PRIMARY }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm sm:text-lg font-bold mb-0.5 truncate"
                        style={{ color: COLOR_GRAY_DARK }}
                      >
                        {currentSurveyInfo?.questions ||
                            (() => {
                            const questions = getQuestionsFromData(data);
                            return questions.length;
                          })()}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        {currentUiTexts?.surveySidebar?.questions || "Perguntas"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5 sm:gap-2 items-start w-full flex-1 overflow-x-hidden">
          {menuItems && menuItems.length > 0 && currentSurveyInfo && currentUiTexts ? menuItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              (activeSection && typeof activeSection === "string" && activeSection.startsWith(item.id + "-"));

            // Check if section has subsections (dynamic detection)
            const itemHasSubsections = hasSubsections(item, data);

            // If it's a section with dynamic subsections (attributes, responses, or any configured)
            // Check by ID first (attributes, responses) or by dynamicSubsections flag
            if (
              item.id === "attributes" ||
              item.id === "responses" ||
              item.dynamicSubsections
            ) {
              const isExpanded = expandedSections[item.id];
              // Get dynamic subsections using helper function
              const dynamicSubs = getDynamicSubsections(item, data);
              
              // Debug log for responses section
              if (item.id === "responses") {
                console.log("SurveySidebar: responses section debug", {
                  dynamicSubsLength: dynamicSubs.length,
                  dynamicSubs: dynamicSubs.map(s => ({ id: s.id, name: s.name?.substring(0, 30) })),
                  itemHasSubsections,
                });
              }

              // Fallback for legacy attributes section (backward compatibility)
              if (item.id === "attributes" && dynamicSubs.length === 0) {
                const allAttributes = getAttributesFromData(data)
                  .filter((attr) => attr.icon)
                  .sort((a, b) => (a.index || 0) - (b.index || 0));
                return (
                  <Collapsible
                    key={item.id}
                    open={isExpanded}
                    onOpenChange={(open) => handleSectionToggle(item.id, open)}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={(e) => handleSectionClick(item.id, e)}
                        className={cn(
                          "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                          isActive
                            ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20"
                        )}
                      >
                        {item.icon && (
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                          {item.name}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="w-full mt-1">
                      <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-[hsl(var(--custom-blue))]/30">
                        {allAttributes.map((attr) => {
                          const attributeSectionId = `attributes-${attr.id}`;
                          const isAttributeActive =
                            activeSection === attributeSectionId;
                          const Icon = getIcon(attr.icon);
                          return (
                            <button
                              key={attr.id}
                              onClick={() => {
                                onSectionChange(attributeSectionId);
                                if (onItemClick) {
                                  onItemClick();
                                }
                              }}
                              className={cn(
                                "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full text-xs sm:text-sm",
                                isAttributeActive
                                  ? "bg-[hsl(var(--custom-blue))]/30 text-sidebar-foreground border border-[hsl(var(--custom-blue))]/30"
                                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30"
                              )}
                            >
                              {Icon && <Icon className="w-4 h-4 shrink-0" />}
                              <span className="flex-1">{attr.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              // Generic rendering for dynamic subsections
              // For responses, always render even if no subsections (fallback to regular section)
              if (dynamicSubs.length > 0 || item.id === "responses") {
                // Special rendering for responses (questions with Q prefix)
                if (item.id === "responses" && dynamicSubs.length > 0) {
                  return (
                    <Collapsible
                      key={item.id}
                      open={isExpanded}
                      onOpenChange={(open) =>
                        handleSectionToggle(item.id, open)
                      }
                      className="w-full"
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={(e) => handleSectionClick(item.id, e)}
                          className={cn(
                            "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                            isActive
                              ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                              : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20"
                          )}
                        >
                          {item.icon && (
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                            {item.name}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="w-full mt-1">
                        <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-[hsl(var(--custom-blue))]/30">
                          {dynamicSubs.map((sub, index) => {
                            const isSubActive = activeSection === sub.id;
                            const displayNumber = index + 1;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  onSectionChange(sub.id);
                                  if (onItemClick) {
                                    onItemClick();
                                  }
                                }}
                                className={cn(
                                  "flex items-start gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left w-full text-sm",
                                  isSubActive
                                    ? "bg-[hsl(var(--custom-blue))]/30 text-sidebar-foreground border border-[hsl(var(--custom-blue))]/30"
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30"
                                )}
                              >
                                <span className="font-semibold shrink-0">
                                  Q{displayNumber}
                                </span>
                                {sub.name && sub.name.length > 60 ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="flex-1 line-clamp-2">
                                        {sub.name.substring(0, 60) + "..."}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="right"
                                      className="max-w-xs p-3 text-sm"
                                    >
                                      <p className="whitespace-normal">
                                        {sub.name}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <span className="flex-1 line-clamp-2">
                                    {sub.name}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
                
                // Fallback for responses when no questions found - render as regular section
                if (item.id === "responses" && dynamicSubs.length === 0) {
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => handleSectionClick(item.id, e)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                        isActive
                          ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20"
                      )}
                    >
                      {item.icon && (
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                        {item.name}
                      </span>
                    </button>
                  );
                }

                // Generic rendering for other dynamic subsections (attributes, etc)
                return (
                  <Collapsible
                    key={item.id}
                    open={isExpanded}
                    onOpenChange={(open) => handleSectionToggle(item.id, open)}
                    className="w-full"
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={(e) => handleSectionClick(item.id, e)}
                        className={cn(
                          "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                          isActive
                            ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20"
                        )}
                      >
                        {item.icon && (
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                          {item.name}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="w-full mt-1">
                      <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-[hsl(var(--custom-blue))]/30">
                        {dynamicSubs.map((sub) => {
                          const isSubActive = activeSection === sub.id;
                          const SubIcon = sub.icon ? getIcon(sub.icon) : null;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onSectionChange(sub.id);
                                if (onItemClick) {
                                  onItemClick();
                                }
                              }}
                              className={cn(
                                "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full text-xs sm:text-sm",
                                isSubActive
                                  ? "bg-[hsl(var(--custom-blue))]/30 text-sidebar-foreground border border-[hsl(var(--custom-blue))]/30"
                                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30"
                              )}
                            >
                              {SubIcon && (
                                <SubIcon className="w-4 h-4 shrink-0" />
                              )}
                              <span className="flex-1">{sub.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }
            }

            // Note: responses section is now handled by dynamicSubsections above
            // This block is kept for backward compatibility but should not be reached
            // if dynamicSubsections is properly configured

            // For other sections with subsections (executive, support, or any new section)
            if (
              itemHasSubsections &&
              !(
                item.id === "attributes" ||
                item.id === "responses" ||
                item.dynamicSubsections
              )
            ) {
              const isExpanded = expandedSections[item.id];
              // Get subsections from data (dynamic) - must come from hook
              const sectionConfig =
                data?.sections?.find((s) => s.id === item.id);

              // Try subsections from config first, then from renderSchema
              let subsections = sectionConfig?.subsections
                ? sectionConfig.subsections.map((sub) => ({
                    ...sub,
                    icon: getIcon(sub.icon),
                  }))
                : [];

              // If no subsections in config, try renderSchema (apenas id e components; ordem e display vêm de section.subsections)
              if (
                subsections.length === 0 &&
                sectionConfig?.data?.renderSchema?.subsections
              ) {
                subsections = sectionConfig.data.renderSchema.subsections
                  .map((sub) => ({
                    id: sub.id,
                    name: sub.name ?? sub.id,
                    icon: getIcon(sub.icon),
                  }));
              }

              return (
                <Collapsible
                  key={item.id}
                  open={isExpanded}
                  onOpenChange={(open) => handleSectionToggle(item.id, open)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <button
                      onClick={(e) => handleSectionClick(item.id, e)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                        isActive
                          ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20"
                      )}
                    >
                      {item.icon && (
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                        {item.name}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full mt-1">
                    <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-[hsl(var(--custom-blue))]/30">
                      {subsections.map((subsection) => {
                        const isSubsectionActive =
                          activeSection === subsection.id;
                        const SubsectionIcon = subsection.icon;
                        return (
                          <button
                            key={subsection.id}
                            onClick={() => {
                              onSectionChange(subsection.id);
                              if (onItemClick) {
                                onItemClick();
                              }
                            }}
                            className={cn(
                              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full text-xs sm:text-sm",
                              isSubsectionActive
                                ? "bg-[hsl(var(--custom-blue))]/30 text-sidebar-foreground border border-[hsl(var(--custom-blue))]/30"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30"
                            )}
                          >
                            {SubsectionIcon && (
                              <SubsectionIcon className="w-4 h-4 shrink-0" />
                            )}
                            <span className="flex-1">{subsection.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // Export: página do app (sempre disponível); navega para /export; nome/ícone e uiTexts vêm do JSON
            if (item.id === "export") {
              const isExportActive = location.pathname === "/export";
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate("/export");
                    if (onItemClick) {
                      onItemClick();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-left w-full my-2",
                    isExportActive
                      ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-lg font-bold whitespace-nowrap flex-1">
                    {item.name}
                  </span>
                </button>
              );
            }

            // For sections without subsections (fallback - shouldn't happen with current sections)
            return (
              <button
                key={item.id}
                onClick={() => {
                  const firstSubsection = getFirstSubsection(item.id);
                  if (firstSubsection) {
                    onSectionChange(firstSubsection);
                  } else {
                    onSectionChange(item.id);
                  }
                  if (onItemClick) {
                    onItemClick();
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-left w-full",
                  isActive
                    ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
                )}
              >
                {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                <span className="text-lg font-bold whitespace-nowrap flex-1">
                  {item.name}
                </span>
              </button>
            );
          }) : (
            <div className="text-sm text-muted-foreground p-4">
              Carregando dados...
            </div>
          )}
        </nav>
      </div>
    </TooltipProvider>
  );
}

// Desktop sidebar (always visible on large screens)
export const SurveySidebar = forwardRef(
  ({ activeSection, onSectionChange }, ref) => {
    return (
      <aside
        ref={ref}
        className="hidden lg:flex fixed left-0 top-0 h-full bg-sidebar z-20 overflow-y-auto"
        style={{
          width: "auto",
          minWidth: "fit-content",
          boxShadow: `2px 0 8px ${RGBA_BLACK_SHADOW_20}`,
        }}
      >
        <SidebarContent
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </aside>
    );
  }
);
SurveySidebar.displayName = "SurveySidebar";

// Component for mobile sidebar content (inside Sheet)
export function SurveySidebarMobile({
  activeSection,
  onSectionChange,
  onItemClick,
}) {
  return (
    <div className="bg-sidebar h-screen overflow-y-auto w-full">
      <SidebarContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onItemClick={onItemClick}
      />
    </div>
  );
}

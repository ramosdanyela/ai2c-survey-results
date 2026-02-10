import {
  ChevronDown,
  ChevronRight,
  Users,
  TrendingUp,
  ClipboardList,
  X,
  getIcon,
} from "@/lib/icons";
import { cn, capitalizeTitle } from "@/lib/utils";
import { useSurveyData } from "@/hooks/useSurveyData";
import {
  getQuestionsFromData,
  isQuestionsSectionId,
} from "@/services/dataResolver";
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
    (a, b) => (a.index ?? 999) - (b.index ?? 999),
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

  // Priority 3: Check dynamic subsections (responses / questions) - even without dynamicSubsections flag
  if (isQuestionsSectionId(item.id)) {
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
  // Seção com subseções fixas (executive, support, attributes, etc.): usa section.subsections
  if (section.subsections?.length > 0) {
    return [...section.subsections]
      .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
      .map((sub) => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon,
        index: sub.index ?? 999,
      }));
  }

  // Special handling for responses / questions (always works, even without dynamicSubsections flag)
  if (isQuestionsSectionId(section.id)) {
    const questions = getQuestionsFromData(data).sort(
      (a, b) => (a.index || 0) - (b.index || 0),
    );
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

  // Priority 1: Subsections from config (inclui attributes, executive, support)
  if (section.subsections?.length > 0) {
    const sorted = [...section.subsections].sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999),
    );
    return sorted[0].id;
  }

  // Priority 2: Dynamic subsections (responses/questions or section.dynamicSubsections)
  if (section.dynamicSubsections || isQuestionsSectionId(section.id)) {
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
    [sections, currentUiTexts],
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
        if (isQuestionsSectionId(sectionId)) {
          return allQuestions.length > 0
            ? `responses-${allQuestions[0].id}`
            : null;
        }
      }

      return result;
    },
    [data, allQuestions],
  );

  // Handler for when a section is expanded/collapsed
  const handleSectionToggle = (sectionId, isOpen) => {
    setSectionExpanded(sectionId, isOpen);
  };

  // Handler for when clicking the main section button
  // For responses/questions section: navigate to section without subSection to show all questions with accordions
  // For other sections: navigate to first subsection
  // If closed, Collapsible will open automatically
  const handleSectionClick = (sectionId) => {
    // Special handling for responses/questions section: show all questions with accordions
    if (isQuestionsSectionId(sectionId)) {
      if (onSectionChange) {
        onSectionChange(sectionId);
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
                          "pt-BR",
                        ) || "0"}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        {currentUiTexts?.surveySidebar?.respondents ||
                          "Respondentes"}
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
                        {currentSurveyInfo?.responseRate
                          ? Math.round(currentSurveyInfo.responseRate)
                          : 0}
                        %
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        {currentUiTexts?.surveySidebar?.responseRate ||
                          "Taxa de Adesão"}
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
                        {currentUiTexts?.surveySidebar?.questions ||
                          "Perguntas"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5 sm:gap-2 items-start w-full flex-1 overflow-x-hidden">
          {menuItems &&
          menuItems.length > 0 &&
          currentSurveyInfo &&
          currentUiTexts ? (
            menuItems.map((item) => {
              const isActive =
                activeSection === item.id ||
                (activeSection &&
                  typeof activeSection === "string" &&
                  activeSection.startsWith(item.id + "-"));

              // Check if section has subsections (dynamic detection)
              const itemHasSubsections = hasSubsections(item, data);
              const dynamicSubs = getDynamicSubsections(item, data);

              // Any section with subsections (executive, support, attributes, responses, etc.)
              if (dynamicSubs.length > 0) {
                const isExpanded = expandedSections[item.id];

                // Generic rendering for dynamic subsections
                if (dynamicSubs.length > 0) {
                  // Special rendering for responses/questions (questions with Q prefix)
                  if (isQuestionsSectionId(item.id) && dynamicSubs.length > 0) {
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
                                : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20",
                            )}
                          >
                            {item.icon && (
                              <item.icon className="w-4 h-4 flex-shrink-0" />
                            )}
                            <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                              {capitalizeTitle(item.name)}
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
                                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30",
                                  )}
                                >
                                  <span className="font-semibold shrink-0">
                                    Q{displayNumber}
                                  </span>
                                  {sub.name && sub.name.length > 60 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="flex-1 line-clamp-2">
                                          {capitalizeTitle(sub.name).substring(0, 60) + "..."}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="right"
                                        className="max-w-xs p-3 text-sm"
                                      >
                                        <p className="whitespace-normal">
                                          {capitalizeTitle(sub.name)}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span className="flex-1 line-clamp-2">
                                      {capitalizeTitle(sub.name)}
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

                  // Generic rendering for other dynamic subsections
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
                              : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20",
                          )}
                        >
                          {item.icon && (
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                            {capitalizeTitle(item.name)}
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
                                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30",
                                )}
                              >
                                {SubIcon && (
                                  <SubIcon className="w-4 h-4 shrink-0" />
                                )}
                                <span className="flex-1">{capitalizeTitle(sub.name)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }
              }

              // Fallback: sections with subsections from config but getDynamicSubsections returned empty
              if (itemHasSubsections && dynamicSubs.length === 0) {
                const isExpanded = expandedSections[item.id];
                // Get subsections from data (dynamic) - must come from hook
                const sectionConfig = data?.sections?.find(
                  (s) => s.id === item.id,
                );

                // Get subsections from config
                let subsections = sectionConfig?.subsections
                  ? sectionConfig.subsections.map((sub) => ({
                      ...sub,
                      icon: getIcon(sub.icon),
                    }))
                  : [];

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
                            : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20",
                        )}
                      >
                        {item.icon && (
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                          {capitalizeTitle(item.name)}
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
                                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30",
                              )}
                            >
                              {SubsectionIcon && (
                                <SubsectionIcon className="w-4 h-4 shrink-0" />
                              )}
                              <span className="flex-1">{capitalizeTitle(subsection.name)}</span>
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
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40",
                    )}
                  >
                    {item.icon && (
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="text-lg font-bold whitespace-nowrap flex-1">
                      {capitalizeTitle(item.name)}
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
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40",
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                  <span className="text-lg font-bold whitespace-nowrap flex-1">
                    {capitalizeTitle(item.name)}
                  </span>
                </button>
              );
            })
          ) : (
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
  },
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

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
import {
  surveyInfo,
  responseDetails,
  attributeDeepDive,
  uiTexts,
  sectionsConfig,
} from "@/data/surveyData";
import { forwardRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
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

// Get menu items from sectionsConfig with icon components
const menuItems = sectionsConfig.sections.map((section) => ({
  ...section,
  icon: getIcon(section.icon),
}));

// Internal component to render sidebar content
function SidebarContent({ activeSection, onSectionChange, onItemClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  // State to control which sections are expanded - all start open
  const [expandedSections, setExpandedSections] = useState({
    executive: true,
    support: true,
    attributes: true,
    responses: true,
  });

  // Get all questions for "responses" section (sorted by index, excluding Q3)
  const allQuestions = [
    ...responseDetails.closedQuestions.map((q) => ({
      ...q,
      type: "closed",
    })),
    ...responseDetails.openQuestions.map((q) => ({
      ...q,
      type: "open",
    })),
  ]
    .filter((q) => q.id !== 3) // Hide Q3
    .sort((a, b) => (a.index || 0) - (b.index || 0));

  // Simplified function: sets state directly based on value received from Collapsible
  const setSectionExpanded = (sectionId, isOpen) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: isOpen,
    }));
  };

  // Function to get the first subsection of a section
  const getFirstSubsection = (sectionId) => {
    if (sectionId === "executive") return "executive-summary";
    if (sectionId === "support") return "support-sentiment";
    if (sectionId === "attributes") {
      const allAttributes = attributeDeepDive.attributes
        .filter((attr) => attr.icon)
        .sort((a, b) => (a.index || 0) - (b.index || 0));
      return allAttributes.length > 0
        ? `attributes-${allAttributes[0].id}`
        : null;
    }
    if (sectionId === "responses") {
      return allQuestions.length > 0 ? `responses-${allQuestions[0].id}` : null;
    }
    return null;
  };

  // Handler for when a section is expanded/collapsed
  const handleSectionToggle = (sectionId, isOpen) => {
    setSectionExpanded(sectionId, isOpen);
  };

  // Handler for when clicking the main section button
  // Always navigates to the first subsection
  // If closed, Collapsible will open automatically
  const handleSectionClick = (sectionId) => {
    const firstSubsection = getFirstSubsection(sectionId);

    // Always navigate to first subsection when clicking main section
    if (firstSubsection && onSectionChange) {
      onSectionChange(firstSubsection);
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
            className="rounded-lg p-1.5 sm:p-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40 transition-all duration-200"
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
                  {surveyInfo.title}
                </h2>
              </div>

              {/* Company */}
              <div className="mb-0.5">
                <div className="text-[10px] sm:text-xs font-normal text-foreground">
                  {surveyInfo.company}
                </div>
              </div>

              {/* Period */}
              <div className="mb-2 sm:mb-3">
                <div className="text-[9px] sm:text-[10px] font-normal text-foreground">
                  {surveyInfo.period}
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
                        {surveyInfo.totalRespondents.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        {uiTexts.surveySidebar.respondents}
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
                        {Math.round(surveyInfo.responseRate)}%
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        {uiTexts.surveySidebar.responseRate}
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
                        {(() => {
                          const allQuestions = [
                            ...responseDetails.closedQuestions,
                            ...responseDetails.openQuestions,
                          ].filter((q) => q.id !== 3); // Ocultar Q3
                          return allQuestions.length;
                        })()}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        {uiTexts.surveySidebar.questions}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5 sm:gap-2 items-start w-full flex-1 overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              activeSection.startsWith(item.id + "-");

            // Check if section has subsections
            const hasSubsections =
              item.id === "executive" ||
              item.id === "support" ||
              item.id === "attributes" ||
              item.id === "responses";

            // If it's the "attributes" section, show attribute subsections
            if (item.id === "attributes") {
              const isExpanded = expandedSections.attributes;
              // Get all available attributes with icons from surveyData (sorted by index)
              const allAttributes = attributeDeepDive.attributes
                .filter((attr) => attr.icon)
                .sort((a, b) => (a.index || 0) - (b.index || 0));
              return (
                <Collapsible
                  key={item.id}
                  open={isExpanded}
                  onOpenChange={(open) =>
                    handleSectionToggle("attributes", open)
                  }
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <button
                      onClick={(e) => handleSectionClick("attributes", e)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                        isActive
                          ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
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
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30 border border-transparent hover:border-[hsl(var(--custom-blue))]/30"
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

            // If it's the "responses" section, show question subsections
            if (item.id === "responses") {
              const isExpanded = expandedSections.responses;
              return (
                <Collapsible
                  key={item.id}
                  open={isExpanded}
                  onOpenChange={(open) =>
                    handleSectionToggle("responses", open)
                  }
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <button
                      onClick={(e) => handleSectionClick("responses", e)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                        isActive
                          ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
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
                      {allQuestions.map((question, index) => {
                        const questionSectionId = `responses-${question.id}`;
                        const isQuestionActive =
                          activeSection === questionSectionId;
                        // Renumber questions: index + 1 (excluding Q3)
                        const displayNumber = index + 1;
                        return (
                          <button
                            key={question.id}
                            onClick={() => {
                              onSectionChange(questionSectionId);
                              if (onItemClick) {
                                onItemClick();
                              }
                            }}
                            className={cn(
                              "flex items-start gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left w-full text-sm",
                              isQuestionActive
                                ? "bg-[hsl(var(--custom-blue))]/30 text-sidebar-foreground border border-[hsl(var(--custom-blue))]/30"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30 border border-transparent hover:border-[hsl(var(--custom-blue))]/30"
                            )}
                          >
                            <span className="font-semibold shrink-0">
                              Q{displayNumber}
                            </span>
                            {question.question.length > 60 ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex-1 line-clamp-2">
                                    {question.question.substring(0, 60) + "..."}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="max-w-xs p-3 text-sm"
                                >
                                  <p className="whitespace-normal">
                                    {question.question}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="flex-1 line-clamp-2">
                                {question.question}
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

            // For other sections with subsections (executive, support)
            if (hasSubsections) {
              const isExpanded = expandedSections[item.id];
              // Get subsections from sectionsConfig
              const sectionConfig = sectionsConfig.sections.find(
                (s) => s.id === item.id
              );
              const subsections = sectionConfig?.subsections
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
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
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
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30 border border-transparent hover:border-[hsl(var(--custom-blue))]/30"
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

            // If it's the Export item, use route navigation
            if (item.isRoute) {
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
          })}
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

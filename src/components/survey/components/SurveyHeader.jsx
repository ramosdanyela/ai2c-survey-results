import { useMemo } from "react";
import { FileText, Menu, getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  COLOR_ORANGE_PRIMARY,
  RGBA_ORANGE_SHADOW_40,
  RGBA_BLACK_SHADOW_20,
} from "@/lib/colors";
import { useSurveyData } from "@/hooks/useSurveyData";
import { NavigationButtons } from "@/components/survey/components/NavigationButtons";
import {
  getQuestionsSection,
  isQuestionsSectionId,
} from "@/services/dataResolver";

/**
 * Extract section ID from activeSection by checking sections
 * Handles formats like: "section-id", "section-id-subsection-id"
 * This matches the logic in ContentRenderer for consistency
 */
function extractSectionId(data, activeSection) {
  if (!data?.sections) {
    return null;
  }

  // Check if activeSection matches a section ID exactly
  const exactMatch = data.sections.find((s) => s.id === activeSection);
  if (exactMatch) {
    return activeSection;
  }

  // Check if activeSection matches a subsection ID
  // Find which section contains this subsection
  for (const section of data.sections) {
    // Check subsections from config
    if (section.subsections) {
      const subsection = section.subsections.find(
        (sub) => sub.id === activeSection,
      );
      if (subsection) {
        return section.id;
      }
    }
    // Check dynamic subsections (responses/questions - built from questions)
    if (
      isQuestionsSectionId(section.id) &&
      activeSection &&
      activeSection.startsWith("responses-")
    ) {
      return section.id;
    }
  }

  // If no match, try to extract from pattern (e.g., "nova-secao-subsec" -> "nova-secao")
  // This is a fallback for sections with schema that might not be in sectionsConfig yet
  if (!activeSection) return null;
  const parts = activeSection.split("-");
  if (parts.length >= 2) {
    // Try all possible combinations from longest to shortest
    for (let i = parts.length; i >= 1; i--) {
      const potentialId = parts.slice(0, i).join("-");
      const section = data.sections.find((s) => s.id === potentialId);
      if (section) {
        // Check if it's a dynamic subsection or regular subsection
        if (section.dynamicSubsections) {
          return section.id;
        }
        // Check if activeSection matches a subsection of this section
        if (section.subsections?.some((sub) => sub.id === activeSection)) {
          return section.id;
        }
        // If section has dynamicSubsections, check if pattern matches
        if (section.dynamicSubsections) {
          // Pattern like "section-id" where id is from dynamic data
          const remainingParts = parts.slice(i);
          if (remainingParts.length > 0) {
            return section.id;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Get section title from data (programmatic)
 * Priority: sections[].name > sectionId
 * This matches the logic in NavigationButtons for consistency
 */
function getSectionTitleFromData(activeSection, data) {
  if (!data || !activeSection) return activeSection || "";

  // First, try to extract the section ID from activeSection
  // This handles cases where activeSection is a subsection (e.g., "retention-intent" -> "engagement")
  const sectionId = extractSectionId(data, activeSection);

  // If we found a section ID, use it to get the title
  if (sectionId && data?.sections) {
    const section = data.sections.find((s) => s.id === sectionId);
    if (section?.name) {
      return section.name;
    }
  }

  // Fallback: try simple split (e.g., "executive-summary" -> "executive")
  const baseSectionId =
    activeSection && typeof activeSection === "string"
      ? activeSection.split("-")[0]
      : activeSection;

  // Priority 1: Try to get from sections (most reliable)
  if (data?.sections) {
    const section = data.sections.find((s) => s.id === baseSectionId);
    if (section?.name) {
      return section.name;
    }
  }

  // Fallback: return formatted sectionId
  return activeSection;
}

/**
 * Get icon for a section or subsection (programmatic)
 * Always returns the icon of the parent section, not the subsection
 */
function getSectionIconFromData(sectionId, data) {
  if (!data?.sections || !sectionId) return FileText;

  // First, try to extract the section ID from sectionId
  // This handles cases where sectionId is a subsection (e.g., "retention-intent" -> "engagement")
  const parentSectionId = extractSectionId(data, sectionId);

  // If we found a parent section ID, use it to get the icon
  if (parentSectionId) {
    const section = data.sections.find((s) => s.id === parentSectionId);
    if (section && section.icon) {
      return getIcon(section.icon);
    }
  }

  // Fallback: try to find exact match in sections
  for (const section of data.sections) {
    // Check if it's the main section
    if (section.id === sectionId) {
      return getIcon(section.icon);
    }
  }

  // Check if it's a subsection (any section with subsections)
  for (const section of data.sections) {
    const sub = section.subsections?.find((s) => s.id === sectionId);
    if (sub !== undefined && section.icon) {
      return getIcon(section.icon);
    }
  }

  // Check if it's a question subsection
  if (
    sectionId &&
    typeof sectionId === "string" &&
    sectionId.startsWith("responses-")
  ) {
    const questionsSection = getQuestionsSection(data);
    if (questionsSection?.icon) {
      return getIcon(questionsSection.icon);
    }
  }

  // Fallback - always return a valid icon component
  return FileText;
}

export function SurveyHeader({
  activeSection,
  onSectionChange,
  onMenuClick,
  navigationButtons,
}) {
  const { data } = useSurveyData();

  const title = useMemo(() => {
    return getSectionTitleFromData(activeSection, data);
  }, [activeSection, data]);

  const Icon = useMemo(() => {
    // getSectionIconFromData always returns a valid icon (FileText as fallback)
    return getSectionIconFromData(activeSection, data);
  }, [activeSection, data]);

  // Use provided navigationButtons or default NavigationButtons component
  let previousButtonDiv = null;
  let nextButtonDiv = null;

  if (navigationButtons !== undefined) {
    // Custom navigationButtons provided - extract divs if it's an object with previousButtonDiv/nextButtonDiv
    // or render as provided if it's a React element
    if (
      navigationButtons &&
      typeof navigationButtons === "object" &&
      "previousButtonDiv" in navigationButtons
    ) {
      previousButtonDiv = navigationButtons.previousButtonDiv;
      nextButtonDiv = navigationButtons.nextButtonDiv;
    } else {
      // If it's a React element, try to extract children
      const children = navigationButtons?.props?.children;
      if (Array.isArray(children)) {
        previousButtonDiv = children[0] || null;
        nextButtonDiv = children[1] || null;
      } else {
        // Render as provided
        return (
          <header
            className="sticky top-0 z-10 bg-background"
            style={{
              boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_20}`,
            }}
          >
            <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 flex items-center gap-1 sm:gap-0">
              <div className="lg:hidden mr-2 sm:mr-3">
                <Button
                  onClick={onMenuClick}
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-muted"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
              {navigationButtons}
              <div className="flex-1 flex justify-center">
                <div
                  className="text-white px-1.5 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2"
                  style={{
                    backgroundColor: COLOR_ORANGE_PRIMARY,
                    boxShadow: `0 4px 16px ${RGBA_ORANGE_SHADOW_40}`,
                  }}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <h1 className="text-sm sm:text-2xl font-bold text-white whitespace-nowrap">
                    {title}
                  </h1>
                </div>
              </div>
            </div>
          </header>
        );
      }
    }
  } else {
    // Default NavigationButtons - get the object with divs
    const buttons = NavigationButtons({
      currentSection: activeSection,
      onSectionChange,
    });
    previousButtonDiv = buttons.previousButtonDiv;
    nextButtonDiv = buttons.nextButtonDiv;
  }

  return (
    <header
      className="sticky top-0 z-10 bg-background"
      style={{
        boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_20}`,
      }}
    >
      <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 flex items-center gap-1 sm:gap-0">
        {/* Hamburger Menu - Visible only on smaller screens */}
        <div className="lg:hidden mr-2 sm:mr-3">
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {previousButtonDiv}

        <div className="flex-1 flex justify-center">
          <div
            className="text-white px-1.5 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2"
            style={{
              backgroundColor: COLOR_ORANGE_PRIMARY,
              boxShadow: `0 4px 16px ${RGBA_ORANGE_SHADOW_40}`,
            }}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <h1 className="text-sm sm:text-2xl font-bold text-white whitespace-nowrap">
              {title}
            </h1>
          </div>
        </div>

        {nextButtonDiv}
      </div>
    </header>
  );
}

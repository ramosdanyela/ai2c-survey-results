import { FileText, Menu, getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  COLOR_ORANGE_PRIMARY,
  RGBA_ORANGE_SHADOW_40,
  RGBA_BLACK_SHADOW_20,
} from "@/lib/colors";
import {
  responseDetails,
  attributeDeepDive,
  uiTexts,
  sectionsConfig,
} from "@/data/surveyData";
import { NavigationButtons } from "@/components/survey/components/NavigationButtons";

// Section to title mapping
const sectionTitles = {
  executive: uiTexts.surveyHeader.executiveReport,
  "executive-summary": uiTexts.surveyHeader.executiveSummary,
  "executive-recommendations": uiTexts.surveyHeader.recommendations,
  support: uiTexts.surveyHeader.supportAnalysis,
  "support-sentiment": uiTexts.surveyHeader.sentimentAnalysis,
  "support-intent": uiTexts.surveyHeader.respondentIntent,
  "support-segmentation": uiTexts.surveyHeader.segmentation,
  responses: uiTexts.surveyHeader.questionAnalysis,
  attributes: uiTexts.surveyHeader.attributeDeepDive,
};

// Get icon for a section or subsection
function getSectionIconFromConfig(sectionId) {
  // First try to find exact match in sectionsConfig
  for (const section of sectionsConfig.sections) {
    // Check if it's the main section
    if (section.id === sectionId) {
      return getIcon(section.icon);
    }
    // Check subsections
    if (section.subsections) {
      const subsection = section.subsections.find(
        (sub) => sub.id === sectionId
      );
      if (subsection) {
        return getIcon(subsection.icon);
      }
    }
  }

  // Check if it's an attribute subsection
  if (sectionId.startsWith("attributes-")) {
    const attributeId = sectionId.replace("attributes-", "");
    const attribute = attributeDeepDive.attributes.find(
      (attr) => attr.id === attributeId
    );
    if (attribute && attribute.icon) {
      return getIcon(attribute.icon);
    }
    // Fallback to section icon
    const attributesSection = sectionsConfig.sections.find(
      (s) => s.id === "attributes"
    );
    if (attributesSection) {
      return getIcon(attributesSection.icon);
    }
  }

  // Check if it's a question subsection
  if (sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const allQuestions = [
      ...responseDetails.closedQuestions,
      ...responseDetails.openQuestions,
    ];
    const question = allQuestions.find((q) => q.id === questionId);
    if (question && question.icon) {
      return getIcon(question.icon);
    }
    // Fallback to section icon
    const responsesSection = sectionsConfig.sections.find(
      (s) => s.id === "responses"
    );
    if (responsesSection) {
      return getIcon(responsesSection.icon);
    }
  }

  // Fallback
  return FileText;
}

function getSectionTitle(activeSection) {
  // Always return the main section title (before the hyphen)
  const baseSection = activeSection.split("-")[0];
  if (sectionTitles[baseSection]) {
    return sectionTitles[baseSection];
  }

  // If not found, try to find exact title as fallback
  if (sectionTitles[activeSection]) {
    return sectionTitles[activeSection];
  }

  // Fallback
  return uiTexts.surveyHeader.results;
}

function getSectionIcon(activeSection) {
  return getSectionIconFromConfig(activeSection);
}

export function SurveyHeader({
  activeSection,
  onSectionChange,
  onMenuClick,
  navigationButtons,
}) {
  const title = getSectionTitle(activeSection);
  const Icon = getSectionIcon(activeSection);

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


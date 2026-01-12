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

/**
 * Get section title from data (programmatic)
 */
function getSectionTitleFromData(activeSection, data) {
  if (!data?.uiTexts?.surveyHeader) {
    return activeSection;
  }

  const uiTexts = data.uiTexts.surveyHeader;

  // Always return the main section title (before the hyphen)
  const baseSection = activeSection.split("-")[0];

  // Map section IDs to title keys
  const titleMap = {
    executive: uiTexts.executiveReport || "Relatório Executivo",
    "executive-summary": uiTexts.executiveSummary || "Sumário Executivo",
    "executive-recommendations": uiTexts.recommendations || "Recomendações",
    support: uiTexts.supportAnalysis || "Análises de Suporte",
    "support-sentiment": uiTexts.sentimentAnalysis || "Análise de Sentimento",
    "support-intent": uiTexts.respondentIntent || "Intenção de Respondentes",
    "support-segmentation": uiTexts.segmentation || "Segmentação",
    responses: uiTexts.questionAnalysis || "Análise por Questão",
    attributes: uiTexts.attributeDeepDive || "Aprofundamento por Atributos",
  };

  if (titleMap[baseSection]) {
    return titleMap[baseSection];
  }

  // If not found, try to find exact title as fallback
  if (titleMap[activeSection]) {
    return titleMap[activeSection];
  }

  // Fallback
  return uiTexts.results || "Resultados da Pesquisa";
}

/**
 * Get icon for a section or subsection (programmatic)
 */
function getSectionIconFromConfig(sectionId, data) {
  if (!data?.sectionsConfig?.sections) return FileText;

  // First try to find exact match in sectionsConfig
  for (const section of data.sectionsConfig.sections) {
    // Check if it's the main section
    if (section.id === sectionId) {
      return getIcon(section.icon);
    }
    // Check subsections
    if (section.subsections && Array.isArray(section.subsections)) {
      const subsection = section.subsections.find(
        (sub) => sub.id === sectionId
      );
      if (subsection && subsection.icon) {
        return getIcon(subsection.icon);
      }
    }
  }

  // Check if it's an attribute subsection
  if (sectionId.startsWith("attributes-")) {
    const attributeId = sectionId.replace("attributes-", "");
    const attribute = data?.attributeDeepDive?.attributes?.find(
      (attr) => attr.id === attributeId
    );
    if (attribute && attribute.icon) {
      return getIcon(attribute.icon);
    }
    // Fallback to section icon
    const attributesSection = data.sectionsConfig.sections.find(
      (s) => s.id === "attributes"
    );
    if (attributesSection && attributesSection.icon) {
      return getIcon(attributesSection.icon);
    }
  }

  // Check if it's a question subsection
  if (sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const allQuestions = data?.responseDetails?.questions || [];
    const question = allQuestions.find((q) => q.id === questionId);
    if (question && question.icon) {
      return getIcon(question.icon);
    }
    // Fallback to section icon
    const responsesSection = data.sectionsConfig.sections.find(
      (s) => s.id === "responses"
    );
    if (responsesSection && responsesSection.icon) {
      return getIcon(responsesSection.icon);
    }
  }

  // Fallback
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
    return getSectionIconFromConfig(activeSection, data);
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

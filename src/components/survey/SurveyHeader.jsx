import {
  ChevronRight,
  ChevronLeft,
  FileText,
  Menu,
  getIcon,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  COLOR_ORANGE_PRIMARY,
  RGBA_ORANGE_SHADOW_40,
  RGBA_BLACK_SHADOW_20,
  getBlueGradient,
  getBlueButtonShadow,
  RGBA_WHITE_20,
} from "@/lib/colors";
import {
  responseDetails,
  attributeDeepDive,
  uiTexts,
  sectionsConfig,
} from "@/data/surveyData";

// Get all questions for navigation (sorted by index, excluding Q3)
const getAllQuestions = () => {
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
  return allQuestions.map((q) => ({
    id: `responses-${q.id}`,
    index: q.index || 0,
  }));
};

// Get display number based on real questionId (renumbering excluding Q3)
const getDisplayNumber = (questionId) => {
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

  const index = allQuestions.findIndex((q) => q.id === questionId);
  return index !== -1 ? index + 1 : questionId; // Return index + 1 or original ID if not found
};

// Get all attribute subsections for navigation (sorted by index)
const getAllAttributes = () => {
  return attributeDeepDive.attributes
    .filter((attr) => attr.icon)
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map((attr) => ({
      id: `attributes-${attr.id}`,
      index: attr.index || 0,
    }));
};

// Build complete ordered list of all subsections based on indices
const buildOrderedSubsections = () => {
  const subsections = [];

  // Process sections in order
  sectionsConfig.sections
    .filter((section) => !section.isRoute) // Exclude routes like "export"
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .forEach((section) => {
      if (section.subsections) {
        // Section with fixed subsections (executive, support)
        section.subsections
          .sort((a, b) => (a.index || 0) - (b.index || 0))
          .forEach((subsection) => {
            subsections.push(subsection.id);
          });
      } else if (section.id === "attributes") {
        // Dynamic attributes section
        getAllAttributes().forEach((attr) => {
          subsections.push(attr.id);
        });
      } else if (section.id === "responses") {
        // Dynamic questions section
        getAllQuestions().forEach((question) => {
          subsections.push(question.id);
        });
      }
    });

  return subsections;
};

// Complete list of all subsections in order (programmatically built from indices)
const allSubsections = buildOrderedSubsections();

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

function getNextSection(currentSection) {
  // Normalize the current section to a specific subsection
  let normalizedSection = currentSection;

  // If it's just a section ID, map to the first subsection
  if (currentSection === "executive") {
    normalizedSection = "executive-summary";
  } else if (currentSection === "support") {
    normalizedSection = "support-sentiment";
  } else if (currentSection === "attributes") {
    // If it's just "attributes", map to the first attribute
    const attributes = getAllAttributes();
    normalizedSection = attributes.length > 0 ? attributes[0].id : "attributes";
  } else if (currentSection === "responses") {
    // If it's just "responses", map to the first question
    const questions = getAllQuestions();
    normalizedSection = questions.length > 0 ? questions[0].id : "responses";
  }

  // Find the current section in the ordered list
  const currentIndex = allSubsections.indexOf(normalizedSection);

  // If not found or is last subsection, return null
  if (currentIndex === -1 || currentIndex === allSubsections.length - 1) {
    return null;
  }

  // Return the next subsection
  return allSubsections[currentIndex + 1];
}

function getPreviousSection(currentSection) {
  // Normalize the current section to a specific subsection
  let normalizedSection = currentSection;

  // If it's just a section ID, map to the first subsection
  if (currentSection === "executive") {
    normalizedSection = "executive-summary";
  } else if (currentSection === "support") {
    normalizedSection = "support-sentiment";
  } else if (currentSection === "attributes") {
    // If it's just "attributes", map to the first attribute
    const attributes = getAllAttributes();
    normalizedSection = attributes.length > 0 ? attributes[0].id : "attributes";
  } else if (currentSection === "responses") {
    // If it's just "responses", map to the first question
    const questions = getAllQuestions();
    normalizedSection = questions.length > 0 ? questions[0].id : "responses";
  }

  // Find the current section in the ordered list
  const currentIndex = allSubsections.indexOf(normalizedSection);

  // If not found or is first subsection, return null
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  // Return the previous subsection
  return allSubsections[currentIndex - 1];
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

function getSubsectionTitle(sectionId, maxLength = 40) {
  // If it's a fixed subsection, return from mapping
  if (sectionTitles[sectionId]) {
    return sectionTitles[sectionId];
  }

  // If it's an attribute subsection (attributes-{id})
  if (sectionId.startsWith("attributes-")) {
    const attributeId = sectionId.replace("attributes-", "");
    const attribute = attributeDeepDive.attributes.find(
      (attr) => attr.id === attributeId
    );
    if (attribute) {
      return attribute.name;
    }
  }

  // If it's a question subsection (responses-{id})
  if (sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const displayNumber = getDisplayNumber(questionId);
    return `${uiTexts.surveyHeader.question} ${displayNumber}`;
  }

  // Fallback: return formatted ID
  return sectionId;
}

function getSectionAndSubsection(sectionId, maxLength = 40) {
  const baseSection = sectionId.split("-")[0];
  let sectionTitle = sectionTitles[baseSection] || baseSection;
  let subsectionTitle = getSubsectionTitle(sectionId, maxLength);

  // Special adjustment: for "Attribute Deep Dive", show only "Deep Dive"
  if (sectionTitle === uiTexts.surveyHeader.attributeDeepDive) {
    sectionTitle = uiTexts.surveyHeader.deepDive;
  }

  // Special adjustment: for "Question Analysis", show question number as subtitle
  if (baseSection === "responses" && sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const displayNumber = getDisplayNumber(questionId);
    return {
      section: sectionTitle,
      subsection: `${uiTexts.surveyHeader.question} ${displayNumber}`,
    };
  }

  // If subsection equals section, don't show duplicate
  if (subsectionTitle === sectionTitle) {
    return {
      section: sectionTitle,
      subsection: "",
    };
  }

  return {
    section: sectionTitle,
    subsection: subsectionTitle,
  };
}

export function SurveyHeader({ activeSection, onSectionChange, onMenuClick }) {
  const title = getSectionTitle(activeSection);
  const Icon = getSectionIcon(activeSection);
  const nextSection = getNextSection(activeSection);
  const previousSection = getPreviousSection(activeSection);

  // Show "Next" button whenever there's a next section
  const shouldShowNextButton = !!nextSection;

  // Get formatted section and subsection for buttons
  const previousSectionInfo = previousSection
    ? getSectionAndSubsection(previousSection)
    : null;
  const nextSectionInfo = nextSection
    ? getSectionAndSubsection(nextSection)
    : null;

  // Get section icons for buttons
  const PreviousIcon = previousSection ? getSectionIcon(previousSection) : null;
  const NextIcon = nextSection ? getSectionIcon(nextSection) : null;

  const handleNext = () => {
    if (nextSection && onSectionChange) {
      onSectionChange(nextSection);
    }
  };

  const handlePrevious = () => {
    if (previousSection && onSectionChange) {
      onSectionChange(previousSection);
    }
  };

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

        <div className="flex-1 flex justify-start">
          {previousSection && previousSectionInfo && (
            <button
              onClick={handlePrevious}
              className="relative overflow-hidden rounded-lg px-1.5 py-1 sm:px-4 sm:py-3 text-white flex items-center gap-1 sm:gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: getBlueGradient(),
                boxShadow: getBlueButtonShadow(),
              }}
            >
              <div
                className="w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: RGBA_WHITE_20,
                }}
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              {/* Mobile: icon + subsection side by side */}
              <div className="sm:hidden flex items-center gap-1.5">
                {PreviousIcon && (
                  <PreviousIcon className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                {previousSectionInfo.subsection && (
                  <span className="text-[8px] sm:text-[9px] font-semibold leading-tight whitespace-nowrap max-w-[120px] truncate">
                    {previousSectionInfo.subsection}
                  </span>
                )}
              </div>
              {/* Desktop: section + subsection in column */}
              <div className="hidden sm:flex flex-col items-start">
                <span className="font-semibold text-sm leading-tight">
                  {previousSectionInfo.section}
                </span>
                {previousSectionInfo.subsection && (
                  <span className="text-xs opacity-90 leading-tight">
                    {previousSectionInfo.subsection}
                  </span>
                )}
              </div>
            </button>
          )}
        </div>
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
        <div className="flex-1 flex justify-end items-center gap-2">
          {shouldShowNextButton && nextSectionInfo && (
            <button
              onClick={handleNext}
              className="relative overflow-hidden rounded-lg px-1.5 py-1 sm:px-4 sm:py-3 text-white flex items-center gap-1 sm:gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: getBlueGradient(),
                boxShadow: getBlueButtonShadow(),
              }}
            >
              {/* Mobile: icon + subsection side by side */}
              <div className="sm:hidden flex items-center gap-1.5">
                {NextIcon && <NextIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                {nextSectionInfo.subsection && (
                  <span className="text-[8px] sm:text-[9px] font-semibold leading-tight whitespace-nowrap max-w-[120px] truncate">
                    {nextSectionInfo.subsection}
                  </span>
                )}
              </div>
              {/* Desktop: section + subsection in column */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-semibold text-sm leading-tight">
                  {nextSectionInfo.section}
                </span>
                {nextSectionInfo.subsection && (
                  <span className="text-xs opacity-90 leading-tight">
                    {nextSectionInfo.subsection}
                  </span>
                )}
              </div>
              <div
                className="w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: RGBA_WHITE_20,
                }}
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

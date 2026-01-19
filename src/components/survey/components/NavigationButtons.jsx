import { useMemo } from "react";
import { ChevronRight, ChevronLeft, FileText, getIcon } from "@/lib/icons";
import {
  getBlueGradient,
  getBlueButtonShadow,
  RGBA_WHITE_20,
} from "@/lib/colors";
import { useSurveyData } from "@/hooks/useSurveyData";
import { getAttributesFromData } from "@/services/dataResolver";

/**
 * Get all questions for navigation (sorted by index, using config for hiddenIds)
 * Programmatically built from data
 */
function getAllQuestions(data) {
  const responsesSection = data?.sectionsConfig?.sections?.find(
    (s) => s.id === "responses"
  );
  
  if (!responsesSection?.data?.questions) return [];

  const questions = responsesSection.data.questions;
  const hiddenIds = responsesSection?.data?.config?.questions?.hiddenIds || [];

  const allQuestions = questions
    .filter((q) => !hiddenIds.includes(q.id))
    .sort((a, b) => (a.index || 0) - (b.index || 0));

  return allQuestions.map((q) => ({
    id: `responses-${q.id}`,
    index: q.index || 0,
  }));
}

/**
 * Get display number based on real questionId (renumbering excluding Q3)
 */
function getDisplayNumber(questionId, data) {
  const responsesSection = data?.sectionsConfig?.sections?.find(
    (s) => s.id === "responses"
  );
  
  if (!responsesSection?.data?.questions) return questionId;

  const allQuestions = responsesSection.data.questions
    .filter((q) => q.id !== 3) // Hide Q3
    .sort((a, b) => (a.index || 0) - (b.index || 0));

  const index = allQuestions.findIndex((q) => q.id === questionId);
  return index !== -1 ? index + 1 : questionId;
}

/**
 * Get all attribute subsections for navigation (sorted by index)
 */
function getAllAttributes(data) {
  const attributesSection = data?.sectionsConfig?.sections?.find(
    (s) => s.id === "attributes"
  );
  
  if (!attributesSection?.data?.attributes) return [];

  return attributesSection.data.attributes
    .filter((attr) => attr.icon)
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map((attr) => ({
      id: `attributes-${attr.id}`,
      index: attr.index || 0,
    }));
}

/**
 * Build complete ordered list of all subsections based on indices
 * All logic is programmatic - no hardcoded values
 */
function buildOrderedSubsections(data) {
  if (!data?.sectionsConfig?.sections) return [];

  const subsections = [];

  // Process sections in order
  data.sectionsConfig.sections
    .filter((section) => !section.isRoute) // Exclude routes like "export"
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .forEach((section) => {
      // CRITICAL: Special handling for dynamic sections (attributes, responses)
      // These should ALWAYS use dynamic data, NEVER renderSchema subsections
      // This check MUST come before any renderSchema checks
      if (section.id === "attributes") {
        // Dynamic attributes section - use actual attributes from data
        const attributes = getAllAttributes(data);
        if (attributes.length > 0) {
          attributes.forEach((attr) => {
            subsections.push(attr.id);
          });
        }
        // Don't process renderSchema subsections for attributes - they are templates only
        return; // Skip to next section
      }

      if (section.id === "responses") {
        // Dynamic questions section - use actual questions from data
        const questions = getAllQuestions(data);
        if (questions.length > 0) {
          questions.forEach((question) => {
            subsections.push(question.id);
          });
        }
        // Don't process renderSchema subsections for responses
        return; // Skip to next section
      }

      // Priority 1: Fixed subsections from config
      if (section.subsections && Array.isArray(section.subsections)) {
        section.subsections
          .sort((a, b) => (a.index || 0) - (b.index || 0))
          .forEach((subsection) => {
            subsections.push(subsection.id);
          });
        return; // Skip renderSchema if we have fixed subsections
      }

      // Priority 2: Subsections from renderSchema (for non-dynamic sections only)
      // IMPORTANT: Filter out template subsections (like "attribute-template")
      if (
        section.data?.renderSchema?.subsections &&
        Array.isArray(section.data.renderSchema.subsections)
      ) {
        section.data.renderSchema.subsections
          .filter((sub) => !sub.id?.includes("template")) // Filter out templates
          .sort((a, b) => (a.index || 0) - (b.index || 0))
          .forEach((subsection) => {
            subsections.push(subsection.id);
          });
      }
      // Priority 3: Generic dynamic subsections
      else if (section.dynamicSubsections) {
        // This would need getDynamicSubsections helper, but for now we handle known cases above
      }
    });

  return subsections;
}

/**
 * Get section title from data (programmatic)
 * Priority: sectionsConfig.sections[].name > uiTexts.surveyHeader > sectionId
 */
function getSectionTitleFromData(sectionId, data) {
  if (!data) return sectionId;

  // Extract base section ID (e.g., "executive-summary" -> "executive")
  const baseSectionId = sectionId.split("-")[0];

  // Priority 1: Try to get from sectionsConfig.sections (most reliable)
  if (data?.sectionsConfig?.sections) {
    const section = data.sectionsConfig.sections.find((s) => s.id === baseSectionId);
    if (section?.name) {
      return section.name;
    }
  }

  // Priority 2: Try to get from uiTexts.surveyHeader (legacy support)
  const uiTexts = data?.uiTexts?.surveyHeader;
  if (uiTexts) {
    // Map section IDs to title keys (for backward compatibility)
    const titleMap = {
      executive: uiTexts.executiveReport,
      engagement: uiTexts.engagementAnalysis,
      attributes: uiTexts.attributeAnalysis,
      responses: uiTexts.questionAnalysis,
      questions: uiTexts.questionAnalysis,
      culture: uiTexts.cultureAnalysis,
    };

    if (titleMap[baseSectionId]) {
      return titleMap[baseSectionId];
    }
  }

  // Fallback: return formatted sectionId
  return sectionId;
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
    const attributesSection = data?.sectionsConfig?.sections?.find(
      (s) => s.id === "attributes"
    );
    const attribute = attributesSection?.data?.attributes?.find(
      (attr) => attr.id === attributeId
    );
    if (attribute && attribute.icon) {
      return getIcon(attribute.icon);
    }
    // Fallback to section icon
    if (attributesSection && attributesSection.icon) {
      return getIcon(attributesSection.icon);
    }
  }

  // Check if it's a question subsection
  if (sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const responsesSection = data?.sectionsConfig?.sections?.find(
      (s) => s.id === "responses"
    );
    const allQuestions = responsesSection?.data?.questions || [];
    const question = allQuestions.find((q) => q.id === questionId);
    if (question && question.icon) {
      return getIcon(question.icon);
    }
    // Fallback to section icon
    if (responsesSection && responsesSection.icon) {
      return getIcon(responsesSection.icon);
    }
  }

  // Fallback
  return FileText;
}

/**
 * Helper function to get first subsection (shared logic)
 */
function getFirstSubsectionHelper(sectionId, data) {
  if (!data?.sectionsConfig?.sections) {
    // Fallback for known sections (backward compatibility)
    const fallbacks = {
      executive: "executive-summary",
      support: "support-sentiment",
    };
    return fallbacks[sectionId] || null;
  }

  const section = data.sectionsConfig.sections.find((s) => s.id === sectionId);
  if (!section) return null;

  // Priority 1: Dynamic subsections (attributes, responses) - these should always come first
  if (section.id === "attributes") {
    const attrs = getAllAttributes(data);
    return attrs.length > 0 ? attrs[0].id : null;
  }
  if (section.id === "responses") {
    const questions = getAllQuestions(data);
    return questions.length > 0 ? questions[0].id : null;
  }

  // Priority 2: Fixed subsections from config
  if (section.subsections?.length > 0) {
    const sorted = [...section.subsections].sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999)
    );
    return sorted[0].id;
  }

  // Priority 3: RenderSchema subsections (for non-dynamic sections)
  if (section.data?.renderSchema?.subsections?.length > 0) {
    const sorted = [...section.data.renderSchema.subsections].sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999)
    );
    return sorted[0].id;
  }

  return null;
}

/**
 * Normalize section to specific subsection (programmatic - generic)
 */
function normalizeSection(currentSection, data) {
  if (!data?.sectionsConfig?.sections) {
    // Fallback for known sections (backward compatibility)
    const fallbacks = {
      executive: "executive-summary",
      support: "support-sentiment",
    };
    return fallbacks[currentSection] || currentSection;
  }

  // Check if already a valid subsection (including dynamic ones)
  // First check if it's a dynamic attribute subsection
  // IMPORTANT: Filter out template IDs
  if (
    currentSection.startsWith("attributes-") &&
    !currentSection.includes("template")
  ) {
    const attributeId = currentSection.replace("attributes-", "");
    const attributes = getAttributesFromData(data);
    const attribute = attributes.find(
      (attr) => attr.id === attributeId
    );
    if (attribute) {
      return currentSection; // Already a valid attribute subsection
    }
  }

  // If it's a template, normalize to first real attribute
  if (
    currentSection.includes("template") &&
    currentSection.startsWith("attributes")
  ) {
    const firstSub = getFirstSubsectionHelper("attributes", data);
    return firstSub || currentSection;
  }

  // Check if it's a dynamic question subsection
  if (currentSection.startsWith("responses-")) {
    const questionId = parseInt(currentSection.replace("responses-", ""), 10);
    const question = data?.responseDetails?.questions?.find(
      (q) => q.id === questionId
    );
    if (question) {
      return currentSection; // Already a valid question subsection
    }
  }

  // Check if already a valid fixed subsection
  for (const section of data.sectionsConfig.sections) {
    if (section.subsections?.some((sub) => sub.id === currentSection)) {
      return currentSection;
    }
    if (
      section.data?.renderSchema?.subsections?.some(
        (sub) => sub.id === currentSection
      )
    ) {
      return currentSection;
    }
  }

  // If it's a section ID, normalize to first subsection
  const section = data.sectionsConfig.sections.find(
    (s) => s.id === currentSection
  );
  if (section) {
    const firstSub = getFirstSubsectionHelper(currentSection, data);
    return firstSub || currentSection;
  }

  return currentSection;
}

/**
 * Get next section (programmatic)
 */
function getNextSection(currentSection, data) {
  if (!data) return null;
  
  const allSubsections = buildOrderedSubsections(data);
  const normalizedSection = normalizeSection(currentSection, data);

  // Find the current section in the ordered list
  const currentIndex = allSubsections.indexOf(normalizedSection);

  // If not found, return null
  if (currentIndex === -1) {
    return null;
  }

  // If is last subsection, return null (no next)
  if (currentIndex === allSubsections.length - 1) {
    return null;
  }

  // Get next subsection and filter out any templates
  const nextSub = allSubsections[currentIndex + 1];
  if (nextSub && nextSub.includes("template")) {
    // If next is a template, skip to the one after (if exists)
    if (currentIndex + 2 < allSubsections.length) {
      return allSubsections[currentIndex + 2];
    }
    return null;
  }

  // Return the next subsection
  return nextSub;
}

/**
 * Get previous section (programmatic)
 */
function getPreviousSection(currentSection, data) {
  if (!data) return null;
  
  const allSubsections = buildOrderedSubsections(data);
  const normalizedSection = normalizeSection(currentSection, data);

  // Find the current section in the ordered list
  const currentIndex = allSubsections.indexOf(normalizedSection);

  // If not found, return null
  if (currentIndex === -1) {
    return null;
  }

  // If is first subsection, return null (no previous)
  if (currentIndex === 0) {
    return null;
  }

  // Get previous subsection and filter out any templates
  const prevSub = allSubsections[currentIndex - 1];
  if (prevSub && prevSub.includes("template")) {
    // If previous is a template, skip to the one before (if exists)
    if (currentIndex - 2 >= 0) {
      return allSubsections[currentIndex - 2];
    }
    return null;
  }

  // Return the previous subsection
  return prevSub;
}

/**
 * Get subsection title (programmatic)
 * Priority: sectionConfig.subsections > renderSchema.subsections > uiTexts > ID
 */
function getSubsectionTitle(sectionId, data, maxLength = 40) {
  if (!data) return sectionId;

  // Extract base section ID (e.g., "executive-summary" -> "executive")
  const baseSectionId = sectionId.split("-")[0];
  
  // Find the section config
  const sectionConfig = data?.sectionsConfig?.sections?.find(
    (s) => s.id === baseSectionId
  );

  // Priority 1: Try to get from sectionConfig.subsections
  if (sectionConfig?.subsections && Array.isArray(sectionConfig.subsections)) {
    const subsection = sectionConfig.subsections.find((sub) => sub.id === sectionId);
    if (subsection?.name) {
      return subsection.name;
    }
  }

  // Priority 2: Try to get from renderSchema.subsections
  if (sectionConfig?.data?.renderSchema?.subsections) {
    const subsection = sectionConfig.data.renderSchema.subsections.find(
      (sub) => sub.id === sectionId
    );
    if (subsection?.name) {
      return subsection.name;
    }
  }

  // Priority 3: Try uiTexts.surveyHeader (legacy support)
  const uiTexts = data.uiTexts?.surveyHeader || {};
  const sectionTitle = getSectionTitleFromData(sectionId, data);
  if (sectionTitle !== sectionId) {
    return sectionTitle;
  }

  // Priority 4: If it's an attribute subsection (attributes-{id})
  if (sectionId.startsWith("attributes-") && !sectionId.includes("template")) {
    const attributeId = sectionId.replace("attributes-", "");
    const attributesSection = data?.sectionsConfig?.sections?.find(
      (s) => s.id === "attributes"
    );
    const attribute = attributesSection?.data?.attributes?.find(
      (attr) => attr.id === attributeId
    );
    if (attribute?.name) {
      return attribute.name;
    }
    // Fallback to legacy structure
    const legacyAttribute = data?.attributeDeepDive?.attributes?.find(
      (attr) => attr.id === attributeId
    );
    if (legacyAttribute?.name) {
      return legacyAttribute.name;
    }
  }

  // Priority 5: If it's a template (like "attribute-template"), return empty
  if (sectionId.includes("template")) {
    return ""; // Don't show template names in navigation
  }

  // Priority 6: If it's a question subsection (responses-{id})
  if (sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const displayNumber = getDisplayNumber(questionId, data);
    return `${uiTexts.question || "Questão"} ${displayNumber}`;
  }

  // Fallback: format ID nicely (e.g., "executive-summary" -> "Executive Summary")
  return sectionId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get section and subsection info (programmatic)
 */
function getSectionAndSubsection(sectionId, data, maxLength = 40) {
  if (!data) {
    return { section: sectionId, subsection: "" };
  }

  // IMPORTANT: If it's a template, try to normalize to real subsection first
  if (sectionId.includes("template")) {
    // For attribute-template, try to get first real attribute
    if (sectionId.startsWith("attributes")) {
      const firstAttr = getFirstSubsectionHelper("attributes", data);
      if (firstAttr) {
        // Recursively call with the real attribute ID
        return getSectionAndSubsection(firstAttr, data, maxLength);
      }
    }
    // For other templates, return empty subsection
    return {
      section: getSectionTitleFromData(sectionId.split("-")[0], data),
      subsection: "",
    };
  }

  const uiTexts = data.uiTexts?.surveyHeader || {};
  const baseSection = sectionId.split("-")[0];
  let sectionTitle = getSectionTitleFromData(baseSection, data);
  let subsectionTitle = getSubsectionTitle(sectionId, data, maxLength);

  // Special adjustment: for "Attribute Deep Dive", show only "Deep Dive"
  // Check if sectionTitle matches attribute analysis title
  const attributeAnalysisTitle = uiTexts.attributeAnalysis || "Análise por Atributos";
  if (sectionTitle === attributeAnalysisTitle || sectionTitle.includes("Atributos")) {
    sectionTitle = uiTexts.deepDive || "Aprofundamento";
  }

  // Special adjustment: for "Question Analysis", show question number as subtitle
  if (baseSection === "responses" && sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const displayNumber = getDisplayNumber(questionId, data);
    return {
      section: sectionTitle,
      subsection: `${uiTexts.question || "Questão"} ${displayNumber}`,
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

export function NavigationButtons({ currentSection, onSectionChange }) {
  const { data, loading } = useSurveyData();

  // Build ordered subsections from data
  const allSubsections = useMemo(() => {
    if (!data || loading) return [];
    return buildOrderedSubsections(data);
  }, [data, loading]);

  // Get next and previous sections
  const nextSection = useMemo(() => {
    if (!data || loading) return null;
    return getNextSection(currentSection, data);
  }, [currentSection, data, loading]);

  const previousSection = useMemo(() => {
    if (!data || loading) return null;
    return getPreviousSection(currentSection, data);
  }, [currentSection, data, loading]);

  // Show "Next" button whenever there's a next section
  const shouldShowNextButton = !!nextSection;

  // Get formatted section and subsection for buttons
  const previousSectionInfo = useMemo(() => {
    if (!previousSection) return null;
    return getSectionAndSubsection(previousSection, data);
  }, [previousSection, data]);

  const nextSectionInfo = useMemo(() => {
    if (!nextSection) return null;
    return getSectionAndSubsection(nextSection, data);
  }, [nextSection, data]);

  // Get section icons for buttons
  const PreviousIcon = previousSection
    ? getSectionIconFromConfig(previousSection, data)
    : null;
  const NextIcon = nextSection
    ? getSectionIconFromConfig(nextSection, data)
    : null;

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

  const previousButton =
    previousSection && previousSectionInfo ? (
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
    ) : null;

  const nextButton =
    shouldShowNextButton && nextSectionInfo ? (
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
    ) : null;

  return {
    previousButtonDiv: (
      <div className="flex-1 flex justify-start">{previousButton}</div>
    ),
    nextButtonDiv: (
      <div className="flex-1 flex justify-end items-center gap-2">
        {nextButton}
      </div>
    ),
  };
}

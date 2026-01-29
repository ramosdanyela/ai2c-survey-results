import { useMemo } from "react";
import { ChevronRight, ChevronLeft, FileText, getIcon } from "@/lib/icons";
import {
  getBlueGradient,
  getBlueButtonShadow,
  RGBA_WHITE_20,
} from "@/lib/colors";
import { useSurveyData } from "@/hooks/useSurveyData";
import { getQuestionsFromData } from "@/services/dataResolver";

/**
 * Get all questions for navigation (sorted by index)
 * Programmatically built from data
 * Uses getQuestionsFromData to support both new (sectionConfig.questions) and old structures
 */
function getAllQuestions(data) {
  const allQuestions = getQuestionsFromData(data).sort(
    (a, b) => (a.index || 0) - (b.index || 0),
  );

  return allQuestions.map((q) => ({
    id: `responses-${q.id}`,
    index: q.index || 0,
  }));
}

/**
 * Get display number based on real questionId (1-based index in sorted list)
 * Uses getQuestionsFromData to support both new (sectionConfig.questions) and old structures
 */
function getDisplayNumber(questionId, data) {
  const allQuestions = getQuestionsFromData(data).sort(
    (a, b) => (a.index || 0) - (b.index || 0),
  );

  const index = allQuestions.findIndex((q) => q.id === questionId);
  return index !== -1 ? index + 1 : questionId;
}

/**
 * Build complete ordered list of all subsections based on indices
 * All logic is programmatic - no hardcoded values
 */
function buildOrderedSubsections(data) {
  if (!data?.sections) return [];

  const subsections = [];

  // Process sections in order
  data.sections
    .filter((section) => section.id !== "export") // Export é página do app; usa sections/subsections e uiTexts, não é seção de conteúdo
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .forEach((section) => {
      // Special handling for dynamic sections (responses - subsections from questions)
      if (section.id === "responses") {
        // Dynamic questions section - use actual questions from data
        const questions = getAllQuestions(data);
        if (questions.length > 0) {
          questions.forEach((question) => {
            subsections.push(question.id);
          });
        }
        return; // Skip to next section
      }

      // Fixed subsections (executive, support, attributes, etc.)
      if (section.subsections && Array.isArray(section.subsections)) {
        section.subsections
          .sort((a, b) => (a.index || 0) - (b.index || 0))
          .forEach((subsection) => {
            subsections.push(subsection.id);
          });
      }

      // Priority 2: Generic dynamic subsections
      else if (section.dynamicSubsections) {
        // This would need getDynamicSubsections helper, but for now we handle known cases above
      }
    });

  return subsections;
}

/**
 * Find which section contains a given subsection ID
 * Returns the section ID that contains the subsection, or null if not found
 */
function findSectionForSubsection(subsectionId, data) {
  if (!data?.sections || !subsectionId) return null;

  // Check if subsectionId matches a section ID exactly
  const exactMatch = data.sections.find((s) => s.id === subsectionId);
  if (exactMatch) {
    return subsectionId;
  }

  // Find which section contains this subsection
  for (const section of data.sections) {
    // Check subsections from config
    if (section.subsections) {
      const subsection = section.subsections.find(
        (sub) => sub.id === subsectionId,
      );
      if (subsection) {
        return section.id;
      }
    }
    // Check dynamic subsections (responses)
    if (
      section.id === "responses" &&
      subsectionId &&
      typeof subsectionId === "string" &&
      subsectionId.startsWith("responses-")
    ) {
      return section.id;
    }
  }

  return null;
}

/**
 * Get section title from data (programmatic)
 * Priority: sectionsConfig.sections[].name > formatted sectionId
 */
function getSectionTitleFromData(sectionId, data) {
  if (!data || !sectionId) return sectionId;

  // Priority 1: Try to get from sections (most reliable)
  if (data?.sections) {
    const section = data.sections.find((s) => s.id === sectionId);
    if (section?.name) {
      return section.name;
    }
  }

  // Fallback: format sectionId nicely instead of returning raw ID
  if (typeof sectionId === "string") {
    return sectionId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return sectionId;
}

/**
 * Get icon for a section or subsection (programmatic)
 */
function getSectionIconFromData(sectionId, data) {
  if (!data?.sections) return FileText;

  // First try to find exact match in sectionsConfig
  for (const section of data.sections) {
    // Check if it's the main section
    if (section.id === sectionId) {
      return getIcon(section.icon);
    }
    // Check subsections
    if (section.subsections && Array.isArray(section.subsections)) {
      const subsection = section.subsections.find(
        (sub) => sub.id === sectionId,
      );
      if (subsection && subsection.icon) {
        return getIcon(subsection.icon);
      }
    }
  }

  // Check if it's a question subsection
  if (
    sectionId &&
    typeof sectionId === "string" &&
    sectionId.startsWith("responses-")
  ) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const responsesSection = data?.sections?.find((s) => s.id === "responses");
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

  // Dynamic subsections from questions (responses section only)
  if (section.id === "responses") {
    const questions = getAllQuestions(data);
    return questions.length > 0 ? questions[0].id : null;
  }

  // Fixed subsections from config (executive, support, attributes, etc.)
  if (section.subsections?.length > 0) {
    const sorted = [...section.subsections].sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999),
    );
    return sorted[0].id;
  }

  return null;
}

/**
 * Normalize section to specific subsection (programmatic - generic)
 */
function normalizeSection(currentSection, data) {
  if (!currentSection) return currentSection;

  if (!data?.sections) {
    // Fallback for known sections (backward compatibility)
    const fallbacks = {
      executive: "executive-summary",
      support: "support-sentiment",
    };
    return fallbacks[currentSection] || currentSection;
  }

  // Check if already a valid subsection (any section with subsections)
  if (currentSection && typeof currentSection === "string") {
    if (!currentSection.includes("template")) {
      for (const section of data.sections) {
        if (section.subsections?.some((sub) => sub.id === currentSection)) {
          return currentSection;
        }
      }
    }
    // If it's a template (e.g. attributes-template), normalize to first real subsection
    if (currentSection.includes("template")) {
      const sectionIdFromTemplate = currentSection.replace(/-template.*/, "");
      const firstSub = getFirstSubsectionHelper(sectionIdFromTemplate, data);
      if (firstSub) return firstSub;
    }
  }

  // Check if it's a dynamic question subsection
  if (
    currentSection &&
    typeof currentSection === "string" &&
    currentSection.startsWith("responses-")
  ) {
    const questionId = parseInt(currentSection.replace("responses-", ""), 10);
    const question = data?.responseDetails?.questions?.find(
      (q) => q.id === questionId,
    );
    if (question) {
      return currentSection; // Already a valid question subsection
    }
  }

  // Check if already a valid fixed subsection
  for (const section of data.sections) {
    if (section.subsections?.some((sub) => sub.id === currentSection)) {
      return currentSection;
    }
  }

  // If it's a section ID, normalize to first subsection
  const section = data.sections.find((s) => s.id === currentSection);
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
 * Priority: sectionConfig.subsections > uiTexts > attributes > ID
 */
function getSubsectionTitle(sectionId, data, maxLength = 40) {
  if (!data || !sectionId) return sectionId;

  // Priority 1: Search for subsection in ALL sections (fixes cases like "retention-intent" in "engagement" section)
  if (data?.sections && Array.isArray(data.sections)) {
    for (const section of data.sections) {
      if (section?.subsections && Array.isArray(section.subsections)) {
        const subsection = section.subsections.find(
          (sub) => sub.id === sectionId,
        );
        if (subsection?.name) {
          return subsection.name;
        }
      }
    }
  }

  // Priority 2: If it's a template (like "attribute-template"), return empty
  if (
    sectionId &&
    typeof sectionId === "string" &&
    sectionId.includes("template")
  ) {
    return ""; // Don't show template names in navigation
  }

  // Priority 3: If it's a question subsection (responses-{id})
  if (
    sectionId &&
    typeof sectionId === "string" &&
    sectionId.startsWith("responses-")
  ) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const displayNumber = getDisplayNumber(questionId, data);
    const uiTexts = data?.uiTexts?.surveyHeader || {};
    return `${uiTexts.question || "Questão"} ${displayNumber}`;
  }

  // Fallback: format ID nicely (e.g., "executive-summary" -> "Executive Summary")
  if (!sectionId || typeof sectionId !== "string") return sectionId;
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

  // If it's a template (e.g. attributes-template), normalize to first real subsection
  if (
    sectionId &&
    typeof sectionId === "string" &&
    sectionId.includes("template")
  ) {
    const sectionIdFromTemplate = sectionId.replace(/-template.*/, "");
    const firstSub = getFirstSubsectionHelper(sectionIdFromTemplate, data);
    if (firstSub) {
      return getSectionAndSubsection(firstSub, data, maxLength);
    }
    const templateSectionId = findSectionForSubsection(sectionId, data);
    return {
      section: getSectionTitleFromData(templateSectionId || sectionId, data),
      subsection: "",
    };
  }

  const uiTexts = data.uiTexts?.surveyHeader || {};

  // Find the section that contains this subsection (don't use baseSectionId extraction)
  const actualSectionId = findSectionForSubsection(sectionId, data);

  // If we couldn't find the section, it means sectionId might be a section ID itself
  // In that case, use it directly
  const sectionIdToUse = actualSectionId || sectionId;

  // Get section title - always use the section name from data, never formatted IDs
  let sectionTitle = null;
  if (actualSectionId) {
    const section = data?.sections?.find((s) => s.id === actualSectionId);
    if (section?.name) {
      sectionTitle = section.name;
    }
  }

  // Fallback to getSectionTitleFromData only if we didn't find a section name
  if (!sectionTitle) {
    sectionTitle = getSectionTitleFromData(sectionIdToUse, data);
  }

  // Get subsection title - always use the subsection name from data
  let subsectionTitle = getSubsectionTitle(sectionId, data, maxLength);

  // Special adjustment: for "Attribute Deep Dive", show only "Deep Dive"
  // Check if sectionTitle matches attribute analysis title
  const attributeAnalysisTitle =
    uiTexts.attributeAnalysis || "Análise por Atributos";
  if (
    sectionTitle === attributeAnalysisTitle ||
    (sectionTitle &&
      typeof sectionTitle === "string" &&
      sectionTitle.includes("Atributos"))
  ) {
    sectionTitle = uiTexts.deepDive || "Aprofundamento";
  }

  // Special adjustment: for "Question Analysis", show question number as subtitle
  // If sectionId starts with "responses-", it's a question subsection
  if (
    sectionId &&
    typeof sectionId === "string" &&
    sectionId.startsWith("responses-")
  ) {
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
    ? getSectionIconFromData(previousSection, data)
    : null;
  const NextIcon = nextSection
    ? getSectionIconFromData(nextSection, data)
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

import { ExecutiveReport } from "@/components/survey/sections/ExecutiveReport";
import { SupportAnalysis } from "@/components/survey/sections/SupportAnalysis";
import { ResponseDetails } from "@/components/survey/sections/ResponseDetails";
import { AttributeDeepDive } from "@/components/survey/sections/AttributeDeepDive";
import { GenericSectionRenderer } from "@/components/survey/common/GenericSectionRenderer";
import { responseDetails, attributeDeepDive } from "@/data/surveyData";
import { useSurveyData } from "@/hooks/useSurveyData";
import { useMemo } from "react";

/**
 * Helper function to get first subsection (shared with SurveySidebar logic)
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

  // Priority 1: Subsections from config
  if (section.subsections?.length > 0) {
    const sorted = [...section.subsections].sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999)
    );
    return sorted[0].id;
  }

  // Priority 2: RenderSchema subsections
  if (section.data?.renderSchema?.subsections?.length > 0) {
    const sorted = [...section.data.renderSchema.subsections].sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999)
    );
    return sorted[0].id;
  }

  // Priority 3: Dynamic subsections (attributes, responses)
  if (section.dynamicSubsections) {
    if (section.id === "attributes") {
      const attrs = data?.attributeDeepDive?.attributes || [];
      const filtered = attrs
        .filter((a) => a.icon)
        .sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
      return filtered.length > 0 ? `attributes-${filtered[0].id}` : null;
    }
    if (section.id === "responses") {
      const questions = data?.responseDetails?.questions || [];
      const responsesSection = data?.sectionsConfig?.sections?.find(
        (s) => s.id === "responses"
      );
      const hiddenIds =
        responsesSection?.data?.config?.questions?.hiddenIds || [];
      const filtered = questions
        .filter((q) => !hiddenIds.includes(q.id))
        .sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
      return filtered.length > 0 ? `responses-${filtered[0].id}` : null;
    }
  }

  return null;
}

/**
 * Normalize section ID to first subsection
 */
function normalizeSection(activeSection, data) {
  if (!data?.sectionsConfig?.sections) {
    // Fallback for known sections (backward compatibility)
    const fallbacks = {
      executive: "executive-summary",
      support: "support-sentiment",
    };
    return fallbacks[activeSection] || activeSection;
  }

  // Check if already a valid subsection
  for (const section of data.sectionsConfig.sections) {
    if (section.subsections?.some((sub) => sub.id === activeSection)) {
      return activeSection;
    }
    if (
      section.data?.renderSchema?.subsections?.some(
        (sub) => sub.id === activeSection
      )
    ) {
      return activeSection;
    }
  }

  // If it's a section ID, normalize to first subsection
  const section = data.sectionsConfig.sections.find(
    (s) => s.id === activeSection
  );
  if (section) {
    const firstSub = getFirstSubsectionHelper(activeSection, data);
    return firstSub || activeSection;
  }

  return activeSection;
}

// Get all questions for navigation (sorted by index, using config for hiddenIds)
const getAllQuestions = (data) => {
  const questions =
    data?.responseDetails?.questions || responseDetails.questions || [];
  const responsesSection = data?.sectionsConfig?.sections?.find(
    (s) => s.id === "responses"
  );
  const hiddenIds = responsesSection?.data?.config?.questions?.hiddenIds || [];

  return questions
    .filter((q) => !hiddenIds.includes(q.id))
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map((q) => `responses-${q.id}`);
};

// Get all attribute subsections for navigation (sorted by index)
// Note: This is kept for backward compatibility but normalization now uses getFirstSubsectionHelper
const getAllAttributes = () => {
  return attributeDeepDive.attributes
    .filter((attr) => attr.icon)
    .sort((a, b) => (a.index || 0) - (b.index || 0))
    .map((attr) => `attributes-${attr.id}`);
};

/**
 * Check if a section has a renderSchema (generic rendering)
 */
function hasRenderSchema(data, sectionId) {
  if (!data || !sectionId) return false;

  // First check in sectionsConfig for hasSchema flag
  const sectionConfig = data.sectionsConfig?.sections?.find(
    (s) => s.id === sectionId
  );
  if (sectionConfig?.hasSchema) {
    return true;
  }

  // Check sectionConfig.data.renderSchema (new structure)
  if (sectionConfig?.data?.renderSchema) {
    return true;
  }

  // Then try to find section data with renderSchema
  const sectionData = data[sectionId];
  if (sectionData && sectionData.renderSchema) {
    return true;
  }

  return false;
}

/**
 * Extract section ID from activeSection by checking sectionsConfig
 * Handles formats like: "section-id", "section-id-subsection-id"
 */
function extractSectionId(data, activeSection) {
  if (!data?.sectionsConfig?.sections) {
    return null;
  }

  // Check if activeSection matches a section ID exactly
  const exactMatch = data.sectionsConfig.sections.find(
    (s) => s.id === activeSection
  );
  if (exactMatch) {
    return activeSection;
  }

  // Check if activeSection matches a subsection ID
  // Find which section contains this subsection
  for (const section of data.sectionsConfig.sections) {
    // Check subsections from config
    if (section.subsections) {
      const subsection = section.subsections.find(
        (sub) => sub.id === activeSection
      );
      if (subsection) {
        return section.id;
      }
    }
    // Check subsections from renderSchema
    if (section.data?.renderSchema?.subsections) {
      const subsection = section.data.renderSchema.subsections.find(
        (sub) => sub.id === activeSection
      );
      if (subsection) {
        return section.id;
      }
    }
    // Check dynamic subsections (attributes, responses)
    if (
      section.id === "attributes" &&
      activeSection.startsWith("attributes-")
    ) {
      return section.id;
    }
    if (section.id === "responses" && activeSection.startsWith("responses-")) {
      return section.id;
    }
  }

  // If no match, try to extract from pattern (e.g., "nova-secao-subsec" -> "nova-secao")
  // This is a fallback for sections with schema that might not be in sectionsConfig yet
  const parts = activeSection.split("-");
  if (parts.length >= 2) {
    // Try all possible combinations from longest to shortest
    for (let i = parts.length; i >= 1; i--) {
      const potentialId = parts.slice(0, i).join("-");
      const section = data.sectionsConfig.sections.find(
        (s) => s.id === potentialId
      );
      if (section) {
        // Check if it's a dynamic subsection or regular subsection
        if (section.dynamicSubsections) {
          return section.id;
        }
        // Check if activeSection matches a subsection of this section
        if (section.subsections?.some((sub) => sub.id === activeSection)) {
          return section.id;
        }
        if (
          section.data?.renderSchema?.subsections?.some(
            (sub) => sub.id === activeSection
          )
        ) {
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

export function ContentRenderer({ activeSection, onSectionChange }) {
  const { data } = useSurveyData();
  let content;

  // Normalize activeSection to ensure it's a specific subsection (dynamic)
  const normalizedSection = useMemo(() => {
    return normalizeSection(activeSection, data);
  }, [activeSection, data]);

  // Check if this section uses generic rendering (has renderSchema)
  // First, try to extract section ID from normalizedSection
  const sectionId = data ? extractSectionId(data, normalizedSection) : null;

  // If sectionId is null but normalizedSection matches a known pattern, try to extract it
  let finalSectionId = sectionId;
  if (!finalSectionId && normalizedSection) {
    if (normalizedSection.startsWith("support-")) {
      finalSectionId = "support";
    } else if (normalizedSection.startsWith("attributes-")) {
      finalSectionId = "attributes";
    } else if (normalizedSection.startsWith("responses-")) {
      finalSectionId = "responses";
    } else if (normalizedSection.startsWith("executive-")) {
      finalSectionId = "executive";
    }
  }

  // Check if section has renderSchema
  // IMPORTANT: Only use generic renderer if section actually has schema
  // BUT: support section always uses legacy component, even with schema
  if (
    finalSectionId &&
    data &&
    hasRenderSchema(data, finalSectionId) &&
    finalSectionId !== "support"
  ) {
    // Use generic renderer (but not for support)
    content = (
      <GenericSectionRenderer
        sectionId={finalSectionId}
        subSection={normalizedSection}
      />
    );
  }
  // Render support analyses (legacy - always uses legacy component)
  // But also check if it's a valid support subsection first
  else if (
    normalizedSection.startsWith("support-") ||
    finalSectionId === "support"
  ) {
    // Check if it's a valid subsection
    const supportSection = data?.sectionsConfig?.sections?.find(
      (s) => s.id === "support"
    );
    const isValidSubsection =
      supportSection?.subsections?.some(
        (sub) => sub.id === normalizedSection
      ) ||
      supportSection?.data?.renderSchema?.subsections?.some(
        (sub) => sub.id === normalizedSection
      );

    if (isValidSubsection || normalizedSection.startsWith("support-")) {
      // Always pass the specific subsection
      content = <SupportAnalysis subSection={normalizedSection} />;
    } else {
      // Invalid subsection, fallback to first
      const firstSub =
        getFirstSubsectionHelper("support", data) || "support-sentiment";
      content = <SupportAnalysis subSection={firstSub} />;
    }
  }
  // Render response details (legacy - only if no schema)
  else if (
    (normalizedSection === "responses" ||
      normalizedSection.startsWith("responses-")) &&
    !(data && hasRenderSchema(data, "responses"))
  ) {
    // Extract question ID if it's a specific subsection (e.g., responses-1)
    const questionIdMatch = normalizedSection.match(/responses-(\d+)/);
    const questionId = questionIdMatch
      ? parseInt(questionIdMatch[1], 10)
      : undefined;
    // Use key to ensure component updates when questionId changes
    // This ensures the combined logic (open accordion + scroll) is applied
    content = (
      <ResponseDetails key={`question-${questionId}`} questionId={questionId} />
    );
  }
  // Render attribute deep dive (legacy - only if no schema)
  else if (
    (normalizedSection === "attributes" ||
      normalizedSection.startsWith("attributes-")) &&
    !(data && hasRenderSchema(data, "attributes"))
  ) {
    // Extract attribute ID if it's a specific subsection (e.g., attributes-customerType)
    const attributeIdMatch = normalizedSection.match(/attributes-(.+)/);
    const attributeId = attributeIdMatch ? attributeIdMatch[1] : undefined;
    content = <AttributeDeepDive attributeId={attributeId} />;
  }
  // Fallback: if we couldn't determine the section, try to extract from normalizedSection
  else {
    // Try to extract section ID from pattern (e.g., "support-sentiment" -> "support")
    const fallbackSectionId = extractSectionId(data, normalizedSection);

    if (fallbackSectionId && data && hasRenderSchema(data, fallbackSectionId)) {
      // Use generic renderer with fallback section
      content = (
        <GenericSectionRenderer
          sectionId={fallbackSectionId}
          subSection={normalizedSection}
        />
      );
    } else {
      // Last resort: use executive as fallback
      if (data && hasRenderSchema(data, "executive")) {
        content = (
          <GenericSectionRenderer
            sectionId="executive"
            subSection="executive-summary"
          />
        );
      } else {
        // Legacy fallback only if no schema
        content = (
          <ExecutiveReport
            subSection="executive-summary"
            onSectionChange={onSectionChange}
          />
        );
      }
    }
  }

  return <div className="space-y-8">{content}</div>;
}

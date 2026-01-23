import { GenericSectionRenderer } from "@/components/survey/common/GenericSectionRenderer";
import { useSurveyData } from "@/hooks/useSurveyData";
import { useMemo } from "react";
import {
  getQuestionsFromData,
} from "@/services/dataResolver";

/**
 * Helper function to get first subsection (shared with SurveySidebar logic)
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
    // Return first subsection by ID (no ordering since index was removed)
    return section.data.renderSchema.subsections[0].id;
  }

  // Priority 3: Respostas (questões em sections ou responseDetails)
  if (section.id === "responses") {
    const questions = getQuestionsFromData(data).sort(
      (a, b) => (a.index ?? 999) - (b.index ?? 999)
    );
    return questions.length > 0 ? `responses-${questions[0].id}` : null;
  }

  return null;
}

/**
 * Normalize section ID to first subsection
 */
function normalizeSection(activeSection, data) {
  if (!data?.sections) {
    // Fallback for known sections (backward compatibility)
    const fallbacks = {
      executive: "executive-summary",
      support: "support-sentiment",
      engagement: "engagement-sentiment",
    };
    return fallbacks[activeSection] || activeSection;
  }

  // Check if already a valid subsection
  for (const section of data.sections) {
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
    // Subseções dinâmicas: responses-*
    if (
      section.id === "responses" &&
      activeSection?.startsWith("responses-")
    ) {
      return activeSection;
    }
    // Subseções dinâmicas: attributes-*
    if (
      section.id === "attributes" &&
      activeSection?.startsWith("attributes-")
    ) {
      return activeSection;
    }
  }

  // If it's a section ID, normalize to first subsection
  const section = data.sections.find(
    (s) => s.id === activeSection
  );
  if (section) {
    const firstSub = getFirstSubsectionHelper(activeSection, data);
    return firstSub || activeSection;
  }

  return activeSection;
}

/**
 * Indica se a seção usa GenericSectionRenderer.
 * Inclui: (1) seções com renderSchema no JSON; (2) seções com subsections/components (nova estrutura);
 * (3) responses, que é renderizada por lógica própria em GenericSectionRenderer (dados em
 * sections[].data.questions).
 */
function hasRenderSchema(data, sectionId) {
  if (!data || !sectionId) return false;

  const sectionConfig = data.sections?.find(
    (s) => s.id === sectionId
  );
  if (!sectionConfig) return false;

  // responses: aceita se existir seção e dados de questões (lógica em GenericSectionRenderer)
  if (sectionId === "responses") {
    return getQuestionsFromData(data).length > 0;
  }

  // NOVA ESTRUTURA: Seção tem subsections (com ou sem components - o GenericSectionRenderer vai lidar)
  // Se tem subsections, significa que a seção tem estrutura para renderizar
  if (sectionConfig.subsections && Array.isArray(sectionConfig.subsections) && sectionConfig.subsections.length > 0) {
    return true;
  }

  // ESTRUTURA ANTIGA: renderSchema em sectionConfig.data ou em data[sectionId]
  if (sectionConfig?.data?.renderSchema) return true;
  const sectionData = data[sectionId];
  if (sectionData && sectionData.renderSchema) return true;

  return false;
}

/**
 * Extract section ID from activeSection by checking sections
 * Handles formats like: "section-id", "section-id-subsection-id"
 */
function extractSectionId(data, activeSection) {
  if (!data?.sections) {
    return null;
  }

  // Check if activeSection matches a section ID exactly
  const exactMatch = data.sections.find(
    (s) => s.id === activeSection
  );
  if (exactMatch) {
    return activeSection;
  }

  // Check if activeSection matches a subsection ID
  // Find which section contains this subsection
  for (const section of data.sections) {
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
    // Check dynamic subsections (responses)
    if (
      section.id === "responses" &&
      activeSection &&
      activeSection.startsWith("responses-")
    ) {
      return section.id;
    }
    // Check dynamic subsections (attributes)
    if (
      section.id === "attributes" &&
      activeSection &&
      activeSection.startsWith("attributes-")
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
      const section = data.sections.find(
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

export function ContentRenderer({ activeSection }) {
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
  if (
    !finalSectionId &&
    normalizedSection &&
    typeof normalizedSection === "string"
  ) {
    if (normalizedSection.startsWith("support-")) {
      finalSectionId = "support";
    } else if (normalizedSection.startsWith("responses-")) {
      finalSectionId = "responses";
    } else if (normalizedSection.startsWith("attributes-")) {
      finalSectionId = "attributes";
    } else if (normalizedSection.startsWith("executive-")) {
      finalSectionId = "executive";
    } else if (normalizedSection.startsWith("engagement-")) {
      finalSectionId = "engagement";
    }
  }

  // Use generic renderer if section has schema
  // All sections must have schema in JSON - this is the "proof of fire"
  // Try finalSectionId first, then fallback to extractSectionId
  let sectionIdToUse = finalSectionId || extractSectionId(data, normalizedSection);
  
  if (sectionIdToUse && data && hasRenderSchema(data, sectionIdToUse)) {
    content = (
      <GenericSectionRenderer
        sectionId={sectionIdToUse}
        subSection={normalizedSection}
      />
    );
  } else {
    // Error state: section not found or missing schema
    const commonTexts = data?.uiTexts?.common?.section || {};
    const sectionNotFound =
      commonTexts.sectionNotFound || "Section not found";
    const sectionNotFoundDescription =
      commonTexts.sectionNotFoundDescription ||
      `The section "${normalizedSection}" was not found or does not have a rendering schema.`;
    const sectionIdLabel = commonTexts.sectionId || "Section ID:";

    // Replace {{section}} placeholder if present
    const description = sectionNotFoundDescription.replace(
      "{{section}}",
      normalizedSection
    );

    content = (
      <div className="space-y-8 animate-fade-in p-8 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-semibold mb-2">{sectionNotFound}</p>
          <p className="text-sm">{description}</p>
          {sectionIdToUse && (
            <p className="text-xs mt-2">
              {sectionIdLabel} {sectionIdToUse}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <div className="space-y-8">{content}</div>;
}

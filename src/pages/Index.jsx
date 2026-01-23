import { useState, useMemo, useEffect } from "react";
import { SurveyLayout } from "@/components/survey/components/SurveyLayout";
import { useSurveyData } from "@/hooks/useSurveyData";

/**
 * Helper function to get first subsection of a section
 */
function getFirstSubsectionHelper(sectionId, data) {
  if (!data?.sections) {
    return null;
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
      const sectionData = section.data || {};
      const attrs = sectionData?.attributes || [];
      const filtered = attrs
        .filter((a) => a.icon)
        .sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
      return filtered.length > 0 ? `attributes-${filtered[0].id}` : null;
    }
    if (section.id === "responses") {
      const sectionData = section.data || {};
      const questions = (sectionData?.questions || [])
        .sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
      return questions.length > 0 ? `responses-${questions[0].id}` : null;
    }
  }

  return null;
}

/**
 * Get the first section/subsection from data dynamically
 */
function getInitialSection(data) {
  if (
    !data?.sections ||
    data.sections.length === 0
  ) {
    return null;
  }

  // Get first section (sorted by index)
  const sortedSections = [...data.sections].sort(
    (a, b) => (a.index ?? 999) - (b.index ?? 999)
  );
  const firstSection = sortedSections[0];

  // Get first subsection of first section
  const firstSubsection = getFirstSubsectionHelper(firstSection.id, data);

  return firstSubsection || firstSection.id;
}

export default function Index() {
  const { loading, data } = useSurveyData();

  // Calculate initial section dynamically from data
  const initialSection = useMemo(() => {
    return getInitialSection(data);
  }, [data]);

  const [activeSection, setActiveSection] = useState(initialSection);

  // Update activeSection when data loads and initialSection changes
  useEffect(() => {
    if (!loading && data && initialSection) {
      setActiveSection(initialSection);
    }
  }, [loading, data, initialSection]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SurveyLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    />
  );
}

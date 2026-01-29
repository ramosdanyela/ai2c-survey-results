import { getQuestionsFromData } from "@/services/dataResolver";

/**
 * Get all available subsections for a given section
 */
export function getAllSubsectionsForSection(sectionId, data) {
  // Get sections from data - must come from hook
  if (!data?.sections) return [];
  const section = data.sections.find((s) => s.id === sectionId);
  if (!section) return [];

  // Seção com subseções (executive, support, attributes, etc.)
  if (section.subsections?.length > 0) {
    return section.subsections
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .map((sub) => ({
        sectionId: section.id,
        subsectionId: sub.id,
        label: sub.name,
      }));
  }

  // Seção responses: subseções dinâmicas a partir de questions
  if (sectionId === "responses") {
    // Use getQuestionsFromData which gets questions from sections[id="responses"].questions
    const allQuestions = getQuestionsFromData(data);

    if (allQuestions.length === 0) {
      console.warn("Export: No questions found", {
        hasData: !!data,
        hasSections: !!data?.sections,
        responsesSection: data?.sections?.find((s) => s.id === "responses"),
      });
      return [];
    }

    // Não aplicar filtros que ocultam questões - todas as questões devem ser exportadas
    // Ordenar questões pelo index do JSON
    const sortedQuestions = allQuestions.sort(
      (a, b) => (a.index || 0) - (b.index || 0),
    );

    return sortedQuestions.map((q, index) => {
      const displayNumber = index + 1;
      return {
        sectionId: "responses",
        subsectionId: `responses-${q.id}`,
        label: `Pergunta ${displayNumber}: ${
          q.question && q.question.length > 60
            ? q.question.substring(0, 60) + "..."
            : q.question || ""
        }`,
      };
    });
  }

  return [];
}

/**
 * Get all subsections for all sections (for full report)
 */
export function getAllSubsections(data) {
  const allSubsections = [];

  // Get sections from data - must come from hook
  if (!data?.sections) return [];

  data.sections
    .filter((section) => section.id !== "export") // Export é página do app, não seção de conteúdo
    .forEach((section) => {
      const subsections = getAllSubsectionsForSection(section.id, data);
      allSubsections.push(...subsections);
    });

  return allSubsections;
}

/**
 * Parse selected sections from URL params or array
 * Returns array of { sectionId, subsectionId } objects
 */
export function parseSelectedSections(
  selectedSectionsArray,
  exportFullReport,
  data,
) {
  if (exportFullReport) {
    // Return all subsections
    return getAllSubsections(data);
  }

  // Parse selected subsection IDs
  const parsed = [];

  // Get sections from data - must come from hook
  if (!data?.sections) return [];

  selectedSectionsArray.forEach((subsectionId) => {
    let sectionId = null;
    const sectionWithSub = data.sections.find((s) =>
      s.subsections?.some((sub) => sub.id === subsectionId),
    );
    if (sectionWithSub) {
      sectionId = sectionWithSub.id;
    } else if (subsectionId.startsWith("responses-")) {
      sectionId = "responses";
    }

    if (sectionId) {
      // Check for duplicates before adding
      const exists = parsed.some(
        (p) => p.sectionId === sectionId && p.subsectionId === subsectionId,
      );

      if (!exists) {
        // Get the label
        const allSubs = getAllSubsectionsForSection(sectionId, data);
        const found = allSubs.find((sub) => sub.subsectionId === subsectionId);

        parsed.push({
          sectionId,
          subsectionId,
          label: found?.label || subsectionId,
        });
      }
    }
  });

  // Sort by section order and subsection order
  return parsed.sort((a, b) => {
    const sectionA = data.sections.find((s) => s.id === a.sectionId);
    const sectionB = data.sections.find((s) => s.id === b.sectionId);
    const sectionOrderA = sectionA?.index || 999;
    const sectionOrderB = sectionB?.index || 999;

    if (sectionOrderA !== sectionOrderB) {
      return sectionOrderA - sectionOrderB;
    }

    const subsectionA = sectionA?.subsections?.find(
      (sub) => sub.id === a.subsectionId,
    );
    const subsectionB = sectionB?.subsections?.find(
      (sub) => sub.id === b.subsectionId,
    );
    let subOrderA = subsectionA?.index;
    let subOrderB = subsectionB?.index;

    if (subOrderA === undefined && a.sectionId === "responses") {
      // Extract question ID and find its index from data
      const questionId = parseInt(a.subsectionId.replace("responses-", ""), 10);
      const allQuestions = getQuestionsFromData(data);
      const question = allQuestions.find((q) => q.id === questionId);
      subOrderA = question?.index || 999;
    }

    if (subOrderB === undefined && b.sectionId === "responses") {
      const questionId = parseInt(b.subsectionId.replace("responses-", ""), 10);
      const allQuestions = getQuestionsFromData(data);
      const question = allQuestions.find((q) => q.id === questionId);
      subOrderB = question?.index || 999;
    }

    return (subOrderA || 999) - (subOrderB || 999);
  });
}

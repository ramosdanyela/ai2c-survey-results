import {
  getQuestionsFromData,
  getQuestionsSection,
  isQuestionsSectionId,
} from "@/services/dataResolver";

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

  // Seção responses/questions: subseções dinâmicas a partir de questions
  if (isQuestionsSectionId(sectionId)) {
    const allQuestions = getQuestionsFromData(data);

    if (allQuestions.length === 0) {
      console.warn("Export: No questions found", {
        hasData: !!data,
        hasSections: !!data?.sections,
        questionsSection: getQuestionsSection(data),
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
        sectionId,
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
 * Returns array of { sectionId, subsectionId, label } objects ordered by:
 * 1. Section index (ascending)
 * 2. Subsection index within section (ascending)
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
      sectionId = getQuestionsSection(data)?.id ?? "responses";
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

  // Ordenação das subseções selecionadas (garantir mesma ordem na Export e no Export Preview):
  // 1. Pelo índice da seção (section index) de forma ascendente.
  // 2. Pelo índice da subseção (subsection index) dentro da respectiva seção, de forma ascendente.
  // Ex.: seleção [q4, sumário executivo, q2] → ordem final: sumário executivo (sec 0, sub 0), q2 (sec 1, sub 1), q4 (sec 1, sub 3).
  return parsed.sort((a, b) => {
    const sectionA = data.sections.find((s) => s.id === a.sectionId);
    const sectionB = data.sections.find((s) => s.id === b.sectionId);
    const sectionOrderA =
      sectionA != null
        ? (sectionA.index ?? data.sections.indexOf(sectionA))
        : 999;
    const sectionOrderB =
      sectionB != null
        ? (sectionB.index ?? data.sections.indexOf(sectionB))
        : 999;

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

    if (subOrderA === undefined && subsectionA != null && sectionA?.subsections) {
      subOrderA = sectionA.subsections.indexOf(subsectionA);
    }
    if (subOrderB === undefined && subsectionB != null && sectionB?.subsections) {
      subOrderB = sectionB.subsections.indexOf(subsectionB);
    }

    if (subOrderA === undefined && isQuestionsSectionId(a.sectionId)) {
      const questionId = parseInt(a.subsectionId.replace("responses-", ""), 10);
      const allQuestions = getQuestionsFromData(data);
      const question = allQuestions.find((q) => q.id === questionId);
      subOrderA = question?.index ?? 999;
    }
    if (subOrderB === undefined && isQuestionsSectionId(b.sectionId)) {
      const questionId = parseInt(b.subsectionId.replace("responses-", ""), 10);
      const allQuestions = getQuestionsFromData(data);
      const question = allQuestions.find((q) => q.id === questionId);
      subOrderB = question?.index ?? 999;
    }

    return (subOrderA ?? 999) - (subOrderB ?? 999);
  });
}

/**
 * Returns the given subsection IDs in export order: first by section index (asc),
 * then by subsection index within section (asc). Use when building export URL so
 * preview and export use the same order.
 */
export function getOrderedSelectedSubsectionIds(subsectionIds, data) {
  if (!data?.sections?.length || !subsectionIds?.length) return subsectionIds;
  const parsed = parseSelectedSections(
    Array.isArray(subsectionIds) ? subsectionIds : Array.from(subsectionIds),
    false,
    data,
  );
  return parsed.map((p) => p.subsectionId);
}


import { sectionsConfig } from "@/data/surveyData";

/**
 * Get all questions from responseDetails, combining closedQuestions and openQuestions
 * if questions property doesn't exist
 */
function getQuestionsFromResponseDetails(responseDetails) {
  if (!responseDetails) return [];
  
  // If questions exists, use it
  if (responseDetails.questions && Array.isArray(responseDetails.questions)) {
    return responseDetails.questions;
  }
  
  // Otherwise, combine closedQuestions and openQuestions
  const closed = responseDetails.closedQuestions || [];
  const open = responseDetails.openQuestions || [];
  
  // Combine and sort by index
  return [...closed, ...open].sort((a, b) => (a.index || 0) - (b.index || 0));
}

/**
 * Get export configuration for a section (which attributes/questions to include/exclude)
 */
function getExportConfig(sectionId, data) {
  const section = data?.sectionsConfig?.sections?.find((s) => s.id === sectionId);
  
  // Check if section has export configuration
  const exportConfig = section?.exportConfig;
  
  return {
    // For attributes: which attribute IDs to include (if empty, include all)
    includedAttributeIds: exportConfig?.includedAttributeIds || null,
    excludedAttributeIds: exportConfig?.excludedAttributeIds || [],
    
    // For responses: which question IDs to include/exclude
    includedQuestionIds: exportConfig?.includedQuestionIds || null,
    excludedQuestionIds: exportConfig?.excludedQuestionIds || [],
    
    // Question label prefix (e.g., "Pergunta" or "Question")
    questionLabelPrefix: exportConfig?.questionLabelPrefix || "Pergunta",
  };
}

/**
 * Get all available subsections for a given section
 */
export function getAllSubsectionsForSection(sectionId, data) {
  // Get sectionsConfig from data if available, otherwise use imported one
  const config = data?.sectionsConfig || sectionsConfig;
  const section = config.sections.find((s) => s.id === sectionId);
  if (!section) return [];

  // If section has fixed subsections (executive, support)
  if (section.subsections) {
    return section.subsections.map((sub) => ({
      sectionId: section.id,
      subsectionId: sub.id,
      label: sub.name,
    }));
  }

  // If it's the "attributes" section, get from data
  if (sectionId === "attributes") {
    // Access attributeDeepDive from data
    const attributeDeepDive = data?.attributeDeepDive;
    if (!attributeDeepDive?.attributes) return [];
    
    const exportConfig = getExportConfig(sectionId, data);
    let availableAttributes = attributeDeepDive.attributes;
    
    // Apply filters based on export configuration
    if (exportConfig.includedAttributeIds && exportConfig.includedAttributeIds.length > 0) {
      availableAttributes = availableAttributes.filter((attr) =>
        exportConfig.includedAttributeIds.includes(attr.id)
      );
    }
    
    if (exportConfig.excludedAttributeIds.length > 0) {
      availableAttributes = availableAttributes.filter((attr) =>
        !exportConfig.excludedAttributeIds.includes(attr.id)
      );
    }
    
    // Sort by index
    availableAttributes = availableAttributes.sort((a, b) => (a.index || 0) - (b.index || 0));

    return availableAttributes.map((attr) => ({
      sectionId: "attributes",
      subsectionId: `attributes-${attr.id}`,
      label: attr.name,
    }));
  }

  // If it's the "responses" section, get from data
  if (sectionId === "responses") {
    // Try multiple possible paths for questions
    let allQuestions = [];
    
    // Priority 1: Try responseDetails from root level (surveyData.js structure)
    const responseDetails = data?.responseDetails;
    if (responseDetails) {
      allQuestions = getQuestionsFromResponseDetails(responseDetails);
    }
    
    // Priority 2: Try sectionsConfig.sections[responses].data.questions (JSON structure)
    if (allQuestions.length === 0 && data?.sectionsConfig) {
      const responsesSection = data.sectionsConfig.sections?.find((s) => s.id === "responses");
      if (responsesSection?.data?.questions && Array.isArray(responsesSection.data.questions)) {
        allQuestions = [...responsesSection.data.questions].sort((a, b) => (a.index || 0) - (b.index || 0));
      }
    }
    
    // Priority 3: Try responseDetails from sectionsConfig.data
    if (allQuestions.length === 0 && data?.sectionsConfig) {
      const responsesSection = data.sectionsConfig.sections?.find((s) => s.id === "responses");
      if (responsesSection?.data?.responseDetails) {
        const rd = responsesSection.data.responseDetails;
        allQuestions = getQuestionsFromResponseDetails(rd);
      }
    }
    
    if (allQuestions.length === 0) {
      console.warn("Export: No questions found", {
        hasData: !!data,
        hasResponseDetails: !!data?.responseDetails,
        hasSectionsConfig: !!data?.sectionsConfig,
        responsesSection: data?.sectionsConfig?.sections?.find((s) => s.id === "responses"),
      });
      return [];
    }
    
    const exportConfig = getExportConfig(sectionId, data);
    let filteredQuestions = allQuestions;
    
    // Apply filters based on export configuration
    if (exportConfig.includedQuestionIds && exportConfig.includedQuestionIds.length > 0) {
      filteredQuestions = filteredQuestions.filter((q) =>
        exportConfig.includedQuestionIds.includes(q.id)
      );
    }
    
    if (exportConfig.excludedQuestionIds.length > 0) {
      filteredQuestions = filteredQuestions.filter((q) =>
        !exportConfig.excludedQuestionIds.includes(q.id)
      );
    }
    
    // Sort by index
    filteredQuestions = filteredQuestions.sort((a, b) => (a.index || 0) - (b.index || 0));

    return filteredQuestions.map((q, index) => {
      const displayNumber = index + 1;
      return {
        sectionId: "responses",
        subsectionId: `responses-${q.id}`,
        label: `${exportConfig.questionLabelPrefix} ${displayNumber}: ${
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
  
  // Get sectionsConfig from data if available, otherwise use imported one
  const config = data?.sectionsConfig || sectionsConfig;

  config.sections
    .filter((section) => !section.isRoute) // Exclude export route
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
export function parseSelectedSections(selectedSectionsArray, exportFullReport, data) {
  if (exportFullReport) {
    // Return all subsections
    return getAllSubsections(data);
  }

  // Parse selected subsection IDs
  const parsed = [];
  
  // Get sectionsConfig from data if available, otherwise use imported one
  const config = data?.sectionsConfig || sectionsConfig;

  selectedSectionsArray.forEach((subsectionId) => {
    // Determine sectionId from subsectionId
    let sectionId = null;

    if (subsectionId.startsWith("attributes-")) {
      sectionId = "attributes";
    } else if (subsectionId.startsWith("responses-")) {
      sectionId = "responses";
    } else {
      // For executive and support, find the section that contains this subsection
      const section = config.sections.find((s) =>
        s.subsections?.some((sub) => sub.id === subsectionId)
      );
      if (section) {
        sectionId = section.id;
      }
    }

    if (sectionId) {
      // Check for duplicates before adding
      const exists = parsed.some(
        (p) => p.sectionId === sectionId && p.subsectionId === subsectionId
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
      } else {
        console.warn("🔍 DEBUG parseSelectedSections - Duplicate found:", subsectionId);
      }
    }
  });
  
  console.log("🔍 DEBUG parseSelectedSections - Parsed result:", parsed);

  // Sort by section order and subsection order
  return parsed.sort((a, b) => {
    const sectionA = config.sections.find((s) => s.id === a.sectionId);
    const sectionB = config.sections.find((s) => s.id === b.sectionId);
    const sectionOrderA = sectionA?.index || 999;
    const sectionOrderB = sectionB?.index || 999;

    if (sectionOrderA !== sectionOrderB) {
      return sectionOrderA - sectionOrderB;
    }

    // Within same section, sort by subsection index
    // For fixed subsections (executive, support)
    const subsectionA = sectionA?.subsections?.find(
      (sub) => sub.id === a.subsectionId
    );
    const subsectionB = sectionB?.subsections?.find(
      (sub) => sub.id === b.subsectionId
    );
    
    // For dynamic subsections (attributes, responses), extract from subsectionId
    let subOrderA = subsectionA?.index;
    let subOrderB = subsectionB?.index;
    
    if (subOrderA === undefined && a.sectionId === "attributes") {
      // Extract attribute ID and find its index from data
      const attrId = a.subsectionId.replace("attributes-", "");
      const attributeDeepDive = data?.attributeDeepDive;
      const attr = attributeDeepDive?.attributes?.find((attr) => attr.id === attrId);
      subOrderA = attr?.index || 999;
    }
    
    if (subOrderB === undefined && b.sectionId === "attributes") {
      const attrId = b.subsectionId.replace("attributes-", "");
      const attributeDeepDive = data?.attributeDeepDive;
      const attr = attributeDeepDive?.attributes?.find((attr) => attr.id === attrId);
      subOrderB = attr?.index || 999;
    }
    
    if (subOrderA === undefined && a.sectionId === "responses") {
      // Extract question ID and find its index from data
      const questionId = parseInt(a.subsectionId.replace("responses-", ""), 10);
      const responseDetails = data?.responseDetails;
      const allQuestions = getQuestionsFromResponseDetails(responseDetails);
      const question = allQuestions.find((q) => q.id === questionId);
      subOrderA = question?.index || 999;
    }
    
    if (subOrderB === undefined && b.sectionId === "responses") {
      const questionId = parseInt(b.subsectionId.replace("responses-", ""), 10);
      const responseDetails = data?.responseDetails;
      const allQuestions = getQuestionsFromResponseDetails(responseDetails);
      const question = allQuestions.find((q) => q.id === questionId);
      subOrderB = question?.index || 999;
    }

    return (subOrderA || 999) - (subOrderB || 999);
  });
}


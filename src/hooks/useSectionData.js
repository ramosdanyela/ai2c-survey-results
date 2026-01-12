import { useMemo } from "react";
import { useSurveyData } from "./useSurveyData";
import { resolveDataPath, resolveTemplate } from "@/services/dataResolver";

// Re-export functions from dataResolver for convenience
export { resolveDataPath, resolveTemplate };

/**
 * Hook to access section data consistently
 * 
 * @param {string} sectionId - Section ID (e.g., "executiveReport", "supportAnalysis")
 * @returns {Object} - Section data and helper functions
 */
export function useSectionData(sectionId) {
  const { data } = useSurveyData();

  const sectionData = useMemo(() => {
    if (!data || !sectionId) return null;

    // Try to find section in root level
    if (data[sectionId]) {
      return data[sectionId];
    }

    // Try to find in common locations
    const commonPaths = [`sections.${sectionId}`, `data.${sectionId}`];

    for (const path of commonPaths) {
      const found = resolveDataPath(data, path);
      if (found) return found;
    }

    return null;
  }, [data, sectionId]);

  return {
    data,
    sectionData,
    resolvePath: (path) => resolveDataPath(data, path),
    resolveTemplate: (template) => resolveTemplate(template, data),
  };
}


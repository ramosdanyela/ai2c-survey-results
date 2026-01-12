import { useMemo } from "react";
import { useSurveyData } from "./useSurveyData";

/**
 * Resolve data path from nested object
 * @param {Object} data - Root data object
 * @param {string} path - Dot-separated path (e.g., "executiveReport.summary.aboutStudy")
 * @returns {*} - Resolved value or null
 */
export function resolveDataPath(data, path) {
  if (!data || !path) return null;

  const keys = path.split(".");
  let current = data;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key];
    } else {
      return null;
    }
  }

  return current;
}

/**
 * Resolve template strings with {{path}} syntax
 * @param {string} template - Template string with {{path}} placeholders
 * @param {Object} data - Root data object
 * @returns {string} - Resolved string
 */
export function resolveTemplate(template, data) {
  if (!template || typeof template !== "string") return template;

  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const value = resolveDataPath(data, path.trim());
    return value !== null && value !== undefined ? String(value) : match;
  });
}

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


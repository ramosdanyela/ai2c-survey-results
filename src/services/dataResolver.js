/**
 * Survey/report data resolvers.
 * Re-exports from report-engine (pure, React-free) so the front keeps the same API.
 * Passes console as logger so resolveText/resolveTemplate keep current warning behavior.
 */

import {
  isQuestionsSectionId,
  getQuestionsSection,
  getQuestionsFromData,
  resolveDataPath,
  resolveText as resolveTextPure,
  resolveTemplate as resolveTemplatePure,
} from "@/report-engine/dataResolvers";

export { isQuestionsSectionId, getQuestionsSection, getQuestionsFromData, resolveDataPath };

const consoleLogger = {
  warn: (message, context) => console.warn(message, context),
};

/**
 * Resolve path de texto no uiTexts (delegates to pure implementation with console logger).
 */
export function resolveText(path, data) {
  return resolveTextPure(path, data, consoleLogger);
}

/**
 * Resolve template strings with {{path}} syntax (delegates to pure implementation with console logger).
 */
export function resolveTemplate(template, data) {
  return resolveTemplatePure(template, data, consoleLogger);
}

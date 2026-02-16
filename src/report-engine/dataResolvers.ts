/**
 * Pure data resolvers for report/survey data.
 * No React dependencies — safe to use from DocxRenderer or any non-React context.
 */

/** Section IDs that contain the list of questions (responses / Análise por Questão) */
const QUESTIONS_SECTION_IDS = ["responses", "questions"];

/** Optional logger for resolveText/resolveTemplate (no side effects when not provided) */
export type ResolverLogger = {
  warn?: (message: string, context?: Record<string, unknown>) => void;
};

/**
 * True if sectionId is the questions section (responses or questions).
 */
export function isQuestionsSectionId(sectionId: string | undefined | null): boolean {
  return QUESTIONS_SECTION_IDS.includes(String(sectionId ?? ""));
}

/**
 * Returns the section object that holds questions (id "responses" or "questions").
 */
export function getQuestionsSection(data: { sections?: Array<{ id: string }> } | null | undefined): { questions?: unknown[] } | null {
  if (!data?.sections) return null;
  return data.sections.find((s) => QUESTIONS_SECTION_IDS.includes(s.id)) ?? null;
}

/**
 * Get questions from responses/questions section dynamically.
 * Looks for questions in sections[id="responses"].questions or sections[id="questions"].questions
 */
export function getQuestionsFromData(data: { sections?: Array<{ id: string; questions?: unknown[] }> } | null | undefined): unknown[] {
  if (!data?.sections) return [];

  const section = getQuestionsSection(data);
  if (!section?.questions || !Array.isArray(section.questions)) {
    return [];
  }

  return section.questions;
}

/**
 * Resolve path de dados no objeto.
 * Supports array indices like "attributes[0]" or "attributes.0"
 * Supports relative paths with "sectionData." prefix (looks in data.sectionData)
 * Supports relative paths with "question." prefix (looks in data.question)
 */
export function resolveDataPath<T = unknown>(
  obj: Record<string, unknown> | null | undefined,
  path: string | null | undefined,
  fallback?: T
): T | null {
  if (!path) return (fallback ?? null) as T | null;
  if (!obj) return (fallback ?? null) as T | null;

  // Handle relative paths with "sectionData." prefix
  if (path.startsWith("sectionData.")) {
    const relativePath = path.replace("sectionData.", "");
    if (obj.sectionData && typeof obj.sectionData === "object") {
      const value = resolveDataPath(obj.sectionData as Record<string, unknown>, relativePath);
      if (value !== null && value !== undefined) return value as T;
    }
    const activeSubsection = obj._activeSubsection as { data?: Record<string, unknown> } | undefined;
    if (activeSubsection?.data && relativePath) {
      const segments = relativePath.split(".").filter(Boolean);
      if (segments.length === 1) return activeSubsection.data as T;
      const sub = resolveDataPath(
        activeSubsection.data,
        segments.slice(1).join(".")
      );
      if (sub !== null && sub !== undefined) return sub as T;
    }
    return (fallback ?? null) as T | null;
  }

  // Handle relative paths with "question." prefix
  if (path.startsWith("question.")) {
    const relativePath = path.replace("question.", "");
    if (obj.question && typeof obj.question === "object") {
      const q = resolveDataPath(obj.question as Record<string, unknown>, relativePath);
      return (q !== null && q !== undefined ? q : (fallback ?? null)) as T | null;
    }
    return (fallback ?? null) as T | null;
  }

  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const keys = normalizedPath.split(".").filter(Boolean);
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object") {
      const curr = current as Record<string, unknown>;
      if (Array.isArray(current) && /^\d+$/.test(key)) {
        const index = parseInt(key, 10);
        if (index >= 0 && index < (current as unknown[]).length) {
          current = (current as unknown[])[index];
        } else {
          return (fallback ?? null) as T | null;
        }
      } else if (key in curr) {
        current = curr[key];
      } else {
        return (fallback ?? null) as T | null;
      }
    } else {
      return (fallback ?? null) as T | null;
    }
  }

  return (current !== undefined ? current : (fallback ?? null)) as T | null;
}

/**
 * Resolve path de texto no uiTexts.
 * Pure: optional logger for warnings (no console dependency).
 */
export function resolveText(
  path: string | null | undefined,
  data: { uiTexts?: Record<string, unknown> } | null | undefined,
  logger?: ResolverLogger
): string {
  if (!path || !data) {
    logger?.warn?.("resolveText: Missing path or data", { path, hasData: !!data });
    return path ?? "";
  }

  if (!data.uiTexts) {
    logger?.warn?.("resolveText: uiTexts not found in data", {
      path,
      dataKeys: Object.keys(data),
      hasUiTexts: !!data.uiTexts,
    });
    return path;
  }

  const cleanPath = path.replace(/^uiTexts\./, "");
  const value = resolveDataPath(data.uiTexts as Record<string, unknown>, cleanPath);

  if (!value) {
    logger?.warn?.("resolveText: Path not found in uiTexts", {
      path,
      cleanPath,
      uiTextsKeys: Object.keys(data.uiTexts),
    });
  }

  return (value as string) || path;
}

/**
 * Resolve template strings with {{path}} syntax.
 * Supports uiTexts paths (uses resolveText) and regular data paths (uses resolveDataPath).
 * Pure: optional logger for resolveText warnings.
 */
export function resolveTemplate(
  template: string | null | undefined,
  data: Record<string, unknown> | null | undefined,
  logger?: ResolverLogger
): string {
  if (!template || typeof template !== "string") return (template as string) ?? "";

  const isPureTemplate = template.trim().match(/^\{\{[^}]+\}\}$/);

  const resolved = template.replace(/\{\{([^}]+)\}\}/g, (match, path: string) => {
    const trimmedPath = path.trim();

    if (trimmedPath.startsWith("uiTexts.")) {
      const value = resolveText(trimmedPath, data as { uiTexts?: Record<string, unknown> }, logger);
      if (value === trimmedPath || value === match) {
        logger?.warn?.("resolveTemplate: Template not resolved", {
          template,
          path: trimmedPath,
          hasData: !!data,
          hasUiTexts: !!data?.uiTexts,
          uiTextsKeys: data?.uiTexts ? Object.keys(data.uiTexts) : [],
          value,
        });
      }
      return value !== null && value !== undefined ? String(value) : match;
    }

    const value = resolveDataPath(data, trimmedPath);
    return value !== null && value !== undefined ? String(value) : match;
  });

  if (isPureTemplate && resolved.includes("{{")) {
    return "";
  }

  return resolved;
}

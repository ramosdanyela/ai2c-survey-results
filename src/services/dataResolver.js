/** Section IDs that contain the list of questions (responses / Análise por Questão) */
const QUESTIONS_SECTION_IDS = ["responses", "questions"];

/**
 * True if sectionId is the questions section (responses or questions).
 * @param {string} sectionId
 * @returns {boolean}
 */
export function isQuestionsSectionId(sectionId) {
  return QUESTIONS_SECTION_IDS.includes(sectionId);
}

/**
 * Returns the section object that holds questions (id "responses" or "questions").
 * @param {Object} data - The survey data object
 * @returns {Object|null}
 */
export function getQuestionsSection(data) {
  if (!data?.sections) return null;
  return (
    data.sections.find((s) => QUESTIONS_SECTION_IDS.includes(s.id)) ?? null
  );
}

/**
 * Get questions from responses/questions section dynamically
 * Looks for questions in sections[id="responses"].questions or sections[id="questions"].questions
 *
 * @param {Object} data - The survey data object
 * @returns {Array} Array of questions or empty array
 */
export function getQuestionsFromData(data) {
  if (!data?.sections) return [];

  const section = getQuestionsSection(data);
  if (!section?.questions || !Array.isArray(section.questions)) {
    return [];
  }

  return section.questions;
}

/**
 * Resolve path de dados no objeto
 * Supports array indices like "attributes[0]" or "attributes.0"
 * Supports relative paths with "sectionData." prefix (looks in data.sectionData)
 * @param {Object} obj - Objeto raiz (pode conter sectionData)
 * @param {string} path - Path (ex: "sectionData.summary.aboutStudy" ou "attributes[0].distribution")
 * @param {*} fallback - Opcional: valor usado quando a resolução retorna null (ex.: component.data)
 * @returns {*} Valor resolvido, fallback se fornecido e resolução null, ou null
 */
export function resolveDataPath(obj, path, fallback = undefined) {
  if (!path) return fallback ?? null;
  if (!obj) return fallback ?? null;

  // Handle relative paths with "sectionData." prefix: sempre procurar primeiro em sectionData; fallback em _activeSubsection.data
  if (path.startsWith("sectionData.")) {
    const relativePath = path.replace("sectionData.", "");
    if (obj.sectionData) {
      const value = resolveDataPath(obj.sectionData, relativePath);
      if (value !== null && value !== undefined) return value;
    }
    // Fallback: dados podem estar no contexto da subseção (ex.: subsection.data em attributes)
    if (obj._activeSubsection?.data && relativePath) {
      const segments = relativePath.split(".").filter(Boolean);
      if (segments.length === 1) return obj._activeSubsection.data;
      const sub = resolveDataPath(
        obj._activeSubsection.data,
        segments.slice(1).join("."),
      );
      if (sub !== null && sub !== undefined) return sub;
    }
    return fallback ?? null;
  }

  // Handle relative paths with "question." prefix (for question components)
  if (path.startsWith("question.")) {
    const relativePath = path.replace("question.", "");
    if (obj.question) {
      const q = resolveDataPath(obj.question, relativePath);
      return q !== null && q !== undefined ? q : (fallback ?? null);
    }
    return fallback ?? null;
  }

  // Handle array indices in brackets: attributes[0] -> attributes.0
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");

  const keys = normalizedPath.split(".").filter(Boolean);
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === "object") {
      // Handle array indices
      if (Array.isArray(current) && /^\d+$/.test(key)) {
        const index = parseInt(key, 10);
        if (index >= 0 && index < current.length) {
          current = current[index];
        } else {
          return fallback ?? null;
        }
      } else if (key in current) {
        current = current[key];
      } else {
        return fallback ?? null;
      }
    } else {
      return fallback ?? null;
    }
  }

  return current !== undefined ? current : (fallback ?? null);
}

/**
 * Resolve path de texto no uiTexts
 * Como o JSON tem apenas um idioma, não precisa de fallback complexo
 * @param {string} path - Path do texto (ex: "uiTexts.sections.executive.name")
 * @param {Object} data - Dados completos do JSON
 * @returns {string} Texto resolvido ou path como fallback
 */
export function resolveText(path, data) {
  if (!path || !data) {
    console.warn("resolveText: Missing path or data", {
      path,
      hasData: !!data,
    });
    return path;
  }

  if (!data.uiTexts) {
    console.warn("resolveText: uiTexts not found in data", {
      path,
      dataKeys: Object.keys(data),
      hasUiTexts: !!data.uiTexts,
    });
    return path;
  }

  // Remove prefixo "uiTexts." se presente
  const cleanPath = path.replace(/^uiTexts\./, "");

  // Resolve diretamente em uiTexts (único idioma no JSON)
  const value = resolveDataPath(data.uiTexts, cleanPath);

  // Se não encontrar, retorna o path como fallback
  if (!value) {
    console.warn("resolveText: Path not found in uiTexts", {
      path,
      cleanPath,
      uiTextsKeys: Object.keys(data.uiTexts),
      sampleUiTexts: data.uiTexts.attributeDeepDive
        ? Object.keys(data.uiTexts.attributeDeepDive)
        : "not found",
    });
  }

  return value || path;
}

/**
 * Resolve template strings with {{path}} syntax
 * Supports uiTexts paths (uses resolveText) and regular data paths (uses resolveDataPath)
 * @param {string} template - Template string with {{path}} placeholders
 * @param {Object} data - Root data object (may contain sectionData)
 * @returns {string} - Resolved string
 */
export function resolveTemplate(template, data) {
  if (!template || typeof template !== "string") return template;

  // Check if the entire template is just a single template (e.g., "{{sectionData.department.summary}}")
  const isPureTemplate = template.trim().match(/^\{\{[^}]+\}\}$/);

  const resolved = template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();

    // Se for path de uiTexts, usa resolveText
    if (trimmedPath.startsWith("uiTexts.")) {
      const value = resolveText(trimmedPath, data);

      // Debug: log if template is not resolved
      if (value === trimmedPath || value === match) {
        console.warn("resolveTemplate: Template not resolved", {
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

    // Caso contrário, usa resolveDataPath
    const value = resolveDataPath(data, trimmedPath);
    return value !== null && value !== undefined ? String(value) : match;
  });

  // If the template was a pure template (only {{...}}) and it wasn't resolved (still contains {{}}),
  // return empty string instead of the template literal
  if (isPureTemplate && resolved.includes("{{")) {
    return "";
  }

  return resolved;
}

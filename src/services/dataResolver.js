/**
 * Resolve path de dados no objeto
 * Supports array indices like "attributes[0]" or "attributes.0"
 * Supports relative paths with "sectionData." prefix (looks in data.sectionData)
 * @param {Object} obj - Objeto raiz (pode conter sectionData)
 * @param {string} path - Path (ex: "sectionData.summary.aboutStudy" ou "attributes[0].distribution")
 * @returns {*} Valor resolvido ou null
 */
/**
 * Get attributes from data dynamically
 * Looks for attributes in sections[id="attributes"].subsections (new structure)
 * or in sections[id="attributes"].data.attributes (old structure - backward compatibility)
 * or in data.attributeDeepDive.attributes (legacy support)
 * 
 * @param {Object} data - The survey data object
 * @returns {Array} Array of attributes or empty array
 */
export function getAttributesFromData(data) {
  if (!data) return [];
  
  // Priority 1: Check sections[id="attributes"].subsections (new structure)
  if (data?.sections) {
    const attributesSection = data.sections.find(
      (section) => section.id === "attributes"
    );
    
    // NEW STRUCTURE: subsections contain the attributes metadata
    if (attributesSection?.subsections && Array.isArray(attributesSection.subsections)) {
      // Return subsections as attributes (they have id, index, name, icon, etc.)
      return attributesSection.subsections
        .filter((sub) => sub.id && sub.id.startsWith("attributes-"))
        .map((sub) => ({
          id: sub.id.replace("attributes-", ""), // Remove prefix for backward compatibility
          index: sub.index,
          name: sub.name,
          icon: sub.icon,
          summary: sub.summary,
        }))
        .sort((a, b) => (a.index || 0) - (b.index || 0));
    }
    
    // OLD STRUCTURE: Check sections[id="attributes"].data.attributes (backward compatibility)
    if (attributesSection?.data?.attributes && Array.isArray(attributesSection.data.attributes)) {
      return attributesSection.data.attributes;
    }
  }
  
  // Priority 2: Check data.attributeDeepDive.attributes (legacy support)
  if (data?.attributeDeepDive?.attributes && Array.isArray(data.attributeDeepDive.attributes)) {
    return data.attributeDeepDive.attributes;
  }
  
  return [];
}

/**
 * Get questions from responseDetails dynamically
 * Looks for questions in sections[id="responses"].data.questions
 * or in data.responseDetails.questions (legacy support)
 * 
 * @param {Object} data - The survey data object
 * @returns {Array} Array of questions or empty array
 */
export function getQuestionsFromData(data) {
  if (!data) return [];
  
  // Priority 1: Check sections[id="responses"].questions (new structure - direct questions)
  if (data?.sections) {
    const responsesSection = data.sections.find(
      (section) => section.id === "responses"
    );
    
    // NEW: Check section.questions directly (preferred)
    if (responsesSection?.questions && Array.isArray(responsesSection.questions)) {
      return responsesSection.questions;
    }
    
    // Legacy: Check sections[id="responses"].data.questions (old structure)
    if (responsesSection?.data?.questions && Array.isArray(responsesSection.data.questions)) {
      return responsesSection.data.questions;
    }
    
    // Also check responseDetails inside section data
    if (responsesSection?.data?.responseDetails?.questions && Array.isArray(responsesSection.data.responseDetails.questions)) {
      return responsesSection.data.responseDetails.questions;
    }
  }
  
  // Priority 2: Check data.responseDetails.questions (legacy support)
  if (data?.responseDetails?.questions && Array.isArray(data.responseDetails.questions)) {
    return data.responseDetails.questions;
  }
  
  // Priority 3: Try combining closedQuestions and openQuestions (legacy support)
  if (data?.responseDetails) {
    const closed = data.responseDetails.closedQuestions || [];
    const open = data.responseDetails.openQuestions || [];
    if (closed.length > 0 || open.length > 0) {
      return [...closed, ...open].sort((a, b) => (a.index || 0) - (b.index || 0));
    }
  }
  
  return [];
}

export function resolveDataPath(obj, path) {
  if (!obj || !path) return null;

  // Handle relative paths with "sectionData." prefix
  if (path.startsWith("sectionData.")) {
    const relativePath = path.replace("sectionData.", "");
    if (obj.sectionData) {
      return resolveDataPath(obj.sectionData, relativePath);
    }
    return null;
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
          return null;
        }
      } else if (key in current) {
        current = current[key];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  return current;
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
    console.warn("resolveText: Missing path or data", { path, hasData: !!data });
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
      sampleUiTexts: data.uiTexts.attributeDeepDive ? Object.keys(data.uiTexts.attributeDeepDive) : "not found",
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

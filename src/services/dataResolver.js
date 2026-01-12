/**
 * Resolve path de dados no objeto
 * Supports array indices like "attributes[0]" or "attributes.0"
 * Supports relative paths with "sectionData." prefix (looks in data.sectionData)
 * @param {Object} obj - Objeto raiz (pode conter sectionData)
 * @param {string} path - Path (ex: "sectionData.summary.aboutStudy" ou "attributes[0].distribution")
 * @returns {*} Valor resolvido ou null
 */
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
  if (!path || !data) return path;

  // Remove prefixo "uiTexts." se presente
  const cleanPath = path.replace(/^uiTexts\./, "");

  // Resolve diretamente em uiTexts (único idioma no JSON)
  const value = resolveDataPath(data.uiTexts, cleanPath);

  // Se não encontrar, retorna o path como fallback
  return value || path;
}


import { cardVariants, cardContentVariants, cardTitleVariants } from "@/styles/variants";

/**
 * Resolve variante de estilo do JSON e retorna classes CSS do código
 * @param {Object} component - Componente do schema
 * @param {string} variantType - Tipo de variante ('card', 'cardContent', 'cardTitle')
 * @returns {string} Classes CSS resolvidas
 */
export function resolveStyleVariant(component, variantType = "card") {
  const variantMap = {
    card: cardVariants,
    cardContent: cardContentVariants,
    cardTitle: cardTitleVariants,
  };

  const variants = variantMap[variantType];
  if (!variants) return "";

  const variant = component.cardStyleVariant || "default";
  return variants[variant] || variants.default || "";
}

/**
 * Enriquece componente com estilos resolvidos
 * @param {Object} component - Componente do schema
 * @returns {Object} Componente enriquecido com classes CSS
 */
export function enrichComponentWithStyles(component) {
  const enriched = { ...component };

  if (component.type === "card") {
    enriched.className = resolveStyleVariant(component, "card");
    
    // Resolve textClassName se especificado
    if (component.cardContentVariant) {
      enriched.textClassName = resolveStyleVariant(
        { cardStyleVariant: component.cardContentVariant },
        "cardContent"
      );
    }
    
    // Resolve titleClassName se especificado
    if (component.titleStyleVariant) {
      enriched.titleClassName = resolveStyleVariant(
        { cardStyleVariant: component.titleStyleVariant },
        "cardTitle"
      );
    }
  }

  // Processa componentes filhos recursivamente
  if (component.components) {
    enriched.components = component.components.map(enrichComponentWithStyles);
  }

  return enriched;
}


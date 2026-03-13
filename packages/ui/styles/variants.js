/**
 * Variantes de estilo centralizadas
 * Referenciadas no JSON via cardStyleVariant
 */

export const cardVariants = {
  default: "card-elevated",
  "border-left": "card-elevated border-l-4 bg-muted/10",
  "overflow-hidden": "card-elevated overflow-hidden bg-muted/10",
  "flex-column": "card-elevated flex flex-col",
  "flat": "", // Card sem elevated
};

export const cardContentVariants = {
  default: "",
  "with-charts": "flex-1 flex flex-col",
  "with-tables": "space-y-6",
  "with-description": "pt-6",
};

export const cardTitleVariants = {
  default: "text-xl font-bold text-card-foreground",
  "large-bold": "text-xl font-bold text-foreground",
  "h3-style": "text-lg font-bold text-foreground mb-3", // Estilo igual ao h3
};

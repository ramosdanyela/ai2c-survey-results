// ============================================================
// QUESTION BADGE TYPES - Mapeamento de tipos de questão para badges
// ============================================================
// 
// Este arquivo define como cada tipo de questão deve ser
// renderizado como badge, incluindo variante e label.
//
// Os tipos são definidos nas questões do JSON:
// - "nps": Questão de Net Promoter Score
// - "open": Questão de campo aberto
// - "closed": Questão de múltipla escolha
//
// ============================================================

/**
 * Mapeamento de tipos de questão para configuração de badge
 */
export const questionBadgeTypes = {
  nps: {
    variant: "default",
    label: "NPS",
    icon: "TrendingUp",
  },
  open: {
    variant: "secondary",
    label: "Campo Aberto",
    icon: "FileText",
  },
  closed: {
    variant: "outline",
    label: "Múltipla Escolha",
    icon: "CheckSquare",
  },
};

/**
 * Obtém a configuração de badge para um tipo de questão
 * @param {string} questionType - Tipo da questão ("nps", "open", "closed")
 * @returns {Object|null} Configuração do badge ou null se tipo inválido
 */
export const getBadgeConfig = (questionType) => {
  return questionBadgeTypes[questionType] || null;
};

/**
 * Tipos de questão válidos
 */
export const VALID_QUESTION_TYPES = Object.keys(questionBadgeTypes);


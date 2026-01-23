// ============================================================
// BADGE TYPES - Centralized badge type definitions
// ============================================================
// This file contains all badge type definitions used across
// the survey components.
//
// Import this file wherever badges are used to get:
// - Badge variant constants
// - Severity type constants
// - Question badge configurations
//
// Note: For severity colors and class names, import directly from @/lib/colors
//
// ============================================================

// ============================================================================
// Badge Variant Types
// ============================================================================
//
// Badge Variants:
// - default: Primary badge with custom blue background
// - secondary: Secondary badge with muted background
// - destructive: Destructive badge with red background
// - outline: Badge with outline border only

export const BADGE_VARIANTS = {
  DEFAULT: "default",
  SECONDARY: "secondary",
  DESTRUCTIVE: "destructive",
  OUTLINE: "outline",
};

// ============================================================================
// Severity Types
// ============================================================================
//
// Severity Types:
// - critical: Critical severity badge
// - high: High severity badge
// - medium: Medium severity badge
// - low: Low severity badge

export const SEVERITY_TYPES = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

// ============================================================================
// Question Badge Types
// ============================================================================
//
// Mapeamento de tipos de questão para configuração de badge
// Os tipos são definidos nas questões do JSON:
// - "nps": Questão de Net Promoter Score
// - "open-ended": Questão de campo aberto
// - "multiple-choice": Questão de múltipla escolha
// - "single-choice": Questão de escolha única

export const questionBadgeTypes = {
  nps: {
    variant: "default",
    label: "NPS",
    icon: "TrendingUp",
  },
  "open-ended": {
    variant: "secondary",
    label: "Campo Aberto",
    icon: "FileText",
  },
  "multiple-choice": {
    variant: "outline",
    label: "Múltipla Escolha",
    icon: "CheckSquare",
  },
  "single-choice": {
    variant: "outline",
    label: "Escolha única",
    icon: "CircleDot",
  },
};

/**
 * Obtém a configuração de badge para um tipo de questão
 * @param {string} questionType - Tipo da questão ("nps", "open-ended", "multiple-choice", "single-choice")
 * @returns {Object|null} Configuração do badge ou null se tipo inválido
 */
export const getBadgeConfig = (questionType) => {
  return questionBadgeTypes[questionType] || null;
};

/**
 * Tipos de questão válidos
 */
export const VALID_QUESTION_TYPES = Object.keys(questionBadgeTypes);


/**
 * Centralized Color System
 *
 * Este arquivo contém todas as definições de cores usadas no aplicativo.
 * Todas as referências a cores devem usar as constantes definidas aqui.
 *
 * Suporta Light e Dark mode - todas as cores estão centralizadas aqui.
 */

// ============================================================================
// Cores Principais (Hex) - Dark Mode (padrão)
// ============================================================================

/** Laranja principal - #ff9e2b */
export const COLOR_ORANGE_PRIMARY = "#ff9e2b";

/** Azul escuro para títulos - #1982d8 */
export const COLOR_BLUE_TITLE = "#1982d8";

/** Azul customizado - #0b18c8 */
export const COLOR_BLUE_CUSTOM = "#1982d8";

/** Preto - #000000 */
export const COLOR_BLACK = "#000000";

/** Branco - #ffffff */
export const COLOR_WHITE = "#ffffff";

// ============================================================================
// Cores HSL (para uso com variáveis CSS)
// ============================================================================

/** Laranja principal em HSL - 33 100% 58% */
export const HSL_ORANGE_PRIMARY = "33 100% 58%";

/** Azul customizado em HSL - 207 79% 47% */
export const HSL_BLUE_CUSTOM = "207 79% 47%";

/** Azul título em HSL - 207 79% 47% */
export const HSL_BLUE_TITLE = "207 79% 47%";

/** Azul subtítulo em HSL - 207 79% 53% */
export const HSL_BLUE_SUBTITLE = "207 79% 53%";

// ============================================================================
// Cores RGBA - Sombras e Overlays
// ============================================================================

/** Sombra laranja - rgba(255,158,43,0.4) */
export const RGBA_ORANGE_SHADOW_40 = "rgba(255,158,43,0.4)";

/** Sombra laranja - rgba(255,158,43,0.3) */
export const RGBA_ORANGE_SHADOW_30 = "rgba(255,158,43,0.3)";

/** Sombra laranja - rgba(255,158,43,0.2) */
export const RGBA_ORANGE_SHADOW_20 = "rgba(255,158,43,0.2)";

/** Sombra laranja - rgba(255,158,43,0.15) */
export const RGBA_ORANGE_SHADOW_15 = "rgba(255,158,43,0.15)";

/** Sombra laranja - rgba(255,158,43,0.1) */
export const RGBA_ORANGE_SHADOW_10 = "rgba(255,158,43,0.1)";

/** Sombra preta - rgba(0,0,0,0.6) */
export const RGBA_BLACK_SHADOW_60 = "rgba(0,0,0,0.6)";

/** Sombra preta - rgba(0,0,0,0.4) */
export const RGBA_BLACK_SHADOW_40 = "rgba(0,0,0,0.4)";

/** Sombra preta - rgba(0,0,0,0.3) */
export const RGBA_BLACK_SHADOW_30 = "rgba(0,0,0,0.3)";

/** Sombra preta - rgba(0,0,0,0.2) */
export const RGBA_BLACK_SHADOW_20 = "rgba(0,0,0,0.2)";

/** Sombra preta - rgba(0,0,0,0.1) */
export const RGBA_BLACK_SHADOW_10 = "rgba(0,0,0,0.1)";

/** Sombra preta - rgba(0,0,0,0.08) */
export const RGBA_BLACK_SHADOW_08 = "rgba(0,0,0,0.08)";

/** Branco translúcido - rgba(255,255,255,0.1) */
export const RGBA_WHITE_10 = "rgba(255,255,255,0.1)";

/** Branco translúcido - rgba(255,255,255,0.2) */
export const RGBA_WHITE_20 = "rgba(255,255,255,0.2)";

// ============================================================================
// Cores Light Mode
// ============================================================================

/** Fundo claro - #F9FAFB */
export const COLOR_LIGHT_BACKGROUND = "#F9FAFB";

/** Texto escuro no light mode - #000000 */
export const COLOR_LIGHT_TEXT = "#000000";

/** Texto secundário no light mode - #374151 */
export const COLOR_LIGHT_TEXT_SECONDARY = "#374151";

/** Cinza escuro - #1f2937 */
export const COLOR_GRAY_DARK = "#1f2937";

/** Card claro - #FFFFFF */
export const COLOR_LIGHT_CARD = "#FFFFFF";

/** Borda clara - #E5E7EB */
export const COLOR_LIGHT_BORDER = "#E5E7EB";

/** Sombra clara - rgba(0,0,0,0.1) */
export const RGBA_LIGHT_SHADOW = "rgba(0,0,0,0.1)";

/** Sombra clara hover - rgba(0,0,0,0.15) */
export const RGBA_LIGHT_SHADOW_HOVER = "rgba(0,0,0,0.15)";

/** Sombra azul customizado - rgba(25, 130, 216, 0.3) */
export const RGBA_BLUE_CUSTOM_SHADOW_30 = "rgba(25, 130, 216, 0.3)";

// ============================================================================
// Funções para obter cores baseadas no tema
// ============================================================================

/**
 * Retorna a cor de fundo baseada no tema
 */
export const getBackgroundColor = (theme) => {
  return theme === "light" ? COLOR_LIGHT_BACKGROUND : COLOR_BLACK;
};

/**
 * Retorna a cor de texto baseada no tema
 */
export const getTextColor = (theme) => {
  return theme === "light" ? COLOR_LIGHT_TEXT : COLOR_WHITE;
};

/**
 * Retorna a cor de texto secundário baseada no tema
 */
export const getTextSecondaryColor = (theme) => {
  return theme === "light"
    ? COLOR_LIGHT_TEXT_SECONDARY
    : "rgba(255,255,255,0.7)";
};

/**
 * Retorna a cor de card baseada no tema
 */
export const getCardColor = (theme) => {
  return theme === "light" ? COLOR_LIGHT_CARD : "hsl(0, 0%, 5%)";
};

/**
 * Retorna a cor de borda baseada no tema
 */
export const getBorderColor = (theme) => {
  return theme === "light" ? COLOR_LIGHT_BORDER : "rgba(255,255,255,0.1)";
};

/**
 * Retorna a sombra baseada no tema
 */
export const getShadow = (theme, hover = false) => {
  if (theme === "light") {
    return hover
      ? `0 3px 5px ${RGBA_LIGHT_SHADOW_HOVER}, 0 1px 3px ${RGBA_ORANGE_SHADOW_10}`
      : `0 1px 2px ${RGBA_LIGHT_SHADOW}, 0 1px 1px ${RGBA_ORANGE_SHADOW_10}`;
  }
  return hover
    ? `0 8px 32px ${RGBA_BLACK_SHADOW_60}, 0 3px 12px ${RGBA_ORANGE_SHADOW_20}`
    : `0 6px 24px ${RGBA_BLACK_SHADOW_40}, 0 2px 6px ${RGBA_ORANGE_SHADOW_10}`;
};

// ============================================================================
// Classes Tailwind para cores (para uso em className)
// ============================================================================

export const getOrangeClass = (opacity) => {
  if (opacity !== undefined) {
    return `bg-[${COLOR_ORANGE_PRIMARY}]/${opacity}`;
  }
  return `bg-[${COLOR_ORANGE_PRIMARY}]`;
};

export const getBlueCustomClass = (opacity) => {
  if (opacity !== undefined) {
    return `bg-[hsl(var(--custom-blue))]/${opacity}`;
  }
  return `bg-[hsl(var(--custom-blue))]`;
};

/**
 * Retorna a classe Tailwind para texto laranja
 */
export const getOrangeTextClass = () => `text-[${COLOR_ORANGE_PRIMARY}]`;

/**
 * Retorna a classe Tailwind para texto azul customizado
 */
export const getBlueCustomTextClass = () => `text-[hsl(var(--custom-blue))]`;

/**
 * Retorna a classe Tailwind para borda laranja
 */
export const getOrangeBorderClass = () => `border-[${COLOR_ORANGE_PRIMARY}]`;

/**
 * Retorna a classe Tailwind para borda azul customizada
 */
export const getBlueCustomBorderClass = () =>
  `border-[hsl(var(--custom-blue))]`;

// ============================================================================
// Funções para sombras (para uso em style ou className)
// ============================================================================

export const getOrangeShadow = (opacity = 0.4, blur = 16) => {
  return `0 3px ${blur}px rgba(255,158,43,${opacity})`;
};

export const getBlackShadow = (opacity = 0.4, blur = 32) => {
  return `0 6px ${blur}px rgba(0,0,0,${opacity})`;
};

/**
 * Retorna string de sombra combinada (preto + laranja)
 */
export const getCombinedShadow = () => {
  return `0 6px 24px ${RGBA_BLACK_SHADOW_40}, 0 2px 6px ${RGBA_ORANGE_SHADOW_10}`;
};

/**
 * Retorna string de sombra combinada hover
 */
export const getCombinedShadowHover = () => {
  return `0 8px 32px ${RGBA_BLACK_SHADOW_60}, 0 3px 12px ${RGBA_ORANGE_SHADOW_20}`;
};

export const getBlueGradient = () => {
  return "linear-gradient(135deg, hsl(207, 79%, 50%) 0%, hsl(207, 79%, 45%) 100%)";
};

export const getBlueButtonShadow = () => {
  return `0 4px 12px ${RGBA_BLUE_CUSTOM_SHADOW_30}, 0 2px 4px ${RGBA_BLACK_SHADOW_10}`;
};

// ============================================================================
// Exportação de todas as cores como objeto (para referência)
// ============================================================================

export const Colors = {
  // Hex
  orange: {
    primary: COLOR_ORANGE_PRIMARY,
  },
  blue: {
    title: COLOR_BLUE_TITLE,
    custom: COLOR_BLUE_CUSTOM,
  },
  black: COLOR_BLACK,
  white: COLOR_WHITE,

  // HSL
  hsl: {
    orangePrimary: HSL_ORANGE_PRIMARY,
    blueCustom: HSL_BLUE_CUSTOM,
    blueTitle: HSL_BLUE_TITLE,
    blueSubtitle: HSL_BLUE_SUBTITLE,
  },

  // RGBA
  rgba: {
    orangeShadow40: RGBA_ORANGE_SHADOW_40,
    orangeShadow30: RGBA_ORANGE_SHADOW_30,
    orangeShadow20: RGBA_ORANGE_SHADOW_20,
    orangeShadow15: RGBA_ORANGE_SHADOW_15,
    orangeShadow10: RGBA_ORANGE_SHADOW_10,
    blackShadow60: RGBA_BLACK_SHADOW_60,
    blackShadow40: RGBA_BLACK_SHADOW_40,
    blackShadow30: RGBA_BLACK_SHADOW_30,
    blackShadow20: RGBA_BLACK_SHADOW_20,
    blackShadow10: RGBA_BLACK_SHADOW_10,
    blackShadow08: RGBA_BLACK_SHADOW_08,
    white10: RGBA_WHITE_10,
    white20: RGBA_WHITE_20,
    blueCustomShadow30: RGBA_BLUE_CUSTOM_SHADOW_30,
  },
};

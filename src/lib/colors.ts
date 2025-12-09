/**
 * Centralized Color System
 *
 * Este arquivo contém todas as definições de cores usadas no aplicativo.
 * Todas as referências a cores devem usar as constantes definidas aqui.
 *
 * Suporta Light e Dark mode - todas as cores estão centralizadas aqui.
 */

// ============================================================================
// Tipos de Tema
// ============================================================================

export type Theme = "light" | "dark";

// ============================================================================
// Cores Principais (Hex) - Dark Mode (padrão)
// ============================================================================

/** Laranja principal - #ff9e2b */
export const COLOR_ORANGE_PRIMARY = "#ff9e2b";

/** Azul escuro para títulos - #001dc6 */
export const COLOR_BLUE_TITLE = "#001dc6";

/** Azul customizado - #0b18c8 */
export const COLOR_BLUE_CUSTOM = "#0b18c8";

/** Preto - #000000 */
export const COLOR_BLACK = "#000000";

/** Branco - #ffffff */
export const COLOR_WHITE = "#ffffff";

// ============================================================================
// Cores HSL (para uso com variáveis CSS)
// ============================================================================

/** Laranja principal em HSL - 33 100% 58% */
export const HSL_ORANGE_PRIMARY = "33 100% 58%";

/** Azul customizado em HSL - 236 90% 41% */
export const HSL_BLUE_CUSTOM = "236 90% 41%";

/** Azul título em HSL - 231 100% 39% */
export const HSL_BLUE_TITLE = "231 100% 39%";

/** Azul subtítulo em HSL - 231 100% 45% */
export const HSL_BLUE_SUBTITLE = "231 100% 45%";

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

/** Branco translúcido - rgba(255,255,255,0.1) */
export const RGBA_WHITE_10 = "rgba(255,255,255,0.1)";

// ============================================================================
// Cores Light Mode
// ============================================================================

/** Fundo claro - #F9FAFB */
export const COLOR_LIGHT_BACKGROUND = "#F9FAFB";

/** Texto escuro no light mode - #000000 */
export const COLOR_LIGHT_TEXT = "#000000";

/** Texto secundário no light mode - #374151 */
export const COLOR_LIGHT_TEXT_SECONDARY = "#374151";

/** Card claro - #FFFFFF */
export const COLOR_LIGHT_CARD = "#FFFFFF";

/** Borda clara - #E5E7EB */
export const COLOR_LIGHT_BORDER = "#E5E7EB";

/** Sombra clara - rgba(0,0,0,0.1) */
export const RGBA_LIGHT_SHADOW = "rgba(0,0,0,0.1)";

/** Sombra clara hover - rgba(0,0,0,0.15) */
export const RGBA_LIGHT_SHADOW_HOVER = "rgba(0,0,0,0.15)";

// ============================================================================
// Funções para obter cores baseadas no tema
// ============================================================================

/**
 * Retorna a cor de fundo baseada no tema
 */
export const getBackgroundColor = (theme: Theme): string => {
  return theme === "light" ? COLOR_LIGHT_BACKGROUND : COLOR_BLACK;
};

/**
 * Retorna a cor de texto baseada no tema
 */
export const getTextColor = (theme: Theme): string => {
  return theme === "light" ? COLOR_LIGHT_TEXT : COLOR_WHITE;
};

/**
 * Retorna a cor de texto secundário baseada no tema
 */
export const getTextSecondaryColor = (theme: Theme): string => {
  return theme === "light"
    ? COLOR_LIGHT_TEXT_SECONDARY
    : "rgba(255,255,255,0.7)";
};

/**
 * Retorna a cor de card baseada no tema
 */
export const getCardColor = (theme: Theme): string => {
  return theme === "light" ? COLOR_LIGHT_CARD : "hsl(0, 0%, 5%)";
};

/**
 * Retorna a cor de borda baseada no tema
 */
export const getBorderColor = (theme: Theme): string => {
  return theme === "light" ? COLOR_LIGHT_BORDER : "rgba(255,255,255,0.1)";
};

/**
 * Retorna a sombra baseada no tema
 */
export const getShadow = (theme: Theme, hover: boolean = false): string => {
  if (theme === "light") {
    return hover
      ? `0 4px 6px ${RGBA_LIGHT_SHADOW_HOVER}, 0 2px 4px ${RGBA_ORANGE_SHADOW_10}`
      : `0 1px 3px ${RGBA_LIGHT_SHADOW}, 0 1px 2px ${RGBA_ORANGE_SHADOW_10}`;
  }
  return hover
    ? `0 12px 48px ${RGBA_BLACK_SHADOW_60}, 0 4px 16px ${RGBA_ORANGE_SHADOW_20}`
    : `0 8px 32px ${RGBA_BLACK_SHADOW_40}, 0 2px 8px ${RGBA_ORANGE_SHADOW_10}`;
};

// ============================================================================
// Classes Tailwind para cores (para uso em className)
// ============================================================================

/**
 * Retorna a classe Tailwind para cor laranja primária
 * @param opacity Opacidade (0-100)
 */
export const getOrangeClass = (opacity?: number) => {
  if (opacity !== undefined) {
    return `bg-[${COLOR_ORANGE_PRIMARY}]/${opacity}`;
  }
  return `bg-[${COLOR_ORANGE_PRIMARY}]`;
};

/**
 * Retorna a classe Tailwind para cor azul customizada
 * @param opacity Opacidade (0-100)
 */
export const getBlueCustomClass = (opacity?: number) => {
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

/**
 * Retorna string de sombra para laranja
 * @param opacity Opacidade (0-1)
 * @param blur Blur em pixels (padrão: 16)
 */
export const getOrangeShadow = (opacity: number = 0.4, blur: number = 16) => {
  return `0 4px ${blur}px rgba(255,158,43,${opacity})`;
};

/**
 * Retorna string de sombra para preto
 * @param opacity Opacidade (0-1)
 * @param blur Blur em pixels (padrão: 32)
 */
export const getBlackShadow = (opacity: number = 0.4, blur: number = 32) => {
  return `0 8px ${blur}px rgba(0,0,0,${opacity})`;
};

/**
 * Retorna string de sombra combinada (preto + laranja)
 */
export const getCombinedShadow = () => {
  return `0 8px 32px ${RGBA_BLACK_SHADOW_40}, 0 2px 8px ${RGBA_ORANGE_SHADOW_10}`;
};

/**
 * Retorna string de sombra combinada hover
 */
export const getCombinedShadowHover = () => {
  return `0 12px 48px ${RGBA_BLACK_SHADOW_60}, 0 4px 16px ${RGBA_ORANGE_SHADOW_20}`;
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
    white10: RGBA_WHITE_10,
  },
} as const;

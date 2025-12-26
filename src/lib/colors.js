/**
 * Centralized Color System
 *
 * This file contains all color definitions used in the application.
 * All color references should use the constants defined here.
 *
 * Supports Light and Dark mode - all colors are centralized here.
 */

// ============================================================================
// Main Colors (Hex) - Dark Mode (default)
// ============================================================================

/** Primary orange - #ff9e2b */
export const COLOR_ORANGE_PRIMARY = "#ff9e2b";

/** Dark blue for titles - #1982d8 */
export const COLOR_BLUE_TITLE = "#1982d8";

/** Custom blue - #0b18c8 */
export const COLOR_BLUE_CUSTOM = "#1982d8";

/** Black - #000000 */
export const COLOR_BLACK = "#000000";

/** White - #ffffff */
export const COLOR_WHITE = "#ffffff";

// ============================================================================
// HSL Colors (for use with CSS variables)
// ============================================================================

/** Primary orange in HSL - 33 100% 58% */
export const HSL_ORANGE_PRIMARY = "33 100% 58%";

/** Custom blue in HSL - 207 79% 47% */
export const HSL_BLUE_CUSTOM = "207 79% 47%";

/** Title blue in HSL - 207 79% 47% */
export const HSL_BLUE_TITLE = "207 79% 47%";

/** Subtitle blue in HSL - 207 79% 53% */
export const HSL_BLUE_SUBTITLE = "207 79% 53%";

// ============================================================================
// RGBA Colors - Shadows and Overlays
// ============================================================================

/** Orange shadow - rgba(255,158,43,0.4) */
export const RGBA_ORANGE_SHADOW_40 = "rgba(255,158,43,0.4)";

/** Orange shadow - rgba(255,158,43,0.3) */
export const RGBA_ORANGE_SHADOW_30 = "rgba(255,158,43,0.3)";

/** Orange shadow - rgba(255,158,43,0.2) */
export const RGBA_ORANGE_SHADOW_20 = "rgba(255,158,43,0.2)";

/** Orange shadow - rgba(255,158,43,0.15) */
export const RGBA_ORANGE_SHADOW_15 = "rgba(255,158,43,0.15)";

/** Orange shadow - rgba(255,158,43,0.1) */
export const RGBA_ORANGE_SHADOW_10 = "rgba(255,158,43,0.1)";

/** Black shadow - rgba(0,0,0,0.6) */
export const RGBA_BLACK_SHADOW_60 = "rgba(0,0,0,0.6)";

/** Black shadow - rgba(0,0,0,0.4) */
export const RGBA_BLACK_SHADOW_40 = "rgba(0,0,0,0.4)";

/** Black shadow - rgba(0,0,0,0.3) */
export const RGBA_BLACK_SHADOW_30 = "rgba(0,0,0,0.3)";

/** Black shadow - rgba(0,0,0,0.2) */
export const RGBA_BLACK_SHADOW_20 = "rgba(0,0,0,0.2)";

/** Black shadow - rgba(0,0,0,0.1) */
export const RGBA_BLACK_SHADOW_10 = "rgba(0,0,0,0.1)";

/** Black shadow - rgba(0,0,0,0.08) */
export const RGBA_BLACK_SHADOW_08 = "rgba(0,0,0,0.08)";

/** Translucent white - rgba(255,255,255,0.1) */
export const RGBA_WHITE_10 = "rgba(255,255,255,0.1)";

/** Translucent white - rgba(255,255,255,0.2) */
export const RGBA_WHITE_20 = "rgba(255,255,255,0.2)";

// ============================================================================
// Light Mode Colors
// ============================================================================

/** Light background - #F9FAFB */
export const COLOR_LIGHT_BACKGROUND = "#F9FAFB";

/** Dark text in light mode - #000000 */
export const COLOR_LIGHT_TEXT = "#000000";

/** Secondary text in light mode - #374151 */
export const COLOR_LIGHT_TEXT_SECONDARY = "#374151";

/** Dark gray - #1f2937 */
export const COLOR_GRAY_DARK = "#1f2937";

/** Light card - #FFFFFF */
export const COLOR_LIGHT_CARD = "#FFFFFF";

/** Light border - #E5E7EB */
export const COLOR_LIGHT_BORDER = "#E5E7EB";

/** Light shadow - rgba(0,0,0,0.1) */
export const RGBA_LIGHT_SHADOW = "rgba(0,0,0,0.1)";

/** Light shadow hover - rgba(0,0,0,0.15) */
export const RGBA_LIGHT_SHADOW_HOVER = "rgba(0,0,0,0.15)";

/** Custom blue shadow - rgba(25, 130, 216, 0.3) */
export const RGBA_BLUE_CUSTOM_SHADOW_30 = "rgba(25, 130, 216, 0.3)";

// ============================================================================
// Functions to get colors based on theme
// ============================================================================

/**
 * Returns the background color based on theme
 */
export const getBackgroundColor = (theme) => {
  return theme === "light" ? COLOR_LIGHT_BACKGROUND : COLOR_BLACK;
};

/**
 * Returns the text color based on theme
 */
export const getTextColor = (theme) => {
  return theme === "light" ? COLOR_LIGHT_TEXT : COLOR_WHITE;
};

/**
 * Returns the secondary text color based on theme
 */
export const getTextSecondaryColor = (theme) => {
  return theme === "light"
    ? COLOR_LIGHT_TEXT_SECONDARY
    : "rgba(255,255,255,0.7)";
};

/**
 * Returns the card color based on theme
 */
export const getCardColor = (theme) => {
  return theme === "light" ? COLOR_LIGHT_CARD : "hsl(0, 0%, 5%)";
};

/**
 * Returns the border color based on theme
 */
export const getBorderColor = (theme) => {
  return theme === "light" ? COLOR_LIGHT_BORDER : "rgba(255,255,255,0.1)";
};

/**
 * Returns the shadow based on theme
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
// Tailwind classes for colors (for use in className)
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
 * Returns the Tailwind class for orange text
 */
export const getOrangeTextClass = () => `text-[${COLOR_ORANGE_PRIMARY}]`;

/**
 * Returns the Tailwind class for custom blue text
 */
export const getBlueCustomTextClass = () => `text-[hsl(var(--custom-blue))]`;

/**
 * Returns the Tailwind class for orange border
 */
export const getOrangeBorderClass = () => `border-[${COLOR_ORANGE_PRIMARY}]`;

/**
 * Returns the Tailwind class for custom blue border
 */
export const getBlueCustomBorderClass = () =>
  `border-[hsl(var(--custom-blue))]`;

// ============================================================================
// Functions for shadows (for use in style or className)
// ============================================================================

export const getOrangeShadow = (opacity = 0.4, blur = 16) => {
  return `0 3px ${blur}px rgba(255,158,43,${opacity})`;
};

export const getBlackShadow = (opacity = 0.4, blur = 32) => {
  return `0 6px ${blur}px rgba(0,0,0,${opacity})`;
};

/**
 * Returns combined shadow string (black + orange)
 */
export const getCombinedShadow = () => {
  return `0 6px 24px ${RGBA_BLACK_SHADOW_40}, 0 2px 6px ${RGBA_ORANGE_SHADOW_10}`;
};

/**
 * Returns combined shadow string for hover
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
// Chart Color Mappings
// ============================================================================

/**
 * Chart CSS Variable Colors
 * Centralized references to chart-related CSS variables
 */
export const CHART_COLORS = {
  positive: "hsl(var(--chart-positive))",
  negative: "hsl(var(--chart-negative))",
  neutral: "hsl(var(--chart-neutral))",
  foreground: "hsl(var(--foreground))",
  primary: "hsl(var(--primary))",
};

/**
 * NPS Chart Color Mapping
 * Maps NPS category keys to their corresponding CSS variable colors
 */
export const NPS_COLOR_MAP = {
  Detratores: CHART_COLORS.negative,
  Neutros: CHART_COLORS.neutral,
  Promotores: CHART_COLORS.positive,
};

/**
 * Sentiment Chart Color Mapping
 * Maps sentiment category keys to their corresponding CSS variable colors
 */
export const SENTIMENT_COLOR_MAP = {
  Negativo: CHART_COLORS.negative,
  "Não aplicável": CHART_COLORS.neutral,
  Positivo: CHART_COLORS.positive,
};

// ============================================================================
// Export of all colors as object (for reference)
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

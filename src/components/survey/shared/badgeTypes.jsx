// ============================================================
// BADGE TYPES - Centralized badge type definitions
// ============================================================
// This file contains all badge type definitions used across
// the survey components.
//
// Badge Variants:
// - default: Primary badge with custom blue background
// - secondary: Secondary badge with muted background
// - destructive: Destructive badge with red background
// - outline: Badge with outline border only
//
// Severity Types:
// - critical: Critical severity badge
// - high: High severity badge
// - medium: Medium severity badge
// - low: Low severity badge

// Badge variant types
export const BADGE_VARIANTS = {
  DEFAULT: "default",
  SECONDARY: "secondary",
  DESTRUCTIVE: "destructive",
  OUTLINE: "outline",
};

// Severity types
export const SEVERITY_TYPES = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

// Severity color classes mapping
export const severityColors = {
  critical: "bg-severity-critical text-white",
  high: "bg-severity-high text-white",
  medium: "bg-severity-medium text-white",
  low: "bg-severity-low text-white",
};

// Severity CSS class names (from index.css)
export const severityClassNames = {
  critical: "badge-critical",
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
};


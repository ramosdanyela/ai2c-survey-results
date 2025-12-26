/**
 * Centralized application icons
 *
 * This file gathers all lucide-react icons used in the application
 * to facilitate maintenance and ensure consistency.
 *
 * Includes icons used in:
 * - Application components
 * - UI components (shadcn/ui)
 */

// Navigation and UI icons
export {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Check,
} from "lucide-react";

// Document and file icons
export { FileText, Download, Presentation, ClipboardList } from "lucide-react";

// Chart and analysis icons
export { BarChart3, TrendingUp, Target, Heart } from "lucide-react";

// Communication icons
export { MessageSquare } from "lucide-react";

// Organization and structure icons
export { Layers, Filter } from "lucide-react";

// Location and attribute icons
export { MapPin, GraduationCap, Building } from "lucide-react";

// User and people icons
export { Users, Users2, User } from "lucide-react";

// Metrics and data icons
export { Percent, HelpCircle, CheckSquare } from "lucide-react";

// Alert and notification icons
export { AlertTriangle } from "lucide-react";

// Theme icons
export { Moon, Sun } from "lucide-react";

// Content icons
export { Award, Cloud } from "lucide-react";

// Pagination icons
export { MoreHorizontal } from "lucide-react";

/**
 * Icon mapping by category (for reference)
 */
export const iconCategories = {
  navigation: [
    "ChevronDown",
    "ChevronUp",
    "ChevronLeft",
    "ChevronRight",
    "ArrowLeft",
    "ArrowRight",
    "Menu",
    "X",
    "Check",
  ],
  documents: ["FileText", "Download", "Presentation", "ClipboardList"],
  charts: ["BarChart3", "TrendingUp", "Target", "Heart"],
  communication: ["MessageSquare"],
  organization: ["Layers", "Filter"],
  location: ["MapPin", "GraduationCap", "Building"],
  users: ["Users", "Users2", "User"],
  metrics: ["Percent", "HelpCircle", "CheckSquare", "Check"],
  alerts: ["AlertTriangle"],
  theme: ["Moon", "Sun"],
  content: ["Award", "Cloud"],
  pagination: ["MoreHorizontal"],
};

/**
 * Complete list of all icons used (in alphabetical order)
 */
export const allIcons = [
  "AlertTriangle",
  "ArrowLeft",
  "ArrowRight",
  "Award",
  "BarChart3",
  "Building",
  "Check",
  "CheckSquare",
  "ChevronDown",
  "ChevronLeft",
  "ChevronRight",
  "ChevronUp",
  "Cloud",
  "ClipboardList",
  "Download",
  "FileText",
  "Filter",
  "GraduationCap",
  "Heart",
  "HelpCircle",
  "Layers",
  "MapPin",
  "Menu",
  "MessageSquare",
  "Moon",
  "MoreHorizontal",
  "Percent",
  "Presentation",
  "Sun",
  "Target",
  "TrendingUp",
  "User",
  "Users",
  "Users2",
  "X",
];

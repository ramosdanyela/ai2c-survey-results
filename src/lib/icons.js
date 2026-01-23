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
export { MessageSquare, MessageCircle } from "lucide-react";

// Organization and structure icons
export { Layers, Filter, Table } from "lucide-react";

// Location and attribute icons
export {
  MapPin,
  GraduationCap,
  Building,
  Clock,
  Briefcase,
} from "lucide-react";

// User and people icons
export { Users, Users2, User, Smile } from "lucide-react";

// Metrics and data icons
export { Percent, HelpCircle, CheckSquare, Scale, CircleDot } from "lucide-react";

// Alert and notification icons
export { AlertTriangle } from "lucide-react";

// Theme icons
export { Moon, Sun } from "lucide-react";

// Content icons
export { Award, Cloud, Star } from "lucide-react";

// Pagination icons
export { MoreHorizontal } from "lucide-react";

// Import all icons for mapping
import * as LucideIcons from "lucide-react";

/**
 * Icon name to component mapping
 * Converts string icon names to React icon components
 */
export const iconMap = {
  AlertTriangle: LucideIcons.AlertTriangle,
  ArrowLeft: LucideIcons.ArrowLeft,
  ArrowRight: LucideIcons.ArrowRight,
  Award: LucideIcons.Award,
  BarChart3: LucideIcons.BarChart3,
  Briefcase: LucideIcons.Briefcase,
  Building: LucideIcons.Building,
  Check: LucideIcons.Check,
  CheckSquare: LucideIcons.CheckSquare,
  ChevronDown: LucideIcons.ChevronDown,
  CircleDot: LucideIcons.CircleDot,
  ChevronLeft: LucideIcons.ChevronLeft,
  ChevronRight: LucideIcons.ChevronRight,
  ChevronUp: LucideIcons.ChevronUp,
  Clock: LucideIcons.Clock,
  Cloud: LucideIcons.Cloud,
  ClipboardList: LucideIcons.ClipboardList,
  Download: LucideIcons.Download,
  FileText: LucideIcons.FileText,
  Filter: LucideIcons.Filter,
  GraduationCap: LucideIcons.GraduationCap,
  Heart: LucideIcons.Heart,
  HelpCircle: LucideIcons.HelpCircle,
  Layers: LucideIcons.Layers,
  MapPin: LucideIcons.MapPin,
  Table: LucideIcons.Table,
  Menu: LucideIcons.Menu,
  MessageCircle: LucideIcons.MessageCircle,
  MessageSquare: LucideIcons.MessageSquare,
  Moon: LucideIcons.Moon,
  MoreHorizontal: LucideIcons.MoreHorizontal,
  Percent: LucideIcons.Percent,
  Presentation: LucideIcons.Presentation,
  Scale: LucideIcons.Scale,
  Smile: LucideIcons.Smile,
  Star: LucideIcons.Star,
  Sun: LucideIcons.Sun,
  Target: LucideIcons.Target,
  TrendingUp: LucideIcons.TrendingUp,
  User: LucideIcons.User,
  Users: LucideIcons.Users,
  Users2: LucideIcons.Users2,
  X: LucideIcons.X,
};

/**
 * Get icon component by name
 * @param {string} iconName - Name of the icon (e.g., "FileText", "BarChart3")
 * @returns {React.Component} - Icon component or FileText as fallback if not found
 */
export function getIcon(iconName) {
  if (!iconName) return FileText;
  return iconMap[iconName] || FileText;
}

/**
 * Complete list of all icons used (in alphabetical order)
 * Generated automatically from iconMap to avoid duplication
 */
export const allIcons = Object.keys(iconMap).sort();

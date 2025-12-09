import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {boolean} [props.hidden]
 */
export function ThemeToggle({ className, hidden = false }) {
  const { theme, toggleTheme } = useTheme();

  if (hidden) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 transition-colors",
        "hover:bg-muted",
        className
      )}
      aria-label={`Alternar para modo ${
        theme === "light" ? "escuro" : "claro"
      }`}
      title={`Alternar para modo ${theme === "light" ? "escuro" : "claro"}`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}

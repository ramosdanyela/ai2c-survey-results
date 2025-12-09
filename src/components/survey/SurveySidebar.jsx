import {
  FileText,
  BarChart3,
  MessageSquare,
  Layers,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { surveyInfo } from "@/data/surveyData";
import { forwardRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * @typedef {Object} SurveySidebarProps
 * @property {string} activeSection
 * @property {Function} onSectionChange
 * @property {Function} [onItemClick]
 */
const menuItems = [
  {
    id: "executive",
    label: "Relatório Executivo",
    icon: FileText,
  },
  {
    id: "support",
    label: "Análises de Suporte",
    icon: BarChart3,
  },
  {
    id: "attributes",
    label: "Aprofundamento por Atributos",
    icon: Layers,
  },
  {
    id: "responses",
    label: "Análise por Questão",
    icon: MessageSquare,
  },
  {
    id: "implementation",
    label: "Proposta de Implementação",
    icon: CheckSquare,
  },
];

// Componente interno para renderizar o conteúdo da sidebar
function SidebarContent({ activeSection, onSectionChange, onItemClick }) {
  return (
    <div className="flex flex-col h-full py-6 px-4 w-full">
      <div className="mb-6 pb-6 flex items-center justify-between gap-2">
        <h1 className="text-xs font-bold text-sidebar-foreground whitespace-nowrap">
          {surveyInfo.title}
        </h1>
        <ThemeToggle className="shrink-0" />
      </div>
      <nav className="flex flex-col gap-2 items-start w-full">
        {menuItems.map((item) => {
          const isActive =
            activeSection === item.id ||
            activeSection.startsWith(item.id + "-");
          return (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                if (onItemClick) {
                  onItemClick();
                }
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-left",
                isActive
                  ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_4px_16px_hsl(var(--custom-blue),0.4)]"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-lg font-bold whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Sidebar para desktop (sempre visível em telas grandes)
export const SurveySidebar = forwardRef(
  ({ activeSection, onSectionChange }, ref) => {
    return (
      <aside
        ref={ref}
        className="hidden lg:flex fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-20 overflow-y-auto"
        style={{ width: "auto", minWidth: "fit-content" }}
      >
        <SidebarContent
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />
      </aside>
    );
  }
);
SurveySidebar.displayName = "SurveySidebar";

// Componente para o conteúdo da sidebar no mobile (dentro do Sheet)
export function SurveySidebarMobile({
  activeSection,
  onSectionChange,
  onItemClick,
}) {
  return (
    <div
      className="bg-sidebar h-full overflow-y-auto"
      style={{ width: "auto", minWidth: "fit-content" }}
    >
      <SidebarContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onItemClick={onItemClick}
      />
    </div>
  );
}

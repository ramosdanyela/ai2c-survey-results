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
import { RGBA_BLACK_SHADOW_20 } from "@/lib/colors";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
      <div className="mb-6 pb-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-base font-bold text-sidebar-foreground">
            {surveyInfo.title}
          </h1>
          <ThemeToggle className="shrink-0" />
        </div>
        <div className="flex flex-col gap-1 text-sidebar-foreground/80">
          <div className="text-sm font-semibold text-sidebar-foreground">
            {surveyInfo.company}
          </div>
          <div className="text-xs">{surveyInfo.period}</div>
          <div className="text-xs">
            {surveyInfo.totalRespondents.toLocaleString("pt-BR")} respondentes
          </div>
        </div>
      </div>
      <nav className="flex flex-col gap-2 items-start w-full flex-1">
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

      {/* NPS Card */}
      <div className="mt-auto pt-6">
        <div className="bg-[#f5f0e8] dark:bg-[#2a2520] rounded-lg p-4 border border-border/50 shadow-sm">
          {/* NPS Score */}
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-foreground mb-1">
              {surveyInfo.nps}
            </div>
            <div className="text-xs text-muted-foreground mb-3">NPS Score</div>

            {/* Progress Bar */}
            <div className="mb-3">
              <Progress
                value={(surveyInfo.nps + 100) / 2}
                className="h-2 bg-muted"
              />
            </div>

            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="bg-[hsl(var(--primary))] text-white border-0">
                {surveyInfo.npsCategory}
              </Badge>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-border/50 my-4"></div>

          {/* Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Respondentes
              </span>
              <span className="text-xs font-semibold text-foreground">
                {surveyInfo.totalRespondents.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Taxa de Resposta
              </span>
              <span className="text-xs font-semibold text-foreground">
                {surveyInfo.responseRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar para desktop (sempre visível em telas grandes)
export const SurveySidebar = forwardRef(
  ({ activeSection, onSectionChange }, ref) => {
    return (
      <aside
        ref={ref}
        className="hidden lg:flex fixed left-0 top-0 h-full bg-sidebar z-20 overflow-y-auto"
        style={{
          width: "auto",
          minWidth: "fit-content",
          boxShadow: `2px 0 8px ${RGBA_BLACK_SHADOW_20}`,
        }}
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

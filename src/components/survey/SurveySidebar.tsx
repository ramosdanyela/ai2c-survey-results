import {
  FileText,
  BarChart3,
  MessageSquare,
  Layers,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { surveyInfo } from "@/data/surveyData";

interface SurveySidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onItemClick?: () => void; // Para fechar o sheet quando clicar em um item
}

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
function SidebarContent({
  activeSection,
  onSectionChange,
  onItemClick,
}: SurveySidebarProps) {
  return (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="mb-6 pb-6">
        <h1 className="text-xs font-bold text-white">{surveyInfo.title}</h1>
      </div>
      <nav className="flex flex-col gap-2 items-start">
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
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-left w-full",
                isActive
                  ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_4px_16px_hsl(var(--custom-blue),0.4)]"
                  : "text-white/80 hover:text-white hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
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
export function SurveySidebar({
  activeSection,
  onSectionChange,
}: SurveySidebarProps) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-80 bg-black border-r border-white/10 z-20 overflow-y-auto">
      <SidebarContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
    </aside>
  );
}

// Componente para o conteúdo da sidebar no mobile (dentro do Sheet)
export function SurveySidebarMobile({
  activeSection,
  onSectionChange,
  onItemClick,
}: SurveySidebarProps) {
  return (
    <div className="w-80 bg-black h-full overflow-y-auto">
      <SidebarContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onItemClick={onItemClick}
      />
    </div>
  );
}

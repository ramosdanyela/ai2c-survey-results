import {
  FileText,
  BarChart3,
  MessageSquare,
  Layers,
  CheckSquare,
  ClipboardList,
  Heart,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SurveyHeaderProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

// Mapeamento de seções para títulos
const sectionTitles: Record<string, string> = {
  executive: "Relatório Executivo",
  "executive-summary": "Sumário Executivo",
  "executive-recommendations": "Recomendações",
  support: "Análises de Suporte",
  "support-sentiment": "Análise de Sentimento",
  "support-intent": "Intenção de Respondentes",
  "support-segmentation": "Segmentação",
  responses: "Detalhes das Respostas",
  attributes: "Aprofundamento por Atributos",
  implementation: "Proposta de Implementação",
};

// Mapeamento de seções para ícones
const sectionIcons: Record<string, typeof FileText> = {
  executive: FileText,
  "executive-summary": ClipboardList,
  "executive-recommendations": FileText,
  support: BarChart3,
  "support-sentiment": Heart,
  "support-intent": BarChart3,
  "support-segmentation": BarChart3,
  responses: MessageSquare,
  attributes: Layers,
  implementation: CheckSquare,
};

function getSectionTitle(activeSection: string): string {
  // Primeiro tenta encontrar o título exato
  if (sectionTitles[activeSection]) {
    return sectionTitles[activeSection];
  }

  // Se não encontrar, tenta encontrar pela seção base (antes do hífen)
  const baseSection = activeSection.split("-")[0];
  if (sectionTitles[baseSection]) {
    return sectionTitles[baseSection];
  }

  // Fallback
  return "Dashboard";
}

function getSectionIcon(activeSection: string) {
  // Primeiro tenta encontrar o ícone exato
  if (sectionIcons[activeSection]) {
    return sectionIcons[activeSection];
  }

  // Se não encontrar, tenta encontrar pela seção base (antes do hífen)
  const baseSection = activeSection.split("-")[0];
  if (sectionIcons[baseSection]) {
    return sectionIcons[baseSection];
  }

  // Fallback
  return FileText;
}

const menuItems = [
  {
    id: "executive",
    label: "Relatório Executivo",
    icon: FileText,
    subItems: [
      { id: "executive-summary", label: "Sumário Executivo" },
      { id: "executive-recommendations", label: "Recomendações" },
    ],
  },
  {
    id: "support",
    label: "Análises de Suporte",
    icon: BarChart3,
    subItems: [
      { id: "support-sentiment", label: "Análise de Sentimento" },
      { id: "support-intent", label: "Intenção de Respondentes" },
      { id: "support-segmentation", label: "Segmentação" },
    ],
  },
  {
    id: "responses",
    label: "Detalhes das Respostas",
    icon: MessageSquare,
  },
  {
    id: "attributes",
    label: "Aprofundamento por Atributos",
    icon: Layers,
  },
  {
    id: "implementation",
    label: "Proposta de Implementação",
    icon: CheckSquare,
  },
];

export function SurveyHeader({
  activeSection,
  onSectionChange,
}: SurveyHeaderProps) {
  const title = getSectionTitle(activeSection);
  const Icon = getSectionIcon(activeSection);

  return (
    <header className="sticky top-0 z-10 bg-black border-b border-white/10">
      <div className="flex flex-col gap-4 px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative inline-block">
            <div className="relative inline-flex items-center gap-3 bg-[#ff9e2b] text-white font-bold px-10 py-4 rounded-2xl text-xl shadow-[0_8px_32px_rgba(255,158,43,0.3)]">
              <Icon className="w-6 h-6 text-white" />
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <span className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-6 h-6 bg-[#ff9e2b] rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-wrap gap-2">
          {menuItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              activeSection.startsWith(item.id + "-");
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => onSectionChange?.(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#ff9e2b] text-white shadow-[0_4px_16px_rgba(255,158,43,0.4)]"
                      : "text-white/80 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

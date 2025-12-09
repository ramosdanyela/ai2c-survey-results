import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  FileText,
  BarChart3,
  MessageSquare,
  Layers,
  CheckSquare,
  ClipboardList,
  Heart,
} from "lucide-react";

interface SurveyHeaderProps {
  activeSection: string;
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

export function SurveyHeader({ activeSection }: SurveyHeaderProps) {
  const title = getSectionTitle(activeSection);
  const Icon = getSectionIcon(activeSection);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 px-3 sm:px-4 lg:px-6 py-2">
        <div className="lg:hidden">
          <SidebarTrigger>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SidebarTrigger>
        </div>
        {isCollapsed && (
          <div className="hidden lg:block">
            <SidebarTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SidebarTrigger>
          </div>
        )}
        <div className="relative inline-block mt-6 pb-3">
          <div className="relative inline-flex items-center gap-3 bg-[hsl(var(--primary))] text-white font-bold px-10 py-4 rounded-2xl text-xl">
            <Icon className="w-6 h-6 text-white" />
            <h1 className="header-title">{title}</h1>
            <span className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-6 h-6 bg-[hsl(var(--primary))] rounded-full"></span>
          </div>
        </div>
      </div>
    </header>
  );
}

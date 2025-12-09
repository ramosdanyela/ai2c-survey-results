import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

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

export function SurveyHeader({ activeSection }: SurveyHeaderProps) {
  const title = getSectionTitle(activeSection);

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center gap-4 px-3 sm:px-4 lg:px-6 py-4">
        <SidebarTrigger className="lg:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </SidebarTrigger>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
      </div>
    </header>
  );
}

import {
  ChevronRight,
  ChevronLeft,
  FileText,
  BarChart3,
  MessageSquare,
  Layers,
  CheckSquare,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLOR_ORANGE_PRIMARY, RGBA_ORANGE_SHADOW_40 } from "@/lib/colors";

interface SurveyHeaderProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
  onMenuClick?: () => void;
}

// Ordem das seções principais
const sectionOrder = [
  "executive",
  "support",
  "attributes",
  "responses",
  "implementation",
];

// Mapeamento de seções para títulos
const sectionTitles: Record<string, string> = {
  executive: "Relatório Executivo",
  "executive-summary": "Sumário Executivo",
  "executive-recommendations": "Recomendações",
  support: "Análises de Suporte",
  "support-sentiment": "Análise de Sentimento",
  "support-intent": "Intenção de Respondentes",
  "support-segmentation": "Segmentação",
  responses: "Análise por Questão",
  attributes: "Aprofundamento por Atributos",
  implementation: "Proposta de Implementação",
};

// Mapeamento de seções para ícones
const sectionIcons: Record<string, typeof FileText> = {
  executive: FileText,
  "executive-summary": FileText,
  "executive-recommendations": FileText,
  support: BarChart3,
  "support-sentiment": BarChart3,
  "support-intent": BarChart3,
  "support-segmentation": BarChart3,
  responses: MessageSquare,
  attributes: Layers,
  implementation: CheckSquare,
};

function getNextSection(currentSection: string): string | null {
  // Encontrar a seção base atual
  const baseSection = currentSection.split("-")[0];
  const currentIndex = sectionOrder.indexOf(baseSection);

  // Se não encontrou ou é a última seção, retorna null
  if (currentIndex === -1 || currentIndex === sectionOrder.length - 1) {
    return null;
  }

  // Retorna a próxima seção
  return sectionOrder[currentIndex + 1];
}

function getPreviousSection(currentSection: string): string | null {
  // Encontrar a seção base atual
  const baseSection = currentSection.split("-")[0];
  const currentIndex = sectionOrder.indexOf(baseSection);

  // Se não encontrou ou é a primeira seção, retorna null
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  // Retorna a seção anterior
  return sectionOrder[currentIndex - 1];
}

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

export function SurveyHeader({
  activeSection,
  onSectionChange,
  onMenuClick,
}: SurveyHeaderProps) {
  const title = getSectionTitle(activeSection);
  const Icon = getSectionIcon(activeSection);
  const nextSection = getNextSection(activeSection);
  const previousSection = getPreviousSection(activeSection);

  const handleNext = () => {
    if (nextSection && onSectionChange) {
      onSectionChange(nextSection);
    }
  };

  const handlePrevious = () => {
    if (previousSection && onSectionChange) {
      onSectionChange(previousSection);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="px-3 sm:px-4 lg:px-6 py-4 flex items-center">
        {/* Hamburger Menu - Visível apenas em telas menores */}
        <div className="lg:hidden mr-3">
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex justify-start">
          {previousSection && (
            <Button
              onClick={handlePrevious}
              size={null}
              className="bg-[hsl(var(--custom-blue))] text-white hover:bg-[hsl(var(--custom-blue))]/80 border border-[hsl(var(--custom-blue))] p-1 text-sm h-auto flex items-center justify-center"
            >
              <div className="flex items-center justify-between w-full">
                <ChevronLeft className="w-4 h-4 p-0 m-0" />
                <span>Voltar</span>
              </div>
            </Button>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: COLOR_ORANGE_PRIMARY,
              boxShadow: `0 4px 16px ${RGBA_ORANGE_SHADOW_40}`,
            }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-white whitespace-nowrap">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2">
          {nextSection && (
            <Button
              onClick={handleNext}
              size={null}
              className="bg-[hsl(var(--custom-blue))] text-white hover:bg-[hsl(var(--custom-blue))]/80 border border-[hsl(var(--custom-blue))] p-1 text-sm h-auto flex items-center justify-center"
            >
              <div className="flex items-center justify-between w-full">
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4 p-0 m-0" />
              </div>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

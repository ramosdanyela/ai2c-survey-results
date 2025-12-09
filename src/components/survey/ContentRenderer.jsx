import { ExecutiveReport } from "@/components/survey/ExecutiveReport";
import { SupportAnalysis } from "@/components/survey/SupportAnalysis";
import { ResponseDetails } from "@/components/survey/ResponseDetails";
import { AttributeDeepDive } from "@/components/survey/AttributeDeepDive";
import { ImplementationPlan } from "@/components/survey/ImplementationPlan";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

// Ordem das seções principais
const sectionOrder = [
  "executive",
  "support",
  "attributes",
  "responses",
  "implementation",
];

function getNextSection(currentSection) {
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

function getPreviousSection(currentSection) {
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

/**
 * @param {Object} props
 * @param {string} props.activeSection
 * @param {Function} [props.onSectionChange]
 */
export function ContentRenderer({ activeSection, onSectionChange }) {
  const nextSection = getNextSection(activeSection);
  const previousSection = getPreviousSection(activeSection);

  const handleNext = () => {
    if (nextSection && onSectionChange) {
      onSectionChange(nextSection);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (previousSection && onSectionChange) {
      onSectionChange(previousSection);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  let content;

  // Renderiza seções executivas
  if (activeSection.startsWith("executive")) {
    const subSection =
      activeSection !== "executive" ? activeSection : undefined;
    content = (
      <ExecutiveReport
        subSection={subSection}
        onSectionChange={onSectionChange}
      />
    );
  }
  // Renderiza análises de suporte
  else if (activeSection.startsWith("support")) {
    const subSection = activeSection !== "support" ? activeSection : undefined;
    content = <SupportAnalysis subSection={subSection} />;
  }
  // Renderiza detalhes das respostas
  else if (activeSection === "responses") {
    content = <ResponseDetails />;
  }
  // Renderiza aprofundamento por atributos
  else if (activeSection === "attributes") {
    content = <AttributeDeepDive />;
  }
  // Renderiza proposta de implementação
  else if (activeSection === "implementation") {
    // Extrair recId da URL hash se existir (ex: #rec-1)
    let openRecId;
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const recIdMatch = hash.match(/rec-(\d+)/);
      openRecId = recIdMatch ? parseInt(recIdMatch[1], 10) : undefined;
    }
    content = <ImplementationPlan openRecId={openRecId} />;
  }
  // Fallback para relatório executivo
  else {
    content = <ExecutiveReport />;
  }

  return (
    <div className="space-y-8">
      {content}
      {(previousSection || nextSection) && (
        <div className="flex justify-between items-center pt-8 border-t border-white/10">
          {previousSection ? (
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
          ) : (
            <div></div>
          )}
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
      )}
    </div>
  );
}

import { ExecutiveReport } from "@/components/survey/ExecutiveReport";
import { SupportAnalysis } from "@/components/survey/SupportAnalysis";
import { ResponseDetails } from "@/components/survey/ResponseDetails";
import { AttributeDeepDive } from "@/components/survey/AttributeDeepDive";
import { ImplementationPlan } from "@/components/survey/ImplementationPlan";

interface ContentRendererProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

export function ContentRenderer({
  activeSection,
  onSectionChange,
}: ContentRendererProps) {
  // Renderiza seções executivas
  if (activeSection.startsWith("executive")) {
    const subSection =
      activeSection !== "executive" ? activeSection : undefined;
    return (
      <ExecutiveReport
        subSection={subSection}
        onSectionChange={onSectionChange}
      />
    );
  }

  // Renderiza análises de suporte
  if (activeSection.startsWith("support")) {
    const subSection = activeSection !== "support" ? activeSection : undefined;
    return <SupportAnalysis subSection={subSection} />;
  }

  // Renderiza detalhes das respostas
  if (activeSection === "responses") {
    return <ResponseDetails />;
  }

  // Renderiza aprofundamento por atributos
  if (activeSection === "attributes") {
    return <AttributeDeepDive />;
  }

  // Renderiza proposta de implementação
  if (activeSection === "implementation") {
    // Extrair recId da URL hash se existir (ex: #rec-1)
    let openRecId: number | undefined;
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const recIdMatch = hash.match(/rec-(\d+)/);
      openRecId = recIdMatch ? parseInt(recIdMatch[1], 10) : undefined;
    }
    return <ImplementationPlan openRecId={openRecId} />;
  }

  // Fallback para relatório executivo
  return <ExecutiveReport />;
}

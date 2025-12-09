import { ExecutiveReport } from "@/components/survey/ExecutiveReport";
import { SupportAnalysis } from "@/components/survey/SupportAnalysis";
import { ResponseDetails } from "@/components/survey/ResponseDetails";
import { AttributeDeepDive } from "@/components/survey/AttributeDeepDive";
import { responseDetails, attributeDeepDive } from "@/data/surveyData";

// Obter todas as perguntas para navegação
const getAllQuestions = () => {
  const allQuestions = [
    ...responseDetails.closedQuestions.map((q) => ({
      ...q,
      type: "closed",
    })),
    ...responseDetails.openQuestions.map((q) => ({
      ...q,
      type: "open",
    })),
  ]
    .filter((q) => q.id !== 3) // Ocultar Q3
    .sort((a, b) => a.id - b.id);
  return allQuestions.map((q) => `responses-${q.id}`);
};

// Obter todas as subseções de atributos para navegação
const getAllAttributes = () => {
  const attributeIcons = {
    state: true,
    education: true,
    customerType: true,
  };
  return attributeDeepDive.attributes
    .filter((attr) => attr.id in attributeIcons)
    .map((attr) => `attributes-${attr.id}`);
};

// Lista completa de todas as subseções em ordem
const allSubsections = [
  "executive-summary",
  "executive-recommendations",
  "support-sentiment",
  "support-intent",
  "support-segmentation",
  ...getAllAttributes(),
  ...getAllQuestions(),
];

function getNextSection(currentSection) {
  // Normalizar a seção atual
  let normalizedSection = currentSection;

  // Se for apenas "executive" ou "support", mapear para a primeira subseção
  if (currentSection === "executive") {
    normalizedSection = "executive-summary";
  } else if (currentSection === "support") {
    normalizedSection = "support-sentiment";
  } else if (currentSection === "attributes") {
    // Se for apenas "attributes", mapear para o primeiro atributo
    const attributes = getAllAttributes();
    normalizedSection = attributes[0] || "attributes";
  } else if (currentSection === "responses") {
    // Se for apenas "responses", mapear para a primeira pergunta
    const questions = getAllQuestions();
    normalizedSection = questions[0] || "responses";
  }

  const currentIndex = allSubsections.indexOf(normalizedSection);

  // Se não encontrou ou é a última subseção, retorna null
  if (currentIndex === -1 || currentIndex === allSubsections.length - 1) {
    return null;
  }

  // Retorna a próxima subseção
  return allSubsections[currentIndex + 1];
}

function getPreviousSection(currentSection) {
  // Normalizar a seção atual
  let normalizedSection = currentSection;

  // Se for apenas "executive" ou "support", mapear para a primeira subseção
  if (currentSection === "executive") {
    normalizedSection = "executive-summary";
  } else if (currentSection === "support") {
    normalizedSection = "support-sentiment";
  } else if (currentSection === "attributes") {
    // Se for apenas "attributes", mapear para o primeiro atributo
    const attributes = getAllAttributes();
    normalizedSection = attributes[0] || "attributes";
  } else if (currentSection === "responses") {
    // Se for apenas "responses", mapear para a primeira pergunta
    const questions = getAllQuestions();
    normalizedSection = questions[0] || "responses";
  }

  const currentIndex = allSubsections.indexOf(normalizedSection);

  // Se não encontrou ou é a primeira subseção, retorna null
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  // Retorna a subseção anterior
  return allSubsections[currentIndex - 1];
}

/**
 * @param {Object} props
 * @param {string} props.activeSection
 * @param {Function} [props.onSectionChange]
 */
export function ContentRenderer({ activeSection, onSectionChange }) {
  let content;

  // Normalizar activeSection para garantir que seja uma subseção específica
  let normalizedSection = activeSection;
  if (activeSection === "executive") {
    normalizedSection = "executive-summary";
  } else if (activeSection === "support") {
    normalizedSection = "support-sentiment";
  } else if (activeSection === "attributes") {
    // Se for apenas "attributes", mapear para o primeiro atributo
    const attributes = getAllAttributes();
    normalizedSection = attributes[0] || "attributes";
  }

  // Renderiza seções executivas
  if (normalizedSection.startsWith("executive")) {
    // Sempre passar a subseção específica
    content = (
      <ExecutiveReport
        subSection={normalizedSection}
        onSectionChange={onSectionChange}
      />
    );
  }
  // Renderiza análises de suporte
  else if (normalizedSection.startsWith("support")) {
    // Sempre passar a subseção específica
    content = <SupportAnalysis subSection={normalizedSection} />;
  }
  // Renderiza detalhes das respostas
  else if (
    normalizedSection === "responses" ||
    normalizedSection.startsWith("responses-")
  ) {
    // Extrair o ID da pergunta se for uma subseção específica (ex: responses-1)
    const questionIdMatch = normalizedSection.match(/responses-(\d+)/);
    const questionId = questionIdMatch
      ? parseInt(questionIdMatch[1], 10)
      : undefined;
    // Usar key para garantir que o componente seja atualizado quando questionId muda
    // Isso garante que a lógica combinada (abrir accordion + scroll) seja aplicada
    content = (
      <ResponseDetails key={`question-${questionId}`} questionId={questionId} />
    );
  }
  // Renderiza aprofundamento por atributos
  else if (
    normalizedSection === "attributes" ||
    normalizedSection.startsWith("attributes-")
  ) {
    // Extrair o ID do atributo se for uma subseção específica (ex: attributes-customerType)
    const attributeIdMatch = normalizedSection.match(/attributes-(.+)/);
    const attributeId = attributeIdMatch ? attributeIdMatch[1] : undefined;
    content = <AttributeDeepDive attributeId={attributeId} />;
  }
  // Fallback para primeira subseção
  else {
    content = (
      <ExecutiveReport
        subSection="executive-summary"
        onSectionChange={onSectionChange}
      />
    );
  }

  return <div className="space-y-8">{content}</div>;
}

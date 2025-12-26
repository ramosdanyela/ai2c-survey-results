import {
  ChevronRight,
  ChevronLeft,
  FileText,
  BarChart3,
  MessageSquare,
  Layers,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COLOR_ORANGE_PRIMARY,
  RGBA_ORANGE_SHADOW_40,
  RGBA_BLACK_SHADOW_20,
  getBlueGradient,
  getBlueButtonShadow,
  RGBA_WHITE_20,
} from "@/lib/colors";
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

// Obter número de exibição baseado no questionId real (renumeração excluindo Q3)
const getDisplayNumber = (questionId) => {
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

  const index = allQuestions.findIndex((q) => q.id === questionId);
  return index !== -1 ? index + 1 : questionId; // Retorna índice + 1 ou o ID original se não encontrar
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

// Lista completa de todas as subseções em ordem (mesma do ContentRenderer)
const allSubsections = [
  "executive-summary",
  "executive-recommendations",
  "support-sentiment",
  "support-intent",
  "support-segmentation",
  ...getAllAttributes(),
  ...getAllQuestions(),
];

// Mapeamento de seções para títulos
const sectionTitles = {
  executive: "Relatório Executivo",
  "executive-summary": "Sumário Executivo",
  "executive-recommendations": "Recomendações",
  support: "Análises de Suporte",
  "support-sentiment": "Análise de Sentimento",
  "support-intent": "Intenção de Respondentes",
  "support-segmentation": "Segmentação",
  responses: "Análise por Questão",
  attributes: "Aprofundamento por Atributos",
};

// Mapeamento de seções para ícones
const sectionIcons = {
  executive: FileText,
  "executive-summary": FileText,
  "executive-recommendations": FileText,
  support: BarChart3,
  "support-sentiment": BarChart3,
  "support-intent": BarChart3,
  "support-segmentation": BarChart3,
  responses: MessageSquare,
  attributes: Layers,
};

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

  // Caso especial: se estiver em uma questão específica, navegar apenas entre questões
  if (normalizedSection.startsWith("responses-")) {
    const questions = getAllQuestions();
    const currentIndex = questions.indexOf(normalizedSection);

    // Se não encontrou ou é a última questão, verificar se há próxima seção
    if (currentIndex === -1 || currentIndex === questions.length - 1) {
      // Se é a última questão, verificar se há próxima seção após todas as questões
      const lastQuestionIndex = allSubsections.indexOf(
        questions[questions.length - 1]
      );
      if (
        lastQuestionIndex !== -1 &&
        lastQuestionIndex < allSubsections.length - 1
      ) {
        return allSubsections[lastQuestionIndex + 1];
      }
      return null;
    }

    // Retorna a próxima questão
    return questions[currentIndex + 1];
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

  // Caso especial: se estiver em uma questão específica, navegar apenas entre questões
  if (normalizedSection.startsWith("responses-")) {
    const questions = getAllQuestions();
    const currentIndex = questions.indexOf(normalizedSection);

    // Se não encontrou ou é a primeira questão, verificar se há seção anterior
    if (currentIndex === -1 || currentIndex === 0) {
      // Se é a primeira questão, verificar se há seção anterior antes de todas as questões
      const firstQuestionIndex = allSubsections.indexOf(questions[0]);
      if (firstQuestionIndex !== -1 && firstQuestionIndex > 0) {
        return allSubsections[firstQuestionIndex - 1];
      }
      return null;
    }

    // Retorna a questão anterior
    return questions[currentIndex - 1];
  }

  const currentIndex = allSubsections.indexOf(normalizedSection);

  // Se não encontrou ou é a primeira subseção, retorna null
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  // Retorna a subseção anterior
  return allSubsections[currentIndex - 1];
}

function getSectionTitle(activeSection) {
  // Sempre retornar o título da seção principal (antes do hífen)
  const baseSection = activeSection.split("-")[0];
  if (sectionTitles[baseSection]) {
    return sectionTitles[baseSection];
  }

  // Se não encontrar, tenta encontrar o título exato como fallback
  if (sectionTitles[activeSection]) {
    return sectionTitles[activeSection];
  }

  // Fallback
  return "Resultados da Pesquisa";
}

function getSectionIcon(activeSection) {
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

function getSubsectionTitle(sectionId, maxLength = 40) {
  // Se for uma subseção fixa, retorna do mapeamento
  if (sectionTitles[sectionId]) {
    return sectionTitles[sectionId];
  }

  // Se for uma subseção de atributos (attributes-{id})
  if (sectionId.startsWith("attributes-")) {
    const attributeId = sectionId.replace("attributes-", "");
    const attribute = attributeDeepDive.attributes.find(
      (attr) => attr.id === attributeId
    );
    if (attribute) {
      return attribute.name;
    }
  }

  // Se for uma subseção de perguntas (responses-{id})
  if (sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const displayNumber = getDisplayNumber(questionId);
    return `Questão ${displayNumber}`;
  }

  // Fallback: retorna o ID formatado
  return sectionId;
}

function getSectionAndSubsection(sectionId, maxLength = 40) {
  const baseSection = sectionId.split("-")[0];
  let sectionTitle = sectionTitles[baseSection] || baseSection;
  let subsectionTitle = getSubsectionTitle(sectionId, maxLength);

  // Ajuste especial: para "Aprofundamento por Atributos", mostrar apenas "Aprofundamento"
  if (sectionTitle === "Aprofundamento por Atributos") {
    sectionTitle = "Aprofundamento";
  }

  // Ajuste especial: para "Análise por Questão", mostrar o número da questão como subtítulo
  if (baseSection === "responses" && sectionId.startsWith("responses-")) {
    const questionId = parseInt(sectionId.replace("responses-", ""), 10);
    const displayNumber = getDisplayNumber(questionId);
    return {
      section: sectionTitle,
      subsection: `Questão ${displayNumber}`,
    };
  }

  // Se a subseção for igual à seção, não precisa mostrar duplicado
  if (subsectionTitle === sectionTitle) {
    return {
      section: sectionTitle,
      subsection: "",
    };
  }

  return {
    section: sectionTitle,
    subsection: subsectionTitle,
  };
}

export function SurveyHeader({ activeSection, onSectionChange, onMenuClick }) {
  const title = getSectionTitle(activeSection);
  const Icon = getSectionIcon(activeSection);
  const nextSection = getNextSection(activeSection);
  const previousSection = getPreviousSection(activeSection);

  // Mostrar botão "Avançar" sempre que houver próxima seção
  const shouldShowNextButton = !!nextSection;

  // Obter seção e subseção formatadas para os botões
  const previousSectionInfo = previousSection
    ? getSectionAndSubsection(previousSection)
    : null;
  const nextSectionInfo = nextSection
    ? getSectionAndSubsection(nextSection)
    : null;

  // Obter ícones das seções para os botões
  const PreviousIcon = previousSection ? getSectionIcon(previousSection) : null;
  const NextIcon = nextSection ? getSectionIcon(nextSection) : null;

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
    <header
      className="sticky top-0 z-10 bg-background"
      style={{
        boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_20}`,
      }}
    >
      <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 flex items-center gap-1 sm:gap-0">
        {/* Hamburger Menu - Visível apenas em telas menores */}
        <div className="lg:hidden mr-2 sm:mr-3">
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
          {previousSection && previousSectionInfo && (
            <button
              onClick={handlePrevious}
              className="relative overflow-hidden rounded-lg px-1.5 py-1 sm:px-4 sm:py-3 text-white flex items-center gap-1 sm:gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: getBlueGradient(),
                boxShadow: getBlueButtonShadow(),
              }}
            >
              <div
                className="w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: RGBA_WHITE_20,
                }}
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              {/* Mobile: ícone + subseção lado a lado */}
              <div className="sm:hidden flex items-center gap-1.5">
                {PreviousIcon && (
                  <PreviousIcon className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                {previousSectionInfo.subsection && (
                  <span className="text-[8px] sm:text-[9px] font-semibold leading-tight whitespace-nowrap max-w-[120px] truncate">
                    {previousSectionInfo.subsection}
                  </span>
                )}
              </div>
              {/* Desktop: seção + subseção em coluna */}
              <div className="hidden sm:flex flex-col items-start">
                <span className="font-semibold text-sm leading-tight">
                  {previousSectionInfo.section}
                </span>
                {previousSectionInfo.subsection && (
                  <span className="text-xs opacity-90 leading-tight">
                    {previousSectionInfo.subsection}
                  </span>
                )}
              </div>
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className="text-white px-1.5 py-1 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2"
            style={{
              backgroundColor: COLOR_ORANGE_PRIMARY,
              boxShadow: `0 4px 16px ${RGBA_ORANGE_SHADOW_40}`,
            }}
          >
            <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <h1 className="text-sm sm:text-2xl font-bold text-white whitespace-nowrap">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center gap-2">
          {shouldShowNextButton && nextSectionInfo && (
            <button
              onClick={handleNext}
              className="relative overflow-hidden rounded-lg px-1.5 py-1 sm:px-4 sm:py-3 text-white flex items-center gap-1 sm:gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: getBlueGradient(),
                boxShadow: getBlueButtonShadow(),
              }}
            >
              {/* Mobile: ícone + subseção lado a lado */}
              <div className="sm:hidden flex items-center gap-1.5">
                {NextIcon && <NextIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                {nextSectionInfo.subsection && (
                  <span className="text-[8px] sm:text-[9px] font-semibold leading-tight whitespace-nowrap max-w-[120px] truncate">
                    {nextSectionInfo.subsection}
                  </span>
                )}
              </div>
              {/* Desktop: seção + subseção em coluna */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="font-semibold text-sm leading-tight">
                  {nextSectionInfo.section}
                </span>
                {nextSectionInfo.subsection && (
                  <span className="text-xs opacity-90 leading-tight">
                    {nextSectionInfo.subsection}
                  </span>
                )}
              </div>
              <div
                className="w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: RGBA_WHITE_20,
                }}
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

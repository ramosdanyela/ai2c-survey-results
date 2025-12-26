import {
  FileText,
  BarChart3,
  MessageSquare,
  Layers,
  ChevronDown,
  ChevronRight,
  MapPin,
  GraduationCap,
  Building,
  Users,
  Percent,
  HelpCircle,
  Heart,
  Target,
  Users2,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  surveyInfo,
  responseDetails,
  attributeDeepDive,
} from "@/data/surveyData";
import { forwardRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  RGBA_BLACK_SHADOW_20,
  RGBA_ORANGE_SHADOW_20,
  COLOR_ORANGE_PRIMARY,
  COLOR_LIGHT_BACKGROUND,
  RGBA_ORANGE_SHADOW_15,
  COLOR_GRAY_DARK,
  RGBA_BLACK_SHADOW_08,
  RGBA_BLACK_SHADOW_10,
} from "@/lib/colors";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    id: "export",
    label: "Export",
    icon: Download,
    isRoute: true, // Indica que é uma rota, não uma seção
  },
];

// Ícones para os atributos
const attributeIcons = {
  state: MapPin,
  education: GraduationCap,
  customerType: Building,
};

// Componente interno para renderizar o conteúdo da sidebar
function SidebarContent({ activeSection, onSectionChange, onItemClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para controlar quais seções estão expandidas - todas começam abertas
  const [expandedSections, setExpandedSections] = useState({
    executive: true,
    support: true,
    attributes: true,
    responses: true,
  });

  // Obter todas as perguntas para a seção "responses"
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

  // Função simplificada: define o estado diretamente baseado no valor recebido do Collapsible
  const setSectionExpanded = (sectionId, isOpen) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: isOpen,
    }));
  };

  // Função para obter a primeira subseção de uma seção
  const getFirstSubsection = (sectionId) => {
    if (sectionId === "executive") return "executive-summary";
    if (sectionId === "support") return "support-sentiment";
    if (sectionId === "attributes") {
      const allAttributes = attributeDeepDive.attributes.filter(
        (attr) => attr.id in attributeIcons
      );
      return allAttributes.length > 0
        ? `attributes-${allAttributes[0].id}`
        : null;
    }
    if (sectionId === "responses") {
      return allQuestions.length > 0 ? `responses-${allQuestions[0].id}` : null;
    }
    return null;
  };

  // Handler para quando uma seção é expandida/colapsada
  const handleSectionToggle = (sectionId, isOpen) => {
    setSectionExpanded(sectionId, isOpen);
  };

  // Handler para quando clica no botão da seção principal
  // Sempre navega para a primeira subseção
  // Se estiver fechada, o Collapsible vai abrir automaticamente
  const handleSectionClick = (sectionId) => {
    const firstSubsection = getFirstSubsection(sectionId);

    // Sempre navega para a primeira subseção quando clicar na seção principal
    if (firstSubsection && onSectionChange) {
      onSectionChange(firstSubsection);
    }

    // Se houver callback de item click (mobile), chama também
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full px-2 sm:px-3 w-full overflow-x-hidden">
        {/* Botão de fechar no mobile */}
        <div className="lg:hidden flex justify-end pt-2 sm:pt-3 pb-1.5 sm:pb-2">
          <button
            onClick={onItemClick}
            className="rounded-lg p-1.5 sm:p-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40 transition-all duration-200"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="pt-2 sm:pt-3 mb-3 sm:mb-4 pb-3 sm:pb-4">
          <div className="flex items-start justify-end gap-2 mb-3">
            <ThemeToggle className="shrink-0 hidden" />
          </div>
          {/* Survey Info Card */}
          <div
            className="rounded-lg p-2 sm:p-3 border border-border/50"
            style={{
              backgroundColor: COLOR_LIGHT_BACKGROUND,
              boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_08}`,
            }}
          >
            <div className="space-y-1.5 sm:space-y-2">
              {/* Survey Title */}
              <div className="mb-0.5">
                <h2 className="text-sm sm:text-lg font-bold text-foreground leading-tight">
                  {surveyInfo.title}
                </h2>
              </div>

              {/* Company */}
              <div className="mb-0.5">
                <div className="text-[10px] sm:text-xs font-normal text-foreground">
                  {surveyInfo.company}
                </div>
              </div>

              {/* Period */}
              <div className="mb-2 sm:mb-3">
                <div className="text-[9px] sm:text-[10px] font-normal text-foreground">
                  {surveyInfo.period}
                </div>
              </div>

              {/* Metrics Cards - Horizontal Layout */}
              <div className="flex items-stretch gap-1.5 sm:gap-2">
                {/* Total Respondents */}
                <div
                  className="flex-1 rounded-lg p-1.5 sm:p-2 bg-white min-w-0"
                  style={{
                    boxShadow: `0 1px 3px ${RGBA_BLACK_SHADOW_10}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: RGBA_ORANGE_SHADOW_15,
                      }}
                    >
                      <Users
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        style={{ color: COLOR_ORANGE_PRIMARY }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm sm:text-lg font-bold mb-0.5 truncate"
                        style={{ color: COLOR_GRAY_DARK }}
                      >
                        {surveyInfo.totalRespondents.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        Respondentes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Response Rate */}
                <div
                  className="flex-1 rounded-lg p-1.5 sm:p-2 bg-white min-w-0"
                  style={{
                    boxShadow: `0 1px 3px ${RGBA_BLACK_SHADOW_10}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: RGBA_ORANGE_SHADOW_15,
                      }}
                    >
                      <TrendingUp
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        style={{ color: COLOR_ORANGE_PRIMARY }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm sm:text-lg font-bold mb-0.5 truncate"
                        style={{ color: COLOR_GRAY_DARK }}
                      >
                        {Math.round(surveyInfo.responseRate)}%
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        Taxa de Adesão
                      </div>
                    </div>
                  </div>
                </div>

                {/* Number of Questions */}
                <div
                  className="flex-1 rounded-lg p-1.5 sm:p-2 bg-white min-w-0"
                  style={{
                    boxShadow: `0 1px 3px ${RGBA_BLACK_SHADOW_10}`,
                  }}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: RGBA_ORANGE_SHADOW_15,
                      }}
                    >
                      <ClipboardList
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        style={{ color: COLOR_ORANGE_PRIMARY }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm sm:text-lg font-bold mb-0.5 truncate"
                        style={{ color: COLOR_GRAY_DARK }}
                      >
                        {(() => {
                          const allQuestions = [
                            ...responseDetails.closedQuestions,
                            ...responseDetails.openQuestions,
                          ].filter((q) => q.id !== 3); // Ocultar Q3
                          return allQuestions.length;
                        })()}
                      </div>
                      <div className="text-[9px] sm:text-[10px] font-normal text-foreground/70 truncate">
                        Perguntas
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1.5 sm:gap-2 items-start w-full flex-1 overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive =
              activeSection === item.id ||
              activeSection.startsWith(item.id + "-");

            // Verificar se a seção tem subseções
            const hasSubsections =
              item.id === "executive" ||
              item.id === "support" ||
              item.id === "attributes" ||
              item.id === "responses";

            // Se for a seção "attributes", mostrar subseções de atributos
            if (item.id === "attributes") {
              const isExpanded = expandedSections.attributes;
              // Obter todos os atributos disponíveis
              const allAttributes = attributeDeepDive.attributes.filter(
                (attr) => attr.id in attributeIcons
              );
              return (
                <Collapsible
                  key={item.id}
                  open={isExpanded}
                  onOpenChange={(open) =>
                    handleSectionToggle("attributes", open)
                  }
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <button
                      onClick={(e) => handleSectionClick("attributes", e)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                        isActive
                          ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                        {item.label}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full mt-1">
                    <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-[hsl(var(--custom-blue))]/30">
                      {allAttributes.map((attr) => {
                        const attributeSectionId = `attributes-${attr.id}`;
                        const isAttributeActive =
                          activeSection === attributeSectionId;
                        const Icon = attributeIcons[attr.id];
                        return (
                          <button
                            key={attr.id}
                            onClick={() => {
                              onSectionChange(attributeSectionId);
                              if (onItemClick) {
                                onItemClick();
                              }
                            }}
                            className={cn(
                              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full text-xs sm:text-sm",
                              isAttributeActive
                                ? "bg-[hsl(var(--custom-blue))]/30 text-sidebar-foreground border border-[hsl(var(--custom-blue))]/30"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30 border border-transparent hover:border-[hsl(var(--custom-blue))]/30"
                            )}
                          >
                            {Icon && <Icon className="w-4 h-4 shrink-0" />}
                            <span className="flex-1">{attr.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // Se for a seção "responses", mostrar subseções de perguntas
            if (item.id === "responses") {
              const isExpanded = expandedSections.responses;
              return (
                <Collapsible
                  key={item.id}
                  open={isExpanded}
                  onOpenChange={(open) =>
                    handleSectionToggle("responses", open)
                  }
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <button
                      onClick={(e) => handleSectionClick("responses", e)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                        isActive
                          ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                        {item.label}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full mt-1">
                    <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-[hsl(var(--custom-blue))]/30">
                      {allQuestions.map((question, index) => {
                        const questionSectionId = `responses-${question.id}`;
                        const isQuestionActive =
                          activeSection === questionSectionId;
                        // Renumerar questões: índice + 1 (excluindo Q3)
                        const displayNumber = index + 1;
                        return (
                          <button
                            key={question.id}
                            onClick={() => {
                              onSectionChange(questionSectionId);
                              if (onItemClick) {
                                onItemClick();
                              }
                            }}
                            className={cn(
                              "flex items-start gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left w-full text-sm",
                              isQuestionActive
                                ? "bg-[hsl(var(--custom-blue))]/30 text-sidebar-foreground border border-[hsl(var(--custom-blue))]/30"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30 border border-transparent hover:border-[hsl(var(--custom-blue))]/30"
                            )}
                          >
                            <span className="font-semibold shrink-0">
                              Q{displayNumber}
                            </span>
                            {question.question.length > 60 ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="flex-1 line-clamp-2">
                                    {question.question.substring(0, 60) + "..."}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="right"
                                  className="max-w-xs p-3 text-sm"
                                >
                                  <p className="whitespace-normal">
                                    {question.question}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="flex-1 line-clamp-2">
                                {question.question}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // Para outras seções com subseções (executive, support)
            if (hasSubsections) {
              const isExpanded = expandedSections[item.id];
              const subsections =
                item.id === "executive"
                  ? [
                      {
                        id: "executive-summary",
                        label: "Sumário Executivo",
                        icon: ClipboardList,
                      },
                      {
                        id: "executive-recommendations",
                        label: "Recomendações",
                        icon: AlertTriangle,
                      },
                    ]
                  : item.id === "support"
                  ? [
                      {
                        id: "support-sentiment",
                        label: "Análise de Sentimento",
                        icon: Heart,
                      },
                      {
                        id: "support-intent",
                        label: "Intenção de Respondentes",
                        icon: Target,
                      },
                      {
                        id: "support-segmentation",
                        label: "Segmentação",
                        icon: Users2,
                      },
                    ]
                  : [];

              return (
                <Collapsible
                  key={item.id}
                  open={isExpanded}
                  onOpenChange={(open) => handleSectionToggle(item.id, open)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <button
                      onClick={(e) => handleSectionClick(item.id, e)}
                      className={cn(
                        "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full",
                        isActive
                          ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm sm:text-lg font-bold whitespace-nowrap flex-1 truncate">
                        {item.label}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full mt-1">
                    <div className="flex flex-col gap-1 ml-4 pl-4 border-l-2 border-[hsl(var(--custom-blue))]/30">
                      {subsections.map((subsection) => {
                        const isSubsectionActive =
                          activeSection === subsection.id;
                        const SubsectionIcon = subsection.icon;
                        return (
                          <button
                            key={subsection.id}
                            onClick={() => {
                              onSectionChange(subsection.id);
                              if (onItemClick) {
                                onItemClick();
                              }
                            }}
                            className={cn(
                              "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-left w-full text-xs sm:text-sm",
                              isSubsectionActive
                                ? "bg-[hsl(var(--custom-blue))]/30 text-sidebar-foreground border border-[hsl(var(--custom-blue))]/30"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/30 border border-transparent hover:border-[hsl(var(--custom-blue))]/30"
                            )}
                          >
                            {SubsectionIcon && (
                              <SubsectionIcon className="w-4 h-4 shrink-0" />
                            )}
                            <span className="flex-1">{subsection.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // Se for o item Export, usar navegação por rota
            if (item.isRoute) {
              const isExportActive = location.pathname === "/export";
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate("/export");
                    if (onItemClick) {
                      onItemClick();
                    }
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-left w-full my-2",
                    isExportActive
                      ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                      : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-lg font-bold whitespace-nowrap flex-1">
                    {item.label}
                  </span>
                </button>
              );
            }

            // Para seções sem subseções (fallback - não deveria acontecer com as seções atuais)
            return (
              <button
                key={item.id}
                onClick={() => {
                  const firstSubsection = getFirstSubsection(item.id);
                  if (firstSubsection) {
                    onSectionChange(firstSubsection);
                  } else {
                    onSectionChange(item.id);
                  }
                  if (onItemClick) {
                    onItemClick();
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-left w-full",
                  isActive
                    ? "bg-[hsl(var(--custom-blue))] text-white shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]"
                    : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20 border border-transparent hover:border-[hsl(var(--custom-blue))]/40"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-lg font-bold whitespace-nowrap flex-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
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
    <div className="bg-sidebar h-screen overflow-y-auto w-full">
      <SidebarContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        onItemClick={onItemClick}
      />
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Menu,
  FileText,
  Presentation,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SurveySidebar,
  SurveySidebarMobile,
} from "@/components/survey/SurveySidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { COLOR_ORANGE_PRIMARY, RGBA_BLACK_SHADOW_20 } from "@/lib/colors";
import { responseDetails, attributeDeepDive } from "@/data/surveyData";
import { cn } from "@/lib/utils";

// Componente para checkbox com estado indeterminado
const SectionCheckbox = React.forwardRef(
  ({ checked, indeterminate, ...props }, ref) => {
    const internalRef = React.useRef(null);
    const checkboxRef = ref || internalRef;

    React.useEffect(() => {
      if (checkboxRef.current) {
        // Acessar o elemento input dentro do Checkbox
        const inputElement = checkboxRef.current.querySelector(
          'input[type="checkbox"]'
        );
        if (inputElement) {
          inputElement.indeterminate = indeterminate ?? false;
        }
      }
    }, [indeterminate, checkboxRef]);

    return <Checkbox ref={checkboxRef} checked={checked} {...props} />;
  }
);
SectionCheckbox.displayName = "SectionCheckbox";

export default function Export() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarRef = useRef(null);

  // Estado para controle de seleção
  const [exportFullReport, setExportFullReport] = useState(false);
  const [selectedSections, setSelectedSections] = useState(new Set());
  const [isSpecificSectionsExpanded, setIsSpecificSectionsExpanded] =
    useState(false);
  const [expandedSections, setExpandedSections] = useState({
    executive: true,
    support: true,
    attributes: true,
    responses: true,
  });

  // Verificar se alguma seção específica está selecionada
  // Só considerar como selecionado se não for relatório completo
  const hasSpecificSectionsSelected =
    !exportFullReport && selectedSections.size > 0;

  // Obter todas as perguntas
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
    .filter((q) => q.id !== 3)
    .sort((a, b) => a.id - b.id);

  // Obter atributos disponíveis
  const availableAttributes = attributeDeepDive.attributes.filter((attr) =>
    ["state", "education", "customerType"].includes(attr.id)
  );

  // Estrutura de seções
  const sections = [
    {
      id: "executive",
      label: "Relatório Executivo",
      subsections: [
        { id: "executive-summary", label: "Sumário Executivo" },
        { id: "executive-recommendations", label: "Recomendações" },
      ],
    },
    {
      id: "support",
      label: "Análises de Suporte",
      subsections: [
        { id: "support-sentiment", label: "Análise de Sentimento" },
        { id: "support-intent", label: "Intenção de Respondentes" },
        { id: "support-segmentation", label: "Segmentação" },
      ],
    },
    {
      id: "attributes",
      label: "Aprofundamento por Atributos",
      subsections: availableAttributes.map((attr) => ({
        id: `attributes-${attr.id}`,
        label: attr.name,
      })),
    },
    {
      id: "responses",
      label: "Análise por Questão",
      subsections: allQuestions.map((q) => ({
        id: `responses-${q.id}`,
        label: `Q${q.id}: ${
          q.question.length > 60
            ? q.question.substring(0, 60) + "..."
            : q.question
        }`,
      })),
    },
  ];

  // Handlers
  const handleFullReportChange = (checked) => {
    setExportFullReport(checked);
    if (checked) {
      // Quando marcar "Exportar Relatório Completo", limpar seleções específicas
      // Não selecionar todas as seções para não marcar o checkbox de "Selecione seções específicas"
      setSelectedSections(new Set());
      // Fechar o collapsible de seções específicas se estiver aberto
      setIsSpecificSectionsExpanded(false);
    }
  };

  const handleSectionToggle = (sectionId, checked) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newSelected = new Set(selectedSections);
    if (checked) {
      section.subsections.forEach((sub) => {
        newSelected.add(sub.id);
      });
    } else {
      section.subsections.forEach((sub) => {
        newSelected.delete(sub.id);
      });
    }
    setSelectedSections(newSelected);
    setExportFullReport(false);
  };

  const handleSubsectionToggle = (subsectionId, checked) => {
    const newSelected = new Set(selectedSections);
    if (checked) {
      newSelected.add(subsectionId);
    } else {
      newSelected.delete(subsectionId);
    }
    setSelectedSections(newSelected);
    setExportFullReport(false);
  };

  const isSectionFullySelected = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return false;
    return section.subsections.every((sub) => selectedSections.has(sub.id));
  };

  const isSectionPartiallySelected = (sectionId) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return false;
    const selectedCount = section.subsections.filter((sub) =>
      selectedSections.has(sub.id)
    ).length;
    return selectedCount > 0 && selectedCount < section.subsections.length;
  };

  const handleExport = (format) => {
    // Placeholder - função de exportação será implementada depois
    console.log(`Exportando em ${format}:`, {
      fullReport: exportFullReport,
      selectedSections: Array.from(selectedSections),
    });
  };

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => {
      window.removeEventListener("resize", checkIsDesktop);
    };
  }, []);

  useEffect(() => {
    const updateSidebarWidth = () => {
      if (sidebarRef.current && isDesktop) {
        setSidebarWidth(sidebarRef.current.offsetWidth);
      } else {
        setSidebarWidth(0);
      }
    };

    const timeoutId = setTimeout(updateSidebarWidth, 0);
    window.addEventListener("resize", updateSidebarWidth);

    const observer = new MutationObserver(updateSidebarWidth);
    if (sidebarRef.current) {
      observer.observe(sidebarRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updateSidebarWidth);
      observer.disconnect();
    };
  }, [isDesktop]);

  const handleSectionChange = (section) => {
    // Se não for uma rota, navegar de volta para a página principal
    if (section !== "export") {
      navigate("/");
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar Desktop - Sempre visível em telas grandes */}
      <SurveySidebar
        ref={sidebarRef}
        activeSection="export"
        onSectionChange={handleSectionChange}
      />

      {/* Sidebar Mobile - Menu hamburger */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side="left"
          className="p-0"
          style={{ width: "auto", minWidth: "fit-content" }}
        >
          <SurveySidebarMobile
            activeSection="export"
            onSectionChange={handleSectionChange}
            onItemClick={() => setIsMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div
        className="flex-1 flex flex-col transition-all duration-200"
        style={{
          marginLeft: isDesktop ? `${sidebarWidth}px` : "0",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-10 bg-background"
          style={{
            boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_20}`,
          }}
        >
          <div className="px-3 sm:px-4 lg:px-6 py-4 flex items-center">
            {/* Hamburger Menu - Visível apenas em telas menores */}
            <div className="lg:hidden mr-3">
              <Button
                onClick={() => setIsMobileMenuOpen(true)}
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-muted"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 flex justify-center">
              <div
                className="text-white px-4 py-2 rounded-lg flex items-center gap-2"
                style={{
                  backgroundColor: COLOR_ORANGE_PRIMARY,
                  boxShadow: `0 4px 16px ${COLOR_ORANGE_PRIMARY}40`,
                }}
              >
                <Download className="w-4 h-4 flex-shrink-0" />
                <h1 className="text-2xl font-bold text-white whitespace-nowrap">
                  Export de Dados
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-auto">
          <div className="flex-1 px-3 sm:px-4 lg:px-6 py-6 lg:py-8">
            <div className="max-w-full xl:max-w-[98%] 2xl:max-w-[96%] mx-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${COLOR_ORANGE_PRIMARY}20`,
                      }}
                    >
                      <Download
                        className="w-5 h-5"
                        style={{ color: COLOR_ORANGE_PRIMARY }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        Export de Dados
                      </CardTitle>
                      <CardDescription>
                        Exporte os dados da pesquisa em diferentes formatos
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Opção de Relatório Completo */}
                    <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                      <Checkbox
                        id="full-report"
                        checked={exportFullReport}
                        onCheckedChange={handleFullReportChange}
                        className="h-5 w-5"
                      />
                      <label
                        htmlFor="full-report"
                        className="text-lg font-semibold cursor-pointer flex-1"
                      >
                        Exportar Relatório Completo
                      </label>
                    </div>

                    <Separator />

                    {/* Seções */}
                    <Collapsible
                      open={isSpecificSectionsExpanded}
                      onOpenChange={setIsSpecificSectionsExpanded}
                    >
                      <div className="space-y-4">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                            <Checkbox
                              id="specific-sections"
                              checked={hasSpecificSectionsSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  // Quando marcar "Selecione seções específicas", desmarcar "Exportar Relatório Completo"
                                  setExportFullReport(false);
                                } else {
                                  // Quando desmarcar, limpar todas as seleções
                                  setSelectedSections(new Set());
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-5 w-5"
                            />
                            <label
                              htmlFor="specific-sections"
                              className="text-lg font-semibold cursor-pointer flex-1"
                            >
                              Selecione seções específicas
                            </label>
                            {isSpecificSectionsExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="space-y-4 pt-2">
                            {sections.map((section) => {
                              const isExpanded = expandedSections[section.id];
                              const isFullySelected = isSectionFullySelected(
                                section.id
                              );
                              const isPartiallySelected =
                                isSectionPartiallySelected(section.id);

                              return (
                                <Collapsible
                                  key={section.id}
                                  open={isExpanded}
                                  onOpenChange={(open) =>
                                    setExpandedSections((prev) => ({
                                      ...prev,
                                      [section.id]: open,
                                    }))
                                  }
                                >
                                  <div className="border rounded-lg">
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center space-x-3 p-4 hover:bg-muted/50 cursor-pointer">
                                        <SectionCheckbox
                                          checked={isFullySelected}
                                          indeterminate={isPartiallySelected}
                                          onCheckedChange={(checked) =>
                                            handleSectionToggle(
                                              section.id,
                                              checked
                                            )
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                          className="h-5 w-5"
                                        />
                                        <span className="flex-1 text-base font-semibold">
                                          {section.label}
                                        </span>
                                        {isExpanded ? (
                                          <ChevronDown className="w-4 h-4" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                      <div className="px-4 pb-4 space-y-2 border-t">
                                        {section.subsections.map(
                                          (subsection) => (
                                            <div
                                              key={subsection.id}
                                              className="flex items-center space-x-3 p-3 rounded hover:bg-muted/30"
                                            >
                                              <Checkbox
                                                id={subsection.id}
                                                checked={selectedSections.has(
                                                  subsection.id
                                                )}
                                                onCheckedChange={(checked) =>
                                                  handleSubsectionToggle(
                                                    subsection.id,
                                                    checked
                                                  )
                                                }
                                                className="h-4 w-4"
                                              />
                                              <label
                                                htmlFor={subsection.id}
                                                className="text-sm cursor-pointer flex-1"
                                              >
                                                {subsection.label}
                                              </label>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </div>
                                </Collapsible>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>

                    <Separator />

                    {/* Botões de Exportação */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        onClick={() => handleExport("PDF")}
                        disabled={
                          !exportFullReport && selectedSections.size === 0
                        }
                        className="flex-1 h-12 text-base font-semibold"
                        style={{
                          backgroundColor: COLOR_ORANGE_PRIMARY,
                          color: "white",
                        }}
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Exportar como PDF
                      </Button>
                      <Button
                        onClick={() => handleExport("PPT")}
                        disabled={
                          !exportFullReport && selectedSections.size === 0
                        }
                        className="flex-1 h-12 text-base font-semibold"
                        style={{
                          backgroundColor: COLOR_ORANGE_PRIMARY,
                          color: "white",
                        }}
                      >
                        <Presentation className="w-5 h-5 mr-2" />
                        Exportar como PPT
                      </Button>
                    </div>

                    {!exportFullReport && selectedSections.size === 0 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Selecione pelo menos uma seção ou o relatório completo
                        para exportar
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

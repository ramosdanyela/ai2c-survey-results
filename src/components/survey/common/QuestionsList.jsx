import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  CheckSquare,
  CircleDot,
  FileText,
  TrendingUp,
  Filter,
  X,
  Download,
  getIcon,
} from "@/lib/icons";
import { useSurveyData } from "@/hooks/useSurveyData";
import { useQuestionTypeFilter } from "@/hooks/useQuestionTypeFilter";
import { useQuestionFilters } from "@/hooks/useQuestionFilters";
import { getBadgeConfig } from "../widgets/badgeTypes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FilterPanel } from "../components/FilterPanel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getQuestionTemplate } from "@/config/questionTemplates";
import { renderComponent } from "./ComponentRegistry";
import { resolveDataPath, getQuestionsFromData } from "@/services/dataResolver";

/**
 * QuestionsList Component - Renders list of questions with filters, accordions, etc.
 * This component encapsulates all the complex logic from ResponseDetails
 */
export function QuestionsList({
  questionId: initialQuestionId,
  dataPath = "responseDetails",
  hideFilterPills = false,
  externalFilterState = null,
  data: externalData = null, // Allow external data to be passed (with sectionData injected)
}) {
  const { data: hookData, loading } = useSurveyData();
  // Use external data if provided (from schema context with sectionData), otherwise use hook data
  const data = externalData || hookData;
  
  // Use unified hook for dynamic question filters (replaces local state)
  const {
    questionFilters,
    setQuestionFilters,
    getQuestionFilters,
    updateQuestionFilter,
    removeFilterValue,
    clearQuestionFilters,
    hasActiveFilters,
  } = useQuestionFilters({
    data,
    apiMode: false, // TODO: Enable when API is ready
  });
  
  const [questionFilterOpen, setQuestionFilterOpen] = useState({});
  const [questionDownloadOpen, setQuestionDownloadOpen] = useState({});

  // Use unified hook for question type filter (replaces three redundant states)
  const {
    questionTypeFilter,
    setQuestionTypeFilter,
    showWordCloud,
    setShowWordCloud,
  } = useQuestionTypeFilter({
    data,
    externalFilterState,
    initialQuestionTypeFilter: "all",
    initialShowWordCloud: true,
  });

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [openAccordionValue, setOpenAccordionValue] = useState(undefined);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState(null);
  const questionRefs = useRef({});

  // Resolve data path
  const responseDetails = useMemo(() => {
    if (!data || !dataPath) {
      // Missing data is expected in some cases - silently return null
      return null;
    }
    const resolved = resolveDataPath(data, dataPath);
    if (!resolved) {
      // Could not resolve dataPath - expected in some cases - silently return null
      return null;
    }
    return resolved;
  }, [data, dataPath]);

  // Question templates are now in code (questionTemplates.js), not in JSON

  const surveyInfo = data?.surveyInfo;
  const rootUiTexts = data?.uiTexts || {};

  // Get section-specific uiTexts from sectionsConfig
  const sectionUiTexts = useMemo(() => {
    if (!data?.sections) return {};
    const responsesSection = data.sections.find(
      (s) => s.id === "responses"
    );
    return responsesSection?.data?.uiTexts || {};
  }, [data]);

  // Merge uiTexts from root and section (must be before renderQuestionComponents)
  const mergedUiTexts = useMemo(() => {
    return {
      responseDetails: {
        all: "Todas",
        nps: "NPS",
        "open-ended": "Campo Aberto",
        "multiple-choice": "Múltipla Escolha",
        "single-choice": "Escolha única",
        summary: "Sumário",
        responses: "Respostas",
        npsScore: "NPS Score",
        top3Categories: "Top 3 Categorias",
        top3CategoriesTopics: "Top 3 categorias e principais tópicos",
        wordCloud: "Nuvem de Palavras",
        mentions: "menções",
        positive: "Positivo",
        negative: "Negativo",
        noPositiveTopics: "Nenhum tópico positivo",
        noNegativeTopics: "Nenhum tópico negativo",
        filterQuestion: "Filtrar questão",
        downloadQuestion: "Baixar questão",
        png: "PNG",
        pdf: "PDF",
        removeFilter: "Remover filtro",
        responsesCount: "respostas",
        questionPrefix: "Q",
        ...(rootUiTexts?.responseDetails || {}),
        ...(sectionUiTexts?.responseDetails || {}),
      },
      filterPanel: {
        ...(rootUiTexts?.filterPanel || {}),
        ...(sectionUiTexts?.filterPanel || {}),
      },
    };
  }, [rootUiTexts, sectionUiTexts]);

  // Ensure uiTexts has required nested objects with safe defaults
  const safeUiTexts = useMemo(() => {
    return {
      responseDetails: mergedUiTexts.responseDetails,
      filterPanel: mergedUiTexts.filterPanel || rootUiTexts?.filterPanel || {},
    };
  }, [mergedUiTexts, rootUiTexts]);

  // Helper functions - MUST be defined before useMemo that uses them
  const isNPSQuestion = (question) => question?.questionType === "nps" || question?.type === "nps";

  // Helper to get questions - uses getQuestionsFromData which gets from sections[id="responses"].questions
  // MUST be defined before useMemo/useEffect that uses it
  const getQuestionsFromResponseDetails = useCallback(() => {
    // Use getQuestionsFromData which gets questions from the new structure
    return getQuestionsFromData(data);
  }, [data]);

  /**
   * Renderiza os componentes de uma questão baseado no template do tipo
   * @param {Object} question - Objeto da questão
   * @returns {React.ReactElement[]|null} Array de componentes renderizados ou null
   */
  const renderQuestionComponents = useCallback((question) => {
    if (!question || !question.questionType) return null;

    // Obtém o template para o tipo da questão
    const template = getQuestionTemplate(question.questionType);
    if (!template || !Array.isArray(template) || template.length === 0) {
      // No template found - expected for unsupported question types
      return null;
    }

    // Prepara o contexto de dados para os componentes
    // Os componentes esperam que o data tenha question, surveyInfo, etc. no contexto
    const componentData = {
      ...data,
      question, // Adiciona a questão no contexto
      surveyInfo, // Adiciona surveyInfo no contexto
      showWordCloud, // Adiciona showWordCloud no contexto
      uiTexts: safeUiTexts, // Adiciona uiTexts no contexto
    };

    // Renderiza cada componente do template
    return template.map((componentConfig, index) => {
      // Renderiza o componente usando o ComponentRegistry
      // O ComponentRegistry vai usar resolveDataPath para acessar os dados
      return (
        <div key={`question-${question.id}-component-${componentConfig.index !== undefined ? componentConfig.index : index}`}>
          {renderComponent(
            {
              ...componentConfig,
              // Garante que o index está definido
              index: componentConfig.index !== undefined ? componentConfig.index : index,
            },
            componentData,
            {
              subSection: `responses-${question.id}`,
              isExport: false,
              exportWordCloud: showWordCloud,
            }
          )}
        </div>
      );
    });
  }, [data, surveyInfo, showWordCloud, safeUiTexts]);

  // Get all available questions filtered by selected type - MUST be before early returns
  const allAvailableQuestions = useMemo(() => {
    // Use getQuestionsFromData which gets questions from sections[id="responses"].questions
    const questionsArray = getQuestionsFromData(data);
    
    if (!questionsArray || questionsArray.length === 0) {
      return [];
    }

    // Ordenar questões pelo index do JSON (sem gaps, sequencial)
    const allQuestions = questionsArray
      .sort((a, b) => (a.index || 0) - (b.index || 0));

    // If questionId is provided and we're in export mode, show only that question
    if (initialQuestionId && data?._exportMode) {
      const singleQuestion = allQuestions.find(
        (q) => q.id === initialQuestionId
      );
      const result = singleQuestion ? [singleQuestion] : [];
      return result;
    }

    // Apply filter based on questionTypeFilter
    let filtered;
    if (questionTypeFilter === "all") {
      filtered = allQuestions;
    } else if (questionTypeFilter === "open-ended") {
      filtered = allQuestions.filter((q) => q.questionType === "open-ended");
    } else if (questionTypeFilter === "multiple-choice") {
      filtered = allQuestions.filter(
        (q) => q.questionType === "multiple-choice" && !isNPSQuestion(q)
      );
    } else if (questionTypeFilter === "single-choice") {
      filtered = allQuestions.filter((q) => q.questionType === "single-choice");
    } else if (questionTypeFilter === "nps") {
      filtered = allQuestions.filter(
        (q) => isNPSQuestion(q) || q.questionType === "nps"
      );
    } else {
      filtered = allQuestions;
    }

    // CRITICAL: If initialQuestionId is provided (navigation from sidebar or buttons),
    // ensure the target question is always included, even if filtered out
    // This maintains dynamic accordion functionality
    if (initialQuestionId && !data?._exportMode) {
      const targetQuestion = allQuestions.find((q) => q.id === initialQuestionId);
      if (targetQuestion && !filtered.find((q) => q.id === initialQuestionId)) {
        // Add the target question to the filtered list
        filtered = [...filtered, targetQuestion];
        // Re-sort to maintain index order
        filtered.sort((a, b) => (a.index || 0) - (b.index || 0));
      }
    }

    return filtered;
  }, [questionTypeFilter, initialQuestionId, data]);

  // Effect to scroll to specific question when questionId is provided - MUST be before early returns
  // This handles navigation from sidebar clicks and navigation buttons
  useEffect(() => {
    const questionsFromDetails = getQuestionsFromResponseDetails();
    if (initialQuestionId && questionsFromDetails.length > 0) {
      // Reset selectedQuestionId to ensure we use initialQuestionId
      setSelectedQuestionId(null);

      const allQuestions = questionsFromDetails.sort((a, b) => (a.index || 0) - (b.index || 0));

      const question = allQuestions.find((q) => q.id === initialQuestionId);

      if (question) {
        const questionValue = `${question.questionType}-${question.id}`;
        // Immediately set the accordion to open (no delay for better UX)
        // This ensures the accordion opens as soon as the question is found
        setOpenAccordionValue(questionValue);

        // Use a small delay for scrolling to ensure DOM is updated
        // The accordion should already be open by this point
        setTimeout(() => {
          const element = questionRefs.current[initialQuestionId];
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            // Retry after a longer delay if element not found
            // This can happen if the question hasn't been rendered yet
            setTimeout(() => {
              const retryElement = questionRefs.current[initialQuestionId];
              if (retryElement) {
                retryElement.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }, 200);
          }
        }, 150);
      } else {
        // Question not found - this shouldn't happen, but log for debugging
        // Question not found - expected in some cases
      }
    } else if (!initialQuestionId) {
      // If no initialQuestionId, close all accordions
      setOpenAccordionValue(undefined);
    }
  }, [initialQuestionId, getQuestionsFromResponseDetails]);

  // Effect for when selectedQuestionId changes - MUST be before early returns
  // This handles internal question selection (e.g., from filters)
  useEffect(() => {
    if (selectedQuestionId !== null) {
      const question = allAvailableQuestions.find(
        (q) => q.id === selectedQuestionId
      );
      if (question) {
        const questionValue = `${question.questionType}-${question.id}`;
        // Immediately set the accordion to open
        setOpenAccordionValue(questionValue);

        setTimeout(() => {
          const element = questionRefs.current[selectedQuestionId];
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            // Retry after a longer delay if element not found
            setTimeout(() => {
              const retryElement = questionRefs.current[selectedQuestionId];
              if (retryElement) {
                retryElement.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }
            }, 200);
          }
        }, 150);
      }
    }
  }, [selectedQuestionId, allAvailableQuestions]);

  // Loading state - AFTER all hooks
  if (loading) {
    const loadingText =
      rootUiTexts?.common?.loading?.loadingQuestions || "Loading questions...";
    return <div>{loadingText}</div>;
  }

  // Get questions using getQuestionsFromData
  const questionsFromDetails = getQuestionsFromResponseDetails();
  
  if (questionsFromDetails.length === 0 && !surveyInfo) {
    // Missing required data - expected in some cases (e.g., loading state)
    return null;
  }

  // Verificar se temos questões
  if (questionsFromDetails.length === 0) {
    const commonTexts = rootUiTexts?.common?.errors || {};
    const questionsNotFound =
      commonTexts.questionsNotFound || "Questions not found.";
    const availableStructure =
      commonTexts.availableStructure || "Available structure:";
    const none = commonTexts.none || "none";

    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>{questionsNotFound}</p>
        <p className="text-sm mt-2">
          {availableStructure}{" "}
          {responseDetails 
            ? (Array.isArray(responseDetails) 
                ? `Array with ${responseDetails.length} items` 
                : Object.keys(responseDetails).join(", "))
            : none}
        </p>
      </div>
    );
  }

  const handleQuestionFiltersChange = (questionId, newFilters) => {
    // Directly set filters for the question (simpler approach)
    setQuestionFilters(questionId, newFilters);
  };

  const handleQuestionFilterOpenChange = (questionId, isOpen) => {
    setQuestionFilterOpen((prev) => ({
      ...prev,
      [questionId]: isOpen,
    }));
  };

  const handleQuestionDownloadOpenChange = (questionId, isOpen) => {
    setQuestionDownloadOpen((prev) => ({
      ...prev,
      [questionId]: isOpen,
    }));
  };

  // Filter options to get labels
  const filterOptions = [
    { value: "state", label: safeUiTexts.filterPanel.state || "Estado" },
    {
      value: "customerType",
      label: safeUiTexts.filterPanel.customerType || "Tipo de Cliente",
    },
    {
      value: "education",
      label: safeUiTexts.filterPanel.education || "Educação",
    },
  ];

  // Map question types to labels using type from JSON (types: nps, open-ended, multiple-choice, single-choice)
  const questionTypeMap = {
    nps: safeUiTexts.responseDetails.nps || "NPS",
    "open-ended": safeUiTexts.responseDetails["open-ended"] || "Campo Aberto",
    "multiple-choice": safeUiTexts.responseDetails["multiple-choice"] || "Múltipla Escolha",
    "single-choice": safeUiTexts.responseDetails["single-choice"] || "Escolha única",
  };

  const getQuestionType = (question) => {
    const questionType = question.questionType;
    // Use type directly from JSON
    return questionTypeMap[questionType] || questionTypeMap["multiple-choice"];
  };

  // Map question types to icons using type from JSON (types: nps, open-ended, multiple-choice, single-choice)
  const questionIconMap = {
    "nps": TrendingUp,
    "open-ended": FileText,
    "multiple-choice": CheckSquare,
    "single-choice": CircleDot,
  };

  const getQuestionIcon = (question) => {
    // Use type from JSON to get icon
    const questionType = question.questionType || "multiple-choice";
    return questionIconMap[questionType] || CheckSquare;
  };

  const getTotalResponses = (question) => {
    const questionType = question.questionType;
    // Use type from JSON to determine response calculation
    // For closed and NPS questions, sum all values
    if (
      (questionType === "multiple-choice" || questionType === "nps" || questionType === "single-choice") &&
      "data" in question &&
      question.data
    ) {
      // Access data based on component name: barChart for multiple-choice/single-choice, npsStackedChart for nps
      const dataArray = questionType === "nps" 
        ? question.data.npsStackedChart 
        : question.data.barChart;
      
      if (dataArray && Array.isArray(dataArray)) {
        return dataArray.reduce((sum, item) => sum + (item.value || 0), 0);
      }
    }
    // For open questions, use total survey respondents
    if (questionType === "open-ended") {
      return surveyInfo.totalRespondents;
    }
    return 0;
  };

  // hasActiveFilters and handleRemoveFilterValue are now provided by the hook

  const QuestionTypePill = ({ question }) => {
    const questionType = question.questionType || "multiple-choice";

    const badgeConfig = getBadgeConfig(questionType);
    const badgeVariant = badgeConfig?.variant || "outline";
    const badgeLabel = badgeConfig?.label || getQuestionType(question);
    const badgeIconName = badgeConfig?.icon;
    const BadgeIcon = badgeIconName
      ? getIcon(badgeIconName)
      : getQuestionIcon(question);

    const pillClassName =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground text-xs font-semibold";

    return (
      <Badge variant={badgeVariant} className={pillClassName}>
        {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
        <span>{badgeLabel}</span>
      </Badge>
    );
  };

  const ResponseCountPill = ({ question }) => {
    const totalResponses = getTotalResponses(question);
    return (
      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/80 text-muted-foreground text-xs font-semibold">
        <span>
          {totalResponses.toLocaleString()}{" "}
          {safeUiTexts.responseDetails.responsesCount}
        </span>
      </div>
    );
  };

  const ActiveFiltersPills = ({ questionId }) => {
    const filters = questionFilters[questionId] || [];

    if (!hasActiveFilters(questionId)) {
      return null;
    }

    return (
      <>
        {filters.map((filter) => {
          const filterLabel = filterOptions.find(
            (opt) => opt.value === filter.filterType
          )?.label;

          if (!filter.values || filter.values.length === 0) {
            return null;
          }

          return filter.values.map((value) => (
            <div
              key={`${filter.filterType}-${value}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--custom-blue))]/20 text-[hsl(var(--custom-blue))] border border-[hsl(var(--custom-blue))]/40 text-xs font-semibold"
            >
              <span className="text-[0.7rem] opacity-70">{filterLabel}:</span>
              <span>{value}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFilterValue(questionId, filter.filterType, value);
                }}
                className="ml-0.5 hover:bg-[hsl(var(--custom-blue))]/30 rounded-full p-0.5 transition-colors"
                aria-label={`${safeUiTexts.responseDetails.removeFilter} ${value}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ));
        })}
      </>
    );
  };


  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-6">
        {allAvailableQuestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {(() => {
              const commonTexts = rootUiTexts?.common || {};
              const emptyState = commonTexts.emptyState || {};
              const noQuestionsFound =
                emptyState.noQuestionsFound || "No questions found.";
              const totalAvailableQuestions =
                emptyState.totalAvailableQuestions ||
                "Total available questions:";
              const activeFilter = emptyState.activeFilter || "Active filter:";
              const questionsInResponseDetails =
                emptyState.questionsInResponseDetails ||
                "Questions in responseDetails:";
              const none = commonTexts.errors?.none || "none";

              return (
                <>
                  <p>{noQuestionsFound}</p>
                  <p className="text-sm mt-2">
                    {totalAvailableQuestions}{" "}
                    {responseDetails?.questions?.length || 0}
                  </p>
                  <p className="text-xs mt-1">
                    {activeFilter} {questionTypeFilter}
                  </p>
                  <p className="text-xs mt-1">
                    {questionsInResponseDetails}{" "}
                    {responseDetails?.questions
                      ?.map((q) => `ID:${q.id}(type:${q.questionType})`)
                      .join(", ") || none}
                  </p>
                </>
              );
            })()}
          </div>
        ) : (
          allAvailableQuestions.map((question, index) => {
            const questionValue = `${question.questionType}-${question.id}`;
            const isHighlighted = highlightedQuestionId === question.id;
            const isOpen = openAccordionValue === questionValue;
            const displayNumber = index + 1;

            return (
              <div
                key={question.id}
                ref={(el) => {
                  if (el) {
                    questionRefs.current[question.id] = el;
                  }
                }}
                className={`transition-all duration-500 ${
                  isHighlighted
                    ? "ring-4 ring-[hsl(var(--custom-blue))] ring-offset-4 rounded-lg shadow-[0_0_14px_hsl(var(--custom-blue),0.5)] animate-pulse"
                    : ""
                }`}
                style={{ scrollMarginTop: "120px" }}
              >
                <Accordion
                  type="single"
                  collapsible
                  value={isOpen ? questionValue : undefined}
                  onValueChange={(value) => setOpenAccordionValue(value)}
                  className="card-elevated px-0 overflow-hidden"
                >
                  <AccordionItem value={questionValue} className="border-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                      <div className="flex items-start gap-3 text-left w-full">
                        <Badge variant="outline" className="shrink-0">
                          {safeUiTexts.responseDetails.questionPrefix || "Q"}
                          {displayNumber}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="font-medium flex-1">
                              {question.question}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {/* Filter Icon */}
                              <Popover
                                open={questionFilterOpen[question.id] || false}
                                onOpenChange={(open) =>
                                  handleQuestionFilterOpenChange(
                                    question.id,
                                    open
                                  )
                                }
                              >
                                <PopoverTrigger asChild>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuestionFilterOpenChange(
                                        question.id,
                                        !questionFilterOpen[question.id]
                                      );
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleQuestionFilterOpenChange(
                                          question.id,
                                          !questionFilterOpen[question.id]
                                        );
                                      }
                                    }}
                                    className={`shrink-0 p-1.5 rounded-md transition-colors cursor-pointer ${
                                      hasActiveFilters(question.id)
                                        ? "bg-[hsl(var(--custom-blue))]/20 text-[hsl(var(--custom-blue))]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                    aria-label={
                                      safeUiTexts.responseDetails.filterQuestion
                                    }
                                  >
                                    <Filter className="w-4 h-4" />
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-80 p-0"
                                  align="end"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FilterPanel
                                    onFiltersChange={(newFilters) =>
                                      handleQuestionFiltersChange(
                                        question.id,
                                        newFilters
                                      )
                                    }
                                    questionFilter={undefined}
                                    onQuestionFilterChange={undefined}
                                    selectedQuestionId={undefined}
                                    onSelectedQuestionIdChange={undefined}
                                    questions={[]}
                                    hideQuestionFilters={true}
                                    initialFilters={
                                      getQuestionFilters(question.id)
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                              {/* Download PDF - Preparado para implementação futura */}
                              {/* <Popover
                                open={
                                  questionDownloadOpen[question.id] || false
                                }
                                onOpenChange={(open) =>
                                  handleQuestionDownloadOpenChange(
                                    question.id,
                                    open
                                  )
                                }
                              >
                                <PopoverTrigger asChild>
                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuestionDownloadOpenChange(
                                        question.id,
                                        !questionDownloadOpen[question.id]
                                      );
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleQuestionDownloadOpenChange(
                                          question.id,
                                          !questionDownloadOpen[question.id]
                                        );
                                      }
                                    }}
                                    className="shrink-0 p-1.5 rounded-md transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    aria-label={
                                      safeUiTexts.responseDetails
                                        .downloadQuestion
                                    }
                                  >
                                    <Download className="w-4 h-4" />
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-40 p-2"
                                  align="end"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuestionDownloadOpenChange(
                                        question.id,
                                        false
                                      );
                                      // TODO: Implementar download PDF
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                                  >
                                    {safeUiTexts.responseDetails.pdf}
                                  </button>
                                </PopoverContent>
                              </Popover> */}
                            </div>
                          </div>
                          {/* Question Type and Response Count Pills */}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <QuestionTypePill question={question} />
                            <ResponseCountPill question={question} />
                            <ActiveFiltersPills questionId={question.id} />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      {/* Show summary only if no filters are active */}
                      {!hasActiveFilters(question.id) && (
                        <>
                          <h3 className="text-lg font-bold text-foreground mb-3">
                            {safeUiTexts.responseDetails.summary}
                          </h3>
                          <div className="text-muted-foreground mb-6 space-y-3">
                            {question.summary.split("\n").map((line, index) => (
                              <p
                                key={index}
                                className={line.trim() ? "" : "h-3"}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Render question components based on template */}
                      {(() => {
                        const components = renderQuestionComponents(question);
                        if (components) {
                          return (
                            <div className="space-y-6">
                              {components}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

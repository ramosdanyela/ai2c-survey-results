import { useState, useMemo, useEffect, useRef } from "react";
import {
  Award,
  CheckSquare,
  Cloud,
  FileText,
  TrendingUp,
  Filter,
  X,
  Download,
  getIcon,
} from "@/lib/icons";
import { Progress } from "@/components/ui/progress";
import { useSurveyData } from "@/hooks/useSurveyData";
import { getBadgeConfig } from "../widgets/badgeTypes";
import {
  COLOR_ORANGE_PRIMARY,
  RGBA_ORANGE_SHADOW_15,
  RGBA_ORANGE_SHADOW_20,
  RGBA_BLACK_SHADOW_30,
} from "@/lib/colors";
import {
  SentimentStackedChart,
  SimpleBarChart,
  NPSStackedChart,
} from "../widgets/Charts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FilterPanel } from "../components/FilterPanel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const [questionFilters, setQuestionFilters] = useState({});
  const [questionFilterOpen, setQuestionFilterOpen] = useState({});
  const [questionDownloadOpen, setQuestionDownloadOpen] = useState({});

  // Use external state if provided, otherwise use internal state
  const [internalQuestionFilter, setInternalQuestionFilter] = useState("all");
  const [internalShowWordCloud, setInternalShowWordCloud] = useState(true);

  const questionFilter =
    externalFilterState?.questionFilter ?? internalQuestionFilter;
  const setQuestionFilter =
    externalFilterState?.setQuestionFilter ?? setInternalQuestionFilter;
  const showWordCloud =
    externalFilterState?.showWordCloud ?? internalShowWordCloud;
  const setShowWordCloud =
    externalFilterState?.setShowWordCloud ?? setInternalShowWordCloud;

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [openAccordionValue, setOpenAccordionValue] = useState(undefined);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState(null);
  const questionRefs = useRef({});

  // Resolve data path (supports sectionData.* and sectionData)
  const resolveDataPath = (data, path) => {
    if (!data || !path) return null;

    // Handle sectionData (exact match or prefix)
    if (path === "sectionData") {
      return data.sectionData || null;
    }

    // Handle sectionData.* prefix
    if (path.startsWith("sectionData.")) {
      const relativePath = path.replace("sectionData.", "");
      if (data.sectionData) {
        return resolveDataPath(data.sectionData, relativePath);
      }
      return null;
    }

    // Handle array indices in brackets: attributes[0] -> attributes.0
    const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
    const keys = normalizedPath.split(".").filter(Boolean);
    let current = data;

    for (const key of keys) {
      if (current && typeof current === "object") {
        if (Array.isArray(current) && /^\d+$/.test(key)) {
          const index = parseInt(key, 10);
          if (index >= 0 && index < current.length) {
            current = current[index];
          } else {
            return null;
          }
        } else if (key in current) {
          current = current[key];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    return current;
  };

  // Resolve data path
  const responseDetails = useMemo(() => {
    if (!data || !dataPath) {
      console.warn("QuestionsList: Missing data or dataPath", {
        data: !!data,
        dataPath,
      });
      return null;
    }
    const resolved = resolveDataPath(data, dataPath);
    if (!resolved) {
      console.warn("QuestionsList: Could not resolve dataPath", {
        dataPath,
        availableKeys: data ? Object.keys(data) : [],
        hasSectionData: !!(data && data.sectionData),
        sectionDataKeys: data?.sectionData ? Object.keys(data.sectionData) : [],
      });
    }
    return resolved;
  }, [data, dataPath]);

  // Get questionTypeSchemas from renderSchema
  const questionTypeSchemas = useMemo(() => {
    if (!data || !dataPath) return null;
    const sectionData = resolveDataPath(data, dataPath);
    return sectionData?.renderSchema?.questionTypeSchemas || null;
  }, [data, dataPath]);

  const surveyInfo = data?.surveyInfo;
  const rootUiTexts = data?.uiTexts || {};

  // Get section-specific uiTexts from sectionsConfig
  const sectionUiTexts = useMemo(() => {
    if (!data?.sectionsConfig?.sections) return {};
    const responsesSection = data.sectionsConfig.sections.find(
      (s) => s.id === "responses"
    );
    return responsesSection?.data?.uiTexts || {};
  }, [data]);

  // Helper functions - MUST be defined before useMemo that uses them
  const isNPSQuestion = (question) => question?.type === "nps";

  // Get all available questions filtered by selected type - MUST be before early returns
  const allAvailableQuestions = useMemo(() => {
    if (
      !responseDetails?.questions ||
      !Array.isArray(responseDetails.questions)
    ) {
      return [];
    }

    const allQuestions = responseDetails.questions
      .filter((q) => q.id !== 3) // Hide Q3
      .sort((a, b) => (a.index || 0) - (b.index || 0)); // Sort by index

    // Apply filter based on questionFilter
    let filtered;
    if (questionFilter === "all") {
      filtered = allQuestions;
    } else if (questionFilter === "open") {
      filtered = allQuestions.filter((q) => q.type === "open");
    } else if (questionFilter === "closed") {
      filtered = allQuestions.filter(
        (q) => q.type === "closed" && !isNPSQuestion(q)
      );
    } else if (questionFilter === "nps") {
      filtered = allQuestions.filter(
        (q) => isNPSQuestion(q) || q.type === "nps"
      );
    } else {
      filtered = allQuestions;
    }

    return filtered;
  }, [questionFilter, responseDetails]);

  // Effect to scroll to specific question when questionId is provided - MUST be before early returns
  useEffect(() => {
    if (initialQuestionId && responseDetails?.questions) {
      setSelectedQuestionId(null);

      const allQuestions = responseDetails.questions.filter((q) => q.id !== 3);

      const question = allQuestions.find((q) => q.id === initialQuestionId);

      if (question) {
        setTimeout(() => {
          const questionValue = `${question.type}-${question.id}`;
          setOpenAccordionValue(questionValue);

          setTimeout(() => {
            const element = questionRefs.current[initialQuestionId];
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 150);
        }, 100);
      }
    }
  }, [initialQuestionId, responseDetails]);

  // Effect for when selectedQuestionId changes - MUST be before early returns
  useEffect(() => {
    if (selectedQuestionId !== null) {
      const question = allAvailableQuestions.find(
        (q) => q.id === selectedQuestionId
      );
      if (question) {
        const questionValue = `${question.type}-${question.id}`;
        setOpenAccordionValue(questionValue);

        setTimeout(() => {
          const element = questionRefs.current[selectedQuestionId];
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 150);
      }
    }
  }, [selectedQuestionId, allAvailableQuestions]);

  // Loading state - AFTER all hooks
  if (loading) {
    return <div>Carregando questões...</div>;
  }

  if (!responseDetails || !surveyInfo) {
    console.warn("QuestionsList: Missing required data", {
      hasResponseDetails: !!responseDetails,
      hasSurveyInfo: !!surveyInfo,
      dataPath,
      responseDetailsKeys: responseDetails ? Object.keys(responseDetails) : [],
    });
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Dados não encontrados.</p>
        <p className="text-sm mt-2">
          dataPath: {dataPath || "não especificado"}
        </p>
        {responseDetails && (
          <p className="text-xs mt-1">
            Chaves disponíveis: {Object.keys(responseDetails).join(", ")}
          </p>
        )}
      </div>
    );
  }

  // Merge root uiTexts with section-specific uiTexts
  // Section uiTexts take precedence
  const mergedUiTexts = {
    ...rootUiTexts,
    ...sectionUiTexts,
    // Merge responseDetails specifically
    responseDetails: {
      all: "Todas",
      openField: "Campo Aberto",
      multipleChoice: "Múltipla Escolha",
      nps: "NPS",
      wordCloud: "Nuvem de Palavras",
      summary: "Sumário:",
      responses: "Respostas:",
      npsScore: "NPS Score",
      top3CategoriesTopics: "Top 3 categorias e principais tópicos",
      top3Categories: "Top 3 Categorias",
      mentions: "menções",
      positive: "Positivos",
      negative: "Negativos",
      noPositiveTopics: "Nenhum tópico positivo",
      noNegativeTopics: "Nenhum tópico negativo",
      filterQuestion: "Filtrar questão",
      downloadQuestion: "Download questão",
      png: "PNG",
      pdf: "PDF",
      removeFilter: "Remover filtro",
      responsesCount: "respostas",
      questionPrefix: "Q",
      ...(rootUiTexts?.responseDetails || {}),
      ...(sectionUiTexts?.responseDetails || {}),
    },
  };

  // Ensure uiTexts has required nested objects with safe defaults
  const safeUiTexts = {
    responseDetails: mergedUiTexts.responseDetails,
    filterPanel: mergedUiTexts.filterPanel || rootUiTexts?.filterPanel || {},
  };

  // Verificar se questions existe e é um array
  if (!responseDetails.questions || !Array.isArray(responseDetails.questions)) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Questões não encontradas.</p>
        <p className="text-sm mt-2">
          Estrutura disponível:{" "}
          {responseDetails
            ? Object.keys(responseDetails).join(", ")
            : "nenhuma"}
        </p>
        {responseDetails && (
          <p className="text-xs mt-1">
            responseDetails.questions existe?{" "}
            {responseDetails.questions ? "sim" : "não"} | É array?{" "}
            {Array.isArray(responseDetails.questions) ? "sim" : "não"}
          </p>
        )}
      </div>
    );
  }

  const handleQuestionFiltersChange = (questionId, newFilters) => {
    setQuestionFilters((prev) => ({
      ...prev,
      [questionId]: newFilters,
    }));
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

  // Map question types to labels using type from JSON
  const questionTypeMap = {
    nps: safeUiTexts.responseDetails.nps || "NPS",
    open: safeUiTexts.responseDetails.openField || "Campo Aberto",
    closed: safeUiTexts.responseDetails.multipleChoice || "Múltipla Escolha",
  };

  const getQuestionType = (question) => {
    const questionType = question.type;
    // Use type directly from JSON
    return questionTypeMap[questionType] || questionTypeMap.closed;
  };

  // Map question types to icons using type from JSON
  const questionIconMap = {
    nps: TrendingUp,
    open: FileText,
    closed: CheckSquare,
  };

  const getQuestionIcon = (question) => {
    // Use icon from question if specified, otherwise use type-based icon
    if (question.icon) {
      const IconComponent = getIcon(question.icon);
      if (IconComponent) return IconComponent;
    }
    // Use type from JSON to get icon
    const questionType = question.type || "closed";
    return questionIconMap[questionType] || CheckSquare;
  };

  const getTotalResponses = (question) => {
    const questionType = question.type;
    // Use type from JSON to determine response calculation
    // For closed and NPS questions, sum all values
    if (
      (questionType === "closed" || questionType === "nps") &&
      "data" in question &&
      question.data
    ) {
      return question.data.reduce((sum, item) => sum + (item.value || 0), 0);
    }
    // For open questions, use total survey respondents
    if (questionType === "open") {
      return surveyInfo.totalRespondents;
    }
    return 0;
  };

  const hasActiveFilters = (questionId) => {
    const filters = questionFilters[questionId] || [];
    return filters.some((f) => f.values && f.values.length > 0);
  };

  const handleRemoveFilterValue = (questionId, filterType, value) => {
    const currentFilters = questionFilters[questionId] || [];
    const updatedFilters = currentFilters
      .map((filter) => {
        if (filter.filterType === filterType && filter.values) {
          const updatedValues = filter.values.filter((v) => v !== value);
          if (updatedValues.length === 0) {
            return null;
          }
          return { ...filter, values: updatedValues };
        }
        return filter;
      })
      .filter(Boolean);

    handleQuestionFiltersChange(questionId, updatedFilters);
  };

  const QuestionTypePill = ({ question }) => {
    const questionType =
      question.type ||
      (isNPSQuestion(question)
        ? "nps"
        : question.type === "open"
        ? "open"
        : "closed");

    const badgeConfig = getBadgeConfig(questionType);
    const badgeVariant = badgeConfig?.variant || "outline";
    const badgeLabel = badgeConfig?.label || getQuestionType(question);
    const badgeIconName = badgeConfig?.icon || question.icon;
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

  // Effect to scroll to specific question when questionId is provided
  useEffect(() => {
    if (initialQuestionId && responseDetails?.questions) {
      setSelectedQuestionId(null);

      const allQuestions = responseDetails.questions.filter((q) => q.id !== 3);

      const question = allQuestions.find((q) => q.id === initialQuestionId);

      if (question) {
        setTimeout(() => {
          const questionValue = `${question.type}-${question.id}`;
          setOpenAccordionValue(questionValue);

          setTimeout(() => {
            const element = questionRefs.current[initialQuestionId];
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            } else {
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
        }, 50);
      }
    }
  }, [initialQuestionId, responseDetails]);

  // Effect for when selectedQuestionId changes
  useEffect(() => {
    if (selectedQuestionId !== null) {
      const question = allAvailableQuestions.find(
        (q) => q.id === selectedQuestionId
      );
      if (question) {
        const questionValue = `${question.type}-${question.id}`;
        setOpenAccordionValue(questionValue);

        setTimeout(() => {
          const element = questionRefs.current[selectedQuestionId];
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 150);
      }
    }
  }, [selectedQuestionId, allAvailableQuestions]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Question Type Filter Pills - Only render if not hidden */}
      {!hideFilterPills && (
        <div className="flex flex-wrap gap-2 items-center mb-6">
          <Badge
            variant={questionFilter === "all" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full ${
              questionFilter === "all"
                ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                : ""
            }`}
            onClick={() => setQuestionFilter("all")}
          >
            {safeUiTexts.responseDetails.all || "Todas"}
          </Badge>
          <Badge
            variant={questionFilter === "open" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
              questionFilter === "open"
                ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                : ""
            }`}
            onClick={() => setQuestionFilter("open")}
          >
            <FileText className="w-3 h-3" />
            {safeUiTexts.responseDetails.openField || "Campo Aberto"}
          </Badge>
          <Badge
            variant={questionFilter === "closed" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
              questionFilter === "closed"
                ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                : ""
            }`}
            onClick={() => setQuestionFilter("closed")}
          >
            <CheckSquare className="w-3 h-3" />
            {safeUiTexts.responseDetails.multipleChoice || "Múltipla Escolha"}
          </Badge>
          <Badge
            variant={questionFilter === "nps" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-xs font-normal rounded-full inline-flex items-center gap-1.5 ${
              questionFilter === "nps"
                ? "bg-[hsl(var(--custom-blue))]/70 hover:bg-[hsl(var(--custom-blue))]/80"
                : ""
            }`}
            onClick={() => setQuestionFilter("nps")}
          >
            <TrendingUp className="w-3 h-3" />
            {safeUiTexts.responseDetails.nps || "NPS"}
          </Badge>
          {/* Word Cloud Toggle */}
          <div className="flex items-center gap-2 ml-auto">
            <Label
              htmlFor="word-cloud-toggle"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              {safeUiTexts.responseDetails.wordCloud}
            </Label>
            <Switch
              id="word-cloud-toggle"
              checked={showWordCloud}
              onCheckedChange={setShowWordCloud}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {allAvailableQuestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma questão encontrada.</p>
            <p className="text-sm mt-2">
              Total de questões disponíveis:{" "}
              {responseDetails?.questions?.length || 0}
            </p>
            <p className="text-xs mt-1">Filtro ativo: {questionFilter}</p>
            <p className="text-xs mt-1">
              Questões no responseDetails:{" "}
              {responseDetails?.questions
                ?.map((q) => `ID:${q.id}(type:${q.type})`)
                .join(", ") || "nenhuma"}
            </p>
          </div>
        ) : (
          allAvailableQuestions.map((question, index) => {
            const questionValue = `${question.type}-${question.id}`;
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
                                      questionFilters[question.id] || []
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                              {/* Download Icon - Oculto */}
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
                                  <div className="space-y-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuestionDownloadOpenChange(
                                          question.id,
                                          false
                                        );
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                                    >
                                      {safeUiTexts.responseDetails.png}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleQuestionDownloadOpenChange(
                                          question.id,
                                          false
                                        );
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors cursor-pointer"
                                    >
                                      {safeUiTexts.responseDetails.pdf}
                                    </button>
                                  </div>
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

                      {/* Show NPS score when it's an NPS question */}
                      {question.type === "nps" && (
                        <div className="mb-6 flex justify-center">
                          <div
                            className="p-4 rounded-2xl highlight-container-light border-0 w-full max-w-md"
                            style={{
                              boxShadow: `0 4px 16px ${RGBA_ORANGE_SHADOW_15}`,
                            }}
                          >
                            <div className="text-center mb-4">
                              <div className="text-5xl font-bold text-foreground mb-2">
                                {surveyInfo.nps}
                              </div>
                              <div className="text-base font-semibold text-foreground mb-3">
                                {safeUiTexts.responseDetails.npsScore}
                              </div>
                              <Progress
                                value={(surveyInfo.nps + 100) / 2}
                                className="h-3 mb-2"
                              />
                              <div className="inline-block px-3 py-1 rounded-full highlight-container text-base font-semibold">
                                {surveyInfo.npsCategory}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Render NPS chart for NPS questions */}
                      {question.type === "nps" &&
                        "data" in question &&
                        question.data &&
                        (() => {
                          const detrator = question.data.find(
                            (d) => d.option === "Detrator"
                          );
                          const promotor = question.data.find(
                            (d) => d.option === "Promotor"
                          );
                          const neutro = question.data.find(
                            (d) => d.option === "Neutro"
                          );

                          return (
                            <>
                              <h3 className="text-lg font-bold text-foreground mb-3">
                                {safeUiTexts.responseDetails.responses}
                              </h3>
                              <NPSStackedChart
                                data={{
                                  Detratores: detrator?.percentage || 0,
                                  Neutros: neutro?.percentage || 0,
                                  Promotores: promotor?.percentage || 0,
                                }}
                                height={256}
                                hideXAxis={true}
                                showPercentagesInLegend={true}
                              />
                            </>
                          );
                        })()}

                      {/* Render closed question chart for other questions */}
                      {question.id !== 1 &&
                        question.type === "closed" &&
                        "data" in question &&
                        question.data &&
                        (() => {
                          const maxTextLength = Math.max(
                            ...question.data.map((item) => item.option.length)
                          );
                          const calculatedWidth = Math.min(
                            Math.max(maxTextLength * 8, 120),
                            400
                          );
                          const calculatedMargin = Math.max(
                            calculatedWidth + 20,
                            140
                          );
                          const rightMargin = question.id === 3 ? 50 : 80;

                          return (
                            <>
                              <h3 className="text-lg font-bold text-foreground mb-3">
                                {safeUiTexts.responseDetails.responses}
                              </h3>
                              <SimpleBarChart
                                data={question.data}
                                dataKey="percentage"
                                yAxisDataKey="option"
                                height={256}
                                margin={{
                                  top: 10,
                                  right: rightMargin,
                                  left: calculatedMargin,
                                  bottom: 10,
                                }}
                                yAxisWidth={calculatedWidth}
                                hideXAxis={true}
                                tooltipFormatter={(value, name, props) => [
                                  `${props.payload.value} (${value}%)`,
                                  safeUiTexts.responseDetails.responses,
                                ]}
                              />
                            </>
                          );
                        })()}

                      {/* Render open question content */}
                      {question.type === "open" &&
                        "sentimentData" in question &&
                        question.sentimentData && (
                          <>
                            {/* Sentiment Chart */}
                            <div className="mb-6">
                              <h4 className="text-base font-bold text-foreground mb-3">
                                {safeUiTexts.responseDetails
                                  .top3CategoriesTopics ||
                                  "Top 3 categorias e principais tópicos"}
                              </h4>
                              <SentimentStackedChart
                                data={question.sentimentData}
                                height={192}
                                showGrid={false}
                                axisLine={false}
                                tickLine={false}
                              />
                            </div>

                            {/* Top Categories */}
                            {question.topCategories && (
                              <div className="mb-6">
                                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                  <Award
                                    className="w-4 h-4"
                                    style={{ color: COLOR_ORANGE_PRIMARY }}
                                  />
                                  {safeUiTexts.responseDetails.top3Categories ||
                                    "Top 3 Categorias"}
                                </h4>
                                <div className="grid md:grid-cols-3 gap-4">
                                  {question.topCategories.map((cat) => (
                                    <div
                                      key={cat.rank}
                                      className="p-4 rounded-lg bg-muted/10 border-0 transition-all duration-300"
                                      style={{
                                        boxShadow: `0 4px 16px ${RGBA_BLACK_SHADOW_30}`,
                                      }}
                                      onMouseEnter={(e) =>
                                        (e.currentTarget.style.boxShadow = `0 8px 32px ${RGBA_ORANGE_SHADOW_20}`)
                                      }
                                      onMouseLeave={(e) =>
                                        (e.currentTarget.style.boxShadow = `0 4px 16px ${RGBA_BLACK_SHADOW_30}`)
                                      }
                                    >
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground">
                                          {cat.rank}
                                        </span>
                                        <span className="font-bold text-sm">
                                          {cat.category}
                                        </span>
                                      </div>
                                      <div className="text-sm text-muted-foreground mb-3">
                                        {cat.mentions}{" "}
                                        {safeUiTexts.responseDetails.mentions} (
                                        {cat.percentage}%)
                                      </div>
                                      {cat.topics &&
                                        (() => {
                                          const positiveTopics = cat.topics
                                            .map((topicItem) => {
                                              const topic =
                                                typeof topicItem === "string"
                                                  ? topicItem
                                                  : topicItem.topic;
                                              const sentiment =
                                                typeof topicItem === "string"
                                                  ? null
                                                  : topicItem.sentiment;
                                              return { topic, sentiment };
                                            })
                                            .filter(
                                              (item) =>
                                                item.sentiment === "positive"
                                            );

                                          const negativeTopics = cat.topics
                                            .map((topicItem) => {
                                              const topic =
                                                typeof topicItem === "string"
                                                  ? topicItem
                                                  : topicItem.topic;
                                              const sentiment =
                                                typeof topicItem === "string"
                                                  ? null
                                                  : topicItem.sentiment;
                                              return { topic, sentiment };
                                            })
                                            .filter(
                                              (item) =>
                                                item.sentiment === "negative"
                                            );

                                          return (
                                            <div className="grid grid-cols-2 gap-4">
                                              {/* Positive Column */}
                                              <div className="space-y-1.5">
                                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                                  {
                                                    safeUiTexts.responseDetails
                                                      .positive
                                                  }
                                                </div>
                                                {positiveTopics.length > 0 ? (
                                                  positiveTopics.map(
                                                    (item, index) => (
                                                      <div
                                                        key={index}
                                                        className="text-sm flex items-start gap-1.5"
                                                      >
                                                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">
                                                          •
                                                        </span>
                                                        <span className="text-foreground">
                                                          {item.topic}
                                                        </span>
                                                      </div>
                                                    )
                                                  )
                                                ) : (
                                                  <div className="text-xs text-muted-foreground italic">
                                                    {
                                                      safeUiTexts
                                                        .responseDetails
                                                        .noPositiveTopics
                                                    }
                                                  </div>
                                                )}
                                              </div>

                                              {/* Negative Column */}
                                              <div className="space-y-1.5">
                                                <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                                                  {
                                                    safeUiTexts.responseDetails
                                                      .negative
                                                  }
                                                </div>
                                                {negativeTopics.length > 0 ? (
                                                  negativeTopics.map(
                                                    (item, index) => (
                                                      <div
                                                        key={index}
                                                        className="text-sm flex items-start gap-1.5"
                                                      >
                                                        <span className="text-red-600 dark:text-red-400 mt-0.5">
                                                          •
                                                        </span>
                                                        <span className="text-foreground">
                                                          {item.topic}
                                                        </span>
                                                      </div>
                                                    )
                                                  )
                                                ) : (
                                                  <div className="text-xs text-muted-foreground italic">
                                                    {
                                                      safeUiTexts
                                                        .responseDetails
                                                        .noNegativeTopics
                                                    }
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })()}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Word Cloud */}
                            {question.wordCloud && showWordCloud && (
                              <div>
                                <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                                  <Cloud
                                    className="w-4 h-4"
                                    style={{ color: COLOR_ORANGE_PRIMARY }}
                                  />
                                  {safeUiTexts.responseDetails.wordCloud ||
                                    "Nuvem de Palavras"}
                                </h4>
                                <div className="flex justify-center items-center p-6 bg-muted/30 rounded-lg min-h-[200px]">
                                  <img
                                    src="/nuvem.png"
                                    alt="Word Cloud"
                                    className="max-w-full h-auto"
                                    style={{ maxHeight: "500px" }}
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )}
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

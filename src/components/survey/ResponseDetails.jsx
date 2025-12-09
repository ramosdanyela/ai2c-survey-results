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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { responseDetails, surveyInfo } from "@/data/surveyData";
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
} from "./charts/Charts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FilterPanel } from "./FilterPanel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * @typedef {("all" | "open" | "closed" | "nps")} QuestionFilter
 */

/**
 * @typedef {Object} FilterValue
 * @property {("state" | "customerType" | "education" | null)} filterType
 * @property {string[]} values
 */

/**
 * @param {Object} props
 * @param {number} [props.questionId] - ID da pergunta específica para rolar até ela
 */
export function ResponseDetails({ questionId }) {
  /**
   * @type {[Object<number, FilterValue[]>, Function]}
   */
  const [questionFilters, setQuestionFilters] = useState({});
  /**
   * @type {[Object<number, boolean>, Function]}
   */
  const [questionFilterOpen, setQuestionFilterOpen] = useState({});
  /**
   * @type {[Object<number, boolean>, Function]}
   */
  const [questionDownloadOpen, setQuestionDownloadOpen] = useState({});
  /**
   * @type {[QuestionFilter, Function]}
   */
  const [questionFilter, setQuestionFilter] = useState("all");
  /**
   * @type {[number | null, Function]}
   */
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  /**
   * @type {[string | undefined, Function]}
   */
  const [openAccordionValue, setOpenAccordionValue] = useState(undefined);
  /**
   * @type {[number | null, Function]}
   */
  const [highlightedQuestionId, setHighlightedQuestionId] = useState(null);
  /**
   * @type {[boolean, Function]}
   */
  const [showWordCloud, setShowWordCloud] = useState(true);

  /**
   * @param {number} questionId
   * @param {FilterValue[]} newFilters
   */
  const handleQuestionFiltersChange = (questionId, newFilters) => {
    setQuestionFilters((prev) => ({
      ...prev,
      [questionId]: newFilters,
    }));
  };

  /**
   * @param {number} questionId
   * @param {boolean} isOpen
   */
  const handleQuestionFilterOpenChange = (questionId, isOpen) => {
    setQuestionFilterOpen((prev) => ({
      ...prev,
      [questionId]: isOpen,
    }));
  };

  /**
   * @param {number} questionId
   * @param {boolean} isOpen
   */
  const handleQuestionDownloadOpenChange = (questionId, isOpen) => {
    setQuestionDownloadOpen((prev) => ({
      ...prev,
      [questionId]: isOpen,
    }));
  };

  // Opções de filtro para obter labels
  const filterOptions = [
    { value: "state", label: "Estado" },
    { value: "customerType", label: "Tipo de Cliente" },
    { value: "education", label: "Escolaridade" },
  ];

  // ============================================================
  // Helper Functions - Question Type & Response Count
  // ============================================================

  /**
   * Verifica se uma questão é do tipo NPS
   * @param {number} questionId
   * @returns {boolean}
   */
  const isNPSQuestion = (questionId) => questionId === 1;

  /**
   * Obtém o tipo de questão como string
   * @param {Object} question
   * @returns {string}
   */
  const getQuestionType = (question) => {
    if (isNPSQuestion(question.id)) return "NPS";
    if (question.type === "open") return "Campo Aberto";
    return "Múltipla Escolha";
  };

  /**
   * Obtém o ícone apropriado para o tipo de questão
   * @param {Object} question
   * @returns {React.ComponentType}
   */
  const getQuestionIcon = (question) => {
    if (isNPSQuestion(question.id)) return TrendingUp;
    if (question.type === "open") return FileText;
    return CheckSquare;
  };

  /**
   * Calcula o total de respostas para uma questão
   * @param {Object} question
   * @returns {number}
   */
  const getTotalResponses = (question) => {
    // Para questões fechadas (incluindo NPS), somar todos os valores
    if (question.type === "closed" && "data" in question && question.data) {
      return question.data.reduce((sum, item) => sum + (item.value || 0), 0);
    }
    // Para questões abertas, usar o total de respondentes do survey
    if (question.type === "open") {
      return surveyInfo.totalRespondents;
    }
    // Fallback: retornar 0 se não conseguir determinar
    return 0;
  };

  /**
   * Verifica se uma questão tem filtros ativos
   * @param {number} questionId
   * @returns {boolean}
   */
  const hasActiveFilters = (questionId) => {
    const filters = questionFilters[questionId] || [];
    return filters.some((f) => f.values && f.values.length > 0);
  };

  /**
   * Remove um valor específico de um filtro de uma questão
   * @param {number} questionId
   * @param {string} filterType
   * @param {string} value
   */
  const handleRemoveFilterValue = (questionId, filterType, value) => {
    const currentFilters = questionFilters[questionId] || [];
    const updatedFilters = currentFilters
      .map((filter) => {
        if (filter.filterType === filterType && filter.values) {
          const updatedValues = filter.values.filter((v) => v !== value);
          if (updatedValues.length === 0) {
            return null; // Remove o filtro se não houver mais valores
          }
          return { ...filter, values: updatedValues };
        }
        return filter;
      })
      .filter(Boolean); // Remove nulls

    handleQuestionFiltersChange(questionId, updatedFilters);
  };

  // ============================================================
  // Component Components - Pills
  // ============================================================

  /**
   * Componente para exibir o tipo de questão como pill
   * @param {Object} question
   */
  const QuestionTypePill = ({ question }) => {
    const questionType = getQuestionType(question);
    const QuestionIcon = getQuestionIcon(question);
    const pillClassName =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground text-xs font-semibold";

    return (
      <div className={pillClassName}>
        <QuestionIcon className="w-3 h-3" />
        <span>{questionType}</span>
      </div>
    );
  };

  /**
   * Componente para exibir o total de respostas como pill
   * @param {Object} question
   */
  const ResponseCountPill = ({ question }) => {
    const totalResponses = getTotalResponses(question);

    return (
      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/80 text-muted-foreground text-xs font-semibold">
        <span>{totalResponses.toLocaleString()} respostas</span>
      </div>
    );
  };

  /**
   * Componente para exibir os filtros ativos como pills
   * @param {number} questionId
   */
  const ActiveFiltersPills = ({ questionId }) => {
    // Mostrar filtros de pills apenas na Questão 1
    if (questionId !== 1) {
      return null;
    }

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
                aria-label={`Remover filtro ${value}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ));
        })}
      </>
    );
  };

  // Obter todas as questões disponíveis filtradas pelo tipo selecionado
  const allAvailableQuestions = useMemo(() => {
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
      .sort((a, b) => a.id - b.id); // Ordenar por ID

    // Aplicar filtro baseado no questionFilter
    if (questionFilter === "all") {
      return allQuestions;
    }

    if (questionFilter === "open") {
      return allQuestions.filter((q) => q.type === "open");
    }

    if (questionFilter === "closed") {
      // Fechadas mas não NPS
      return allQuestions.filter(
        (q) => q.type === "closed" && !isNPSQuestion(q.id)
      );
    }

    if (questionFilter === "nps") {
      // Apenas questão NPS (id === 1)
      return allQuestions.filter((q) => isNPSQuestion(q.id));
    }

    return allQuestions;
  }, [questionFilter]);

  // Refs para cada pergunta para permitir scroll
  const questionRefs = useRef({});

  // Efeito para rolar até a pergunta específica quando questionId é fornecido (vindo da navbar ou botões de navegação)
  useEffect(() => {
    if (questionId) {
      // Resetar filtro de questão específica quando vem da navbar ou navegação
      setSelectedQuestionId(null);

      // Buscar a questão em todas as questões (não apenas nas filtradas)
      const allQuestions = [
        ...responseDetails.closedQuestions.map((q) => ({
          ...q,
          type: "closed",
        })),
        ...responseDetails.openQuestions.map((q) => ({
          ...q,
          type: "open",
        })),
      ].filter((q) => q.id !== 3);

      const question = allQuestions.find((q) => q.id === questionId);

      if (question) {
        // Não ajustar filtros automaticamente - manter como "all" para mostrar todas as questões
        // Os filtros só devem ser aplicados quando o usuário clicar

        // Lógica combinada: primeiro abrir o accordion, depois fazer scroll
        // Aguardar um frame para garantir que o DOM está atualizado
        setTimeout(() => {
          const questionValue = `${question.type}-${question.id}`;
          setOpenAccordionValue(questionValue);

          // Aguardar um pouco mais para o accordion abrir antes de fazer scroll
          setTimeout(() => {
            const element = questionRefs.current[questionId];
            if (element) {
              // Usar scrollIntoView nativo com block: "start" para alinhar ao topo
              // O scroll-margin-top no CSS compensa o header sticky automaticamente
              element.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            } else {
              // Se o elemento ainda não estiver disponível, tentar novamente após um delay
              setTimeout(() => {
                const retryElement = questionRefs.current[questionId];
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
  }, [questionId]);

  // Efeito para quando selectedQuestionId muda (vindo do filtro)
  useEffect(() => {
    if (selectedQuestionId !== null) {
      const question = allAvailableQuestions.find(
        (q) => q.id === selectedQuestionId
      );
      if (question) {
        const questionValue = `${question.type}-${question.id}`;
        setOpenAccordionValue(questionValue);

        // Scroll com delay
        setTimeout(() => {
          const element = questionRefs.current[selectedQuestionId];
          if (element) {
            // Usar scrollIntoView nativo com block: "start" para alinhar ao topo
            // O scroll-margin-top no CSS compensa o header sticky automaticamente
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
      {/* Question Type Filter Pills - Without container */}
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
          Todas
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
          Campo Aberto
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
          Múltipla Escolha
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
          NPS
        </Badge>
        {/* Word Cloud Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <Label
            htmlFor="word-cloud-toggle"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            Nuvem de Palavras
          </Label>
          <Switch
            id="word-cloud-toggle"
            checked={showWordCloud}
            onCheckedChange={setShowWordCloud}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {allAvailableQuestions.map((question, index) => {
          const questionValue = `${question.type}-${question.id}`;
          const isHighlighted = highlightedQuestionId === question.id;
          const isOpen = openAccordionValue === questionValue;
          // Renumerar questões: índice + 1 (excluindo Q3)
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
                  ? "ring-4 ring-[hsl(var(--custom-blue))] ring-offset-4 rounded-lg shadow-[0_0_20px_hsl(var(--custom-blue),0.5)] animate-pulse"
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
                        Q{displayNumber}
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
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuestionFilterOpenChange(
                                      question.id,
                                      !questionFilterOpen[question.id]
                                    );
                                  }}
                                  className={`shrink-0 p-1.5 rounded-md transition-colors ${
                                    hasActiveFilters(question.id)
                                      ? "bg-[hsl(var(--custom-blue))]/20 text-[hsl(var(--custom-blue))]"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  }`}
                                  aria-label="Filtrar questão"
                                >
                                  <Filter className="w-4 h-4" />
                                </button>
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
                            {/* Download Icon */}
                            <Popover
                              open={questionDownloadOpen[question.id] || false}
                              onOpenChange={(open) =>
                                handleQuestionDownloadOpenChange(
                                  question.id,
                                  open
                                )
                              }
                            >
                              <PopoverTrigger asChild>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuestionDownloadOpenChange(
                                      question.id,
                                      !questionDownloadOpen[question.id]
                                    );
                                  }}
                                  className="shrink-0 p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  aria-label="Download questão"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
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
                                    PNG
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
                                    PDF
                                  </button>
                                </div>
                              </PopoverContent>
                            </Popover>
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
                          Sumário:
                        </h3>
                        <div className="text-muted-foreground mb-6 space-y-3">
                          {question.summary.split("\n").map((line, index) => (
                            <p key={index} className={line.trim() ? "" : "h-3"}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Mostrar score NPS quando for questão de NPS */}
                    {question.id === 1 && (
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
                              NPS Score
                            </div>
                            {/* Barra simples com o score para visualização rápida */}
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

                    {/* Render NPS chart para questão 1 */}
                    {question.id === 1 &&
                      question.type === "closed" &&
                      "data" in question &&
                      question.data &&
                      (() => {
                        // Converter dados da pergunta para formato NPS
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
                              Respostas:
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

                    {/* Render closed question chart para outras questões */}
                    {question.id !== 1 &&
                      question.type === "closed" &&
                      "data" in question &&
                      question.data &&
                      (() => {
                        // Calcular largura necessária baseada no texto mais longo
                        const maxTextLength = Math.max(
                          ...question.data.map((item) => item.option.length)
                        );
                        // Aproximadamente 8px por caractere, mínimo 120px, máximo 400px
                        const calculatedWidth = Math.min(
                          Math.max(maxTextLength * 8, 120),
                          400
                        );
                        const calculatedMargin = Math.max(
                          calculatedWidth + 20,
                          140
                        );
                        // Reduzir margem direita para Q3 para centralizar o gráfico
                        const rightMargin = question.id === 3 ? 50 : 80;

                        return (
                          <>
                            <h3 className="text-lg font-bold text-foreground mb-3">
                              Respostas:
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
                                "Respostas",
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
                              Top 3 categorias e principais tópicos
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
                                Top 3 Categorias
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
                                      {cat.mentions} menções ({cat.percentage}%)
                                    </div>
                                    {cat.topics &&
                                      (() => {
                                        // Separar tópicos por sentimento
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
                                            {/* Coluna Positivos */}
                                            <div className="space-y-1.5">
                                              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                                Positivos
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
                                                  Nenhum tópico positivo
                                                </div>
                                              )}
                                            </div>

                                            {/* Coluna Negativos */}
                                            <div className="space-y-1.5">
                                              <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                                                Negativos
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
                                                  Nenhum tópico negativo
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
                                Nuvem de Palavras
                              </h4>
                              <div className="flex justify-center items-center p-6 bg-muted/30 rounded-lg min-h-[200px]">
                                <img
                                  src="/nuvem.png"
                                  alt="Nuvem de Palavras"
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
        })}
      </div>
    </div>
  );
}

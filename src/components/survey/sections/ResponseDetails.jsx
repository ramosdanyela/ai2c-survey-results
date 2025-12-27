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
import { responseDetails, surveyInfo, uiTexts } from "@/data/surveyData";
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
import { FilterPanel } from "../FilterPanel";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ResponseDetails({ questionId }) {
  const [questionFilters, setQuestionFilters] = useState({});
  const [questionFilterOpen, setQuestionFilterOpen] = useState({});
  const [questionDownloadOpen, setQuestionDownloadOpen] = useState({});
  const [questionFilter, setQuestionFilter] = useState("all");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [openAccordionValue, setOpenAccordionValue] = useState(undefined);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState(null);
  const [showWordCloud, setShowWordCloud] = useState(true);

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
    { value: "state", label: uiTexts.filterPanel.state },
    { value: "customerType", label: uiTexts.filterPanel.customerType },
    { value: "education", label: uiTexts.filterPanel.education },
  ];

  // ============================================================
  // Helper Functions - Question Type & Response Count
  // ============================================================

  const isNPSQuestion = (questionId) => questionId === 1;

  const getQuestionType = (question) => {
    // Usa o tipo definido na questão, com fallback para detecção automática
    const questionType = question.type;

    if (questionType === "nps") return uiTexts.responseDetails.nps;
    if (questionType === "open") return uiTexts.responseDetails.openField;
    if (questionType === "closed")
      return uiTexts.responseDetails.multipleChoice;

    // Fallback para compatibilidade (detecção automática)
    if (isNPSQuestion(question.id)) return uiTexts.responseDetails.nps;
    if (question.type === "open") return uiTexts.responseDetails.openField;
    return uiTexts.responseDetails.multipleChoice;
  };

  const getQuestionIcon = (question) => {
    // Use the icon defined in the question data if available
    if (question.icon) {
      const IconComponent = getIcon(question.icon);
      if (IconComponent) return IconComponent;
    }
    // Fallback to default icons based on question type
    if (isNPSQuestion(question.id)) return TrendingUp;
    if (question.type === "open") return FileText;
    return CheckSquare;
  };

  const getTotalResponses = (question) => {
    // For closed questions (including NPS), sum all values
    if (question.type === "closed" && "data" in question && question.data) {
      return question.data.reduce((sum, item) => sum + (item.value || 0), 0);
    }
    // For open questions, use total survey respondents
    if (question.type === "open") {
      return surveyInfo.totalRespondents;
    }
    // Fallback: return 0 if unable to determine
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
            return null; // Remove filter if no values left
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

  const QuestionTypePill = ({ question }) => {
    // Obtém o tipo da questão (nps, open, closed)
    const questionType =
      question.type ||
      (isNPSQuestion(question.id)
        ? "nps"
        : question.type === "open"
        ? "open"
        : "closed");

    // Obtém configuração do badge baseado no tipo
    const badgeConfig = getBadgeConfig(questionType);

    // Usa configuração do badge ou fallback
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
          {uiTexts.responseDetails.responsesCount}
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
                aria-label={`${uiTexts.responseDetails.removeFilter} ${value}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ));
        })}
      </>
    );
  };

  // Get all available questions filtered by selected type
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
      .filter((q) => q.id !== 3) // Hide Q3
      .sort((a, b) => a.id - b.id); // Sort by ID

    // Apply filter based on questionFilter
    if (questionFilter === "all") {
      return allQuestions;
    }

    if (questionFilter === "open") {
      return allQuestions.filter((q) => q.type === "open");
    }

    if (questionFilter === "closed") {
      // Closed but not NPS
      return allQuestions.filter(
        (q) => q.type === "closed" && !isNPSQuestion(q.id)
      );
    }

    if (questionFilter === "nps") {
      // Only NPS question (id === 1)
      return allQuestions.filter((q) => isNPSQuestion(q.id));
    }

    return allQuestions;
  }, [questionFilter]);

  // Refs for each question to enable scrolling
  const questionRefs = useRef({});

  // Effect to scroll to specific question when questionId is provided (from navbar or navigation buttons)
  useEffect(() => {
    if (questionId) {
      // Reset specific question filter when coming from navbar or navigation
      setSelectedQuestionId(null);

      // Find question in all questions (not just filtered ones)
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
        // Don't adjust filters automatically - keep as "all" to show all questions
        // Filters should only be applied when user clicks

        // Combined logic: first open accordion, then scroll
        // Wait one frame to ensure DOM is updated
        setTimeout(() => {
          const questionValue = `${question.type}-${question.id}`;
          setOpenAccordionValue(questionValue);

          // Wait a bit more for accordion to open before scrolling
          setTimeout(() => {
            const element = questionRefs.current[questionId];
            if (element) {
              // Use native scrollIntoView with block: "start" to align to top
              // CSS scroll-margin-top automatically compensates for sticky header
              element.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            } else {
              // If element is not yet available, try again after a delay
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

  // Effect for when selectedQuestionId changes (from filter)
  useEffect(() => {
    if (selectedQuestionId !== null) {
      const question = allAvailableQuestions.find(
        (q) => q.id === selectedQuestionId
      );
      if (question) {
        const questionValue = `${question.type}-${question.id}`;
        setOpenAccordionValue(questionValue);

        // Scroll with delay
        setTimeout(() => {
          const element = questionRefs.current[selectedQuestionId];
          if (element) {
            // Use native scrollIntoView with block: "start" to align to top
            // CSS scroll-margin-top automatically compensates for sticky header
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
          {uiTexts.responseDetails.all}
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
          {uiTexts.responseDetails.openField}
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
          {uiTexts.responseDetails.multipleChoice}
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
          {uiTexts.responseDetails.nps}
        </Badge>
        {/* Word Cloud Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <Label
            htmlFor="word-cloud-toggle"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            {uiTexts.responseDetails.wordCloud}
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
          // Renumber questions: index + 1 (excluding Q3)
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
                        {uiTexts.responseDetails.questionPrefix}
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
                                  aria-label={
                                    uiTexts.responseDetails.filterQuestion
                                  }
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
                                  aria-label={
                                    uiTexts.responseDetails.downloadQuestion
                                  }
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
                                    {uiTexts.responseDetails.png}
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
                                    {uiTexts.responseDetails.pdf}
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
                          {uiTexts.responseDetails.summary}
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

                    {/* Show NPS score when it's an NPS question */}
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
                              {uiTexts.responseDetails.npsScore}
                            </div>
                            {/* Simple bar with score for quick visualization */}
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

                    {/* Render NPS chart for question 1 */}
                    {question.id === 1 &&
                      question.type === "closed" &&
                      "data" in question &&
                      question.data &&
                      (() => {
                        // Convert question data to NPS format
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
                              {uiTexts.responseDetails.responses}
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
                        // Calculate required width based on longest text
                        const maxTextLength = Math.max(
                          ...question.data.map((item) => item.option.length)
                        );
                        // Approximately 8px per character, minimum 120px, maximum 400px
                        const calculatedWidth = Math.min(
                          Math.max(maxTextLength * 8, 120),
                          400
                        );
                        const calculatedMargin = Math.max(
                          calculatedWidth + 20,
                          140
                        );
                        // Reduce right margin for Q3 to center the chart
                        const rightMargin = question.id === 3 ? 50 : 80;

                        return (
                          <>
                            <h3 className="text-lg font-bold text-foreground mb-3">
                              {uiTexts.responseDetails.responses}
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
                                uiTexts.responseDetails.responses,
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
                              {uiTexts.responseDetails.top3CategoriesTopics}
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
                                {uiTexts.responseDetails.top3Categories}
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
                                      {uiTexts.responseDetails.mentions} (
                                      {cat.percentage}%)
                                    </div>
                                    {cat.topics &&
                                      (() => {
                                        // Separate topics by sentiment
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
                                                  uiTexts.responseDetails
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
                                                    uiTexts.responseDetails
                                                      .noPositiveTopics
                                                  }
                                                </div>
                                              )}
                                            </div>

                                            {/* Negative Column */}
                                            <div className="space-y-1.5">
                                              <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
                                                {
                                                  uiTexts.responseDetails
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
                                                    uiTexts.responseDetails
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
                                {uiTexts.responseDetails.wordCloud}
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
        })}
      </div>
    </div>
  );
}

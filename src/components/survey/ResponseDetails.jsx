import { useState, useMemo } from "react";
import { Award, CheckSquare, Cloud, FileText, TrendingUp } from "lucide-react";
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
import { FilterPanel } from "./FilterPanel";

/**
 * @typedef {("all" | "open" | "closed" | "nps")} QuestionFilter
 */

/**
 * @typedef {Object} FilterValue
 * @property {("state" | "customerType" | "education" | null)} filterType
 * @property {string[]} values
 */

export function ResponseDetails() {
  /**
   * @type {[FilterValue[], Function]}
   */
  const [filters, setFilters] = useState([]);
  /**
   * @type {[QuestionFilter, Function]}
   */
  const [questionFilter, setQuestionFilter] = useState("all");

  /**
   * @param {FilterValue[]} newFilters
   */
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // Aqui você pode implementar a lógica de filtragem dos dados
    // Por enquanto, apenas armazenamos os filtros
  };

  // Identificar questão de NPS (questão 1 sobre recomendação)
  const npsQuestion = responseDetails.closedQuestions.find((q) => q.id === 1);

  // Filtrar questões baseado no filtro selecionado
  const filteredQuestions = useMemo(() => {
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

    switch (questionFilter) {
      case "all":
        return allQuestions;
      case "open":
        return allQuestions.filter((q) => q.type === "open");
      case "closed":
        return allQuestions.filter((q) => q.type === "closed");
      case "nps":
        return npsQuestion ? [{ ...npsQuestion, type: "closed" }] : [];
      default:
        return allQuestions;
    }
  }, [questionFilter, npsQuestion]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Filter Panel with Question Type Filter Pills */}
      <div className="mb-6">
        <FilterPanel
          onFiltersChange={handleFiltersChange}
          questionFilter={questionFilter}
          onQuestionFilterChange={setQuestionFilter}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuestions.map((question) => {
          const questionValue = `${question.type}-${question.id}`;
          return (
            <Accordion
              key={question.id}
              type="single"
              collapsible
              defaultValue={questionValue}
              className="card-elevated px-0 overflow-hidden lg:col-span-2"
            >
              <AccordionItem value={questionValue} className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-start gap-3 text-left w-full">
                    <Badge variant="outline" className="shrink-0">
                      Q{question.id}
                    </Badge>
                    <div className="flex-1">
                      <span className="font-medium block mb-2">
                        {question.question}
                      </span>
                      {/* Question Type and Response Count Pills */}
                      <div className="flex items-center gap-2 mt-2">
                        {/* Question Type Pill */}
                        {(() => {
                          const isNPS = question.id === 1;
                          const questionType = isNPS
                            ? "NPS"
                            : question.type === "open"
                            ? "Campo Aberto"
                            : "Múltipla Escolha";
                          const QuestionIcon = isNPS
                            ? TrendingUp
                            : question.type === "open"
                            ? FileText
                            : CheckSquare;

                          // Aplicar cor especial para campo aberto
                          const pillClassName =
                            question.type === "open"
                              ? "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/30 text-xs font-semibold"
                              : "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-foreground text-xs font-semibold";

                          return (
                            <div className={pillClassName}>
                              <QuestionIcon className="w-3 h-3" />
                              <span>{questionType}</span>
                            </div>
                          );
                        })()}

                        {/* Response Count Pill */}
                        {(() => {
                          let totalResponses = 0;
                          if (
                            question.type === "closed" &&
                            "data" in question
                          ) {
                            // Para questões fechadas, somar todos os valores
                            totalResponses = question.data.reduce(
                              (sum, item) => sum + item.value,
                              0
                            );
                          } else if (question.type === "open") {
                            // Para questões abertas, usar o total de respondentes do survey
                            totalResponses = surveyInfo.totalRespondents;
                          }

                          return (
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted/80 text-muted-foreground text-xs font-semibold">
                              <span>
                                {totalResponses.toLocaleString()} respostas
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
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
                                            <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">
                                              Positivos
                                            </div>
                                            {positiveTopics.length > 0 ? (
                                              positiveTopics.map(
                                                (item, index) => (
                                                  <div
                                                    key={index}
                                                    className="text-sm flex items-start gap-1.5"
                                                  >
                                                    <span className="text-green-600 dark:text-green-400 mt-0.5">
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
                        {question.wordCloud && (
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
          );
        })}
      </div>
    </div>
  );
}

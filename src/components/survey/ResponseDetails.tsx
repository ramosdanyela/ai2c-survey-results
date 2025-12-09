import { useState, useMemo } from "react";
import { Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { responseDetails, surveyInfo } from "@/data/surveyData";
import { WordCloud } from "./WordCloud";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { FilterPanel, type FilterValue } from "./FilterPanel";

type QuestionFilter = "all" | "open" | "closed" | "nps";

export function ResponseDetails() {
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [questionFilter, setQuestionFilter] = useState<QuestionFilter>("all");

  const handleFiltersChange = (newFilters: FilterValue[]) => {
    setFilters(newFilters);
    // Aqui você pode implementar a lógica de filtragem dos dados
    // Por enquanto, apenas armazenamos os filtros
  };

  // Identificar questão de NPS (questão 4 sobre recomendação)
  const npsQuestion = responseDetails.closedQuestions.find((q) => q.id === 4);

  // Filtrar questões baseado no filtro selecionado
  const filteredQuestions = useMemo(() => {
    const allQuestions = [
      ...responseDetails.closedQuestions.map((q) => ({
        ...q,
        type: "closed" as const,
      })),
      ...responseDetails.openQuestions.map((q) => ({
        ...q,
        type: "open" as const,
      })),
    ];

    switch (questionFilter) {
      case "all":
        return allQuestions;
      case "open":
        return allQuestions.filter((q) => q.type === "open");
      case "closed":
        return allQuestions.filter((q) => q.type === "closed");
      case "nps":
        return npsQuestion ? [{ ...npsQuestion, type: "closed" as const }] : [];
      default:
        return allQuestions;
    }
  }, [questionFilter, npsQuestion]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Filter Panel and Question Type Filter Pills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-6">
        {/* Filter Panel - Ocupa metade da tela */}
        <div className="lg:col-span-1">
          <FilterPanel onFiltersChange={handleFiltersChange} />
        </div>

        {/* Question Type Filter Pills - Ocupa a outra metade */}
        <div className="flex flex-wrap gap-2 items-center justify-center lg:justify-start lg:col-span-1 h-full">
          <Badge
            variant={questionFilter === "all" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-base font-normal ${
              questionFilter === "all"
                ? "bg-primary/70 hover:bg-primary/80"
                : ""
            }`}
            onClick={() => setQuestionFilter("all")}
          >
            Todas
          </Badge>
          <Badge
            variant={questionFilter === "open" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-base font-normal ${
              questionFilter === "open"
                ? "bg-primary/70 hover:bg-primary/80"
                : ""
            }`}
            onClick={() => setQuestionFilter("open")}
          >
            Questões de Campo Aberto
          </Badge>
          <Badge
            variant={questionFilter === "closed" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-base font-normal ${
              questionFilter === "closed"
                ? "bg-primary/70 hover:bg-primary/80"
                : ""
            }`}
            onClick={() => setQuestionFilter("closed")}
          >
            Questões Fechadas
          </Badge>
          <Badge
            variant={questionFilter === "nps" ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-base font-normal ${
              questionFilter === "nps"
                ? "bg-primary/70 hover:bg-primary/80"
                : ""
            }`}
            onClick={() => setQuestionFilter("nps")}
          >
            NPS
          </Badge>
        </div>
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
              className={`card-elevated px-0 overflow-hidden ${
                question.type === "open" ? "lg:col-span-2" : ""
              }`}
            >
              <AccordionItem value={questionValue} className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                  <div className="flex items-start gap-3 text-left">
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${
                        question.type === "open"
                          ? "bg-accent/10 text-accent border-accent"
                          : ""
                      }`}
                    >
                      Q{question.id}
                    </Badge>
                    <span className="font-medium">{question.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground mb-6">
                    {question.summary.split("\n").map((line, index, array) => (
                      <span key={index}>
                        {line}
                        {index < array.length - 1 && <br />}
                      </span>
                    ))}
                  </p>

                  {/* Mostrar score NPS com barra simples quando for questão de NPS */}
                  {questionFilter === "nps" && question.id === 4 && (
                    <div className="mb-6 p-4 rounded-lg highlight-container-light border border-[hsl(var(--highlight-orange))]/30">
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
                  )}

                  {/* Render closed question chart */}
                  {question.type === "closed" &&
                    "data" in question &&
                    question.data && (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[...question.data].sort(
                              (a, b) => b.percentage - a.percentage
                            )}
                            layout="vertical"
                            margin={{
                              top: 10,
                              right: 80,
                              left: 120,
                              bottom: 10,
                            }}
                          >
                            {/* Removido CartesianGrid - estilo Nussbaumer */}
                            <XAxis
                              type="number"
                              tickFormatter={(v) => `${v}%`}
                              axisLine={false}
                              tickLine={false}
                              hide={true}
                            />
                            <YAxis
                              type="category"
                              dataKey="option"
                              width={110}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              formatter={(
                                value: number,
                                name: string,
                                props: any
                              ) => [
                                `${props.payload.value} (${value}%)`,
                                "Respostas",
                              ]}
                            />
                            <Bar
                              dataKey="percentage"
                              fill="hsl(var(--primary))"
                              radius={[0, 4, 4, 0]}
                            >
                              <LabelList
                                dataKey="percentage"
                                position="right"
                                formatter={(value: number) => `${value}%`}
                                style={{
                                  fill: "hsl(var(--foreground))",
                                  fontSize: "12px",
                                }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                  {/* Render open question content */}
                  {question.type === "open" &&
                    "sentimentData" in question &&
                    question.sentimentData && (
                      <>
                        {/* Sentiment Chart */}
                        <div className="mb-6">
                          <h4 className="text-base font-bold text-foreground mb-3">
                            Análise de Sentimento
                          </h4>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={question.sentimentData}
                                layout="vertical"
                                margin={{
                                  top: 10,
                                  right: 30,
                                  left: 100,
                                  bottom: 10,
                                }}
                              >
                                {/* Removido CartesianGrid - estilo Nussbaumer */}
                                <XAxis
                                  type="number"
                                  tickFormatter={(v) => `${v}%`}
                                  domain={[0, 100]}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis
                                  type="category"
                                  dataKey="category"
                                  width={90}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip
                                  formatter={(v: number) => [`${v}%`, ""]}
                                />
                                <Legend />
                                <Bar
                                  dataKey="positive"
                                  name="Positivo"
                                  fill="hsl(var(--chart-positive))"
                                  stackId="a"
                                />
                                <Bar
                                  dataKey="neutral"
                                  name="Neutro"
                                  fill="hsl(var(--chart-neutral))"
                                  stackId="a"
                                />
                                <Bar
                                  dataKey="negative"
                                  name="Negativo"
                                  fill="hsl(var(--chart-negative))"
                                  stackId="a"
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Top Categories */}
                        {question.topCategories && (
                          <div className="mb-6">
                            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                              <Award className="w-4 h-4 text-[hsl(var(--highlight-orange))]" />
                              Top 3 Categorias
                            </h4>
                            <div className="grid md:grid-cols-3 gap-4">
                              {question.topCategories.map((cat) => (
                                <div
                                  key={cat.rank}
                                  className="p-4 rounded-lg bg-muted/50 border border-border"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <span
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        cat.rank === 1
                                          ? "bg-primary text-primary-foreground"
                                          : cat.rank === 2
                                          ? "bg-accent text-accent-foreground"
                                          : "bg-muted-foreground text-background"
                                      }`}
                                    >
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
                            <h4 className="text-base font-bold text-foreground mb-3">
                              Nuvem de Palavras
                            </h4>
                            <WordCloud words={question.wordCloud} />
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

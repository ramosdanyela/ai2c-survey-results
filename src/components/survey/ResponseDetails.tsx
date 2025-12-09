import { useState, useMemo } from "react";
import { MessageSquare, Award } from "lucide-react";
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
      <h2 className="section-title flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        Detalhes das Respostas
      </h2>

      {/* Filter Panel */}
      <FilterPanel onFiltersChange={handleFiltersChange} />

      {/* Question Type Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge
          variant={questionFilter === "all" ? "default" : "outline"}
          className="cursor-pointer px-4 py-2 text-base"
          onClick={() => setQuestionFilter("all")}
        >
          Todas
        </Badge>
        <Badge
          variant={questionFilter === "open" ? "default" : "outline"}
          className="cursor-pointer px-4 py-2 text-base"
          onClick={() => setQuestionFilter("open")}
        >
          Questões de Campo Aberto
        </Badge>
        <Badge
          variant={questionFilter === "closed" ? "default" : "outline"}
          className="cursor-pointer px-4 py-2 text-base"
          onClick={() => setQuestionFilter("closed")}
        >
          Questões Fechadas
        </Badge>
        <Badge
          variant={questionFilter === "nps" ? "default" : "outline"}
          className="cursor-pointer px-4 py-2 text-base"
          onClick={() => setQuestionFilter("nps")}
        >
          NPS
        </Badge>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {filteredQuestions.map((question) => (
          <AccordionItem
            key={question.id}
            value={`${question.type}-${question.id}`}
            className="card-elevated mb-4 px-0 overflow-hidden"
          >
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
                        margin={{ top: 10, right: 80, left: 120, bottom: 10 }}
                      >
                        {/* Removido CartesianGrid - estilo Nussbaumer */}
                        <XAxis
                          type="number"
                          tickFormatter={(v) => `${v}%`}
                          axisLine={false}
                          tickLine={false}
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
                            <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
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
                              className={`p-4 rounded-lg ${
                                cat.rank === 1
                                  ? "bg-primary/10 border border-primary/20"
                                  : cat.rank === 2
                                  ? "bg-accent/10 border border-accent/20"
                                  : "bg-muted/50 border border-border"
                              }`}
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
                              {cat.topics && (
                                <div className="space-y-1.5">
                                  {cat.topics.map((topicItem, index) => {
                                    const topic =
                                      typeof topicItem === "string"
                                        ? topicItem
                                        : topicItem.topic;
                                    const sentiment =
                                      typeof topicItem === "string"
                                        ? null
                                        : topicItem.sentiment;

                                    return (
                                      <div
                                        key={index}
                                        className="text-sm flex items-start gap-1.5"
                                      >
                                        <span className="text-muted-foreground mt-0.5">
                                          •
                                        </span>
                                        <span className="text-foreground">
                                          {topic}
                                        </span>
                                        {sentiment && (
                                          <Badge
                                            variant="outline"
                                            className={`text-[10px] px-1.5 py-0 h-4 ${
                                              sentiment === "positive"
                                                ? "border-green-500/50 text-green-600 dark:text-green-400 bg-green-500/10"
                                                : "border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/10"
                                            }`}
                                          >
                                            {sentiment === "positive"
                                              ? "positivo"
                                              : "negativo"}
                                          </Badge>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
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
        ))}
      </Accordion>
    </div>
  );
}

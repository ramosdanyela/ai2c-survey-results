import { useState } from "react";
import { BarChart3, Target, Users2, Heart } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { supportAnalysis } from "@/data/surveyData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { FilterPanel, type FilterValue } from "./FilterPanel";

interface SupportAnalysisProps {
  subSection?: string;
}

export function SupportAnalysis({ subSection }: SupportAnalysisProps) {
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const showSentiment = !subSection || subSection === "support-sentiment";
  const showIntent = !subSection || subSection === "support-intent";
  const showSegmentation = !subSection || subSection === "support-segmentation";

  // Transform data for divergent bar chart
  const divergentData = supportAnalysis.sentimentAnalysis.data.map((item) => ({
    category: item.category,
    positive: item.positive,
    neutral: item.neutral,
    negative: -item.negative,
  }));

  const handleFiltersChange = (newFilters: FilterValue[]) => {
    setFilters(newFilters);
    // Aqui você pode implementar a lógica de filtragem dos dados
    // Por enquanto, apenas armazenamos os filtros
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Filter Panel */}
      <div className="w-full lg:w-1/2 my-0">
        <FilterPanel onFiltersChange={handleFiltersChange} />
      </div>
      {showSentiment && (
        <section>
          <Card className="card-elevated">
            <CardHeader>
              <h2 className="section-title flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-primary" />
                Análise de Sentimento
              </h2>
              <CardDescription className="text-base leading-relaxed">
                {supportAnalysis.sentimentAnalysis.description
                  .split("\n")
                  .map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={divergentData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[-60, 80]}
                      tickFormatter={(value) => `${Math.abs(value)}%`}
                    />
                    <YAxis type="category" dataKey="category" width={90} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${Math.abs(value)}%`,
                        name === "negative"
                          ? "Negativo"
                          : name === "positive"
                          ? "Positivo"
                          : "Neutro",
                      ]}
                    />
                    <Legend
                      formatter={(value) =>
                        value === "negative"
                          ? "Negativo"
                          : value === "positive"
                          ? "Positivo"
                          : "Neutro"
                      }
                    />
                    <Bar
                      dataKey="negative"
                      fill="hsl(var(--chart-negative))"
                      stackId="stack"
                      radius={[4, 0, 0, 4]}
                    />
                    <Bar
                      dataKey="neutral"
                      fill="hsl(var(--chart-neutral))"
                      stackId="stack"
                    />
                    <Bar
                      dataKey="positive"
                      fill="hsl(var(--chart-positive))"
                      stackId="stack"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {showIntent && (
        <section>
          <Card className="card-elevated">
            <CardHeader>
              <h2 className="section-title flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                Intenção de Respondentes
              </h2>
              <CardDescription className="text-base leading-relaxed">
                {supportAnalysis.respondentIntent.description
                  .split("\n")
                  .map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Barra empilhada 100% para NPS (Detratores/Neutros/Promotores) */}
              {(() => {
                const npsData = supportAnalysis.respondentIntent.data.filter(
                  (item) => item.intent.includes("NPS")
                );
                const detratores = npsData.find((item) =>
                  item.intent.includes("Detratores")
                );
                const neutros = npsData.find((item) =>
                  item.intent.includes("Neutros")
                );
                const promotores = npsData.find((item) =>
                  item.intent.includes("Promotores")
                );

                if (detratores && neutros && promotores) {
                  return (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-bold text-white mb-3">
                          Distribuição NPS
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                {
                                  name: "NPS",
                                  Detratores: detratores.percentage,
                                  Neutros: neutros.percentage,
                                  Promotores: promotores.percentage,
                                },
                              ]}
                              layout="vertical"
                              margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                              />
                              <XAxis
                                type="number"
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}%`}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                width={60}
                                hide
                              />
                              <Tooltip
                                formatter={(value: number, name: string) => [
                                  `${value}%`,
                                  name === "Detratores"
                                    ? "Detratores"
                                    : name === "Neutros"
                                    ? "Neutros"
                                    : "Promotores",
                                ]}
                              />
                              <Legend
                                formatter={(value) =>
                                  value === "Detratores"
                                    ? "Detratores (0-6)"
                                    : value === "Neutros"
                                    ? "Neutros (7-8)"
                                    : "Promotores (9-10)"
                                }
                              />
                              <Bar
                                dataKey="Detratores"
                                fill="hsl(var(--chart-negative))"
                                stackId="a"
                                radius={[0, 0, 0, 0]}
                              />
                              <Bar
                                dataKey="Neutros"
                                fill="hsl(var(--chart-neutral))"
                                stackId="a"
                                radius={[0, 0, 0, 0]}
                              />
                              <Bar
                                dataKey="Promotores"
                                fill="hsl(var(--chart-positive))"
                                stackId="a"
                                radius={[4, 4, 4, 4]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-3xl font-bold text-destructive">
                              {detratores.percentage}%
                            </div>
                            <div className="text-sm text-white/70 mt-1">
                              Detratores ({detratores.count.toLocaleString()})
                            </div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-warning">
                              {neutros.percentage}%
                            </div>
                            <div className="text-sm text-white/70 mt-1">
                              Neutros ({neutros.count.toLocaleString()})
                            </div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-success">
                              {promotores.percentage}%
                            </div>
                            <div className="text-sm text-white/70 mt-1">
                              Promotores ({promotores.count.toLocaleString()})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Outras intenções (não NPS) em barras horizontais estilo Nussbaumer */}
              {(() => {
                const outrasIntencoes = supportAnalysis.respondentIntent.data
                  .filter((item) => !item.intent.includes("NPS"))
                  .sort((a, b) => b.percentage - a.percentage); // Ordenar do maior para o menor

                if (outrasIntencoes.length > 0) {
                  return (
                    <div className="mt-8">
                      <h3 className="text-sm font-bold text-white mb-3">
                        Outras Intenções
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={outrasIntencoes}
                            layout="vertical"
                            margin={{
                              top: 10,
                              right: 80,
                              left: 200,
                              bottom: 10,
                            }}
                          >
                            {/* Removido CartesianGrid - estilo Nussbaumer */}
                            <XAxis
                              type="number"
                              domain={[0, 100]}
                              tickFormatter={(v) => `${v}%`}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              type="category"
                              dataKey="intent"
                              width={190}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              formatter={(
                                value: number,
                                name: string,
                                props: any
                              ) => [
                                `${props.payload.count.toLocaleString()} (${value}%)`,
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
                    </div>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>
        </section>
      )}

      {showSegmentation && (
        <section>
          <h2 className="section-title flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            Segmentação de Respondentes
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {supportAnalysis.segmentation.map((cluster, index) => (
              <Card
                key={cluster.cluster}
                className={`card-elevated ${
                  index === 0
                    ? "border-t-4 border-t-success"
                    : index === 1
                    ? "border-t-4 border-t-warning"
                    : "border-t-4 border-t-destructive"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white">
                      {cluster.cluster}
                    </CardTitle>
                    <span
                      className={`text-3xl font-bold ${
                        index === 0
                          ? "text-success"
                          : index === 1
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {cluster.percentage}%
                    </span>
                  </div>
                  <Progress value={cluster.percentage} className="h-2" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70 mb-4">
                    {cluster.description
                      .split("\n")
                      .map((line, index, array) => (
                        <span key={index}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </span>
                      ))}
                  </p>
                  <div className="space-y-2">
                    {cluster.characteristics.map((char, i) => (
                      <div
                        key={i}
                        className="text-xs px-3 py-2 bg-white/5 rounded-md text-white/70 border-0 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

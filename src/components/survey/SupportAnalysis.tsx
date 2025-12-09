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
import { Progress } from "@/components/ui/progress";
import { FilterPanel, type FilterValue } from "./FilterPanel";
import { RGBA_BLACK_SHADOW_20 } from "@/lib/colors";
import {
  SentimentDivergentChart,
  NPSStackedChart,
  SimpleBarChart,
} from "./charts/Charts";

interface SupportAnalysisProps {
  subSection?: string;
}

export function SupportAnalysis({ subSection }: SupportAnalysisProps) {
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const showSentiment = !subSection || subSection === "support-sentiment";
  const showIntent = !subSection || subSection === "support-intent";
  const showSegmentation = !subSection || subSection === "support-segmentation";

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
              <SentimentDivergentChart
                data={supportAnalysis.sentimentAnalysis.data}
                height={320}
              />
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
                        <h3 className="text-base font-bold text-foreground mb-3">
                          Distribuição NPS
                        </h3>
                        <NPSStackedChart
                          data={{
                            Detratores: detratores.percentage,
                            Neutros: neutros.percentage,
                            Promotores: promotores.percentage,
                          }}
                          height={256}
                        />
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-3xl font-bold text-destructive">
                              {detratores.percentage}%
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Detratores ({detratores.count.toLocaleString()})
                            </div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-warning">
                              {neutros.percentage}%
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Neutros ({neutros.count.toLocaleString()})
                            </div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold text-success">
                              {promotores.percentage}%
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
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
                      <h3 className="text-sm font-bold text-foreground mb-3">
                        Outras Intenções
                      </h3>
                      <SimpleBarChart
                        data={outrasIntencoes}
                        dataKey="percentage"
                        yAxisDataKey="intent"
                        height={256}
                        margin={{
                          top: 10,
                          right: 80,
                          left: 200,
                          bottom: 10,
                        }}
                        yAxisWidth={190}
                        tooltipFormatter={(
                          value: number,
                          name: string,
                          props: any
                        ) => [
                          `${props.payload.count.toLocaleString()} (${value}%)`,
                          "Respostas",
                        ]}
                      />
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
                    <CardTitle className="text-xl font-bold text-card-foreground">
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
                  <p className="text-sm text-muted-foreground mb-4">
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
                        className="text-xs px-3 py-2 bg-muted/10 rounded-md text-muted-foreground border-0"
                        style={{
                          boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_20}`,
                        }}
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

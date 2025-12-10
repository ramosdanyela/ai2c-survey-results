import { Target, Users2, Heart, BarChart3 } from "lucide-react";
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
import { SentimentDivergentChart, SimpleBarChart } from "./charts/Charts";

/**
 * @param {Object} props
 * @param {string} [props.subSection]
 */
export function SupportAnalysis({ subSection }) {
  // Mostrar apenas a subseção específica
  const showSentiment = subSection === "support-sentiment";
  const showIntent = subSection === "support-intent";
  const showSegmentation = subSection === "support-segmentation";

  return (
    <div className="space-y-8 animate-fade-in">
      {showSentiment && (
        <section>
          <div className="space-y-6">
            {/* Section Title */}
            <Card className="card-elevated">
              <CardHeader className="py-6 flex items-center justify-center">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  <Heart className="w-6 h-6" />
                  Análise de Sentimento
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-elevated">
              <CardContent>
                <CardDescription className="text-base leading-relaxed space-y-3">
                  {supportAnalysis.sentimentAnalysis.description
                    .split("\n")
                    .map((line, index) => (
                      <p key={index} className={line.trim() ? "" : "h-3"}>
                        {line}
                      </p>
                    ))}
                </CardDescription>
                <SentimentDivergentChart
                  data={supportAnalysis.sentimentAnalysis.data}
                  height={320}
                  showGrid={false}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {showIntent && (
        <section>
          <div className="space-y-6">
            {/* Section Title */}
            <Card className="card-elevated">
              <CardHeader className="py-6 flex items-center justify-center">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  Intenção de Respondentes
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-elevated">
              <CardContent>
                <CardDescription className="text-base leading-relaxed space-y-3">
                  {supportAnalysis.respondentIntent.description
                    .split("\n")
                    .map((line, index) => (
                      <p key={index} className={line.trim() ? "" : "h-3"}>
                        {line}
                      </p>
                    ))}
                </CardDescription>
                <SimpleBarChart
                  data={[...supportAnalysis.respondentIntent.data].sort(
                    (a, b) => b.percentage - a.percentage
                  )}
                  dataKey="percentage"
                  yAxisDataKey="intent"
                  height={256}
                  margin={{
                    top: 10,
                    right: 80,
                    left: 250,
                    bottom: 10,
                  }}
                  yAxisWidth={240}
                  hideXAxis={true}
                  tooltipFormatter={(value, name, props) => [
                    `${props.payload.count.toLocaleString()} (${value}%)`,
                    "Respostas",
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {showSegmentation && (
        <section>
          <div className="space-y-6">
            {/* Section Title */}
            <Card className="card-elevated">
              <CardHeader className="py-6 flex items-center justify-center">
                <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  <Users2 className="w-6 h-6" />
                  Segmentação
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="card-elevated">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">
                        Rótulo de Cluster
                      </TableHead>
                      <TableHead>Descrição do Cluster</TableHead>
                      <TableHead className="w-[150px] text-right">
                        Porcentagem de Membros
                      </TableHead>
                      <TableHead className="w-[100px] text-center">
                        ID do Cluster
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...supportAnalysis.segmentation]
                      .sort((a, b) => b.percentage - a.percentage)
                      .map((cluster, index) => (
                        <TableRow key={cluster.cluster}>
                          <TableCell className="font-semibold">
                            {cluster.cluster}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {cluster.description}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-foreground">
                              {cluster.percentage}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {cluster.id || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}

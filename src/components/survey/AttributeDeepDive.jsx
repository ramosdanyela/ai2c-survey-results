import { useState } from "react";
import { MapPin, GraduationCap, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attributeDeepDive } from "@/data/surveyData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RGBA_BLACK_SHADOW_20 } from "@/lib/colors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SentimentStackedChart,
  SimpleBarChart,
  NPSStackedChart,
  SentimentThreeColorChart,
} from "./charts/Charts";

const attributeIcons = {
  state: MapPin,
  education: GraduationCap,
  customerType: Building,
};

export function AttributeDeepDive() {
  const [activeAttribute, setActiveAttribute] = useState("customerType");

  const currentAttribute = attributeDeepDive.attributes.find(
    (attr) => attr.id === activeAttribute
  );

  if (!currentAttribute) {
    return null;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Tabs value={activeAttribute} onValueChange={setActiveAttribute}>
        <TabsList className="w-full justify-start bg-muted/10 p-1 border-0">
          {attributeDeepDive.attributes.map((attr) => {
            // Validar que o attr.id existe no objeto attributeIcons
            const attrId = attr.id;
            if (!(attrId in attributeIcons)) {
              return null;
            }
            const Icon = attributeIcons[attrId];
            return (
              <TabsTrigger
                key={attr.id}
                value={attr.id}
                className="flex items-center gap-2 data-[state=active]:bg-[hsl(var(--custom-blue))] data-[state=active]:text-white"
              >
                <Icon className="w-4 h-4" />
                {attr.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {attributeDeepDive.attributes.map((attr) => (
          <TabsContent key={attr.id} value={attr.id} className="mt-6 space-y-6">
            {/* Summary */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-card-foreground">
                  Sumário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  {attr.summary.split("\n").map((line, index) => (
                    <p key={index} className={line.trim() ? "" : "h-3"}>
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Distribution - Barras horizontais estilo Nussbaumer */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    Distribuição dos respondentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart
                    data={attr.distribution}
                    dataKey="percentage"
                    yAxisDataKey="segment"
                    height={256}
                    margin={{ top: 10, right: 80, left: 120, bottom: 10 }}
                    yAxisWidth={110}
                    tooltipFormatter={(value, name, props) => [
                      `${props.payload.count.toLocaleString()} respondentes (${value}%)`,
                      props.payload.segment,
                    ]}
                  />
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Segmento</TableHead>
                          <TableHead className="text-right">
                            Quantidade
                          </TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...attr.distribution]
                          .sort((a, b) => b.percentage - a.percentage)
                          .map((item) => (
                            <TableRow key={item.segment}>
                              <TableCell className="font-medium">
                                {item.segment}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.count.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {item.percentage}%
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment by Segment */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Análise de sentimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SentimentStackedChart
                    data={attr.sentiment}
                    height={256}
                    yAxisDataKey="segment"
                  />
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Segmento</TableHead>
                          <TableHead className="text-right text-success">
                            Positivo
                          </TableHead>
                          <TableHead className="text-right text-destructive">
                            Negativo
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attr.sentiment.map((item) => (
                          <TableRow key={item.segment}>
                            <TableCell className="font-medium">
                              {item.segment}
                            </TableCell>
                            <TableCell className="text-right text-success">
                              {item.positive}%
                            </TableCell>
                            <TableCell className="text-right text-destructive">
                              {item.negative}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* NPS Section */}
            {attr.npsSummary && attr.npsDistribution && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Qual é a probabilidade de você recomendar nossa empresa a um
                    amigo ou colega em escala de 0 a 10?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sumário */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      Sumário
                    </h3>
                    <div className="text-muted-foreground leading-relaxed space-y-3">
                      {attr.npsSummary.split("\n").map((line, index) => (
                        <p key={index} className={line.trim() ? "" : "h-3"}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Respostas - Comparativo de NPS */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      Respostas
                    </h3>
                    <div className="space-y-6">
                      {/* Tabela de distribuição NPS */}
                      <div>
                        <h4 className="text-base font-semibold text-foreground mb-3">
                          Promotores, Neutros, Detratores
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{attr.name}</TableHead>
                              <TableHead className="text-right">
                                Promotores
                              </TableHead>
                              <TableHead className="text-right">
                                Neutros
                              </TableHead>
                              <TableHead className="text-right">
                                Detratores
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {attr.npsDistribution.map((item) => (
                              <TableRow key={item.segment}>
                                <TableCell className="font-medium">
                                  {item.segment}
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.promotores}%
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.neutros}%
                                </TableCell>
                                <TableCell className="text-right">
                                  {item.detratores}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Tabela de NPS */}
                      <div>
                        <h4 className="text-base font-semibold text-foreground mb-3">
                          NPS
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{attr.name}</TableHead>
                              <TableHead className="text-right">NPS</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {attr.nps.map((item) => (
                              <TableRow key={item.segment}>
                                <TableCell className="font-medium">
                                  {item.segment}
                                </TableCell>
                                <TableCell
                                  className={`text-right font-bold ${
                                    item.nps >= 0
                                      ? "text-success"
                                      : "text-destructive"
                                  }`}
                                >
                                  {item.nps > 0 ? "+" : ""}
                                  {item.nps}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Satisfaction Impact Section */}
            {attr.satisfactionImpactSummary && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Quais são os principais pontos que impactam sua satisfação?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sumário */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">
                      Sumário
                    </h3>
                    <div className="text-muted-foreground leading-relaxed space-y-3">
                      {attr.satisfactionImpactSummary
                        .split("\n")
                        .map((line, index) => (
                          <p key={index} className={line.trim() ? "" : "h-3"}>
                            {line}
                          </p>
                        ))}
                    </div>
                  </div>

                  {/* Análise de Sentimento */}
                  {attr.satisfactionImpactSentiment && (
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-3">
                        Análise de sentimento
                      </h3>
                      {/* Legenda de cores única */}
                      <div className="flex justify-center mb-4">
                        <div className="flex gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded"
                              style={{
                                backgroundColor: "hsl(var(--chart-negative))",
                              }}
                            />
                            <span>Negativo</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded"
                              style={{
                                backgroundColor: "hsl(var(--chart-neutral))",
                              }}
                            />
                            <span>Não aplicável</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded"
                              style={{
                                backgroundColor: "hsl(var(--chart-positive))",
                              }}
                            />
                            <span>Positivo</span>
                          </div>
                        </div>
                      </div>
                      <SentimentThreeColorChart
                        data={attr.satisfactionImpactSentiment}
                        height={192}
                        showGrid={false}
                        showLegend={false}
                        axisLine={false}
                        tickLine={false}
                      />
                      <div className="mt-4">
                        {attr.satisfactionImpactSentiment.length > 0 &&
                          (() => {
                            const segments = Object.keys(
                              attr.satisfactionImpactSentiment[0]
                            ).filter((key) => key !== "sentiment");
                            return (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Sentimento</TableHead>
                                    {segments.map((segment) => (
                                      <TableHead
                                        key={segment}
                                        className="text-right"
                                      >
                                        {segment}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {attr.satisfactionImpactSentiment.map(
                                    (item) => (
                                      <TableRow key={item.sentiment}>
                                        <TableCell className="font-medium">
                                          {item.sentiment}
                                        </TableCell>
                                        {segments.map((segment) => (
                                          <TableCell
                                            key={segment}
                                            className="text-right"
                                          >
                                            {item[segment]}%
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            );
                          })()}
                      </div>
                    </div>
                  )}

                  {/* Categorias com Sentimento Positivo */}
                  {attr.positiveCategories &&
                    attr.positiveCategories.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3">
                          Categorias com sentimento positivo - Top 3
                        </h3>
                        {(() => {
                          const segments = Object.keys(
                            attr.positiveCategories[0]
                          ).filter((key) => key !== "category");
                          return (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Categoria</TableHead>
                                  {segments.map((segment) => (
                                    <TableHead
                                      key={segment}
                                      className="text-right"
                                    >
                                      {segment}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {attr.positiveCategories.map((cat) => (
                                  <TableRow key={cat.category}>
                                    <TableCell className="font-medium">
                                      {cat.category}
                                    </TableCell>
                                    {segments.map((segment) => (
                                      <TableCell
                                        key={segment}
                                        className="text-right text-success"
                                      >
                                        {cat[segment]}%
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          );
                        })()}
                      </div>
                    )}

                  {/* Categorias com Sentimento Negativo */}
                  {attr.negativeCategories &&
                    attr.negativeCategories.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-3">
                          Categorias com sentimento negativo - Top 3
                        </h3>
                        {(() => {
                          const segments = Object.keys(
                            attr.negativeCategories[0]
                          ).filter((key) => key !== "category");
                          return (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Categoria</TableHead>
                                  {segments.map((segment) => (
                                    <TableHead
                                      key={segment}
                                      className="text-right"
                                    >
                                      {segment}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {attr.negativeCategories.map((cat) => (
                                  <TableRow key={cat.category}>
                                    <TableCell className="font-medium">
                                      {cat.category}
                                    </TableCell>
                                    {segments.map((segment) => (
                                      <TableCell
                                        key={segment}
                                        className="text-right text-destructive"
                                      >
                                        {cat[segment]}%
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          );
                        })()}
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

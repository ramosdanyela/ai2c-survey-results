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
import { SentimentStackedChart, SimpleBarChart } from "./charts/Charts";

const attributeIcons = {
  state: MapPin,
  education: GraduationCap,
  customerType: Building,
};

export function AttributeDeepDive() {
  const [activeAttribute, setActiveAttribute] = useState(
    attributeDeepDive.attributes[0].id
  );

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
                  Sumário - {attr.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {attr.summary.split("\n").map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Distribution - Barras horizontais estilo Nussbaumer */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-card-foreground">
                    Distribuição de Respondentes
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
                    Análise de Sentimento por Segmento
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

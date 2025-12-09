import { useState } from "react";
import { MapPin, GraduationCap, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attributeDeepDive } from "@/data/surveyData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

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
  )!;

  return (
    <div className="space-y-8 animate-fade-in">
      <Tabs value={activeAttribute} onValueChange={setActiveAttribute}>
        <TabsList className="w-full justify-start bg-white/5 p-1 border-0 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
          {attributeDeepDive.attributes.map((attr) => {
            const Icon = attributeIcons[attr.id as keyof typeof attributeIcons];
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
                <CardTitle className="text-xl font-bold text-white">
                  Sumário - {attr.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 leading-relaxed">
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
                  <CardTitle className="text-xl font-bold text-white">
                    Distribuição de Respondentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[...attr.distribution].sort(
                          (a, b) => b.percentage - a.percentage
                        )}
                        layout="vertical"
                        margin={{ top: 10, right: 80, left: 120, bottom: 10 }}
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
                          dataKey="segment"
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
                            `${props.payload.count.toLocaleString()} respondentes (${value}%)`,
                            props.payload.segment,
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
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={attr.sentiment}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
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
                        <YAxis type="category" dataKey="segment" width={90} />
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
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Segmento</TableHead>
                          <TableHead className="text-right text-success">
                            Positivo
                          </TableHead>
                          <TableHead className="text-right text-white/70">
                            Neutro
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
                            <TableCell className="text-right text-white/70">
                              {item.neutral}%
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

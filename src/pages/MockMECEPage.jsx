import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StackedBarMECE } from "@/components/survey/widgets/charts/StackedBarMECE";
import { AnalyticalTable } from "@/components/survey/widgets/AnalyticalTable";
import { COLOR_ORANGE_PRIMARY, COLOR_BLUE_TITLE } from "@/lib/colors";

/**
 * Página provisória para visualização: gráfico MECE + tabela analítica.
 * Mock com dados do report (resposta 1–5 por estado: Paraná, RS, SC).
 * Pode ser excluída depois.
 */

const MOCK_DATA = [
  { answer: "1", Paraná: 0.0, "Rio Grande do Sul": 11.9, "Santa Catarina": 6.4 },
  { answer: "2", Paraná: 0.0, "Rio Grande do Sul": 3.1, "Santa Catarina": 8.9 },
  { answer: "3", Paraná: 7.1, "Rio Grande do Sul": 8.8, "Santa Catarina": 13.2 },
  { answer: "4", Paraná: 42.9, "Rio Grande do Sul": 16.4, "Santa Catarina": 19.0 },
  { answer: "5", Paraná: 50.0, "Rio Grande do Sul": 59.7, "Santa Catarina": 52.5 },
];

const MECE_SERIES = [
  { dataKey: "Paraná", name: "Paraná", color: COLOR_ORANGE_PRIMARY },
  { dataKey: "Rio Grande do Sul", name: "Rio Grande do Sul", color: COLOR_BLUE_TITLE },
  { dataKey: "Santa Catarina", name: "Santa Catarina", color: "#10b981" },
];

const TABLE_COLUMNS = [
  { key: "answer", label: "Resposta", sortable: true },
  {
    key: "Paraná",
    label: "Paraná (%)",
    sortable: true,
    formatter: (v) => (v != null ? `${Number(v).toFixed(1)}%` : "–"),
  },
  {
    key: "Rio Grande do Sul",
    label: "Rio Grande do Sul (%)",
    sortable: true,
    formatter: (v) => (v != null ? `${Number(v).toFixed(1)}%` : "–"),
  },
  {
    key: "Santa Catarina",
    label: "Santa Catarina (%)",
    sortable: true,
    formatter: (v) => (v != null ? `${Number(v).toFixed(1)}%` : "–"),
  },
];

export default function MockMECEPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mock MECE + Tabela Analítica</h1>
          <p className="text-muted-foreground">
            Visualização provisória (dados do report — resposta 1–5 por estado)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gráfico MECE (barras empilhadas)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribuição por resposta (1–5) e estado
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-8">
            <StackedBarMECE
              data={MOCK_DATA}
              categoryKey="answer"
              series={MECE_SERIES}
              height={320}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabela analítica</CardTitle>
            <p className="text-sm text-muted-foreground">
              Valores em % por resposta e estado (ordenável)
            </p>
          </CardHeader>
          <CardContent className="overflow-visible p-6 pt-0 pb-6">
            <AnalyticalTable
              data={MOCK_DATA}
              columns={TABLE_COLUMNS}
              showRanking={false}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

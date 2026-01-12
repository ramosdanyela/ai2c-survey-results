import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SentimentDivergentChart,
  SentimentStackedChart,
  SentimentThreeColorChart,
  NPSStackedChart,
  SimpleBarChart,
} from "@/components/survey/widgets/Charts";
import { WordCloud } from "@/components/survey/widgets/WordCloud";

export default function Charts() {
  // Dados de exemplo para SentimentDivergentChart
  const sentimentDivergentData = [
    { category: "Atendimento", positive: 45, negative: 15 },
    { category: "Qualidade", positive: 60, negative: 10 },
    { category: "Preço", positive: 30, negative: 40 },
    { category: "Entrega", positive: 55, negative: 20 },
  ];

  // Dados de exemplo para SentimentStackedChart
  const sentimentStackedData = [
    { category: "Segmento A", positive: 50, negative: 30, neutral: 20 },
    { category: "Segmento B", positive: 40, negative: 35, neutral: 25 },
    { category: "Segmento C", positive: 60, negative: 20, neutral: 20 },
  ];

  // Dados de exemplo para SentimentThreeColorChart
  const sentimentThreeColorData = [
    { sentiment: "Positivo", "Tipo A": 45, "Tipo B": 55, "Tipo C": 40 },
    { sentiment: "Negativo", "Tipo A": 25, "Tipo B": 20, "Tipo C": 30 },
    { sentiment: "Não aplicável", "Tipo A": 30, "Tipo B": 25, "Tipo C": 30 },
  ];

  // Dados de exemplo para NPSStackedChart
  const npsData = {
    Detratores: 20,
    Neutros: 30,
    Promotores: 50,
  };

  // Dados de exemplo para SimpleBarChart
  const simpleBarData = [
    { name: "Opção A", value: 45 },
    { name: "Opção B", value: 30 },
    { name: "Opção C", value: 15 },
    { name: "Opção D", value: 10 },
  ];

  // Dados de exemplo para WordCloud
  const wordCloudData = [
    { text: "Qualidade", value: 85 },
    { text: "Atendimento", value: 72 },
    { text: "Preço", value: 65 },
    { text: "Entrega", value: 58 },
    { text: "Produto", value: 52 },
    { text: "Serviço", value: 48 },
    { text: "Suporte", value: 42 },
    { text: "Experiência", value: 38 },
    { text: "Satisfação", value: 35 },
    { text: "Confiança", value: 32 },
    { text: "Eficiência", value: 28 },
    { text: "Rapidez", value: 25 },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gráficos do Sistema</h1>
          <p className="text-muted-foreground">
            Visualização de todos os tipos de gráficos disponíveis
          </p>
        </div>

        {/* SentimentDivergentChart */}
        <Card>
          <CardHeader>
            <CardTitle>1. SentimentDivergentChart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico divergente de sentimento (negativo à esquerda, positivo à direita)
            </p>
          </CardHeader>
          <CardContent>
            <SentimentDivergentChart
              data={sentimentDivergentData}
              height={320}
            />
          </CardContent>
        </Card>

        {/* SentimentStackedChart */}
        <Card>
          <CardHeader>
            <CardTitle>2. SentimentStackedChart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico empilhado de sentimento (0-100%)
            </p>
          </CardHeader>
          <CardContent>
            <SentimentStackedChart data={sentimentStackedData} height={256} />
          </CardContent>
        </Card>

        {/* SentimentThreeColorChart */}
        <Card>
          <CardHeader>
            <CardTitle>3. SentimentThreeColorChart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de três cores (Positivo/Negativo/Não aplicável)
            </p>
          </CardHeader>
          <CardContent>
            <SentimentThreeColorChart
              data={sentimentThreeColorData}
              height={120}
            />
          </CardContent>
        </Card>

        {/* NPSStackedChart */}
        <Card>
          <CardHeader>
            <CardTitle>4. NPSStackedChart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico empilhado de NPS (Detratores/Neutros/Promotores)
            </p>
          </CardHeader>
          <CardContent>
            <NPSStackedChart data={npsData} height={256} />
          </CardContent>
        </Card>

        {/* SimpleBarChart */}
        <Card>
          <CardHeader>
            <CardTitle>5. SimpleBarChart</CardTitle>
            <p className="text-sm text-muted-foreground">
              Gráfico de barras simples (escala fixa 0-100%)
            </p>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={simpleBarData}
              dataKey="value"
              yAxisDataKey="name"
              height={256}
            />
          </CardContent>
        </Card>

        {/* WordCloud */}
        <Card>
          <CardHeader>
            <CardTitle>6. WordCloud</CardTitle>
            <p className="text-sm text-muted-foreground">
              Nuvem de palavras interativa
            </p>
          </CardHeader>
          <CardContent>
            <WordCloud words={wordCloudData} maxWords={12} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



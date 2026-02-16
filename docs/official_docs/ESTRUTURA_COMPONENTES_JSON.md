# Estrutura de componentes no JSON

Este documento descreve como estruturar cada tipo de componente no JSON do relatório (survey data), com exemplos de estrutura e dados.

---

## Sumário

1. [Estrutura comum de um componente](#1-estrutura-comum-de-um-componente)
2. [Onde os componentes ficam no JSON](#2-onde-os-componentes-ficam-no-json)
3. [Charts (Gráficos)](#3-charts-gráficos)
4. [Cards](#4-cards)
5. [Tables (Tabelas)](#5-tables-tabelas)
6. [Widgets](#6-widgets)
7. [Containers e headings](#7-containers-e-headings)
8. [Regras gerais (dataPath e dados)](#8-regras-gerais-datapath-e-dados)
9. [uiTexts (textos da interface)](#9-uitexts-textos-da-interface)

---

## 1. Estrutura comum de um componente

Todo componente no JSON deve ter pelo menos:

| Campo        | Tipo   | Obrigatório | Descrição                                                                                                     |
| ------------ | ------ | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `type`       | string | Sim         | Identificador do tipo do componente (ex.: `card`, `barChart`).                                                |
| `index`      | number | Recomendado | Ordem de renderização (menor = primeiro).                                                                     |
| `dataPath`   | string | Condicional | Caminho para os dados no objeto da seção/subseção. Obrigatório para componentes que consomem dados dinâmicos. |
| `config`     | object | Não         | Configurações específicas do componente (chaves do eixo, cores, etc.).                                        |
| `components` | array  | Não         | Componentes aninhados (para `card`, `container`, `grid-container`, `accordion`).                              |

Exemplo mínimo:

```json
{
  "type": "card",
  "index": 0,
  "title": "Título",
  "text": "Texto do card"
}
```

Exemplo com dados dinâmicos:

```json
{
  "type": "barChart",
  "index": 0,
  "dataPath": "sectionData.data",
  "config": {
    "dataKey": "percentage",
    "yAxisDataKey": "label"
  }
}
```

Os dados referenciados por `dataPath` devem existir em `section.data` (ou no objeto da subseção). O frontend resolve o caminho: por exemplo, `sectionData.recommendationsTable` busca em `section.data.recommendationsTable`.

---

## 2. Onde os componentes ficam no JSON

- **Seção sem subseções:** em `section.components[]`.
- **Seção com subseções:** em cada `section.subsections[].components[]`.
- **Dados:** em `section.data` (ou no objeto da subseção). A chave deve coincidir com o último segmento do `dataPath` (ex.: `sectionData.recommendationsTable` → `data.recommendationsTable`).

Exemplo de seção com componentes e dados:

```json
{
  "id": "resumo",
  "index": 0,
  "name": "Resumo",
  "icon": "FileText",
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Visão geral",
      "text": "Texto do card."
    },
    {
      "type": "recommendationsTable",
      "index": 1,
      "dataPath": "sectionData.recommendationsTable"
    }
  ],
  "data": {
    "recommendationsTable": [
      {
        "id": "rec1",
        "recommendation": "Recomendação 1",
        "priority": "alta",
        "category": "Atendimento"
      }
    ]
  }
}
```

---

## 3. Charts (Gráficos)

Todos os gráficos exigem `dataPath` e os dados no formato esperado em `section.data` (ou equivalente).

### 3.1 barChart

Gráfico de barras.

**Estrutura do componente:**

```json
{
  "type": "barChart",
  "index": 0,
  "dataPath": "sectionData.data",
  "config": {
    "dataKey": "percentage",
    "yAxisDataKey": "label",
    "heightPerBar": 44,
    "maxHeight": 960,
    "yAxisWidth": 200,
    "margin": { "top": 10, "right": 50, "left": 50, "bottom": 10 }
  }
}
```

**Exemplo de dados:** array de objetos com rótulo e valor(es).

```json
{
  "data": [
    { "label": "Opção A", "percentage": 45, "count": 100 },
    { "label": "Opção B", "percentage": 30, "count": 67 },
    { "label": "Opção C", "percentage": 25, "count": 55 }
  ]
}
```

---

### 3.2 sentimentDivergentChart

Gráfico de barras divergentes (sentimento: negativo / neutro / positivo).

**Estrutura do componente:**

```json
{
  "type": "sentimentDivergentChart",
  "index": 0,
  "dataPath": "sectionData.sentiment",
  "config": {
    "yAxisDataKey": "segment"
  }
}
```

**Exemplo de dados:** array com campos de segmento e percentuais por sentimento.

```json
{
  "sentiment": [
    { "segment": "Tema 1", "negative": 20, "neutral": 30, "positive": 50 },
    { "segment": "Tema 2", "negative": 40, "neutral": 25, "positive": 35 }
  ]
}
```

---

### 3.3 sentimentThreeColorChart

Gráfico de três cores (sentimento), variante do divergente.

**Estrutura do componente:**

```json
{
  "type": "sentimentThreeColorChart",
  "index": 0,
  "dataPath": "sectionData.satisfactionImpactSentimentChart",
  "config": {}
}
```

**Dados:** mesmo padrão de array com segmento e percentuais (negative/neutral/positive).

---

### 3.4 npsStackedChart

Gráfico de barras empilhadas NPS (Detrator / Neutro / Promotor).

**Estrutura do componente:**

```json
{
  "type": "npsStackedChart",
  "index": 0,
  "dataPath": "question.data.npsStackedChart",
  "config": {}
}
```

**Exemplo de dados:** array com exatamente 3 objetos, um por categoria NPS. Cada item tem `option` (nome da categoria), `value` (contagem) e `percentage` (percentual; a soma dos 3 ≈ 100%).

```json
{
  "npsStackedChart": [
    { "option": "Detrator", "value": 187, "percentage": 22 },
    { "option": "Neutro", "value": 170, "percentage": 20 },
    { "option": "Promotor", "value": 493, "percentage": 58 }
  ]
}
```

Valores aceitos para `option`: `"Detrator"`, `"Promotor"`, `"Neutro"`.

**Ordem de renderização:** o gráfico sempre exibe as barras na ordem **Detrator → Neutro → Promotor**, independentemente da ordem em que os itens são enviados no array.

---

### 3.5 lineChart

Gráfico de linhas.

**Estrutura do componente:**

```json
{
  "type": "lineChart",
  "index": 0,
  "dataPath": "sectionData.lineChart",
  "config": {
    "xAxisDataKey": "name",
    "lines": [{ "dataKey": "value", "stroke": "#8884d8" }]
  }
}
```

**Exemplo de dados:**

```json
{
  "lineChart": [
    { "name": "Jan", "value": 400 },
    { "name": "Fev", "value": 300 },
    { "name": "Mar", "value": 600 }
  ]
}
```

---

### 3.6 paretoChart

Gráfico de Pareto.

**Estrutura do componente:**

```json
{
  "type": "paretoChart",
  "index": 0,
  "dataPath": "sectionData.paretoChart",
  "config": {
    "categoryKey": "category",
    "valueKey": "value"
  }
}
```

**Exemplo de dados:**

```json
{
  "paretoChart": [
    { "category": "A", "value": 100 },
    { "category": "B", "value": 80 },
    { "category": "C", "value": 60 }
  ]
}
```

---

### 3.7 scatterPlot

Gráfico de dispersão.

**Estrutura do componente:**

```json
{
  "type": "scatterPlot",
  "index": 0,
  "dataPath": "sectionData.scatterPlot",
  "config": {
    "xAxisDataKey": "x",
    "yAxisDataKey": "y"
  }
}
```

**Exemplo de dados:**

```json
{
  "scatterPlot": [
    { "x": 100, "y": 200 },
    { "x": 120, "y": 180 },
    { "x": 150, "y": 150 }
  ]
}
```

---

### 3.8 histogram

Histograma.

**Estrutura do componente:**

```json
{
  "type": "histogram",
  "index": 0,
  "dataPath": "sectionData.histogram",
  "config": { "valueKey": "value" }
}
```

**Exemplo de dados:**

```json
{
  "histogram": [
    { "bin": "0-10", "value": 5 },
    { "bin": "10-20", "value": 12 },
    { "bin": "20-30", "value": 8 }
  ]
}
```

---

### 3.9 quadrantChart

Gráfico de quadrantes.

**Estrutura do componente:**

```json
{
  "type": "quadrantChart",
  "index": 0,
  "dataPath": "sectionData.quadrantChart",
  "config": {
    "xAxisDataKey": "x",
    "yAxisDataKey": "y",
    "labelKey": "label"
  }
}
```

**Exemplo de dados:**

```json
{
  "quadrantChart": [
    { "label": "A", "x": 0.2, "y": 0.8 },
    { "label": "B", "x": 0.7, "y": 0.3 },
    { "label": "C", "x": 0.5, "y": 0.5 }
  ]
}
```

---

### 3.10 heatmap

Mapa de calor.

**Estrutura do componente:**

```json
{
  "type": "heatmap",
  "index": 0,
  "dataPath": "sectionData.heatmap",
  "config": {
    "xKey": "x",
    "yKey": "y",
    "valueKey": "value"
  }
}
```

**Exemplo de dados:**

```json
{
  "heatmap": [
    { "x": "A", "y": "1", "value": 10 },
    { "x": "B", "y": "1", "value": 20 },
    { "x": "A", "y": "2", "value": 15 },
    { "x": "B", "y": "2", "value": 25 }
  ]
}
```

---

### 3.11 sankeyDiagram

Diagrama de Sankey.

**Estrutura do componente:**

```json
{
  "type": "sankeyDiagram",
  "index": 0,
  "dataPath": "sectionData.sankeyDiagram",
  "config": {}
}
```

**Exemplo de dados:**

```json
{
  "sankeyDiagram": {
    "nodes": [
      { "id": "A", "label": "Origem" },
      { "id": "B", "label": "Destino 1" },
      { "id": "C", "label": "Destino 2" }
    ],
    "links": [
      { "source": "A", "target": "B", "value": 10 },
      { "source": "A", "target": "C", "value": 5 }
    ]
  }
}
```

---

### 3.12 stackedBarMECE

Barras empilhadas MECE (segmentos que somam 100%).

**Estrutura do componente:**

```json
{
  "type": "stackedBarMECE",
  "index": 0,
  "dataPath": "sectionData.stackedBarMECE",
  "config": {
    "yAxisDataKey": "option",
    "series": [
      { "dataKey": "Paraná", "name": "Paraná (%)" },
      { "dataKey": "Rio Grande do Sul", "name": "Rio Grande do Sul (%)" },
      { "dataKey": "Santa Catarina", "name": "Santa Catarina (%)" }
    ]
  }
}
```

**Exemplo de dados:** array com uma coluna de rótulo e colunas numéricas por série.

```json
{
  "stackedBarMECE": [
    {
      "option": "5",
      "Paraná": 50.0,
      "Rio Grande do Sul": 59.7,
      "Santa Catarina": 52.5
    },
    {
      "option": "4",
      "Paraná": 42.9,
      "Rio Grande do Sul": 16.4,
      "Santa Catarina": 19.0
    },
    {
      "option": "3",
      "Paraná": 7.1,
      "Rio Grande do Sul": 8.8,
      "Santa Catarina": 13.2
    }
  ]
}
```

---

### 3.13 evolutionaryScorecard

Scorecard evolutivo (valor, meta, delta, tendência).

**Estrutura do componente:**

```json
{
  "type": "evolutionaryScorecard",
  "index": 0,
  "dataPath": "sectionData.evolutionaryScorecard",
  "config": {
    "valueKey": "value",
    "targetKey": "target",
    "deltaKey": "delta",
    "labelKey": "label"
  }
}
```

**Exemplo de dados:** objeto único.

```json
{
  "evolutionaryScorecard": {
    "value": 75,
    "target": 80,
    "delta": 5,
    "trend": "up",
    "label": "Evolução (exemplo)"
  }
}
```

---

### 3.14 slopeGraph

Gráfico de inclinação (antes/depois).

**Estrutura do componente:**

```json
{
  "type": "slopeGraph",
  "index": 0,
  "dataPath": "sectionData.slopeGraph",
  "config": {
    "categoryKey": "category",
    "beforeKey": "before",
    "afterKey": "after"
  }
}
```

**Exemplo de dados:**

```json
{
  "slopeGraph": [
    { "category": "A", "before": 10, "after": 20 },
    { "category": "B", "before": 30, "after": 25 },
    { "category": "C", "before": 15, "after": 35 }
  ]
}
```

---

### 3.15 waterfallChart

Gráfico cascata.

**Estrutura do componente:**

```json
{
  "type": "waterfallChart",
  "index": 0,
  "dataPath": "sectionData.waterfallChart",
  "config": {
    "labelKey": "label",
    "valueKey": "value",
    "typeKey": "type"
  }
}
```

**Exemplo de dados:** `type` pode ser `start`, `negative`, `positive`, `end`.

```json
{
  "waterfallChart": [
    { "label": "Início", "value": 100, "type": "start" },
    { "label": "Variação", "value": -20, "type": "negative" },
    { "label": "Fim", "value": 80, "type": "end" }
  ]
}
```

---

## 4. Cards

### 4.1 card

Card genérico. Pode ter título, texto e/ou componentes aninhados.

**Campos úteis:** `title`, `text`, `cardStyleVariant`, `cardContentVariant`, `titleStyleVariant`, `useDescription`, `components`.

**Estrutura mínima (só texto):**

```json
{
  "type": "card",
  "index": 0,
  "title": "Título do Card",
  "text": "Texto do card. Suporta quebras de linha.\nSegunda linha.",
  "cardStyleVariant": "default"
}
```

**Card com descrição (useDescription):**

```json
{
  "type": "card",
  "index": 0,
  "useDescription": true,
  "text": "Texto usando CardDescription",
  "cardStyleVariant": "default",
  "cardContentVariant": "with-description"
}
```

**Card com borda (border-left):**

```json
{
  "type": "card",
  "index": 0,
  "title": "Card com Borda",
  "text": "Card com borda colorida à esquerda",
  "cardStyleVariant": "border-left"
}
```

**Card com componentes aninhados:**

```json
{
  "type": "card",
  "index": 0,
  "title": "Card com Gráfico",
  "text": "Descrição opcional",
  "cardStyleVariant": "default",
  "components": [
    {
      "type": "barChart",
      "index": 0,
      "dataPath": "sectionData.data",
      "config": { "dataKey": "percentage", "yAxisDataKey": "label" }
    }
  ]
}
```

**Card apenas container (overflow-hidden / flex-column):**

```json
{
  "type": "card",
  "index": 0,
  "title": "",
  "text": "",
  "cardStyleVariant": "overflow-hidden",
  "components": [
    {
      "type": "recommendationsTable",
      "index": 0,
      "dataPath": "sectionData.recommendationsTable"
    }
  ]
}
```

Variantes comuns de estilo: `default`, `border-left`, `flat`, `overflow-hidden`, `flex-column`.  
Variantes de conteúdo: `with-description`, `with-charts`.

---

### 4.2 npsScoreCard

Card que exibe o score NPS.

**Estrutura do componente:**

```json
{
  "type": "npsScoreCard",
  "index": 0,
  "dataPath": "sectionData.npsScore",
  "config": {}
}
```

**Exemplo de dados:**

```json
{
  "npsScore": { "npsScore": 35 }
}
```

---

### 4.3 topCategoriesCards

Cards das top categorias (ex.: top 3).

**Estrutura do componente:**

```json
{
  "type": "topCategoriesCards",
  "index": 0,
  "dataPath": "sectionData.topCategoriesCards",
  "config": { "title": "Top 3 Categorias" }
}
```

**Exemplo de dados:** array de categorias com rank, menções, percentual e tópicos.

```json
{
  "topCategoriesCards": [
    {
      "rank": 1,
      "category": "Categoria A",
      "mentions": 100,
      "percentage": 100,
      "topics": [{ "topic": "tema 1", "sentiment": "positive" }]
    }
  ]
}
```

---

### 4.4 kpiCard

Card de KPI (valor + rótulo).

**Estrutura do componente:**

```json
{
  "type": "kpiCard",
  "index": 0,
  "dataPath": "sectionData.kpiCard",
  "config": {
    "title": "KPI",
    "valueKey": "value",
    "labelKey": "label"
  }
}
```

**Exemplo de dados:**

```json
{
  "kpiCard": { "label": "Meta", "value": 85 }
}
```

---

## 5. Tables (Tabelas)

Todas as tabelas usam `dataPath` e esperam os dados em `section.data` (chave igual ao último segmento do dataPath).

### 5.1 recommendationsTable

Tabela de recomendações (ex.: tarefas de implementação).

**Estrutura do componente:**

```json
{
  "type": "recommendationsTable",
  "index": 0,
  "dataPath": "sectionData.recommendationsTable",
  "config": {
    "severityLabels": { "high": "Alta", "medium": "Média", "low": "Baixa" }
  }
}
```

**Exemplo de dados:** array de itens com `id`, `recommendation`, `priority`, `category`, etc.

```json
{
  "recommendationsTable": [
    {
      "id": "rec1",
      "recommendation": "Recomendação 1",
      "priority": "alta",
      "category": "Atendimento"
    }
  ]
}
```

---

### 5.2 segmentationTable

Tabela de segmentação (clusters, perfis).

**Estrutura do componente:**

```json
{
  "type": "segmentationTable",
  "index": 0,
  "dataPath": "sectionData.segmentationTable"
}
```

**Exemplo de dados:** array de objetos com `cluster`, atributos e métricas.

```json
{
  "segmentationTable": [
    {
      "cluster": "Passivo — serviço de rede",
      "percent": 25,
      "description": "Descrição do cluster"
    }
  ]
}
```

---

### 5.3 distributionTable

Tabela de distribuição (contagem e percentual).

**Estrutura do componente:**

```json
{
  "type": "distributionTable",
  "index": 0,
  "dataPath": "sectionData.distributionTable",
  "config": {}
}
```

**Exemplo de dados:**

```json
{
  "distributionTable": [
    { "segment": "Opção A", "count": 100, "percentage": 50 },
    { "segment": "Opção B", "count": 100, "percentage": 50 }
  ]
}
```

---

### 5.4 sentimentTable

Tabela de sentimento (positive / neutral / negative por segmento).

**Estrutura do componente:**

```json
{
  "type": "sentimentTable",
  "index": 0,
  "dataPath": "sectionData.sentimentTable"
}
```

**Exemplo de dados:**

```json
{
  "sentimentTable": [
    { "segment": "Segmento", "positive": 60, "neutral": 25, "negative": 15 }
  ]
}
```

---

### 5.5 npsDistributionTable

Tabela de distribuição NPS.

**Estrutura do componente:**

```json
{
  "type": "npsDistributionTable",
  "index": 0,
  "dataPath": "sectionData.npsDistributionTable"
}
```

**Dados:** array de linhas com colunas de distribuição NPS (ex.: por opção 0–10 ou por grupo).

---

### 5.6 npsTable

Tabela NPS (resumo por grupo ou por pergunta).

**Estrutura do componente:**

```json
{
  "type": "npsTable",
  "index": 0,
  "dataPath": "sectionData.npsTable"
}
```

**Dados:** array ou objeto conforme o layout da tabela no frontend.

---

### 5.7 sentimentImpactTable

Tabela de impacto de sentimento na satisfação.

**Estrutura do componente:**

```json
{
  "type": "sentimentImpactTable",
  "index": 0,
  "dataPath": "sectionData.satisfactionImpactSentimentTable"
}
```

**Dados:** array de linhas com segmento e métricas de impacto/sentimento.

---

### 5.8 positiveCategoriesTable

Tabela de categorias com sentimento positivo (ex.: top 3).

**Estrutura do componente:**

```json
{
  "type": "positiveCategoriesTable",
  "index": 0,
  "dataPath": "sectionData.positiveCategoriesTable"
}
```

**Exemplo de dados:**

```json
{
  "positiveCategoriesTable": [
    { "category": "suporte ao cliente", "mentions": 50, "percentage": 47.1 }
  ]
}
```

---

### 5.9 negativeCategoriesTable

Tabela de categorias com sentimento negativo (ex.: top 3).

**Estrutura do componente:**

```json
{
  "type": "negativeCategoriesTable",
  "index": 0,
  "dataPath": "sectionData.negativeCategoriesTable"
}
```

**Exemplo de dados:** mesmo padrão de `positiveCategoriesTable`, com `category` e métricas.

```json
{
  "negativeCategoriesTable": [
    { "category": "serviço de rede", "mentions": 30, "percentage": 35.0 }
  ]
}
```

---

### 5.10 analyticalTable

Tabela analítica (múltiplas colunas numéricas por linha).

**Estrutura do componente:**

```json
{
  "type": "analyticalTable",
  "index": 0,
  "dataPath": "sectionData.analyticalTable"
}
```

**Exemplo de dados:** array de objetos com uma coluna de rótulo (ex.: `segment`) e colunas dinâmicas.

```json
{
  "analyticalTable": [
    {
      "segment": "5",
      "Paraná": 50.0,
      "Rio Grande do Sul": 59.7,
      "Santa Catarina": 52.5
    },
    {
      "segment": "4",
      "Paraná": 42.9,
      "Rio Grande do Sul": 16.4,
      "Santa Catarina": 19.0
    }
  ]
}
```

---

## 6. Widgets

### 6.1 filterPills

Pills de filtro (chips).

**Estrutura do componente:**

```json
{
  "type": "filterPills",
  "index": 0,
  "dataPath": "sectionData.filterPills",
  "config": {}
}
```

**Exemplo de dados:**

```json
{
  "filterPills": [
    { "id": "f1", "label": "Filtro 1" },
    { "id": "f2", "label": "Filtro 2" }
  ]
}
```

---

### 6.2 wordCloud

Nuvem de palavras.

**Estrutura do componente:**

```json
{
  "type": "wordCloud",
  "index": 0,
  "dataPath": "sectionData.wordCloud",
  "config": { "title": "Nuvem de palavras" }
}
```

**Exemplo de dados:**

```json
{
  "wordCloud": [
    { "text": "palavra1", "value": 50 },
    { "text": "palavra2", "value": 30 },
    { "text": "palavra3", "value": 20 }
  ]
}
```

---

### 6.3 questionsList

Lista de questões. Usado na seção de respostas; cada item é uma questão com `questionType` e `data`. O backend envia as questões em `section.questions[]`; o frontend monta os componentes por template (ex.: NPS → npsScoreCard + npsStackedChart).

**Estrutura do componente:** normalmente não se declara manualmente no JSON; a seção tem `questions[]` e o tipo de questão define os componentes.

**Referência:** ver `questionTemplates` no código (nps, multiple-choice, single-choice, open-ended).

---

### 6.4 accordion

Acordeão que agrupa outros componentes. Exige `components` e é renderizado com `renderSchemaComponent` no frontend.

**Estrutura do componente:**

```json
{
  "type": "accordion",
  "index": 0,
  "title": "Título do acordeão",
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Card dentro do acordeão",
      "text": "Conteúdo"
    },
    {
      "type": "barChart",
      "index": 1,
      "dataPath": "sectionData.data",
      "config": {}
    }
  ]
}
```

---

## 7. Containers e headings

### 7.1 container

Container que agrupa componentes (ex.: layout em coluna ou linha).

**Estrutura do componente:**

```json
{
  "type": "container",
  "index": 0,
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Card 1",
      "text": "Primeiro card",
      "cardStyleVariant": "default"
    },
    {
      "type": "card",
      "index": 1,
      "title": "Card 2",
      "text": "Segundo card",
      "cardStyleVariant": "default"
    }
  ]
}
```

Opcional: `className` ou `layout` para controlar CSS (ex.: grid).

---

### 7.2 grid-container

Container em grid (ex.: duas colunas).

**Estrutura do componente:**

```json
{
  "type": "grid-container",
  "index": 0,
  "className": "grid gap-6 md:grid-cols-2",
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Card 1",
      "text": "Conteúdo 1",
      "cardStyleVariant": "default"
    },
    {
      "type": "card",
      "index": 1,
      "title": "Card 2",
      "text": "Conteúdo 2",
      "cardStyleVariant": "default"
    }
  ]
}
```

---

### 7.3 h3 e h4

Títulos de seção (heading nível 3 e 4). Não usam `dataPath`; o texto vem no próprio componente.

**Estrutura (h3):**

```json
{
  "type": "h3",
  "index": 0,
  "text": "Análise de Sentimento"
}
```

**Estrutura (h4):**

```json
{
  "type": "h4",
  "index": 0,
  "text": "Subseção"
}
```

Opcional: `wrapperProps` com `className` para estilizar o título.

---

## 8. Regras gerais (dataPath e dados)

- **dataPath:** use o prefixo `sectionData.` para dados da seção/subseção atual. O restante do caminho deve corresponder às chaves em `section.data` (ou no objeto da subseção). Ex.: `sectionData.recommendationsTable` → `data.recommendationsTable`.
- **Questões:** em seções com `questions[]`, o contexto pode ser `question.data`; nesse caso use dataPaths como `question.data.npsStackedChart`, `question.data.barChart`, etc., conforme os templates de questão.
- **Coerência:** o último segmento do `dataPath` deve ser compatível com o `type` do componente (ex.: não use `type: "barChart"` com `dataPath` terminando em `recommendationsTable`). O projeto tem regras de validação que checam essa coerência.
- **Tipos válidos:** a lista de tipos aceitos está em `VALID_COMPONENT_TYPES` nas regras de validação e no `componentRegistry` no frontend. Use apenas esses tipos em `type`.

Para validar o JSON do relatório, use os scripts em `docs/validation_scripts/` (ex.: `validate-json.js` / `validate-all-jsons.js`).

---

## 9. uiTexts (textos da interface)

O objeto **`uiTexts`** fica na **raiz** do JSON e concentra os textos da interface (rótulos, mensagens de loading, empty states, filtros). Assim evita-se texto hardcoded no código e permite personalizar ou traduzir por pesquisa. O frontend usa esses valores quando presentes; caso contrário, aplica fallbacks internos.

### Onde fica no JSON

```json
{
  "metadata": { ... },
  "sections": [ ... ],
  "uiTexts": {
    "responseDetails": { ... },
    "filterPanel": { ... },
    "common": { ... },
    "surveySidebar": { ... }
  }
}
```

Todas as chaves são **opcionais**. A referência completa de chaves (árvore e descrição) está em **[REFERENCIA_UITEXTS_JSON.md](./REFERENCIA_UITEXTS_JSON.md)**.

### responseDetails (questões e respostas)

Usado na lista de questões, nos badges de tipo (Campo Aberto, Múltipla Escolha, etc.), no card de NPS e no Top 3. Essas chaves afetam diretamente a área de **questões**.

Exemplo mínimo:

```json
"uiTexts": {
  "responseDetails": {
    "all": "Todas",
    "open-ended": "Campo Aberto",
    "multiple-choice": "Múltipla Escolha",
    "single-choice": "Escolha única",
    "nps": "NPS",
    "npsScore": "NPS Score",
    "top3Categories": "Top 3 Categories",
    "mentions": "menções",
    "positive": "Positivo",
    "negative": "Negativo",
    "noPositiveTopics": "Nenhum tópico positivo",
    "noNegativeTopics": "Nenhum tópico negativo",
    "filterQuestion": "Filtrar questão",
    "questionPrefix": "Q"
  }
}
```

### filterPanel (filtros e questões)

Usado no painel de filtros (FilterPanel), incluindo o dropdown **"Filtrar por questão"** e os rótulos dos tipos de questão no painel.

Exemplo:

```json
"uiTexts": {
  "filterPanel": {
    "filterByQuestion": "Filtrar por questão:",
    "selectQuestion": "Selecione uma questão",
    "allQuestions": "Todas as questões",
    "questionPrefix": "Q",
    "all": "Todas",
    "open-ended": "Campo Aberto",
    "multiple-choice": "Múltipla Escolha",
    "single-choice": "Escolha única",
    "nps": "NPS",
    "filters": "Filtros",
    "selectFilterType": "Selecione um tipo de filtro",
    "activeFilters": "Filtros Ativos",
    "selectValues": "Selecione os valores",
    "clearAllFilters": "Limpar todos os filtros",
    "ok": "OK"
  }
}
```

### Outros nós (common, surveySidebar, etc.)

- **common:** mensagens de loading (`loadingQuestions`, `loadingFilteredData`), erros (`questionsNotFound`) e empty states genéricos (`noData`, `noComponentsForSection`). Ver referência completa em [REFERENCIA_UITEXTS_JSON.md](./REFERENCIA_UITEXTS_JSON.md).
- **surveySidebar:** rótulos como "Respondentes", "Taxa de resposta", "Questões" no sidebar e no bloco de export.
- **surveyHeader:** textos do cabeçalho e navegação (conforme uso no código).

Para a lista completa de chaves e fallbacks, consulte **[REFERENCIA_UITEXTS_JSON.md](./REFERENCIA_UITEXTS_JSON.md)**.

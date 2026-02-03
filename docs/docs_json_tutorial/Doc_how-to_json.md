# 📚 Documentação: surveyData.json

## 📋 Índice

1. [Estrutura do JSON](#estrutura-do-json)
2. [Criando uma Seção](#criando-uma-seção)
3. [Criando uma Subseção](#criando-uma-subseção)
4. [Gerenciando Questões](#gerenciando-questões)
5. [Traduções e Textos da Interface](#traduções-e-textos-da-interface)
6. [Componentes Disponíveis](#componentes-disponíveis)
7. [Templates e Referências](#templates-e-referências)
8. [Condições](#condições)
9. [Estruturas de Dados](#estruturas-de-dados)
10. [FAQ](#faq)
11. [Exemplos](#exemplos)

---

## 📐 Estrutura do JSON

O arquivo `surveyData.json` é o arquivo central que define toda a estrutura e conteúdo da pesquisa. Ele tem a seguinte estrutura principal:

```json
{
  "metadata": { ... },
  "sections": [ ... ],
  "uiTexts": { ... },
  "surveyInfo": { ... }
}
```

### Visão Geral dos Campos Principais

- **`metadata`**: Informações básicas sobre a pesquisa (versão, idioma, ID)
- **`sections`**: Array de seções que define todas as seções, subseções e componentes diretamente
- **`uiTexts`**: Textos estáticos da interface que não mudam com os dados da pesquisa
- **`surveyInfo`**: Informações gerais da pesquisa (título, empresa, período, NPS, etc.)

**⚠️ Mudança importante:**

- A estrutura usa `sections` diretamente no nível raiz (não mais `sectionsConfig.sections`)
- Os componentes estão diretamente em `subsections[].components` (não há mais `renderSchema`)
- Questões usam `questionType` (não `type`) e ficam em `questions` dentro da seção

---

### 1. `metadata`

Informações básicas da pesquisa.

```json
{
  "metadata": {
    "version": "1.0",
    "language": "pt-BR",
    "surveyId": "survey-2024-01"
  }
}
}
```

**Campos obrigatórios:**

- `version`: Versão do formato (string)
- `language`: Idioma (string: "pt-BR", "en-US", etc.)
- `surveyId`: ID único (string)

---

### 2. `sections`

Define as seções da pesquisa. Cada seção pode ter subseções com componentes diretamente definidos.

```json
{
  "sections": [
    {
      "id": "executive",
      "index": 0,
      "name": "Relatório Executivo",
      "icon": "FileText",
      "subsections": [
        {
          "id": "executive-summary",
          "index": 0,
          "name": "Sumário Executivo",
          "icon": "ClipboardList",
          "components": [
            {
              "type": "card",
              "index": 0,
              "title": "Sobre o Estudo",
              "text": "Conteúdo...",
              "cardStyleVariant": "default"
            }
          ]
        }
      ],
      "data": {
        "summary": { ... }
      }
    }
  ]
}
```

**Campos da seção:**

- `id` (obrigatório): ID único, sem espaços (string)
- `index` (obrigatório): Ordem de exibição, começa em 0 (number)
- `name` (obrigatório): Nome exibido na interface (string)
- `icon` (obrigatório): Nome do ícone do Lucide React (string)
- `subsections` (opcional): Array de subseções com componentes diretamente definidos
- `components` (opcional): Array de componentes para seções sem subseções
- `questions` (opcional): Array de questões (usado na seção "responses")
- `data` (opcional): Dados específicos da seção, separados dos componentes

**⚠️ Mudança importante:** Os componentes agora estão diretamente em `subsections[].components` (não há mais `renderSchema`). Os dados ficam separados em `data`.

**Nota sobre Export:** O **Export** não fica em `sections`. Só é preciso ter `uiTexts.export` com os textos. O app injeta o item no menu automaticamente.

---

### 3. `surveyInfo`

Informações gerais da pesquisa.

```json
{
  "surveyInfo": {
    "title": "Pesquisa de Satisfação do Cliente 2024",
    "company": "TechCorp Brasil",
    "period": "Outubro - Novembro 2024",
    "totalRespondents": 1247,
    "responseRate": 68.5,
    "nps": -21,
    "questions": 6
  }
}
```

**Campos:**

- `title`: Título (string)
- `company`: Empresa (string)
- `period`: Período (string)
- `totalRespondents`: Total de respondentes (number)
- `responseRate`: Taxa de resposta % (number)
- `nps`: Score NPS, -100 a 100 (number)
- `questions`: Número de questões (number)

---

### 4. `uiTexts`

**Textos estáticos da interface que não mudam com os dados da pesquisa.**

Esta seção contém todas as traduções e textos da interface que são fixos, independentemente dos dados específicos de cada pesquisa. Organize os textos por contexto/seção usando chaves descritivas em camelCase.

```json
{
  "uiTexts": {
    "executiveReport": {
      "executiveSummary": "Sumário Executivo",
      "aboutStudy": "Sobre o Estudo",
      "mainFindings": "Principais Descobertas",
      "conclusions": "Conclusões",
      "recommendations": "Recomendações"
    },
    "severityLabels": {
      "critical": "Crítico",
      "high": "Alto",
      "medium": "Médio",
      "low": "Baixo"
    },
    "filterPanel": {
      "all": "Todas",
      "open-ended": "Campo Aberto",
      "multiple-choice": "Múltipla Escolha",
      "single-choice": "Escolha única",
      "nps": "NPS"
    }
  }
}
```

**Nota sobre traduções:** Todos os textos da interface devem estar em `uiTexts` no JSON. O código utiliza o hook `useSurveyData()` para acessar esses dados, garantindo uma única fonte de verdade. Para adicionar novos textos, adicione em `uiTexts` no JSON.

**Textos específicos de seção:** Cada seção pode ter seus próprios `uiTexts` dentro de `data.uiTexts`. Estes textos têm precedência sobre os textos globais em `uiTexts`.

---

## 🏗️ Criando uma Seção

### Passo 1: Adicionar em `sections`

```json
{
  "sections": [
    {
      "id": "minha-secao",
      "index": 0,
      "name": "Minha Seção",
      "icon": "BarChart3",
      "subsections": [
        {
          "id": "minha-subsecao",
          "index": 0,
          "name": "Minha Subseção",
          "icon": "TrendingUp",
          "components": [
            {
              "type": "card",
              "index": 0,
              "title": "Título do Card",
              "text": "Conteúdo do card",
              "cardStyleVariant": "default"
            }
          ]
        }
      ]
    }
  ]
}
```

### Passo 2: Adicionar os dados

Os dados específicos da pesquisa ficam em `data`, separados dos componentes:

```json
{
  "data": {
    "descricao": "Esta é a descrição da minha seção",
    "dados": [
      { "label": "Item 1", "value": 100 },
      { "label": "Item 2", "value": 200 }
    ]
  }
}
```

**⚠️ Importante:** Os componentes estão diretamente em `subsections[].components`. Não há mais `renderSchema`. Mantenha os dados separados em `data` porque podem ser verbosos.

### Passo 3: Adicionar textos em `uiTexts`

```json
{
  "uiTexts": {
    "minhaSecao": {
      "titulo": "Título da Minha Seção",
      "subtitulo": "Subtítulo"
    }
  }
}
```

---

## 📑 Criando uma Subseção

### Subseção com componentes

Os componentes estão diretamente nas subseções:

```json
{
  "subsections": [
    {
      "id": "subsecao-1",
      "index": 0,
      "name": "Subseção 1",
      "icon": "FileText",
      "components": [
        {
          "type": "card",
          "index": 0,
          "title": "Título do Card",
          "text": "Conteúdo do card",
          "cardStyleVariant": "default"
        }
      ]
    }
  ]
}
```

### Múltiplos componentes

```json
{
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Card 1",
      "text": "Conteúdo 1"
    },
    {
      "type": "barChart",
      "index": 1,
      "dataPath": "sectionData.dados",
      "config": {
        "dataKey": "value",
        "yAxisDataKey": "label"
      }
    }
  ]
}
```

---

## ❓ Gerenciando Questões

### Onde ficam as questões?

As questões ficam dentro da seção `responses`, diretamente em `questions` (não em `data.questions`):

```json
{
  "sections": [
    {
      "id": "responses",
      "index": 4,
      "name": "Análise por Questão",
      "icon": "MessageSquare",
      "questions": [
        {
          "id": 1,
          "index": 1,
          "questionType": "nps",
          "question": "Qual é a probabilidade de você recomendar...",
          "icon": "Percent",
          "summary": "Com 51% dos entrevistados...",
          "data": {
            "npsScore": 35,
            "npsStackedChart": [ ... ]
          }
        }
      ],
      "components": [],
      "data": {
        "config": {
          "npsCategories": { ... }
        }
      }
    }
  ]
}
```

### Adicionar uma questão

Para adicionar uma nova questão, simplesmente adicione um objeto ao array `questions`:

```json
{
  "questions": [
    {
      "id": 1,
      "index": 1,
      "questionType": "nps",
      "question": "Pergunta existente",
      "data": { ... }
    },
    {
      "id": 7,
      "index": 7,
      "questionType": "multiple-choice",
      "question": "Nova pergunta",
      "icon": "HelpCircle",
      "summary": "Resumo da nova pergunta",
      "data": {
        "barChart": [
          {
            "option": "Opção 1",
            "value": 100,
            "percentage": 50
          }
        ]
      }
    }
  ]
}
```

**Campos obrigatórios de uma questão:**

- `id`: ID único (number)
- `index`: Ordem de exibição (number)
- `question`: Texto da pergunta (string)
- `questionType`: Tipo da questão - `"nps"`, `"open-ended"`, `"multiple-choice"` ou `"single-choice"` (string)

**⚠️ Importante:** Use `questionType` (não `type`) para questões. Os componentes são gerados automaticamente baseados no `questionType` usando templates pré-definidos.

**Campos opcionais:**

- `icon`: Nome do ícone (string)
- `summary`: Resumo da questão (string)
- `data`: Dados da questão (object) - estrutura varia conforme o tipo
  - Para `nps`: `npsScore`, `npsStackedChart`
  - Para `multiple-choice` ou `single-choice`: `barChart`
  - Para `open-ended`: `wordCloud`, `topCategoriesCards`, `sentimentDivergentChart` (dados em `sentimentStackedChart` ou `sentimentDivergentChart`)

### Remover uma questão

**Para remover:** Remova o objeto do array `questions`. O filtro `config.questions.hiddenIds` foi descontinuado.

### Estrutura de uma questão por tipo

#### Questão NPS (`questionType: "nps"`)

```json
{
  "id": 1,
  "index": 1,
  "questionType": "nps",
  "question": "Qual é a probabilidade de você recomendar...",
  "icon": "Percent",
  "summary": "Resumo...",
  "data": {
    "npsScore": 35,
    "npsStackedChart": [
      {
        "option": "Detrator",
        "value": 636,
        "percentage": 51
      },
      {
        "option": "Promotor",
        "value": 374,
        "percentage": 30
      },
      {
        "option": "Neutro",
        "value": 237,
        "percentage": 19
      }
    ]
  }
}
```

**Componentes gerados automaticamente:** `npsScoreCard`, `npsStackedChart`

#### Questão Múltipla Escolha (`questionType: "multiple-choice"`)

```json
{
  "id": 2,
  "index": 2,
  "questionType": "multiple-choice",
  "question": "Qual é o principal ponto que impacta sua satisfação?",
  "icon": "HelpCircle",
  "summary": "Resumo...",
  "data": {
    "barChart": [
      {
        "option": "Opção 1",
        "value": 168,
        "percentage": 26
      },
      {
        "option": "Opção 2",
        "value": 150,
        "percentage": 23
      }
    ]
  }
}
```

**Componente gerado automaticamente:** `barChart`

#### Questão Aberta / Campo Livre (`questionType: "open-ended"`)

```json
{
  "id": 4,
  "index": 4,
  "questionType": "open-ended",
  "question": "O que podemos melhorar?",
  "icon": "TrendingUp",
  "summary": "Resumo...",
  "data": {
    "sentimentStackedChart": [
      {
        "category": "Suporte",
        "positive": 15,
        "neutral": 25,
        "negative": 60
      }
    ],
    "topCategoriesCards": [
      {
        "rank": 1,
        "category": "Tempo de resposta do suporte",
        "mentions": 412,
        "percentage": 33,
        "topics": [
          {
            "topic": "tempo de espera",
            "sentiment": "negative"
          }
        ]
      }
    ],
    "wordCloud": [
      { "text": "suporte", "value": 412 },
      { "text": "tempo", "value": 356 }
    ]
  }
}
```

**Componentes gerados automaticamente:** `sentimentDivergentChart`, `topCategoriesCards`, `wordCloud`

**⚠️ Importante:** As questões **não possuem** um campo `components` no JSON. Os componentes são gerados automaticamente baseados no `questionType` usando templates pré-definidos.

---

## 🌐 Traduções e Textos da Interface

### Onde ficam as traduções?

As traduções que **não mudam de acordo com a pesquisa** ficam em `uiTexts` no nível raiz do JSON:

```json
{
  "uiTexts": {
    "executiveReport": {
      "executiveSummary": "Sumário Executivo",
      "aboutStudy": "Sobre o Estudo"
    },
    "filterPanel": {
      "all": "Todas",
      "open-ended": "Campo Aberto",
      "multiple-choice": "Múltipla Escolha",
      "single-choice": "Escolha única",
      "nps": "NPS"
    },
    "severityLabels": {
      "critical": "Crítico",
      "high": "Alto",
      "medium": "Médio",
      "low": "Baixo"
    }
  }
}
```

### Textos específicos de seção

Cada seção pode ter seus próprios textos em `data.uiTexts`. Estes textos têm precedência sobre os textos globais:

```json
{
  "sections": [
    {
      "id": "responses",
      "data": {
        "uiTexts": {
          "summary": "Sumário:",
          "wordCloud": "Nuvem de Palavras",
          "top3Categories": "Top 3 Categorias"
        }
      }
    }
  ]
}
```

### Como usar traduções nos componentes

Use templates `{{uiTexts.caminho}}` para referenciar textos:

```json
{
  "type": "card",
  "title": "{{uiTexts.executiveReport.aboutStudy}}",
  "text": "{{sectionData.summary.aboutStudy}}"
}
```

### Traduções no código

Além dos textos no JSON, existem traduções hardcoded em `src/data/surveyData.js` (export `uiTexts`). Para novos textos, prefira usar `uiTexts` no JSON, pois é mais fácil de manter e traduzir.

---

## 🧩 Componentes Disponíveis

O sistema suporta diversos tipos de componentes. **Mesmo que não estejam no JSON atual, o código processa e renderiza qualquer um dos seguintes tipos**. Todos os componentes estão registrados no `ComponentRegistry` e podem ser usados em qualquer seção/subseção.

### Cards

#### Card

Exibe conteúdo com título e corpo.

```json
{
  "type": "card",
  "index": 0,
  "title": "Título do Card",
  "text": "Texto do card com suporte a quebras de linha.\nSegunda linha.",
  "cardStyleVariant": "default",
  "cardContentVariant": "with-description",
  "useDescription": false,
  "components": [ ... ]
}
```

**Propriedades:**

- `type`: `"card"` (obrigatório)
- `index`: Ordem (number, opcional)
- `title`: Título (string, opcional)
- `text`: Texto (string, suporta `\n` para quebras, opcional)
- `cardStyleVariant`: Estilo do card (string, opcional)
  - Valores: `"default"`, `"highlight"`, `"border-left"`, `"overflow-hidden"`, `"flex-column"`
- `cardContentVariant`: Estilo do conteúdo interno (string, opcional)
  - Valores: `"with-description"`, `"with-charts"`, `"with-tables"`
- `useDescription`: Usar CardDescription (boolean, opcional)
- `components`: Componentes filhos (array, opcional)
- `condition`: Condição para renderizar (string, opcional)

#### NPSScoreCard

Card com score NPS.

```json
{
  "type": "npsScoreCard",
  "index": 0,
  "dataPath": "question.data"
}
```

#### TopCategoriesCards

Cards de categorias principais.

```json
{
  "type": "topCategoriesCards",
  "index": 0,
  "dataPath": "question.data.topCategoriesCards",
  "config": {
    "title": "Top 3 Categorias"
  }
}
```

#### KPICard

Card de KPI com métricas.

```json
{
  "type": "kpiCard",
  "index": 0,
  "dataPath": "sectionData.kpiData"
}
```

---

### Charts (Gráficos)

#### BarChart

Gráfico de barras horizontal.

```json
{
  "type": "barChart",
  "index": 0,
  "dataPath": "sectionData.dados",
  "config": {
    "dataKey": "percentage",
    "yAxisDataKey": "option",
    "sortData": true,
    "sortDirection": "desc",
    "hideXAxis": true
  }
}
```

#### SentimentDivergentChart

Gráfico divergente de sentimento.

```json
{
  "type": "sentimentDivergentChart",
  "index": 0,
  "dataPath": "sectionData.sentimentDivergentChart",
  "config": {
    "yAxisDataKey": "category",
    "showLegend": true
  }
}
```

#### SentimentDivergentChart

Gráfico divergente de sentimento.

```json
{
  "type": "sentimentDivergentChart",
  "index": 0,
  "dataPath": "sectionData.sentiment",
  "config": {
    "yAxisDataKey": "segment",
    "showLabels": true
  }
}
```

#### SentimentThreeColorChart

Gráfico de três cores de sentimento.

```json
{
  "type": "sentimentThreeColorChart",
  "index": 0,
  "dataPath": "sectionData.sentiment",
  "config": {
    "yAxisDataKey": "category"
  }
}
```

#### NPSStackedChart

Gráfico empilhado NPS.

```json
{
  "type": "npsStackedChart",
  "index": 0,
  "dataPath": "question.data.npsStackedChart",
  "config": {}
}
```

#### LineChart

Gráfico de linha temporal.

```json
{
  "type": "lineChart",
  "index": 0,
  "dataPath": "sectionData.timelineData",
  "config": {
    "dataKey": "value",
    "xAxisDataKey": "date"
  }
}
```

#### ParetoChart

Gráfico de Pareto.

```json
{
  "type": "paretoChart",
  "index": 0,
  "dataPath": "sectionData.paretoData",
  "config": {
    "dataKey": "value",
    "yAxisDataKey": "category"
  }
}
```

#### ScatterPlot

Gráfico de dispersão.

```json
{
  "type": "scatterPlot",
  "index": 0,
  "dataPath": "sectionData.scatterData",
  "config": {
    "xAxisDataKey": "x",
    "yAxisDataKey": "y",
    "dataKey": "value"
  }
}
```

#### Histogram

Histograma.

```json
{
  "type": "histogram",
  "index": 0,
  "dataPath": "sectionData.histogramData",
  "config": {
    "dataKey": "frequency",
    "xAxisDataKey": "bin"
  }
}
```

#### QuadrantChart

Gráfico de quadrantes.

```json
{
  "type": "quadrantChart",
  "index": 0,
  "dataPath": "sectionData.quadrantData",
  "config": {
    "xAxisDataKey": "x",
    "yAxisDataKey": "y"
  }
}
```

#### Heatmap

Mapa de calor.

```json
{
  "type": "heatmap",
  "index": 0,
  "dataPath": "sectionData.heatmapData",
  "config": {
    "xAxisDataKey": "x",
    "yAxisDataKey": "y",
    "dataKey": "value"
  }
}
```

#### SankeyDiagram

Diagrama de Sankey.

```json
{
  "type": "sankeyDiagram",
  "index": 0,
  "dataPath": "sectionData.sankeyData",
  "config": {}
}
```

#### StackedBarMECE

Barras empilhadas MECE.

```json
{
  "type": "stackedBarMECE",
  "index": 0,
  "dataPath": "sectionData.meceData",
  "config": {
    "yAxisDataKey": "category"
  }
}
```

#### EvolutionaryScorecard

Scorecard evolutivo.

```json
{
  "type": "evolutionaryScorecard",
  "index": 0,
  "dataPath": "sectionData.scorecardData",
  "config": {}
}
```

#### SlopeGraph

Gráfico de inclinação.

```json
{
  "type": "slopeGraph",
  "index": 0,
  "dataPath": "sectionData.slopeData",
  "config": {
    "xAxisDataKey": "period",
    "yAxisDataKey": "value"
  }
}
```

#### WaterfallChart

Gráfico cascata.

```json
{
  "type": "waterfallChart",
  "index": 0,
  "dataPath": "sectionData.waterfallData",
  "config": {
    "dataKey": "value",
    "xAxisDataKey": "category"
  }
}
```

### Tables (Tabelas)

#### RecommendationsTable

```json
{
  "type": "recommendationsTable",
  "index": 0,
  "dataPath": "sectionData.recommendationsTable"
}
```

#### SegmentationTable

```json
{
  "type": "segmentationTable",
  "index": 0,
  "dataPath": "sectionData.segmentationTable"
}
```

#### DistributionTable

```json
{
  "type": "distributionTable",
  "index": 0,
  "dataPath": "sectionData.distributionTable"
}
```

#### SentimentTable

```json
{
  "type": "sentimentTable",
  "index": 0,
  "dataPath": "sectionData.sentimentTable"
}
```

#### NPSDistributionTable

```json
{
  "type": "npsDistributionTable",
  "index": 0,
  "dataPath": "sectionData.npsDistribution"
}
```

#### NPSTable

```json
{
  "type": "npsTable",
  "index": 0,
  "dataPath": "sectionData.nps"
}
```

#### SentimentImpactTable

```json
{
  "type": "sentimentImpactTable",
  "index": 0,
  "dataPath": "sectionData.sentimentImpact"
}
```

#### PositiveCategoriesTable

```json
{
  "type": "positiveCategoriesTable",
  "index": 0,
  "dataPath": "sectionData.positiveCategories"
}
```

#### NegativeCategoriesTable

```json
{
  "type": "negativeCategoriesTable",
  "index": 0,
  "dataPath": "sectionData.negativeCategories"
}
```

#### AnalyticalTable

```json
{
  "type": "analyticalTable",
  "index": 0,
  "dataPath": "sectionData.analyticalData"
}
```

### Widgets

#### QuestionsList

Lista de questões com filtros.

```json
{
  "type": "questionsList",
  "index": 0,
  "dataPath": "sectionData",
  "config": {
    "hideFilterPills": false,
    "hideWordCloudToggle": false
  }
}
```

#### FilterPills

Pills de filtro.

```json
{
  "type": "filterPills",
  "index": 0,
  "config": {
    "showWordCloudToggle": true
  }
}
```

#### WordCloud

Nuvem de palavras.

```json
{
  "type": "wordCloud",
  "index": 0,
  "dataPath": "question.data.wordCloud",
  "config": {
    "title": "Nuvem de Palavras"
  }
}
```

#### Accordion

Acordeão expansível para organizar conteúdo.

```json
{
  "type": "accordion",
  "index": 0,
  "title": "Título do Acordeão",
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Conteúdo dentro do acordeão"
    }
  ]
}
```

**Propriedades:**

- `type`: `"accordion"` (obrigatório)
- `index`: Ordem (number, opcional)
- `title`: Título do acordeão (string, opcional)
- `components`: Componentes filhos (array, opcional)

### Containers e Headings

#### Container

Container flexível.

```json
{
  "type": "container",
  "index": 0,
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Card 1"
    }
  ]
}
```

#### Grid Container

Container em grid.

```json
{
  "type": "grid-container",
  "index": 0,
  "className": "grid gap-6 md:grid-cols-2",
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Card 1"
    },
    {
      "type": "card",
      "index": 1,
      "title": "Card 2"
    }
  ]
}
```

**Propriedades:**

- `type`: `"grid-container"` (obrigatório)
- `index`: Ordem (number, opcional)
- `components`: Componentes filhos (array, opcional)
- `className`: Classes CSS para o grid (string, opcional) - padrão: `"grid gap-6 md:grid-cols-2"`

#### Headings (h3, h4)

Componentes de cabeçalho para organizar conteúdo.

```json
{
  "type": "h3",
  "index": 0,
  "text": "Título da Seção"
}
```

ou com componentes aninhados:

```json
{
  "type": "h3",
  "index": 0,
  "text": "Respostas",
  "components": [
    {
      "type": "npsDistributionTable",
      "index": 1,
      "dataPath": "sectionData.department.npsDistributionTable"
    }
  ]
}
```

**Propriedades:**

- `type`: `"h3"` ou `"h4"` (obrigatório)
- `index`: Ordem (number, opcional)
- `text`: Texto do cabeçalho (string, suporta templates, opcional)
- `components`: Componentes filhos (array, opcional)
- `wrapperProps`: Props adicionais para o elemento (object, opcional)

````

**📖 Veja `CHARTS_JSON_REFERENCE.md` para documentação completa de todos os gráficos com exemplos detalhados.**

---

## 🔗 Templates e Referências

Use `{{path}}` para referenciar dados dinamicamente.

### Contextos Disponíveis

1. **`uiTexts`**: Textos da interface

   ```json
   "title": "{{uiTexts.executiveReport.aboutStudy}}"
````

2. **`sectionData`**: Dados da seção atual

   ```json
   "text": "{{sectionData.summary.aboutStudy}}"
   ```

3. **`currentAttribute`**: Atributo atual (em seções de atributos)

   ```json
   "title": "{{currentAttribute.name}}"
   ```

4. **`question`**: Questão atual (em listas de questões)

   ```json
   "condition": "question.questionType === 'nps'"
   ```

5. **`surveyInfo`**: Informações gerais
   ```json
   "dataPath": "surveyInfo"
   ```

---

## ⚙️ Condições

Use condições para renderizar componentes condicionalmente.

### Sintaxe

```json
{
  "condition": "question.questionType === 'nps'"
}
```

### Operadores disponíveis

- `===` (igualdade)
- `!==` (desigualdade)
- `&&` (E)
- `||` (OU)
- `!` (negação)

### Exemplos

```json
{
  "condition": "question.questionType === 'nps'"
}
```

```json
{
  "condition": "question.questionType === 'open-ended' && question.data.wordCloud && showWordCloud"
}
```

```json
{
  "condition": "currentAttribute.npsSummary"
}
```

Valores truthy/falsy são avaliados automaticamente.

---

## 📊 Estruturas de Dados

As estruturas de dados abaixo são **exemplos simplificados**. Os dados reais podem ser muito mais verbosos, então mantenha-os separados dos componentes em `data` no JSON.

### Distribuição

```json
{
  "distribution": [
    {
      "segment": "Pré-pago",
      "count": 37,
      "percentage": 37
    }
  ]
}
```

### Sentimento

```json
{
  "sentiment": [
    {
      "segment": "Controle",
      "positive": 24.3,
      "neutral": 0.7,
      "negative": 75
    }
  ]
}
```

### NPS

```json
{
  "nps": [
    {
      "segment": "Controle",
      "nps": -22.8
    }
  ],
  "npsDistribution": [
    {
      "segment": "Controle",
      "promotores": 28.6,
      "neutros": 20,
      "detratores": 51.4
    }
  ]
}
```

### Recomendações

```json
{
  "recommendations": [
    {
      "id": 1,
      "recommendation": "Atualize a Infraestrutura de Rede",
      "severity": "high",
      "stakeholders": ["Engenharia de Redes", "Operações de Rede"],
      "tasks": [
        {
          "task": "Realizar avaliação da infraestrutura",
          "owner": "Engenharia de Redes"
        }
      ]
    }
  ]
}
```

### Segmentação

```json
{
  "segmentation": [
    {
      "cluster": "Campeão em Treinamento de IA",
      "description": "Adotante entusiasmado...",
      "percentage": 38.5,
      "id": 1,
      "characteristics": ["Foco em treinamento", "Alto engajamento com IA"]
    }
  ]
}
```

### Questões

Ver seção [Gerenciando Questões](#gerenciando-questões) para exemplos completos.

### Word Cloud

```json
{
  "wordCloud": [
    { "text": "confiabilidade", "value": 51 },
    { "text": "rede", "value": 48 }
  ]
}
```

### Top Categories Cards

```json
{
  "topCategoriesCards": [
    {
      "rank": 1,
      "category": "Serviço de rede",
      "mentions": 67,
      "percentage": 100,
      "topics": [
        {
          "topic": "agilidade no atendimento",
          "sentiment": "positive"
        }
      ]
    }
  ]
}
```

**Nota:** Para questões `open-ended`, use `topCategoriesCards` (não `topCategories`) dentro de `data`.

**Nota:** Mantenha os dados separados dos componentes porque podem ser muito verbosos. Os componentes definem a estrutura de renderização, enquanto os dados ficam em `data`.

---

## ❓ FAQ

### Como adicionar uma nova seção?

1. Adicione em `sections`:

```json
{
  "id": "nova-secao",
  "index": 5,
  "name": "Nova Seção",
  "icon": "BarChart3",
  "subsections": [
    {
      "id": "nova-subsecao",
      "index": 0,
      "name": "Nova Subseção",
      "icon": "FileText",
      "components": [
        {
          "type": "card",
          "index": 0,
          "title": "Título",
          "text": "Conteúdo"
        }
      ]
    }
  ],
  "data": {
    "meusDados": "Dados aqui"
  }
}
```

2. Adicione os dados em `data` (separados dos componentes)
3. Adicione os textos em `uiTexts`

### Como criar uma subseção?

1. Adicione em `subsections` com `components` diretamente:

```json
{
  "id": "nova-subsecao",
  "index": 0,
  "name": "Nova Subseção",
  "icon": "FileText",
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Título",
      "text": "Conteúdo"
    }
  ]
}
```

2. Adicione os dados necessários em `data` da seção

### Como adicionar ou remover questões?

- **Adicionar:** Adicione um objeto ao array `questions` na seção `responses` (não em `data.questions`)
- **Remover:** Remova o objeto do array `questions`

**⚠️ Importante:** Use `questionType` (não `type`) para questões. Veja a seção [Gerenciando Questões](#gerenciando-questões) para detalhes.

### Onde ficam as traduções que não mudam?

As traduções estáticas ficam em `uiTexts` no nível raiz do JSON. Cada seção também pode ter seus próprios textos em `data.uiTexts`. Veja a seção [Traduções e Textos da Interface](#traduções-e-textos-da-interface).

### Quais ícones posso usar?

Ícones comuns: `FileText`, `BarChart3`, `Heart`, `Target`, `Users2`, `Layers`, `Building`, `MapPin`, `GraduationCap`, `MessageSquare`, `Download`, `AlertTriangle`, `ClipboardList`, `TrendingUp`, `Percent`, `HelpCircle`.

Os ícones são do Lucide React. Consulte a documentação para mais opções.

### Como referenciar dados de outra seção?

Use `dataPath` com o caminho completo:

```json
{
  "dataPath": "sections[0].data.summary"
}
```

### Como criar um gráfico?

1. Prepare os dados em `data` (separados dos componentes)
2. Use o componente com `dataPath` em `subsections[].components`:

```json
{
  "subsections": [
    {
      "id": "grafico-subsecao",
      "index": 0,
      "name": "Gráfico",
      "icon": "BarChart3",
      "components": [
        {
          "type": "barChart",
          "index": 0,
          "dataPath": "sectionData.dados",
          "config": {
            "dataKey": "percentage",
            "yAxisDataKey": "label"
          }
        }
      ]
    }
  ],
  "data": {
    "dados": [{ "label": "Opção A", "value": 100, "percentage": 50 }]
  }
}
```

**💡 Dica:** Mesmo que um tipo de gráfico não esteja no JSON atual, o código processa e renderiza qualquer tipo registrado no ComponentRegistry. Veja a lista completa de componentes disponíveis na seção [Componentes Disponíveis](#componentes-disponíveis).

### Como adicionar textos em múltiplos idiomas?

Crie um JSON separado para cada idioma:

- `surveyData.pt-BR.json`
- `surveyData.en-US.json`

Mantenha a mesma estrutura, alterando apenas `uiTexts` e `metadata.language`.

### Como usar condições complexas?

Combine operadores:

```json
{
  "condition": "question.questionType === 'open-ended' && question.data.wordCloud && showWordCloud"
}
```

### Como aninhar componentes?

Use `components`:

```json
{
  "type": "card",
  "title": "Card Principal",
  "components": [
    {
      "type": "barChart",
      "dataPath": "sectionData.dados"
    }
  ]
}
```

### Como criar uma seção sem subseções?

Use `components` diretamente na seção:

```json
{
  "id": "secao-simples",
  "index": 0,
  "name": "Seção Simples",
  "icon": "FileText",
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Conteúdo",
      "text": "Texto do card"
    }
  ],
  "data": {
    "meusDados": "Dados aqui"
  }
}
```

### E o item Export?

O **Export não fica em `sections`**. Só é preciso ter **`uiTexts.export`** com os textos (ex.: `title`, `description`, `exportFullReport`, etc.). O app injeta o item no fim do menu usando `uiTexts.export.title` e ícone "Download". A página de Export usa as seções de `sections` para montar as opções. A rota /export é sempre oferecida pelo app.

```json
"uiTexts": {
  "export": {
    "title": "Export de Dados",
    "description": "Exporte os dados da pesquisa em diferentes formatos",
    "exportFullReport": "Exportar Relatório Completo",
    "selectSpecificSections": "Selecionar Seções Específicas",
    "exportAsPDF": "Exportar como PDF",
    "exportAsPPT": "Exportar como PPT",
    "selectAtLeastOneSection": "Selecione pelo menos uma seção"
  }
}
```

### Quais são os styleVariants disponíveis?

#### `cardStyleVariant` (estilo do card)

- `default`: Estilo padrão do card
- `highlight`: Card com destaque visual
- `border-left`: Card com borda destacada à esquerda
- `overflow-hidden`: Card com overflow oculto (útil para tabelas)
- `flex-column`: Card com layout em coluna

#### `cardContentVariant` (estilo do conteúdo interno)

- `with-description`: Layout otimizado para conteúdo descritivo
- `with-charts`: Layout otimizado para exibir gráficos
- `with-tables`: Layout otimizado para exibir tabelas

**⚠️ Mudança:** `styleVariant` foi renomeado para `cardStyleVariant` e `textStyleVariant` foi renomeado para `cardContentVariant`.

**Nota:** `cardStyleVariant` e `cardContentVariant` são propriedades diferentes e podem ser usadas juntas.

---

## 💡 Exemplos

### Exemplo 1: Seção Simples

```json
{
  "sections": [
    {
      "id": "exemplo-simples",
      "index": 0,
      "name": "Exemplo Simples",
      "icon": "FileText",
      "subsections": [
        {
          "id": "exemplo-subsecao",
          "index": 0,
          "name": "Subseção de Exemplo",
          "icon": "ClipboardList",
          "components": [
            {
              "type": "card",
              "index": 0,
              "title": "Título do Card",
              "text": "Esta é uma descrição de exemplo.",
              "cardStyleVariant": "default"
            }
          ]
        }
      ],
      "data": {
        "descricao": "Esta é uma descrição de exemplo."
      }
    }
  ],
  "uiTexts": {
    "exemplo": {
      "titulo": "Título de Exemplo"
    }
  }
}
```

### Exemplo 2: Seção com Gráfico

```json
{
  "sections": [
    {
      "id": "exemplo-grafico",
      "index": 1,
      "name": "Exemplo com Gráfico",
      "icon": "BarChart3",
      "subsections": [
        {
          "id": "grafico-subsecao",
          "index": 0,
          "name": "Gráfico",
          "icon": "TrendingUp",
          "components": [
            {
              "type": "card",
              "index": 0,
              "title": "Análise de Dados",
              "cardStyleVariant": "flex-column",
              "cardContentVariant": "with-charts",
              "components": [
                {
                  "type": "barChart",
                  "index": 0,
                  "dataPath": "sectionData.dados",
                  "config": {
                    "dataKey": "percentage",
                    "yAxisDataKey": "label",
                    "sortData": true,
                    "sortDirection": "desc"
                  }
                }
              ]
            }
          ]
        }
      ],
      "data": {
        "dados": [
          { "label": "Opção A", "value": 100, "percentage": 50 },
          { "label": "Opção B", "value": 50, "percentage": 25 }
        ]
      }
    }
  ]
}
```

**Nota:** Os dados (`dados`) estão separados dos componentes porque podem ser verbosos.

### Exemplo 3: Seção com Questões

```json
{
  "sections": [
    {
      "id": "responses",
      "index": 4,
      "name": "Análise por Questão",
      "icon": "MessageSquare",
      "questions": [
        {
          "id": 1,
          "index": 1,
          "questionType": "nps",
          "question": "Qual é a probabilidade de você recomendar...",
          "icon": "Percent",
          "summary": "Resumo...",
          "data": {
            "npsScore": 35,
            "npsStackedChart": [
              {
                "option": "Detrator",
                "value": 636,
                "percentage": 51
              },
              {
                "option": "Promotor",
                "value": 374,
                "percentage": 30
              },
              {
                "option": "Neutro",
                "value": 237,
                "percentage": 19
              }
            ]
          }
        }
      ],
      "components": [],
      "data": {
        "config": {
          "npsCategories": {
            "detractor": "Detrator",
            "promoter": "Promotor",
            "neutral": "Neutro"
          }
        }
      }
    }
  ]
}
```

**⚠️ Importante:** As questões usam `questionType` (não `type`). Os componentes são gerados automaticamente baseados no `questionType`.

---

## 📝 Notas

### Ícones

Os ícones são do Lucide React. Consulte a documentação para ver todos os ícones disponíveis.

### Componentes Customizados

Novos tipos de componentes devem ser criados no código, não no JSON.

### Separação de Dados

Mantenha os dados separados dos componentes em `data` porque podem ser muito verbosos. Os componentes estão diretamente em `subsections[].components` ou `components` na seção.

### Estrutura Atual

**⚠️ Mudança importante:** Não há mais `renderSchema`. A estrutura atual é:

- Componentes diretamente em `subsections[].components`
- Dados separados em `data` da seção
- Questões diretamente em `questions` (na seção `responses`)

---

**Versão do formato:** 1.0

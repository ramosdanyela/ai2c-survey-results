# 📚 Documentação: surveyData.json

## 📋 Índice

1. [Estrutura do JSON](#estrutura-do-json)
2. [Criando uma Seção](#criando-uma-seção)
3. [Criando uma Subseção](#criando-uma-subseção)
4. [Componentes Disponíveis](#componentes-disponíveis)
5. [Templates e Referências](#templates-e-referências)
6. [Condições](#condições)
7. [Estruturas de Dados](#estruturas-de-dados)
8. [FAQ](#faq)
9. [Exemplos](#exemplos)

---

## 📐 Estrutura do JSON

O arquivo `surveyData.json` tem a seguinte estrutura:

```json
{
  "metadata": { ... },
  "sectionsConfig": { ... },
  "components": { ... },
  "uiTexts": { ... },
  "surveyInfo": { ... }
}
```

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
```

**Campos obrigatórios:**

- `version`: Versão do formato (string)
- `language`: Idioma (string: "pt-BR", "en-US", etc.)
- `surveyId`: ID único (string)

---

### 2. `sectionsConfig`

Define as seções da pesquisa.

```json
{
  "sectionsConfig": {
    "sections": [
      {
        "id": "executive",
        "index": 0,
        "name": "Relatório Executivo",
        "icon": "FileText",
        "hasSchema": true,
        "subsections": [ ... ],
        "data": { ... }
      }
    ]
  }
}
```

**Campos da seção:**

- `id` (obrigatório): ID único, sem espaços (string)
- `index` (obrigatório): Ordem de exibição, começa em 0 (number)
- `name` (obrigatório): Nome exibido na interface (string)
- `icon` (obrigatório): Nome do ícone (string)
- `hasSchema` (obrigatório): Se tem schema de renderização (boolean)
- `subsections` (opcional): Array de subseções
- `data` (obrigatório se `hasSchema: true`): Dados e schema
- `isRoute` (opcional): Se é rota especial (boolean)
- `hasSubsections` (opcional): Se tem subseções (boolean)

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
    "npsCategory": "Ruim",
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
- `npsCategory`: Categoria (string: "Excelente", "Bom", "Regular", "Ruim")
- `questions`: Número de questões (number)

---

### 4. `uiTexts`

Todos os textos da interface.

```json
{
  "uiTexts": {
    "executiveReport": {
      "executiveSummary": "Sumário Executivo",
      "aboutStudy": "Sobre o Estudo"
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

Organize os textos por contexto/seção. Use chaves descritivas em camelCase.

---

## 🏗️ Criando uma Seção

### Passo 1: Adicionar em `sectionsConfig.sections`

```json
{
  "sectionsConfig": {
    "sections": [
      {
        "id": "minha-secao",
        "index": 0,
        "name": "Minha Seção",
        "icon": "BarChart3",
        "hasSchema": true,
        "subsections": [
          {
            "id": "minha-subsecao",
            "index": 0,
            "name": "Minha Subseção",
            "icon": "TrendingUp"
          }
        ]
      }
    ]
  }
}
```

### Passo 2: Criar o schema de renderização

```json
{
  "data": {
    "renderSchema": {
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
              "title": "{{uiTexts.minhaSecao.titulo}}",
              "content": "{{sectionData.descricao}}",
              "styleVariant": "default"
            }
          ]
        }
      ]
    }
  }
}
```

### Passo 3: Adicionar os dados

```json
{
  "data": {
    "renderSchema": { ... },
    "descricao": "Esta é a descrição da minha seção",
    "dados": [
      { "label": "Item 1", "value": 100 },
      { "label": "Item 2", "value": 200 }
    ]
  }
}
```

### Passo 4: Adicionar textos em `uiTexts`

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

### Subseção simples

```json
{
  "subsections": [
    {
      "id": "subsecao-1",
      "index": 0,
      "name": "Subseção 1",
      "icon": "FileText"
    }
  ]
}
```

### Subseção com componentes

```json
{
  "renderSchema": {
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
            "content": "Conteúdo do card",
            "styleVariant": "default"
          }
        ]
      }
    ]
  }
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
      "content": "Conteúdo 1"
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

## 🧩 Componentes Disponíveis

### Card

Exibe conteúdo com título e corpo.

```json
{
  "type": "card",
  "index": 0,
  "title": "{{uiTexts.titulo}}",
  "content": "{{sectionData.conteudo}}",
  "styleVariant": "default",
  "components": [ ... ]
}
```

**Propriedades:**

- `type`: `"card"` (obrigatório)
- `index`: Ordem (number, opcional)
- `title`: Título (string, suporta templates)
- `content`: Conteúdo (string, suporta templates)
- `styleVariant`: Estilo (string: "default", "highlight", "border-left", etc.)
- `contentStyleVariant`: Estilo do conteúdo (string, opcional)
- `useDescription`: Usar CardDescription (boolean, opcional)
- `components`: Componentes filhos (array, opcional)
- `condition`: Condição para renderizar (string, opcional)

---

### BarChart

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

**Estrutura de dados:**

```json
[
  { "option": "Opção 1", "value": 100, "percentage": 50 },
  { "option": "Opção 2", "value": 50, "percentage": 25 }
]
```

---

### SentimentDivergentChart

Gráfico divergente de sentimento.

```json
{
  "type": "sentimentDivergentChart",
  "index": 0,
  "dataPath": "sectionData.sentimentAnalysis.data",
  "config": {
    "yAxisDataKey": "category",
    "showLegend": true
  }
}
```

**Estrutura de dados:**

```json
[
  {
    "category": "Serviço de rede",
    "positive": 10.5,
    "neutral": 51.4,
    "negative": 38.1
  }
]
```

---

### SentimentStackedChart

Gráfico empilhado de sentimento.

```json
{
  "type": "sentimentStackedChart",
  "index": 0,
  "dataPath": "currentAttribute.sentiment",
  "config": {
    "yAxisDataKey": "segment",
    "showLabels": true
  }
}
```

**Estrutura de dados:**

```json
[
  {
    "segment": "Controle",
    "positive": 24.3,
    "neutral": 0.7,
    "negative": 75
  }
]
```

---

### NPSStackedChart

Gráfico empilhado NPS.

```json
{
  "type": "npsStackedChart",
  "index": 0,
  "dataPath": "question.data",
  "config": {
    "hideXAxis": true
  }
}
```

**Estrutura de dados:**

```json
[
  { "option": "Detrator", "value": 636, "percentage": 51 },
  { "option": "Promotor", "value": 374, "percentage": 30 },
  { "option": "Neutro", "value": 237, "percentage": 19 }
]
```

---

### NPSScoreCard

Card com score NPS.

```json
{
  "type": "npsScoreCard",
  "index": 0,
  "dataPath": "surveyInfo"
}
```

Usa dados de `surveyInfo` automaticamente.

---

### WordCloud

Nuvem de palavras.

```json
{
  "type": "wordCloud",
  "index": 0,
  "dataPath": "question.wordCloud",
  "config": {
    "title": "{{uiTexts.responseDetails.wordCloud}}",
    "useStaticImage": true,
    "staticImagePath": "/nuvem.png"
  }
}
```

**Estrutura de dados:**

```json
[
  { "text": "confiabilidade", "value": 51 },
  { "text": "rede", "value": 48 }
]
```

---

### Tables

#### RecommendationsTable

```json
{
  "type": "recommendationsTable",
  "index": 0,
  "dataPath": "sectionData.recommendations",
  "severityLabelsPath": "uiTexts.severityLabels"
}
```

#### SegmentationTable

```json
{
  "type": "segmentationTable",
  "index": 0,
  "dataPath": "sectionData.segmentation"
}
```

#### DistributionTable

```json
{
  "type": "distributionTable",
  "index": 0,
  "dataPath": "currentAttribute.distribution"
}
```

#### SentimentTable

```json
{
  "type": "sentimentTable",
  "index": 0,
  "dataPath": "currentAttribute.sentiment"
}
```

#### NPSTable

```json
{
  "type": "npsTable",
  "index": 0,
  "dataPath": "currentAttribute.nps"
}
```

---

### Wrapper

Agrupa outros componentes.

```json
{
  "wrapper": "div",
  "wrapperProps": {},
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

**Propriedades:**

- `wrapper`: Tag HTML (string, obrigatório)
- `wrapperProps`: Props do wrapper (object, opcional)
- `components`: Componentes filhos (array, opcional)
- `content`: Conteúdo de texto (string, suporta templates, opcional)
- `index`: Ordem (number, opcional)
- `condition`: Condição (string, opcional)

---

### QuestionsList

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

---

### FilterPills

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

---

## 🔗 Templates e Referências

Use `{{path}}` para referenciar dados dinamicamente.

### Contextos Disponíveis

1. **`uiTexts`**: Textos da interface

   ```json
   "title": "{{uiTexts.executiveReport.aboutStudy}}"
   ```

2. **`sectionData`**: Dados da seção atual

   ```json
   "content": "{{sectionData.summary.aboutStudy}}"
   ```

3. **`currentAttribute`**: Atributo atual (em seções de atributos)

   ```json
   "title": "{{currentAttribute.name}}"
   ```

4. **`question`**: Questão atual (em listas de questões)

   ```json
   "condition": "question.type === 'nps'"
   ```

5. **`surveyInfo`**: Informações gerais
   ```json
   "dataPath": "surveyInfo"
   ```

### Exemplos

```json
{
  "title": "{{uiTexts.executiveReport.aboutStudy}}",
  "content": "{{sectionData.summary.aboutStudy}}",
  "dataPath": "sectionData.recommendations"
}
```

---

## ⚙️ Condições

Use condições para renderizar componentes condicionalmente.

### Sintaxe

```json
{
  "condition": "question.type === 'nps'"
}
```

### Operadores

- `===` (igualdade)
- `!==` (desigualdade)
- `&&` (E)
- `||` (OU)
- `!` (negação)

### Exemplos

```json
{
  "condition": "question.type === 'nps'"
}
```

```json
{
  "condition": "question.type === 'open' && question.wordCloud && showWordCloud"
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

```json
{
  "questions": [
    {
      "id": 1,
      "index": 1,
      "question": "Qual é a probabilidade de você recomendar...",
      "icon": "Percent",
      "summary": "Com 51% dos entrevistados...",
      "data": [
        {
          "option": "Detrator",
          "value": 636,
          "percentage": 51
        }
      ],
      "type": "nps"
    }
  ]
}
```

### Word Cloud

```json
{
  "wordCloud": [
    { "text": "confiabilidade", "value": 51 },
    { "text": "rede", "value": 48 }
  ]
}
```

### Top Categories

```json
{
  "topCategories": [
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

---

## ❓ FAQ

### Como adicionar uma nova seção?

1. Adicione em `sectionsConfig.sections`:

```json
{
  "id": "nova-secao",
  "index": 5,
  "name": "Nova Seção",
  "icon": "BarChart3",
  "hasSchema": true,
  "subsections": [ ... ]
}
```

2. Adicione o schema em `data.renderSchema`
3. Adicione os dados em `data`
4. Adicione os textos em `uiTexts`

### Como criar uma subseção?

1. Adicione em `subsections`:

```json
{
  "id": "nova-subsecao",
  "index": 0,
  "name": "Nova Subseção",
  "icon": "FileText"
}
```

2. Adicione o schema correspondente em `renderSchema.subsections`
3. Adicione os dados necessários

### Quais ícones posso usar?

Ícones comuns: `FileText`, `BarChart3`, `Heart`, `Target`, `Users2`, `Layers`, `Building`, `MapPin`, `GraduationCap`, `MessageSquare`, `Download`, `AlertTriangle`, `ClipboardList`, `TrendingUp`, `Percent`, `HelpCircle`.

Os ícones são do Lucide React. Consulte a documentação para mais opções.

### Como referenciar dados de outra seção?

Use `dataPath` com o caminho completo:

```json
{
  "dataPath": "sectionsConfig.sections[0].data.summary"
}
```

### Como criar um gráfico?

1. Prepare os dados:

```json
{
  "dados": [{ "label": "A", "value": 100, "percentage": 50 }]
}
```

2. Use o componente:

```json
{
  "type": "barChart",
  "dataPath": "sectionData.dados",
  "config": {
    "dataKey": "percentage",
    "yAxisDataKey": "label"
  }
}
```

### Como adicionar textos em múltiplos idiomas?

Crie um JSON separado para cada idioma:

- `surveyData.pt-BR.json`
- `surveyData.en-US.json`

Mantenha a mesma estrutura, alterando apenas `uiTexts` e `metadata.language`.

### Como usar condições complexas?

Combine operadores:

```json
{
  "condition": "question.type === 'open' && question.wordCloud && showWordCloud"
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

Use `hasSubsections: false` e `components` diretamente:

```json
{
  "id": "secao-simples",
  "hasSchema": true,
  "hasSubsections": false,
  "data": {
    "renderSchema": {
      "components": [
        {
          "type": "card",
          "title": "Conteúdo"
        }
      ]
    }
  }
}
```

### Como criar uma seção de rota especial?

Use `isRoute: true`:

```json
{
  "id": "export",
  "index": 4,
  "name": "Export",
  "icon": "Download",
  "isRoute": true
}
```

### Quais são os styleVariants disponíveis?

- `default`: Padrão
- `highlight`: Destaque
- `border-left`: Borda esquerda
- `overflow-hidden`: Overflow oculto
- `flex-column`: Layout em coluna
- `with-description`: Com descrição
- `with-charts`: Com gráficos
- `with-tables`: Com tabelas

---

## 💡 Exemplos

### Exemplo 1: Seção Simples

```json
{
  "sectionsConfig": {
    "sections": [
      {
        "id": "exemplo-simples",
        "index": 0,
        "name": "Exemplo Simples",
        "icon": "FileText",
        "hasSchema": true,
        "subsections": [
          {
            "id": "exemplo-subsecao",
            "index": 0,
            "name": "Subseção de Exemplo",
            "icon": "ClipboardList"
          }
        ],
        "data": {
          "renderSchema": {
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
                    "title": "{{uiTexts.exemplo.titulo}}",
                    "content": "{{sectionData.descricao}}",
                    "styleVariant": "default"
                  }
                ]
              }
            ]
          },
          "descricao": "Esta é uma descrição de exemplo."
        }
      }
    ]
  },
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
  "id": "exemplo-grafico",
  "index": 1,
  "name": "Exemplo com Gráfico",
  "icon": "BarChart3",
  "hasSchema": true,
  "subsections": [
    {
      "id": "grafico-subsecao",
      "index": 0,
      "name": "Gráfico",
      "icon": "TrendingUp"
    }
  ],
  "data": {
    "renderSchema": {
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
              "title": "{{uiTexts.grafico.titulo}}",
              "styleVariant": "with-charts",
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
      ]
    },
    "dados": [
      { "label": "Opção A", "value": 100, "percentage": 50 },
      { "label": "Opção B", "value": 50, "percentage": 25 }
    ]
  }
}
```

### Exemplo 3: Seção com Múltiplos Componentes

```json
{
  "id": "exemplo-multiplo",
  "index": 2,
  "name": "Exemplo Múltiplo",
  "icon": "Layers",
  "hasSchema": true,
  "subsections": [
    {
      "id": "multiplo-subsecao",
      "index": 0,
      "name": "Múltiplos Componentes",
      "icon": "FileText"
    }
  ],
  "data": {
    "renderSchema": {
      "subsections": [
        {
          "id": "multiplo-subsecao",
          "index": 0,
          "name": "Múltiplos Componentes",
          "icon": "FileText",
          "components": [
            {
              "type": "card",
              "index": 0,
              "title": "Card 1",
              "content": "Conteúdo do primeiro card",
              "styleVariant": "default"
            },
            {
              "wrapper": "div",
              "wrapperProps": {},
              "index": 1,
              "components": [
                {
                  "type": "card",
                  "index": 0,
                  "title": "Card 2",
                  "styleVariant": "highlight"
                },
                {
                  "type": "card",
                  "index": 1,
                  "title": "Card 3",
                  "styleVariant": "border-left"
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

### Exemplo 4: Seção com Condições

```json
{
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Card Sempre Visível",
      "content": "Este card sempre aparece"
    },
    {
      "type": "barChart",
      "index": 1,
      "dataPath": "sectionData.dados",
      "condition": "sectionData.dados && sectionData.dados.length > 0",
      "config": {
        "dataKey": "value",
        "yAxisDataKey": "label"
      }
    }
  ]
}
```

---

## 📝 Notas

### Ícones

Os ícones são do Lucide React. Consulte a documentação para ver todos os ícones disponíveis.

### Componentes Customizados

Novos tipos de componentes devem ser criados no código, não no JSON.

---

**Versão do formato:** 1.0

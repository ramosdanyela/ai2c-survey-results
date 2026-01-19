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
  "sectionsConfig": { ... },
  "components": { ... },
  "uiTexts": { ... },
  "surveyInfo": { ... }
}
```

### Visão Geral dos Campos Principais

- **`metadata`**: Informações básicas sobre a pesquisa (versão, idioma, ID)
- **`sectionsConfig`**: Define todas as seções, subseções e seus schemas de renderização
- **`components`**: (Opcional) Documentação dos tipos de componentes disponíveis
- **`uiTexts`**: Textos estáticos da interface que não mudam com os dados da pesquisa
- **`surveyInfo`**: Informações gerais da pesquisa (título, empresa, período, NPS, etc.)

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

### 2. `sectionsConfig`

Define as seções da pesquisa. Cada seção pode ter subseções e um schema de renderização que define como os componentes são exibidos.

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
        "subsections": [
          {
            "id": "executive-summary",
            "index": 0,
            "name": "Sumário Executivo",
            "icon": "ClipboardList"
          }
        ],
        "data": {
          "renderSchema": { ... },
          "summary": { ... }
        }
      }
    ]
  }
}
```

**Campos da seção:**

- `id` (obrigatório): ID único, sem espaços (string)
- `index` (obrigatório): Ordem de exibição, começa em 0 (number)
- `name` (obrigatório): Nome exibido na interface (string)
- `icon` (obrigatório): Nome do ícone do Lucide React (string)
- `hasSchema` (obrigatório): Se tem schema de renderização (boolean)
- `subsections` (opcional): Array de subseções
- `data` (obrigatório se `hasSchema: true`): Dados e schema de renderização
- `isRoute` (opcional): Se é rota especial (boolean)
- `hasSubsections` (opcional): Se tem subseções (boolean)
- `defaultExpanded` (opcional): Se a seção inicia expandida no sidebar (boolean)

**Importante:** O `name` das subseções pode ser definido tanto em `subsections` quanto em `renderSchema.subsections`. Como o código é programático, você pode colocar o `name` diretamente junto com os componentes no `renderSchema`, evitando duplicação.

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
      "openField": "Campo Aberto",
      "multipleChoice": "Múltipla Escolha",
      "nps": "NPS"
    }
  }
}
```

**Nota sobre traduções:** Todos os textos da interface devem estar em `uiTexts` no JSON. O código utiliza o hook `useSurveyData()` para acessar esses dados, garantindo uma única fonte de verdade. Para adicionar novos textos, adicione em `uiTexts` no JSON.

**Textos específicos de seção:** Cada seção pode ter seus próprios `uiTexts` dentro de `data.uiTexts`. Estes textos têm precedência sobre os textos globais em `uiTexts`.

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

O `renderSchema` define como os componentes são renderizados. **O `name` pode ser colocado diretamente aqui junto com os componentes**, evitando duplicação:

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

**Nota:** Como o código é programático, você não precisa duplicar o `name` em `subsections` e `renderSchema.subsections`. Coloque o `name` apenas no `renderSchema` se preferir.

### Passo 3: Adicionar os dados

Os dados específicos da pesquisa ficam em `data`, separados do `renderSchema`:

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

### Subseção com componentes

Como o código é programático, você pode definir o `name` diretamente no `renderSchema` junto com os componentes:

```json
{
  "data": {
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

## ❓ Gerenciando Questões

### Onde ficam as questões?

As questões ficam dentro da seção `responses` (ou qualquer seção que use `questionsList`), em `data.questions`:

```json
{
  "sectionsConfig": {
    "sections": [
      {
        "id": "responses",
        "data": {
          "questions": [
            {
              "id": 1,
              "index": 1,
              "question": "Qual é a probabilidade de você recomendar...",
              "icon": "Percent",
              "summary": "Com 51% dos entrevistados...",
              "data": [ ... ],
              "type": "nps"
            }
          ]
        }
      }
    ]
  }
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
      "question": "Pergunta existente",
      "type": "nps"
    },
    {
      "id": 7,
      "index": 7,
      "question": "Nova pergunta",
      "icon": "HelpCircle",
      "summary": "Resumo da nova pergunta",
      "data": [
        {
          "option": "Opção 1",
          "value": 100,
          "percentage": 50
        }
      ],
      "type": "closed"
    }
  ]
}
```

**Campos obrigatórios de uma questão:**

- `id`: ID único (number)
- `index`: Ordem de exibição (number)
- `question`: Texto da pergunta (string)
- `type`: Tipo da questão - `"nps"`, `"closed"`, ou `"open"` (string)

**Campos opcionais:**

- `icon`: Nome do ícone (string)
- `summary`: Resumo da questão (string)
- `data`: Dados da questão (array) - estrutura varia conforme o tipo
- `wordCloud`: Dados da nuvem de palavras (array) - para questões `"open"`
- `sentimentData`: Dados de sentimento (array) - para questões `"open"`
- `topCategories`: Categorias principais (array) - para questões `"open"`

### Remover/Ocultar uma questão

Para ocultar uma questão sem removê-la do JSON, use `config.questions.hiddenIds`:

```json
{
  "data": {
    "questions": [ ... ],
    "config": {
      "questions": {
        "hiddenIds": [3, 5]
      }
    }
  }
}
```

As questões com IDs em `hiddenIds` não serão exibidas na interface, mas permanecem no JSON.

**Para remover completamente:** Simplesmente remova o objeto do array `questions`.

### Estrutura de uma questão por tipo

#### Questão NPS (`type: "nps"`)

```json
{
  "id": 1,
  "index": 1,
  "question": "Qual é a probabilidade de você recomendar...",
  "icon": "Percent",
  "summary": "Resumo...",
  "data": [
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
  ],
  "type": "nps"
}
```

#### Questão Fechada (`type: "closed"`)

```json
{
  "id": 2,
  "index": 2,
  "question": "Qual é o principal ponto que impacta sua satisfação?",
  "icon": "HelpCircle",
  "summary": "Resumo...",
  "data": [
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
  ],
  "type": "closed"
}
```

#### Questão Aberta (`type: "open"`)

```json
{
  "id": 4,
  "index": 4,
  "question": "O que podemos melhorar?",
  "icon": "TrendingUp",
  "summary": "Resumo...",
  "sentimentData": [
    {
      "category": "Suporte",
      "positive": 15,
      "neutral": 25,
      "negative": 60
    }
  ],
  "topCategories": [
    {
      "rank": 1,
      "category": "Tempo de resposta do suporte",
      "mentions": 412,
      "percentage": 33,
      "topics": [
        "demora no atendimento",
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
  ],
  "type": "open"
}
```

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
      "openField": "Campo Aberto",
      "multipleChoice": "Múltipla Escolha"
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
  "sectionsConfig": {
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
}
```

### Como usar traduções nos componentes

Use templates `{{uiTexts.caminho}}` para referenciar textos:

```json
{
  "type": "card",
  "title": "{{uiTexts.executiveReport.aboutStudy}}",
  "content": "{{sectionData.summary.aboutStudy}}"
}
```

### Traduções no código

Além dos textos no JSON, existem traduções hardcoded em `src/data/surveyData.js` (export `uiTexts`). Para novos textos, prefira usar `uiTexts` no JSON, pois é mais fácil de manter e traduzir.

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
  "contentStyleVariant": "with-description",
  "components": [ ... ]
}
```

**Propriedades:**

- `type`: `"card"` (obrigatório)
- `index`: Ordem (number, opcional)
- `title`: Título (string, suporta templates)
- `content`: Conteúdo (string, suporta templates)
- `styleVariant`: Estilo do card (string, opcional)
  - Valores: `"default"`, `"highlight"`, `"border-left"`, `"overflow-hidden"`, `"flex-column"`
- `contentStyleVariant`: Estilo do conteúdo interno (string, opcional)
  - Valores: `"with-description"`, `"with-charts"`, `"with-tables"`
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
  "wrapperProps": {
    "className": "grid grid-cols-2 gap-4"
  },
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

- `wrapper`: Tag HTML (string, obrigatório) - Exemplos: `"div"`, `"section"`, `"h3"`
- `wrapperProps`: Props do wrapper (object, opcional) - Permite passar propriedades HTML/React
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

---

## ⚙️ Condições

Use condições para renderizar componentes condicionalmente.

### Sintaxe

```json
{
  "condition": "question.type === 'nps'"
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

As estruturas de dados abaixo são **exemplos simplificados**. Os dados reais podem ser muito mais verbosos, então mantenha-os separados do `renderSchema` no JSON.

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

**Nota:** Mantenha os dados separados do `renderSchema` porque podem ser muito verbosos. O `renderSchema` deve conter apenas a estrutura de renderização, enquanto os dados ficam em propriedades separadas dentro de `data`.

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
3. Adicione os dados em `data` (separados do `renderSchema`)
4. Adicione os textos em `uiTexts`

### Como criar uma subseção?

1. Adicione em `subsections` (ou apenas no `renderSchema`):

```json
{
  "id": "nova-subsecao",
  "index": 0,
  "name": "Nova Subseção",
  "icon": "FileText"
}
```

2. Adicione o schema correspondente em `renderSchema.subsections` com o `name` junto dos componentes
3. Adicione os dados necessários em `data`

### Como adicionar ou remover questões?

- **Adicionar:** Adicione um objeto ao array `questions` em `data.questions`
- **Remover:** Remova o objeto do array `questions`
- **Ocultar:** Adicione o ID em `config.questions.hiddenIds`

Veja a seção [Gerenciando Questões](#gerenciando-questões) para detalhes.

### Onde ficam as traduções que não mudam?

As traduções estáticas ficam em `uiTexts` no nível raiz do JSON. Cada seção também pode ter seus próprios textos em `data.uiTexts`. Veja a seção [Traduções e Textos da Interface](#traduções-e-textos-da-interface).

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

1. Prepare os dados em `data` (separados do `renderSchema`)
2. Use o componente com `dataPath`:

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

#### `styleVariant` (estilo do card)

- `default`: Estilo padrão do card
- `highlight`: Card com destaque visual
- `border-left`: Card com borda destacada à esquerda
- `overflow-hidden`: Card com overflow oculto (útil para tabelas)
- `flex-column`: Card com layout em coluna

#### `contentStyleVariant` (estilo do conteúdo interno)

- `with-description`: Layout otimizado para conteúdo descritivo
- `with-charts`: Layout otimizado para exibir gráficos
- `with-tables`: Layout otimizado para exibir tabelas

**Nota:** `styleVariant` e `contentStyleVariant` são propriedades diferentes e podem ser usadas juntas.

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
              "styleVariant": "flex-column",
              "contentStyleVariant": "with-charts",
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

**Nota:** Os dados (`dados`) estão separados do `renderSchema` porque podem ser verbosos.

### Exemplo 3: Seção com Questões

```json
{
  "id": "responses",
  "index": 3,
  "name": "Análise por Questão",
  "icon": "MessageSquare",
  "hasSchema": true,
  "data": {
    "renderSchema": {
      "subsections": [
        {
          "id": "questions-list",
          "index": 0,
          "name": "Lista de Questões",
          "icon": "FileText",
          "components": [
            {
              "type": "questionsList",
              "index": 0,
              "dataPath": "sectionData"
            }
          ]
        }
      ]
    },
    "questions": [
      {
        "id": 1,
        "index": 1,
        "question": "Qual é a probabilidade de você recomendar...",
        "icon": "Percent",
        "summary": "Resumo...",
        "data": [
          {
            "option": "Detrator",
            "value": 636,
            "percentage": 51
          }
        ],
        "type": "nps"
      }
    ],
    "config": {
      "questions": {
        "hiddenIds": [3]
      }
    }
  }
}
```

---

## 📝 Notas

### Ícones

Os ícones são do Lucide React. Consulte a documentação para ver todos os ícones disponíveis.

### Componentes Customizados

Novos tipos de componentes devem ser criados no código, não no JSON.

### Separação de Dados

Mantenha os dados separados do `renderSchema` porque podem ser muito verbosos. O `renderSchema` deve conter apenas a estrutura de renderização.

### Name nos Componentes

Como o código é programático, você pode colocar o `name` diretamente no `renderSchema` junto com os componentes, evitando duplicação.

---

**Versão do formato:** 1.0

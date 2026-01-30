# 🚀 Guia de Referência Rápida - surveyData.json

## 📋 Estrutura Mínima de uma Seção

```json
{
  "sections": [
    {
      "id": "minha-secao",
      "index": 0,
      "name": "Minha Seção",
      "icon": "FileText",
      "subsections": [
        {
          "id": "minha-subsecao",
          "index": 0,
          "name": "Minha Subseção",
          "icon": "ClipboardList",
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
      ],
      "data": {
        "meusDados": "Conteúdo aqui"
      }
    }
  ]
}
```

**💡 Dicas:**

- Os componentes estão diretamente em `subsections[].components` (não há mais `renderSchema`)
- Mantenha os dados separados em `data` porque podem ser verbosos
- Cada subseção pode ter múltiplos componentes em ordem de `index`

---

## ❓ Gerenciando Questões

### Adicionar Questão

Adicione ao array `questions` dentro da seção `responses`:

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
          "question": "Pergunta aqui",
          "summary": "Resumo da questão",
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

### Remover Questão

**Remover:** Delete o objeto do array `questions`.

### Tipos de Questão

- `"nps"` - Questão NPS
- `"open-ended"` - Questão aberta (campo livre)
- `"multiple-choice"` - Questão de múltipla escolha
- `"single-choice"` - Questão de escolha única

**⚠️ Importante:** Use `questionType` (não `type`) para questões. Os componentes são gerados automaticamente baseados no `questionType` usando templates pré-definidos.

---

## 🌐 Traduções Estáticas

As traduções que **não mudam com a pesquisa** ficam em `uiTexts` no nível raiz:

```json
{
  "uiTexts": {
    "filterPanel": {
      "all": "Todas",
      "open-ended": "Campo Aberto",
      "multiple-choice": "Múltipla Escolha",
      "single-choice": "Escolha única",
      "nps": "NPS"
    },
    "export": {
      "title": "Export de Dados",
      "description": "Exporte os dados da pesquisa em diferentes formatos"
    }
  }
}
```

**Textos específicos de seção:** Cada seção pode ter `data.uiTexts` (tem precedência sobre os globais).

---

## 🎯 Componentes Mais Usados

### Card

```json
{
  "type": "card",
  "index": 0,
  "title": "Título do Card",
  "text": "Texto do card com suporte a quebras de linha.\nSegunda linha.",
  "cardStyleVariant": "default",
  "cardContentVariant": "with-description",
  "components": [ ... ]
}
```

### Container / Grid Container

Agrupa componentes em um layout flexível:

```json
{
  "type": "container",
  "index": 0,
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

Ou use `grid-container` para layout em grid:

```json
{
  "type": "grid-container",
  "index": 0,
  "className": "grid gap-6 md:grid-cols-2",
  "components": [ ... ]
}
```

### Headings (h3, h4)

Cabeçalhos para organizar conteúdo:

```json
{
  "type": "h3",
  "index": 0,
  "text": "Título da Seção",
  "components": [ ... ]
}
```

### BarChart

```json
{
  "type": "barChart",
  "index": 0,
  "dataPath": "sectionData.dados",
  "config": {
    "dataKey": "percentage",
    "yAxisDataKey": "option",
    "sortData": true,
    "sortDirection": "desc"
  }
}
```

### QuestionsList

```json
{
  "type": "questionsList",
  "index": 0,
  "dataPath": "sectionData"
}
```

---

## 🔗 Templates

- `{{uiTexts.secao.campo}}` - Textos da interface
- `{{sectionData.campo}}` - Dados da seção
- `{{currentAttribute.campo}}` - Atributo atual
- `{{question.campo}}` - Questão atual
- `{{surveyInfo.campo}}` - Info da pesquisa

---

## ⚙️ Condições

```json
{
  "condition": "question.questionType === 'nps'"
}
```

**Operadores:** `===`, `!==`, `&&`, `||`, `!`

---

## 📊 Estruturas de Dados

### Distribuição

```json
[{ "segment": "A", "count": 100, "percentage": 50 }]
```

### Sentimento

```json
[{ "segment": "A", "positive": 50, "neutral": 30, "negative": 20 }]
```

### NPS

```json
[
  { "option": "Promotor", "value": 493, "percentage": 58 },
  { "option": "Neutro", "value": 170, "percentage": 20 },
  { "option": "Detrator", "value": 187, "percentage": 22 }
]
```

### Questão NPS

```json
{
  "id": 1,
  "index": 1,
  "questionType": "nps",
  "question": "Pergunta...",
  "summary": "Resumo...",
  "data": {
    "npsScore": 35,
    "npsStackedChart": [
      { "option": "Detrator", "value": 636, "percentage": 51 },
      { "option": "Promotor", "value": 374, "percentage": 30 },
      { "option": "Neutro", "value": 237, "percentage": 19 }
    ]
  }
}
```

### Questão Aberta

```json
{
  "id": 4,
  "index": 4,
  "questionType": "open-ended",
  "question": "O que podemos melhorar?",
  "summary": "Resumo...",
  "data": {
    "wordCloud": [
      { "text": "suporte", "value": 412 }
    ],
    "topCategoriesCards": [ ... ],
    "sentimentStackedChart": [ ... ]
  }
}
```

**💡 Dica:** Mantenha os dados separados dos componentes porque podem ser muito verbosos. Os dados ficam em `data`, enquanto os componentes estão em `subsections[].components`.

---

## 🎨 StyleVariants

### `cardStyleVariant` (estilo do card)

- `default` - Padrão
- `highlight` - Destaque
- `border-left` - Borda esquerda
- `overflow-hidden` - Overflow oculto (útil para tabelas)
- `flex-column` - Coluna

### `cardContentVariant` (estilo do conteúdo interno)

- `with-description` - Com descrição
- `with-charts` - Com gráficos
- `with-tables` - Com tabelas

---

## 🔤 Ícones Comuns

`FileText`, `BarChart3`, `Heart`, `Target`, `Users2`, `Layers`, `Building`, `MapPin`, `GraduationCap`, `MessageSquare`, `Download`, `AlertTriangle`, `ClipboardList`, `TrendingUp`, `Percent`, `HelpCircle`

---

## ✅ Checklist para Nova Seção

- [ ] Adicionar em `sections` (nível raiz do JSON)
- [ ] Definir `id`, `index`, `name`, `icon`
- [ ] Criar `subsections` (se necessário)
- [ ] Adicionar `components` diretamente em cada `subsection`
- [ ] Adicionar dados em `data` (separados dos componentes)
- [ ] Adicionar textos em `uiTexts` (traduções estáticas)

---

## ✅ Checklist para Nova Questão

- [ ] Adicionar objeto ao array `questions` na seção `responses`
- [ ] Definir `id`, `index`, `question`, `questionType` (não `type`)
- [ ] Adicionar `data` (estrutura varia conforme tipo)
- [ ] Para questões `open-ended`: adicionar `wordCloud`, `topCategoriesCards`, `sentimentStackedChart` em `data`
- [ ] Adicionar textos relacionados em `uiTexts` (se necessário)

---

## 📊 Gráficos Disponíveis

O sistema suporta diversos tipos de gráficos. Mesmo que não estejam no JSON atual, o código processa e renderiza qualquer um dos seguintes tipos:

### Charts (Gráficos)

- `barChart` - Gráfico de barras horizontal
- `sentimentDivergentChart` - Gráfico divergente de sentimento
- `sentimentStackedChart` - Gráfico empilhado de sentimento
- `sentimentThreeColorChart` - Gráfico de três cores de sentimento
- `npsStackedChart` - Gráfico empilhado NPS
- `lineChart` - Gráfico de linha temporal
- `paretoChart` - Gráfico de Pareto
- `scatterPlot` - Gráfico de dispersão
- `histogram` - Histograma
- `quadrantChart` - Gráfico de quadrantes
- `heatmap` - Mapa de calor
- `sankeyDiagram` - Diagrama de Sankey
- `stackedBarMECE` - Barras empilhadas MECE
- `evolutionaryScorecard` - Scorecard evolutivo
- `slopeGraph` - Gráfico de inclinação
- `waterfallChart` - Gráfico cascata

### Cards

- `card` - Card básico com título e texto
- `npsScoreCard` - Card com score NPS
- `topCategoriesCards` - Cards de categorias principais
- `kpiCard` - Card de KPI com métricas

### Tables (Tabelas)

- `recommendationsTable` - Tabela de recomendações
- `segmentationTable` - Tabela de segmentação
- `distributionTable` - Tabela de distribuição
- `sentimentTable` - Tabela de sentimento
- `npsDistributionTable` - Tabela de distribuição NPS
- `npsTable` - Tabela NPS
- `sentimentImpactTable` - Tabela de impacto de sentimento
- `positiveCategoriesTable` - Tabela de categorias positivas
- `negativeCategoriesTable` - Tabela de categorias negativas
- `analyticalTable` - Tabela analítica

### Widgets

- `questionsList` - Lista de questões com filtros
- `filterPills` - Pills de filtro
- `wordCloud` - Nuvem de palavras
- `accordion` - Acordeão expansível

### Containers e Headings

- `container` - Container flexível
- `grid-container` - Container em grid responsivo
- `h3` - Cabeçalho nível 3
- `h4` - Cabeçalho nível 4

**📖 Veja `CHARTS_JSON_REFERENCE.md` para documentação completa de todos os gráficos.**

---

## 📖 Documentação Completa

- **Documentação detalhada:** `Doc_how-to_json.md`
- **Referência de gráficos:** `CHARTS_JSON_REFERENCE.md`

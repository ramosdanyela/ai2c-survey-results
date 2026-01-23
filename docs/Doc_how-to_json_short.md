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
          "icon": "ClipboardList"
        }
      ],
      "data": {
        "renderSchema": {
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
                  "title": "{{uiTexts.minhaSecao.titulo}}",
                  "text": "{{sectionData.descricao}}",
                  "cardStyleVariant": "default"
                }
              ]
            }
          ]
        },
        "descricao": "Conteúdo aqui"
      }
    }
  ]
}
```

**💡 Dicas:**
- Como o código é programático, você pode colocar o `name` diretamente no `renderSchema` junto com os componentes, evitando duplicação.
- Mantenha os dados separados do `renderSchema` porque podem ser verbosos.
- **⚠️ Mudança importante:** A estrutura agora usa `sections` diretamente no nível raiz (não mais `sectionsConfig.sections`).

---

## ❓ Gerenciando Questões

### Adicionar Questão

Adicione ao array `data.questions`:

```json
{
  "data": {
    "questions": [
      {
        "id": 1,
        "index": 1,
        "question": "Pergunta aqui",
        "icon": "Percent",
        "type": "nps",
        "data": [ ... ]
      }
    ]
  }
}
```

### Remover Questão

**Remover:** Delete o objeto do array `questions`. (O filtro `hiddenIds` foi descontinuado.)

### Tipos de Questão

- `"nps"` - Questão NPS
- `"open-ended"` - Questão aberta (campo livre)
- `"multiple-choice"` - Questão de múltipla escolha
- `"single-choice"` - Questão de escolha única

---

## 🌐 Traduções Estáticas

As traduções que **não mudam com a pesquisa** ficam em `uiTexts` no nível raiz:

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
  "title": "{{uiTexts.titulo}}",
  "text": "{{sectionData.conteudo}}",
  "cardStyleVariant": "default"
}
```

### Container

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

### BarChart

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

### QuestionsList

```json
{
  "type": "questionsList",
  "dataPath": "sectionData"
}
```

### Wrapper (Legado)

```json
{
  "wrapper": "div",
  "wrapperProps": {
    "className": "grid grid-cols-2 gap-4"
  },
  "components": [ ... ]
}
```

**💡 Dica:** Prefira usar `container` ao invés de `wrapper` para novos componentes.

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
  "condition": "question.type === 'nps'"
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
  { "segment": "A", "nps": 10 },
  { "option": "Promotor", "value": 100, "percentage": 50 }
]
```

### Questão NPS

```json
{
  "id": 1,
  "index": 1,
  "question": "Pergunta...",
  "type": "nps",
  "data": [
    { "option": "Detrator", "value": 636, "percentage": 51 },
    { "option": "Promotor", "value": 374, "percentage": 30 },
    { "option": "Neutro", "value": 237, "percentage": 19 }
  ]
}
```

### Questão Aberta

```json
{
  "id": 4,
  "index": 4,
  "question": "O que podemos melhorar?",
  "type": "open-ended",
  "wordCloud": [
    { "text": "suporte", "value": 412 }
  ],
  "topCategories": [ ... ],
  "sentimentData": [ ... ]
}
```

**💡 Dica:** Mantenha os dados separados do `renderSchema` porque podem ser muito verbosos.

---

## 🎨 StyleVariants

### `cardStyleVariant` (estilo do card)

- `default` - Padrão
- `highlight` - Destaque
- `border-left` - Borda esquerda
- `overflow-hidden` - Overflow oculto (útil para tabelas)
- `flex-column` - Coluna

**⚠️ Mudança:** `styleVariant` foi renomeado para `cardStyleVariant` para maior clareza.

### `cardContentVariant` (estilo do conteúdo interno)

- `with-description` - Com descrição
- `with-charts` - Com gráficos
- `with-tables` - Com tabelas

**⚠️ Mudança:** `textStyleVariant` foi renomeado para `cardContentVariant`.

---

## 🔤 Ícones Comuns

`FileText`, `BarChart3`, `Heart`, `Target`, `Users2`, `Layers`, `Building`, `MapPin`, `GraduationCap`, `MessageSquare`, `Download`, `AlertTriangle`, `ClipboardList`, `TrendingUp`, `Percent`, `HelpCircle`

---

## ✅ Checklist para Nova Seção

- [ ] Adicionar em `sections` (nível raiz do JSON)
- [ ] Definir `id`, `index`, `name`, `icon`
- [ ] Criar `subsections` (se necessário)
- [ ] Incluir `data.renderSchema` (a existência define seção com schema)
- [ ] Criar `renderSchema` em `data` (com `name` junto dos componentes)
- [ ] Adicionar dados em `data` (separados do `renderSchema`)
- [ ] Adicionar textos em `uiTexts` (traduções estáticas)

---

## ✅ Checklist para Nova Questão

- [ ] Adicionar objeto ao array `data.questions`
- [ ] Definir `id`, `index`, `question`, `type`
- [ ] Adicionar `data` (estrutura varia conforme tipo)
- [ ] Para questões `open-ended`: adicionar `wordCloud`, `topCategories`, `sentimentData`
- [ ] Adicionar textos relacionados em `uiTexts` (se necessário)

---

## 📊 Gráficos Avançados

O sistema suporta diversos tipos de gráficos avançados:

- `kpiCard` - Card de KPI com métricas
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
- `analyticalTable` - Tabela analítica

**📖 Veja `CHARTS_JSON_REFERENCE.md` para documentação completa de todos os gráficos.**

---

## 📖 Documentação Completa

- **Documentação detalhada:** `Doc_how-to_json.md`
- **Referência de gráficos:** `CHARTS_JSON_REFERENCE.md`

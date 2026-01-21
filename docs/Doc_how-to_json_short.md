# 🚀 Guia de Referência Rápida - surveyData.json

## 📋 Estrutura Mínima de uma Seção

```json
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
              "content": "{{sectionData.descricao}}",
              "styleVariant": "default"
            }
          ]
        }
      ]
    },
    "descricao": "Conteúdo aqui"
  }
}
```

**💡 Dica:** Como o código é programático, você pode colocar o `name` diretamente no `renderSchema` junto com os componentes, evitando duplicação. Mantenha os dados separados do `renderSchema` porque podem ser verbosos.

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
- `"closed"` - Questão fechada (múltipla escolha)
- `"open"` - Questão aberta (campo livre)

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
      "openField": "Campo Aberto"
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
  "content": "{{sectionData.conteudo}}",
  "styleVariant": "default"
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
  "dataPath": "sectionData",
  "config": {
    "hideFilterPills": false
  }
}
```

### Wrapper

```json
{
  "wrapper": "div",
  "wrapperProps": {
    "className": "grid grid-cols-2 gap-4"
  },
  "components": [ ... ]
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
  "type": "open",
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

### `styleVariant` (estilo do card)

- `default` - Padrão
- `highlight` - Destaque
- `border-left` - Borda esquerda
- `overflow-hidden` - Overflow oculto
- `flex-column` - Coluna

### `contentStyleVariant` (estilo do conteúdo)

- `with-description` - Com descrição
- `with-charts` - Com gráficos
- `with-tables` - Com tabelas

---

## 🔤 Ícones Comuns

`FileText`, `BarChart3`, `Heart`, `Target`, `Users2`, `Layers`, `Building`, `MapPin`, `GraduationCap`, `MessageSquare`, `Download`, `AlertTriangle`, `ClipboardList`, `TrendingUp`, `Percent`, `HelpCircle`

---

## ✅ Checklist para Nova Seção

- [ ] Adicionar em `sectionsConfig.sections`
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
- [ ] Para questões `open`: adicionar `wordCloud`, `topCategories`, `sentimentData`
- [ ] Adicionar textos relacionados em `uiTexts` (se necessário)

---

## 📖 Documentação Completa

Veja `SURVEY_DATA_DOCUMENTATION.md` para documentação detalhada.

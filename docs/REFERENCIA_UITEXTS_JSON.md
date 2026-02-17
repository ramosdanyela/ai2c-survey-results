# Referência: árvore completa de uiTexts no JSON

Este documento descreve **todas as chaves de `uiTexts`** que o código do frontend utiliza ou espera no JSON do relatório (survey data). Usado para internacionalização, personalização por pesquisa e para evitar textos hardcoded — com **foco em questões e filtros**.

O objeto `uiTexts` fica na **raiz** do JSON:

```json
{
  "metadata": { ... },
  "sections": [ ... ],
  "uiTexts": {
    "filterPanel": { ... },
    "responseDetails": { ... },
    "common": { ... },
    "surveySidebar": { ... },
    "surveyHeader": { ... },
    "tables": { ... },
    "widgets": { ... }
  }
}
```

Todas as chaves listadas abaixo são **opcionais**: se omitidas, o código usa fallbacks em português (ou inglês onde já existem no código). Preencher no JSON quando quiser sobrescrever ou garantir o texto exibido.

---

## Sumário

1. [responseDetails (questões e respostas)](#1-responsedetails-questões-e-respostas)
2. [filterPanel (filtros e questões)](#2-filterpanel-filtros-e-questões)
3. [common (loading, erros, empty, debug)](#3-common-loading-erros-empty-debug)
4. [surveySidebar](#4-surveysidebar)
5. [surveyHeader](#5-surveyheader)
6. [tables (empty states)](#6-tables-empty-states)
7. [widgets](#7-widgets)
8. [Árvore em formato resumido](#8-árvore-em-formato-resumido)

---

## 1. responseDetails (questões e respostas)

Usado em: `QuestionsList`, `WidgetRenderers` (filter pills), `CardRenderers` (NPS, Top 3).  
Path no código: `data?.uiTexts?.responseDetails` ou merge com `sections[].data?.uiTexts?.responseDetails` na seção de respostas.

| Chave                 | Uso                                              | Fallback no código (exemplo)    |
| --------------------- | ------------------------------------------------ | ------------------------------- |
| `all`                 | Label do filtro "Todas" (tipos de questão)       | "Todas"                         |
| `open-ended`          | Label do tipo "Campo Aberto"                     | "Campo Aberto"                  |
| `multiple-choice`     | Label do tipo "Múltipla Escolha"                 | "Múltipla Escolha"              |
| `single-choice`       | Label do tipo "Escolha única"                    | "Escolha única"                 |
| `nps`                 | Label do tipo NPS                                | "NPS"                           |
| `npsScore`            | Título do card de NPS Score                      | "NPS Score"                     |
| `top3Categories`      | Título do bloco Top 3 Categories                 | "Top 3 Categories"              |
| `mentions`            | Rótulo "menções" (ex.: "42 menções")             | "mentions" / "menções"          |
| `positive`            | Coluna "Positive" no Top 3                       | "Positive"                      |
| `negative`            | Coluna "Negative" no Top 3                       | "Negative"                      |
| `noPositiveTopics`    | Mensagem quando não há tópicos positivos         | "Nenhum tópico positivo"        |
| `noNegativeTopics`    | Mensagem quando não há tópicos negativos         | "Nenhum tópico negativo"        |
| `filterQuestion`      | Botão/label "Filtrar questão"                    | "Filtrar questão"               |
| `questionPrefix`      | Prefixo antes do número (ex.: "Q1")              | "Q"                             |
| `responsesCount`      | Label de contagem de respostas                   | (conforme uso no componente)    |
| `removeFilter`        | Acessibilidade ao remover filtro (aria-label)    | (conforme uso)                  |
| `pdf`                 | Rótulo do botão/aba PDF                          | "pdf"                           |
| `summary`             | Rótulo do botão/aba Resumo                       | "summary"                       |
| `loadingFilteredData` | Mensagem ao carregar dados filtrados por questão | "Carregando dados filtrados..." |

**Exemplo mínimo para a área de questões:**

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

---

## 2. filterPanel (filtros e questões)

Usado em: `FilterPanel.jsx` via `getFilterText(key, fallback)`.  
Path no código: `data?.uiTexts?.filterPanel`.

| Chave                | Uso                                     | Fallback no código (exemplo)  |
| -------------------- | --------------------------------------- | ----------------------------- |
| `all`                | Botão "Todas" (tipos de questão)        | "Todas"                       |
| `open-ended`         | Botão "Campo Aberto"                    | "Campo Aberto"                |
| `multiple-choice`    | Botão "Múltipla Escolha"                | "Múltipla Escolha"            |
| `single-choice`      | Botão "Escolha única"                   | "Escolha única"               |
| `nps`                | Botão "NPS"                             | "NPS"                         |
| `filterByQuestion`   | Label "Filtrar por questão:"            | "Filtrar por questão:"        |
| `selectQuestion`     | Placeholder do select de questão        | "Selecione uma questão"       |
| `allQuestions`       | Opção "Todas as questões"               | "Todas as questões"           |
| `questionPrefix`     | Prefixo "Q" na lista de questões        | "Q"                           |
| `filters`            | Título "Filtros"                        | "Filtros"                     |
| `filtersUnavailable` | Quando não há definições de filtro      | "Filtros indisponíveis"       |
| `selectFilterType`   | Placeholder do select de tipo de filtro | "Selecione um tipo de filtro" |
| `none`               | Opção "Nenhum" (sem filtro)             | "Nenhum"                      |
| `clearAll`           | Link "Limpar todos" (pills)             | "Limpar todos"                |
| `openFilters`        | Botão "Abrir filtros"                   | "Abrir filtros"               |
| `closeFilters`       | Botão "Fechar filtros"                  | "Fechar filtros"              |
| `activeFilters`      | Título "Filtros Ativos"                 | "Filtros Ativos"              |
| `selected`           | "selecionado" (singular)                | "selecionado"                 |
| `selectedPlural`     | "selecionados" (plural)                 | "selecionados"                |
| `selectValues`       | "Selecione os valores"                  | "Selecione os valores"        |
| `clearAllFilters`    | "Limpar todos os filtros"               | "Limpar todos os filtros"     |
| `ok`                 | Botão "OK" do painel de filtros         | "OK"                          |

**Exemplo para filterPanel (foco em questões):**

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

---

## 3. common (loading, erros, empty, debug)

Usado em: loading global, mensagens de erro e empty states genéricos.  
Path no código: `data?.uiTexts?.common`.

### 3.1 common.loading

| Chave                 | Uso                                        | Fallback (exemplo)              |
| --------------------- | ------------------------------------------ | ------------------------------- |
| `loading`             | "Carregando..." (páginas)                  | "Carregando..."                 |
| `loadingQuestions`    | "Loading questions..." (lista de questões) | "Loading questions..."          |
| `loadingFilteredData` | "Carregando dados filtrados..."            | "Carregando dados filtrados..." |
| `loadingData`         | "Carregando dados..." (sidebar)            | "Carregando dados..."           |

### 3.2 common.errors

| Chave                | Uso                      | Fallback (exemplo)     |
| -------------------- | ------------------------ | ---------------------- |
| `questionsNotFound`  | "Questions not found."   | "Questions not found." |
| `availableStructure` | "Available structure:"   | "Available structure:" |
| `none`               | "none" (estrutura vazia) | "none"                 |

### 3.3 common.empty (proposto para uso futuro)

Mensagens genéricas de estado vazio em widgets (gráficos, tabelas).

| Chave                 | Uso                                                        | Fallback (exemplo)            |
| --------------------- | ---------------------------------------------------------- | ----------------------------- |
| `noData`              | "Nenhum dado disponível"                                   | "Nenhum dado disponível"      |
| `noSeries`            | "Nenhuma série configurada"                                | "Nenhuma série configurada"   |
| `noColumns`           | "Nenhuma coluna configurada" / "Nenhuma coluna disponível" | "Nenhuma coluna configurada"  |
| `noWords`             | WordCloud: "Nenhuma palavra para exibir"                   | "Nenhuma palavra para exibir" |
| `noValidNumericValue` | Histogram: "Nenhum valor numérico válido encontrado"       | (conforme widget)             |

### 3.4 common (seção/genérica)

| Chave                       | Uso                                              | Fallback (exemplo)                               |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `noComponentsForSection`    | "Nenhum componente definido para esta seção."    | "Nenhum componente definido para esta seção."    |
| `noComponentsForSubsection` | "Nenhum componente definido para esta subseção." | "Nenhum componente definido para esta subseção." |

**Exemplo:**

```json
"uiTexts": {
  "common": {
    "loading": {
      "loading": "Carregando...",
      "loadingQuestions": "Carregando questões...",
      "loadingFilteredData": "Carregando dados filtrados...",
      "loadingData": "Carregando dados..."
    },
    "errors": {
      "questionsNotFound": "Questões não encontradas.",
      "availableStructure": "Estrutura disponível:",
      "none": "nenhum"
    },
    "empty": {
      "noData": "Nenhum dado disponível",
      "noSeries": "Nenhuma série configurada",
      "noColumns": "Nenhuma coluna configurada",
      "noWords": "Nenhuma palavra para exibir"
    },
    "noComponentsForSection": "Nenhum componente definido para esta seção.",
    "noComponentsForSubsection": "Nenhum componente definido para esta subseção."
  }
}
```

---

## 4. surveySidebar

Usado em: `SurveySidebar.jsx`, `ExportPreview.jsx`.  
Path no código: `data?.uiTexts?.surveySidebar`.

| Chave          | Uso                                           | Fallback (exemplo)    |
| -------------- | --------------------------------------------- | --------------------- |
| `loading`      | "Carregando..." (enquanto título não carrega) | "Carregando..."       |
| `loadingData`  | "Carregando dados..."                         | "Carregando dados..." |
| `respondents`  | Label "Respondentes"                          | (fallback no código)  |
| `responseRate` | Label "Taxa de resposta"                      | (fallback no código)  |
| `questions`    | Label "Questões" (número de questões)         | (fallback no código)  |

O **título da pesquisa** vem de `data?.surveyInfo?.title` (não de uiTexts).

---

## 5. surveyHeader

Usado em: `NavigationButtons.jsx`.  
Path no código: `data?.uiTexts?.surveyHeader`.

Chaves dependem do uso no header (navegação, export, etc.). Documentar aqui conforme o código for padronizado para `resolveText("uiTexts.surveyHeader.*")`. Exemplo de estrutura:

```json
"uiTexts": {
  "surveyHeader": {
    "previous": "Anterior",
    "next": "Próximo",
    "export": "Exportar"
  }
}
```

---

## 6. tables (empty states)

Proposto para mensagens de empty state das tabelas (TableRenderers). Path sugerido: `data?.uiTexts?.tables`.

| Chave                   | Uso                                                | Fallback (exemplo)                       |
| ----------------------- | -------------------------------------------------- | ---------------------------------------- |
| `noRecommendations`     | "Nenhuma recomendação encontrada."                 | "Nenhuma recomendação encontrada."       |
| `noSegmentationData`    | "Nenhum dado de segmentação encontrado."           | (conforme componente)                    |
| `noDistributionData`    | "Nenhum dado de distribuição encontrado."          | (conforme componente)                    |
| `noSentimentData`       | "Nenhum dado de sentimento encontrado."            | (conforme componente)                    |
| `noNpsDistributionData` | "Nenhum dado de distribuição NPS encontrado."      | (conforme componente)                    |
| `noNpsData`             | "Nenhum dado NPS encontrado."                      | (conforme componente)                    |
| `noSentimentImpactData` | "Nenhum dado de impacto de sentimento encontrado." | (conforme componente)                    |
| `noPositiveCategories`  | "Nenhuma categoria positiva encontrada."           | "Nenhuma categoria positiva encontrada." |
| `noNegativeCategories`  | "Nenhuma categoria negativa encontrada."           | "Nenhuma categoria negativa encontrada." |
| `noAnalyticalData`      | "Nenhum dado analítico encontrado."                | (conforme componente)                    |
| `noColumnsAvailable`    | "Nenhuma coluna disponível."                       | "Nenhuma coluna disponível."             |

---

## 7. widgets

Proposto para mensagens específicas de widgets. Path sugerido: `data?.uiTexts?.widgets`.

### 7.1 widgets.wordCloud

| Chave   | Uso                           | Fallback (exemplo)            |
| ------- | ----------------------------- | ----------------------------- |
| `empty` | "Nenhuma palavra para exibir" | "Nenhuma palavra para exibir" |

---

## 8. Árvore em formato resumido

Árvore completa de chaves (para referência rápida e validação de schema):

```
uiTexts
├── responseDetails
│   ├── all, open-ended, multiple-choice, single-choice, nps
│   ├── npsScore, top3Categories, mentions, positive, negative
│   ├── noPositiveTopics, noNegativeTopics
│   ├── filterQuestion, questionPrefix, responsesCount, removeFilter
│   ├── pdf, summary, loadingFilteredData
├── filterPanel
│   ├── all, open-ended, multiple-choice, single-choice, nps
│   ├── filterByQuestion, selectQuestion, allQuestions, questionPrefix
│   ├── filters, filtersUnavailable, selectFilterType, none
│   ├── clearAll, openFilters, closeFilters, activeFilters
│   ├── selected, selectedPlural, selectValues, clearAllFilters, ok
├── common
│   ├── loading (loading, loadingQuestions, loadingFilteredData, loadingData)
│   ├── errors (questionsNotFound, availableStructure, none)
│   ├── empty (noData, noSeries, noColumns, noWords, noValidNumericValue)
│   ├── noComponentsForSection, noComponentsForSubsection
├── surveySidebar
│   ├── loading, loadingData, respondents, responseRate, questions
├── surveyHeader
│   └── (previous, next, export, etc. conforme uso)
├── tables
│   ├── noRecommendations, noSegmentationData, noDistributionData, noSentimentData
│   ├── noNpsDistributionData, noNpsData, noSentimentImpactData
│   ├── noPositiveCategories, noNegativeCategories, noAnalyticalData, noColumnsAvailable
└── widgets
    └── wordCloud.empty
```

---

## Relação com outros documentos

- **ESTRUTURA_COMPONENTES_JSON.md** — Seção 9 descreve onde `uiTexts` fica no JSON e exemplos para questões (responseDetails, filterPanel).
- **ESTRATEGIA_REVISAO_HARDCODED.md** — Estratégia de revisão de textos hardcoded; este documento é o contrato de chaves esperadas pelo código.

Para validar o JSON, garanta que as chaves usadas no frontend existam em `uiTexts` quando quiser sobrescrever os fallbacks; chaves ausentes não quebram a aplicação.

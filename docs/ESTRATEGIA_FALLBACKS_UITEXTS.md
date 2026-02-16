# Estratégia para listar fallbacks de uiTexts

Este documento descreve **quais fallbacks estão disponíveis** quando as chaves de `uiTexts` não vêm no JSON, e uma **estratégia repetível** para listá-los e mantê-los atualizados. Não altera o código da aplicação.

---

## 1. O que são os fallbacks

Todas as chaves em `uiTexts` são **opcionais**. Se uma chave estiver ausente no JSON, o frontend usa um **fallback** (texto fixo no código). Os fallbacks garantem que a interface sempre exiba algo legível, em geral em português (ou inglês onde já existiam no código).

**Contrato:** o valor exibido é `uiTexts.<seção>.<chave>` quando presente; caso contrário, o fallback listado abaixo.

---

## 2. Lista consolidada de fallbacks disponíveis

Valores extraídos do código e do documento `REFERENCIA_UITEXTS_JSON.md`. Ordenados por seção de `uiTexts`.

### 2.1 responseDetails

| Chave                 | Fallback no código              |
| --------------------- | ------------------------------- |
| `all`                 | "Todas"                         |
| `open-ended`          | "Campo Aberto"                  |
| `multiple-choice`     | "Múltipla Escolha"              |
| `single-choice`       | "Escolha única"                 |
| `nps`                 | "NPS"                           |
| `npsScore`            | "NPS Score"                     |
| `top3Categories`      | "Top 3 Categories"              |
| `mentions`            | "mentions"                      |
| `positive`            | "Positive"                      |
| `negative`            | "Negative"                      |
| `noPositiveTopics`    | "Nenhum tópico positivo"        |
| `noNegativeTopics`    | "Nenhum tópico negativo"        |
| `filterQuestion`      | "Filtrar questão"               |
| `questionPrefix`      | "Q"                             |
| `responsesCount`      | (conforme uso no componente)    |
| `removeFilter`        | (conforme uso / aria-label)     |
| `pdf`                 | "pdf"                           |
| `summary`             | "summary"                       |
| `loadingFilteredData` | "Carregando dados filtrados..." |
| `wordCloud`           | "Word Cloud"                    |

**Onde aparecem no código:** `QuestionsList.jsx` (safeUiTexts, labels de tipo), `CardRenderers.jsx`, `WidgetRenderers.jsx`.

---

### 2.2 filterPanel

| Chave                | Fallback no código            |
| -------------------- | ----------------------------- |
| `all`                | "Todas"                       |
| `open-ended`         | "Campo Aberto"                |
| `multiple-choice`    | "Múltipla Escolha"            |
| `single-choice`      | "Escolha única"               |
| `nps`                | "NPS"                         |
| `filterByQuestion`   | "Filtrar por questão:"        |
| `selectQuestion`     | "Selecione uma questão"       |
| `allQuestions`       | "Todas as questões"           |
| `questionPrefix`     | "Q"                           |
| `filters`            | "Filtros"                     |
| `filtersUnavailable` | "Filtros indisponíveis"       |
| `selectFilterType`   | "Selecione um tipo de filtro" |
| `none`               | "Nenhum"                      |
| `clearAll`           | "Limpar todos"                |
| `openFilters`        | "Abrir filtros"               |
| `closeFilters`       | "Fechar filtros"              |
| `activeFilters`      | "Filtros Ativos"              |
| `selected`           | "selecionado"                 |
| `selectedPlural`     | "selecionados"                |
| `selectValues`       | "Selecione os valores"        |
| `clearAllFilters`    | "Limpar todos os filtros"     |
| `ok`                 | "OK"                          |

**Onde aparecem no código:** `FilterPanel.jsx` — todos via `getFilterText(key, fallback)`.

---

### 2.3 common

#### common.loading

| Chave                 | Fallback no código              |
| --------------------- | ------------------------------- |
| `loading`             | "Carregando..."                 |
| `loadingQuestions`    | "Loading questions..."          |
| `loadingFilteredData` | "Carregando dados filtrados..." |
| `loadingData`         | "Carregando dados..."           |

#### common.errors

| Chave                | Fallback no código     |
| -------------------- | ---------------------- |
| `questionsNotFound`  | "Questions not found." |
| `availableStructure` | "Available structure:" |
| `none`               | "none"                 |

#### common.empty (proposto / uso futuro)

| Chave                 | Fallback (exemplo)            |
| --------------------- | ----------------------------- |
| `noData`              | "Nenhum dado disponível"      |
| `noSeries`            | "Nenhuma série configurada"   |
| `noColumns`           | "Nenhuma coluna configurada"  |
| `noWords`             | "Nenhuma palavra para exibir" |
| `noValidNumericValue` | (conforme widget)             |

#### common (raiz da seção common)

| Chave                         | Fallback no código                               |
| ----------------------------- | ------------------------------------------------ |
| `noComponentsForSection`      | "Nenhum componente definido para esta seção."    |
| `noComponentsForSubsection`   | "Nenhum componente definido para esta subseção." |
| `emptyState.noQuestionsFound` | "No questions found."                            |
| `emptyState.activeFilter`     | "Active filter:"                                 |
| `sectionNotFound`             | "Section not found"                              |
| `sectionId`                   | "Section ID:"                                    |

**Onde aparecem no código:** `QuestionsList.jsx`, `GenericSectionRenderer.jsx`, `ContentRenderer.jsx`.

---

### 2.4 surveySidebar

| Chave          | Fallback no código    |
| -------------- | --------------------- |
| `loading`      | "Carregando..."       |
| `loadingData`  | "Carregando dados..." |
| `respondents`  | "Respondentes"        |
| `responseRate` | "Taxa de Adesão"      |
| `questions`    | "Perguntas"           |

**Onde aparecem no código:** `SurveySidebar.jsx`, `ExportPreview.jsx`. O título da pesquisa vem de `surveyInfo.title`, não de uiTexts.

---

### 2.5 surveyHeader

| Chave               | Fallback no código           |
| ------------------- | ---------------------------- |
| `question`          | "Questão" (ex.: "Questão 1") |
| `attributeAnalysis` | "Análise por Atributos"      |
| `deepDive`          | "Aprofundamento"             |

**Onde aparecem no código:** `NavigationButtons.jsx` via `data?.uiTexts?.surveyHeader`.

---

### 2.6 export (sidebar / Export.jsx)

| Chave              | Fallback no código   |
| ------------------ | -------------------- |
| `title`            | "Export Data"        |
| `exportFullReport` | "Export Full Report" |
| `exportAsPDF`      | "Export as PDF"      |
| `exportAsPPT`      | "Export as PPT"      |

**Onde aparecem no código:** `SurveySidebar.jsx` (getMenuItems), `Export.jsx`.

---

### 2.7 tables (empty states)

Estes textos hoje estão **hardcoded** em `TableRenderers.jsx`; o path proposto é `uiTexts.tables.*`. Fallbacks atuais:

| Chave                   | Fallback no código                                 |
| ----------------------- | -------------------------------------------------- |
| `noRecommendations`     | "Nenhuma recomendação encontrada."                 |
| `noSegmentationData`    | "Nenhum dado de segmentação encontrado."           |
| `noDistributionData`    | "Nenhum dado de distribuição encontrado."          |
| `noSentimentData`       | "Nenhum dado de sentimento encontrado."            |
| `noNpsDistributionData` | "Nenhum dado de distribuição NPS encontrado."      |
| `noNpsData`             | "Nenhum dado NPS encontrado."                      |
| `noSentimentImpactData` | "Nenhum dado de impacto de sentimento encontrado." |
| `noPositiveCategories`  | "Nenhuma categoria positiva encontrada."           |
| `noNegativeCategories`  | "Nenhuma categoria negativa encontrada."           |
| `noAnalyticalData`      | "Nenhum dado analítico encontrado."                |
| `noColumnsAvailable`    | "Nenhuma coluna disponível."                       |

---

### 2.8 widgets

| Path                | Chave   | Fallback no código            |
| ------------------- | ------- | ----------------------------- |
| `widgets.wordCloud` | `empty` | "Nenhuma palavra para exibir" |

**Onde aparecem no código:** `WidgetRenderers.jsx` (título Word Cloud); empty state em `WordCloud.jsx` (se usar uiTexts).

---

### 2.9 attributeDeepDive (Tables.jsx)

| Chave        | Fallback no código |
| ------------ | ------------------ |
| `segment`    | "Segmento"         |
| `quantity`   | "Quantidade"       |
| `percentage` | "%"                |
| `positive`   | "Positivo"         |
| `negative`   | "Negativo"         |
| `promoters`  | "Promotores"       |
| `neutrals`   | "Neutros"          |
| `detractors` | "Detratores"       |
| `nps`        | "NPS"              |
| `sentiment`  | "Sentimento"       |
| `category`   | "Categoria"        |

---

### 2.10 executiveReport (Tables.jsx)

| Path                           | Chave                 | Fallback                   |
| ------------------------------ | --------------------- | -------------------------- |
| `executiveReport.tableHeaders` | `number`              | "#"                        |
|                                | `recommendation`      | "Recomendação"             |
|                                | `severity`            | "Severidade"               |
|                                | `stakeholders`        | "Stakeholders"             |
| `executiveReport.tasks`        | `hideTasks`           | "Ocultar tarefas"          |
|                                | `showTasks`           | "Mostrar tarefas"          |
|                                | `hide`                | "Ocultar"                  |
|                                | `show`                | "Mostrar"                  |
|                                | `implementationTasks` | "Tarefas de implementação" |
|                                | `task`                | "Tarefa"                   |
|                                | `responsibleArea`     | "Área responsável"         |

---

### 2.11 supportAnalysis (Tables.jsx)

| Chave                | Fallback no código |
| -------------------- | ------------------ |
| `clusterLabel`       | "Cluster"          |
| `clusterDescription` | "Descrição"        |
| `memberPercentage`   | "% Membros"        |
| `clusterId`          | "ID"               |

---

## 3. Estratégia para listar e manter os fallbacks

Objetivo: ter uma lista única e confiável de **chave → fallback**, alinhada ao código e à referência de uiTexts.

### Passo 1 — Onde os fallbacks vivem no código

| Padrão no código                                                                                 | Arquivos típicos                                                         | Ação                                                                          |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `getFilterText("chave", "Fallback")`                                                             | `FilterPanel.jsx`                                                        | Extrair par (chave, fallback) para `filterPanel`                              |
| `uiTexts?.responseDetails?.x \|\| "Fallback"` ou `safeUiTexts.responseDetails.x \|\| "Fallback"` | `QuestionsList.jsx`, `CardRenderers.jsx`, `WidgetRenderers.jsx`          | Extrair para `responseDetails`                                                |
| `data?.uiTexts?.common?.... \|\| "..."`                                                          | `QuestionsList.jsx`, `GenericSectionRenderer.jsx`, `ContentRenderer.jsx` | Extrair para `common`                                                         |
| `data?.uiTexts?.surveySidebar?.x \|\| "..."`                                                     | `ExportPreview.jsx`, `SurveySidebar.jsx`                                 | Extrair para `surveySidebar`                                                  |
| `data?.uiTexts?.surveyHeader?.x \|\| "..."`                                                      | `NavigationButtons.jsx`                                                  | Extrair para `surveyHeader`                                                   |
| `uiTexts?.attributeDeepDive?.x \|\| "..."`                                                       | `Tables.jsx`                                                             | Extrair para `attributeDeepDive`                                              |
| Strings fixas em empty state (ex.: `<p>Nenhuma recomendação...</p>`)                             | `TableRenderers.jsx`, `WordCloud.jsx`, widgets                           | Anotar como fallback atual e chave proposta (ex.: `tables.noRecommendations`) |

### Passo 2 — Comandos úteis para auditoria

- **FilterPanel (todos os getFilterText):**
  ```bash
  rg 'getFilterText\(' --path src/components/survey/components/FilterPanel.jsx
  ```
- **Fallbacks com || " no código:**
  ```bash
  rg 'uiTexts\?\.\w+\?\.[^|]+\|\| ["\']' --path src
  rg '\.(responseDetails|filterPanel|common|surveySidebar|surveyHeader)\?\.\w+ \|\| ["\']' --path src
  ```
- **Mensagens de empty state em tabelas:**
  ```bash
  rg '<p>Nenhum' --path src/components/survey/common/TableRenderers.jsx
  ```

### Passo 3 — Cruzar com a referência

- Manter `docs/official_docs/REFERENCIA_UITEXTS_JSON.md` como contrato das chaves esperadas.
- Neste documento (`ESTRATEGIA_FALLBACKS_UITEXTS.md`), a **Seção 2** é a lista consolidada de fallbacks.
- Ao adicionar uma nova chave em `REFERENCIA_UITEXTS_JSON.md`, adicionar também o fallback correspondente na seção 2 e o arquivo onde ele é usado.

### Passo 4 — Checklist de revisão periódica

1. [ ] Rodar os greps do Passo 2 e conferir se todo fallback está listado na Seção 2.
2. [ ] Conferir se toda chave da Seção 2 existe em `REFERENCIA_UITEXTS_JSON.md` (ou anotar como “apenas em código”).
3. [ ] Procurar novas strings fixas em componentes de UI (empty states, placeholders, labels) e decidir se viram chave em uiTexts + fallback aqui.
4. [ ] Se o código passar a usar `resolveText("uiTexts....")` em novos lugares, documentar o fallback (que pode ser o segundo argumento de `resolveText` ou o valor atual hardcoded antes da mudança).

### Passo 5 — Opcional: script de extração

Para automatizar a listagem no futuro, pode-se criar um script (por exemplo em `scripts/` ou `docs/`) que:

- Use regex ou AST para encontrar `getFilterText("key", "fallback")` e gere uma tabela `filterPanel.key → fallback`.
- Procure padrões como `uiTexts?.responseDetails?.['x'] || "y"` e equivalentes e gere `responseDetails.x → y`.

O output do script pode ser comparado com a Seção 2 deste documento para detectar divergências.

---

## 4. Resumo

- **Fallbacks disponíveis:** estão consolidados na **Seção 2** por seção de uiTexts (responseDetails, filterPanel, common, surveySidebar, surveyHeader, export, tables, widgets, attributeDeepDive, executiveReport, supportAnalysis).
- **Estratégia para listar:** (1) identificar padrões no código (getFilterText, || "…", strings em empty states); (2) usar greps para auditoria; (3) cruzar com `REFERENCIA_UITEXTS_JSON.md`; (4) revisão periódica com checklist; (5) opcionalmente script de extração.
- **Não mexe no resto do código:** este documento apenas descreve e lista; alterações no frontend seguem em `ESTRATEGIA_REVISAO_HARDCODED.md` e na referência de estrutura.

---

## 5. Relação com outros documentos

- **REFERENCIA_UITEXTS_JSON.md** — Árvore de chaves de uiTexts e exemplos; os fallbacks listados aqui são os valores usados quando a chave está ausente.
- **ESTRATEGIA_REVISAO_HARDCODED.md** — Revisão de textos hardcoded; a lista de fallbacks aqui serve de referência para o que “sobra” quando o JSON não preenche uiTexts.
- **ESTRUTURA_COMPONENTES_JSON.md** — Onde uiTexts fica no JSON e exemplos de uso.

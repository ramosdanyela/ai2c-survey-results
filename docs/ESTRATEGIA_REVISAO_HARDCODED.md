# Estratégia para revisão de elementos hardcoded (pesquisa/questões)

Este documento descreve uma estratégia sistemática para identificar e revisar todos os elementos, componentes e textos de pesquisa que estão hardcoded no código, com **foco especial na parte das questões**.

---

## 1. Objetivo

- Localizar todos os textos e rótulos fixos no código que deveriam vir do JSON (ex.: `uiTexts`, `surveyInfo`, dados da pesquisa).
- Priorizar **questões**: tipos de questão, filtros por questão, rótulos de questão, estados vazios e mensagens de erro na área de respostas.
- Definir onde cada texto deve ser configurável (ex.: `uiTexts.responseDetails`, `uiTexts.filterPanel`) e documentar o mapeamento.

---

## 2. Escopo da revisão

| Área                            | Inclui                                                                                                                                         | Prioridade |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **Questões**                    | Tipos (NPS, Campo Aberto, Múltipla/Escolha única), filtros, prefixo "Q", rótulos de filtro por questão, loading/erro por questão, empty states | **Alta**   |
| **Filtros**                     | FilterPanel (Todas, Selecione uma questão, Filtros ativos, etc.)                                                                               | Alta       |
| **Respostas / ResponseDetails** | NPS Score, Top 3, menções, Positive/Negative, tópicos positivos/negativos                                                                      | Alta       |
| **Seções genéricas**            | "Nenhum componente definido para esta seção/subseção"                                                                                          | Média      |
| **Widgets (gráficos/tabelas)**  | "Nenhum dado disponível", "Nenhuma série/coluna configurada", etc.                                                                             | Média      |
| **Sidebar / Header / Export**   | Respondentes, taxa de resposta, número de questões, títulos                                                                                    | Média      |
| **Cards**                       | "Sobre o Estudo" (título especial para export), fallbacks de card                                                                              | Baixa      |

---

## 3. Mapa de textos hardcoded por arquivo (foco em questões)

### 3.1 Questões e lista de questões

| Arquivo                                          | Texto hardcoded                                                                                                                                                                                    | Sugestão de chave uiTexts / origem                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `src/components/survey/common/QuestionsList.jsx` | `"Carregando dados filtrados..."`                                                                                                                                                                  | `common.loading.loadingFilteredData` ou `responseDetails.loadingFilteredData`                               |
| `QuestionsList.jsx`                              | Fallbacks do `safeUiTexts.responseDetails`: "Todas", "Campo Aberto", "Múltipla Escolha", "Escolha única", "NPS", "NPS Score", "menções", "Nenhum tópico positivo/negativo", "Filtrar questão", "Q" | Já usa `uiTexts.responseDetails` com fallback; revisar se todos os JSONs de pesquisa preenchem essas chaves |
| `QuestionsList.jsx`                              | `"Loading questions..."`                                                                                                                                                                           | `common.loading.loadingQuestions` (já usado em parte)                                                       |
| `QuestionsList.jsx`                              | `"Questions not found."`, `"Available structure:"`, `"none"`                                                                                                                                       | `common.errors.questionsNotFound`, `common.errors.availableStructure`, `common.errors.none`                 |
| `QuestionsList.jsx`                              | `"Questions in responseDetails:"` (debug)                                                                                                                                                          | Remover em prod ou mover para `common.debug.*`                                                              |
| `QuestionsList.jsx`                              | `"pdf"`, `"summary"` (rótulos de aba/botão)                                                                                                                                                        | `responseDetails.pdf`, `responseDetails.summary`                                                            |
| `QuestionsList.jsx`                              | `responseDetails.responsesCount` (label de contagem)                                                                                                                                               | Garantir em `uiTexts.responseDetails.responsesCount`                                                        |

### 3.2 Filtros (FilterPanel) – forte ligação com questões

| Arquivo                                            | Texto hardcoded                                                                        | Sugestão de chave uiTexts                                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/survey/components/FilterPanel.jsx` | "Todas", "Campo Aberto", "Múltipla Escolha", "Escolha única", "NPS"                    | `filterPanel.all`, `filterPanel.open-ended`, etc. (já usa `getFilterText` com fallback)                                           |
| `FilterPanel.jsx`                                  | "Filtrar por questão:", "Selecione uma questão", "Todas as questões", "Q"              | `filterPanel.filterByQuestion`, `filterPanel.selectQuestion`, `filterPanel.allQuestions`, `filterPanel.questionPrefix`            |
| `FilterPanel.jsx`                                  | "Filtros", "Filtros indisponíveis", "Selecione um tipo de filtro", "Nenhum"            | `filterPanel.filters`, `filterPanel.filtersUnavailable`, `filterPanel.selectFilterType`, `filterPanel.none`                       |
| `FilterPanel.jsx`                                  | "Limpar todos", "Abrir filtros", "Fechar filtros", "Filtros Ativos"                    | `filterPanel.clearAll`, `filterPanel.openFilters`, `filterPanel.closeFilters`, `filterPanel.activeFilters`                        |
| `FilterPanel.jsx`                                  | "selecionados", "selecionado", "Selecione os valores", "Limpar todos os filtros", "OK" | `filterPanel.selectedPlural`, `filterPanel.selected`, `filterPanel.selectValues`, `filterPanel.clearAllFilters`, `filterPanel.ok` |

### 3.3 Badges e tipos de questão

| Arquivo                                            | Texto hardcoded                                                                       | Sugestão                                                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/survey/widgets/badgeTypes.jsx`     | "NPS", "Campo Aberto", "Múltipla Escolha", "Escolha única" em `questionBadgeTypes`    | Único ponto de verdade para labels de badge; considerar alimentar por `uiTexts.responseDetails` ou manter como fallback se JSON não tiver |
| `src/components/survey/common/WidgetRenderers.jsx` | "Todos", "Campo Aberto", "Múltipla Escolha", "Escolha única", "NPS" nos filter badges | Já usa `sectionUiTexts` / `rootUiTexts.responseDetails` com fallback; alinhar com badgeTypes                                              |

### 3.4 Cards (NPS, Top 3, etc.) – dados por questão

| Arquivo                                          | Texto hardcoded                                                                                                         | Sugestão                                                                                                                                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/survey/common/CardRenderers.jsx` | "NPS Score", "Top 3 Categories", "mentions", "Positive", "Negative", "Nenhum tópico positivo", "Nenhum tópico negativo" | Já usa `uiTexts.responseDetails` com fallback; garantir chaves em todos os JSONs: `npsScore`, `top3Categories`, `mentions`, `positive`, `negative`, `noPositiveTopics`, `noNegativeTopics` |
| `CardRenderers.jsx`                              | Título "Sobre o Estudo" (comparação `title.trim() === "Sobre o Estudo"`)                                                | Evitar lógica que depende de título exato; usar ex.: `component.cardStyleVariant === "sobreEstudo"` ou id do card no JSON                                                                  |

### 3.5 Widgets (gráficos/tabelas) – usados nas questões

| Arquivo                                                                          | Texto hardcoded                                                                                                                                                                                                       | Sugestão                                                                                                                                                                     |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/survey/widgets/WordCloud.jsx`                                    | "Nenhuma palavra para exibir"                                                                                                                                                                                         | `uiTexts.widgets.wordCloud.empty` ou `common.empty.noWords`                                                                                                                  |
| `src/components/survey/common/TableRenderers.jsx`                                | "Nenhuma recomendação encontrada.", "Nenhum dado de segmentação/distribuição/sentimento/NPS...", "Nenhuma categoria positiva/negativa encontrada.", "Nenhum dado analítico encontrado.", "Nenhuma coluna disponível." | `uiTexts.tables.*` ou `common.empty.*` por tipo (recommendations, segmentation, distribution, sentiment, nps, positiveCategories, negativeCategories, analytical, noColumns) |
| `Charts.jsx`, `StackedBarMECE.jsx`, `LineChart.jsx`, `AnalyticalTable.jsx`, etc. | "Nenhum dado disponível", "Nenhuma série configurada", "Nenhuma coluna configurada", "Nenhum valor numérico válido encontrado"                                                                                        | `common.empty.noData`, `common.empty.noSeries`, `common.empty.noColumns`, `common.empty.noValidNumericValue`                                                                 |
| `SlopeGraph.jsx`, `QuadrantChart.jsx`, `Heatmap.jsx`, etc.                       | "Nenhum dado disponível"                                                                                                                                                                                              | Mesmo `common.empty.noData`                                                                                                                                                  |

### 3.6 Seções e conteúdo genérico

| Arquivo                                                   | Texto hardcoded                                                | Sugestão                                                                            |
| --------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/components/survey/common/GenericSectionRenderer.jsx` | "Nenhum componente definido para esta seção." / "...subseção." | `uiTexts.common.noComponentsForSection`, `uiTexts.common.noComponentsForSubsection` |

### 3.7 Sidebar, Header, Export

| Arquivo                 | Texto hardcoded                                                       | Sugestão                                                                           |
| ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `SurveySidebar.jsx`     | "Carregando...", "Carregando dados...", título da pesquisa (fallback) | `surveySidebar.loading`, `surveySidebar.loadingData`, título de `surveyInfo.title` |
| `ExportPreview.jsx`     | Fallbacks para respondents, responseRate, questions                   | Já usa `data?.uiTexts?.surveySidebar?.respondents` etc.                            |
| `NavigationButtons.jsx` | Textos do header                                                      | `uiTexts.surveyHeader.*`                                                           |

### 3.8 Páginas e referência

| Arquivo                   | Texto hardcoded                                                                     | Observação                                                 |
| ------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `JsonViewer.jsx`          | "Nenhum dado disponível"                                                            | Página de dev; pode ficar ou ir para `common.empty.noData` |
| `JsonReference.jsx`       | "Carregando referência...", "Nenhum título/texto/valor/componente encontrado", etc. | Página de documentação; prioridade baixa                   |
| `Index.jsx`, `Export.jsx` | "Carregando..."                                                                     | `common.loading.loading`                                   |

---

## 4. Estratégia de revisão passo a passo

### Fase 1 – Inventário (questões em primeiro lugar)

1. **Questões e ResponseDetails**
   - Abrir `QuestionsList.jsx` e listar toda string entre aspas que seja rótulo, mensagem ou placeholder (loading, erro, empty, tipos de questão, "Q", "Filtrar questão", etc.).
   - Conferir se cada uma está coberta por `safeUiTexts.responseDetails.*` ou por outro nó de `uiTexts`; se não estiver, anotar como hardcoded e propor chave.
   - Repetir para `WidgetRenderers.jsx` (filter pills/badges) e `FilterPanel.jsx` (dropdown "Filtrar por questão", "Selecione uma questão", etc.).

2. **Filtros**
   - Em `FilterPanel.jsx`, percorrer todos os `getFilterText(key, fallback)` e garantir que o `fallback` seja apenas segurança; o valor real deve poder vir de `uiTexts.filterPanel[key]` no JSON.
   - Verificar se o JSON de referência (ex.: em `docs/official_docs/ESTRUTURA_COMPONENTES_JSON.md` ou em um schema) documenta todas as chaves de `filterPanel` usadas no código.

3. **Badges de tipo de questão**
   - Em `badgeTypes.jsx`, os labels em `questionBadgeTypes` são fallback global. Decidir: ou (a) torná-los lidos de `uiTexts.responseDetails` (e badgeTypes só como fallback), ou (b) documentar que são o default e que o JSON pode sobrescrever via `uiTexts.responseDetails`.

### Fase 2 – Tabelas e gráficos usados nas questões

4. **TableRenderers e ChartRenderers**
   - Em `TableRenderers.jsx`, buscar todas as mensagens de empty state ("Nenhuma recomendação...", "Nenhum dado de...", etc.) e atribuir uma chave `uiTexts.tables.*` ou `common.empty.*`.
   - Em cada widget de gráfico (StackedBarMECE, LineChart, AnalyticalTable, WordCloud, etc.), buscar "Nenhum dado disponível", "Nenhuma série/coluna configurada" e unificar em chaves como `common.empty.noData`, `noSeries`, `noColumns`.

5. **Cards (NPS, Top 3)**
   - Em `CardRenderers.jsx`, confirmar que todos os rótulos (NPS Score, Top 3, Positive, Negative, menções) vêm de `uiTexts.responseDetails` e que o fallback em inglês ("NPS Score", "Positive", etc.) é intencional para i18n futuro.
   - Remover ou generalizar a dependência do título exato "Sobre o Estudo" (usar id/variant no JSON).

### Fase 3 – Seções, sidebar, export e páginas

6. **GenericSectionRenderer**
   - Substituir "Nenhum componente definido para esta seção/subseção" por `resolveText("uiTexts.common.noComponentsForSection")` (e equivalente para subseção), com fallback no código.

7. **SurveySidebar, ExportPreview, NavigationButtons**
   - Garantir que todos os textos visíveis usem `uiTexts.surveySidebar`, `uiTexts.surveyHeader`, etc., com fallbacks listados neste documento.

8. **Páginas (Index, Export, JsonViewer, JsonReference)**
   - Mensagens de loading e empty state: usar `common.loading.*` e `common.empty.*` onde fizer sentido.

### Fase 4 – Documentação e contrato

9. **Schema e documentação**
   - No schema do JSON (ex.: `jsonStructureSchema.js` ou documento de estrutura), documentar a árvore completa de `uiTexts` esperada pelo código (filterPanel, responseDetails, common.loading, common.empty, common.errors, surveySidebar, surveyHeader, tables, widgets.wordCloud, etc.).
   - Atualizar `ESTRUTURA_COMPONENTES_JSON.md` (ou equivalente) com a seção de `uiTexts` e exemplos para questões (responseDetails, filterPanel).

10. **Checklist de qualidade**
    - Nenhum rótulo de tipo de questão ("Campo Aberto", "Múltipla Escolha", etc.) deve existir apenas hardcoded: ou em uiTexts ou em um único módulo (ex.: badgeTypes) documentado como default.
    - Todas as mensagens de empty state e loading na área de questões devem ter chave em uiTexts ou em common.
    - "Sobre o Estudo" não deve ser detectado por string exata no código; usar metadado do componente no JSON.

---

## 5. Checklist rápido por arquivo (foco questões)

- [ ] **QuestionsList.jsx** – loading, erro, empty, questionPrefix, questionType labels, filterQuestion, pdf, summary, responsesCount
- [ ] **FilterPanel.jsx** – todos os getFilterText: filterByQuestion, selectQuestion, allQuestions, questionPrefix, tipos de questão, Filtros, selecionados, OK, etc.
- [ ] **WidgetRenderers.jsx** – labels dos filter badges (all, open-ended, multiple-choice, single-choice, nps)
- [ ] **badgeTypes.jsx** – questionBadgeTypes.label: origem única ou uiTexts
- [ ] **CardRenderers.jsx** – NPS Score, Top 3, mentions, Positive, Negative, noPositiveTopics, noNegativeTopics; remover comparação com "Sobre o Estudo"
- [ ] **TableRenderers.jsx** – todas as mensagens "Nenhum.../Nenhuma..."
- [ ] **WordCloud.jsx** – "Nenhuma palavra para exibir"
- [ ] **GenericSectionRenderer.jsx** – "Nenhum componente definido para esta seção/subseção"
- [ ] **Charts.jsx / StackedBarMECE / LineChart / AnalyticalTable / etc.** – "Nenhum dado disponível", "Nenhuma série/coluna configurada"
- [ ] **SurveySidebar.jsx** – Carregando..., título da pesquisa
- [ ] **ExportPreview.jsx** – respondents, responseRate, questions (já parcialmente em uiTexts)

---

## 6. Referências no código

- **uiTexts** – `data?.uiTexts`, merge em `QuestionsList` com `rootUiTexts` e `sectionUiTexts` (responseDetails, filterPanel).
- **Resolução de texto** – `resolveText` em `src/services/dataResolver.js` (path tipo `uiTexts.sections....`).
- **Estrutura de questões no JSON** – `docs/official_docs/ESTRUTURA_COMPONENTES_JSON.md`; seção de respostas com `section.questions[]` e `questionType`.
- **Templates de questão** – `src/config/questionTemplates.js` (define componentes por tipo: nps, multiple-choice, single-choice, open-ended).
- **Tipos de questão válidos** – `src/components/survey/widgets/badgeTypes.jsx` (`VALID_QUESTION_TYPES`, `questionBadgeTypes`).

---

## 7. Ordem sugerida de execução

1. Revisar **QuestionsList.jsx** e **FilterPanel.jsx** (maior impacto nas questões).
2. Unificar rótulos de tipo de questão em **badgeTypes.jsx** e **WidgetRenderers.jsx** com uiTexts.
3. Extrair empty states de **TableRenderers** e widgets de gráfico para `common.empty.*`.
4. Ajustar **CardRenderers** (incluindo "Sobre o Estudo") e **GenericSectionRenderer**.
5. Atualizar schema/docs com a árvore completa de `uiTexts` e validar com um JSON de pesquisa real.

Com isso, a revisão cobre de forma sistemática todos os elementos hardcoded da pesquisa, com foco nas questões e em deixar os textos configuráveis via JSON.

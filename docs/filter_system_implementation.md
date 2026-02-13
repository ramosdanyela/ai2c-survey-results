# Documentacao de Implementacao: Sistema de Filtros Programaticos por Questao

## Indice

1. [Visao Geral da Arquitetura](#1-visao-geral-da-arquitetura)
2. [Problema Anterior](#2-problema-anterior)
3. [Arquivos Criados](#3-arquivos-criados)
4. [Arquivos Modificados](#4-arquivos-modificados)
5. [Fluxo Completo de Dados](#5-fluxo-completo-de-dados)
6. [Decisoes Tecnicas e Logica](#6-decisoes-tecnicas-e-logica)
7. [Formatos de Dados Internos](#7-formatos-de-dados-internos)
8. [Tratamento de Erros](#8-tratamento-de-erros)
9. [Como Migrar para API Real](#9-como-migrar-para-api-real)
10. [Diagrama do Fluxo de Usuario](#10-diagrama-do-fluxo-de-usuario)

---

## 1. Visao Geral da Arquitetura

O sistema segue o principio de **frontend como renderizador puro**: nada de IDs, labels ou valores de filtros e hardcoded no front. Tudo vem de duas chamadas de API (hoje mocadas com JSON local), e os dados filtrados chegam **prontos** do backend, sem nenhum calculo no frontend.

```
+-------------------+       +---------------------+       +-------------------+
|  filterDefinitions|       |   filterService.js  |       | filteredQuestion  |
|  .json (API 1)    | ----> | fetchFilterDefs()   |       | Data.json (API 2) |
+-------------------+       | fetchFilteredData() | <---- +-------------------+
                             +----------+----------+
                                        |
                                        v
                             +----------+----------+
                             | useQuestionFilters  |
                             | (hook central)      |
                             +----------+----------+
                                        |
                        +---------------+---------------+
                        |                               |
                        v                               v
              +---------+----------+          +---------+-----------+
              |   FilterPanel.jsx  |          |  QuestionsList.jsx  |
              | (popover de filtros|          | (renderiza questoes |
              |  por questao)      |          |  com dados filtrados|
              +--------------------+          |  ou originais)      |
                                              +---------------------+
```

### Duas APIs

| API | Quando | O que retorna |
|-----|--------|---------------|
| **API 1** (`fetchFilterDefinitions`) | Uma vez, ao carregar a pesquisa | Quais filtros existem, seus IDs, labels e valores possiveis |
| **API 2** (`fetchFilteredQuestionData`) | Ao clicar OK no filtro de uma questao | O objeto `data` da questao recalculado para o subconjunto filtrado |

---

## 2. Problema Anterior

Antes desta implementacao, o sistema de filtros tinha os seguintes problemas:

### 2a. FilterPanel dependia de `data.sections.attributes`

O `FilterPanel.jsx` original extraia seus filtros de uma secao `"attributes"` do JSON principal:

```js
// ANTES - FilterPanel.jsx (linhas 54-64)
const attributes = useMemo(() => {
  const section = data?.sections?.find((s) => s.id === "attributes");
  if (!section?.subsections?.length) return [];
  return section.subsections.map((sub) => ({
    id: sub.id, name: sub.name, ...
  }));
}, [data]);
```

Isso era fragil: se o JSON nao tivesse a secao `attributes`, ou se os dados da secao nao tivessem `distribution`, os filtros nao apareciam.

### 2b. FilterOptions hardcoded no QuestionsList

O `QuestionsList.jsx` tinha um array fixo de opcoes de filtro:

```js
// ANTES - QuestionsList.jsx (linhas 451-461)
const filterOptions = [
  { value: "state", label: safeUiTexts.filterPanel.state || "Estado" },
  { value: "customerType", label: safeUiTexts.filterPanel.customerType || "Tipo de Cliente" },
  { value: "education", label: safeUiTexts.filterPanel.education || "Educacao" },
];
```

Isso significava que para cada novo filtro era necessario alterar codigo no front.

### 2c. Filtros nao conectados a dados

Os filtros eram apenas visuais - selecionar um filtro nao alterava os dados exibidos nos graficos. Nao existia chamada de API nem processamento de dados filtrados.

### 2d. Hook preparado mas nao integrado

O `useQuestionFilters.js` original tinha um parametro `apiMode` com um TODO comentado, mas nunca era ativado. A logica de buscar filtros da API estava comentada.

---

## 3. Arquivos Criados

### 3a. `src/data/mocks/filterDefinitions.json`

**Proposito:** Mock da API 1 - define quais filtros estao disponiveis para a pesquisa.

**Estrutura:**
```json
{
  "success": true,
  "data": {
    "survey_id": "telmob",
    "filters": [
      {
        "filter_id": "TipodeCliente",    // ID unico - usado como chave
        "label": "Tipo de Cliente",       // Label para exibicao
        "values": [
          {
            "value": "pre-pago",          // Valor enviado para API 2
            "label": "Pre-pago",          // Label exibido no checkbox
            "count": 37                   // Respondentes (opcional, exibido ao lado)
          }
        ]
      }
    ]
  }
}
```

**Logica da escolha de estrutura:**
- `filter_id` e separado de `label` para permitir que o backend use IDs internos diferentes da exibicao
- `values[].value` e separado de `values[].label` pelo mesmo motivo
- `count` e opcional - se presente, e exibido entre parenteses ao lado do checkbox
- A estrutura e um array, nao um objeto, para preservar ordem de exibicao

### 3b. `src/data/mocks/filteredQuestionData.json`

**Proposito:** Mock da API 2 - contem respostas pre-computadas para combinacoes especificas de questao + filtros.

**Estrutura:** Um array `responses` com 9 entradas cobrindo:
- question01 (NPS): filtrado por TipodeCliente=pre-pago, TipodeCliente=pos-pago, Estado=SP
- question02 (open-ended): filtrado por TipodeCliente=pre-pago, TipodeCliente=pos-pago, Estado=SP
- question03 (single-choice): filtrado por TipodeCliente=pre-pago, TipodeCliente=pos-pago, Estado=SP

Cada entrada tem exatamente a mesma estrutura de `question.data` do JSON principal, mas com valores recalculados para o subconjunto.

**Logica do fallback no mock:**
O `filterService.js` primeiro tenta match exato de `question_id` + `applied_filters`. Se nao encontra, retorna a primeira entrada daquela questao (fallback generico). Isso permite que qualquer combinacao de filtros funcione no mock, mesmo que nao tenha dados especificos.

### 3c. `src/services/filterService.js`

**Proposito:** Camada de servico que abstrai as chamadas de API. Hoje importa JSONs locais; amanha substitui por `fetch()`.

**Duas funcoes exportadas:**

#### `fetchFilterDefinitions(surveyId)`
- Simula 300ms de latencia
- Retorna o JSON de definicoes
- Em producao: `GET /api/surveys/{surveyId}/filters`

#### `fetchFilteredQuestionData(surveyId, questionId, filters)`
- Simula 500ms de latencia (para que o spinner de loading seja visivel)
- Busca match exato no JSON por `question_id` + `applied_filters` (via `JSON.stringify` comparison)
- Se nao encontra match exato, retorna fallback (primeira entrada da questao com os filtros substituidos)
- Se nao encontra nada, retorna `{ success: false, error: "..." }`
- Em producao: `POST /api/surveys/{surveyId}/questions/{questionId}/filtered`

**Decisao: por que simular latencia?**
Para que a UI de loading (spinner) seja testavel visualmente. Sem latencia, o loading seria instantaneo e invisivel.

### 3d. `docs/backend_api_specification.md`

Documentacao completa para a equipe de backend, incluindo:
- Schemas de request/response para ambas APIs
- Campos obrigatorios e opcionais
- Logica de calculo por tipo de questao (NPS, open-ended, single-choice)
- Exemplos completos de request/response
- Codigos de erro e validacoes

---

## 4. Arquivos Modificados

### 4a. `src/hooks/useQuestionFilters.js` - Reescrita quase completa

**O que mudou:**

| Antes | Depois |
|-------|--------|
| Parametro `apiMode` (nunca usado) | Removido - agora sempre usa API |
| `availableFilters` state vazio | `filterDefinitions` state carregado da API 1 |
| Sem dados filtrados | `filteredData` state por questao da API 2 |
| Sem funcao de aplicar filtros | `applyFilters(questionId, filters)` async |
| Sem verificacao global | `hasAnyActiveFilters` (useMemo booleano) |

**Novos states:**
```
filterDefinitions     -> Array de filtros da API 1 (carregado no mount)
isLoadingDefinitions  -> Boolean de loading da API 1
definitionsError      -> String de erro da API 1
filteredData          -> { [questionId]: { data, loading, error, appliedFilters } }
```

**Logica do `applyFilters`:**

1. Recebe `questionId` (string como "question01") e `filters` (array no formato interno `[{ filterType, values }]`)
2. Converte formato interno para formato API: `{ filterType: "TipodeCliente" }` -> `{ filter_id: "TipodeCliente" }`
3. Se nao ha filtros com valores, limpa `filteredData[questionId]` e retorna
4. Seta `filteredData[questionId].loading = true`
5. Chama `fetchFilteredQuestionData()` do service
6. Em sucesso: armazena `result.data.data` em `filteredData[questionId].data`
7. Em erro: armazena mensagem em `filteredData[questionId].error`

**Logica do useEffect de carregamento (API 1):**
- Usa flag `cancelled` para evitar race conditions se o componente desmontar antes da resposta
- Carrega uma unica vez quando `resolvedSurveyId` muda
- `resolvedSurveyId` resolve em cascata: `surveyId` prop -> `data?.metadata?.surveyId` -> `"telmob"` (fallback)

**Logica do `clearQuestionFilters`:**
- Alem de limpar o state de filtros, tambem limpa o `filteredData` daquela questao, para que os componentes voltem a usar `question.data` original

**Logica do `clearFilteredData`:**
- Limpa TODOS os dados filtrados de todas as questoes (usado pelo botao "Eliminar filtros")
- Diferente de `clearAllFilters` que limpa os states de filtros - ambos precisam ser chamados juntos

### 4b. `src/components/survey/components/FilterPanel.jsx` - Desacoplado de attributes

**O que mudou:**

| Antes | Depois |
|-------|--------|
| `useMemo` lendo `data.sections.attributes` | Recebe `filterDefinitions` como prop |
| `filterOptions` derivado de attributes + uiTexts | `filterOptions` derivado de `filterDefinitions.map()` |
| `getFilterValues()` lia `attribute.distribution` | `getFilterValues()` le `definition.values.map(v => v.label)` |
| Botao OK apenas fechava o painel | Botao OK chama `onApplyFilters(activeFilters)` |
| "Limpar todos" so limpava state local | "Limpar todos" tambem chama `onApplyFilters([])` |

**Novas props:**
```
filterDefinitions    -> Array de filtros da API 1 (passado pelo QuestionsList)
onApplyFilters       -> Callback chamado ao clicar OK (ou limpar)
```

**Logica do `handleOkClick`:**
```js
const handleOkClick = () => {
  if (onApplyFilters) {
    onApplyFilters(activeFilters);  // Dispara API 2 via callback
  }
  setIsPanelOpen(false);            // Fecha o painel (UX)
};
```

**Logica do `handleClearAll`:**
Limpa state local E notifica o pai via ambos callbacks (`onFiltersChange` para state e `onApplyFilters` com array vazio para limpar dados).

**Logica de `getFilterValueCount`:**
Nova funcao que busca o `count` de cada valor nos `filterDefinitions`. Se encontra, retorna o numero; se nao, retorna `null`. Quando nao-null, e exibido como `(37)` ao lado do checkbox.

**Logica do estado disabled:**
O `<Select>` de tipo de filtro fica `disabled` quando `filterOptions.length === 0` (definicoes nao carregaram ou falharam). O placeholder muda para "Filtros indisponiveis" nesse caso.

### 4c. `src/components/survey/common/QuestionsList.jsx` - Integracoes e novos comportamentos

**Mudanca 1: Destruct do hook expandido**

Antes extraia 7 valores do hook. Agora extrai 15:
```js
const {
  questionFilters, setQuestionFilters, getQuestionFilters,
  updateQuestionFilter, removeFilterValue, clearQuestionFilters,
  hasActiveFilters,
  // NOVOS:
  clearAllFilters, hasAnyActiveFilters,
  filterDefinitions, isLoadingDefinitions, definitionsError,
  filteredData, applyFilters, clearFilteredData,
} = useQuestionFilters({ data });
```

O parametro `apiMode: false` foi removido - o hook agora sempre carrega definicoes.

**Mudanca 2: `renderQuestionComponents` - dados filtrados**

A funcao de renderizacao agora verifica 3 estados antes de renderizar:

```
1. filteredData[questionId]?.loading === true  -> Spinner de loading
2. filteredData[questionId]?.error             -> Mensagem de erro
3. filteredData[questionId]?.data              -> Usa dados filtrados
4. Nenhum dos acima                            -> Usa question.data original
```

A substituicao e feita via spread:
```js
const effectiveQuestion = qFilteredData?.data
  ? { ...question, data: { ...question.data, ...qFilteredData.data } }
  : question;
```

Isso faz um merge: campos que existem no `filteredData` sobrescrevem os originais, mas campos que so existem no original sao preservados.

**Validacao por componente:** Apos o merge, cada componente do template e validado individualmente antes de renderizar. O dataPath de cada componente e resolvido e verificado:
- Se o dado for `null` ou `undefined` -> componente nao renderiza
- Se o dado for um array vazio `[]` -> componente nao renderiza
- Para `npsScoreCard` (dataPath = `question.data`): verifica se `npsScore` especificamente e nao-null

Isso garante que se a API retornar apenas alguns campos, somente os componentes com dados validos aparecem. Nao ha risco de mostrar dados inconsistentes (ex: NPS score filtrado com grafico nao filtrado).

**Decisao: por que `{ ...question.data, ...qFilteredData.data }` e nao substituicao direta?**
Porque os mocks podem nao incluir todos os campos que um tipo de questao precisa. O merge garante que campos nao retornados pelo filtro mantenham seus valores originais, evitando erros de componentes que esperam campos especificos.

**Mudanca 3: `resolveApiQuestionId` - ponte de IDs**

As questoes no JSON tem dois IDs:
- `question.id` = numerico (1, 2, 3) - usado internamente pelo React (keys, state)
- `question.question_id` = string ("question01", "question02") - usado pela API

A funcao `resolveApiQuestionId` faz a ponte:
```js
const resolveApiQuestionId = useCallback((questionId) => {
  const question = allAvailableQuestions.find(q => q.id === questionId);
  return question?.question_id || questionId;
}, [allAvailableQuestions]);
```

E usada em `handleApplyFilters` e `handleRemoveFilterValue` para converter o ID numerico (que o componente usa) para o ID string (que a API espera).

**Mudanca 4: `handleRemoveFilterValue` - re-aplica filtros ao remover pill**

Quando o usuario clica no X de uma filter pill, nao basta remover o valor do state - tambem precisa re-chamar a API com os filtros restantes. A logica:

1. Remove o valor do state via `removeFilterValue(questionId, filterType, value)`
2. Calcula os filtros remanescentes manualmente (porque o state ainda nao atualizou - setState e async)
3. Chama `applyFilters()` com os filtros remanescentes
4. Se nao sobrou nenhum filtro, `applyFilters` limpa o `filteredData` (restaura dados originais)

**Decisao: por que calcular filtros manualmente?**
O `removeFilterValue` usa `setState` que e assincrono em React. Se lesse `questionFilters` logo apos chamar `removeFilterValue`, ainda teria o valor antigo. Por isso a funcao calcula os filtros restantes a partir do estado atual (ponto-in-time).

**Mudanca 5: `handleClearAllFilters` - limpa tudo**

```js
const handleClearAllFilters = useCallback(() => {
  clearAllFilters();     // Limpa state dos filtros (questionFilters = {})
  clearFilteredData();   // Limpa dados filtrados (filteredData = {})
}, [clearAllFilters, clearFilteredData]);
```

Ambos precisam ser chamados: `clearAllFilters` para as pills sumirem, `clearFilteredData` para os componentes voltarem aos dados originais.

**Mudanca 6: Botao "Eliminar filtros"**

Renderizado condicionalmente quando `hasAnyActiveFilters` e `true`:
```jsx
{hasAnyActiveFilters && (
  <div className="flex justify-end">
    <button onClick={handleClearAllFilters} ...>
      <X /> Eliminar filtros
    </button>
  </div>
)}
```

Posicionado antes da grid de questoes (no topo da lista).

**Mudanca 7: FilterPanel no Popover recebe novas props**

```jsx
<FilterPanel
  filterDefinitions={filterDefinitions}          // NOVO: definicoes da API 1
  onFiltersChange={(newFilters) =>               // Existente: atualiza state
    handleQuestionFiltersChange(question.id, newFilters)
  }
  onApplyFilters={(filters) => {                 // NOVO: ao clicar OK
    handleQuestionFiltersChange(question.id, filters);  // Atualiza state
    handleApplyFilters(question.id, filters);           // Chama API 2
    handleQuestionFilterOpenChange(question.id, false); // Fecha popover
  }}
  hideQuestionFilters={true}
  initialFilters={getQuestionFilters(question.id)}
/>
```

**Logica do `onApplyFilters`:** Tres acoes em sequencia:
1. Atualiza o state local dos filtros (para as pills refletirem imediatamente)
2. Chama a API 2 (async, vai mostrar spinner e depois atualizar)
3. Fecha o popover (UX: nao fica aberto esperando)

**Mudanca 8: Icone de filtro com estado disabled**

```jsx
className={`... ${
  isLoadingDefinitions || definitionsError
    ? "text-muted-foreground/40 cursor-not-allowed"
    : hasActiveFilters(question.id)
      ? "bg-[hsl(var(--custom-blue))]/20 text-[hsl(var(--custom-blue))] cursor-pointer"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
}`}
title={definitionsError ? "Filtros indisponiveis" : undefined}
```

3 estados visuais:
- **Disabled** (cinza, cursor not-allowed): quando definicoes estao carregando ou falharam
- **Ativo** (azul com background): quando a questao tem filtros aplicados
- **Normal** (cinza, hover): estado padrao

**Mudanca 9: `filterOptions` agora e programatico**

```js
// ANTES:
const filterOptions = [
  { value: "state", label: "Estado" },
  { value: "customerType", label: "Tipo de Cliente" },
  { value: "education", label: "Educacao" },
];

// DEPOIS:
const filterOptions = filterDefinitions.map((f) => ({
  value: f.filter_id,
  label: f.label,
}));
```

Se amanha a API retornar um 4o filtro "Faixa Etaria", ele aparece automaticamente sem alterar codigo.

**Mudanca 10: Hooks antes dos early returns**

Todos os `useCallback` (`resolveApiQuestionId`, `handleApplyFilters`, `handleRemoveFilterValue`, `handleClearAllFilters`) foram posicionados ANTES das linhas `if (loading) return ...` para respeitar a regra do React: hooks nao podem ser chamados condicionalmente.

Ordem no arquivo:
```
Linhas 18-72:   useState, useQuestionFilters, useState (todos os hooks de estado)
Linhas 77-165:  useQuestionTypeFilter, useState, useRef, useMemo (mais hooks)
Linhas 172-255: useCallback (getQuestionsFromResponseDetails, renderQuestionComponents)
Linhas 259-317: useMemo (allAvailableQuestions, exportQuestionDisplayNumber)
Linhas 336-421: useEffect (scroll, selection)
Linhas 424-457: useCallback (resolveApiQuestionId, handleApplyFilters, handleRemoveFilterValue, handleClearAllFilters)
Linha 460:      PRIMEIRO early return (if loading)
Linha 469:      SEGUNDO early return (if no questions and no surveyInfo)
Linha 474:      TERCEIRO early return (if no questions)
Linha 497+:     Funcoes normais e JSX de renderizacao
```

---

## 5. Fluxo Completo de Dados

### 5a. Inicializacao (pagina carrega)

```
1. QuestionsList monta
2. useQuestionFilters() e chamado
3. useEffect no hook dispara fetchFilterDefinitions("telmob")
4. filterService.js importa filterDefinitions.json e retorna apos 300ms
5. setFilterDefinitions([...]) atualiza state
6. filterDefinitions flui para o QuestionsList
7. QuestionsList gera filterOptions a partir de filterDefinitions.map()
8. FilterPanel recebe filterDefinitions como prop
```

### 5b. Usuario aplica filtro

```
1. Usuario abre accordion de Q1
2. Clica no icone de filtro -> abre Popover com FilterPanel
3. FilterPanel renderiza filtros de filterDefinitions:
   - Dropdown com "Tipo de Cliente" e "Estado"
   - Seleciona "Tipo de Cliente" -> checkboxes: Pre-pago (37), Controle (35), Pos-pago (28)
4. Marca "Pre-pago"
   - handleValueToggle atualiza activeFilters local
   - onFiltersChange propaga para QuestionsList -> questionFilters[questionId] atualizado
   - Pills de filtro aparecem no header
5. Clica OK
   - onApplyFilters callback dispara:
     a. handleQuestionFiltersChange(question.id, filters) -> confirma state
     b. handleApplyFilters(question.id, filters):
        - resolveApiQuestionId(1) -> "question01"
        - applyFilters("question01", [{filterType:"TipodeCliente", values:["Pre-pago"]}])
        - Converte para API format: [{filter_id:"TipodeCliente", values:["Pre-pago"]}]
        - filteredData["question01"] = { loading: true }
        - fetchFilteredQuestionData("telmob", "question01", apiFilters) (500ms delay)
        - Retorna match do JSON mock
        - filteredData["question01"] = { data: {...}, loading: false }
     c. handleQuestionFilterOpenChange(false) -> fecha popover
6. renderQuestionComponents(question) detecta filteredData["question01"].data
   - Cria effectiveQuestion com data do filtro
   - Componentes re-renderizam com dados filtrados (NPS Score -13.5 ao inves de -21.0)
7. Sumario permanece oculto (hasActiveFilters retorna true)
```

### 5c. Usuario remove pill de filtro

```
1. Usuario clica X na pill "Tipo de Cliente: Pre-pago" no header da Q1
2. handleRemoveFilterValue(questionId, "TipodeCliente", "Pre-pago"):
   - removeFilterValue atualiza questionFilters (remove valor)
   - Calcula filtros restantes (pode ser vazio)
   - Se vazio: applyFilters limpa filteredData["question01"]
   - Se tem outros: applyFilters chama API 2 com filtros restantes
3. Se nao sobrou filtro:
   - hasActiveFilters(questionId) = false
   - Sumario reaparece
   - Componentes usam question.data original
```

### 5d. Usuario clica "Eliminar filtros"

```
1. handleClearAllFilters():
   - clearAllFilters() -> questionFilters = {}
   - clearFilteredData() -> filteredData = {}
2. hasAnyActiveFilters = false -> botao "Eliminar filtros" desaparece
3. Todas as questoes voltam a exibir dados originais
4. Todos os sumarios reaparecem
5. Todas as pills somem
```

---

## 6. Decisoes Tecnicas e Logica

### 6a. Por que dois states separados (`questionFilters` e `filteredData`)?

`questionFilters` controla a **UI** (pills, estado do icone, visibilidade do sumario).
`filteredData` controla os **dados** (o que os componentes renderizam).

Separar permite que:
- As pills aparecam imediatamente ao selecionar (sync)
- O spinner apareca enquanto a API responde (async)
- Um erro na API nao afete a UI dos filtros

### 6b. Por que `JSON.stringify` para comparar filtros no mock?

```js
JSON.stringify(r.applied_filters) === JSON.stringify(filters)
```

Deep comparison simples para arrays de objetos. Em producao nao e necessario (o backend recebe e processa). No mock, garante match exato da combinacao de filtros.

### 6c. Por que `useCallback` e nao funcoes normais?

Funcoes como `handleApplyFilters`, `handleRemoveFilterValue` etc. sao passadas como props ou usadas em dependencias de outros hooks. `useCallback` garante estabilidade referencial, evitando re-renders desnecessarios.

### 6d. Por que o FilterPanel mantem `onFiltersChange` alem de `onApplyFilters`?

- `onFiltersChange` dispara a CADA mudanca de checkbox (para que as pills atualizem em tempo real no QuestionsList)
- `onApplyFilters` dispara apenas no OK (para que a API 2 seja chamada uma unica vez, nao a cada checkbox)

Sem `onFiltersChange`, as pills so atualizariam apos clicar OK. Com ambos, a UX e mais responsiva.

### 6e. Por que `{ ...question.data, ...qFilteredData.data }` (merge) + validacao por componente?

O merge e feito como primeira camada de protecao:
- Campos retornados pelo filtro sobrescrevem os originais
- Campos nao retornados preservam o valor original

Alem do merge, cada componente e validado antes de renderizar (segunda camada):
- Se o dado resolvido for `null`, `undefined` ou array vazio `[]`, o componente e simplesmente omitido
- Isso evita mostrar dados inconsistentes (ex: score filtrado com grafico nao filtrado)
- Se a API retornar apenas `npsScore` sem `npsStackedChart`, so o Score Card aparece

A validacao usa `resolveDataPath` para resolver o dataPath do template de cada componente e `filter(Boolean)` para limpar nulls do array final.

### 6f. Por que simular latencia nos mocks?

- 300ms para API 1: rapido o suficiente para nao atrasar o carregamento, lento o suficiente para testar o estado `isLoadingDefinitions`
- 500ms para API 2: lento o suficiente para o spinner ser visivel e testavel

### 6g. Por que `cancelled` flag no useEffect?

```js
useEffect(() => {
  let cancelled = false;
  const load = async () => {
    const result = await fetch...
    if (!cancelled) setState(result);
  };
  load();
  return () => { cancelled = true; };
}, [dep]);
```

Padrao de React para evitar atualizar state de componente desmontado. Se o usuario navegar para outra pagina enquanto a API responde, o `cancelled = true` no cleanup impede o `setState`.

---

## 7. Formatos de Dados Internos

### Formato interno de filtros (React state)
```js
questionFilters = {
  1: [                                    // question.id (numerico)
    { filterType: "TipodeCliente", values: ["Pre-pago"] },
    { filterType: "Estado", values: ["SP", "RJ"] }
  ],
  2: [
    { filterType: "TipodeCliente", values: ["Pos-pago"] }
  ]
}
```

### Formato da API (request body)
```js
filters = [
  { filter_id: "TipodeCliente", values: ["Pre-pago"] },
  { filter_id: "Estado", values: ["SP", "RJ"] }
]
```

### Conversao (interno -> API)
```js
const apiFilters = filters
  .filter(f => f.values?.length > 0)
  .map(f => ({ filter_id: f.filterType, values: f.values }));
```

### Formato do filteredData (state)
```js
filteredData = {
  "question01": {        // question_id (string, da API)
    data: {              // O objeto data da questao recalculado
      npsScore: -13.5,
      npsStackedChart: [...]
    },
    loading: false,
    error: null,
    appliedFilters: [{ filter_id: "TipodeCliente", values: ["Pre-pago"] }]
  }
}
```

---

## 8. Tratamento de Erros

| Cenario | Onde trata | Comportamento |
|---------|-----------|---------------|
| API 1 falha (sem definicoes) | `useQuestionFilters` useEffect | `definitionsError` setado, `filterDefinitions = []` |
| API 1 falha (UI) | `QuestionsList.jsx` icone de filtro | Icone cinza, `cursor-not-allowed`, tooltip "Filtros indisponiveis" |
| API 1 falha (FilterPanel) | `FilterPanel.jsx` Select | `disabled={filterOptions.length === 0}`, placeholder "Filtros indisponiveis" |
| API 2 falha (sem dados) | `useQuestionFilters` applyFilters | `filteredData[id].error` setado |
| API 2 falha (UI) | `renderQuestionComponents` | Mensagem vermelha "Erro ao carregar dados filtrados" |
| API 2 loading | `renderQuestionComponents` | Spinner azul + texto "Carregando dados filtrados..." |
| Filtros vazios apos remocao | `applyFilters` | Limpa `filteredData[id]`, restaura dados originais |
| Componente desmonta durante API | `useEffect` cleanup | Flag `cancelled` impede setState |
| Dado de componente ausente (null/undefined) | `renderQuestionComponents` | Componente nao renderiza (omitido silenciosamente) |
| Dado de componente vazio (array []) | `renderQuestionComponents` | Componente nao renderiza (omitido silenciosamente) |
| npsScore null (npsScoreCard) | `renderQuestionComponents` | NPS Score Card nao renderiza |
| Todos os campos vazios/ausentes | `renderQuestionComponents` | Nenhum componente renderiza para a questao |

---

## 9. Como Migrar para API Real

### Passo 1: Alterar `filterService.js`

```js
// ANTES (mock):
export const fetchFilterDefinitions = async (surveyId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return filterDefinitionsJson;
};

// DEPOIS (real):
export const fetchFilterDefinitions = async (surveyId) => {
  const response = await fetch(`/api/surveys/${surveyId}/filters`);
  return response.json();
};
```

```js
// ANTES (mock):
export const fetchFilteredQuestionData = async (surveyId, questionId, filters) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const match = filteredQuestionDataJson.responses.find(...);
  ...
};

// DEPOIS (real):
export const fetchFilteredQuestionData = async (surveyId, questionId, filters) => {
  const response = await fetch(
    `/api/surveys/${surveyId}/questions/${questionId}/filtered`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters }),
    }
  );
  return response.json();
};
```

### Passo 2: Remover imports de JSON
Deletar as linhas de import dos JSONs mock no `filterService.js`.

### Passo 3: (Opcional) Remover arquivos mock
Deletar `src/data/mocks/filterDefinitions.json` e `src/data/mocks/filteredQuestionData.json`.

**Nenhuma alteracao necessaria** em `useQuestionFilters.js`, `FilterPanel.jsx` ou `QuestionsList.jsx`.

---

## 10. Diagrama do Fluxo de Usuario

```
  [Pagina carrega]
        |
        v
  fetchFilterDefinitions() -----> filterDefinitions armazenadas no hook
        |                                    |
        v                                    v
  [Usuario abre questao]          [Disponivel para todos os FilterPanels]
        |
        v
  [Clica icone filtro] ---------> [Popover abre com FilterPanel]
        |                                    |
        |                          FilterPanel renderiza filtros
        |                          PROGRAMATICAMENTE da API 1
        |                          (IDs, labels, values - tudo dinamico)
        |                                    |
        v                                    v
  [Seleciona valores]             [Checkboxes com labels e counts da API]
        |                                    |
        v                                    v
  [Clica OK] ---------> 1. Sumario oculto (hasActiveFilters = true)
        |                2. Pills aparecem no header
        |                3. Spinner aparece nos componentes
        |                4. fetchFilteredQuestionData() chamada
        |                5. Resposta chega com dados PRONTOS
        |                6. Componentes re-renderizam
        |
        v
  [Filtra outra questao?] -------> Filtro anterior se mantem intacto
        |
        v
  [Eliminar filtros?] -----------> clearAllFilters() + clearFilteredData()
        |                          Tudo volta ao normal
        v
  [Navegar para outra secao?] ---> Filtros sao limpos (state local do componente)
```

# Migração: Mocks → APIs reais

Este documento descreve **passo a passo** como trocar os dados mock (JSON locais) pelas chamadas às APIs reais, para quem for integrar ou manter este frontend.

---

## Visão geral

O frontend usa **dois serviços** que hoje retornam dados mock:

| Serviço | Arquivo | Função principal | Consumidor |
|--------|---------|-------------------|------------|
| **Dados do relatório** | `src/services/surveyDataService.js` | `fetchSurveyData()` | `src/hooks/useSurveyData.js` |
| **Filtros** | `src/services/filterService.js` | `fetchFilterDefinitions()`, `fetchFilteredQuestionData()` | `src/hooks/useQuestionFilters.js` |

Nenhum componente chama a API diretamente: tudo passa por esses serviços e hooks. Por isso, **trocar mocks por API real se resume a alterar esses dois arquivos** (e opcionalmente configurar URL base e tratamento de erros).

---

## Parte 1: Dados do relatório (survey)

### O que existe hoje

- **Arquivo:** `src/services/surveyDataService.js`
- **Comportamento:** Importa um JSON estático e o devolve como se fosse a resposta da API.
- **Origem do mock:** `src/data/tests-06-02/69403fe77237da9a4cf8979b_report_json.json`

### Passo 1.1 – Definir URL da API do relatório

Decida o endpoint que o backend expõe. Exemplo (conforme documentação do projeto):

- **Sugestão:** `GET /api/surveys/{surveyId}/report`
- O frontend hoje **não envia** `surveyId` na função `fetchSurveyData()`; o hook `useSurveyData` não recebe parâmetros. Você pode:
  - Obter `surveyId` de rota (ex.: `/relatorio/:surveyId`), ou
  - De um arquivo de configuração/ambiente (ex.: `VITE_API_SURVEY_ID`), ou
  - Manter um ID fixo até que a aplicação tenha roteamento por pesquisa.

### Passo 1.2 – Alterar `surveyDataService.js`

Substitua o corpo da função para usar `fetch` (ou seu cliente HTTP) na URL real.

**Antes (mock):**

```javascript
import surveyDataJson from "../data/tests-06-02/69403fe77237da9a4cf8979b_report_json.json";

export const fetchSurveyData = async () => {
  return Promise.resolve(surveyDataJson);
};
```

**Depois (exemplo com API real):**

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const fetchSurveyData = async (surveyId) => {
  const url = surveyId
    ? `${API_BASE}/api/surveys/${surveyId}/report`
    : `${API_BASE}/api/surveys/report`; // ou o endpoint que o backend definir
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao carregar relatório: ${response.status}`);
  }

  const data = await response.json();
  // Se o backend devolver { success, data }, desempacote:
  return data.data ?? data;
};
```

- Ajuste a URL e o uso de `surveyId` conforme o contrato do backend.
- Se o backend retornar o relatório dentro de um envelope (ex.: `{ success: true, data: { ... } }`), use `data.data ?? data` como no exemplo para que o restante do app continue recebendo só o objeto do relatório (com `metadata`, `sections`, etc.).

### Passo 1.3 – (Opcional) Passar `surveyId` para o hook

Se passar a usar `surveyId` na URL:

1. Onde a aplicação sabe o `surveyId` (rota, config, etc.), chame o hook com esse valor (se o hook for estendido para aceitar parâmetro) ou
2. Altere `surveyDataService.js` para ler `surveyId` de um módulo de config/ambiente, como no exemplo acima.

O formato esperado pelo frontend para o payload do relatório está em **`docs/backend/INSTRUCOES_BACKEND_GET_RELATORIO_JSON.md`** (obrigatório: `metadata` e `sections`; o resto é flexível).

---

## Parte 2: Filtros (definições + dados filtrados por questão)

### O que existe hoje

- **Arquivo:** `src/services/filterService.js`
- **Duas funções mock:**
  1. **`fetchFilterDefinitions(surveyId)`** – lista de filtros disponíveis (ex.: Estado, Tipo de Cliente).
  2. **`fetchFilteredQuestionData(surveyId, questionId, filters)`** – dados agregados de uma questão com filtros aplicados.
- **Mocks:**  
  - `src/data/mocks/filterDefinitions.json`  
  - `src/data/mocks/filteredQuestionData.json`

O hook **`useQuestionFilters`** usa apenas essas duas funções; os componentes usam o hook. Portanto, ao implementar as chamadas reais nessas duas funções, a UI de filtros passa a usar a API.

---

### Passo 2.1 – API 1: Definições de filtros

**Endpoint esperado (conforme especificação do projeto):**  
`GET /api/surveys/{surveyId}/filters`

**Resposta esperada (exemplo):**

```json
{
  "success": true,
  "data": {
    "survey_id": "69403fe77237da9a4cf8979b",
    "filters": [
      {
        "filter_id": "estado",
        "label": "Estado",
        "values": [
          { "value": "SP", "label": "São Paulo", "count": 450 },
          { "value": "RJ", "label": "Rio de Janeiro", "count": 320 }
        ]
      }
    ]
  }
}
```

**Importante:** O frontend usa o campo **`filter_id`** em cada filtro (em `FilterPanel.jsx` e `QuestionsList.jsx`). Se o backend enviar **`id`** em vez de `filter_id`, você pode normalizar no serviço (ex.: `id: f.id ?? f.filter_id` ao montar o objeto que o restante do app consome) ou pedir que a API retorne `filter_id`.

Substitua em `filterService.js` a implementação de **`fetchFilterDefinitions`**:

**Antes (mock):**

```javascript
import filterDefinitionsJson from "../data/mocks/filterDefinitions.json";
// ...
export const fetchFilterDefinitions = async (surveyId) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return filterDefinitionsJson;
};
```

**Depois (exemplo com API real):**

```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const fetchFilterDefinitions = async (surveyId) => {
  const url = `${API_BASE}/api/surveys/${surveyId}/filters`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao carregar filtros: ${response.status}`);
  }

  const json = await response.json();
  // Normalize: se o backend usar "id" em vez de "filter_id"
  if (json?.data?.filters) {
    json.data.filters = json.data.filters.map((f) => ({
      ...f,
      filter_id: f.filter_id ?? f.id,
    }));
  }
  return json;
};
```

Remova o `import` do `filterDefinitions.json` quando deixar de usar o mock.

---

### Passo 2.2 – API 2: Dados filtrados por questão

**Endpoint esperado (conforme comentários no próprio serviço):**  
`POST /api/surveys/{surveyId}/questions/{questionId}/filtered`  
**Body:** `{ "filters": [ { "filter_id": "estado", "values": ["SP", "RJ"] } ] }`

**Resposta esperada (exemplo):**

```json
{
  "success": true,
  "data": {
    "survey_id": "69403fe77237da9a4cf8979b",
    "question_id": "pergunta1",
    "question_type": "open-ended",
    "applied_filters": [{ "filter_id": "estado", "values": ["SP", "RJ"] }],
    "data": {
      "sentimentDivergentChart": [ ... ],
      "topCategoriesCards": [ ... ]
    }
  }
}
```

A estrutura interna de `data` deve seguir os formatos por tipo de questão (NPS, múltipla escolha, aberta, etc.) descritos em **`docs/backend/PEDROZA_QUESTIONS_API_SPEC.md`**.

Substitua em `filterService.js` a implementação de **`fetchFilteredQuestionData`**:

**Antes (mock):** uso de `filteredQuestionDataJson` e lógica de match/fallback.

**Depois (exemplo com API real):**

```javascript
export const fetchFilteredQuestionData = async (
  surveyId,
  questionId,
  filters,
) => {
  const url = `${API_BASE}/api/surveys/${surveyId}/questions/${questionId}/filtered`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filters }),
  });

  if (!response.ok) {
    const msg = (await response.json().catch(() => ({}))).message ?? response.statusText;
    return { success: false, error: msg };
  }

  const json = await response.json();
  if (!json.success || !json.data) {
    return { success: false, error: json.message ?? "Resposta inválida" };
  }
  return { success: true, data: json.data };
};
```

Remova o `import` de `filteredQuestionData.json` e qualquer lógica que leia desse arquivo.

---

### Passo 2.3 – Conferir formato de filtros enviados

O hook **`useQuestionFilters`** já converte o formato interno para o da API:

- Interno: `{ filterType, values }` (ex.: `{ filterType: "estado", values: ["SP"] }`).
- Enviado à API: `{ filter_id, values }` (ex.: `{ filter_id: "estado", values: ["SP"] }`).

Não é necessário alterar o hook ao trocar mocks por API, desde que o backend espere um array de objetos com `filter_id` e `values` no body do POST.

---

## Parte 3: Configuração e ambiente

### URL base da API

- Defina uma variável de ambiente para a URL base (ex.: `VITE_API_BASE_URL`) e use-a em ambos os serviços, como nos exemplos.
- Exemplo em **`.env`** (ou `.env.production`):

```env
VITE_API_BASE_URL=https://api.seudominio.com
```

Em desenvolvimento:

```env
VITE_API_BASE_URL=http://localhost:3001
```

Assim o mesmo código funciona em dev e produção apenas trocando o `.env`.

### Autenticação (se precisar)

Se a API exigir token (ex.: Bearer):

1. Crie um pequeno módulo que obtenha o token (store, contexto, cookie, etc.).
2. Nos `fetch`, adicione o header, por exemplo:

```javascript
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAccessToken()}`,
}
```

Repita o padrão em `fetchSurveyData`, `fetchFilterDefinitions` e `fetchFilteredQuestionData` se todos exigirem autenticação.

---

## Parte 4: Checklist final

- [ ] **surveyDataService.js:** `fetchSurveyData` chama a API do relatório; URL e uso de `surveyId` ajustados; resposta desempacotada se vier em envelope.
- [ ] **filterService.js:** `fetchFilterDefinitions` chama `GET .../filters` e normaliza `filter_id` se o backend usar `id`.
- [ ] **filterService.js:** `fetchFilteredQuestionData` chama `POST .../filtered` com body `{ filters }` e retorna `{ success, data }` ou `{ success: false, error }`.
- [ ] Removidos os `import` dos JSONs de mock em `filterService.js` e `surveyDataService.js`.
- [ ] Variável de ambiente `VITE_API_BASE_URL` (ou equivalente) configurada e usada nos serviços.
- [ ] Se a API for autenticada, headers de autorização adicionados nas três chamadas.
- [ ] Testes manuais: carregar relatório, abrir painel de filtros, aplicar filtros em uma questão e conferir se os dados exibidos vêm da API.

---

## Referências no repositório

- Contrato do relatório (estrutura do JSON): **`docs/backend/INSTRUCOES_BACKEND_GET_RELATORIO_JSON.md`**
- Contrato de questões e filtros (endpoints e formatos): **`docs/backend/PEDROZA_QUESTIONS_API_SPEC.md`**
- Consumidores dos serviços: **`src/hooks/useSurveyData.js`**, **`src/hooks/useQuestionFilters.js`**

Com isso, o cliente que receber o código tem um roteiro objetivo para trocar os mocks pelas APIs reais sem precisar alterar componentes ou hooks.

# Instruções para o Backend: GET do relatório com estrutura idêntica ao JSON do frontend

Este documento descreve **como o backend deve expor um GET** que devolve o relatório da pesquisa no **mesmo formato** que o frontend consome (referência: `json_file_app_05-02.json`). O frontend é **genérico**: renderiza o que vier em `sections`; a estrutura foi pensada para ser **flexível** (número e tipo de seções, componentes, etc. podem variar).

---

## Objetivo

- **Endpoint sugerido:** `GET /api/surveys/{surveyId}/report` (ou o que o time definir).
- **Response:** corpo da resposta = objeto JSON com **pelo menos** `metadata` e `sections`. O restante é opcional e flexível.
- **Origem dos dados:** banco de dados do backend, montado nesse formato.

O frontend não espera um envelope tipo `{ "success": true, "data": { ... } }` para esse endpoint — espera o objeto do relatório na raiz (ou, se o backend usar envelope, o frontend consumirá `response.data`).

---

## O que é obrigatório vs flexível

O JSON foi desenhado para ser **flexível**. Na prática:

| Nível                      | Obrigatório                                                                                                                        | Flexível                                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Raiz**                   | Apenas **`metadata`** (object) e **`sections`** (array).                                                                           | `uiTexts`, `surveyInfo` e qualquer outra chave na raiz são **opcionais**. O frontend pode ter fallbacks ou simplesmente não exibir se não existir.     |
| **Seções**                 | Nada é rigidamente obrigatório.                                                                                                    | Número de seções, `id`, `index`, `name`, `icon`, presença de `subsections` ou `questions` ou `data` — tudo pode variar conforme o relatório.           |
| **Subseções**              | Nada obrigatório.                                                                                                                  | Quantas forem; com ou sem `components`; estrutura por subseção pode ser diferente.                                                                     |
| **Componentes**            | Para renderizar, o frontend precisa de `type` (e, quando há dados dinâmicos, de `dataPath` apontando para algo em `section.data`). | Quantidade e tipos de componentes são livres; podem existir só cards, só gráficos, ou qualquer combinação.                                             |
| **Dados (`section.data`)** | Nenhuma chave é obrigatória.                                                                                                       | As chaves dependem dos `dataPath` usados nos componentes (ex.: `sectionData.recommendationsTable` → deve existir `section.data.recommendationsTable`). |

**Resumo:** O **mínimo** para o frontend aceitar o payload é um objeto com **`metadata`** e **`sections`** (array; pode ser vazio). Todo o resto — número de seções, estrutura de cada seção, componentes, textos, surveyInfo — é **flexível** e definido conforme a necessidade do relatório.

**Não usar:** `sectionsConfig`, `renderSchema` (nomenclaturas antigas; o frontend não usa).

---

### 1. `metadata` (obrigatório)

Único bloco **obrigatório** além do array `sections`. Exemplo:

```json
{
  "metadata": {
    "version": "1.0",
    "language": "pt-BR",
    "surveyId": "telmob"
  }
}
```

- `version`: string (ex.: `"1.0"`).
- `language`: string (ex.: `"pt-BR"`, `"en-US"`).
- `surveyId`: string, identificador da pesquisa.

Os campos dentro de `metadata` podem variar; o frontend usa sobretudo para contexto. O importante é que o objeto `metadata` exista.

---

### 2. `sections` (obrigatório como campo; conteúdo flexível)

**Obrigatório:** existir a chave `sections` e ser um **array** (pode ser `[]`).

**Flexível:** quantidade de seções, ids, estrutura de cada seção. Cada item do array é um objeto que **pode** ter, entre outros:

| Campo         | Tipo   | Obrigatório? | Descrição                                                     |
| ------------- | ------ | ------------ | ------------------------------------------------------------- |
| `id`          | string | Não          | ID único da seção (recomendado para navegação)                |
| `index`       | number | Não          | Ordem de exibição                                             |
| `name`        | string | Não          | Nome no menu                                                  |
| `icon`        | string | Não          | Nome do ícone Lucide                                          |
| `subsections` | array  | Não          | Subseções com `components` e opcionalmente `data`             |
| `questions`   | array  | Não          | Usado em seções do tipo “análise por questão”                 |
| `data`        | object | Não          | Dados da seção; chaves conforme os `dataPath` dos componentes |

Exemplos de como as seções podem ser usadas (tudo opcional):

- **Seção com subseções e componentes** — `subsections[]` com `id`, `index`, `name`, `icon`, `components[]`. Cada componente tem `type` (e, se consumir dados, `dataPath`). Os dados ficam em `section.data.<chave>` (ex.: `section.data.recommendationsTable`).
- **Seção “por questão”** — sem `subsections` de layout; array `questions[]`. Cada questão pode ter `question_id`, `index`, `question`, `summary`, `data`, `id`, `questionType`. O frontend gera os componentes por template a partir de `questionType`; o backend envia só os dados em `question.data`.
- **Seção “por atributo”** — várias subseções (ex.: por Tipo de Cliente, Estado); `section.data` com uma chave por atributo (ex.: `TipodeCliente`, `Estado`) e estrutura aninhada (gráficos, tabelas, questões por atributo). Os componentes usam `dataPath` como `sectionData.TipodeCliente.*`, etc.

**Componentes:** para o frontend renderizar, o objeto do componente precisa de **`type`** (string). Se o componente usa dados dinâmicos, deve existir **`dataPath`** (ex.: `sectionData.recommendationsTable`) e o dado correspondente em `section.data`. Tipos suportados incluem, entre outros: `card`, `grid-container`, `container`, `h3`, `h4`, `barChart`, `sentimentDivergentChart`, `sentimentThreeColorChart`, `recommendationsTable`, `segmentationTable`, `npsDistributionTable`, `npsTable`, `sentimentImpactTable`, `positiveCategoriesTable`, `negativeCategoriesTable`. Nada disso é obrigatório: você pode ter só uma seção com um card, ou muitas seções com combinações diferentes.

---

### 3. `uiTexts` (opcional)

Objeto com textos da interface, agrupados por contexto. **Opcional** — o frontend pode usar valores padrão se não existir. Exemplo (adaptar conforme o que o backend armazena):

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
      "description": "Exporte os dados da pesquisa em diferentes formatos",
      "exportFullReport": "Exportar Relatório Completo",
      "selectSpecificSections": "Selecionar Seções Específicas",
      "exportAsPDF": "Exportar como PDF",
      "selectAtLeastOneSection": "Selecione pelo menos uma seção"
    },
    "common": {
      "loading": { "loadingQuestions": "Carregando questões..." },
      "errors": { "dataNotFound": "Dados não encontrados." }
    }
  }
}
```

---

### 4. `surveyInfo` (opcional)

**Opcional** — usado para cabeçalho e resumo do relatório; o frontend pode omitir ou usar fallbacks se não existir. Exemplo:

```json
{
  "surveyInfo": {
    "title": "Demonstração ai2c Customer Insights",
    "company": "Satisfação do cliente",
    "period": "Data",
    "totalRespondents": 100,
    "responseRate": 3.33,
    "questions": 3,
    "nps": 0,
    "npsCategory": "Bom"
  }
}
```

Campos e estrutura podem variar conforme o que o backend quiser expor.

---

## Estrutura do código / contrato para o backend

O frontend **não transforma** o payload: o que o GET retornar é usado como está. Portanto o backend deve devolver **exatamente** o mesmo “formato” que o JSON atual.

| O que passar ao back        | Onde está                                                 | Uso                                                                                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tipos (contrato formal)** | `docs/backend-contract/ReportResponse.d.ts`               | Define o mínimo (`metadata` + `sections`) e o resto opcional. O backend pode copiar para o repo e usar como tipo de retorno ou referência.                                                                                                       |
| **Instruções**              | Este arquivo (`INSTRUCOES_BACKEND_GET_RELATORIO_JSON.md`) | Regras obrigatório vs flexível, exemplos, como usar no Cursor.                                                                                                                                                                                   |
| **Exemplo completo**        | `src/data/json_file_app_05-02.json`                       | Um payload real; útil para ver seções, componentes, `dataPath`, `section.data`.                                                                                                                                                                  |
| **Serviço que consome**     | `src/services/surveyDataService.js`                       | Hoje: `fetchSurveyData()` retorna o JSON estático; em produção será trocado por `fetch(API_URL)`. O backend deve retornar o **objeto na raiz** (sem envelope `{ success, data }`), ou o front consumirá `response.data` se o back usar envelope. |

Resumo: **passe ao back** o `ReportResponse.d.ts` + este doc + o `json_file_app_05-02.json` (ou trechos). Com isso o back tem a estrutura exata que o front espera quando os dados vierem do banco.

---

## Referência: arquivo e documentação no frontend

Para ver **um exemplo completo** de estrutura (tudo opcional exceto `metadata` e `sections`):

1. **Arquivo de referência:** no repositório do **frontend**, o arquivo  
   `src/data/json_file_app_05-02.json`  
   mostra um relatório completo (várias seções, componentes, dados). O backend pode devolver algo mais simples (só metadata + sections com poucas seções) ou tão rico quanto esse arquivo; o importante é respeitar o mínimo (metadata + sections) e a convenção de `dataPath` / `section.data` quando houver componentes que consomem dados.

2. **Documentação no frontend (uso como contexto no Cursor):**
   - `docs/validation_scripts/schema/surveyData.schema.json` — schema da estrutura do JSON (metadata, sections, componentes, questões).
   - `docs/ESTRATEGIA_ATUALIZACAO_DOCS_JSON.md` — resumo da estrutura atual (metadata, sections, uiTexts, surveyInfo; ids das seções; dataPaths; questões e atributos).

Você pode copiar este documento para o repositório do backend e, no Cursor do backend, usar como contexto adicional o próprio `json_file_app_05-02.json` (ou os trechos relevantes) e, se tiver acesso ao repo do frontend, os docs acima.

---

## Como usar no Cursor (repositório do backend)

1. **Coloque este arquivo no backend**  
   Ex.: `docs/INSTRUCOES_BACKEND_GET_RELATORIO_JSON.md` (ou o nome que preferir).

2. **Dê este arquivo como contexto ao Cursor**
   - Abra o doc e use **@** para anexar ao chat, ou
   - Inclua em `.cursor/rules` (ex.: regra que diga “ao implementar o GET do relatório da pesquisa, siga a estrutura descrita em docs/INSTRUCOES_BACKEND_GET_RELATORIO_JSON.md”).

3. **Use o JSON de referência como contexto**
   - Se tiver o `json_file_app_05-02.json` no backend (cópia ou link), use **@json_file_app_05-02.json** (ou o path correto) no chat ao pedir a implementação do GET.
   - Ou cole trechos do JSON (raiz, uma seção executive, uma support, a seção questions com 1–2 questões, e um bloco de attributes) no prompt.

4. **Exemplo de prompt para o Cursor**
   - “Implemente o endpoint GET do relatório da pesquisa (ex.: GET /api/surveys/:surveyId/report) que lê do banco e retorna um JSON com **pelo menos** `metadata` e `sections`. O restante (uiTexts, surveyInfo, número e estrutura das seções, componentes) é flexível. Use como referência o doc INSTRUCOES_BACKEND_GET_RELATORIO_JSON.md e o json_file_app_05-02.json para ver um exemplo completo.”

5. **Validação**
   - Garantir que a resposta tenha `metadata` (object) e `sections` (array). Opcional: no frontend, apontar o source dos dados para esse GET e conferir se a tela renderiza conforme o que foi enviado.

---

## Resumo: mínimo obrigatório e resto flexível

- **Obrigatório:** objeto com **`metadata`** (object) e **`sections`** (array). O array pode ser vazio; se tiver itens, cada seção pode ter a estrutura que fizer sentido (id, index, name, icon, subsections, questions, data).
- **Opcional / flexível:** `uiTexts`, `surveyInfo`, número de seções, tipos de seção, quantidade e tipo de componentes, chaves dentro de `section.data`. O frontend renderiza o que existir; componentes usam `type` e, quando aplicável, `dataPath` apontando para dados em `section.data`.

O backend deve montar a partir do banco **pelo menos** `metadata` e `sections`; o restante é conforme a necessidade do relatório (textos, totais, NPS, tabelas, gráficos, questões, atributos, etc.). O frontend é genérico e aceita estruturas variadas.

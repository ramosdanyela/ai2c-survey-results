# Backend: Collection e API para JSON do Relatório (Survey Report)

> Instruções para criar a collection que armazena o JSON que renderiza as informações da aplicação. O JSON no banco deve ser **idêntico** ao JSON mockado no frontend. Depois de criar a collection, popular com os dados e expor a API, o frontend será plugado nessa API.

---

## 1. Objetivo

- **Collection:** armazenar um documento por pesquisa (relatório), onde cada documento é o JSON completo que a aplicação usa para renderizar seções, componentes, dados e textos.
- **API:** um endpoint GET que retorna esse JSON exatamente no mesmo formato que o frontend hoje consome via mock (sem envelope extra; o body da resposta é o próprio JSON do relatório).

---

## 2. Estrutura do JSON (igual ao mock)

O documento armazenado (e retornado pela API) deve ter **exatamente** a mesma estrutura do arquivo mock usado no frontend. Resumo:

| Raiz         | Tipo   | Obrigatório | Descrição                                                                             |
| ------------ | ------ | ----------- | ------------------------------------------------------------------------------------- |
| `metadata`   | object | Sim         | `version`, `language`, `surveyId`                                                     |
| `sections`   | array  | Sim         | Seções do relatório (com subsections, components, data, questions)                    |
| `uiTexts`    | object | Sim         | Textos da interface (filterPanel, export, common, etc.)                               |
| `surveyInfo` | object | Sim         | Título, empresa, período, totalRespondents, responseRate, questions, nps, npsCategory |

- **metadata.surveyId** é o identificador único da pesquisa (ex.: `"telmob"`). Use como chave para buscar o documento (e no path da API).
- **sections** é um array complexo: cada seção pode ter `subsections[]`, cada subseção tem `components[]` e opcionalmente `data`; seções do tipo “respostas” têm `questions[]` com `data` por questão. A estrutura completa está em `docs/ESTRUTURA_COMPONENTES_JSON.md` e no schema `docs/validation_scripts/schema/surveyData.schema.json`.
- Não altere nomes de campos nem aninhe o payload em outro objeto na resposta da API (ex.: não retornar `{ "data": { ...payload } }` a menos que o frontend seja alterado para ler `response.data`).

Referência de exemplo de documento: **`src/data/tests-06-02/json_file_app.json`** (é esse JSON que será populado no banco e depois servido pela API).

---

## 3. Nome e modelo da collection

- **Nome sugerido da collection:** `survey_reports` (ou `report_payloads`, conforme convenção do projeto).

- **Modelo lógico (um documento por pesquisa):**
  - **`_id`** (ObjectId, gerado pelo banco).
  - **`surveyId`** (string, obrigatório, único): mesmo valor de `metadata.surveyId` (ex.: `"telmob"`). Use para buscar por pesquisa.
  - **`payload`** (object, obrigatório): o JSON completo do relatório (metadata, sections, uiTexts, surveyInfo e qualquer outro campo que o frontend espere). Ou, se preferir, pode armazenar o documento na raiz (sem campo `payload`) e usar `surveyId` como campo único na raiz; o importante é que o conteúdo retornado pela API seja exatamente o JSON do relatório.

- **Índice único:** `surveyId` (único), para garantir uma pesquisa por relatório e buscas rápidas.

Exemplo de documento **com** campo `payload` (recomendado para não misturar campos do banco com os do domínio):

```json
{
  "_id": "<ObjectId>",
  "surveyId": "telmob",
  "payload": {
    "metadata": { "version": "1.0", "language": "pt-BR", "surveyId": "telmob" },
    "sections": [ ... ],
    "uiTexts": { ... },
    "surveyInfo": { ... }
  }
}
```

Alternativa: documento na raiz (sem `payload`):

```json
{
  "_id": "<ObjectId>",
  "surveyId": "telmob",
  "metadata": { "version": "1.0", "language": "pt-BR", "surveyId": "telmob" },
  "sections": [ ... ],
  "uiTexts": { ... },
  "surveyInfo": { ... }
}
```

Se usar a alternativa na raiz, ao responder na API retorne apenas os campos do relatório (excluindo `_id` e qualquer outro campo interno do banco), para que o body da resposta seja idêntico ao mock.

---

## 4. Como popular a collection

1. **Obter o JSON de referência**  
   Use o conteúdo de `src/data/tests-06-02/json_file_app.json` do repositório do frontend (ou o JSON que for combinado como padrão).

2. **Inserir um documento por pesquisa**
   - Se o modelo usar **`payload`**:
     - `surveyId` = valor de `metadata.surveyId` do JSON (ex.: `"telmob"`).
     - `payload` = objeto completo (metadata, sections, uiTexts, surveyInfo).
   - Se o modelo for **na raiz**:
     - Copie todo o JSON para o documento e adicione `surveyId` na raiz (e opcionalmente use `metadata.surveyId` como fonte de verdade para `surveyId`).

3. **Exemplo (MongoDB, com `payload`):**
   - Ler `json_file_app.json` (ex.: via script ou import).
   - `surveyId = payload.metadata.surveyId` (ex.: `"telmob"`).
   - Insert: `{ surveyId, payload }` na collection `survey_reports`.

4. **Validação**  
   Opcional: validar o documento contra o schema antes de inserir usando `docs/validation_scripts/schema/surveyData.schema.json` (campos obrigatórios: metadata, sections, uiTexts, surveyInfo).

---

## 5. API: GET relatório (JSON da aplicação)

- **Método:** `GET`
- **Path sugerido:** `GET /api/surveys/{survey_id}/report`  
  (ou `GET /api/surveys/{survey_id}/data` / `GET /api/surveys/{survey_id}` se preferirem outro padrão.)

- **Path parameter:**
  - `survey_id` (string): ID da pesquisa (ex.: `telmob`). Deve corresponder a `metadata.surveyId` e ao campo `surveyId` da collection.

- **Resposta esperada**
  - **Status:** `200 OK`
  - **Content-Type:** `application/json`
  - **Body:** o JSON completo do relatório, **no mesmo formato** do mock, ou seja:
    - Se o documento no banco tiver campo `payload`, o body da resposta deve ser o conteúdo de `payload` (sem envelope).
    - O frontend hoje espera o objeto com `metadata`, `sections`, `uiTexts`, `surveyInfo` na raiz; não enviar algo como `{ "success": true, "data": { ... } }` a menos que o frontend seja alterado para ler `response.data`.

Exemplo do que o frontend espera receber (trecho):

```json
{
  "metadata": {
    "version": "1.0",
    "language": "pt-BR",
    "surveyId": "telmob"
  },
  "sections": [ ... ],
  "uiTexts": { ... },
  "surveyInfo": { ... }
}
```

- **Erros sugeridos:**
  - **404** – pesquisa não encontrada (ex.: não existe documento com esse `survey_id`). Body opcional: `{ "error": "Survey report not found" }`.
  - **500** – erro interno.

---

## 6. Resumo para o back

| Item       | Ação                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Collection | Criar `survey_reports` (ou nome equivalente) com índice único em `surveyId`.                                         |
| Documento  | Um por pesquisa; conteúdo = JSON idêntico ao de `src/data/tests-06-02/json_file_app.json` (em `payload` ou na raiz). |
| Popular    | Inserir o JSON de referência usando `metadata.surveyId` como `surveyId`.                                             |
| API        | `GET /api/surveys/{survey_id}/report` retornando o JSON do relatório no body (formato igual ao mock).                |

Depois que a API estiver pronta, o frontend será plugado trocando a chamada mock em `surveyDataService.js` por `fetch(API_BASE + '/api/surveys/' + surveyId + '/report')` e usando o body da resposta como hoje usa o JSON mockado.

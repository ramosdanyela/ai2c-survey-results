# Estratégia para Atualizar a Documentação (.md) conforme o JSON e o Código Atuais

Este documento define uma estratégia para alinhar **todos os arquivos .md** do projeto à estrutura atual do JSON de pesquisa (`src/data/json_file_app_05-02.json`) e ao comportamento do código.

---

## 1. Referência: Estrutura Atual do JSON (`json_file_app_05-02.json`)

### 1.1 Nível raiz

| Campo        | Descrição                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `metadata`   | `version`, `language`, `surveyId`                                                                   |
| `sections`   | Array de seções (não há `sectionsConfig.sections`)                                                  |
| `uiTexts`    | Textos da interface (por contexto)                                                                  |
| `surveyInfo` | `title`, `company`, `period`, `totalRespondents`, `responseRate`, `questions`, `nps`, `npsCategory` |

**Não existe:** `sectionsConfig`, `renderSchema`.

### 1.2 Seções (ids reais no JSON)

| id da seção  | index | Nome típico           | Conteúdo                                                                                                                                                                                                                           |
| ------------ | ----- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `executive`  | 0     | Relatório Executivo   | `subsections[]` com componentes em `subsections[].components`; dados em `section.data` (ex.: `recommendationsTable`)                                                                                                               |
| `support`    | 1     | Análises de Suporte   | `subsections[]`; dados em `section.data` (ex.: `sentimentDivergentChart`, `segmentationTable`, `respondentIntentChart`)                                                                                                            |
| `questions`  | 2     | Análise por Questão   | Array `questions[]` (não `responses`); cada item tem `question_id`, `index`, `question`, `summary`, `data`, `id`, `questionType`                                                                                                   |
| `attributes` | 3     | Análise por Atributos | `subsections[]` (ex.: `attributes-TipodeCliente`, `attributes-Estado`); dados aninhados em `section.data` por atributo (ex.: `TipodeCliente`, `Estado`) com `distributionChart`, `questions.question01.npsDistributionTable`, etc. |

**Importante:** A seção de questões no JSON atual tem `id: "questions"` (não `"responses"`). O código aceita ambos; a documentação deve mencionar os dois e usar o JSON real como referência.

### 1.3 Estrutura de uma seção genérica

```json
{
  "id": "executive",
  "index": 0,
  "name": "Relatório Executivo",
  "icon": "FileText",
  "subsections": [
    {
      "id": "executive-summary",
      "index": 0,
      "name": "Sumário Executivo",
      "icon": "ClipboardList",
      "components": [ ... ]
    }
  ],
  "data": {
    "recommendationsTable": { "config": { ... }, "items": [ ... ] }
  }
}
```

- Componentes ficam em **`subsections[].components`** (nunca em `renderSchema`).
- Dados da seção ficam em **`section.data`**. O código expõe isso como `sectionData` para os componentes (via `dataPath`: `sectionData.recommendationsTable`, etc.).

### 1.4 Tipos de componentes usados no JSON atual

- **Layout/container:** `card`, `grid-container`, `container`
- **Títulos:** `h3`, `h4`
- **Gráficos:** `barChart`, `sentimentDivergentChart`, `sentimentThreeColorChart`
- **Tabelas:** `recommendationsTable`, `segmentationTable`, `npsDistributionTable`, `npsTable`, `sentimentImpactTable`, `positiveCategoriesTable`, `negativeCategoriesTable`
- **DataPath típicos:** `sectionData.recommendationsTable`, `sectionData.sentimentDivergentChart`, `sectionData.respondentIntentChart`, `sectionData.segmentationTable`, `sectionData.TipodeCliente.distributionChart`, `sectionData.TipodeCliente.questions.question01.npsDistributionTable`, `sectionData.TipodeCliente.questions.question02.satisfactionImpactSentimentChart`, etc.

### 1.5 Questões (seção `questions`)

- Cada questão: `question_id` (string, ex.: `"question01"`), `index`, `question`, `summary`, `data`, `id` (number), `questionType` (`"nps"`, `"multiple-choice"`, `"open-ended"`, etc.).
- **Não há** array `components` no objeto de questão; os componentes são gerados pelos **templates** em `src/config/questionTemplates.js` conforme `questionType`.
- DataPath nas questões: `question.data`, `question.data.npsStackedChart`, `question.data.barChart`, `question.data.sentimentDivergentChart`, etc.

### 1.6 Seção “Análise por Atributos” (`attributes`)

- Subseções por atributo (ex.: Tipo de Cliente, Estado).
- Dados em `section.data.TipodeCliente`, `section.data.Estado`, com estrutura aninhada, por exemplo:
  - `distributionChart`, `distributionTable`
  - `questions.question01.npsDistributionTable`, `questions.question01.npsTable`
  - `questions.question02.satisfactionImpactSentimentChart`, `satisfactionImpactSentimentTable`, `positiveCategoriesTable`, `negativeCategoriesTable`
- Nos componentes, `dataPath` usa `sectionData.TipodeCliente.*`, `sectionData.Estado.*`, etc. (o código monta `sectionData` a partir de `section.data` e, quando aplicável, de subseção).

---

## 2. Referência: Código Relevante

| Onde                                                      | O que verificar                                                                                                                                                                                                                                     |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/surveyDataService.js`                       | Importa `@/data/json_file_app_05-02.json` (não `surveyData.json` como único nome).                                                                                                                                                                  |
| `src/components/survey/common/ComponentRegistry.jsx`      | Lista completa de tipos (card, barChart, sentimentDivergentChart, recommendationsTable, segmentationTable, npsDistributionTable, npsTable, sentimentThreeColorChart, sentimentImpactTable, positiveCategoriesTable, negativeCategoriesTable, etc.). |
| `src/config/questionTemplates.js`                         | Templates por `questionType`: nps, multiple-choice, single-choice, open-ended; dataPaths `question.data`, `question.data.npsStackedChart`, etc.                                                                                                     |
| `src/components/survey/common/GenericSectionRenderer.jsx` | Montagem de `sectionData` a partir de `section.data` e subseções; resolução de `dataPath` (sectionData._, question.data._).                                                                                                                         |
| `src/pages/JsonReference.jsx`                             | Referência dinâmica de tipos e dataPaths; refletir que o JSON de exemplo é o `json_file_app_05-02.json`.                                                                                                                                            |

---

## 3. Inventário dos Arquivos .md e O Que Atualizar

| Arquivo                                                                         | Foco da atualização                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md` (raiz)                                                              | Fluxo: trocar `surveyData.json` e `sectionsConfig.sections[].data.renderSchema` por “JSON de pesquisa” (ex.: `json_file_app_05-02.json`) e “sections[].subsections[].components” + “section.data”.                                                                                                                                                                                                    |
| `docs/docs_json_tutorial/Doc_how-to_json.md`                                    | Alinhar a “Estrutura do JSON” ao JSON real: nome do arquivo de exemplo, ids de seção (executive, support, questions, attributes), uso de `question_id` onde existir, dataPaths de atributos (sectionData.TipodeCliente.\*), remover referências a `renderSchema`/`sectionsConfig`, padronizar “seção de questões” como `questions` (e opcionalmente `responses`).                                     |
| `docs/docs_json_tutorial/Doc_how-to_json_short.md`                              | Mesmas linhas gerais que no Doc_how-to_json (estrutura, componentes, questões, atributos), em versão resumida.                                                                                                                                                                                                                                                                                        |
| `docs/docs_json_tutorial/CHARTS_JSON_REFERENCE.md`                              | Trocar exemplos que usam `renderSchema` ou `data.renderSchema` por estrutura atual: componentes em `subsections[].components`, dados em `section.data`; dataPath `sectionData.<chave>`. Incluir tipos realmente usados no JSON (barChart, sentimentDivergentChart, sentimentThreeColorChart, npsDistributionTable, npsTable, sentimentImpactTable, positiveCategoriesTable, negativeCategoriesTable). |
| `docs/docs_json_tutorial/validation_scripts/README.md`                          | Já menciona estrutura atualizada; garantir que exemplos de ids (responses/questions, attributes, TipodeCliente, Estado) e dataPaths (sectionData.TipodeCliente.\*) estejam consistentes com o JSON.                                                                                                                                                                                                   |
| `docs/docs_json_tutorial/validation_scripts/ESTRATEGIA_VALIDACAO_ATUALIZADA.md` | Se existir, alinhar regras de validação aos ids, dataPaths e estrutura do json_file_app_05-02.json.                                                                                                                                                                                                                                                                                                   |
| `docs/PEDROZA_QUESTIONS_API_SPEC.md`                                            | Manter spec da API; apenas garantir que termos “seção de questões” / “responses” estejam alinhados ao código (que aceita `id: "questions"` ou `"responses"`) e que a estrutura de dados agregados coincida com o que o app espera (question.data.\*).                                                                                                                                                 |
| `docs/Replace_mock_to_api.md`                                                   | Trocar referências de `surveyData.json` para o JSON efetivamente usado (ex.: `json_file_app_05-02.json`) e mencionar que o service importa esse arquivo.                                                                                                                                                                                                                                              |
| `scripts/README.md`                                                             | Se mencionar JSON ou estrutura, usar “JSON de pesquisa” e estrutura atual (sections, subsections, components, data).                                                                                                                                                                                                                                                                                  |

---

## 4. Passos da Estratégia (Ordem Sugerida)

### Fase 1: Fonte de verdade única

1. **Definir nome do arquivo de referência**
   - Nos docs, usar “JSON de pesquisa” como termo genérico e, quando precisar de exemplo concreto, referenciar `src/data/json_file_app_05-02.json` (ou o nome que for padrão do projeto).
2. **Lista de tipos e dataPaths**
   - Extrair do `json_file_app_05-02.json` e do `ComponentRegistry` a lista canônica de tipos de componente e de dataPaths (sectionData._ e question.data._). Usar esta lista para revisar todos os .md.

### Fase 2: Estrutura e nomenclatura

3. **Remover/atualizar referências antigas**
   - Em todos os .md:
     - Substituir “sectionsConfig.sections” por “sections” (raiz).
     - Substituir “renderSchema” / “data.renderSchema” por “subsections[].components” e “section.data”.
     - Onde aparecer “surveyData.json” como único arquivo de dados, indicar o arquivo real (ex.: `json_file_app_05-02.json`) ou “JSON de pesquisa”.
4. **Padronizar seção de questões**
   - Documentar que a seção que contém o array de questões pode ter `id: "questions"` ou `id: "responses"`; o JSON atual usa `"questions"`. Manter a spec da API (PEDROZA) em termos de “responses” se for o contrato da API, e no mesmo doc deixar claro o mapeamento para o id usado no JSON.

### Fase 3: Conteúdo por documento

5. **README.md (raiz)**
   - Atualizar “Fluxo de Renderização”: JSON → `sections` → GenericSectionRenderer → componentes; dados em `section.data` expostos como `sectionData`.
   - Mencionar que o arquivo de dados usado na app é o definido em `surveyDataService.js` (ex.: `json_file_app_05-02.json`).
6. **Doc_how-to_json.md e Doc_how-to_json_short.md**
   - Estrutura: metadata, sections, uiTexts, surveyInfo.
   - Seções: executive, support, questions, attributes; exemplos com ids e dataPaths reais.
   - Questões: `question_id`, `questionType`, `data`, templates (sem `components` no objeto de questão).
   - Atributos: section.data por atributo (TipodeCliente, Estado), dataPaths `sectionData.TipodeCliente.*`, etc.
   - Componentes: lista alinhada ao ComponentRegistry e ao JSON (incluindo container, h3, h4, grid-container).
7. **CHARTS_JSON_REFERENCE.md**
   - Reescrever exemplos para: componentes em `subsections[].components`, dados em `section.data`, dataPath `sectionData.<nome>`.
   - Incluir referência para os tipos de gráfico/tabela usados no JSON atual (sentimentThreeColorChart, sentimentImpactTable, positiveCategoriesTable, negativeCategoriesTable, npsDistributionTable, npsTable, etc.).
8. **validation_scripts/README.md e ESTRATEGIA_VALIDACAO_ATUALIZADA.md**
   - Regras e exemplos de validação devem aceitar e exemplificar `id: "questions"` e estrutura de `attributes` com sectionData.TipodeCliente / Estado e dataPaths aninhados.
9. **Replace_mock_to_api.md**
   - Arquivo de dados: nome real (ex.: `json_file_app_05-02.json`) e que o service importa esse arquivo.
10. **PEDROZA_QUESTIONS_API_SPEC.md**
    - Sem mudança de contrato; apenas alinhar descrição da seção de questões ao que o app espera (questions/responses, question.data.\*).

### Fase 4: Consistência e validação

11. **Revisão cruzada**
    - Buscar em todos os .md: `renderSchema`, `sectionsConfig`, `surveyData.json` (como único), e garantir que estejam atualizados ou removidos.
12. **Script de checagem (opcional)**
    - Script que procura nos .md por termos obsoletos (`renderSchema`, `sectionsConfig.sections`) e lista os arquivos e trechos para revisão.

---

## 5. Checklist Rápido por Arquivo

- [ ] **README.md**: Fluxo com `sections` e `section.data`; sem `sectionsConfig`/`renderSchema`; nome do JSON de dados.
- [ ] **Doc_how-to_json.md**: Estrutura = metadata, sections, uiTexts, surveyInfo; ids executive/support/questions/attributes; questões com question_id/questionType; atributos com sectionData.TipodeCliente/Estado; componentes = lista atual.
- [ ] **Doc_how-to_json_short.md**: Mesmos pontos em versão curta.
- [ ] **CHARTS_JSON_REFERENCE.md**: Exemplos só com subsections[].components e section.data; dataPath sectionData.\*; tipos do JSON atual.
- [ ] **validation_scripts/README.md**: Ids e dataPaths alinhados ao json_file_app_05-02.json.
- [ ] **validation_scripts/ESTRATEGIA_VALIDACAO_ATUALIZADA.md**: Regras conforme estrutura atual.
- [ ] **Replace_mock_to_api.md**: Nome do arquivo JSON real.
- [ ] **PEDROZA_QUESTIONS_API_SPEC.md**: Alinhamento questions/responses e question.data.
- [ ] **scripts/README.md**: Menções a JSON e estrutura atualizadas.

---

## 6. Resumo das Convenções a Usar nos .md

| Tema                  | Convenção                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arquivo JSON de dados | “JSON de pesquisa”; exemplo concreto: `json_file_app_05-02.json` (ou o padrão do projeto).                                                         |
| Seções                | `sections[]` na raiz; cada seção tem `id`, `index`, `name`, `icon`, `subsections[]`, `data`.                                                       |
| Componentes           | Sempre em `subsections[].components` (ou `section.components` se for seção sem subseções). Nunca em `renderSchema`.                                |
| Dados da seção        | Em `section.data`. No código, expostos como `sectionData`; dataPath = `sectionData.<chave>`.                                                       |
| Seção de questões     | `id: "questions"` ou `"responses"`; array `questions[]`; cada questão: `question_id`, `questionType`, `data`; componentes por template.            |
| Atributos             | Seção `attributes` com `section.data.TipodeCliente`, `section.data.Estado`, etc.; dataPaths `sectionData.TipodeCliente.*`, `sectionData.Estado.*`. |
| Nomenclatura obsoleta | Não usar: `sectionsConfig.sections`, `renderSchema`, `data.renderSchema`.                                                                          |

Com isso, a documentação .md fica alinhada à estrutura atual do `json_file_app_05-02.json` e ao código que a consome.

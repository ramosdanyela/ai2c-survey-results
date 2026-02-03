# Estratégia de Validação – Atualizada

Este documento define como os scripts em `validation_scripts` devem refletir as mudanças feitas no código (attributes como seção normal) e apontar **todos os pontos** trazidos da análise do JSON (PROBLEMAS*RENDERIZACAO_TELMOB, telmob*\*.csv, VALIDACAO_VS_PROBLEMAS_TELMOB).

---

## 1. Mudanças de arquitetura que a validação deve refletir

### 1.0 Única seção não genérica: questions/responses

- **Regra:** A **única** seção que não é genérica é a que contém o array `questions` (com `id` `"responses"` ou `"questions"`).
- **Por quê:** Nessa seção, as “subseções” (ex.: `responses-1`, `responses-2`) **não** vêm de `section.subsections` no JSON; são derivadas do array `section.questions` (cada questão vira uma subseção na navegação). Todas as demais seções (executive, support, attributes, etc.) são **genéricas**: subsections vêm de `section.subsections`, dados por subsection em `subsection.data`, e o validador deve tratar todas elas da mesma forma.
- **Validação:** Exigir que a seção que contém `questions` tenha `id === "responses"` ou `id === "questions"`; exigir que cada questão tenha `index`; para as demais seções, não fixar IDs (executive, support, attributes são apenas exemplos). **Não** exigir que os índices de questões comecem em 1 ou sejam sequenciais.

### 1.1 Attributes é uma seção como qualquer outra (genérica)

- **Código:** Não existe mais `getSubsectionsAsItems`, `getAttributesFromData` nem lógica especial por `id === "attributes"` para renderização/navegação. Attributes usa `section.subsections` como executive/support.
- **Validação:**
  - **Não** exigir apenas `attributes-department`, `attributes-tenure`, `attributes-role`.
  - **Construir `sectionData` de forma genérica** para qualquer seção com subsections (exceto a de questions): `section.data` + para cada `subsection`, uma chave derivada do `subsection.id` (ex.: `subsection.id.replace(/^<sectionId>-/, "")`) → `subsection.data`.
  - Assim, `sectionData.Estado`, `sectionData.department`, etc. passam a existir para qualquer subsection cujo `id` seja `attributes-Estado`, `attributes-department`, etc., e dataPaths como `sectionData.Estado.npsDistributionTable` são válidos.

### 1.2 Resolução de dados por subsection

- **Código:** Cada subsection tem seu próprio `subsection.data`; o renderer recebe `sectionData` do contexto da subsection (ex.: dados da subsection atual).
- **Validação:** Ao validar componentes de uma subsection, usar `sectionData` = dados da seção construídos de forma genérica (incluindo todas as subsections mapeadas por chave), para que `sectionData.<key>.*` aponte para `subsection.data` da subsection correspondente.

---

## 2. Pontos de validação (checklist)

Cada item abaixo é um “ponto” que a análise do JSON/docs levantou. A coluna **Onde** indica schema (S), custom-rules (R) ou ambos; **Status** = já feito / a fazer / opcional.

| #   | Ponto                                                                                                                  | Onde | Status   | Observação                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ---- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Seção que contém `questions` deve ter `id === "responses"` ou `id === "questions"`                                     | R    | Feito    | `validateCustomRules`: aceita "responses" (padrão ouro) ou "questions"; erro se for outro id.                                                                        |
| 2   | Construir `sectionData` de forma genérica (todas as seções com subsections; chave = subsection.id sem prefixo)         | R    | Feito    | custom-rules.js: sectionData = section.data + para cada subsection, key = slice(section.id + "-") ou subsection.id; para attributes, sectionData.attributes = array. |
| 3   | Resolver `sectionData.*` e `currentAttribute.*` usando o `sectionData` genérico                                        | R    | Feito    | currentAttribute._ usa sectionData.attributes (array) construído no sectionData genérico; sectionData._ resolve pelas chaves (Estado, department, etc.).             |
| 4   | Campo esperado `option`, recebido `label` (npsStackedChart, barChart)                                                  | R    | Feito    | `checkChartItemFieldName`: aviso quando item tem `label` e não tem `option`.                                                                                         |
| 5   | Campos numéricos como string (id, index, npsScore, value, percentage, totalRespondents, responseRate, nps)             | R    | Feito    | `checkNumberNotString`: aviso.                                                                                                                                       |
| 6   | Campos string vazios (question)                                                                                        | R    | Feito    | `checkNotEmptyString`: aviso para question.                                                                                                                          |
| 7   | dataPath apontando para array vazio quando componente exige array não vazio                                            | R    | Feito    | `validateComponentData`: erro para componentes que exigem array e dataPath resolve para `[]`.                                                                        |
| 8   | Questão NPS: `data.npsScore` obrigatório                                                                               | R    | Feito    | Erro se faltar.                                                                                                                                                      |
| 9   | Questão open-ended: pelo menos um de sentimentDivergentChart (ou sentimentStackedChart), wordCloud, topCategoriesCards | R    | Feito    | Erro se nenhum existir.                                                                                                                                              |
| 10  | Questão multiple-choice/single-choice: `data.barChart` array                                                           | R    | Feito    | Erro se não for array.                                                                                                                                               |
| 11  | IDs de questões únicos                                                                                                 | R    | Feito    | Erro se duplicados.                                                                                                                                                  |
| 12  | Índices de questões (começar em 1, sequenciais)                                                                        | R    | Removido | Regra removida: o validador não exige que question.index comece em 1 nem seja sequencial.                                                                            |
| 13  | NPS global (surveyInfo.nps) entre -100 e 100                                                                           | R    | Feito    | Erro se fora do range; aviso se string.                                                                                                                              |
| 14  | surveyInfo.totalRespondents e responseRate como number                                                                 | R    | Feito    | Aviso se string.                                                                                                                                                     |
| 15  | topCategoriesCards: estrutura padrão (rank, category, mentions, percentage, topics)                                    | R    | Opcional | Aviso se objeto não tiver esses campos (evitar formato “plano” antigo).                                                                                              |
| 16  | segmentationTable: campo `index` para ordem de exibição                                                                | R    | Opcional | Aviso/info se faltar `index` (recomendado para ordenação).                                                                                                           |
| 17  | Arrays vazios em dados de questão (wordCloud, sentimentCategories, topicsByCategory)                                   | R    | Feito    | Aviso quando open-ended tiver wordCloud, sentimentCategories ou topicsByCategory como array vazio.                                                                   |
| 18  | Subsection com componentes mas sem `subsection.data` quando dataPath usa sectionData.<key>                             | R    | A fazer  | Garantir que, ao construir sectionData genérico, subsection sem `data` não quebre; aviso se componente referencia sectionData.<key> e não há dados.                  |
| 19  | IDs de subseções únicos por seção                                                                                      | R    | Feito    | Erro se duplicados.                                                                                                                                                  |
| 20  | Índices de subseções sequenciais (0, 1, 2...)                                                                          | R    | Feito    | Erro se não sequenciais.                                                                                                                                             |
| 21  | Tipos de componente válidos (ComponentRegistry)                                                                        | R    | Feito    | Lista em VALID_COMPONENT_TYPES.                                                                                                                                      |
| 22  | Templates `{{path}}` referenciando caminhos existentes                                                                 | R    | Feito    | validateTemplates em title/text.                                                                                                                                     |
| 23  | dataPath existente e tipo correto (array/objeto)                                                                       | R    | Feito    | validateDataPath + checagem de array.                                                                                                                                |
| 24  | Itens com value e percentage (não só um): **apenas** npsStackedChart e barChart (dados de questão)                     | R    | Feito    | checkChartItemValueAndPercentage só para `data.npsStackedChart` e `data.barChart`; outros charts usam outras chaves (positive/negative, x/y, category/value).        |

---

## 3. Pontos trazidos do JSON/docs (mapeamento direto)

### 3.1 De PROBLEMAS_RENDERIZACAO_TELMOB.md e VALIDACAO_VS_PROBLEMAS_TELMOB.md

- **ID da seção de questões:** aceita `id: "responses"` (padrão ouro) ou `id: "questions"` → ponto 1 (feito).
- **Attributes: sectionData para qualquer attributes-\*** → pontos 2, 3, 18 (2 e 3 a fazer; 18 a considerar).
- **Arrays vazios em campos de dados** → pontos 7, 17 (7 feito; 17 opcional).
- **NPS: npsScore** → ponto 8 (feito).
- **option vs label em npsStackedChart e barChart** → ponto 4 (feito).
- **Numeric as string** → ponto 5 (feito).

### 3.2 De telmob_falta_para_renderizar.csv

- **responses > question01:** wordCloud, sentimentCategories, topicsByCategory (arrays preenchidos) → pontos 6, 17 (6 feito; 17 opcional).
- **attributes > attributes-Estado:** npsDistributionTable, npsTable, sentimentChart, sentimentTable, etc. → coberto por sectionData genérico (ponto 2) + ponto 7 (array não vazio quando obrigatório).

### 3.3 De telmob_renderizacao_por_secao.csv e telmob_ajustes_codigo.csv

- **topCategoriesCards** estrutura padrão → ponto 15 (opcional).
- **segmentationTable** com `index` → ponto 16 (opcional).
- **Quebra de linha** → comportamento de código, não validação de JSON; não entra nos scripts.

---

## 4. Ajustes recomendados nos scripts

### 4.1 custom-rules.js (prioridade alta)

1. **Construir `sectionData` de forma genérica para toda seção com subsections**

   - Remover o bloco que monta `sectionData` só para `section.id === "attributes"` com `ATTRIBUTES_SUBSECTION_IDS`.
   - Para cada seção que tenha `section.subsections`:
     - Iniciar com `sectionData = { ...section.data }`.
     - Para cada `subsection` em `section.subsections`:
       - Chave: se `subsection.id.startsWith(section.id + "-")` então `subsection.id.slice(section.id.length + 1)` senão `subsection.id`.
       - Valor: `subsection.data` (ou `{}` se ausente).
       - Fazer `sectionData[key] = subsection.data ?? {}`.
   - Assim, `sectionData.Estado`, `sectionData.department`, etc. ficam disponíveis para dataPaths e templates.

2. **Remover restrição a ATTRIBUTES_SUBSECTION_IDS**

   - Deixar de validar “apenas department, tenure, role”; qualquer subsection com `id` no formato `attributes-*` (ou qualquer outro) passa a ser mapeada no `sectionData` genérico.

3. **Manter `currentAttribute.*` para seção attributes**
   - Para seção com `id === "attributes"`, ao validar templates/dataPaths `currentAttribute.*`, usar o primeiro atributo disponível a partir do novo `sectionData` (ex.: primeiro `section.subsections` com dados) para não quebrar validação existente.

### 4.2 custom-rules.js (prioridade média)

4. **Aviso para arrays vazios em open-ended**

   - Se questão for `questionType === "open-ended"` e tiver `data.wordCloud`, `data.sentimentCategories` ou `data.topicsByCategory` como array vazio, emitir aviso (ponto 17).

5. **Aviso para dataPath que resolve para array vazio**
   - Já existe erro quando componente exige array não vazio; opcional: aviso quando componente opcional (ex.: wordCloud) tem dataPath para `[]` (pode ser tratado junto com 4).

### 4.3 custom-rules.js (prioridade baixa / opcional)

6. **Estrutura de topCategoriesCards**

   - Se `data.topCategoriesCards` for array, avisar quando algum item não tiver pelo menos `rank`, `category`, `mentions`, `percentage` ou `topics` (estrutura “padrão ouro”).

7. **segmentationTable com index**
   - Se existir `section.data.segmentationTable` (ou dataPath equivalente), avisar quando algum item não tiver `index` (recomendado para ordem de exibição).

### 4.4 schema (surveyData.schema.json)

- **Opcional:** Manter como está; a estrutura já permite `subsections[].id` livre e `data` por subsection. Não é obrigatório restringir IDs de subsections a uma lista fixa no schema.
- **Opcional:** Adicionar `description` em `subsections[].id` sugerindo padrão `sectionId-subsectionName` (ex.: `attributes-Estado`) para consistência.

### 4.5 validate-json.js

- Sem mudança obrigatória; já separa erros e avisos e retorna exit 1 só em caso de erro.

### 4.6 README.md e VALIDACAO_VS_PROBLEMAS_TELMOB.md

- **README:** Atualizar a seção “O que é validado” / “Mudanças importantes” para:
  - Dizer que a seção de questões deve ter `id: "responses"` (padrão ouro) ou `id: "questions"` (aceito).
  - Dizer que **attributes é uma seção como as demais**: subsections em `section.subsections`, dados em `subsection.data`, e que o validador constrói `sectionData` de forma genérica para todas as seções com subsections.
- **VALIDACAO_VS_PROBLEMAS_TELMOB.md:** Incluir referência a este documento (ESTRATEGIA_VALIDACAO_ATUALIZADA.md) e resumir que a validação foi alinhada aos pontos 1–23 e ao novo modelo de attributes.

---

## 5. Ordem de implementação sugerida

1. **Fase 1 (refletir arquitetura):** Ajustar `custom-rules.js` para construir `sectionData` de forma genérica e remover `ATTRIBUTES_SUBSECTION_IDS` (itens 4.1 e 4.2).
2. **Fase 2 (avisos opcionais):** Implementar avisos de arrays vazios em open-ended (4.2 ponto 4) e, se desejado, topCategoriesCards e segmentationTable (4.3).
3. **Fase 3 (docs):** Atualizar README e VALIDACAO_VS_PROBLEMAS_TELMOB conforme 4.6.

---

## 6. Resumo

- **Objetivo:** Os scripts de validação passam a refletir que **attributes é uma seção renderizada como as outras** (sem config especial) e a **apontar todos os pontos** levantados na análise do JSON (IDs, sectionData, option vs label, numéricos, vazios, estruturas opcionais).
- **Única seção não genérica:** A seção que contém o array `questions` (id `"responses"` ou `"questions"`), pois suas subseções vêm de `section.questions`, não de `section.subsections`. Todas as demais (executive, support, attributes, etc.) são genéricas. O validador **não** exige que os índices de questões comecem em 1 ou sejam sequenciais.
- **Mudança principal:** `sectionData` construído de forma genérica para qualquer seção com subsections (chave derivada de `subsection.id`, valor `subsection.data`), permitindo qualquer `attributes-*` (e futuras seções com mesmo padrão) sem hardcode.
- **Checklist:** 23 pontos mapeados; implementados: sectionData genérico (2, 3), aviso arrays vazios open-ended (17); pendentes: ponto 18 (subsection sem data) e avisos opcionais (15, 16).

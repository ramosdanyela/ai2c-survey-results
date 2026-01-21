# Relatório de Análise: surveyData.json

**Arquivo analisado:** `src/data/surveyData.json`  
**Schema de referência:** `data/validation/schema/surveyData.schema.json`  
**Código de apoio:** `GenericSectionRenderer`, `ContentRenderer`, `QuestionsList`, `dataResolver`

---

## Objetivo

Identificar **duplicações**, **campos que deveriam estar na lógica programática** e **inconsistências nos padrões de renderização** do JSON de pesquisa, com base na leitura atual do arquivo e no uso no código.

---

## Sumário Executivo

| Categoria | Situação |
|-----------|----------|
| **Duplicações** | Metadados de subseções: `renderSchema.subsections[]` já contém só `id` e `components`; `section.subsections[]` concentra `name`, `icon`, `index`. Redundância de `config` em gráficos. |
| **Campos na lógica** | `hasSubsections` (redundante/contraditório). `config.npsCategories` (candidato a `uiTexts`). `questionTypeSchemas` no JSON mas **não utilizado** no `QuestionsList`. |
| **Inconsistências de renderização** | **attributes**: 100% montado em código (`buildAttributeComponents`), sem `renderSchema`. **responses**: `questionTypeSchemas` definido no JSON e renderização hardcoded no `QuestionsList`. Uso misto de `{{}}` e `dataPath`. |

---

## 1. Duplicações

### 1.1 Metadados de subseções

**Estado atual:** A duplicação entre `section.subsections[]` e `renderSchema.subsections[]` está mitigada:

- **`section.subsections[]`** (ex.: `executive`, `engagement`, `culture`): `id`, `index`, `name`, `icon`.
- **`renderSchema.subsections[]`**: apenas `id` e `components`.

O `GenericSectionRenderer` faz o merge: metadados vêm de `section.subsections`, componentes de `renderSchema.subsections` (por `id`).

**Conclusão:** Padrão adequado. Manter `renderSchema.subsections` só com `id` e `components`.

---

### 1.2 Estrutura repetida de componentes (cards, wrappers)

Cards e wrappers (`type: "card"`, `wrapper: "div"`) se repetem em várias seções (executive, engagement, culture) com pequenas variações (`styleVariant`, `content`, `dataPath`).

**Conclusão:** Aceitável. A repetição reflete a variedade de conteúdo; o foco de padronização deve estar na **origem dos itens** e no **schema de montagem**, não em eliminar essa repetição. Sobre a possibilidade de simplificar ou unificar `type` e `wrapper`, ver **1.4**.

---

### 1.3 Configuração de gráficos (`config`)

`config` em gráficos repete chaves semelhantes:

- `dataKey`, `yAxisDataKey`, `sortData`, `sortDirection`, `showLegend`, `tooltipFormatter`.

Exemplos: `sentimentDivergentChart`, `barChart`, `sentimentStackedChart` em engagement e culture.

**Recomendação:** Inferir defaults por tipo de componente (ex.: `barChart` → `dataKey: "percentage"`, `yAxisDataKey` pela estrutura dos dados) e usar `config` só para overrides.

---

### 1.4 Unificação ou simplificação de `type` e `wrapper`

No `SchemaComponent`, dois ramos distintos:

- **`wrapper`** (ex.: `"wrapper": "div"`): renderiza um elemento HTML nativo (`div`, `h3`, `h4`, `span`) com `wrapperProps`, `components` (aninhados) ou `content` (texto). Usado para **layout/agrupamento** (ex.: um `div` com `className: "grid grid-cols-2"` em volta de dois cards).
- **`type`** (ex.: `"type": "card"`): renderiza um **componente semântico** (SchemaCard, barChart, tabelas, etc.) com props específicas (`title`, `content`, `dataPath`, `styleVariant`, etc.).

Hoje um nó tem **ou** `wrapper` **ou** `type`; a ordem no código é: primeiro `if (component.wrapper)`, depois `switch (component.type)`.

**Formas de simplificar ou unificar:**

| Abordagem | Descrição | Prós | Contras |
|-----------|-----------|------|---------|
| **A. Unificar sob `type` com `"container"`** | Novo tipo `type: "container"` com `as: "div"` (opcional, default `"div"`) e `wrapperProps`/`components`/`content`. Troca `{ "wrapper": "div", "components": [...] }` por `{ "type": "container", "as": "div", "components": [...] }`. | Um único campo `type`; `as` deixa explícito o elemento HTML. | Novo valor reservado; `as`/`element` passa a existir; migração em todos os JSONs. |
| **B. Usar `type` com elementos HTML como valores** | `type: "div"`, `type: "h3"`, `type: "h4"`, `type: "span"` = container nativo. O renderer: se `type` for `div`, `h3`, `h4` ou `span` → wrapper; senão → switch de componentes. | Um único campo; sem `wrapper`. | Mistura “elemento” e “componente” no mesmo espaço de nomes; `type: "div"` não é um “tipo” no mesmo sentido de `type: "card"`. |
| **C. Inferir `wrapper: "div"` quando omitido** | Se há `components` ou `text` e **não** há `type` nem `wrapper` → tratar como `wrapper: "div"`. Ex.: `{ "components": [...] }` em vez de `{ "wrapper": "div", "wrapperProps": {}, "components": [...] }`. Manter `wrapper` só para `h3`, `h4`, `span`. | Reduz verbosidade no caso mais comum (agrupador em `div`); mantém `wrapper` para exceções. | Dois conceitos continuam; só simplifica o padrão `div`. |
| **D. Manter `type` e `wrapper` como estão** | Nenhuma alteração. | Código e JSON atuais já funcionam; sem migração. | Dois campos para “o que renderizar”; `wrapper: "div"` com `wrapperProps: {}` é verboso. |

**Recomendação:** Para **simplificar sem grande refatoração**, a **opção C** é a mais leve: aceitar `{ "components": [...] }` ou `{ "text": "..." }` sem `type` nem `wrapper` como container `div` implícito, e usar `wrapper` só quando o elemento for `h3`, `h4`, `span` ou quando houver `wrapperProps` não vazios. Para **unificar de fato** em um único campo, a **opção A** (`type: "container"`, `as` opcional) é a mais clara semanticamente, à custa de migração e de um novo tipo.

---

## 2. Campos que deveriam estar na lógica programática

### 2.1 `hasSubsections`

**Onde:** `sectionsConfig.sections[]` na seção `responses`:

```json
"id": "responses",
"hasSubsections": false,
```

**Problema:** A seção `responses` **sempre** gera subseções a partir de `data.questions`. No `GenericSectionRenderer`, `hasSubsections` é calculado assim:

1. `attributes`: `data.attributes` com itens → `true`
2. `responses`: `getQuestionsFromData(data).length > 0` → `true`
3. Só depois é considerado `sectionConfig.hasSubsections`

Ou seja, para `responses` o valor `false` é ignorado; o flag é redundante e enganoso.

**Recomendação:** Remover `hasSubsections` do JSON e inferir apenas pela presença de `section.subsections`, `data.attributes` ou `data.questions` (e `renderSchema` quando aplicável).

---

### 2.2 `config.npsCategories` (responses)

**Onde:** `sectionsConfig.sections[id=responses].data.config.npsCategories`:

```json
"npsCategories": {
  "detractor": "Detrator",
  "promoter": "Promotor",
  "neutral": "Neutro",
  "labels": {
    "detractors": "Detratores",
    "neutrals": "Neutros",
    "promoters": "Promotores"
  }
}
```

**Problema:** São textos de UI. No código, o `QuestionsList` usa labels fixos ("Detrator", "Promotor", "Neutro") ao montar o `NPSStackedChart` a partir de `question.data` (opções). `config.npsCategories` **não é referenciado** no `QuestionsList` nem nos chart renderers.

**Recomendação:**  
- Remover `config.npsCategories` do JSON **ou**  
- Mover para `uiTexts.npsCategories` e fazer o `QuestionsList` (ou o componente de chart) consumir de `uiTexts` em vez de hardcode.

---

### 2.3 `questionTypeSchemas` (responses)

**Onde:** `sectionsConfig.sections[id=responses].data.renderSchema.questionTypeSchemas`:

```json
"questionTypeSchemas": {
  "nps": { "components": [ { "type": "npsScoreCard", ... }, { "type": "npsStackedChart", ... } ] },
  "multiple-choice": { "components": [ { "type": "barChart", ... } ] },
  "single-choice": { "components": [ { "type": "barChart", ... } ] },
  "open-ended": { "components": [ { "type": "sentimentStackedChart", ... }, { "type": "topCategoriesCards", ... }, { "type": "wordCloud", ... } ] }
}
```

**Problema:** O `QuestionsList` lê `sectionData?.renderSchema?.questionTypeSchemas`, mas **não usa** esse objeto na renderização. A lógica é toda hardcoded:

- `question.type === "nps"` → NPS score (usando `surveyInfo.nps`, `surveyInfo.npsCategory`) + `NPSStackedChart`
- `question.type === "multiple-choice"` ou `"single-choice"` → `SimpleBarChart`
- `question.type === "open-ended"` → `SentimentStackedChart` + top categories + `WordCloud`

Ou seja, `questionTypeSchemas` está **morto** no JSON.

**Recomendação:**  
- **Opção A:** Remover `questionTypeSchemas` do JSON e documentar que a renderização por tipo fica no `QuestionsList`.  
- **Opção B:** Refatorar o `QuestionsList` para usar `questionTypeSchemas` + um renderer de componentes (ex.: `SchemaComponent`) com `condition` por `question.type` e por existência de dados, unificando com o restante do schema.

---

### 2.4 `surveyInfo`: campos exigidos pelo schema e ausentes no JSON

**Schema:** `surveyInfo` exige `nps` e `npsCategory`.

**JSON atual:** `surveyInfo` tem apenas `title`, `company`, `period`, `totalRespondents`, `responseRate`, `questions`. Não há `nps` nem `npsCategory`.

**Problema:** O `QuestionsList` e o `SchemaNPSScoreCard` usam `surveyInfo.nps` e `surveyInfo.npsCategory`. Na ausência deles, a UI exibe `undefined`.

**Recomendação:**  
- Incluir no JSON: `"nps": 35`, `"npsCategory": "Bom"` (ou o valor real), **ou**  
- Ajustar o schema para torná-los opcionais e tratar `undefined` na UI (ex.: não renderizar o bloco de NPS quando não houver `nps`).

---

## 3. Inconsistências nos padrões de renderização

### 3.1 Seção **attributes**: 100% lógica, sem `renderSchema`

**Estrutura no JSON:**  
- `sectionsConfig.sections[id=attributes]` tem `data.attributes` (lista) e `data.config` (ex.: `defaultIcon`).  
- **Não existe** `data.renderSchema` nem `attribute-template`.

**Comportamento:** O `GenericSectionRenderer` trata `sectionId === "attributes"` de forma especial:

- Subseções: uma por item em `data.attributes` (id `attributes-{attr.id}`, `name`, `icon` do atributo).
- Componentes: gerados por **`buildAttributeComponents(attr)`** no código, com regras fixas (ex.: `summary` → card; `distribution`/`sentiment` → cards com gráficos/tabelas; `npsSummary`/`npsDistribution`/`nps` → card NPS; `satisfactionImpactSummary` e blocos relacionados, etc.).

**Inconsistência:** Enquanto executive, engagement e culture são dirigidos por `renderSchema.subsections[].components`, em **attributes** nada disso existe no JSON; a forma de montar cada subseção está totalmente no código.

**Recomendação (direção de evolução):**  
- Introduzir um **schema de montagem** para attributes (ex.: `subsectionSchema` ou lista de componentes com `condition` em cima de `currentAttribute.*`), de forma que `buildAttributeComponents` seja substituído (ou reduzido) por interpretação de schema. Isso alinha attributes ao princípio de “subseções montadas a partir de dados + schema”, em vez de lógica ad hoc.

---

### 3.2 Seção **responses**: `questionTypeSchemas` no JSON e renderização hardcoded

**Estrutura no JSON:**  
- `renderSchema.components`: `filterPills`, `questionsList`.  
- `renderSchema.questionTypeSchemas`: `nps`, `open-ended`, `multiple-choice`, `single-choice` com listas de componentes.

**Comportamento:**  
- Os componentes de seção (`filterPills`, `questionsList`) vêm do `renderSchema`.  
- O `QuestionsList` renderiza cada pergunta com **lógica própria** (if/else por `question.type` e presença de `data`, `sentimentData`, `topCategories`, `wordCloud`). `questionTypeSchemas` não é usado.

**Inconsistência:**  
- O JSON descreve um “schema por tipo” que não é consumido.  
- Padrão diferente de executive/engagement/culture (schema-driven) e também de attributes (totalmente em código).

**Recomendação:**  
- Unificar: ou eliminar `questionTypeSchemas` e assumir a lógica no código, ou passar a usar `questionTypeSchemas` (ou uma lista única de componentes com `condition`) no `QuestionsList`, em linha com o princípio de “tudo montado por schema + dados”.

---

### 3.3 Resolução de dados: `{{ }}` vs `dataPath`

Uso misto:

- **Templates `{{ }}`:** ex. `"text": "{{sectionData.summary.aboutStudy}}"`, `"{{currentAttribute.summary}}"`.
- **`dataPath`:** ex. `"dataPath": "sectionData.sentimentAnalysis.data"`, `"dataPath": "currentAttribute.distribution"`.

**Recomendação:**  
- Manter `dataPath` para dados estruturados (gráficos, tabelas).  
- Usar `{{ }}` para texto formatado (conteúdo de cards, labels).  
- Documentar a convenção para evitar novos padrões alternativos.

---

### 3.4 Condições de exibição

- **attributes:** A decisão de mostrar ou não um bloco é feita no código (`buildAttributeComponents`, `shouldShowComponent` em `GenericSectionRenderer`), com base em `currentAttribute.*` (ex.: existência de `npsSummary`, `distribution`, etc.). Não há `condition` no JSON.  
- **responses:** Decisão também no código (`QuestionsList`: `question.type`, `question.data`, `question.sentimentData`, etc.).

**Recomendação (longo prazo):** Migrar para um campo `condition` (ou similar) no JSON, avaliado no renderer, para que a visibilidade seja declarativa e rastreável no próprio schema.

---

## 4. Análise por seção

### 4.1 executive

- **Subseções:** Fixas em `section.subsections`; `renderSchema.subsections` com `id` + `components`. Merge correto no `GenericSectionRenderer`.
- **Dados:** `sectionData.summary`, `sectionData.recommendations`; uso de `{{sectionData.*}}` e `dataPath` coerente.
- **Observação:** Nenhuma duplicação relevante de metadados; padrão a replicar.

---

### 4.2 engagement

- **Subseções:** Idem (fixas + `renderSchema.subsections`).
- **Dados:** `sentimentAnalysis`, `segmentation`, `retentionIntent`; gráficos com `dataPath` e `config`.
- **Observação:** `config` dos gráficos pode ser reduzido com defaults por tipo.

---

### 4.3 attributes

- **Subseções:** Dinâmicas, a partir de `data.attributes`; **não** usam `renderSchema.subsections` nem `attribute-template`.
- **Componentes:** Todos gerados por `buildAttributeComponents(attr)` no código.
- **Observação:** Única seção sem `renderSchema` de subsections; principal candidata a ganhar um schema de montagem para alinhar ao resto.

---

### 4.4 responses

- **Subseções:** Dinâmicas, a partir de `data.questions`; cada subseção é uma pergunta.
- **Componentes de seção:** `filterPills`, `questionsList` (de `renderSchema.components`).
- **Componentes por pergunta:** Definidos em `questionTypeSchemas` no JSON, mas **não utilizados**; o `QuestionsList` usa lógica hardcoded.
- **Outros:** `hasSubsections: false` (redundante); `config.npsCategories` não usado; `surveyInfo` sem `nps`/`npsCategory` apesar do uso na UI.

---

### 4.5 culture

- **Subseções:** Fixas + `renderSchema.subsections`; mesmo padrão de executive e engagement.
- **Dados:** `values`, `communication`, `development`; gráficos e cards com `dataPath` e `{{ }}`.
- **Observação:** Sem problemas adicionais em relação ao padrão.

---

## 5. Recomendações prioritárias

### Alta

1. **Remover `hasSubsections`** do JSON e derivar `hasSubsections` apenas da estrutura (`section.subsections`, `data.attributes`, `data.questions`).
2. **Completar ou relaxar `surveyInfo`:** incluir `nps` e `npsCategory` no JSON **ou** torná-los opcionais no schema e tratar `undefined` na UI.
3. **Decidir sobre `questionTypeSchemas`:**  
   - Remover do JSON e documentar que a renderização por tipo fica no `QuestionsList`, **ou**  
   - Refatorar o `QuestionsList` para consumir `questionTypeSchemas` (ou uma lista com `condition`), unificando com o modelo schema-driven.

### Média

4. **`config.npsCategories`:** Remover do JSON **ou** mover para `uiTexts.npsCategories` e fazer a UI consumir de `uiTexts`.
5. **Attributes – schema de montagem:** Definir um schema (ex.: `subsectionSchema` ou `components` com `condition` em `currentAttribute`) e reduzir a lógica em `buildAttributeComponents` em favor da interpretação do schema.
6. **Resolução de dados:** Padronizar `dataPath` para dados estruturados e `{{ }}` para texto; documentar no guia do JSON.

### Baixa

7. **`config` de gráficos:** Introduzir defaults por tipo de gráfico e usar `config` só para overrides.
8. **Condições:** Avançar para `condition` (ou equivalente) no JSON para visibilidade de blocos, em substituição a regras só no código.
9. **`type` e `wrapper`:** Avaliar simplificação (ex.: opção C em 1.4 — inferir `div` quando há `components`/`content` sem `type`/`wrapper`) ou unificação (ex.: opção A — `type: "container"` com `as`) conforme prioridade de migração.

---

## 6. Conclusão

O `surveyData.json` está **funcional** com o código atual, mas há:

- **Redundância e desencontro:** `hasSubsections` e `questionTypeSchemas` (não usado) em relação ao que o código faz.
- **Dados incompletos:** `surveyInfo` sem `nps`/`npsCategory` apesar do uso em NPS.
- **Padrões de renderização distintos:**  
  - executive, engagement, culture: schema-driven.  
  - attributes: totalmente em código, sem `renderSchema`.  
  - responses: schema (`questionTypeSchemas`) no JSON e implementação hardcoded.

As recomendações visam:  
- eliminar campos redundantes ou mortos;  
- completar ou flexibilizar `surveyInfo`;  
- unificar o modelo de renderização (dados + schema, com `condition` quando fizer sentido) para attributes e responses;  
- e padronizar o uso de `dataPath` e `{{ }}`.

---

*Relatório gerado com base na análise do `surveyData.json` e do código em `GenericSectionRenderer`, `ContentRenderer`, `QuestionsList` e `dataResolver`.*

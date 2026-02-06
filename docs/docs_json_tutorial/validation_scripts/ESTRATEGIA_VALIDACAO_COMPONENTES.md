# Estratégia de Validação por Componente (Contrato Código ↔ JSON)

Este documento define o **contrato** entre o que o código de renderização espera e o que a validação deve garantir. O objetivo é que **`npm run validate`** (e `validate:json` / `validate:all`) validem todos os componentes de acordo com o que o código realmente usa, evitando erros em runtime (ex.: `toLocaleString` em `undefined`).

---

## 1. Princípio

- **Fonte da verdade:** Os componentes em `src/components/survey/` (Tables.jsx, TableRenderers.jsx, ChartRenderers.jsx, etc.) definem o formato esperado dos dados.
- **Validação:** Os scripts em `validation_scripts` (schema + custom-rules) devem reproduzir essas expectativas e falhar ou avisar quando o JSON não as atende.
- **Objetivo:** Nenhum JSON “válido” pelo validador deve causar crash no browser (ex.: `Cannot read properties of undefined (reading 'toLocaleString')`).

---

## 2. Erro específico: DistributionTable

### O que aconteceu

- **Componente:** `DistributionTable` (Tables.jsx) recebe `data` e faz, para cada item:
  - `item.segment`
  - `item.count.toLocaleString()`
  - `item.percentage` + `"%"`
- **Problema:** Em alguns relatórios, `distributionTable` no JSON tem **outro formato**: itens com `answer` e colunas dinâmicas por estado (ex.: `"Paraná"`, `"Rio Grande do Sul"`) em vez de `segment`, `count`, `percentage`. Nesses casos `item.count` é `undefined` e `item.count.toLocaleString()` lança **TypeError**.
- **Regra de validação:** Para todo componente `type: "distributionTable"`, o array resolvido pelo `dataPath` deve ser:
  - **Vazio:** permitido (o código exibe “Nenhum dado”).
  - **Não vazio:** cada elemento **obrigatoriamente** tem:
    - `segment` (string ou número, usado como rótulo)
    - `count` (número) — usado em `.toLocaleString()`
    - `percentage` (número) — usado na exibição
  - Se algum item tiver formato alternativo (ex.: `answer` + colunas por segmento), a validação deve **falhar** com mensagem clara (ex.: “distributionTable espera itens com segment, count, percentage; item com chave 'answer' não é suportado pelo componente DistributionTable”).

---

## 3. Contrato por tipo de componente (tabelas e gráficos que usam dataPath)

A tabela abaixo resume o que o **código** espera e o que a **validação** checa. “Shape” = estrutura dos itens do array (ou do objeto) apontado pelo dataPath.

| Tipo (component.type) | Onde no código | Shape esperado | Validação |
|------------------------|----------------|----------------|-----------|
| **distributionTable** | Tables.jsx `DistributionTable` | `{ segment, count (number), percentage (number) }` | Erro se item sem `segment`/`count`/`percentage` ou com `answer`/colunas dinâmicas. Array vazio permitido. |
| **sentimentTable** | Tables.jsx `SentimentTable` | `{ segment, positive (number), negative (number) }` | Erro se item sem `segment`/`positive`/`negative` (numbers). |
| **npsDistributionTable** | Tables.jsx `NPSDistributionTable` | `{ [segmentKey], promoters, neutrals, detractors }` (segmentKey de config ou "segment") | Erro se item sem segmentKey ou sem promoters/neutrals/detractors (numbers). |
| **npsTable** | Tables.jsx `NPSTable` | `{ [segmentKey], NPS ou nps (number) }` | Erro se item sem segmentKey ou sem NPS/nps (number). |
| **sentimentImpactTable** | Tables.jsx `SentimentImpactTable` | `{ sentiment, [segmentKeys]: number }` | Erro se item sem `sentiment`; valores por segmento devem ser number. |
| **positiveCategoriesTable** / **negativeCategoriesTable** | Tables.jsx | `{ category, [segmentKeys]: number }` | Erro se item sem `category`; valores por segmento devem ser number. |
| **recommendationsTable** | TableRenderers + Tables | Array ou objeto com `items`; cada item: `{ id, recommendation, severity, stakeholders (array) }`, opcionalmente `tasks` | Erro se item sem id/recommendation/severity/stakeholders (array). |
| **segmentationTable** | Tables.jsx `SegmentationTable` | `{ cluster, description, percentage (number) }`, opcionalmente `id`, `index` | Erro se item sem cluster/description/percentage (number). |
| **barChart** (distributionChart) | ChartRenderers | `{ segment, percentage (number) }` (count opcional) | Quando dataPath termina em `distributionChart`: erro se item com `answer`/colunas dinâmicas ou sem segment/percentage. |
| **sentimentDivergentChart** | ChartRenderers + Charts.jsx | `{ positive (number), negative (number), [yAxisDataKey] ou segment/category }` | Erro se item sem positive/negative (numbers) ou sem chave de rótulo. |
| **sentimentThreeColorChart** | Charts.jsx | `{ sentiment, [segmentKeys]: number }` (mesmo que sentimentImpactTable) | Erro se item sem sentiment; valores por segmento number. |
| **npsStackedChart** | ChartRenderers | Objeto com chaves Detrator/Neutro/Promotor ou array com option | Array: opções devem ser Detrator, Promotor, Neutro. |
| **topCategoriesCards** | CardRenderers.jsx | `{ rank, category, mentions, percentage (number) }`, opcionalmente `topics` | Erro se item sem rank/category/mentions/percentage (number). |
| **kpiCard** | CardRenderers.jsx | Objeto com `value` (ou config.valueKey) ou número primitivo | Erro se objeto sem value (ou valueKey). |
| **wordCloud** | WidgetRenderers + WordCloud.jsx | `{ text, value (number) }` | Erro se item sem text ou value (number). |

---

## 4. Ordem de execução da validação

1. **JSON Schema (ajv):** Estrutura global (metadata, sections, subsections, tipos de componente, etc.).
2. **custom-rules.js – ordem sugerida:**
   - Construir `sectionData` genérico por seção (já feito).
   - Validar dataPaths e existência de dados (já feito).
   - **Validar shape por tipo de componente** (novo): após resolver o dataPath, para tipos listados na tabela acima, verificar que cada item do array (quando aplicável) tem as propriedades que o código usa, com tipos corretos (ex.: `count` e `percentage` como número para distributionTable).
   - Validar templates `{{path}}`, questões, NPS, etc. (já feito).

---

## 5. Scripts e npm

- **`npm run validate:json <caminho>`** — Valida um único arquivo JSON (schema + custom-rules, incluindo regras de shape).
- **`npm run validate:all`** — Valida **todos** os JSONs encontrados (ex.: em `src/data/` e subpastas). Deve usar o mesmo script de validação que `validate:json`.
- **`npm run validate`** — Atalho para `validate:all`.

Assim, **validar** significa sempre: estrutura (schema) + dataPaths + **formatos de dados por componente (contrato código/JSON)**.

---

## 6. Manutenção

- Ao **alterar** um componente em `src/components/survey/` (ex.: nova propriedade obrigatória em uma tabela), atualizar:
  1. Esta estratégia (tabela de contrato).
  2. `rules/custom-rules.js` (validação de shape para esse tipo).
- Ao **adicionar** um novo tipo de componente que usa dataPath, registrar na tabela e em `VALID_COMPONENT_TYPES` e implementar a validação de shape correspondente.

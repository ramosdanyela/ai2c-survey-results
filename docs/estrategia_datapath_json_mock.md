# Estratégia: JSON mockado na aba Data Path (JsonReference)

## Objetivo

Garantir que **todos** os componentes exibidos na aba **Data Path** da página JsonReference tenham:

1. **Cabeçalho do componente** — estrutura JSON de exemplo (objeto `component`: `type`, `index`, `dataPath`, `config`, etc.).
2. **Corpo da section data** — estrutura JSON de exemplo (objeto `data.sectionData.<chave>` com dados fictícios que o componente consome).

Assim o usuário sabe exatamente como preencher o componente no JSON e quais chaves colocar em `section.data` (ou `subsection.data`).

---

## Situação atual

### Onde isso é definido

- **Arquivo:** `src/pages/JsonReference.jsx`
- **Fonte dos exemplos:** o objeto `otherComponentExampleData` (useMemo), que retorna um mapa `tipo → { component, data }`.
- **Lista exibida na aba:** `unifiedList`, que une:
  - **Used:** tipos que aparecem no JSON carregado (podem usar dados reais ou placeholder).
  - **Other:** tipos do `componentRegistry` que têm dataPath e não estão no JSON, exceto `accordion` e `questionsList`.

### Comportamento hoje

| Situação | O que o usuário vê |
|----------|--------------------|
| Tipo em **other** e existe em `otherComponentExampleData` | JSON completo: `component` + `data` com `sectionData` mockado. |
| Tipo em **other** e **não** existe em `otherComponentExampleData` | JSON genérico: `data.sectionData.<tipo>: "array ou objeto conforme o componente"`. |
| Tipo **used** e está na lista hardcoded `useMockForRender` | JSON completo do mock (barChart, sentimentDivergentChart, etc.). |
| Tipo **used** e **não** está em `useMockForRender` | JSON com `component` real e `data: { sectionData: "(dados da seção/subseção)" }` — sem exemplo de corpo. |

Ou seja: vários componentes (principalmente “used” e tabelas/outros em “other”) **não** têm estrutura JSON mockada completa.

---

## Inventário: quem tem e quem não tem mock

### Tipos no registry que aparecem na aba Data Path

Excluídos apenas: `accordion`, `questionsList` (não entram na lista “other”).

| Categoria | Tipo | Tem mock em otherComponentExampleData? |
|-----------|------|----------------------------------------|
| **Charts** | barChart | ✅ |
| | sentimentDivergentChart | ✅ |
| | sentimentThreeColorChart | ✅ |
| | npsStackedChart | ✅ |
| | lineChart | ✅ |
| | paretoChart | ✅ |
| | scatterPlot | ✅ |
| | histogram | ✅ |
| | quadrantChart | ✅ |
| | heatmap | ✅ |
| | sankeyDiagram | ✅ |
| | stackedBarMECE | ✅ |
| | evolutionaryScorecard | ✅ |
| | slopeGraph | ✅ |
| | waterfallChart | ✅ |
| **Cards** | npsScoreCard | ✅ |
| | topCategoriesCards | ✅ |
| | kpiCard | ✅ |
| **Tables** | recommendationsTable | ❌ |
| | segmentationTable | ❌ |
| | distributionTable | ✅ |
| | sentimentTable | ✅ |
| | npsDistributionTable | ❌ |
| | npsTable | ❌ |
| | sentimentImpactTable | ❌ |
| | positiveCategoriesTable | ❌ |
| | negativeCategoriesTable | ❌ |
| | analyticalTable | ✅ |
| **Widgets** | filterPills | ✅ |
| | wordCloud | ✅ |

**Resumo:** 7 tipos de **Tables** ainda não têm entrada em `otherComponentExampleData`:  
`recommendationsTable`, `segmentationTable`, `npsDistributionTable`, `npsTable`, `sentimentImpactTable`, `positiveCategoriesTable`, `negativeCategoriesTable`.

**Tipos “used”:** quando o tipo vem do JSON carregado, só alguns usam mock completo (lista hardcoded em `useMockForRender`). Os demais mostram placeholder em `data.sectionData`.

---

## Estratégia em 4 passos

### 1. Garantir mock para todos os tipos da aba (otherComponentExampleData)

**Ação:** Adicionar em `otherComponentExampleData` uma entrada para cada tipo que pode aparecer na aba Data Path e ainda não tem.

**Tipos a adicionar:**

- `recommendationsTable` — ver estrutura em `docs/ESTRUTURA_COMPONENTES_JSON.md` § 5.1.
- `segmentationTable` — § 5.2.
- `npsDistributionTable` — § 5.5 (array com colunas de distribuição NPS).
- `npsTable` — § 5.6 (array/objeto conforme layout).
- `sentimentImpactTable` — § 5.7 (dataPath típico: `sectionData.satisfactionImpactSentimentTable`).
- `positiveCategoriesTable` — § 5.8.
- `negativeCategoriesTable` — § 5.9.

**Formato por entrada (igual aos já existentes):**

```js
const recommendationsTable = {
  component: {
    type: "recommendationsTable",
    index: 0,
    dataPath: "sectionData.recommendationsTable",
    config: { severityLabels: { high: "Alta", medium: "Média", low: "Baixa" } },
  },
  data: {
    sectionData: {
      recommendationsTable: [
        { id: "rec1", recommendation: "Recomendação 1", priority: "alta", category: "Atendimento" },
        { id: "rec2", recommendation: "Recomendação 2", priority: "média", category: "Produto" },
      ],
    },
  },
};
// ... idem para os outros 6 tipos
```

Incluir cada um no `return` do useMemo de `otherComponentExampleData`.

**Referência de estruturas:** usar `docs/ESTRUTURA_COMPONENTES_JSON.md` e, se necessário, os renderers em `TableRenderers.jsx` para ver exatamente quais campos cada tabela espera.

---

### 2. Usar sempre o mock quando existir (used + other)

**Problema:** Para itens “used”, o código só usa o JSON completo do mock quando o tipo está na lista fixa `useMockForRender`. Os demais mostram `"(dados da seção/subseção)"`.

**Ação:** Alterar a lógica de `unifiedList` para:

- Se existir `otherComponentExampleData[componentType]`, **sempre** usar esse objeto para montar:
  - `exampleStr`: `JSON.stringify({ component: exampleData.component, data: exampleData.data }, null, 2)`.
  - `dataForRender`: merge de `realData` com `exampleData.data.sectionData` (como já é feito para “other” quando há exampleData).
- Remover (ou reduzir) a lista hardcoded `useMockForRender` e tratar “tem mock” como “existe chave em `otherComponentExampleData`”.

Assim, tanto “used” quanto “other” passam a exibir cabeçalho + section data mockados quando houver entrada em `otherComponentExampleData`.

---

### 3. Fallback explícito para tipos sem mock

**Ação:** Manter o fallback em `getOtherComponentExample(type)` quando não houver entrada em `otherComponentExampleData`, mas deixar o placeholder mais útil:

- Em vez de `data.sectionData.<type>: "array ou objeto conforme o componente"`, usar um comentário no JSON (se o viewer permitir) ou um bloco de texto ao lado explicando: “Estrutura de dados não documentada para este tipo; consulte ESTRUTURA_COMPONENTES_JSON.md ou o renderer correspondente.”

Opcional: adicionar um badge ou ícone na aba Data Path para itens que ainda não têm mock (“Exemplo de dados em construção”), para o usuário saber que aquele card ainda não está completo.

---

### 4. Checklist de revisão e manutenção

**Revisão inicial (uma vez):**

1. Listar todos os tipos em `componentRegistry` que têm dataPath (ou que podem aparecer na aba).
2. Para cada tipo, verificar se existe entrada em `otherComponentExampleData` com `component` e `data.sectionData` preenchidos.
3. Anotar os que faltam (hoje: as 7 tabelas acima).
4. Implementar os mocks faltantes (passo 1) e ajustar a lógica do passo 2.

**Quando adicionar novo tipo no registry:**

1. Se o novo tipo for exibido na aba Data Path, adicionar em `otherComponentExampleData` com:
   - `component`: tipo, index, dataPath, config (mínimo).
   - `data.sectionData.<chave>`: dados fictícios no formato que o renderer espera.
2. Atualizar `docs/ESTRUTURA_COMPONENTES_JSON.md` com a estrutura do componente e dos dados.

**Quando mudar contrato de um componente (dataPath ou formato de dados):**

1. Ajustar o mock correspondente em `otherComponentExampleData`.
2. Ajustar a documentação em `ESTRUTURA_COMPONENTES_JSON.md`.

---

## Ordem sugerida de implementação

1. **Fase 1 — Dados:** Adicionar as 7 entradas de tabelas em `otherComponentExampleData` e incluir no `return` do useMemo.
2. **Fase 2 — Lógica:** Alterar `unifiedList` para usar `otherComponentExampleData[componentType]` sempre que existir (eliminar dependência da lista hardcoded para `exampleStr` e `dataForRender`).
3. **Fase 3 — Revisão:** Abrir a aba Data Path, filtrar por tipo e conferir que cada componente mostra JSON completo (cabeçalho + section data) com dados fictícios coerentes.
4. **Fase 4 — Doc:** Atualizar este documento com “Concluído em dd/mm/aaaa” e qualquer exceção (ex.: tipo que não aceita dataPath e por isso não tem section data).

---

## Referências no código

| O quê | Onde |
|-------|------|
| Definição dos mocks (other) | `JsonReference.jsx` — useMemo `otherComponentExampleData` (~linhas 822–1274) |
| Lista unificada (used + other) | `JsonReference.jsx` — useMemo `unifiedList` (~1310–1383) |
| Uso do mock para “used” | `JsonReference.jsx` — trecho `useMockForRender` e `exampleStr` (~1322–1356) |
| Fallback quando não há mock | `JsonReference.jsx` — `getOtherComponentExample(type)` (~1276–1302) |
| Tipos excluídos da aba Data Path | `JsonReference.jsx` — `otherFilterExclude` (accordion, questionsList) |
| Estrutura de cada tipo (componente + dados) | `docs/ESTRUTURA_COMPONENTES_JSON.md` |
| Renderers de tabelas (contrato de dados) | `src/components/survey/common/TableRenderers.jsx` |

Com isso, a aba Data Path fica com **estrutura JSON mockada (cabeçalho + section data)** para todos os componentes listados, e fica definida uma estratégia clara para revisar os que não estão e manter no futuro.

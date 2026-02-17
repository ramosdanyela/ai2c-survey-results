# AI2C Results – Survey Dashboard

Aplicação de visualização de resultados de pesquisa **genérica e orientada a JSON**. Seções, subseções e componentes são renderizados dinamicamente a partir de schemas definidos no JSON: não há seções hardcoded; a estrutura do relatório é totalmente definida pelos dados.

---

## Início rápido

```bash
npm install
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173).

```bash
npm run build      # build de produção
npm run preview    # preview do build
```

---

## O que a aplicação faz

- **Visualização de relatórios de pesquisa** – Exibe seções (sumário executivo, respostas, atributos, etc.) com gráficos, tabelas, cards e listas de perguntas.
- **Export** – Permite escolher seções e gerar **preview em formato A4** com opção de **Save as PDF** (impressão do browser).
- **Filtros** – Filtros por atributos (ex.: estado, tipo de cliente) e por tipo de pergunta na seção de respostas.
- **Responsivo** – Layout adaptado para desktop e mobile (sidebar fixa em telas grandes, menu hamburger em telas pequenas).

O JSON de relatório contém `sections` (com ou sem subseções), cada uma com um **render schema** que lista componentes (`barChart`, `card`, `distributionTable`, `questionsList`, etc.). O **GenericSectionRenderer** lê esse schema e, através do **ComponentRegistry**, instancia os componentes corretos (ChartRenderers, CardRenderers, TableRenderers, WidgetRenderers).

---

## Fluxo de dados e renderização

```
JSON do relatório (surveyDataService / API)
         ↓
   useSurveyData()  (React Query)
         ↓
   data → SurveyLayout / Export / ExportPreview
         ↓
   GenericSectionRenderer (por seção/subseção)
         ↓
   renderComponent(component, data)  (ComponentRegistry)
         ↓
   SchemaBarChart | SchemaCard | SchemaDistributionTable | ...
         ↓
   Recharts / Card / Table / WordCloud / etc.
```

- **Dados:** O hook `useSurveyData()` obtém o JSON via `fetchSurveyData()` (por padrão um JSON local; pode ser trocado por chamada HTTP). O contexto (incluindo `sectionData` e `question` na seção de respostas) é montado em `GenericSectionRenderer` e passado para cada componente.
- **Resolução de dados:** Cada componente declara um `dataPath` (ex.: `sectionData.barChart`, `question.data.distributionChart`). O **dataResolver** (`resolveDataPath`) resolve esses caminhos sobre o objeto `data` e devolve o array ou objeto que o gráfico/tabela usa.
- **Estilos:** O **styleResolver** aplica variantes de card e estilos a partir do JSON (`cardStyleVariant`, etc.). Cores e temas estão em `src/lib/colors.js` e em variáveis CSS.

---

## Estrutura do repositório

```
├── docs/
│   ├── official_docs/              # Documentação oficial (estrutura JSON, uiTexts, migração API)
│   │   ├── ESTRUTURA_COMPONENTES_JSON.md
│   │   ├── REFERENCIA_UITEXTS_JSON.md
│   │   ├── MIGRACAO_MOCKS_PARA_API_REAL.md
│   │   └── ESTRATEGIA_VERIFICACAO_DOCS_ATUALIZADOS.md
│   └── validation_scripts/         # Validação de JSON de relatório
│       ├── rules/
│       │   └── custom-rules.js
│       ├── schema/
│       │   └── surveyData.schema.json
│       └── scripts/
│           ├── validate-json.js
│           └── validate-all-jsons.js
├── public/
│   ├── favicon.ico
│   └── placeholder.svg
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── export/
│   │   │   └── ExportTimestamp.jsx
│   │   ├── survey/
│   │   │   ├── common/             # Renderizadores genéricos e registros
│   │   │   │   ├── CardRenderers.jsx
│   │   │   │   ├── ChartRenderers.jsx
│   │   │   │   ├── ComponentRegistry.jsx
│   │   │   │   ├── GenericCard.jsx
│   │   │   │   ├── GenericSectionRenderer.jsx
│   │   │   │   ├── GenericSubsection.jsx
│   │   │   │   ├── QuestionsList.jsx
│   │   │   │   ├── TableRenderers.jsx
│   │   │   │   └── WidgetRenderers.jsx
│   │   │   ├── components/        # Layout do survey
│   │   │   │   ├── ContentRenderer.jsx
│   │   │   │   ├── FilterPanel.jsx
│   │   │   │   ├── NavigationButtons.jsx
│   │   │   │   ├── SurveyHeader.jsx
│   │   │   │   ├── SurveyLayout.jsx
│   │   │   │   └── SurveySidebar.jsx
│   │   │   └── widgets/           # Gráficos, tabelas, word cloud, etc.
│   │   │       ├── charts/
│   │   │       ├── tables/
│   │   │       ├── AnalyticalTable.jsx
│   │   │       ├── KPICard.jsx
│   │   │       ├── WordCloud.jsx
│   │   │       └── ...
│   │   └── ui/                    # Componentes shadcn (TS)
│   ├── config/
│   │   └── questionTemplates.js
│   ├── data/                      # JSONs de relatórios e testes
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── tsconfig.json
├── components.json
├── eslint.config.js
└── postcss.config.js
```

---

## Rotas e páginas

| Caminho | Página | Descrição |
|--------|--------|-----------|
| `/` | Index | Entrada; redireciona ou exibe link para o relatório (Export). |
| `/export` | Export | Lista de seções do relatório, sidebar com resumo (respondentes, taxa de adesão, etc.), seleção de seções para export e botão para abrir o preview. |
| `/export/preview` | ExportPreview | Preview do relatório no formato A4, com opção "Save as PDF" (impressão). Parâmetros de URL: `fullReport=true` ou `sections=id1,id2`. |
| `/json-reference` | JsonReference | Referência da estrutura do JSON: tipos de componentes, exemplos, dataPaths. |
| `/json-viewer` | JsonViewer | Visualização/inspeção do JSON carregado. |
| `/charts` | Charts | Página de exemplos de gráficos (barChart, lineChart, etc.) para desenvolvimento. |

---

## Tipos de componentes (JSON → UI)

Cada item no `renderSchema` do JSON tem um `type` que corresponde a um renderizador no **ComponentRegistry**.

| Categoria | Tipos (exemplos) |
|-----------|-------------------|
| **Charts** | `barChart`, `sentimentDivergentChart`, `sentimentThreeColorChart`, `npsStackedChart`, `lineChart`, `paretoChart`, `scatterPlot`, `histogram`, `quadrantChart`, `heatmap`, `sankeyDiagram`, `stackedBarMECE`, `evolutionaryScorecard`, `slopeGraph`, `waterfallChart` |
| **Cards** | `card`, `npsScoreCard`, `topCategoriesCards`, `kpiCard` |
| **Tables** | `recommendationsTable`, `segmentationTable`, `distributionTable`, `sentimentTable`, `npsDistributionTable`, `npsTable`, `sentimentImpactTable`, `positiveCategoriesTable`, `negativeCategoriesTable`, `analyticalTable` |
| **Widgets** | `questionsList`, `filterPills`, `wordCloud`, `accordion` |

Cada componente costuma ter `dataPath` (ex.: `sectionData.barChart`) e opcionalmente `config` (margins, dataKey, preset, etc.). Detalhes e exemplos estão na página **JsonReference** (`/json-reference`) e no schema de validação.

---

## Scripts npm

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (Vite). |
| `npm run build` | Build de produção. |
| `npm run build:dev` | Build em modo development. |
| `npm run preview` | Servir e visualizar o build. |
| `npm run lint` | Executar ESLint. |
| `npm run validate` | Valida todos os JSONs em `src/data/` (schema + regras customizadas). |
| `npm run validate:json` | Valida um único arquivo; passar o caminho como argumento. |
| `npm run validate:all` | Mesmo que `validate`. |

Exemplos:

```bash
npm run validate:json src/data/surveyData.json
npm run validate:all
```

---

## Validação de JSON

A validação garante que os relatórios JSON estejam alinhados ao que o código espera (evitando erros em runtime).

- **Schema (AJV):** `docs/validation_scripts/schema/surveyData.schema.json` – tipos, propriedades obrigatórias, formatos.
- **Regras customizadas:** `docs/validation_scripts/rules/custom-rules.js` – função `validateCustomRules(data)` com checagens de shape, dados obrigatórios em seções/respostas, etc.

Os scripts `validate-json.js` e `validate-all-jsons.js` carregam schema e regras, validam o JSON e exibem erros no terminal.

---

## Dados e integração com API

- **Origem dos dados:** O hook `useSurveyData()` chama `fetchSurveyData()` do **surveyDataService** (`src/services/surveyDataService.js`). Hoje o serviço retorna um JSON estático (ex.: `src/data/tests-06-02/json_file_app.json`).
- **Integração com API real:** Ajustar `surveyDataService.js` para fazer `fetch` à API (por exemplo usando `VITE_API_URL` e `VITE_SURVEY_DATA_ENDPOINT`). Documentação passo a passo em **`docs/official_docs/MIGRACAO_MOCKS_PARA_API_REAL.md`** (variáveis de ambiente, autenticação, tratamento de erros).

Variáveis de ambiente úteis (prefixo `VITE_` para expor no front):

- `VITE_API_URL` – URL base da API.
- `VITE_SURVEY_DATA_ENDPOINT` – Endpoint dos dados do relatório.
- `VITE_API_TOKEN` – Token Bearer (opcional).
- `VITE_API_TIMEOUT` – Timeout em ms.
- `VITE_USE_MOCK_DATA` / `VITE_API_DELAY` – Uso de mock e delay (desenvolvimento).

---

## Serviços e hooks principais

| Ficheiro | Função |
|----------|--------|
| `src/services/surveyDataService.js` | `fetchSurveyData()` – retorna o JSON do relatório (mock ou API). |
| `src/services/dataResolver.js` | `resolveDataPath(data, path)` – resolve caminhos como `sectionData.barChart` ou `question.data.distributionChart` sobre o objeto `data`. |
| `src/services/styleResolver.js` | Aplica variantes de estilo e classes a partir do JSON (ex.: cardStyleVariant). |
| `src/hooks/useSurveyData.js` | Hook que usa React Query para carregar dados; expõe `data`, `loading`, `error`, `refetch`, `resolvePath`, `getSectionById`. |
| `src/hooks/use-mobile.jsx` | `useIsMobile()` – detecta viewport &lt; 768px para layout responsivo. |
| `src/hooks/useQuestionFilters.js` | Estado e lógica dos filtros de perguntas (tipo, atributos). |

---

## Tecnologias

- **React 18** + **Vite**
- **React Router** – rotas (Index, Export, ExportPreview, JsonReference, JsonViewer, Charts).
- **TanStack Query** – carregamento, cache e estado dos dados do relatório.
- **Tailwind CSS** – estilos; variantes em `src/styles/variants.js`.
- **shadcn/ui** + **Radix UI** – componentes em `src/components/ui/` (TypeScript).
- **Recharts** – gráficos (bar, line, stacked, NPS, sentiment, etc.).
- **Lucide React** – ícones.
- **AJV** – validação de JSON nos scripts em `docs/validation_scripts/`.

---

## Documentação adicional

- **Documentação oficial:** `docs/official_docs/`  
  - **ESTRUTURA_COMPONENTES_JSON.md** – Estrutura de componentes no JSON (charts, cards, tabelas, widgets, uiTexts).  
  - **REFERENCIA_UITEXTS_JSON.md** – Árvore completa de chaves `uiTexts` e fallbacks.  
  - **MIGRACAO_MOCKS_PARA_API_REAL.md** – Passo a passo para trocar mocks por APIs reais.  
  - **ESTRATEGIA_VERIFICACAO_DOCS_ATUALIZADOS.md** – Estratégia para manter README e docs alinhados ao código.
- **Validação de JSON:**  
  - Schema: `docs/validation_scripts/schema/surveyData.schema.json`  
  - Regras: `docs/validation_scripts/rules/custom-rules.js`

---

## Licença

Projeto privado e proprietário.

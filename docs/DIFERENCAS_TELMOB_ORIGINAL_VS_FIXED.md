# Documento de diferenças: telmob_original_daniel.json → telmob_fixed_daniel.json

## Checklist de impacto

Ao consumir o JSON (app, relatórios, testes) com **telmob_fixed_daniel.json** como referência:

1. **topCategoriesCards:** Usar estrutura por categoria com `rank`, `mentions`, `percentage` e `topics[]`.
2. **sentimentStackedChart → sentimentDivergentChart:** No fixed, o nome do dado e do componente passou a ser **sentimentDivergentChart**; a propriedade da categoria deixou de ser `value` e passou a ser `category`.
3. **Distribuição em Atributos (Tipo de Cliente e Estado):** Esperar barChart e distributionTable dentro de um card "Distribuição dos respondentes" com `cardStyleVariant: "flex-column"`; barChart e distributionTable com `index`.
4. **NPS (UI):** Usar `categoryName` e a hierarquia h3/h4 para títulos.
5. **NPS (dados):** Usar sempre a chave `segment` nas linhas de npsDistributionTable e npsTable, em todas as seções.

\_\_

**Arquivos:**

- **Original:** `src/data/telmob_original_daniel.json` (1885 linhas)
- **Corrigido/fixed (padrão):** `src/data/telmob_fixed_daniel.json` (2045 linhas)

---

## 1. topCategoriesCards — estrutura de dados

**Caminho:** Na mesma pergunta (question02) da seção de Insights/Análise: `question02.data.topCategoriesCards`.

### Como era (original)

Cada item era um objeto com `category`, `topic` e `sentiment`. Havia um card por combinação categoria+tópico (lista flat):

```json
"topCategoriesCards": [
  {
    "category": "serviço de rede",
    "topic": "agilidade no atendimento",
    "sentiment": "positive"
  },
  ...
  {
    "category": "cobertura de rede",
    "topic": "disponibilidade do serviço",
    "sentiment": "negative"
  }
]
```

### Como ficou (fixed — padrão)

Os itens passam a ser **por categoria**, com `rank`, `mentions`, `percentage` e um array `topics` (cada tópico com `topic` e `sentiment`):

```json
"topCategoriesCards": [
  {
    "rank": 1,
    "category": "serviço de rede",
    "mentions": 6,
    "percentage": 100,
    "topics": [
      { "topic": "agilidade no atendimento", "sentiment": "positive" },
      ...
    ]
  },
  {
    "rank": 2,
    "category": "suporte ao cliente",
    ...
  },
  {
    "rank": 3,
    "category": "cobertura de rede",
    "mentions": 3,
    "percentage": 50,
    "topics": [ ... ]
  }
]
```

**Resumo:** De 15 objetos flat para 3 objetos agrupados por categoria, com rank, métricas e lista de tópicos.

---

## 2. sentimentStackedChart → sentimentDivergentChart

**Caminho:** Na seção de Insights/Análise (pergunta "Quais são os principais pontos que impactam sua satisfação?"): os **dados** ficam em `question02.data.sentimentStackedChart` (original) ou `question02.data.sentimentDivergentChart` (fixed). O componente na UI usa `dataPath` para `sectionData.sentimentDivergentChart` (espelhado no nível da seção).

No fixed, **sentimentStackedChart** foi substituído por **sentimentDivergentChart**: tanto o nome do array de dados quanto o tipo do componente. O conteúdo é o mesmo (categoria + positive/negative); só mudam o nome da chave da categoria (`value` → `category`) e o nome do gráfico.

### Original

Dados em `sentimentStackedChart` com propriedade `value` para o nome da categoria (dentro de question02.data):

```json
"sentimentStackedChart": [
  { "value": "serviço de rede", "positive": 10.5, "negative": 38.1 },
  { "value": "suporte ao cliente", "positive": 6.4, "negative": 10.5 },
  { "value": "cobertura de rede", "positive": 1.8, "negative": 13.6 },
  { "value": "oferta e preços", "positive": 3.3, "negative": 6.6 },
  { "value": "outro", "positive": 2.8, "negative": 6.4 }
]
```

(O componente na seção já é `sentimentDivergentChart` apontando para `sectionData.sentimentDivergentChart` no nível da seção; no original, dentro de question02 os _dados_ ainda vinham como `sentimentStackedChart` com `value`.)

### Fixed (padrão)

Dados em **sentimentDivergentChart** com propriedade **category**:

```json
"sentimentDivergentChart": [
  { "category": "serviço de rede", "positive": 10.5, "negative": 38.1 },
  { "category": "suporte ao cliente", "positive": 6.4, "negative": 10.5 },
  { "category": "cobertura de rede", "positive": 1.8, "negative": 13.6 },
  { "category": "oferta e preços", "positive": 3.3, "negative": 6.6 },
  { "category": "outro", "positive": 2.8, "negative": 6.4 }
]
```

O componente continua sendo `sentimentDivergentChart` com `config.yAxisDataKey: "category"`.

**Resumo:** sentimentStackedChart virou sentimentDivergentChart (nome do dado e alinhamento com o componente); use `category` em vez de `value` nos itens do array.

---

## 3. Seção "Tipo de Cliente" — distribuição (barChart e distributionTable)

**Caminho:** Seção "Tipo de Cliente", em `subsections[].components`.

### Como era (original)

Gráfico e tabela soltos no mesmo grid-container:

```json
{
  "type": "grid-container",
  "index": 1,
  "components": [
    {
      "type": "barChart",
      "dataPath": "sectionData.TipodeCliente.distributionChart"
    },
    {
      "type": "distributionTable",
      "dataPath": "sectionData.TipodeCliente.distributionTable"
    }
  ]
}
```

### Como ficou (fixed — padrão)

Um único card "Distribuição dos respondentes" agrupa gráfico e tabela; barChart e distributionTable ganham `index`; o card usa `cardStyleVariant: "flex-column"` em ambas as seções (Tipo de Cliente e Estado):

```json
{
  "type": "card",
  "index": 1,
  "title": "Distribuição dos respondentes",
  "cardStyleVariant": "flex-column",
  "cardContentVariant": "with-charts",
  "components": [
    {
      "type": "barChart",
      "index": 0,
      "dataPath": "sectionData.TipodeCliente.distributionChart"
    },
    {
      "type": "distributionTable",
      "index": 1,
      "dataPath": "sectionData.TipodeCliente.distributionTable"
    }
  ]
}
```

**Resumo:** Gráfico e tabela dentro de um card com título; barChart e distributionTable com `index`; card com `cardStyleVariant: "flex-column"` em Tipo de Cliente e Estado.

---

## 4. Seção "Tipo de Cliente" — NPS (npsDistributionTable e npsTable)

### Original

Componentes diretos no container, sem títulos hierárquicos nem metadados:

```json
{
  "type": "container",
  "components": [
    {
      "type": "npsDistributionTable",
      "dataPath": "sectionData.TipodeCliente.questions.question01.npsDistributionTable"
    },
    {
      "type": "npsTable",
      "dataPath": "sectionData.TipodeCliente.questions.question01.npsTable"
    }
  ]
}
```

### Fixed (padrão)

Estrutura com h3 "Respostas", containers com h4 "Promotores, Neutros, Detratores" e "NPS", e componentes com `index` e `categoryName`:

```json
{
  "type": "container",
  "index": 1,
  "components": [
    { "type": "h3", "index": 0, "text": "Respostas" },
    {
      "type": "container",
      "index": 1,
      "components": [
        {
          "type": "container",
          "index": 0,
          "components": [
            {
              "type": "h4",
              "index": 0,
              "text": "Promotores, Neutros, Detratores"
            },
            {
              "type": "npsDistributionTable",
              "index": 1,
              "dataPath": "sectionData.TipodeCliente.questions.question01.npsDistributionTable",
              "categoryName": "Por Tipo de Cliente"
            }
          ]
        },
        {
          "type": "container",
          "index": 1,
          "components": [
            { "type": "h4", "index": 0, "text": "NPS" },
            {
              "type": "npsTable",
              "index": 1,
              "dataPath": "sectionData.TipodeCliente.questions.question01.npsTable",
              "categoryName": "Por Tipo de Cliente"
            }
          ]
        }
      ]
    }
  ]
}
```

**Resumo:** NPS com hierarquia de títulos e metadados `index` e `categoryName` para renderização e acessibilidade.

---

## 5. Seção "Tipo de Cliente" — sentimentThreeColorChart e layout de sentimento

### Original

Card "Sumário" com título e texto; um único container com os quatro componentes (chart e três tabelas), sem `index` nos componentes:

```json
{
  "type": "container",
  "components": [
    {
      "type": "sentimentThreeColorChart",
      "dataPath": "sectionData.TipodeCliente.questions.question02.satisfactionImpactSentimentChart"
    },
    {
      "type": "sentimentImpactTable",
      "dataPath": "..."
    },
    {
      "type": "positiveCategoriesTable",
      "dataPath": "..."
    },
    {
      "type": "negativeCategoriesTable",
      "dataPath": "..."
    }
  ]
}
```

### Fixed (padrão)

- O primeiro bloco **continua sendo um card** "Sumário" com título e texto (não vira container com h3).
- O container que agrupava chart e tabelas é **dividido em três containers**, cada um com h3 e os componentes com `index`:
  - Container com h3 "Análise de sentimento" → sentimentThreeColorChart (`index: 1`) e sentimentImpactTable (`index: 2`).
  - Container com h3 "Categorias com sentimento positivo - Top 3" → positiveCategoriesTable (`index: 1`).
  - Container com h3 "Categorias com sentimento negativo - Top 3" → negativeCategoriesTable (`index: 1`).
- Na seção **Estado**, o sentimentThreeColorChart ganha ainda `config: {}`.

---

## 6. Seção "Estado" — distribuição, NPS e sentimento

Alterações análogas às da seção "Tipo de Cliente":

- **Distribuição:** barChart e distributionTable dentro de um card "Distribuição dos respondentes" com `cardStyleVariant: "flex-column"`; barChart e distributionTable com `index`.
- **NPS:** Estrutura com h3 "Respostas", h4 e componentes com `index` e `categoryName`: "Por Estado".
- **sentimentThreeColorChart:** Inclusão de `index: 1` e `config: {}`.

---

## 7. Dados NPS — chave dinâmica → "segment"

**Caminho:** `sectionData.TipodeCliente.questions.question01` e `sectionData.Estado.questions.question01`.

### Original

As linhas das tabelas usavam a chave dinâmica do eixo (nome do segmento) como nome da coluna:

- Tipo de Cliente: `"Tipo de Cliente": "controle"`, `"Tipo de Cliente": "pré-pago"`, etc.
- Estado: `"Estado": "CE"`, `"Estado": "RJ"`, etc.

Exemplo (Tipo de Cliente):

```json
"npsDistributionTable": [
  { "Tipo de Cliente": "controle", "promoters": 28.6, "neutrals": 20.0, "detractors": 51.4 },
  { "Tipo de Cliente": "pré-pago", ... },
  { "Tipo de Cliente": "pós-pago", ... }
],
"npsTable": [
  { "Tipo de Cliente": "controle", "NPS": -22.8 },
  ...
]
```

### Fixed (padrão)

Todas as tabelas NPS passam a usar a chave fixa `segment`:

```json
"npsDistributionTable": [
  { "segment": "controle", "promoters": 28.6, "neutrals": 20.0, "detractors": 51.4 },
  { "segment": "pré-pago", ... },
  { "segment": "pós-pago", ... }
],
"npsTable": [
  { "segment": "controle", "NPS": -22.8 },
  ...
]
```

O mesmo vale para Estado (`"Estado": "CE"` → `"segment": "CE"`).

**Resumo:** Schema padronizado com `segment` em vez de chaves dinâmicas por seção, facilitando consumo e componentes genéricos.

---

## 8. Final do arquivo (newline)

### Original

O arquivo terminava sem newline após o último `}`.

### Fixed (padrão)

O arquivo termina com newline após o último `}` (padrão POSIX/boas práticas).

---

_Documento revisado na íntegra a partir do diff entre `telmob_original_daniel.json` e `telmob_fixed_daniel.json`. Referência: `telmob_fixed_daniel.json`._

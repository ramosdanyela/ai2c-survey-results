# Documento de diferenças: telmob_original_daniel.json → telmob_fixed_daniel.json

**Objetivo:** Registrar todas as alterações entre o JSON original e o JSON corrigido. O arquivo **fixed** é a versão de referência (correta).

**Arquivos:**

- **Original:** `src/data/telmob_original_daniel.json` (1885 linhas)
- **Fixed:** `src/data/telmob_fixed_daniel.json` (1961 linhas)

---

## Resumo das alterações

| #   | Localização                                          | Tipo               | Descrição                                                                                                                                                        |
| --- | ---------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `sections[].data.topCategoriesCards`                 | Estrutura de dados | Lista flat de cards → lista de categorias com `rank`, `mentions`, `percentage` e array `topics`                                                                  |
| 2   | Seção "Tipo de Cliente"                              | UI / componentes   | `barChart` e `distributionTable` encapsulados em cards com título e `config`; NPS com `index`, `categoryName` e `config`; `sentimentThreeColorChart` com `index` |
| 3   | Seção "Estado"                                       | UI / componentes   | Mesmo padrão de encapsulamento em cards e configs para gráficos/tabelas                                                                                          |
| 4   | `satisfactionImpactSentimentChart` (Tipo de Cliente) | Valores            | Labels de sentimento em minúsculo → capitalizados (`Negativo`, `Não Aplicável`, `Positivo`)                                                                      |
| 5   | Final do arquivo                                     | Formato            | Inclusão de newline no final do JSON                                                                                                                             |

---

## 1. topCategoriesCards — estrutura de dados

**Caminho:** Dentro da primeira seção (ex.: Insights / Análise), em `data.topCategoriesCards`.

### Como era (original)

Cada item era um objeto com `category`, `topic` e `sentiment`. Havia um card por combinação categoria+tópico (lista “flat”):

```json
"topCategoriesCards": [
  {
    "category": "serviço de rede",
    "topic": "agilidade no atendimento",
    "sentiment": "positive"
  },
  {
    "category": "serviço de rede",
    "topic": "Qualidade dos resultados",
    "sentiment": "positive"
  },
  {
    "category": "serviço de rede",
    "topic": "eficiência do serviço",
    "sentiment": "positive"
  },
  {
    "category": "serviço de rede",
    "topic": "confiabilidade do serviço",
    "sentiment": "negative"
  },
  {
    "category": "serviço de rede",
    "topic": "confiabilidade da rede",
    "sentiment": "negative"
  },
  {
    "category": "serviço de rede",
    "topic": "estabilidade da rede",
    "sentiment": "negative"
  },
  {
    "category": "suporte ao cliente",
    "topic": "atenção ao cliente",
    "sentiment": "positive"
  },
  {
    "category": "suporte ao cliente",
    "topic": "Tratamento respeitoso",
    "sentiment": "positive"
  },
  {
    "category": "suporte ao cliente",
    "topic": "prontidão de resposta",
    "sentiment": "positive"
  },
  {
    "category": "suporte ao cliente",
    "topic": "Preocupações com a retenção de clientes",
    "sentiment": "negative"
  },
  {
    "category": "suporte ao cliente",
    "topic": "usabilidade do aplicativo",
    "sentiment": "negative"
  },
  {
    "category": "suporte ao cliente",
    "topic": "intenção de cancelamento do cliente",
    "sentiment": "negative"
  },
  {
    "category": "cobertura de rede",
    "topic": "cobertura de rede",
    "sentiment": "negative"
  },
  {
    "category": "cobertura de rede",
    "topic": "qualidade do sinal",
    "sentiment": "negative"
  },
  {
    "category": "cobertura de rede",
    "topic": "disponibilidade do serviço",
    "sentiment": "negative"
  }
]
```

### Como ficou (fixed)

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
      { "topic": "Qualidade dos resultados", "sentiment": "positive" },
      { "topic": "eficiência do serviço", "sentiment": "positive" },
      { "topic": "confiabilidade do serviço", "sentiment": "negative" },
      { "topic": "confiabilidade da rede", "sentiment": "negative" },
      { "topic": "estabilidade da rede", "sentiment": "negative" }
    ]
  },
  {
    "rank": 2,
    "category": "suporte ao cliente",
    "mentions": 6,
    "percentage": 100,
    "topics": [
      { "topic": "atenção ao cliente", "sentiment": "positive" },
      { "topic": "Tratamento respeitoso", "sentiment": "positive" },
      { "topic": "prontidão de resposta", "sentiment": "positive" },
      { "topic": "Preocupações com a retenção de clientes", "sentiment": "negative" },
      { "topic": "usabilidade do aplicativo", "sentiment": "negative" },
      { "topic": "intenção de cancelamento do cliente", "sentiment": "negative" }
    ]
  },
  {
    "rank": 3,
    "category": "cobertura de rede",
    "mentions": 3,
    "percentage": 50,
    "topics": [
      { "topic": "cobertura de rede", "sentiment": "negative" },
      { "topic": "qualidade do sinal", "sentiment": "negative" },
      { "topic": "disponibilidade do serviço", "sentiment": "negative" }
    ]
  }
]
```

**Resumo:** De 15 objetos flat para 3 objetos agrupados por categoria, com rank, métricas e lista de tópicos.

---

## 2. Seção "Tipo de Cliente" — distribuição (barChart e distributionTable)

**Caminho:** Seção com `id` relacionado a "Tipo de Cliente", em `subsections[].components` (grid-container).

### Como era (original)

Gráfico e tabela soltos no mesmo container:

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

### Como ficou (fixed)

Cada um dentro de um card, com título e (no gráfico) `config`:

```json
{
  "type": "grid-container",
  "index": 1,
  "components": [
    {
      "type": "card",
      "index": 0,
      "title": "Distribuição dos respondentes",
      "cardStyleVariant": "flex-column",
      "cardContentVariant": "with-charts",
      "components": [
        {
          "type": "barChart",
          "index": 0,
          "dataPath": "sectionData.TipodeCliente.distributionChart",
          "config": {
            "dataKey": "percentage",
            "yAxisDataKey": "segment"
          }
        }
      ]
    },
    {
      "type": "card",
      "index": 1,
      "title": "Distribuição dos respondentes",
      "components": [
        {
          "type": "distributionTable",
          "index": 1,
          "dataPath": "sectionData.TipodeCliente.distributionTable"
        }
      ]
    }
  ]
}
```

**Resumo:** Gráfico e tabela passam a estar dentro de cards com título; barChart ganha `index` e `config` (`dataKey`, `yAxisDataKey`).

---

## 3. Seção "Tipo de Cliente" — NPS (npsDistributionTable e npsTable)

### Como era (original)

```json
{
  "type": "npsDistributionTable",
  "dataPath": "sectionData.TipodeCliente.questions.question01.npsDistributionTable"
},
{
  "type": "npsTable",
  "dataPath": "sectionData.TipodeCliente.questions.question01.npsTable"
}
```

### Como ficou (fixed)

Inclusão de `index`, `categoryName` e `config` (com eixo/coluna de dados):

```json
{
  "type": "npsDistributionTable",
  "index": 0,
  "dataPath": "sectionData.TipodeCliente.questions.question01.npsDistributionTable",
  "categoryName": "Por Tipo de Cliente",
  "config": {
    "yAxisDataKey": "Tipo de Cliente"
  }
},
{
  "type": "npsTable",
  "index": 1,
  "dataPath": "sectionData.TipodeCliente.questions.question01.npsTable",
  "categoryName": "Por Tipo de Cliente",
  "config": {
    "dataKey": "NPS",
    "yAxisDataKey": "Tipo de Cliente"
  }
}
```

**Resumo:** Componentes NPS ganham identificação de categoria e configuração de eixo/coluna para renderização correta.

---

## 4. Seção "Tipo de Cliente" — sentimentThreeColorChart

### Como era (original)

```json
{
  "type": "sentimentThreeColorChart",
  "dataPath": "sectionData.TipodeCliente.questions.question02.satisfactionImpactSentimentChart"
}
```

### Como ficou (fixed)

Inclusão de `index`:

```json
{
  "type": "sentimentThreeColorChart",
  "index": 0,
  "dataPath": "sectionData.TipodeCliente.questions.question02.satisfactionImpactSentimentChart"
}
```

---

## 6. Seção "Estado" — distribuição (barChart e distributionTable)

Alteração análoga à da seção "Tipo de Cliente": gráfico e tabela passam a estar dentro de cards, com título e `config` no barChart.

### Original (trecho)

```json
{
  "type": "barChart",
  "dataPath": "sectionData.Estado.distributionChart"
},
{
  "type": "distributionTable",
  "dataPath": "sectionData.Estado.distributionTable"
}
```

### Fixed (trecho)

```json
{
  "type": "card",
  "index": 0,
  "title": "Distribuição dos respondentes",
  "cardStyleVariant": "flex-column",
  "cardContentVariant": "with-charts",
  "components": [
    {
      "type": "barChart",
      "index": 0,
      "dataPath": "sectionData.Estado.distributionChart",
      "config": {
        "dataKey": "percentage",
        "yAxisDataKey": "segment"
      }
    }
  ]
},
{
  "type": "card",
  "index": 1,
  "title": "Distribuição dos respondentes",
  "components": [
    {
      "type": "distributionTable",
      "index": 1,
      "dataPath": "sectionData.Estado.distributionTable"
    }
  ]
}
```

---

## 7. Seção "Estado" — NPS (npsDistributionTable e npsTable)

### Original (trecho)

```json
"dataPath": "sectionData.Estado.questions.question01.npsDistributionTable"
...
"dataPath": "sectionData.Estado.questions.question01.npsTable"
```

### Fixed (trecho)

```json
{
  "type": "npsDistributionTable",
  "index": 0,
  "dataPath": "sectionData.Estado.questions.question01.npsDistributionTable",
  "categoryName": "Por Estado",
  "config": {
    "yAxisDataKey": "Estado"
  }
},
{
  "type": "npsTable",
  "index": 1,
  "dataPath": "sectionData.Estado.questions.question01.npsTable",
  "categoryName": "Por Estado",
  "config": {
    "yAxisDataKey": "Estado"
  }
}
```

**Resumo:** Mesmo padrão do Tipo de Cliente: `index`, `categoryName` e `config` com `yAxisDataKey` (e `dataKey` apenas onde aplicável).

---

## 8. Final do arquivo (newline)

### Como era (original)

O arquivo terminava sem newline após o último `}`:

```json
  }
}
```

_(sem caractere de nova linha no final)_

### Como ficou (fixed)

O arquivo termina com newline após o último `}`:

```json
  }
}

```

_(com newline no final — padrão POSIX/boas práticas)_

---

## Checklist de impacto

Ao consumir o JSON (app, relatórios, testes):

1. **topCategoriesCards:** Ajustar código que percorria uma lista flat de `{ category, topic, sentiment }` para a nova estrutura por categoria com `rank`, `mentions`, `percentage` e `topics[]`.
2. **Gráficos/tabelas de distribuição (Tipo de Cliente e Estado):** Garantir que a UI espere componentes dentro de cards e que barChart use `config.dataKey` e `config.yAxisDataKey`.
3. **NPS (Tipo de Cliente e Estado):** Usar `categoryName` e `config.yAxisDataKey` (e `dataKey` para npsTable onde existir) na renderização.

---

_Documento gerado a partir da comparação entre `telmob_original_daniel.json` e `telmob_fixed_daniel.json`._

# Contrato: JSON do backend para gráficos e tabelas com filtros (Responses)

Este documento define **o formato do objeto/JSON que o backend deve enviar ao frontend** quando um **filtro** estiver ativo na seção **Análise por Questão (responses)**. O front usa esse payload para renderizar **apenas** os componentes que dependem de dados agregados por questão: **gráficos**, **tabelas** e **top categories cards** — **sem** sumário (summary) e **sem** wordcloud.

---

## Fluxo resumido

1. **Pesquisa (modelo):** o front busca o JSON do relatório (igual ao `json_file_app_05-02.json`) numa API. Esse objeto tem `metadata`, `sections` e, na seção de questões, `sections[].questions` com texto da pergunta, tipo, etc.
2. **Respostas individuais no backend:** cada linha tem os campos dos filtros disponíveis na pesquisa e o label da resposta. O backend **não** expõe sumário por questão nem wordcloud para o modo filtrado.
3. **Ao ativar um filtro:** o backend agrega as respostas **somente dos usuários que possuem aquele filtro** e envia um **único objeto** com os dados necessários para montar, por questão, **gráficos, tabelas e top categories cards**. O front substitui (ou mescla) esses dados no contexto de cada questão e **não** exibe summary nem wordcloud.

---

## Formato do objeto recebido pelo front (com filtro ativo)

O front espera um **objeto** (por exemplo, corpo de um `GET` ou `POST` da API de respostas filtradas) com a seguinte estrutura.

### Estrutura raiz

```json
{
  "filter": {
    "dimension": "Tipo de Cliente",
    "dimensionId": "tipo_cliente",
    "value": "pre_pago",
    "valueLabel": "Pré-pago"
  },
  "questions": {
    "<question_id>": {
      "data": { ... }
    }
  }
}
```

| Campo       | Tipo   | Obrigatório | Descrição |
|------------|--------|-------------|-----------|
| `filter`   | object | Recomendado | Metadados do filtro ativo (para exibir “Dados filtrados por: …” na UI). |
| `filter.dimension`   | string | Não | Nome legível da dimensão (ex.: "Tipo de Cliente"). |
| `filter.dimensionId`  | string | Não | ID técnico da dimensão (ex.: "tipo_cliente"). |
| `filter.value`        | string | Não | Valor do filtro (ex.: "pre_pago"). |
| `filter.valueLabel`   | string | Não | Label do valor (ex.: "Pré-pago"). |
| `questions`           | object | **Sim** | Mapa `question_id` → dados da questão. |

---

### Objeto por questão: `questions[question_id]`

Cada chave de `questions` é o **identificador da questão** usado no JSON do relatório (ex.: `"question01"`, `"question02"`). O front usa o mesmo id que está em `sections[].questions[].question_id` (ou `id`).

Cada valor deve ter **apenas**:

| Campo  | Tipo   | Obrigatório | Descrição |
|--------|--------|-------------|-----------|
| `data` | object | **Sim**     | Dados para gráficos, tabelas e top categories. **Não** incluir sumário nem wordcloud. |

Ou seja: **não** enviar `summary`, `question`, `questionType` nesse payload — o front já tem isso no JSON do relatório. Só é necessário enviar o que vai **substituir ou preencher** `question.data` para aquele filtro.

---

### Conteúdo de `data` por tipo de questão

O front renderiza os componentes por **tipo de questão** (`questionType`), usando os templates em `src/config/questionTemplates.js`. Com **filtro ativo**, o front **não** renderiza summary nem wordcloud; renderiza apenas os componentes que dependem de `question.data`. Abaixo está o que o backend deve enviar em `questions[question_id].data` para cada tipo.

#### 1. NPS (`questionType: "nps"`)

Componentes renderizados (dados filtrados): **npsScoreCard**, **npsStackedChart**.

```json
"question01": {
  "data": {
    "npsScore": -13.5,
    "npsStackedChart": [
      { "option": "Detrator", "value": 48, "percentage": 48.0 },
      { "option": "Promotor", "value": 30, "percentage": 30.0 },
      { "option": "Neutro", "value": 22, "percentage": 22.0 }
    ]
  }
}
```

| Campo em `data`       | Tipo  | Descrição |
|-----------------------|-------|-----------|
| `npsScore`            | number| NPS calculado para o subconjunto filtrado. |
| `npsStackedChart`     | array | Objetos com `option`, `value`, `percentage` (Detrator / Promotor / Neutro). |

---

#### 2. Escolha única / múltipla escolha (`single-choice`, `multiple-choice`)

Componente renderizado: **barChart**.

```json
"question03": {
  "data": {
    "barChart": [
      { "option": "Opção A", "value": 45, "percentage": 45.0 },
      { "option": "Opção B", "value": 30, "percentage": 30.0 },
      { "option": "Opção C", "value": 25, "percentage": 25.0 }
    ]
  }
}
```

| Campo em `data` | Tipo  | Descrição |
|-----------------|-------|-----------|
| `barChart`      | array | Objetos com `option`, `value`, `percentage` (ou as chaves configuradas no componente, ex.: `dataKey`, `yAxisDataKey`). |

---

#### 3. Campo aberto / open-ended (`questionType: "open-ended"`)

Componentes renderizados (dados filtrados): **sentimentDivergentChart**, **topCategoriesCards**. **Não** enviar `wordCloud` — com filtro ativo o front não monta esse componente.

```json
"question02": {
  "data": {
    "sentimentDivergentChart": [
      { "value": "serviço de rede", "positive": 12.0, "negative": 35.0 },
      { "value": "suporte ao cliente", "positive": 8.0, "negative": 14.0 },
      { "value": "cobertura de rede", "positive": 2.0, "negative": 15.0 }
    ],
    "topCategoriesCards": [
      {
        "rank": 1,
        "category": "serviço de rede",
        "mentions": 120,
        "percentage": 100,
        "topics": [
          { "topic": "confiabilidade da rede", "sentiment": "negative" },
          { "topic": "qualidade do sinal", "sentiment": "negative" }
        ]
      },
      {
        "rank": 2,
        "category": "suporte ao cliente",
        "mentions": 45,
        "percentage": 38,
        "topics": [
          { "topic": "atenção ao cliente", "sentiment": "positive" }
        ]
      }
    ]
  }
}
```

| Campo em `data`            | Tipo  | Descrição |
|----------------------------|-------|-----------|
| `sentimentDivergentChart`  | array | Objetos com `value` (categoria), `positive`, `negative` (percentuais ou valores conforme o componente). |
| `topCategoriesCards`      | array | Objetos com `rank`, `category`, `mentions`, `percentage`, `topics` (array de `{ topic, sentiment }`). |

**Não incluir** no payload filtrado: `summary`, `wordCloud`, `sentimentCategories`, `topicsByCategory` (a menos que o front use em outro componente no futuro).

---

### Rating

Se no futuro o relatório tiver questões do tipo `rating`, o mesmo padrão de **barChart** em `question.data.barChart` pode ser usado (igual a single-choice/multiple-choice).

---

## Exemplo completo de payload (filtro ativo)

```json
{
  "filter": {
    "dimension": "Tipo de Cliente",
    "dimensionId": "tipo_cliente",
    "value": "pre_pago",
    "valueLabel": "Pré-pago"
  },
  "questions": {
    "question01": {
      "data": {
        "npsScore": -13.5,
        "npsStackedChart": [
          { "option": "Detrator", "value": 48, "percentage": 48.0 },
          { "option": "Promotor", "value": 30, "percentage": 30.0 },
          { "option": "Neutro", "value": 22, "percentage": 22.0 }
        ]
      }
    },
    "question02": {
      "data": {
        "sentimentDivergentChart": [
          { "value": "serviço de rede", "positive": 12.0, "negative": 35.0 },
          { "value": "suporte ao cliente", "positive": 8.0, "negative": 14.0 }
        ],
        "topCategoriesCards": [
          {
            "rank": 1,
            "category": "serviço de rede",
            "mentions": 120,
            "percentage": 100,
            "topics": [
              { "topic": "confiabilidade da rede", "sentiment": "negative" }
            ]
          }
        ]
      }
    },
    "question03": {
      "data": {
        "barChart": [
          { "option": "Opção A", "value": 45, "percentage": 45.0 },
          { "option": "Opção B", "value": 55, "percentage": 55.0 }
        ]
      }
    }
  }
}
```

---

## Como o front usa esse objeto

1. **Fonte da lista de questões:** continua sendo o JSON do relatório (modelo), em `sections[id="questions" ou "responses"].questions`, com `question_id`, `question`, `questionType`, etc.
2. **Quando existe payload de filtro:** o front mescla (ou substitui) `questions[question_id].data` no objeto `question` usado no contexto de renderização. Ou seja, `question.data` passa a ser exatamente o `data` enviado pelo backend para aquela questão e aquele filtro.
3. **DataPaths:** os componentes já usam `question.data`, `question.data.npsStackedChart`, `question.data.barChart`, `question.data.sentimentDivergentChart`, `question.data.topCategoriesCards`. Nenhuma mudança de path é necessária — apenas a **origem** de `question.data` passa a ser o payload filtrado.
4. **O que não renderizar com filtro ativo:**  
   - **Sumário** da questão (texto em `question.summary` pode ser ocultado ou substituído por mensagem do tipo “Dados filtrados”).  
   - **WordCloud:** não enviar no payload e não renderizar o componente wordCloud quando houver dados filtrados.

---

## Resumo para o backend

- **Entrada:** identificador da pesquisa + filtro ativo (ex.: dimensão + valor).
- **Processamento:** agregar respostas individuais apenas dos usuários que possuem aquele filtro; calcular, por questão, os mesmos agregados que hoje existem no JSON (npsStackedChart, barChart, sentimentDivergentChart, topCategoriesCards). Não calcular sumário nem wordcloud para o modo filtrado.
- **Saída:** um único JSON com `filter` (opcional) e `questions`, onde cada `questions[question_id]` tem apenas `data` no formato descrito acima, compatível com os dataPaths e tipos de componente já usados no front.

Com isso, o front consegue montar **somente** os componentes de gráficos, tabelas e top categories cards para cada questão, com base nos dados filtrados enviados pelo backend.

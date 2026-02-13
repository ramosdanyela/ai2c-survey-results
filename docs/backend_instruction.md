# Requisitos do Backend - Sistema de Filtros por Questao

> Documento de referencia para o backend. Descreve exatamente o que o frontend espera receber, campo a campo, para que as duas APIs de filtros funcionem corretamente.

---

## Visao Geral

O frontend precisa de **duas APIs**:

| API       | Metodo | Endpoint                                                    | Quando e chamada                                                | O que retorna                                                               |
| --------- | ------ | ----------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **API 1** | `GET`  | `/api/surveys/{survey_id}/filters`                          | No carregamento da pagina (junto com os dados da pesquisa)      | Definicao dos filtros disponiveis: IDs, labels e valores possiveis          |
| **API 2** | `POST` | `/api/surveys/{survey_id}/questions/{question_id}/filtered` | Quando o usuario clica "OK" no painel de filtros de uma questao | Dados recalculados dos componentes daquela questao, prontos para renderizar |

**Principio fundamental:** O frontend e um renderizador puro. Ele NAO faz calculos. Recebe os dados ja prontos e exibe. Toda logica de filtragem e recalculo acontece no backend.

---

## API 1 - Definicao de Filtros

### Request

```
GET /api/surveys/{survey_id}/filters
```

| Parametro   | Tipo          | Obrigatorio | Descricao                       |
| ----------- | ------------- | ----------- | ------------------------------- |
| `survey_id` | string (path) | Sim         | ID da pesquisa (ex: `"telmob"`) |

### Response - Schema Exato

```json
{
  "success": true,
  "data": {
    "survey_id": "telmob",
    "filters": [
      {
        "filter_id": "string",
        "label": "string",
        "values": [
          {
            "value": "string",
            "label": "string",
            "count": 0
          }
        ]
      }
    ]
  }
}
```

### Campos Obrigatorios

| Campo                           | Tipo    | Obrigatorio | Como o frontend usa                                                                                     |
| ------------------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| `success`                       | boolean | Sim         | Se `false`, o icone de filtro fica desabilitado em todas as questoes                                    |
| `data.survey_id`                | string  | Sim         | Confirmacao                                                                                             |
| `data.filters`                  | array   | Sim         | Array de filtros disponiveis. Se vazio `[]`, nenhum filtro e renderizado                                |
| `data.filters[].filter_id`      | string  | Sim         | Identificador unico do filtro. Usado como chave para enviar na API 2. Ex: `"TipodeCliente"`, `"Estado"` |
| `data.filters[].label`          | string  | Sim         | Texto exibido no dropdown de selecao de filtros. Ex: `"Tipo de Cliente"`                                |
| `data.filters[].values`         | array   | Sim         | Opcoes disponiveis para esse filtro. Se vazio, o filtro nao aparece                                     |
| `data.filters[].values[].value` | string  | Sim         | Valor enviado na API 2 quando o usuario seleciona essa opcao. Ex: `"pre-pago"`                          |
| `data.filters[].values[].label` | string  | Sim         | Texto exibido no checkbox para o usuario. Ex: `"Pre-pago"`                                              |
| `data.filters[].values[].count` | number  | Opcional    | Quantidade de respondentes para esse valor. Se presente, exibido ao lado do checkbox                    |

### Exemplo Completo

```json
{
  "success": true,
  "data": {
    "survey_id": "telmob",
    "filters": [
      {
        "filter_id": "TipodeCliente",
        "label": "Tipo de Cliente",
        "values": [
          { "value": "pre-pago", "label": "Pre-pago", "count": 37 },
          { "value": "controle", "label": "Controle", "count": 35 },
          { "value": "pos-pago", "label": "Pos-pago", "count": 28 }
        ]
      },
      {
        "filter_id": "Estado",
        "label": "Estado",
        "values": [
          { "value": "SP", "label": "Sao Paulo", "count": 30 },
          { "value": "RJ", "label": "Rio de Janeiro", "count": 25 },
          { "value": "MG", "label": "Minas Gerais", "count": 20 }
        ]
      }
    ]
  }
}
```

### Regras

- Se o backend retornar um 3o, 4o, ou N-esimo filtro, o frontend renderiza automaticamente sem alteracao de codigo
- Filtros sem `values` (array vazio) nao serao exibidos
- A ordem dos filtros no array e a ordem em que aparecem no dropdown
- A ordem dos values no array e a ordem em que aparecem como checkboxes

### Resposta de Erro

```json
{
  "success": false,
  "error": "Survey not found"
}
```

Quando `success: false`, o frontend desabilita o icone de filtro em todas as questoes e exibe tooltip "Filtros indisponiveis".

---

## API 2 - Dados Filtrados por Questao

### Request

```
POST /api/surveys/{survey_id}/questions/{question_id}/filtered
```

| Parametro     | Tipo          | Obrigatorio | Descricao                                                          |
| ------------- | ------------- | ----------- | ------------------------------------------------------------------ |
| `survey_id`   | string (path) | Sim         | ID da pesquisa                                                     |
| `question_id` | string (path) | Sim         | ID da questao (ex: `"question01"`, `"question02"`, `"question03"`) |

### Request Body

```json
{
  "filters": [
    {
      "filter_id": "TipodeCliente",
      "values": ["pre-pago"]
    }
  ]
}
```

| Campo                 | Tipo     | Obrigatorio | Descricao                                                           |
| --------------------- | -------- | ----------- | ------------------------------------------------------------------- |
| `filters`             | array    | Sim         | Array de filtros aplicados                                          |
| `filters[].filter_id` | string   | Sim         | Mesmo `filter_id` retornado pela API 1                              |
| `filters[].values`    | string[] | Sim         | Array de valores selecionados pelo usuario (mesmo `value` da API 1) |

### Logica de Filtragem

- **Entre filtros diferentes (filter_ids):** logica **AND** (interseção). Se o usuario selecionou `TipodeCliente=pre-pago` E `Estado=SP`, retornar dados apenas de respondentes que sao pre-pago **E** de SP
- **Dentro do mesmo filtro (values):** logica **OR** (uniao). Se o usuario selecionou `TipodeCliente=["pre-pago", "controle"]`, retornar dados de respondentes que sao pre-pago **OU** controle

### Response - Schema Base

```json
{
  "success": true,
  "data": {
    "survey_id": "telmob",
    "question_id": "question01",
    "question_type": "nps",
    "applied_filters": [
      { "filter_id": "TipodeCliente", "values": ["pre-pago"] }
    ],
    "data": {
      // Campos especificos do question_type (ver abaixo)
    }
  }
}
```

### Campos Obrigatorios da Response

| Campo                  | Tipo    | Obrigatorio | Como o frontend usa                                                              |
| ---------------------- | ------- | ----------- | -------------------------------------------------------------------------------- |
| `success`              | boolean | Sim         | Se `false`, mostra mensagem de erro na area dos componentes                      |
| `data.survey_id`       | string  | Sim         | Confirmacao                                                                      |
| `data.question_id`     | string  | Sim         | Confirmacao - deve bater com o `question_id` do request                          |
| `data.question_type`   | string  | Sim         | Tipo da questao: `"nps"`, `"open-ended"`, `"single-choice"`, `"multiple-choice"` |
| `data.applied_filters` | array   | Sim         | Eco dos filtros aplicados - usado para confirmacao e para exibir pills           |
| `data.data`            | object  | Sim         | **Objeto com os dados recalculados dos componentes** (detalhado abaixo por tipo) |

### Como o Frontend Consome `data.data`

O frontend faz um merge dos dados filtrados com os dados originais da questao:

```javascript
// O frontend substitui question.data pelos dados filtrados:
effectiveData = { ...question.data, ...response.data.data };
```

Isso significa que:

1. O campo `data.data` da API 2 **sobrescreve** os campos correspondentes em `question.data`
2. Campos presentes no original mas ausentes na resposta filtrada **permanecem** (nao sao removidos)
3. **E seguro** enviar campos extras - serao ignorados se o componente nao os usa

### Comportamento com Dados Ausentes ou Vazios

Antes de renderizar cada componente, o frontend valida se os dados existem e nao estao vazios. **Se um campo estiver ausente, `null` ou for um array vazio `[]`, o componente correspondente simplesmente nao e renderizado** (sem erro, sem quebra).

| Dado ausente/vazio                            | Componente                | Resultado     |
| --------------------------------------------- | ------------------------- | ------------- |
| `npsScore` = null/undefined                   | NPS Score Card            | Nao renderiza |
| `npsStackedChart` = null/undefined/[]         | NPS Stacked Chart         | Nao renderiza |
| `sentimentDivergentChart` = null/undefined/[] | Sentiment Divergent Chart | Nao renderiza |
| `topCategoriesCards` = null/undefined/[]      | Top Categories Cards      | Nao renderiza |
| `wordCloud` = null/undefined/[]               | Word Cloud                | Nao renderiza |
| `barChart` = null/undefined/[]                | Bar Chart                 | Nao renderiza |

**Implicacoes para o backend:**

- E seguro omitir campos que nao puderam ser calculados para um subset filtrado
- Se `npsScore` vier mas `npsStackedChart` nao, apenas o Score Card renderiza (sem dados inconsistentes)
- Se todos os campos vierem vazios, nenhum componente aparece para a questao
- **Recomendacao:** Sempre enviar todos os campos obrigatorios para o tipo. Mas se algum nao puder ser calculado, e seguro omiti-lo

---

## Contrato de Dados por Tipo de Questao

### Tipo: `nps`

O frontend renderiza dois componentes: **NPS Score Card** e **NPS Stacked Chart**.

#### Campos Obrigatorios em `data.data`

```json
{
  "npsScore": -13.5,
  "npsStackedChart": [
    { "option": "Detrator", "value": 15, "percentage": 40.5 },
    { "option": "Promotor", "value": 10, "percentage": 27.0 },
    { "option": "Neutro", "value": 12, "percentage": 32.5 }
  ]
}
```

| Campo                          | Tipo   | Obrigatorio | Descricao                                                                        |
| ------------------------------ | ------ | ----------- | -------------------------------------------------------------------------------- |
| `npsScore`                     | number | Sim         | Score NPS recalculado. Formula: `% Promotores - % Detratores`. Range: -100 a 100 |
| `npsStackedChart`              | array  | Sim         | Exatamente 3 objetos, um para cada categoria                                     |
| `npsStackedChart[].option`     | string | Sim         | Nome da categoria. Valores aceitos: `"Detrator"`, `"Promotor"`, `"Neutro"`       |
| `npsStackedChart[].value`      | number | Sim         | Contagem absoluta de respondentes nessa categoria                                |
| `npsStackedChart[].percentage` | number | Sim         | Percentual recalculado. A soma dos 3 deve ser ~100%                              |

O array pode ser enviado em qualquer ordem; o frontend renderiza sempre na ordem **Detrator → Neutro → Promotor**.

#### Calculo

Dado o subset de respondentes que atendem aos filtros:

1. Classificar cada resposta: 0-6 = Detrator, 7-8 = Neutro, 9-10 = Promotor
2. Calcular contagem e percentual de cada grupo
3. `npsScore = % Promotor - % Detrator`

#### Exemplo de Request/Response Completo

**Request:**

```
POST /api/surveys/telmob/questions/question01/filtered
Content-Type: application/json

{
  "filters": [
    { "filter_id": "TipodeCliente", "values": ["pre-pago"] }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "survey_id": "telmob",
    "question_id": "question01",
    "question_type": "nps",
    "applied_filters": [
      { "filter_id": "TipodeCliente", "values": ["pre-pago"] }
    ],
    "data": {
      "npsScore": -13.5,
      "npsStackedChart": [
        { "option": "Detrator", "value": 15, "percentage": 40.5 },
        { "option": "Promotor", "value": 10, "percentage": 27.0 },
        { "option": "Neutro", "value": 12, "percentage": 32.5 }
      ]
    }
  }
}
```

---

### Tipo: `open-ended`

O frontend renderiza tres componentes: **Sentiment Divergent Chart**, **Top Categories Cards** e **Word Cloud**.

#### Campos Obrigatorios em `data.data`

```json
{
  "sentimentDivergentChart": [
    { "value": "servico de rede", "positive": 15.2, "negative": 25.0 },
    { "value": "suporte ao cliente", "positive": 8.1, "negative": 7.3 }
  ],
  "topCategoriesCards": [
    {
      "rank": 1,
      "category": "servico de rede",
      "mentions": 55,
      "percentage": 100,
      "topics": [
        { "topic": "qualidade da rede", "sentiment": "positive" },
        { "topic": "estabilidade da rede", "sentiment": "negative" }
      ]
    }
  ],
  "wordCloud": [
    { "text": "internet", "value": 18 },
    { "text": "sinal", "value": 14 }
  ]
}
```

| Campo                       | Tipo   | Obrigatorio | Descricao                                                                   |
| --------------------------- | ------ | ----------- | --------------------------------------------------------------------------- |
| **sentimentDivergentChart** | array  | Sim         | Categorias com sentimento divergente                                        |
| `[].value`                  | string | Sim         | Nome da categoria                                                           |
| `[].positive`               | number | Sim         | Percentual de mencoes positivas                                             |
| `[].negative`               | number | Sim         | Percentual de mencoes negativas                                             |
| **topCategoriesCards**      | array  | Sim         | Top categorias com detalhamento de topicos                                  |
| `[].rank`                   | number | Sim         | Posicao no ranking (1, 2, 3...)                                             |
| `[].category`               | string | Sim         | Nome da categoria                                                           |
| `[].mentions`               | number | Sim         | Numero absoluto de mencoes                                                  |
| `[].percentage`             | number | Sim         | Percentual relativo ao total de mencoes. O rank 1 sempre tem percentage=100 |
| `[].topics`                 | array  | Sim         | Topicos da categoria                                                        |
| `[].topics[].topic`         | string | Sim         | Nome do topico                                                              |
| `[].topics[].sentiment`     | string | Sim         | Sentimento: `"positive"` ou `"negative"`                                    |
| **wordCloud**               | array  | Sim         | Palavras/frases frequentes                                                  |
| `[].text`                   | string | Sim         | Palavra ou frase                                                            |
| `[].value`                  | number | Sim         | Frequencia (contagem)                                                       |

#### Campos Opcionais (presentes no JSON original, o frontend aceita mas nao renderiza como componente visual direto)

| Campo                 | Tipo  | Descricao                                                                                                         |
| --------------------- | ----- | ----------------------------------------------------------------------------------------------------------------- |
| `sentimentCategories` | array | Scores de sentimento por categoria. Cada objeto: `{ category, negative, positive, neutral }`                      |
| `topicsByCategory`    | array | Topicos agrupados por categoria. Cada objeto: `{ category, positiveTopics[], negativeTopics[], neutralTopics[] }` |
| `npsScore`            | null  | Nao aplicavel para open-ended. Pode enviar `null` ou omitir                                                       |

> **Nota:** `sentimentCategories` e `topicsByCategory` estao presentes no JSON original. O frontend os recebe mas atualmente nao renderiza componentes visuais exclusivos para eles. E seguro envia-los ou omiti-los. Se no futuro forem usados, ja estarao disponiveis.

#### Exemplo de Request/Response Completo

**Request:**

```
POST /api/surveys/telmob/questions/question02/filtered
Content-Type: application/json

{
  "filters": [
    { "filter_id": "TipodeCliente", "values": ["pos-pago"] }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "survey_id": "telmob",
    "question_id": "question02",
    "question_type": "open-ended",
    "applied_filters": [
      { "filter_id": "TipodeCliente", "values": ["pos-pago"] }
    ],
    "data": {
      "sentimentDivergentChart": [
        { "value": "servico de rede", "positive": 5.0, "negative": 45.0 },
        { "value": "suporte ao cliente", "positive": 4.2, "negative": 14.3 },
        { "value": "cobertura de rede", "positive": 0.5, "negative": 18.0 },
        { "value": "oferta e precos", "positive": 1.8, "negative": 9.5 },
        { "value": "outro", "positive": 1.5, "negative": 8.0 }
      ],
      "topCategoriesCards": [
        {
          "rank": 1,
          "category": "servico de rede",
          "mentions": 42,
          "percentage": 100,
          "topics": [
            { "topic": "Qualidade dos resultados", "sentiment": "positive" },
            { "topic": "confiabilidade da rede", "sentiment": "negative" },
            { "topic": "estabilidade da rede", "sentiment": "negative" },
            { "topic": "lentidao do servico", "sentiment": "negative" }
          ]
        },
        {
          "rank": 2,
          "category": "suporte ao cliente",
          "mentions": 15,
          "percentage": 36,
          "topics": [
            { "topic": "prontidao de resposta", "sentiment": "positive" },
            {
              "topic": "Preocupacoes com a retencao de clientes",
              "sentiment": "negative"
            },
            {
              "topic": "intencao de cancelamento do cliente",
              "sentiment": "negative"
            }
          ]
        },
        {
          "rank": 3,
          "category": "cobertura de rede",
          "mentions": 14,
          "percentage": 33,
          "topics": [
            { "topic": "falhas na cobertura", "sentiment": "negative" },
            { "topic": "ausencia de sinal", "sentiment": "negative" }
          ]
        }
      ],
      "wordCloud": [
        { "text": "internet", "value": 12 },
        { "text": "sinal", "value": 10 },
        { "text": "cobertura", "value": 8 },
        { "text": "cancelar", "value": 6 },
        { "text": "lento", "value": 5 },
        { "text": "aplicativo", "value": 4 },
        { "text": "caro", "value": 4 }
      ]
    }
  }
}
```

---

### Tipo: `single-choice` e `multiple-choice`

Ambos usam a mesma estrutura. O frontend renderiza um unico componente: **Bar Chart**.

#### Campos Obrigatorios em `data.data`

```json
{
  "barChart": [
    {
      "option": "Queda / instabilidade na internet",
      "value": 6,
      "percentage": 16.2
    },
    { "option": "Falta de sinal de internet", "value": 5, "percentage": 13.5 },
    {
      "option": "Custo beneficio do plano/oferta e ruim",
      "value": 4,
      "percentage": 10.8
    }
  ]
}
```

| Campo                   | Tipo   | Obrigatorio | Descricao                                                                     |
| ----------------------- | ------ | ----------- | ----------------------------------------------------------------------------- |
| `barChart`              | array  | Sim         | Array de opcoes com contagem e percentual                                     |
| `barChart[].option`     | string | Sim         | Texto da opcao de resposta                                                    |
| `barChart[].value`      | number | Sim         | Contagem absoluta de respondentes que selecionaram essa opcao                 |
| `barChart[].percentage` | number | Sim         | Percentual recalculado sobre o total filtrado. A soma de todos deve ser ~100% |

#### Calculo

Dado o subset de respondentes que atendem aos filtros:

1. Contar quantos selecionaram cada opcao
2. Calcular percentual de cada opcao sobre o total filtrado
3. Ordenar por `value` decrescente (maior para menor)

#### Exemplo de Request/Response Completo

**Request:**

```
POST /api/surveys/telmob/questions/question03/filtered
Content-Type: application/json

{
  "filters": [
    { "filter_id": "Estado", "values": ["SP"] }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "survey_id": "telmob",
    "question_id": "question03",
    "question_type": "single-choice",
    "applied_filters": [{ "filter_id": "Estado", "values": ["SP"] }],
    "data": {
      "barChart": [
        {
          "option": "Queda / instabilidade na internet / internet trava / oscila",
          "value": 5,
          "percentage": 16.7
        },
        {
          "option": "Falta de sinal de internet",
          "value": 4,
          "percentage": 13.3
        },
        {
          "option": "Custo beneficio do plano/oferta e ruim",
          "value": 3,
          "percentage": 10.0
        },
        {
          "option": "Qualidade do sinal / cobertura ruim",
          "value": 3,
          "percentage": 10.0
        },
        { "option": "Outro motivo", "value": 2, "percentage": 6.7 },
        {
          "option": "Qualidade do sinal / cobertura",
          "value": 2,
          "percentage": 6.7
        },
        {
          "option": "Pacote de internet suficiente / dura o mes todo",
          "value": 2,
          "percentage": 6.7
        },
        {
          "option": "Estabilidade na internet / internet nao trava / nao oscila",
          "value": 2,
          "percentage": 6.7
        },
        {
          "option": "Custo beneficio do plano/oferta e bom",
          "value": 2,
          "percentage": 6.7
        },
        {
          "option": "Velocidade da internet rapida / boa",
          "value": 2,
          "percentage": 6.7
        },
        { "option": "Velocidade da internet", "value": 1, "percentage": 3.3 },
        {
          "option": "Qualidade do sinal / cobertura boa",
          "value": 1,
          "percentage": 3.3
        },
        { "option": "Estabilidade na internet", "value": 1, "percentage": 3.3 }
      ]
    }
  }
}
```

---

## Tabela Resumo: Campos por Tipo de Questao

| Campo em `data.data`      | `nps`                    | `open-ended`            | `single-choice`         | `multiple-choice`       |
| ------------------------- | ------------------------ | ----------------------- | ----------------------- | ----------------------- |
| `npsScore`                | **Obrigatorio** (number) | Opcional (null)         | Opcional (null)         | Opcional (null)         |
| `npsStackedChart`         | **Obrigatorio** (array)  | -                       | -                       | -                       |
| `sentimentDivergentChart` | -                        | **Obrigatorio** (array) | -                       | -                       |
| `topCategoriesCards`      | -                        | **Obrigatorio** (array) | -                       | -                       |
| `wordCloud`               | -                        | **Obrigatorio** (array) | -                       | -                       |
| `barChart`                | -                        | -                       | **Obrigatorio** (array) | **Obrigatorio** (array) |
| `sentimentCategories`     | -                        | Opcional (array)        | -                       | -                       |
| `topicsByCategory`        | -                        | Opcional (array)        | -                       | -                       |

---

## Validacoes Esperadas no Backend

### Na API 1

| Validacao                                     | Acao                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| `survey_id` nao existe                        | Retornar `{ "success": false, "error": "Survey not found" }`                     |
| Survey existe mas nao tem filtros disponiveis | Retornar `{ "success": true, "data": { "survey_id": "...", "filters": [] } }`    |
| Filtro existe mas sem valores                 | Nao incluir esse filtro no array (ou incluir com `values: []` - frontend ignora) |

### Na API 2

| Validacao                                          | Acao                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `survey_id` nao existe                             | Retornar `{ "success": false, "error": "Survey not found" }` com HTTP 404               |
| `question_id` nao existe                           | Retornar `{ "success": false, "error": "Question not found" }` com HTTP 404             |
| `filter_id` invalido (nao existe para esta survey) | Retornar `{ "success": false, "error": "Invalid filter_id: XYZ" }` com HTTP 400         |
| `values` invalidos para o `filter_id`              | Retornar `{ "success": false, "error": "Invalid filter value" }` com HTTP 400           |
| Combinacao de filtros resulta em 0 respondentes    | Retornar `{ "success": true, "data": { ..., "data": { campos com valores zerados } } }` |
| Array `filters` vazio                              | Retornar dados sem nenhum filtro (equivalente aos dados originais)                      |

---

## Tratamento de Erros e Dados Parciais no Frontend

| Cenario                                    | Comportamento no frontend                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `success: true` com `data.data` completo   | Renderiza todos os componentes com dados filtrados                                   |
| `success: true` com `data.data` parcial    | Renderiza apenas os componentes que receberam dados validos (os demais sao omitidos) |
| `success: true` mas `data.data` = null     | Ignora o filtro, renderiza dados originais                                           |
| `success: true` mas todos os campos vazios | Nenhum componente renderiza para a questao                                           |
| `success: false`                           | Exibe mensagem do campo `error` na area dos componentes                              |
| Timeout/erro de rede                       | Exibe "Erro ao carregar dados filtrados"                                             |
| Campo especifico = null ou []              | Componente correspondente nao renderiza (sem erro)                                   |

---

## Cenarios de Filtros Multiplos

### Exemplo 1: Um filtro, um valor

```json
{
  "filters": [{ "filter_id": "TipodeCliente", "values": ["pre-pago"] }]
}
```

Backend filtra: respondentes onde TipodeCliente = "pre-pago"

### Exemplo 2: Um filtro, multiplos valores (OR)

```json
{
  "filters": [
    { "filter_id": "TipodeCliente", "values": ["pre-pago", "controle"] }
  ]
}
```

Backend filtra: respondentes onde TipodeCliente = "pre-pago" **OU** TipodeCliente = "controle"

### Exemplo 3: Dois filtros (AND entre eles, OR dentro)

```json
{
  "filters": [
    { "filter_id": "TipodeCliente", "values": ["pre-pago", "controle"] },
    { "filter_id": "Estado", "values": ["SP"] }
  ]
}
```

Backend filtra: respondentes onde (TipodeCliente = "pre-pago" OU TipodeCliente = "controle") **E** (Estado = "SP")

---

## IDs das Questoes

Os IDs usados nas chamadas da API 2 sao strings no formato `"questionXX"`:

| question_id  | question_type   | Pergunta                                                                                              |
| ------------ | --------------- | ----------------------------------------------------------------------------------------------------- |
| `question01` | `nps`           | Qual e a probabilidade de voce recomendar nossa empresa a um amigo ou colega em uma escala de 0 a 10? |
| `question02` | `open-ended`    | Quais sao os principais pontos que impactam sua satisfacao?                                           |
| `question03` | `single-choice` | Dentre as opcoes qual e o principal ponto que impacta sua satisfacao?                                 |

> O frontend resolve internamente o mapeamento entre o `id` numerico (usado na UI) e o `question_id` string (usado na API).

---

## Fluxo Completo

```
1. Frontend carrega pagina
   -> GET /api/surveys/telmob/filters
   <- Recebe definicoes dos filtros (API 1)

2. Usuario abre o accordion de uma questao

3. Usuario clica no icone de filtro
   -> Frontend abre popover com FilterPanel
   -> Filtros renderizados a partir da resposta da API 1

4. Usuario seleciona valores e clica OK
   -> POST /api/surveys/telmob/questions/question01/filtered
      Body: { "filters": [{ "filter_id": "TipodeCliente", "values": ["pre-pago"] }] }
   <- Recebe dados recalculados (API 2)

5. Frontend substitui dados da questao pelos dados filtrados
   -> Componentes re-renderizam com novos dados

6. Pills de filtro aparecem no header da questao
   -> "Tipo de Cliente: Pre-pago"

7. Usuario pode filtrar outras questoes independentemente
   -> Cada questao tem seu proprio estado de filtro

8. Usuario clica "Eliminar filtros"
   -> Todos os filtros sao removidos
   -> Todas as questoes voltam aos dados originais
```

---

## Checklist de Implementacao

- [ ] **API 1:** Endpoint GET retorna filtros disponiveis com filter_id, label e values
- [ ] **API 1:** Retorna `count` por valor (opcional mas recomendado)
- [ ] **API 1:** Retorna `success: false` quando survey nao existe
- [ ] **API 2:** Endpoint POST recebe survey_id, question_id e array de filtros
- [ ] **API 2:** Aplica logica AND entre filter_ids, OR dentro de values
- [ ] **API 2:** Retorna `data.data` com campos corretos para o question_type
- [ ] **API 2:** Retorna `applied_filters` como eco do request
- [ ] **API 2:** Retorna `success: false` com mensagem descritiva em caso de erro
- [ ] **NPS:** Calcula npsScore e npsStackedChart com 3 categorias
- [ ] **Open-ended:** Calcula sentimentDivergentChart, topCategoriesCards e wordCloud
- [ ] **Single/Multiple-choice:** Calcula barChart com option, value e percentage
- [ ] **Validacao:** Rejeita filter_id ou values invalidos com HTTP 400
- [ ] **Edge case:** Combinacao de filtros com 0 respondentes retorna dados zerados (nao erro)

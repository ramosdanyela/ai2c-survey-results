# Backend API Specification - Sistema de Filtros por Questao

## Visao Geral

O frontend consome **duas APIs** para o sistema de filtros programaticos por questao. O frontend e um **renderizador puro** - recebe dados prontos e exibe, sem computar nenhum calculo.

---

## API 1 - Definicao de Filtros

### Endpoint

```
GET /api/surveys/{survey_id}/filters
```

### Descricao

Retorna todos os filtros disponiveis para a pesquisa. Carregada uma unica vez quando a pesquisa e aberta. O frontend renderiza dinamicamente qualquer quantidade de filtros retornados.

### Path Parameters

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `survey_id` | string | Sim | ID unico da pesquisa (ex: `"telmob"`) |

### Response - 200 OK

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
          { "value": "MG", "label": "Minas Gerais", "count": 20 },
          { "value": "RS", "label": "Rio Grande do Sul", "count": 15 },
          { "value": "BA", "label": "Bahia", "count": 10 }
        ]
      }
    ]
  }
}
```

### Response Schema

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| `success` | boolean | Sim | Indicador de sucesso |
| `data.survey_id` | string | Sim | ID da pesquisa confirmado |
| `data.filters` | array | Sim | Lista de filtros disponiveis |
| `data.filters[].filter_id` | string | Sim | ID unico do filtro (usado como chave) |
| `data.filters[].label` | string | Sim | Label para exibicao no frontend |
| `data.filters[].values` | array | Sim | Valores possiveis para o filtro |
| `data.filters[].values[].value` | string | Sim | Valor interno (enviado de volta na API 2) |
| `data.filters[].values[].label` | string | Sim | Label para exibicao no checkbox |
| `data.filters[].values[].count` | number | Opcional | Quantidade de respondentes com esse valor |

### Validacoes

- `survey_id` deve existir no sistema
- Cada filtro deve ter pelo menos 1 valor
- Filtros sem valores disponiveis NAO devem ser retornados
- `filter_id` deve ser unico dentro da pesquisa

### Fonte dos Dados

Os filtros sao derivados das colunas de segmentacao da tabela bruta de respostas:
- Cada coluna de segmentacao (ex: `TipodeCliente`, `Estado`, `FaixaEtaria`) gera um filtro
- `filter_id` = nome da coluna
- `label` = nome legivel (pode vir de configuracao ou metadata)
- `values` = valores unicos distintos na coluna, com contagem de respondentes

### Erros

| Status | Descricao | Response |
|--------|-----------|----------|
| 404 | Pesquisa nao encontrada | `{ "success": false, "error": "Survey not found" }` |
| 500 | Erro interno | `{ "success": false, "error": "Internal server error" }` |

---

## API 2 - Dados Filtrados por Questao

### Endpoint

```
POST /api/surveys/{survey_id}/questions/{question_id}/filtered
```

### Descricao

Retorna os dados dos componentes de uma questao **recalculados** com os filtros aplicados. Os dados vem prontos na mesma estrutura que `question.data` no JSON principal - o frontend apenas substitui os dados e re-renderiza.

### Path Parameters

| Parametro | Tipo | Obrigatorio | Descricao |
|-----------|------|-------------|-----------|
| `survey_id` | string | Sim | ID da pesquisa |
| `question_id` | string | Sim | ID da questao (ex: `"question01"`) |

### Request Body

```json
{
  "filters": [
    {
      "filter_id": "TipodeCliente",
      "values": ["pre-pago"]
    },
    {
      "filter_id": "Estado",
      "values": ["SP", "RJ"]
    }
  ]
}
```

### Request Body Schema

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| `filters` | array | Sim | Lista de filtros a aplicar |
| `filters[].filter_id` | string | Sim | ID do filtro (da API 1) |
| `filters[].values` | string[] | Sim | Valores selecionados (da API 1) |

### Response - 200 OK

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
    "respondent_count": 37,
    "data": {
      "...campos especificos por tipo de questao..."
    }
  }
}
```

### Response Schema

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| `success` | boolean | Sim | Indicador de sucesso |
| `data.survey_id` | string | Sim | Confirmacao do survey_id |
| `data.question_id` | string | Sim | Confirmacao do question_id |
| `data.question_type` | string | Sim | Tipo da questao (`nps`, `open-ended`, `single-choice`, `multiple-choice`) |
| `data.applied_filters` | array | Sim | Filtros que foram aplicados (eco do request) |
| `data.respondent_count` | number | Opcional | Total de respondentes apos filtro |
| `data.data` | object | Sim | Objeto com dados dos componentes recalculados |

### Validacoes

- `survey_id` e `question_id` devem existir
- Cada `filter_id` deve ser valido para a pesquisa
- Cada valor em `values` deve ser valido para o `filter_id`
- A combinacao de filtros deve resultar em pelo menos 1 respondente
- Se nenhum respondente: retornar erro (nao retornar dados zerados)

### Comportamento com campos ausentes ou vazios em `data.data`

O frontend valida cada componente individualmente antes de renderizar. Se um campo obrigatorio estiver ausente, `null` ou for um array vazio `[]`, **o componente correspondente nao sera renderizado** (sem erro, simplesmente nao aparece). Isso significa:

- E seguro omitir campos que nao puderam ser calculados - o frontend renderiza apenas os que vieram
- Se `npsStackedChart` vier como `[]` mas `npsScore` vier como `-13.5`, apenas o NPS Score Card aparece
- Se todos os campos de um tipo vierem vazios/ausentes, nenhum componente e renderizado para aquela questao
- Campos com dados validos sempre serao renderizados normalmente

| Campo ausente/vazio | Componente afetado | Resultado |
|---------------------|-------------------|-----------|
| `npsScore` = null | NPS Score Card | Nao renderiza |
| `npsStackedChart` = null ou [] | NPS Stacked Chart | Nao renderiza |
| `sentimentDivergentChart` = null ou [] | Sentiment Divergent Chart | Nao renderiza |
| `topCategoriesCards` = null ou [] | Top Categories Cards | Nao renderiza |
| `wordCloud` = null ou [] | Word Cloud | Nao renderiza |
| `barChart` = null ou [] | Bar Chart | Nao renderiza |

**Recomendacao:** Enviar sempre todos os campos obrigatorios para o tipo de questao. Mas se algum nao puder ser calculado (ex: word cloud para um subset muito pequeno), e seguro omiti-lo ou envia-lo vazio.

### Erros

| Status | Descricao | Response |
|--------|-----------|----------|
| 400 | Filtro invalido | `{ "success": false, "error": "Invalid filter_id: xyz" }` |
| 400 | Valor invalido | `{ "success": false, "error": "Invalid value 'abc' for filter 'Estado'" }` |
| 404 | Pesquisa/questao nao encontrada | `{ "success": false, "error": "Question not found" }` |
| 422 | Sem respondentes para os filtros | `{ "success": false, "error": "No respondents match the selected filters" }` |
| 500 | Erro interno | `{ "success": false, "error": "Internal server error" }` |

---

## Estrutura de Dados por Tipo de Questao (`data.data`)

### NPS (`question_type: "nps"`)

O backend deve recalcular o NPS score e as distribuicoes para o subconjunto filtrado.

```json
{
  "npsScore": -13.5,
  "npsStackedChart": [
    { "option": "Detrator", "value": 15, "percentage": 40.5 },
    { "option": "Promotor", "value": 10, "percentage": 27.0 },
    { "option": "Neutro", "value": 12, "percentage": 32.5 }
  ],
  "wordCloud": [],
  "sentimentCategories": [],
  "topicsByCategory": []
}
```

**Campos obrigatorios:**

| Campo | Tipo | Descricao | Calculo |
|-------|------|-----------|---------|
| `npsScore` | number | Score NPS recalculado | `(% promotores - % detratores)` do subconjunto filtrado |
| `npsStackedChart` | array | Distribuicao Detrator/Promotor/Neutro | Sempre 3 itens, com `value` (contagem) e `percentage` (%) |
| `npsStackedChart[].option` | string | Categoria | `"Detrator"`, `"Promotor"`, `"Neutro"` |
| `npsStackedChart[].value` | number | Contagem absoluta | Total de respondentes nessa categoria no subconjunto |
| `npsStackedChart[].percentage` | number | Porcentagem | `(value / total_subconjunto) * 100` |

O array pode ser enviado em qualquer ordem; o frontend renderiza sempre na ordem **Detrator → Neutro → Promotor**.

**Logica de calculo:**
1. Filtrar tabela bruta pelos filtros selecionados
2. Para cada respondente, classificar nota: 0-6 = Detrator, 7-8 = Neutro, 9-10 = Promotor
3. Contar totais de cada categoria
4. Calcular percentuais e NPS Score

### Open-Ended (`question_type: "open-ended"`)

O backend deve recalcular sentimentos, categorias e word cloud para o subconjunto filtrado.

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
        { "topic": "estabilidade", "sentiment": "negative" }
      ]
    }
  ],
  "wordCloud": [
    { "text": "internet", "value": 18 },
    { "text": "sinal", "value": 14 }
  ],
  "npsScore": null,
  "sentimentCategories": [
    { "category": "servico de rede", "negative": 2.5, "positive": 2.8, "neutral": 0.0 }
  ],
  "topicsByCategory": [
    {
      "category": "servico de rede",
      "positiveTopics": ["qualidade da rede"],
      "negativeTopics": ["estabilidade"],
      "neutralTopics": []
    }
  ]
}
```

**Campos obrigatorios:**

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `sentimentDivergentChart` | array | Categorias com % positivo/negativo |
| `sentimentDivergentChart[].value` | string | Nome da categoria |
| `sentimentDivergentChart[].positive` | number | Porcentagem de mencoes positivas |
| `sentimentDivergentChart[].negative` | number | Porcentagem de mencoes negativas |
| `topCategoriesCards` | array | Top categorias com detalhamento |
| `topCategoriesCards[].rank` | number | Posicao no ranking |
| `topCategoriesCards[].category` | string | Nome da categoria |
| `topCategoriesCards[].mentions` | number | Total de mencoes |
| `topCategoriesCards[].percentage` | number | Porcentagem relativa (1a = 100%) |
| `topCategoriesCards[].topics` | array | Topicos com sentimento |
| `topCategoriesCards[].topics[].topic` | string | Nome do topico |
| `topCategoriesCards[].topics[].sentiment` | string | `"positive"` ou `"negative"` |
| `wordCloud` | array | Palavras/frases com frequencia |
| `wordCloud[].text` | string | Palavra ou frase |
| `wordCloud[].value` | number | Frequencia |
| `sentimentCategories` | array | Categorias com breakdown de sentimento |
| `topicsByCategory` | array | Topicos organizados por categoria e sentimento |

**Logica de calculo:**
1. Filtrar respostas abertas pelo subconjunto
2. Re-processar analise de sentimento para o subconjunto
3. Recalcular frequencias de categorias/topicos
4. Recalcular word cloud a partir das respostas filtradas

### Single-Choice / Multiple-Choice (`question_type: "single-choice"` ou `"multiple-choice"`)

O backend deve recalcular contagens e porcentagens para cada opcao no subconjunto.

```json
{
  "barChart": [
    { "option": "Queda / instabilidade na internet", "value": 6, "percentage": 16.2 },
    { "option": "Falta de sinal de internet", "value": 5, "percentage": 13.5 },
    { "option": "Custo beneficio ruim", "value": 4, "percentage": 10.8 }
  ],
  "npsScore": null,
  "wordCloud": [],
  "sentimentCategories": [],
  "topicsByCategory": []
}
```

**Campos obrigatorios:**

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `barChart` | array | Opcoes com contagem e porcentagem |
| `barChart[].option` | string | Texto da opcao |
| `barChart[].value` | number | Contagem absoluta no subconjunto |
| `barChart[].percentage` | number | Porcentagem no subconjunto |

**Logica de calculo:**
1. Filtrar tabela bruta pelos filtros selecionados
2. Contar quantos respondentes selecionaram cada opcao
3. Calcular porcentagens: `(count_opcao / total_subconjunto) * 100`
4. Retornar todas as opcoes (incluindo as com 0 respostas)

---

## Contrato Completo - Exemplos de Request/Response

### Exemplo 1: NPS filtrado por Tipo de Cliente

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
    "respondent_count": 37,
    "data": {
      "npsScore": -13.5,
      "npsStackedChart": [
        { "option": "Detrator", "value": 15, "percentage": 40.5 },
        { "option": "Promotor", "value": 10, "percentage": 27.0 },
        { "option": "Neutro", "value": 12, "percentage": 32.5 }
      ],
      "wordCloud": [],
      "sentimentCategories": [],
      "topicsByCategory": []
    }
  }
}
```

### Exemplo 2: Open-ended filtrado por Estado

**Request:**
```
POST /api/surveys/telmob/questions/question02/filtered
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
    "question_id": "question02",
    "question_type": "open-ended",
    "applied_filters": [
      { "filter_id": "Estado", "values": ["SP"] }
    ],
    "respondent_count": 30,
    "data": {
      "sentimentDivergentChart": [
        { "value": "servico de rede", "positive": 8.0, "negative": 42.0 },
        { "value": "suporte ao cliente", "positive": 5.0, "negative": 12.0 },
        { "value": "cobertura de rede", "positive": 2.0, "negative": 15.0 }
      ],
      "topCategoriesCards": [
        {
          "rank": 1,
          "category": "servico de rede",
          "mentions": 50,
          "percentage": 100,
          "topics": [
            { "topic": "agilidade no atendimento", "sentiment": "positive" },
            { "topic": "confiabilidade da rede", "sentiment": "negative" }
          ]
        }
      ],
      "wordCloud": [
        { "text": "internet", "value": 15 },
        { "text": "sinal", "value": 12 }
      ],
      "npsScore": null,
      "sentimentCategories": [
        { "category": "servico de rede", "negative": 3.0, "positive": 2.0, "neutral": 0.0 }
      ],
      "topicsByCategory": [
        {
          "category": "servico de rede",
          "positiveTopics": ["agilidade no atendimento"],
          "negativeTopics": ["confiabilidade da rede"],
          "neutralTopics": []
        }
      ]
    }
  }
}
```

### Exemplo 3: Single-choice com multiplos filtros

**Request:**
```
POST /api/surveys/telmob/questions/question03/filtered
Content-Type: application/json

{
  "filters": [
    { "filter_id": "TipodeCliente", "values": ["pos-pago"] },
    { "filter_id": "Estado", "values": ["SP", "RJ"] }
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
    "applied_filters": [
      { "filter_id": "TipodeCliente", "values": ["pos-pago"] },
      { "filter_id": "Estado", "values": ["SP", "RJ"] }
    ],
    "respondent_count": 15,
    "data": {
      "barChart": [
        { "option": "Queda / instabilidade na internet", "value": 4, "percentage": 26.7 },
        { "option": "Falta de sinal de internet", "value": 3, "percentage": 20.0 },
        { "option": "Custo beneficio ruim", "value": 2, "percentage": 13.3 }
      ],
      "npsScore": null,
      "wordCloud": [],
      "sentimentCategories": [],
      "topicsByCategory": []
    }
  }
}
```

### Exemplo 4: Erro - sem respondentes

**Request:**
```
POST /api/surveys/telmob/questions/question01/filtered
Content-Type: application/json

{
  "filters": [
    { "filter_id": "TipodeCliente", "values": ["pre-pago"] },
    { "filter_id": "Estado", "values": ["BA"] }
  ]
}
```

**Response (422):**
```json
{
  "success": false,
  "error": "No respondents match the selected filters"
}
```

---

## Notas de Implementacao

### Logica de Filtragem

Os filtros sao aplicados com logica **AND** entre filter_ids e **OR** dentro de values:
- `TipodeCliente = ["pre-pago"]` AND `Estado = ["SP", "RJ"]`
- Significa: respondentes que sao pre-pago E estao em SP ou RJ

### Performance

- API 1 pode ser cacheada (filtros nao mudam durante a sessao)
- API 2 deve ser rapida (< 2s) para boa UX - o frontend mostra spinner
- Considerar cache de combinacoes frequentes de filtros

### Extensibilidade

O frontend renderiza qualquer numero de filtros dinamicamente. Para adicionar um novo filtro:
1. Adicionar coluna na tabela bruta
2. Incluir no retorno da API 1 (novo objeto em `filters[]`)
3. Ajustar calculo na API 2

Nao e necessaria nenhuma alteracao no frontend.

### Codificacao (evitar erro de renderizacao)

Para que acentos e caracteres especiais (ex.: Paraná, São Paulo) nao aparecam como "Paran" ou simbolo de interrogacao:

- **Respostas JSON** devem ser enviadas em **UTF-8** e o header deve incluir:  
  `Content-Type: application/json; charset=utf-8`
- **Arquivos JSON** usados como mock ou importados devem estar salvos em **UTF-8** (sem BOM).  
  Se o JSON for gerado por outro sistema, garantir que a exportacao/API use UTF-8; caso contrario, caracteres como `á` podem ser gravados em Latin-1 e, ao serem lidos como UTF-8, viram o caractere de substituicao ().

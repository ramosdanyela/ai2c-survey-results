# 📊 Especificação de API para Questões - Dados Agregados

## 🎯 Contexto

- **Banco de dados**: Linha a linha com respostas por respondente
- **API**: Retorna dados **já agregados e processados** (prontos para plotar)
- **Filtros**: Dinâmicos - a API informa quais filtros estão disponíveis
- **Quando houver API**: A seção `data` da section `responses` será desconsiderada (vem da API)

---

## 🔍 Endpoint 1: Descobrir Filtros Disponíveis

### `GET /api/surveys/{surveyId}/filters`

Retorna quais filtros estão disponíveis para a pesquisa e seus valores possíveis.

**Response:**

```json
{
  "success": true,
  "data": {
    "filters": [
      {
        "id": "state",
        "label": "Estado",
        "type": "multi-select",
        "values": [
          {
            "value": "SP",
            "label": "São Paulo",
            "count": 450
          },
          {
            "value": "RJ",
            "label": "Rio de Janeiro",
            "count": 320
          },
          {
            "value": "MG",
            "label": "Minas Gerais",
            "count": 180
          }
        ]
      },
      {
        "id": "customerType",
        "label": "Tipo de Cliente",
        "type": "multi-select",
        "values": [
          {
            "value": "Pós-pago",
            "label": "Pós-pago",
            "count": 520
          },
          {
            "value": "Pré-pago",
            "label": "Pré-pago",
            "count": 430
          }
        ]
      },
      {
        "id": "education",
        "label": "Educação",
        "type": "multi-select",
        "values": [
          {
            "value": "Superior",
            "label": "Superior",
            "count": 680
          },
          {
            "value": "Médio",
            "label": "Médio",
            "count": 270
          }
        ]
      }
    ]
  }
}
```

**Nota**: Os filtros disponíveis são dinâmicos e baseados nos atributos da pesquisa. A API deve retornar apenas os filtros que têm dados disponíveis.

---

## 📥 Endpoint 2: Buscar Questões com Dados Agregados

### `GET /api/surveys/{surveyId}/questions`

### Campos para ENVIAR (Query Parameters)

#### Obrigatórios

| Campo      | Tipo   | Descrição                       | Exemplo               |
| ---------- | ------ | ------------------------------- | --------------------- |
| `surveyId` | string | ID da pesquisa (path parameter) | `stress-test-2025-01` |

#### Opcionais - Filtros de Questões

| Campo          | Tipo   | Descrição                               | Exemplo                                                 |
| -------------- | ------ | --------------------------------------- | ------------------------------------------------------- |
| `questionIds`  | string | IDs específicos (separados por vírgula) | `1,2,3`                                                 |
| `questionType` | string | Tipo da questão                         | `nps`, `open-ended`, `multiple-choice`, `single-choice` |
| `minIndex`     | number | Índice mínimo                           | `1`                                                     |

**Nota sobre `minIndex`**: Em pesquisas de clima, preservar a confidencialidade pode exigir um índice mínimo mais alto (mercado trabalha com no mínimo 3 respostas agregadas para mostrar resultado).

#### Opcionais - Filtros Dinâmicos (aplicados aos respondentes)

Os filtros dinâmicos são enviados como query parameters no formato:

- `filters[{filterId}]=value1,value2,value3`

**Exemplos:**

- `filters[state]=SP,RJ` - Filtrar por estados SP e RJ
- `filters[customerType]=Pós-pago` - Filtrar por tipo de cliente
- `filters[state]=SP&filters[customerType]=Pós-pago` - Múltiplos filtros (AND)

**Nota sobre comportamento dos filtros**: Os filtros são **cumulativos e agregados**:

- **Múltiplos valores no mesmo filtro** (ex: `filters[state]=SP,RJ,MG`): São **somados/agregados juntos** - retorna dados agregados de SP + RJ + MG combinados
- **Diferentes filtros** (ex: `filters[state]=SP,RJ&filters[customerType]=Pós-pago`): São unidos com **AND** - retorna dados que atendem ambos os critérios simultaneamente
- **Filtros são cumulativos**: À medida que o usuário seleciona mais valores/filtros, eles vão se somando/refinando os resultados. Por exemplo:
  - Selecionar `state=SP` → retorna dados agregados de SP
  - Adicionar `state=RJ` → retorna dados agregados de SP + RJ (soma dos dois)
  - Adicionar `state=MG` → retorna dados agregados de SP + RJ + MG (soma dos três)
  - Adicionar `customerType=Pós-pago` → retorna dados agregados de (SP + RJ + MG) **E** Pós-pago (intersecção)

---

## 📤 Campos para RECEBER (Response)

### Estrutura de Resposta

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": 1,
        "questionType": "nps",
        "data": {
          "npsScore": 35,
          "npsStackedChart": [
            {
              "option": "Promotor",
              "value": 493,
              "percentage": 58
            },
            {
              "option": "Neutro",
              "value": 170,
              "percentage": 20
            },
            {
              "option": "Detrator",
              "value": 187,
              "percentage": 22
            }
          ]
        },
        "totalResponses": 850
      }
    ],
    "filters": {
      "applied": {
        "state": ["SP", "RJ"],
        "customerType": ["Pós-pago"]
      },
      "available": {
        "state": [
          { "value": "SP", "label": "São Paulo", "count": 450 },
          { "value": "RJ", "label": "Rio de Janeiro", "count": 320 },
          { "value": "MG", "label": "Minas Gerais", "count": 180 }
        ],
        "customerType": [
          { "value": "Pós-pago", "label": "Pós-pago", "count": 520 },
          { "value": "Pré-pago", "label": "Pré-pago", "count": 430 }
        ],
        "education": [
          { "value": "Superior", "label": "Superior", "count": 680 },
          { "value": "Médio", "label": "Médio", "count": 270 }
        ]
      }
    },
    "metadata": {
      "totalRespondents": 250,
      "totalRespondentsBeforeFilters": 850
    }
  }
}
```

### Estrutura de Dados por Tipo de Questão

A estrutura de `data` deve ser **idêntica** ao JSON atual para manter compatibilidade total com o frontend.

#### 1. Questão NPS (`questionType: "nps"`)

```json
{
  "id": 1,
  "questionType": "nps",
  "data": {
    "npsScore": 35,
    "npsStackedChart": [
      {
        "option": "Promotor",
        "value": 493,
        "percentage": 58
      },
      {
        "option": "Neutro",
        "value": 170,
        "percentage": 20
      },
      {
        "option": "Detrator",
        "value": 187,
        "percentage": 22
      }
    ]
  },
  "totalResponses": 850
}
```

**Estrutura da API:**

- `id` (number) - ID único da questão (obrigatório)
- `questionType` (string) - Tipo da questão: `"nps"` (obrigatório)
- `data` (object) - Dados agregados (obrigatório)
- `totalResponses` (number, opcional) - Total de respostas após aplicar filtros

**Estrutura de `data` (idêntica ao JSON atual):**

- `npsScore` (number) - Score NPS calculado (obrigatório)
- `npsStackedChart` (array) - Array com Promotor, Neutro, Detrator (obrigatório). Cada item tem:
  - `option` (string) - Nome da categoria: "Promotor", "Neutro", "Detrator"
  - `value` (number) - Quantidade de respostas
  - `percentage` (number) - Percentual

**Nota sobre renderização**: O frontend usa templates pré-definidos (`questionTemplates.js`) que renderizam:

- `npsScoreCard` usando `question.data` (acessa `npsScore`)
- `npsStackedChart` usando `question.data.npsStackedChart`

#### 2. Questão Múltipla Escolha (`questionType: "multiple-choice"`)

```json
{
  "id": 2,
  "questionType": "multiple-choice",
  "data": {
    "barChart": [
      {
        "option": "Muito bom",
        "value": 221,
        "percentage": 26
      },
      {
        "option": "Bom",
        "value": 221,
        "percentage": 26
      },
      {
        "option": "Regular",
        "value": 238,
        "percentage": 28
      },
      {
        "option": "Ruim",
        "value": 136,
        "percentage": 16
      },
      {
        "option": "Muito ruim",
        "value": 34,
        "percentage": 4
      }
    ]
  },
  "totalResponses": 850
}
```

**Estrutura da API:**

- `id` (number) - ID único da questão (obrigatório)
- `questionType` (string) - Tipo da questão: `"multiple-choice"` (obrigatório)
- `data` (object) - Dados agregados (obrigatório)
- `totalResponses` (number, opcional) - Total de respostas após aplicar filtros

**Estrutura de `data` (idêntica ao JSON atual):**

- `barChart` (array) - Array de opções (obrigatório). Cada item tem:
  - `option` (string) - Texto da opção
  - `value` (number) - Quantidade de respostas
  - `percentage` (number) - Percentual

#### 3. Questão Escolha Única (`questionType: "single-choice"`)

Mesma estrutura de `multiple-choice`:

```json
{
  "id": 3,
  "questionType": "single-choice",
  "data": {
    "barChart": [
      {
        "option": "Mensalmente",
        "value": 357,
        "percentage": 42
      },
      {
        "option": "Trimestralmente",
        "value": 238,
        "percentage": 28
      },
      {
        "option": "Esporadicamente",
        "value": 153,
        "percentage": 18
      },
      {
        "option": "Raramente",
        "value": 85,
        "percentage": 10
      },
      {
        "option": "Nunca",
        "value": 17,
        "percentage": 2
      }
    ]
  },
  "totalResponses": 850
}
```

**Estrutura da API:**

- `id` (number) - ID único da questão (obrigatório)
- `questionType` (string) - Tipo da questão: `"single-choice"` (obrigatório)
- `data` (object) - Dados agregados (obrigatório)
- `totalResponses` (number, opcional) - Total de respostas após aplicar filtros

**Estrutura de `data` (idêntica ao JSON atual):**

- `barChart` (array) - Mesma estrutura de `multiple-choice`

#### 4. Questão Aberta (`questionType: "open-ended"`)

```json
{
  "id": 4,
  "questionType": "open-ended",
  "data": {
    "sentimentStackedChart": [
      {
        "category": "Trabalho em Equipe",
        "positive": 72.3,
        "neutral": 18.5,
        "negative": 9.2
      },
      {
        "category": "Desenvolvimento Profissional",
        "positive": 68.1,
        "neutral": 22.4,
        "negative": 9.5
      },
      {
        "category": "Flexibilidade",
        "positive": 65.2,
        "neutral": 25.8,
        "negative": 9
      },
      {
        "category": "Liderança",
        "positive": 58.7,
        "neutral": 28.3,
        "negative": 13
      }
    ],
    "topCategoriesCards": [
      {
        "rank": 1,
        "category": "Trabalho em Equipe",
        "mentions": 425,
        "percentage": 100,
        "topics": [
          {
            "topic": "colaboração eficiente",
            "sentiment": "positive"
          },
          {
            "topic": "ambiente colaborativo",
            "sentiment": "positive"
          },
          {
            "topic": "suporte entre colegas",
            "sentiment": "positive"
          }
        ]
      },
      {
        "rank": 2,
        "category": "Desenvolvimento Profissional",
        "mentions": 312,
        "percentage": 73,
        "topics": [
          {
            "topic": "oportunidades de crescimento",
            "sentiment": "positive"
          },
          {
            "topic": "treinamentos relevantes",
            "sentiment": "positive"
          },
          {
            "topic": "mentoria",
            "sentiment": "positive"
          }
        ]
      },
      {
        "rank": 3,
        "category": "Flexibilidade",
        "mentions": 285,
        "percentage": 67,
        "topics": [
          {
            "topic": "horário flexível",
            "sentiment": "positive"
          },
          {
            "topic": "trabalho remoto",
            "sentiment": "positive"
          },
          {
            "topic": "autonomia",
            "sentiment": "positive"
          }
        ]
      }
    ],
    "wordCloud": [
      {
        "text": "equipe",
        "value": 425
      },
      {
        "text": "desenvolvimento",
        "value": 312
      },
      {
        "text": "flexibilidade",
        "value": 285
      },
      {
        "text": "colaboração",
        "value": 198
      },
      {
        "text": "crescimento",
        "value": 156
      },
      {
        "text": "oportunidades",
        "value": 134
      },
      {
        "text": "liderança",
        "value": 112
      },
      {
        "text": "autonomia",
        "value": 98
      },
      {
        "text": "reconhecimento",
        "value": 87
      },
      {
        "text": "cultura",
        "value": 76
      }
    ]
  },
  "totalResponses": 850
}
```

**Estrutura da API:**

- `id` (number) - ID único da questão (obrigatório)
- `questionType` (string) - Tipo da questão: `"open-ended"` (obrigatório)
- `data` (object) - Dados agregados (obrigatório)
- `totalResponses` (number, opcional) - Total de respostas após aplicar filtros

**Estrutura de `data` (idêntica ao JSON atual):**

- `sentimentStackedChart` (array) - Categorias com percentuais de sentimento (obrigatório). Cada item tem:
  - `category` (string) - Nome da categoria
  - `positive` (number) - Percentual positivo
  - `neutral` (number) - Percentual neutro
  - `negative` (number) - Percentual negativo
- `topCategoriesCards` (array) - Top categorias com menções e tópicos (obrigatório). Cada item tem:
  - `rank` (number) - Posição no ranking (1, 2, 3...)
  - `category` (string) - Nome da categoria
  - `mentions` (number) - Quantidade de menções
  - `percentage` (number) - Percentual (100 para o primeiro)
  - `topics` (array) - Array de tópicos. Cada tópico tem:
    - `topic` (string) - Texto do tópico
    - `sentiment` (string) - Sentimento: "positive", "neutral", "negative"
- `wordCloud` (array) - Nuvem de palavras (obrigatório). Cada item tem:
  - `text` (string) - Palavra/texto
  - `value` (number) - Frequência/peso

**Importante**: Para questões abertas, todos os três campos (`sentimentDivergentChart` ou `sentimentStackedChart`, `topCategoriesCards`, `wordCloud`) devem estar presentes.

---

## ⚠️ Compatibilidade com Código Atual

**IMPORTANTE**: A API retorna apenas `id`, `questionType` e `data`. Os demais campos (`index`, `question`, `icon`, `summary`) vêm do JSON estático e são mesclados no frontend.

### Estrutura Mínima da API

```json
{
  "id": 1,                    // ✅ Obrigatório: identificação da questão
  "questionType": "nps",      // ✅ Obrigatório: determina template e estrutura de data
  "data": { ... }             // ✅ Obrigatório: dados agregados (mesma estrutura do JSON)
}
```

## 🔌 Exemplos de Requisições

### 1. Buscar todas as questões (sem filtros)

```http
GET /api/surveys/stress-test-2025-01/questions
```

### 2. Buscar questões específicas

```http
GET /api/surveys/stress-test-2025-01/questions?questionIds=1,2,3
```

### 3. Filtrar por tipo de questão

```http
GET /api/surveys/stress-test-2025-01/questions?questionType=nps
```

### 4. Aplicar filtros dinâmicos (estado)

```http
GET /api/surveys/stress-test-2025-01/questions?filters[state]=SP,RJ
```

### 5. Aplicar múltiplos filtros dinâmicos

```http
GET /api/surveys/stress-test-2025-01/questions?filters[state]=SP,RJ&filters[customerType]=Pós-pago
```

### 6. Questão específica com filtros

```http
GET /api/surveys/stress-test-2025-01/questions?questionIds=1&filters[state]=SP&filters[education]=Superior
```

### 7. Questões abertas com filtros

```http
GET /api/surveys/stress-test-2025-01/questions?questionType=open-ended&filters[state]=SP
```

---

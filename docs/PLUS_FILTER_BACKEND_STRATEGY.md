# 📊 Estrutura de Dados para Filtros Ativos nas Questões

Este documento descreve como deveria ser a estrutura dos dados caso se quisesse que na seção de questões, os filtros fossem ativos. Ele apresenta uma arquitetura onde **os dados brutos e o processamento de filtros ficam no backend**, e o **frontend utiliza apenas hooks para fazer chamadas à API** quando os filtros são acionados.

---

## 🎯 Objetivo

Atualmente, os filtros na seção de questões (`FilterPanel`) permitem selecionar valores de atributos (Estado, Tipo de Cliente, Escolaridade), mas esses filtros **não estão aplicados aos dados das questões**. Este documento propõe uma arquitetura que permitiria:

1. **Armazenar dados brutos no backend** (uma linha por respondente)
2. **Processar filtros no backend** (agregação e reagregação de dados)
3. **Frontend utiliza hooks** para fazer chamadas à API quando filtros são acionados
4. **Manter compatibilidade** com a estrutura JSON existente

---

## 📋 Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [Estrutura de Dados no Backend](#estrutura-de-dados-no-backend)
3. [API Endpoints](#api-endpoints)
4. [Hooks no Frontend](#hooks-no-frontend)
5. [Integração com JSON Existente](#integração-com-json-existente)
6. [Exemplo de Implementação Completa](#exemplo-de-implementação-completa)
7. [Considerações de Performance](#considerações-de-performance)

---

## 🏗️ Arquitetura Geral

### Visão da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ FilterPanel  │───▶│   Hook       │───▶│ QuestionsList│  │
│  │  (UI)        │    │ useFiltered  │    │  (Render)    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                              │                              │
│                              ▼                              │
│                    ┌──────────────────┐                     │
│                    │  API Service     │                     │
│                    │  (fetch calls)   │                     │
│                    └──────────────────┘                     │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │ HTTP Request
                                │ { filters: [...] }
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoint: /api/survey/questions/filtered        │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Filter Service (Processa filtros)                    │  │
│  │  - Filtra rawResponses por atributos                 │  │
│  │  - Agrega dados por questão                           │  │
│  │  - Calcula estatísticas (NPS, sentiment, etc)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                              │
│                              ▼                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Database/Storage                                     │  │
│  │  - rawResponses (uma linha por respondente)          │  │
│  │  - Dados agregados (cache opcional)                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Responsabilidades

**Backend:**

- ✅ Armazenar dados brutos (rawResponses)
- ✅ Processar filtros e reagregar dados
- ✅ Calcular estatísticas (NPS, sentiment analysis, etc)
- ✅ Retornar dados agregados formatados

**Frontend:**

- ✅ Exibir UI de filtros (FilterPanel)
- ✅ Usar hooks para fazer chamadas à API
- ✅ Renderizar dados filtrados (QuestionsList)
- ✅ Gerenciar estado de loading/error

### Situação Atual

Atualmente, o `surveyData.json` contém:

- **Questões agregadas**: Cada questão já tem seus dados agregados (ex: `question.data` com contagens e percentuais)
- **Atributos agregados**: `attributeDeepDive.attributes` contém distribuições por segmento, mas não está conectado às questões
- **Filtros visuais**: O `FilterPanel` permite selecionar filtros, mas eles não afetam os dados exibidos

### Situação Desejada

Para que os filtros funcionem com arquitetura backend/frontend:

1. **Backend armazena dados brutos** (rawResponses) e processa filtros
2. **API endpoints** retornam dados agregados baseados nos filtros
3. **Frontend usa hooks** que fazem chamadas à API quando filtros mudam
4. **Compatibilidade mantida** com estrutura JSON atual (dados padrão sem filtros)

---

## 💾 Estrutura de Dados no Backend

### Dados Brutos (Raw Data) - Armazenados no Backend

Os dados brutos ficam armazenados no backend (banco de dados ou storage). Cada linha representa uma resposta completa de um respondente, incluindo todos os atributos demográficos e todas as respostas às questões.

```json
{
  "rawResponses": [
    {
      "respondentId": "R001",
      "attributes": {
        "state": "SP",
        "customerType": "Pós-pago",
        "education": "Superior completo"
      },
      "responses": {
        "question1": {
          "questionId": 1,
          "type": "nps",
          "value": 8,
          "category": "Promotor"
        },
        "question2": {
          "questionId": 2,
          "type": "closed",
          "option": "Excelente",
          "value": 1
        },
        "question3": {
          "questionId": 3,
          "type": "closed",
          "option": "Bom",
          "value": 1
        },
        "question4": {
          "questionId": 4,
          "type": "open",
          "text": "O atendimento foi excelente, mas poderia melhorar a velocidade da rede."
        },
        "question5": {
          "questionId": 5,
          "type": "closed",
          "option": "Regular",
          "value": 1
        },
        "question6": {
          "questionId": 6,
          "type": "open",
          "text": "Melhorar o tempo de resposta do suporte técnico."
        }
      },
      "metadata": {
        "timestamp": "2024-10-15T10:30:00Z",
        "surveyVersion": "1.0",
        "device": "mobile"
      }
    },
    {
      "respondentId": "R002",
      "attributes": {
        "state": "RJ",
        "customerType": "Pré-pago",
        "education": "Ensino médio"
      },
      "responses": {
        "question1": {
          "questionId": 1,
          "type": "nps",
          "value": 3,
          "category": "Detrator"
        },
        "question2": {
          "questionId": 2,
          "type": "closed",
          "option": "Ruim",
          "value": 1
        },
        "question3": {
          "questionId": 3,
          "type": "closed",
          "option": "Péssimo",
          "value": 1
        },
        "question4": {
          "questionId": 4,
          "type": "open",
          "text": "A cobertura da rede é muito ruim na minha região."
        },
        "question5": {
          "questionId": 5,
          "type": "closed",
          "option": "Ruim",
          "value": 1
        },
        "question6": {
          "questionId": 6,
          "type": "open",
          "text": "Investir mais em infraestrutura de rede."
        }
      },
      "metadata": {
        "timestamp": "2024-10-15T11:15:00Z",
        "surveyVersion": "1.0",
        "device": "desktop"
      }
    }
    // ... mais 1245 respondentes
  ]
}
```

### Vantagens desta Arquitetura

✅ **Processamento no backend**: Melhor performance, não sobrecarrega o frontend  
✅ **Flexibilidade total**: Permite filtrar por qualquer combinação de atributos  
✅ **Reagregação dinâmica**: Backend calcula estatísticas para qualquer filtro aplicado  
✅ **Extensibilidade**: Fácil adicionar novos atributos ou questões no backend  
✅ **Rastreabilidade**: Cada resposta está vinculada a um respondente específico  
✅ **Segurança**: Dados brutos não são expostos ao frontend

### Estrutura no Banco de Dados

Os dados brutos podem ser armazenados em:

- **Banco de dados relacional** (PostgreSQL, MySQL): Tabela `raw_responses`
- **NoSQL** (MongoDB): Coleção `rawResponses`
- **Data Warehouse** (BigQuery, Redshift): Para grandes volumes

---

## 🔌 API Endpoints

### Endpoint Principal: Buscar Questões Filtradas

**GET** `/api/survey/questions/filtered`

**Query Parameters:**

- `filters` (JSON string): Array de filtros aplicados
- `questionIds` (opcional): IDs específicos de questões (se não fornecido, retorna todas)

**Exemplo de Request:**

```http
GET /api/survey/questions/filtered?filters=[{"filterType":"state","values":["SP","RJ"]},{"filterType":"customerType","values":["Pós-pago"]}]
```

**Exemplo de Response:**

```json
{
  "questions": [
    {
      "id": 1,
      "index": 1,
      "question": "Qual é a probabilidade de você recomendar nossa empresa?",
      "type": "nps",
      "icon": "Percent",
      "summary": "Resumo filtrado...",
      "data": [
        { "option": "Detrator", "value": 120, "percentage": 48 },
        { "option": "Promotor", "value": 90, "percentage": 36 },
        { "option": "Neutro", "value": 40, "percentage": 16 }
      ],
      "total": 250,
      "appliedFilters": [
        { "filterType": "state", "values": ["SP", "RJ"] },
        { "filterType": "customerType", "values": ["Pós-pago"] }
      ]
    },
    {
      "id": 4,
      "type": "open",
      "sentimentData": [
        /* dados filtrados */
      ],
      "topCategories": [
        /* dados filtrados */
      ],
      "wordCloud": [
        /* dados filtrados */
      ]
    }
  ],
  "metadata": {
    "totalRespondents": 250,
    "appliedFilters": [
      /* ... */
    ],
    "timestamp": "2024-10-15T12:00:00Z"
  }
}
```

### Endpoint Alternativo: POST (para filtros complexos)

**POST** `/api/survey/questions/filtered`

**Request Body:**

```json
{
  "filters": [
    {
      "filterType": "state",
      "values": ["SP", "RJ"]
    },
    {
      "filterType": "customerType",
      "values": ["Pós-pago"]
    }
  ],
  "questionIds": [1, 4, 6] // opcional
}
```

**Response:** Mesmo formato do GET

### Endpoint: Dados Padrão (Sem Filtros)

**GET** `/api/survey/questions`

Retorna todas as questões com dados agregados padrão (sem filtros aplicados). Este endpoint pode ser usado para carregamento inicial e manter compatibilidade.

---

## 🎣 Hooks no Frontend

### Hook Principal: `useFilteredQuestions`

Este hook faz chamadas à API quando os filtros mudam e retorna os dados filtrados.

**Localização sugerida:** `src/hooks/useFilteredQuestions.js`

```javascript
import { useQuery } from "@tanstack/react-query";
import { fetchFilteredQuestions } from "@/services/surveyDataService";

/**
 * Hook para buscar questões filtradas
 *
 * @param {Array} filters - Array de filtros ativos
 * @param {Array} questionIds - IDs específicos de questões (opcional)
 * @returns {Object} - { data, loading, error, refetch }
 */
export function useFilteredQuestions(filters = [], questionIds = null) {
  return useQuery({
    queryKey: ["filteredQuestions", filters, questionIds],
    queryFn: () => fetchFilteredQuestions(filters, questionIds),
    enabled: true, // Sempre habilitado, mesmo sem filtros
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
```

### Service: `fetchFilteredQuestions`

**Localização sugerida:** `src/services/surveyDataService.js`

```javascript
/**
 * Busca questões filtradas da API
 *
 * @param {Array} filters - Array de filtros: [{ filterType: "state", values: ["SP"] }]
 * @param {Array} questionIds - IDs específicos de questões (opcional)
 * @returns {Promise<Object>} - Dados das questões filtradas
 */
export const fetchFilteredQuestions = async (
  filters = [],
  questionIds = null
) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Se não há filtros, usar endpoint padrão
  if (!filters || filters.length === 0) {
    const endpoint = questionIds
      ? `/api/survey/questions?questionIds=${questionIds.join(",")}`
      : `/api/survey/questions`;

    const response = await fetch(`${apiUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(import.meta.env.VITE_API_TOKEN && {
          Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        }),
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar questões: ${response.status}`);
    }

    return response.json();
  }

  // Com filtros, usar endpoint de filtros
  const endpoint = "/api/survey/questions/filtered";
  const params = new URLSearchParams();

  if (filters.length > 0) {
    params.append("filters", JSON.stringify(filters));
  }

  if (questionIds && questionIds.length > 0) {
    params.append("questionIds", questionIds.join(","));
  }

  const url = `${apiUrl}${endpoint}?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(import.meta.env.VITE_API_TOKEN && {
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      }),
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar questões filtradas: ${response.status}`);
  }

  return response.json();
};
```

### Uso do Hook no Componente

**Exemplo em `QuestionsList.jsx`:**

```javascript
import { useFilteredQuestions } from "@/hooks/useFilteredQuestions";

export function QuestionsList({
  questionId: initialQuestionId,
  dataPath = "responseDetails",
  hideFilterPills = false,
  externalFilterState = null,
  data: externalData = null,
}) {
  // Obter filtros ativos (do FilterPanel ou estado externo)
  const [activeFilters, setActiveFilters] = useState([]);

  // Usar hook para buscar questões filtradas
  const {
    data: filteredData,
    loading,
    error,
    refetch,
  } = useFilteredQuestions(activeFilters);

  // Se há dados filtrados, usar eles; senão, usar dados padrão
  const questions =
    filteredData?.questions || externalData?.responseDetails?.questions || [];

  if (loading) {
    return <div>Carregando questões filtradas...</div>;
  }

  if (error) {
    return <div>Erro ao carregar questões: {error.message}</div>;
  }

  // Renderizar questões...
}
```

---

## 🗂️ Estrutura de Dados Agregados (Resposta da API)

### Formato: Dados Pré-Agregados por Combinação de Filtros

Esta estrutura mantém dados agregados para combinações comuns de filtros, reduzindo a necessidade de processamento em tempo real.

### Opção 1: Dados Agregados por Questão e Filtro

```json
{
  "responseDetails": {
    "questions": [
      {
        "id": 1,
        "index": 1,
        "question": "Qual é a probabilidade de você recomendar nossa empresa a um amigo ou colega em escala de 0 a 10?",
        "type": "nps",
        "icon": "Percent",
        "summary": "Resumo geral da questão...",
        // Dados sem filtro (padrão atual)
        "data": [
          { "option": "Detrator", "value": 636, "percentage": 51 },
          { "option": "Promotor", "value": 374, "percentage": 30 },
          { "option": "Neutro", "value": 237, "percentage": 19 }
        ],
        // Dados filtrados por combinações de atributos
        "filteredData": {
          // Filtro único: Estado
          "state": {
            "SP": {
              "data": [
                { "option": "Detrator", "value": 250, "percentage": 48 },
                { "option": "Promotor", "value": 180, "percentage": 35 },
                { "option": "Neutro", "value": 90, "percentage": 17 }
              ],
              "total": 520
            },
            "RJ": {
              "data": [
                { "option": "Detrator", "value": 180, "percentage": 55 },
                { "option": "Promotor", "value": 90, "percentage": 28 },
                { "option": "Neutro", "value": 55, "percentage": 17 }
              ],
              "total": 325
            }
            // ... outros estados
          },
          // Filtro único: Tipo de Cliente
          "customerType": {
            "Pós-pago": {
              "data": [
                { "option": "Detrator", "value": 200, "percentage": 71 },
                { "option": "Promotor", "value": 50, "percentage": 18 },
                { "option": "Neutro", "value": 30, "percentage": 11 }
              ],
              "total": 280
            },
            "Pré-pago": {
              "data": [
                { "option": "Detrator", "value": 180, "percentage": 49 },
                { "option": "Promotor", "value": 130, "percentage": 35 },
                { "option": "Neutro", "value": 60, "percentage": 16 }
              ],
              "total": 370
            }
            // ... outros tipos
          },
          // Filtro único: Escolaridade
          "education": {
            "Superior completo": {
              "data": [
                { "option": "Detrator", "value": 150, "percentage": 45 },
                { "option": "Promotor", "value": 120, "percentage": 36 },
                { "option": "Neutro", "value": 65, "percentage": 19 }
              ],
              "total": 335
            }
            // ... outros níveis
          },
          // Filtros combinados (exemplo: Estado + Tipo de Cliente)
          "state_customerType": {
            "SP_Pós-pago": {
              "data": [
                { "option": "Detrator", "value": 100, "percentage": 50 },
                { "option": "Promotor", "value": 70, "percentage": 35 },
                { "option": "Neutro", "value": 30, "percentage": 15 }
              ],
              "total": 200
            },
            "RJ_Pré-pago": {
              "data": [
                { "option": "Detrator", "value": 80, "percentage": 53 },
                { "option": "Promotor", "value": 50, "percentage": 33 },
                { "option": "Neutro", "value": 20, "percentage": 14 }
              ],
              "total": 150
            }
            // ... outras combinações
          }
        }
      },
      {
        "id": 4,
        "index": 4,
        "question": "O que mais gosta em nosso serviço?",
        "type": "open",
        "icon": "FileText",
        "summary": "Resumo geral...",
        // Dados sem filtro
        "sentimentData": [
          {
            "category": "Suporte",
            "positive": 45,
            "neutral": 30,
            "negative": 25
          }
        ],
        "topCategories": [
          {
            "rank": 1,
            "category": "Qualidade do atendimento",
            "mentions": 412,
            "percentage": 33
          }
        ],
        "wordCloud": [{ "text": "qualidade", "value": 487 }],
        // Dados filtrados
        "filteredData": {
          "state": {
            "SP": {
              "sentimentData": [
                {
                  "category": "Suporte",
                  "positive": 50,
                  "neutral": 25,
                  "negative": 25
                }
              ],
              "topCategories": [
                {
                  "rank": 1,
                  "category": "Qualidade do atendimento",
                  "mentions": 200,
                  "percentage": 38
                }
              ],
              "wordCloud": [{ "text": "qualidade", "value": 250 }]
            }
            // ... outros estados
          }
          // ... outros filtros
        }
      }
    ]
  }
}
```

---

## 🔗 Integração com JSON Existente

### Estratégia de Compatibilidade

Para não quebrar a renderização atual, a arquitetura deve:

1. **Manter endpoint padrão** que retorna dados sem filtros (compatível com estrutura atual)
2. **Hook usa dados padrão quando não há filtros** (fallback automático)
3. **Componentes continuam funcionando** mesmo sem filtros aplicados

### Estrutura da Resposta da API (Compatível)

A API retorna dados no mesmo formato do JSON atual, facilitando a integração:

```json
{
  "questions": [
    {
      "id": 1,
      "index": 1,
      "question": "Qual é a probabilidade...",
      "type": "nps",
      "icon": "Percent",
      "summary": "Resumo...",
      // ✅ MESMA estrutura do JSON atual
      "data": [
        { "option": "Detrator", "value": 636, "percentage": 51 },
        { "option": "Promotor", "value": 374, "percentage": 30 },
        { "option": "Neutro", "value": 237, "percentage": 19 }
      ]
    }
  ],
  "metadata": {
    "totalRespondents": 1247,
    "appliedFilters": [], // Vazio quando sem filtros
    "timestamp": "2024-10-15T12:00:00Z"
  }
}
```

### Lógica no Frontend

O componente `QuestionsList` deve:

1. **Usar hook `useFilteredQuestions`** com filtros ativos
2. **Hook faz chamada à API** automaticamente quando filtros mudam
3. **Se não há filtros**, hook usa endpoint padrão (compatível)
4. **Renderiza dados retornados** pela API

```javascript
// Exemplo de uso no QuestionsList
export function QuestionsList({
  externalFilterState = null,
  data: externalData = null,
}) {
  // Obter filtros ativos do FilterPanel ou estado externo
  const [activeFilters, setActiveFilters] = useState([]);

  // Hook faz chamada à API quando filtros mudam
  const {
    data: filteredData,
    loading,
    error,
  } = useFilteredQuestions(activeFilters);

  // Se há dados filtrados, usar eles; senão, usar dados padrão (fallback)
  const questions =
    filteredData?.questions || externalData?.responseDetails?.questions || [];

  // Renderizar questões...
}
```

---

## 💡 Exemplo de Implementação Completa

### Exemplo 1: Estrutura de Dados Brutos no Backend

**Backend - Tabela/Collection `raw_responses`:**

```sql
-- Exemplo SQL (PostgreSQL)
CREATE TABLE raw_responses (
  respondent_id VARCHAR(50) PRIMARY KEY,
  state VARCHAR(50),
  customer_type VARCHAR(50),
  education VARCHAR(100),
  question_1_value INTEGER,  -- NPS value (0-10)
  question_1_category VARCHAR(20),  -- Promotor/Neutro/Detrator
  question_2_option VARCHAR(100),
  question_4_text TEXT,  -- Open question
  question_6_text TEXT,  -- Open question
  created_at TIMESTAMP,
  metadata JSONB
);
```

**Backend - Processamento de Filtros (Pseudocódigo):**

```python
# Exemplo Python (Flask/FastAPI)
def get_filtered_questions(filters, question_ids=None):
    # 1. Construir query baseado nos filtros
    query = build_filter_query(filters)

    # 2. Buscar dados brutos do banco
    raw_responses = db.query(RawResponse).filter(query).all()

    # 3. Agregar dados por questão
    questions_data = {}
    for response in raw_responses:
        # Processar cada questão
        process_question_responses(response, questions_data)

    # 4. Calcular estatísticas
    aggregated_questions = calculate_statistics(questions_data)

    # 5. Formatar resposta
    return format_response(aggregated_questions, filters)
```

### Exemplo 2: Resposta da API (Dados Agregados)

**Resposta quando há filtros aplicados:**

```json
{
  "questions": [
    {
      "id": 1,
      "index": 1,
      "question": "Qual é a probabilidade de você recomendar nossa empresa?",
      "type": "nps",
      "icon": "Percent",
      "summary": "Resumo filtrado para SP e Pós-pago...",
      "data": [
        { "option": "Detrator", "value": 100, "percentage": 50 },
        { "option": "Promotor", "value": 70, "percentage": 35 },
        { "option": "Neutro", "value": 30, "percentage": 15 }
      ],
      "total": 200
    },
    {
      "id": 4,
      "type": "open",
      "question": "O que mais gosta em nosso serviço?",
      "sentimentData": [
        {
          "category": "Suporte",
          "positive": 50,
          "neutral": 25,
          "negative": 25
        }
      ],
      "topCategories": [
        {
          "rank": 1,
          "category": "Qualidade do atendimento",
          "mentions": 200,
          "percentage": 38
        }
      ],
      "wordCloud": [{ "text": "qualidade", "value": 250 }]
    }
  ],
  "metadata": {
    "totalRespondents": 200,
    "appliedFilters": [
      { "filterType": "state", "values": ["SP"] },
      { "filterType": "customerType", "values": ["Pós-pago"] }
    ],
    "timestamp": "2024-10-15T12:00:00Z"
  }
}
```

**Resposta quando não há filtros (endpoint padrão):**

```json
{
  "questions": [
    {
      "id": 1,
      "index": 1,
      "question": "Qual é a probabilidade de você recomendar nossa empresa?",
      "type": "nps",
      "icon": "Percent",
      "summary": "Resumo geral...",
      "data": [
        { "option": "Detrator", "value": 636, "percentage": 51 },
        { "option": "Promotor", "value": 374, "percentage": 30 },
        { "option": "Neutro", "value": 237, "percentage": 19 }
      ],
      "total": 1247
    }
  ],
  "metadata": {
    "totalRespondents": 1247,
    "appliedFilters": [],
    "timestamp": "2024-10-15T12:00:00Z"
  }
}
```

### Exemplo 3: Integração Completa Frontend + Backend

**1. FilterPanel (Frontend) - Usuário seleciona filtros:**

```javascript
// FilterPanel.jsx
export function FilterPanel({ onFiltersChange }) {
  const [activeFilters, setActiveFilters] = useState([]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    onFiltersChange(newFilters); // Notifica componente pai
  };

  // ... UI do filtro
}
```

**2. QuestionsList (Frontend) - Usa hook para buscar dados:**

```javascript
// QuestionsList.jsx
import { useFilteredQuestions } from "@/hooks/useFilteredQuestions";

export function QuestionsList({
  externalFilterState = null,
  data: externalData = null,
}) {
  // Obter filtros do FilterPanel ou estado externo
  const activeFilters = externalFilterState?.filters || [];

  // Hook faz chamada à API automaticamente
  const {
    data: filteredData,
    loading,
    error,
  } = useFilteredQuestions(activeFilters);

  // Fallback para dados padrão se não há filtros
  const questions =
    filteredData?.questions || externalData?.responseDetails?.questions || [];

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  // Renderizar questões...
}
```

**3. Backend - Processa filtros e retorna dados:**

```python
# API endpoint (Python/FastAPI)
@app.get("/api/survey/questions/filtered")
async def get_filtered_questions(filters: str = None, question_ids: str = None):
    # Parse filtros
    filters_list = json.loads(filters) if filters else []

    # Buscar e filtrar dados brutos
    filtered_responses = filter_raw_responses(filters_list)

    # Agregar dados por questão
    questions_data = aggregate_by_question(filtered_responses, question_ids)

    # Retornar formato compatível
    return {
        "questions": questions_data,
        "metadata": {
            "totalRespondents": len(filtered_responses),
            "appliedFilters": filters_list,
            "timestamp": datetime.now().isoformat()
        }
    }
```

---

## ⚡ Considerações de Performance

### Backend

**Otimizações Recomendadas:**

1. **Índices no Banco de Dados**

   - Criar índices nas colunas usadas para filtros (`state`, `customer_type`, `education`)
   - Índices compostos para combinações frequentes

2. **Cache de Respostas**

   - Implementar cache (Redis, Memcached) para respostas frequentes
   - Cache por combinação de filtros
   - TTL adequado (ex: 5-15 minutos)

3. **Otimização de Queries**

   - Usar queries eficientes (evitar N+1 queries)
   - Considerar materialized views para agregações complexas
   - Paginação se necessário

4. **Processamento Assíncrono**
   - Para grandes volumes, considerar processamento assíncrono
   - Retornar job ID e permitir polling do status

### Frontend

**Otimizações Recomendadas:**

1. **React Query Cache**

   - Aproveitar cache automático do React Query
   - Configurar `staleTime` e `gcTime` adequadamente
   - Cache compartilhado entre componentes

2. **Debounce de Filtros**

   - Implementar debounce nas mudanças de filtros
   - Evitar múltiplas chamadas à API em rápida sucessão
   - Exemplo: aguardar 300-500ms após última mudança

3. **Loading States**

   - Mostrar feedback visual imediato
   - Skeleton loaders para melhor UX
   - Otimistic updates quando possível

4. **Error Handling**
   - Retry automático com backoff exponencial
   - Fallback para dados em cache em caso de erro
   - Mensagens de erro claras para o usuário

### Métricas de Performance

**Backend:**

- Tempo de resposta da API: < 500ms (p95)
- Throughput: suportar X requisições/segundo
- Uso de memória: monitorar durante picos

**Frontend:**

- Tempo até primeiro render: < 1s
- Tempo de carregamento completo: < 2s
- Responsividade da UI durante carregamento

---

## 🔄 Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO APLICA FILTROS                                   │
│    FilterPanel → setActiveFilters([...])                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. QUESTIONSLIST DETECTA MUDANÇA                            │
│    activeFilters muda → trigger re-render                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. HOOK useFilteredQuestions                                │
│    React Query detecta mudança em queryKey                 │
│    → queryKey: ["filteredQuestions", filters, ...]        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SERVICE fetchFilteredQuestions                           │
│    Constrói URL com filtros                                │
│    GET /api/survey/questions/filtered?filters=[...]        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Request
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND API ENDPOINT                                     │
│    /api/survey/questions/filtered                            │
│    - Recebe filtros                                         │
│    - Busca dados brutos do banco                            │
│    - Filtra por atributos                                   │
│    - Agrega por questão                                     │
│    - Calcula estatísticas                                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Response (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. HOOK RECEBE DADOS                                        │
│    React Query atualiza cache                               │
│    → data.questions = [...]                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. QUESTIONSLIST RENDERIZA                                 │
│    Usa questions do hook                                    │
│    → Renderiza gráficos, tabelas, etc                        │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo Sem Filtros (Compatibilidade)

```
1. QuestionsList carrega sem filtros
   ↓
2. Hook chama endpoint padrão: GET /api/survey/questions
   ↓
3. Backend retorna dados agregados padrão (sem filtros)
   ↓
4. Renderiza normalmente (compatível com estrutura atual)
```

---

## 📝 Checklist de Implementação

### Backend

- [ ] Criar estrutura de banco de dados para `raw_responses`
- [ ] Implementar endpoint `GET /api/survey/questions` (dados padrão)
- [ ] Implementar endpoint `GET /api/survey/questions/filtered` (com filtros)
- [ ] Implementar lógica de filtragem por atributos
- [ ] Implementar agregação de dados por questão
- [ ] Implementar cálculo de estatísticas (NPS, sentiment, etc)
- [ ] Adicionar cache de respostas (opcional, para performance)
- [ ] Adicionar tratamento de erros
- [ ] Adicionar validação de filtros
- [ ] Documentar API endpoints

### Frontend

- [ ] Criar hook `useFilteredQuestions` em `src/hooks/useFilteredQuestions.js`
- [ ] Criar service `fetchFilteredQuestions` em `src/services/surveyDataService.js`
- [ ] Atualizar `QuestionsList` para usar hook
- [ ] Conectar `FilterPanel` com `QuestionsList` (passar filtros)
- [ ] Adicionar loading states durante chamadas à API
- [ ] Adicionar tratamento de erros
- [ ] Adicionar fallback para dados padrão (sem filtros)
- [ ] Testar integração completa

### Testes

- [ ] Testar hook sem filtros (deve usar endpoint padrão)
- [ ] Testar hook com filtro único (estado, tipo de cliente, educação)
- [ ] Testar hook com combinações de filtros
- [ ] Testar loading states
- [ ] Testar tratamento de erros
- [ ] Testar performance com diferentes volumes de dados
- [ ] Testar cache do React Query

---

## 🎯 Recomendações Finais

### Para Implementação Inicial

1. **Comece com endpoint padrão** (`/api/survey/questions`) para manter compatibilidade
2. **Implemente endpoint de filtros** (`/api/survey/questions/filtered`) gradualmente
3. **Use React Query** para cache e gerenciamento de estado
4. **Mantenha fallback** para dados padrão quando não há filtros

### Para Escalabilidade

1. **Implemente cache no backend** para respostas frequentes
2. **Use paginação** se necessário para grandes volumes de dados
3. **Considere WebSockets** para atualizações em tempo real (opcional)
4. **Monitore performance** da API e otimize queries do banco
5. **Implemente rate limiting** para proteger a API

### Boas Práticas

1. **Validação de filtros**: Backend deve validar filtros recebidos
2. **Error handling**: Tratar erros de forma elegante no frontend
3. **Loading states**: Sempre mostrar feedback visual durante carregamento
4. **Debounce**: Considerar debounce nas chamadas à API (se filtros mudam muito rápido)
5. **TypeScript**: Usar TypeScript para type safety (opcional, mas recomendado)

---

## 📚 Referências

- Estrutura atual: `src/data/surveyData.json`
- Componente de questões: `src/components/survey/common/QuestionsList.jsx`
- Componente de filtros: `src/components/survey/components/FilterPanel.jsx`
- Documentação de estrutura: `docs/Doc_how-to_json.md`

---

**Última atualização**: 2024

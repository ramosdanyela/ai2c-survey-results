# Estratégia de Internacionalização e Estruturação de Dados

## 1. VISÃO GERAL

### Objetivos

- Transformar dados hardcoded em estrutura baseada em componentes/seções
- Suportar 4 idiomas diferentes (pt, en, es, it)
- Dados vindos de API via GET em formato JSON
- Textos de UI (cabeçalhos, fallbacks) em inglês
- Estrutura flexível que permite mudanças no relatório

## 2. ARQUITETURA DE DADOS

### 2.1 Estrutura JSON Principal

```json
{
  "metadata": {
    "language": "pt",                            // tipo: language
    "version": "1.0.0",                         // tipo: text
    "generatedAt": "2024-01-15T10:00:00Z",      // tipo: date
    "surveyId": "survey-123"                    // tipo: id
  },
  "surveyInfo": {
    "title": "...",                             // tipo: title
    "company": "...",                           // tipo: text
    "period": "...",                            // tipo: text
    "totalRespondents": 1247,                   // tipo: number
    "responseRate": 68.5,                       // tipo: percentage
    "nps": -21,                                 // tipo: number
    "npsCategory": "..."                        // tipo: option
  },
  "reportStructure": {
    "sections": [                               // tipo: array
      {
        "id": "executive",                      // tipo: id
        "type": "section",                      // tipo: option
        "name": "Relatório Executivo",          // tipo: title
        "icon": "FileText",                     // tipo: icon
        "order": 1,                             // tipo: number
        "subsections": [                        // tipo: array
          {
            "id": "executive-summary",          // tipo: id
            "type": "subsection",               // tipo: option
            "name": "Sumário Executivo",        // tipo: title
            "component": "ExecutiveSummary",    // tipo: option
            "order": 1,                         // tipo: number
            "data": { ... }                     // tipo: object
          },
          {
            "id": "executive-recommendations",  // tipo: id
            "type": "subsection",               // tipo: option
            "name": "Recomendações",            // tipo: title
            "component": "ExecutiveRecommendations", // tipo: option
            "order": 2,                         // tipo: number
            "data": { ... }                     // tipo: object
          }
        ]
      },
      {
        "id": "support",                        // tipo: id
        "type": "section",                      // tipo: option
        "name": "Análises de Suporte",          // tipo: title
        "icon": "BarChart3",                    // tipo: icon
        "order": 2,                             // tipo: number
        "subsections": [ ... ]                  // tipo: array
      }
    ]
  },
  "uiTexts": {
    "language": "pt",                            // tipo: language
    "translations": {                           // tipo: object
      "executiveReport": {                      // tipo: object
        "executiveSummary": "Sumário Executivo", // tipo: title
        "aboutStudy": "Sobre o Estudo",         // tipo: text
        ...
      },
      ...
    }
  }
}
```

### 2.2 Tipos de Componentes

1. **Section**: Container principal (ex: "Relatório Executivo")
2. **Subsection**: Subseção dentro de uma section (ex: "Sumário Executivo")
3. **Component**: Tipo de componente React a renderizar
   - `ExecutiveSummary`
   - `ExecutiveRecommendations`
   - `SentimentAnalysis`
   - `RespondentIntent`
   - `Segmentation`
   - `AttributeDeepDive`
   - `QuestionAnalysis`
   - `WordCloud`
   - `Chart`
   - `Table`

### 2.3 Estrutura de Dados por Componente

Cada subsection terá um campo `data` específico para seu componente:

```json
{
  "id": "executive-summary",
  "component": "ExecutiveSummary",
  "data": {
    "aboutStudy": "...",
    "mainFindings": "...",
    "conclusions": "..."
  }
}
```

### 2.4 Tipos de Dados

Os campos no JSON podem ter os seguintes tipos de dados:

#### Tipos de Dados Básicos

1. **text** (string)

   - Texto simples ou multiline
   - Exemplo: `"aboutStudy": "O objetivo do estudo..."` (tipo: text)
   - Usado para: descrições, parágrafos, conteúdo textual

2. **title** (string)

   - Título principal de seção ou componente
   - Exemplo: `"name": "Sumário Executivo"` (tipo: title)
   - Usado para: títulos de seções, subseções, cards

3. **subtitle** (string)

   - Subtítulo ou título secundário
   - Exemplo: `"subtitle": "Principais Descobertas"` (tipo: subtitle)
   - Usado para: subtítulos de seções, labels de cards

4. **number** (number)

   - Valor numérico (inteiro ou decimal)
   - Exemplo: `"totalRespondents": 1247` (tipo: number)
   - Usado para: contagens, percentuais, valores numéricos

5. **percentage** (number)

   - Percentual (0-100)
   - Exemplo: `"percentage": 51.0` (tipo: percentage)
   - Usado para: percentuais, taxas, proporções

6. **option** (string)

   - Opção de múltipla escolha ou categoria
   - Exemplo: `"option": "Detrator"` (tipo: option)
   - Usado para: opções de resposta, categorias, labels de dados

7. **id** (string)

   - Identificador único
   - Exemplo: `"id": "executive-summary"` (tipo: id)
   - Usado para: identificação de seções, componentes, itens

8. **icon** (string)

   - Nome do ícone (referência a biblioteca de ícones)
   - Exemplo: `"icon": "FileText"` (tipo: icon)
   - Usado para: ícones de seções, botões, cards

9. **date** (string ISO 8601)

   - Data no formato ISO 8601
   - Exemplo: `"generatedAt": "2024-01-15T10:00:00Z"` (tipo: date)
   - Usado para: datas de geração, períodos, timestamps

10. **language** (string)

    - Código de idioma (ISO 639-1)
    - Exemplo: `"language": "pt"` (tipo: language)
    - Valores permitidos: "pt", "en", "es", "it"

11. **url** (string)

    - URL ou caminho de recurso
    - Exemplo: `"imageUrl": "https://..."` (tipo: url)
    - Usado para: imagens, links, recursos externos

12. **boolean** (boolean)
    - Valor verdadeiro/falso
    - Exemplo: `"isVisible": true` (tipo: boolean)
    - Usado para: flags, configurações, estados

#### Tipos de Dados Estruturados

13. **array** (array)

    - Lista de itens
    - Exemplo: `"data": [{ "option": "...", "value": 636 }]` (tipo: array)
    - Usado para: listas de dados, opções, itens

14. **object** (object)

    - Objeto aninhado
    - Exemplo: `"responses": { "total": 1247, "data": [...] }` (tipo: object)
    - Usado para: estruturas complexas, agrupamentos

15. **chartData** (array of objects)

    - Dados específicos para gráficos
    - Exemplo: `"chartData": [{ "category": "...", "value": 10.5 }]` (tipo: chartData)
    - Usado para: dados de gráficos, visualizações

16. **tableData** (array of objects)

    - Dados específicos para tabelas
    - Exemplo: `"tableData": [{ "column1": "...", "column2": 123 }]` (tipo: tableData)
    - Usado para: dados tabulares, listas estruturadas

17. **wordCloudData** (array of objects)

    - Dados para nuvem de palavras
    - Exemplo: `"wordCloud": [{ "text": "confiabilidade", "value": 51 }]` (tipo: wordCloudData)
    - Usado para: nuvens de palavras, frequências

18. **sentimentData** (array of objects)

    - Dados de análise de sentimento
    - Exemplo: `"sentimentData": [{ "category": "...", "positive": 10.5, "negative": 38.1 }]` (tipo: sentimentData)
    - Usado para: análises de sentimento, categorias com polaridade

19. **npsData** (array of objects)

    - Dados de NPS (Net Promoter Score)
    - Exemplo: `"nps": [{ "segment": "Controle", "nps": -22.8 }]` (tipo: npsData)
    - Usado para: métricas NPS, distribuições de promotores/detratores

20. **distributionData** (array of objects)
    - Dados de distribuição
    - Exemplo: `"distribution": [{ "segment": "Pré-pago", "count": 37, "percentage": 37.0 }]` (tipo: distributionData)
    - Usado para: distribuições, segmentações, proporções

#### Especificação de Tipos por Campo

**metadata:**

- `language`: language
- `version`: text
- `generatedAt`: date
- `surveyId`: id

**surveyInfo:**

- `title`: title
- `company`: text
- `period`: text
- `totalRespondents`: number
- `responseRate`: percentage
- `nps`: number
- `npsCategory`: option

**reportStructure.sections:**

- `id`: id
- `type`: option (valores: "section", "subsection")
- `name`: title
- `icon`: icon
- `order`: number

**reportStructure.sections[].subsections:**

- `id`: id
- `type`: option (valores: "section", "subsection")
- `name`: title
- `component`: option (valores: "ExecutiveSummary", "ExecutiveRecommendations", "SentimentAnalysis", etc.)
- `order`: number
- `data`: object (estrutura varia por componente)

**data (ExecutiveSummary):**

- `aboutStudy`: text
- `mainFindings`: text
- `conclusions`: text

**data (ExecutiveRecommendations):**

- `recommendations`: array of objects
  - `id`: number
  - `recommendation`: text
  - `severity`: option (valores: "critical", "high", "medium", "low")
  - `stakeholders`: array of text

**data (QuestionAnalysis):**

- `questionId`: number
- `question`: text
- `type`: option (valores: "nps", "open", "closed", "multipleChoice")
- `summary`: text
- `responses`: object
  - `total`: number
  - `data`: array of objects
    - `option`: option
    - `value`: number
    - `percentage`: percentage

**data (AttributeDeepDive):**

- `attributeId`: id
- `summary`: text
- `distribution`: distributionData
- `sentiment`: sentimentData
- `nps`: npsData
- `npsDistribution`: array of objects
- `positiveCategories`: chartData
- `negativeCategories`: chartData

**data (SentimentAnalysis):**

- `description`: text
- `data`: sentimentData

**data (RespondentIntent):**

- `description`: text
- `data`: array of objects
  - `intent`: option
  - `percentage`: percentage
  - `count`: number

**data (Segmentation):**

- `segmentation`: array of objects
  - `cluster`: title
  - `description`: text
  - `percentage`: percentage
  - `id`: number (ou null)
  - `characteristics`: array of text

**data (WordCloud):**

- `wordCloud`: wordCloudData

## 3. SISTEMA DE INTERNACIONALIZAÇÃO

### 3.1 Estratégia de Idiomas

**Idiomas suportados:**

- `pt`: Português
- `en`: Inglês
- `es`: Espanhol
- `it`: Italiano

### 3.2 Identificação de Idioma

1. **No JSON da API**: Campo `metadata.language` identifica o idioma do relatório
2. **Textos de UI**: Sempre em inglês (fallback)
3. **Dados do relatório**: No idioma especificado em `metadata.language`

### 3.3 Estrutura de Textos

**Textos de UI (sempre inglês):**

- Armazenados localmente no código
- Fallback para casos de erro
- Exemplos: "Loading...", "Error", "No data available"

**Textos do relatório:**

- Vêm no JSON da API
- Já traduzidos no idioma correto
- Incluem: títulos, descrições, labels, etc.

### 3.4 Arquivo de Traduções UI

```javascript
// src/lib/uiTranslations.js
export const uiTranslations = {
  "en": {
    loading: "Loading...",
    error: "Error",
    noData: "No data available",
    ...
  },
  "pt": { ... },
  "es": { ... },
  "it": { ... }
};
```

## 4. ESTRUTURA DE COMPONENTES

### 4.1 Mapeamento Component → React Component

```javascript
const componentMap = {
  ExecutiveSummary: ExecutiveReport,
  ExecutiveRecommendations: ExecutiveReport,
  SentimentAnalysis: SupportAnalysis,
  RespondentIntent: SupportAnalysis,
  Segmentation: SupportAnalysis,
  AttributeDeepDive: AttributeDeepDive,
  QuestionAnalysis: ResponseDetails,
  WordCloud: WordCloud,
  Chart: Chart,
  Table: Table,
};
```

### 4.2 Renderização Dinâmica

O `ContentRenderer` será modificado para:

1. Ler a estrutura do JSON
2. Identificar o componente baseado no `component` field
3. Passar os dados específicos para o componente
4. Renderizar dinamicamente

## 5. FLUXO DE DADOS

### 5.1 Carregamento Inicial

1. App faz GET para API: `/api/survey/{surveyId}?language={lang}`
2. API retorna JSON completo com:
   - `metadata.language`: Idioma do relatório
   - `reportStructure`: Estrutura completa
   - `uiTexts`: Textos traduzidos (opcional, pode vir no reportStructure)
3. App armazena dados em Context/State
4. Componentes consomem dados do Context

### 5.2 Context Provider

```javascript
// src/contexts/SurveyDataContext.jsx
const SurveyDataContext = createContext();

export function SurveyDataProvider({ children }) {
  const [surveyData, setSurveyData] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para carregar dados
  const loadSurveyData = async (surveyId, lang) => {
    // GET request
  };

  return (
    <SurveyDataContext.Provider
      value={{ surveyData, language, loading, error, loadSurveyData }}
    >
      {children}
    </SurveyDataContext.Provider>
  );
}
```

## 6. ESTRUTURA JSON DETALHADA

### 6.1 Exemplo Completo - Executive Summary

```json
{
  "id": "executive-summary", // tipo: id
  "type": "subsection", // tipo: option
  "name": "Sumário Executivo", // tipo: title
  "component": "ExecutiveSummary", // tipo: option
  "order": 1, // tipo: number
  "data": {
    "aboutStudy": "O objetivo do estudo...", // tipo: text
    "mainFindings": "O Net Promoter Score...", // tipo: text
    "conclusions": "Foco urgente na infraestrutura..." // tipo: text
  }
}
```

### 6.2 Exemplo - Question Analysis

```json
{
  "id": "responses-1", // tipo: id
  "type": "subsection", // tipo: option
  "name": "Q1: Qual é a probabilidade...", // tipo: title
  "component": "QuestionAnalysis", // tipo: option
  "order": 5, // tipo: number
  "data": {
    "questionId": 1, // tipo: number
    "question": "Qual é a probabilidade...", // tipo: text
    "type": "nps", // tipo: option
    "summary": "Com 51% dos entrevistados...", // tipo: text
    "responses": {
      // tipo: object
      "total": 1247, // tipo: number
      "data": [
        // tipo: array
        {
          "option": "Detrator", // tipo: option
          "value": 636, // tipo: number
          "percentage": 51.0 // tipo: percentage
        }
      ]
    }
  }
}
```

### 6.3 Exemplo - Attribute Deep Dive

```json
{
  "id": "attributes-customerType", // tipo: id
  "type": "subsection", // tipo: option
  "name": "Tipo de Cliente", // tipo: title
  "component": "AttributeDeepDive", // tipo: option
  "order": 4, // tipo: number
  "data": {
    "attributeId": "customerType", // tipo: id
    "summary": "O NPS negativo geral...", // tipo: text
    "distribution": [
      // tipo: distributionData
      {
        "segment": "Pré-pago", // tipo: option
        "count": 37, // tipo: number
        "percentage": 37.0 // tipo: percentage
      }
    ],
    "sentiment": [
      // tipo: sentimentData
      {
        "segment": "Controle", // tipo: option
        "positive": 24.3, // tipo: percentage
        "neutral": 0.7, // tipo: percentage
        "negative": 75.0 // tipo: percentage
      }
    ],
    "nps": [
      // tipo: npsData
      {
        "segment": "Controle", // tipo: option
        "nps": -22.8 // tipo: number
      }
    ]
  }
}
```

### 6.4 Exemplo - Sentiment Analysis

```json
{
  "id": "support-sentiment", // tipo: id
  "type": "subsection", // tipo: option
  "name": "Análise de Sentimento", // tipo: title
  "component": "SentimentAnalysis", // tipo: option
  "order": 1, // tipo: number
  "data": {
    "description": "A análise de sentimento...", // tipo: text
    "data": [
      // tipo: sentimentData
      {
        "category": "Serviço de rede", // tipo: option
        "positive": 10.5, // tipo: percentage
        "neutral": 51.4, // tipo: percentage
        "negative": 38.1 // tipo: percentage
      }
    ]
  }
}
```

### 6.5 Exemplo - Word Cloud

```json
{
  "id": "responses-2-wordcloud", // tipo: id
  "type": "subsection", // tipo: option
  "name": "Nuvem de Palavras", // tipo: title
  "component": "WordCloud", // tipo: option
  "order": 2, // tipo: number
  "data": {
    "wordCloud": [
      // tipo: wordCloudData
      {
        "text": "confiabilidade", // tipo: text
        "value": 51 // tipo: number
      },
      {
        "text": "rede", // tipo: text
        "value": 48 // tipo: number
      }
    ]
  }
}
```

## 7. ESTRATÉGIA DE MIGRAÇÃO

### 7.1 Princípios de Migração

A migração deve seguir os seguintes princípios:

1. **Zero Downtime**: Sistema deve continuar funcionando durante a migração
2. **Compatibilidade Retroativa**: Suportar dados antigos e novos simultaneamente
3. **Rollback Seguro**: Possibilidade de reverter mudanças rapidamente
4. **Validação Contínua**: Validar dados em cada etapa
5. **Monitoramento**: Acompanhar métricas e erros em tempo real
6. **Comunicação**: Informar stakeholders sobre progresso e mudanças

### 7.2 Estratégia de Migração Gradual

#### Fase 1: Preparação (Semana 1-2)

1. **Análise e Documentação**

   - Mapear todos os dados atuais em `surveyData.js`
   - Documentar estrutura atual vs. nova estrutura
   - Identificar dependências e pontos críticos
   - Criar checklist de validação

2. **Criação de Ferramentas**

   - Função de transformação de dados
   - Validador de schema JSON
   - Scripts de migração de dados
   - Ferramentas de comparação (old vs. new)

3. **Ambiente de Testes**
   - Criar ambiente de staging
   - Configurar testes automatizados
   - Preparar dados de teste

#### Fase 2: Implementação Paralela (Semana 3-4)

1. **Feature Flag**

   ```javascript
   // src/lib/featureFlags.js
   export const FEATURE_FLAGS = {
     USE_NEW_DATA_STRUCTURE: process.env.REACT_APP_USE_NEW_STRUCTURE === "true",
     USE_API_DATA: process.env.REACT_APP_USE_API_DATA === "true",
   };
   ```

2. **Modo Dual (Dual Mode)**

   - Sistema suporta dados antigos E novos
   - Detecção automática do formato
   - Transformação on-the-fly se necessário

   ```javascript
   // src/lib/dataAdapter.js
   export function adaptData(data) {
     // Detecta se é formato antigo ou novo
     if (isOldFormat(data)) {
       return transformToNewStructure(data);
     }
     return data;
   }
   ```

3. **Context Provider com Fallback**
   ```javascript
   export function SurveyDataProvider({ children }) {
     const [surveyData, setSurveyData] = useState(null);
     const [dataSource, setDataSource] = useState("local"); // 'local' | 'api'

     const loadData = async () => {
       if (FEATURE_FLAGS.USE_API_DATA) {
         try {
           const apiData = await fetchFromAPI();
           setSurveyData(adaptData(apiData));
           setDataSource("api");
         } catch (error) {
           // Fallback para dados locais
           const localData = await import("@/data/surveyData");
           setSurveyData(adaptData(localData));
           setDataSource("local");
         }
       } else {
         const localData = await import("@/data/surveyData");
         setSurveyData(adaptData(localData));
         setDataSource("local");
       }
     };
   }
   ```

#### Fase 3: Migração Incremental (Semana 5-8)

1. **Migração por Componente**

   - Migrar um componente por vez
   - Testar cada componente isoladamente
   - Validar renderização e dados

2. **A/B Testing**

   - Comparar renderização antiga vs. nova
   - Validar que dados são idênticos
   - Verificar performance

3. **Validação de Dados**
   ```javascript
   // src/lib/dataValidator.js
   export function validateDataStructure(data) {
     const schema = require("./schema.json");
     const Ajv = require("ajv");
     const ajv = new Ajv();
     const validate = ajv.compile(schema);

     const valid = validate(data);
     if (!valid) {
       console.error("Validation errors:", validate.errors);
       return false;
     }
     return true;
   }
   ```

#### Fase 4: Rollout Gradual (Semana 9-12)

1. **Canary Deployment**

   - 10% dos usuários → nova estrutura
   - Monitorar erros e performance
   - Aumentar gradualmente: 25% → 50% → 100%

2. **Monitoramento**

   - Logs de erros
   - Métricas de performance
   - Taxa de sucesso de carregamento
   - Tempo de resposta da API

3. **Rollback Automático**
   ```javascript
   // Se taxa de erro > 5%, volta para estrutura antiga
   if (errorRate > 0.05) {
     setDataSource("local");
     notifyTeam("Rollback triggered");
   }
   ```

### 7.3 Compatibilidade Retroativa

#### Adapter Pattern

```javascript
// src/lib/dataAdapters/oldDataAdapter.js
export function adaptOldData(oldData) {
  return {
    metadata: {
      language: detectLanguage(oldData) || "pt",
      version: "1.0.0",
      generatedAt: new Date().toISOString(),
      surveyId: oldData.surveyId || "default",
    },
    surveyInfo: oldData.surveyInfo,
    reportStructure: transformStructure(oldData),
  };
}

// src/lib/dataAdapters/newDataAdapter.js
export function adaptNewData(newData) {
  // Valida e normaliza dados novos
  if (!validateDataStructure(newData)) {
    throw new Error("Invalid data structure");
  }
  return normalizeData(newData);
}

// src/lib/dataAdapters/index.js
export function adaptData(data) {
  if (isOldFormat(data)) {
    return adaptOldData(data);
  } else if (isNewFormat(data)) {
    return adaptNewData(data);
  } else {
    throw new Error("Unknown data format");
  }
}
```

### 7.4 Versionamento

#### Versionamento de API

```javascript
// API suporta múltiplas versões
GET /api/survey/{surveyId}?version=1&language=pt  // Formato antigo
GET /api/survey/{surveyId}?version=2&language=pt  // Formato novo (padrão)
```

#### Versionamento de Dados

```json
{
  "metadata": {
    "version": "2.0.0", // Semver: major.minor.patch
    "dataFormat": "v2", // Formato específico
    "migrationVersion": "1.0.0" // Versão da migração aplicada
  }
}
```

### 7.5 Validação e Testes

#### Testes Unitários

```javascript
// src/lib/__tests__/dataTransform.test.js
describe("Data Transformation", () => {
  it("should transform old format to new format", () => {
    const oldData = require("@/data/surveyData");
    const newData = transformToNewStructure(oldData);
    expect(validateDataStructure(newData)).toBe(true);
  });

  it("should preserve all data during transformation", () => {
    const oldData = require("@/data/surveyData");
    const newData = transformToNewStructure(oldData);
    expect(newData.surveyInfo).toEqual(oldData.surveyInfo);
  });
});
```

#### Testes de Integração

```javascript
// Testa renderização com dados novos
describe("Component Rendering", () => {
  it("should render ExecutiveReport with new data structure", () => {
    const newData = generateTestData("new");
    render(<ExecutiveReport data={newData} />);
    expect(screen.getByText("Sumário Executivo")).toBeInTheDocument();
  });
});
```

#### Testes de Regressão

- Comparar screenshots (visual regression)
- Validar que todos os dados são exibidos
- Verificar que não há dados perdidos na migração

### 7.6 Monitoramento e Métricas

#### Métricas a Monitorar

1. **Performance**

   - Tempo de carregamento de dados
   - Tempo de renderização
   - Tamanho do bundle

2. **Erros**

   - Taxa de erro de carregamento
   - Erros de validação
   - Erros de renderização

3. **Uso**
   - Quantidade de requisições à API
   - Cache hit rate
   - Formato de dados mais usado

#### Logging

```javascript
// src/lib/logger.js
export function logMigrationEvent(event, data) {
  console.log({
    timestamp: new Date().toISOString(),
    event,
    dataSource: data.source,
    dataFormat: data.format,
    language: data.language,
    version: data.version,
  });

  // Enviar para serviço de monitoramento
  if (window.analytics) {
    window.analytics.track("migration_event", {
      event,
      ...data,
    });
  }
}
```

### 7.7 Plano de Contingência

#### Cenários de Rollback

1. **Erro Crítico**

   - Taxa de erro > 5%
   - Dados corrompidos detectados
   - Performance degradada > 50%

2. **Procedimento de Rollback**

   ```javascript
   // src/lib/rollback.js
   export function rollbackToOldStructure() {
     // 1. Desabilitar feature flag
     localStorage.setItem("USE_NEW_STRUCTURE", "false");

     // 2. Limpar cache
     clearDataCache();

     // 3. Recarregar dados antigos
     window.location.reload();

     // 4. Notificar equipe
     notifyTeam("Rollback executed");
   }
   ```

3. **Comunicação**
   - Notificar stakeholders imediatamente
   - Documentar motivo do rollback
   - Criar plano de correção

### 7.8 Migração de Dados Existentes

#### Script de Migração

```javascript
// scripts/migrateData.js
import { transformToNewStructure } from "../src/lib/dataTransform";
import { validateDataStructure } from "../src/lib/dataValidator";
import { writeFile } from "fs/promises";

async function migrateDataFile(inputPath, outputPath) {
  // 1. Ler dados antigos
  const oldData = require(inputPath);

  // 2. Transformar
  const newData = transformToNewStructure(oldData);

  // 3. Validar
  if (!validateDataStructure(newData)) {
    throw new Error("Validation failed");
  }

  // 4. Salvar
  await writeFile(outputPath, JSON.stringify(newData, null, 2));

  console.log(`Migration successful: ${inputPath} → ${outputPath}`);
}

// Migrar todos os arquivos
migrateDataFile("./src/data/surveyData.js", "./src/data/surveyData.v2.json");
```

#### Backup e Versionamento

1. **Backup Antes de Migrar**

   ```bash
   # Criar backup dos dados originais
   cp src/data/surveyData.js src/data/surveyData.backup.js
   git tag data-backup-$(date +%Y%m%d)
   ```

2. **Versionamento Git**
   - Branch separada para migração
   - Commits incrementais
   - Tags de versão

### 7.9 Documentação

#### Documentação Técnica

1. **Guia de Migração**

   - Passo a passo da migração
   - Troubleshooting comum
   - FAQ

2. **Changelog**

   - Mudanças na estrutura
   - Breaking changes
   - Novos recursos

3. **API Documentation**
   - Endpoints disponíveis
   - Formatos suportados
   - Exemplos de uso

### 7.10 Timeline Sugerida

| Fase                   | Duração        | Atividades                          |
| ---------------------- | -------------- | ----------------------------------- |
| Preparação             | 2 semanas      | Análise, documentação, ferramentas  |
| Implementação Paralela | 2 semanas      | Feature flags, dual mode, adapters  |
| Migração Incremental   | 4 semanas      | Migração por componente, testes     |
| Rollout Gradual        | 4 semanas      | Canary, monitoramento, 100% rollout |
| **Total**              | **12 semanas** | ~3 meses                            |

### 7.11 Checklist de Migração

- [ ] Análise completa dos dados atuais
- [ ] Documentação da nova estrutura
- [ ] Criação de função de transformação
- [ ] Validador de schema implementado
- [ ] Feature flags configuradas
- [ ] Modo dual implementado
- [ ] Testes unitários criados
- [ ] Testes de integração criados
- [ ] Ambiente de staging configurado
- [ ] Monitoramento configurado
- [ ] Plano de rollback documentado
- [ ] Backup dos dados originais
- [ ] Comunicação com stakeholders
- [ ] Migração incremental por componente
- [ ] Validação de dados em cada etapa
- [ ] Canary deployment
- [ ] Rollout gradual (10% → 100%)
- [ ] Documentação atualizada
- [ ] Treinamento da equipe

## 8. VALIDAÇÃO E ERROS

### 8.1 Validação de Schema

Usar JSON Schema para validar estrutura:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["metadata", "surveyInfo", "reportStructure"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["language"],
      "properties": {
        "language": {
          "type": "string",
          "enum": ["pt", "en", "es", "it"]
        }
      }
    }
  }
}
```

### 8.2 Fallbacks

- Se idioma não suportado → usar inglês
- Se componente não encontrado → mostrar mensagem de erro
- Se dados faltando → mostrar "No data available"

## 9. IMPLEMENTAÇÃO

### Fase 1: Estrutura Base e Preparação

1. **Análise e Documentação**

   - Mapear todos os dados atuais
   - Documentar estrutura atual vs. nova
   - Criar checklist de validação

2. **Ferramentas Base**

   - Criar `SurveyDataContext` com suporte dual
   - Criar estrutura JSON de exemplo
   - Criar função de transformação (`dataTransform.js`)
   - Criar validador de schema (`dataValidator.js`)
   - Criar adapters para compatibilidade (`dataAdapters/`)

3. **Feature Flags**
   - Implementar sistema de feature flags
   - Configurar variáveis de ambiente
   - Criar utilitários de detecção de formato

### Fase 2: Implementação Paralela (Dual Mode)

1. **Modo Dual**

   - Implementar detecção automática de formato
   - Criar adapters (old/new)
   - Implementar transformação on-the-fly
   - Suportar dados antigos e novos simultaneamente

2. **Context Provider**

   - Modificar `SurveyDataContext` para suportar dual mode
   - Implementar fallback automático
   - Adicionar logging de eventos

3. **Testes Base**
   - Testes unitários de transformação
   - Testes de validação de schema
   - Testes de adapters

### Fase 3: Componentes Dinâmicos

1. **Renderização Dinâmica**

   - Modificar `ContentRenderer` para renderização dinâmica
   - Criar mapeamento de componentes
   - Implementar detecção de componente baseado em `data.component`

2. **Adaptação de Componentes**

   - Adaptar componentes existentes para nova estrutura
   - Manter compatibilidade com estrutura antiga
   - Adicionar props condicionais

3. **Testes de Componentes**
   - Testes de renderização com dados novos
   - Testes de compatibilidade com dados antigos
   - Testes de regressão visual

### Fase 4: Internacionalização

1. **Sistema de Traduções**

   - Criar arquivo de traduções UI (`uiTranslations.js`)
   - Implementar detecção de idioma
   - Adicionar fallbacks para inglês
   - Suportar 4 idiomas (pt, en, es, it)

2. **Integração com Dados**
   - Ler idioma de `metadata.language`
   - Aplicar traduções de UI baseado no idioma
   - Validar idiomas suportados

### Fase 5: API Integration

1. **Service Layer**

   - Criar service para chamadas API (`surveyService.js`)
   - Implementar cache de dados
   - Adicionar retry logic
   - Implementar versionamento de API

2. **Estados e Erros**

   - Implementar loading states
   - Implementar error handling robusto
   - Adicionar estados de fallback
   - Implementar rollback automático

3. **Monitoramento**
   - Configurar logging de eventos
   - Implementar métricas de performance
   - Adicionar alertas para erros críticos

### Fase 6: Migração Incremental

1. **Migração por Componente**

   - Migrar um componente por vez
   - Validar cada migração
   - Testar isoladamente

2. **Validação Contínua**
   - Comparar dados antigos vs. novos
   - Validar que nada foi perdido
   - Verificar performance

### Fase 7: Rollout Gradual

1. **Canary Deployment**

   - 10% → 25% → 50% → 100%
   - Monitorar métricas em cada etapa
   - Rollback automático se necessário

2. **Monitoramento e Ajustes**
   - Acompanhar logs e métricas
   - Ajustar conforme necessário
   - Documentar problemas e soluções

### Fase 8: Finalização

1. **Limpeza**

   - Remover código legado (após validação)
   - Remover feature flags antigas
   - Otimizar bundle

2. **Documentação**

   - Atualizar documentação técnica
   - Criar guias de uso
   - Documentar lições aprendidas

3. **Treinamento**
   - Treinar equipe na nova estrutura
   - Compartilhar conhecimento
   - Estabelecer processos

## 10. RISCOS E MITIGAÇÕES

### 10.1 Riscos Identificados

| Risco                            | Impacto | Probabilidade | Mitigação                                                |
| -------------------------------- | ------- | ------------- | -------------------------------------------------------- |
| Perda de dados na migração       | Alto    | Média         | Backup completo, validação rigorosa, testes comparativos |
| Quebra de compatibilidade        | Alto    | Baixa         | Modo dual, adapters, testes de regressão                 |
| Performance degradada            | Médio   | Baixa         | Monitoramento, otimização, cache                         |
| Erros de renderização            | Médio   | Média         | Testes visuais, validação de schema, fallbacks           |
| Problemas de internacionalização | Médio   | Baixa         | Validação de idiomas, fallback para inglês               |
| Falha na API                     | Alto    | Baixa         | Fallback para dados locais, retry logic, cache           |
| Rollback necessário              | Alto    | Baixa         | Plano de rollback documentado, feature flags             |

### 10.2 Estratégias de Mitigação

1. **Validação Rigorosa**

   - Schema validation em cada etapa
   - Comparação de dados antes/depois
   - Testes automatizados extensivos

2. **Backup e Versionamento**

   - Backup completo antes de qualquer mudança
   - Versionamento Git com tags
   - Possibilidade de restaurar versão anterior

3. **Monitoramento Proativo**

   - Alertas em tempo real
   - Dashboards de métricas
   - Logs detalhados

4. **Comunicação**
   - Status updates regulares
   - Documentação clara
   - Treinamento da equipe

## 11. CONSIDERAÇÕES FINAIS

### 11.1 Benefícios da Nova Estrutura

- **Flexibilidade**: Estrutura permite adicionar/remover seções sem mudar código
- **Manutenibilidade**: Dados separados da lógica
- **Escalabilidade**: Fácil adicionar novos idiomas e componentes
- **Performance**: Carregar apenas dados necessários, cache inteligente
- **Type Safety**: Preparado para TypeScript no futuro
- **Testabilidade**: Estrutura facilita testes automatizados
- **Internacionalização**: Suporte nativo a múltiplos idiomas

### 11.2 Próximos Passos Recomendados

1. **Curto Prazo (1-3 meses)**

   - Implementar migração seguindo estratégia documentada
   - Validar com dados reais
   - Monitorar performance e erros

2. **Médio Prazo (3-6 meses)**

   - Otimizar performance
   - Adicionar novos idiomas se necessário
   - Expandir funcionalidades baseadas em feedback

3. **Longo Prazo (6+ meses)**
   - Considerar migração para TypeScript
   - Implementar cache mais sofisticado
   - Adicionar suporte a mais formatos de dados

### 11.3 Lições Aprendidas

- Documentar durante o processo
- Testar incrementalmente
- Manter compatibilidade retroativa
- Monitorar continuamente
- Comunicar proativamente

# 📊 Guia de Organização de Dados - surveyData.js

Este documento explica como organizar os dados no arquivo `surveyData.js` para que sejam corretamente plotados nos componentes da aplicação.

---

## 📋 Índice

1. [Estrutura Geral](#estrutura-geral)
2. [1. surveyInfo - Metadados da Pesquisa](#1-surveyinfo---metadados-da-pesquisa)
3. [2. executiveReport - Relatório Executivo](#2-executivereport---relatório-executivo)
4. [3. supportAnalysis - Análises de Suporte](#3-supportanalysis---análises-de-suporte)
5. [4. responseDetails - Detalhes das Respostas](#4-responsedetails---detalhes-das-respostas)
6. [5. attributeDeepDive - Aprofundamento por Atributos](#5-attributedeepdive---aprofundamento-por-atributos)
7. [6. implementationPlan - Plano de Implementação](#6-implementationplan---plano-de-implementação)
8. [Tipos e Constantes](#tipos-e-constantes)
9. [Boas Práticas](#boas-práticas)

---

## Estrutura Geral

O arquivo `surveyData.js` deve exportar os seguintes objetos principais:

```javascript
export const surveyInfo = { ... }
export const executiveReport = { ... }
export const supportAnalysis = { ... }
export const responseDetails = { ... }
export const attributeDeepDive = { ... }
export const implementationPlan = { ... }
export const severityLabels = { ... }
```

**Nota**: Este arquivo foi migrado de TypeScript para JavaScript. Não há mais tipos TypeScript (`SeverityLevel`), apenas constantes.

---

## 1. surveyInfo - Metadados da Pesquisa

### 📍 Localização

Usado em: `SurveySidebar`, `ResponseDetails`

### 📐 Estrutura

```javascript
export const surveyInfo = {
  title: string, // Título da pesquisa
  company: string, // Nome da empresa
  period: string, // Período da pesquisa (ex: "Outubro - Novembro 2024")
  totalRespondents: number, // Total de respondentes
  responseRate: number, // Taxa de resposta em porcentagem (ex: 68.5)
  nps: number, // Score NPS (ex: 47)
  npsCategory: string, // Categoria do NPS (ex: "Bom")
};
```

### ✅ Exemplo

```javascript
export const surveyInfo = {
  title: "Pesquisa de Satisfação do Cliente 2024",
  company: "TechCorp Brasil",
  period: "Outubro - Novembro 2024",
  totalRespondents: 1247,
  responseRate: 68.5,
  nps: 47,
  npsCategory: "Bom",
};
```

### 📊 Como é Plotado

- **Título**: Exibido na sidebar
- **NPS**: Exibido em gráfico de barra e badge na seção de questões NPS

---

## 2. executiveReport - Relatório Executivo

### 📍 Localização

Usado em: `ExecutiveReport`

### 📐 Estrutura

```javascript
export const executiveReport = {
  summary: {
    aboutStudy: string,      // Texto sobre o estudo (pode ter quebras de linha \n)
    mainFindings: string,    // Principais descobertas (pode ter quebras de linha \n)
    conclusions: string,     // Conclusões (pode ter quebras de linha \n)
  },
  recommendations: [
    {
      id: number,                    // ID único (1, 2, 3...)
      recommendation: string,        // Texto da recomendação
      severity: string,              // "critical" | "high" | "medium" | "low"
      stakeholders: string[],         // Array de áreas responsáveis
    },
  ],
};
```

### ✅ Exemplo

```javascript
export const executiveReport = {
  summary: {
    aboutStudy: `Este estudo foi conduzido entre outubro e novembro de 2024...
A pesquisa abrangeu 1.247 respondentes...`,
    mainFindings: `Os resultados indicam um NPS de 47 pontos...`,
    conclusions: `A TechCorp Brasil demonstra uma trajetória positiva...`,
  },
  recommendations: [
    {
      id: 1,
      recommendation: "Implementar sistema de tickets com SLA garantido",
      severity: "critical",
      stakeholders: ["TI", "Suporte", "Operações"],
    },
    // ... mais recomendações
  ],
};
```

### 📊 Como é Plotado

- **Summary**: Texto formatado em cards
- **Recommendations**: Tabela com badges de severidade e stakeholders

### ⚠️ Importante

- Os valores de `severity` devem ser strings: "critical", "high", "medium" ou "low"
- Os `id` devem ser únicos e sequenciais
- Quebras de linha (`\n`) no texto são preservadas e renderizadas

---

## 3. supportAnalysis - Análises de Suporte

### 📍 Localização

Usado em: `SupportAnalysis`

### 📐 Estrutura

```javascript
export const supportAnalysis = {
  sentimentAnalysis: {
    description: string,     // Descrição da análise (pode ter quebras de linha \n)
    data: [
      {
        category: string,    // Nome da categoria
        positive: number,    // Porcentagem positiva (0-100)
        neutral: number,     // Porcentagem neutra (0-100)
        negative: number,    // Porcentagem negativa (0-100)
      },
    ],
  },
  respondentIntent: {
    description: string,     // Descrição da intenção (pode ter quebras de linha \n)
    data: [
      {
        intent: string,      // Nome da intenção (deve conter "NPS" para categorias NPS)
        percentage: number, // Porcentagem (0-100)
        count: number,      // Quantidade absoluta
      },
    ],
  },
  segmentation: [
    {
      cluster: string,      // Nome do cluster
      description: string,  // Descrição (pode ter quebras de linha \n)
      percentage: number,    // Porcentagem (0-100)
      characteristics: string[], // Array de características
    },
  ],
};
```

### ✅ Exemplo

```javascript
export const supportAnalysis = {
  sentimentAnalysis: {
    description: `A análise de sentimento foi realizada...`,
    data: [
      { category: "Atendimento", positive: 65, neutral: 20, negative: 15 },
      {
        category: "Qualidade do Produto",
        positive: 72,
        neutral: 18,
        negative: 10,
      },
      // ... mais categorias
    ],
  },
  respondentIntent: {
    description: `A intenção dos respondentes foi categorizada...`,
    data: [
      { intent: "Promotores (NPS 9-10)", percentage: 52, count: 649 },
      { intent: "Neutros (NPS 7-8)", percentage: 25, count: 312 },
      { intent: "Detratores (NPS 0-6)", percentage: 23, count: 286 },
      { intent: "Intenção de Recompra Alta", percentage: 68, count: 848 },
      // ... mais intenções
    ],
  },
  segmentation: [
    {
      cluster: "Entusiastas",
      description: `Clientes altamente satisfeitos...`,
      percentage: 42,
      characteristics: [
        "NPS médio: 9.2",
        "Ticket médio: R$ 2.800",
        "Tempo de cliente: 3+ anos",
      ],
    },
    // ... mais clusters
  ],
};
```

### 📊 Como é Plotado

#### sentimentAnalysis

- **Gráfico**: Barra divergente (horizontal)
- **Eixo Y**: Categorias
- **Eixo X**: Porcentagens (negativo à esquerda, positivo à direita)
- **Barras empilhadas**: negative (vermelho), neutral (cinza), positive (verde)

#### respondentIntent

- **Gráfico NPS**: Barra empilhada 100% (Detratores/Neutros/Promotores)
- **Gráfico Outras Intenções**: Barras horizontais com porcentagens
- **Filtro**: Itens com "NPS" no nome são agrupados separadamente

#### segmentation

- **Cards**: Um card por cluster com barra de progresso
- **Cores**: Verde (Entusiastas), Amarelo (Neutros), Vermelho (Críticos)

### ⚠️ Importante

- **Porcentagens devem somar 100%** para cada categoria em `sentimentAnalysis`
- **Intenções NPS** devem conter a string "NPS" no campo `intent` para serem agrupadas corretamente
- **Porcentagens** devem estar entre 0 e 100

---

## 4. responseDetails - Detalhes das Respostas

### 📍 Localização

Usado em: `ResponseDetails`

### 📐 Estrutura

```javascript
export const responseDetails = {
  closedQuestions: [
    {
      id: number, // ID único (1, 2, 3...)
      question: string, // Texto da pergunta
      summary: string, // Resumo da análise (pode ter quebras de linha \n)
      data: [
        {
          option: string, // Texto da opção
          value: number, // Quantidade absoluta
          percentage: number, // Porcentagem (0-100)
        },
      ],
    },
  ],
  openQuestions: [
    {
      id: number, // ID único (5, 6, 7...)
      question: string, // Texto da pergunta
      summary: string, // Resumo da análise (pode ter quebras de linha \n)
      sentimentData: [
        {
          category: string, // Nome da categoria
          positive: number, // Porcentagem positiva (0-100)
          neutral: number, // Porcentagem neutra (0-100)
          negative: number, // Porcentagem negativa (0-100)
        },
      ],
      topCategories: [
        {
          rank: number, // Posição no ranking (1, 2, 3...)
          category: string, // Nome da categoria
          mentions: number, // Quantidade de menções
          percentage: number, // Porcentagem (0-100)
          topics: [
            // Pode ser string OU objeto com sentiment
            string |
              {
                topic: string,
                sentiment: "positive" | "negative",
              },
          ],
        },
      ],
      wordCloud: [
        {
          text: string, // Palavra
          value: number, // Frequência (usado para tamanho)
        },
      ],
    },
  ],
};
```

### ✅ Exemplo

```javascript
export const responseDetails = {
  closedQuestions: [
    {
      id: 1,
      question: "Qual seu nível de satisfação geral com a TechCorp?",
      summary: `A maioria dos respondentes (67%) demonstra satisfação alta...`,
      data: [
        { option: "Muito Satisfeito", value: 324, percentage: 26 },
        { option: "Satisfeito", value: 511, percentage: 41 },
        // ... mais opções
      ],
    },
    // ... mais questões fechadas
  ],
  openQuestions: [
    {
      id: 5,
      question: "O que você mais gosta na TechCorp?",
      summary: `As respostas abertas destacam principalmente...`,
      sentimentData: [
        { category: "Qualidade", positive: 78, neutral: 15, negative: 7 },
        // ... mais categorias
      ],
      topCategories: [
        {
          rank: 1,
          category: "Qualidade dos produtos",
          mentions: 487,
          percentage: 39,
          topics: [
            {
              topic: "agilidade no atendimento",
              sentiment: "positive",
            },
            { topic: "confiabilidade da rede", sentiment: "negative" },
            // ... mais tópicos
          ],
        },
        // ... mais categorias
      ],
      wordCloud: [
        { text: "qualidade", value: 487 },
        { text: "atendimento", value: 356 },
        // ... mais palavras
      ],
    },
    // ... mais questões abertas
  ],
};
```

### 📊 Como é Plotado

#### closedQuestions

- **Gráfico**: Barras horizontais ordenadas por porcentagem (maior para menor)
- **Eixo Y**: Opções da pergunta
- **Eixo X**: Porcentagens (oculto, valores mostrados nas barras)
- **Tooltip**: Mostra valor absoluto e porcentagem

#### openQuestions

- **sentimentData**: Gráfico de barras empilhadas (positive/neutral/negative)
- **topCategories**: Cards com ranking, menções e tópicos separados por sentimento
- **wordCloud**: Nuvem de palavras (tamanho baseado em `value`)

### ⚠️ Importante

- **ID da questão 4** é usado para identificar a questão NPS
- **Porcentagens** em `sentimentData` devem somar 100% por categoria
- **Topics** podem ser strings simples ou objetos com `sentiment`
- **WordCloud**: `value` determina o tamanho da palavra (maior = mais frequente)

---

## 5. attributeDeepDive - Aprofundamento por Atributos

### 📍 Localização

Usado em: `AttributeDeepDive`, `FilterPanel`

### 📐 Estrutura

```javascript
export const attributeDeepDive = {
  attributes: [
    {
      id: string, // ID único ("state", "education", "customerType")
      name: string, // Nome exibido ("Estado", "Escolaridade", etc.)
      summary: string, // Resumo (pode ter quebras de linha \n)
      distribution: [
        {
          segment: string, // Nome do segmento
          count: number, // Quantidade absoluta
          percentage: number, // Porcentagem (0-100)
        },
      ],
      sentiment: [
        {
          segment: string, // Nome do segmento (deve corresponder a distribution)
          positive: number, // Porcentagem positiva (0-100)
          neutral: number, // Porcentagem neutra (0-100)
          negative: number, // Porcentagem negativa (0-100)
        },
      ],
    },
  ],
};
```

### ✅ Exemplo

```javascript
export const attributeDeepDive = {
  attributes: [
    {
      id: "state",
      name: "Estado",
      summary: `A distribuição geográfica mostra concentração no Sudeste...`,
      distribution: [
        { segment: "São Paulo", count: 498, percentage: 40 },
        { segment: "Rio de Janeiro", count: 224, percentage: 18 },
        // ... mais segmentos
      ],
      sentiment: [
        { segment: "São Paulo", positive: 62, neutral: 23, negative: 15 },
        { segment: "Rio de Janeiro", positive: 55, neutral: 25, negative: 20 },
        // ... mais segmentos (deve corresponder a distribution)
      ],
    },
    // ... mais atributos
  ],
};
```

### 📊 Como é Plotado

- **Tabs**: Um tab por atributo
- **Distribution**: Gráfico de barras horizontais + tabela (ordenado por porcentagem)
- **Sentiment**: Gráfico de barras empilhadas + tabela (positive/neutral/negative)

### ⚠️ Importante

- **IDs** devem corresponder aos valores em `FilterPanel.filterOptions`
- **Segmentos** em `distribution` e `sentiment` devem corresponder (mesmos nomes)
- **Porcentagens** em `sentiment` devem somar 100% por segmento
- **IDs válidos**: "state", "education", "customerType" (ou adicionar mapeamento em `FilterPanel`)

---

## 6. implementationPlan - Plano de Implementação

### 📍 Localização

Usado em: `ImplementationPlan`

### 📐 Estrutura

```javascript
export const implementationPlan = {
  recommendations: [
    {
      id: number, // ID único (deve corresponder a executiveReport.recommendations)
      title: string, // Título da recomendação
      severity: string, // "critical" | "high" | "medium" | "low"
      tasks: [
        {
          task: string, // Descrição da tarefa
          owner: string, // Área/Responsável
          deadline: string, // Prazo (ex: "Semana 1-2")
        },
      ],
    },
  ],
};
```

### ✅ Exemplo

```javascript
export const implementationPlan = {
  recommendations: [
    {
      id: 1,
      title: "Sistema de tickets com SLA garantido",
      severity: "critical",
      tasks: [
        {
          task: "Avaliar e selecionar plataforma de tickets",
          owner: "TI",
          deadline: "Semana 1-2",
        },
        {
          task: "Configurar SLAs e escalações automáticas",
          owner: "Operações",
          deadline: "Semana 3-4",
        },
        // ... mais tarefas
      ],
    },
    // ... mais recomendações
  ],
};
```

### 📊 Como é Plotado

- **Accordion**: Um accordion por recomendação
- **Tabela**: Tarefas com checkboxes, owner e deadline
- **Badge**: Severidade com cores (critical=vermelho, high=laranja, medium=amarelo, low=verde)

### ⚠️ Importante

- **IDs** devem corresponder aos IDs em `executiveReport.recommendations`
- **Tarefas** podem ser marcadas como concluídas (checkboxes)

---

## Constantes

### severityLabels

```javascript
export const severityLabels = {
  critical: "Crítico",
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};
```

### ⚠️ Importante

- **severityLabels** mapeia os níveis de severidade para textos em português
- Os valores válidos são: "critical", "high", "medium", "low"

---

## Boas Práticas

### ✅ DO (Faça)

1. **Mantenha IDs únicos e sequenciais**:

   - `closedQuestions`: 1, 2, 3, 4...
   - `openQuestions`: 5, 6, 7...
   - `recommendations`: 1, 2, 3...

2. **Use quebras de linha (`\n`)** para textos longos:

   ```javascript
   summary: `Primeira linha.
   Segunda linha.
   Terceira linha.`;
   ```

3. **Garanta que porcentagens somem 100%** quando aplicável:

   - `sentimentAnalysis.data`: positive + neutral + negative = 100
   - `sentiment` em atributos: positive + neutral + negative = 100

4. **Mantenha consistência** entre objetos relacionados:

   - `distribution` e `sentiment` devem ter os mesmos segmentos
   - `executiveReport.recommendations` e `implementationPlan.recommendations` devem ter os mesmos IDs

5. **Use IDs descritivos** para atributos:
   - "state", "education", "customerType" (correspondem a `FilterPanel`)

### ❌ DON'T (Não Faça)

1. **Não use IDs duplicados** em arrays
2. **Não misture tipos** em arrays (ex: não misture strings e objetos em `topics` sem estrutura correta)
3. **Não esqueça de exportar** os objetos principais
4. **Não altere a estrutura** sem verificar os componentes que consomem
5. **Não use porcentagens > 100** ou < 0

---

## 📝 Checklist ao Adicionar/Modificar Dados

- [ ] IDs são únicos e sequenciais
- [ ] Porcentagens somam 100% quando aplicável
- [ ] Segmentos correspondem entre `distribution` e `sentiment`
- [ ] IDs de recomendações correspondem entre `executiveReport` e `implementationPlan`
- [ ] Textos longos usam quebras de linha (`\n`)
- [ ] Todos os objetos principais estão exportados
- [ ] IDs de atributos correspondem aos valores em `FilterPanel`

---

## 🔗 Referências

- **Arquivo de dados**: `src/data/surveyData.js`
- **Componentes que consomem**:
  - `ExecutiveReport.jsx`
  - `SupportAnalysis.jsx`
  - `ResponseDetails.jsx`
  - `AttributeDeepDive.jsx`
  - `ImplementationPlan.jsx`
  - `SurveySidebar.jsx`

---

**Última atualização**: $(date)

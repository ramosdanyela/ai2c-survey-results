# Problemas de Renderização - telmob_report_json (1).json

Este documento identifica os problemas que impedem a renderização correta de componentes quando o arquivo `telmob_report_json (1).json` é usado no lugar de `surveyData.json`.

## Estratégia de Análise

A análise foi realizada comparando:

1. A estrutura esperada pelo código (baseada em `surveyData.json`)
2. A estrutura atual do `telmob_report_json (1).json`
3. Os pontos onde o código verifica IDs de seções e caminhos de dados

---

## Problemas Identificados

### 1. ❌ ID da Seção de Questões Incorreto

**Localização no JSON:** Linha 530

**Problema no JSON:**

```json
{
  "id": "questions",  // ❌ INCORRETO
  "index": 2,
  "name": "Análise por Questão",
  "questions": [...]
}
```

**Comportamento Real do Código:**
O código **de fato busca** especificamente por `id === "responses"` nos seguintes locais:

- `src/services/dataResolver.js:42-43` - `getQuestionsFromData()` executa: `data.sections.find((section) => section.id === "responses")`
- `src/components/survey/common/GenericSectionRenderer.jsx:525` - Executa: `if (sectionId === "responses")`
- `src/components/survey/components/ContentRenderer.jsx:154` - Executa: `if (section.id === "responses")`
- `src/components/survey/common/GenericSectionRenderer.jsx:592` - Executa: `if (sectionId === "responses")`

**Resultado:** Se o ID for diferente de `"responses"`, a função retorna `[]` (array vazio) e a seção não é encontrada.

**Impacto:**

- ❌ A função `getQuestionsFromData()` retorna array vazio
- ❌ A seção de questões não é encontrada
- ❌ Componentes que dependem de `sectionData.questions` não funcionam
- ❌ A lista de questões não é renderizada
- ❌ Navegação entre questões não funciona

**Sugestão de Correção:**

**✅ PRIORIDADE: Alterar JSON**

```json
// Linha 530 - Alterar:
{
  "id": "responses", // Era "questions"
  "index": 2,
  "name": "Análise por Questão"
}
```

**⚠️ ALTERNATIVA: Alterar Código (se JSON não puder ser alterado)**
Modificar `src/services/dataResolver.js:42-43` para aceitar múltiplos IDs:

```javascript
const responsesSection = data.sections.find(
  (section) => section.id === "responses" || section.id === "questions",
);
```

---

### 2. ❌ Estrutura de Dados Incorreta na Seção Attributes

**Localização no JSON:** Linhas 1209-1554

**Problema no JSON:**
A seção `attributes` tem uma estrutura de dados incorreta. Os componentes esperam encontrar dados em `sectionData.estado.distributionChart`, mas a estrutura atual tem:

1. **Na subsection `attributes-Estado`** (linhas 1209-1436):

   ```json
   {
     "id": "attributes-Estado",
     "data": {
       "distributionChart": [...],  // ✅ Dados no nível raiz
       "distributionTable": [...],   // ✅ Dados no nível raiz
       "sentimentChart": [],        // ❌ VAZIO no nível raiz
       "sentimentTable": [],        // ❌ VAZIO no nível raiz
       // ... outros arrays vazios
       "estado": {                  // ❌ Objeto aninhado desnecessário
         "distributionChart": [...], // ❌ DUPLICADO
         "distributionTable": [...], // ❌ DUPLICADO
         // ... outros campos vazios
       }
     }
   }
   ```

2. **Na section `attributes`** (linhas 1439-1554):
   ```json
   {
     "id": "attributes",
     "data": {
       "estado": {
         "distributionChart": [...],  // ❌ DUPLICADO
         "distributionTable": [...],  // ❌ DUPLICADO
         // ... outros campos vazios
       }
     }
   }
   ```

**Comportamento Real do Código:**
O código em `GenericSectionRenderer.jsx:513-521` **de fato executa**:

```javascript
if (sectionId === "attributes" && section?.subsections) {
  return section.subsections.reduce((acc, subsection) => {
    if (subsection.data && subsection.id?.startsWith("attributes-")) {
      const key = subsection.id.replace(/^attributes-/, "");
      acc[key] = subsection.data; // Mapeia "attributes-Estado" -> "Estado"
    }
    return acc;
  }, {});
}
```

**O que acontece na prática:**

- O código verifica se `sectionId === "attributes"` (hardcoded)
- Se verdadeiro, mapeia `subsection.data` para `sectionData.estado` (onde `estado` vem de `subsection.id.replace(/^attributes-/, "")`)
- Os componentes acessam `sectionData.estado.distributionChart` que resolve para `subsection.data.estado.distributionChart`
- Como há dados duplicados em `subsection.data.distributionChart` (nível raiz) e `subsection.data.estado.distributionChart` (aninhado), o código usa o aninhado

**Como os componentes acessam os dados:**
Os componentes usam `dataPath: "sectionData.estado.distributionChart"`, que resolve para:

1. `sectionData.estado.distributionChart` → `subsection.data.estado.distributionChart` ✅ Funciona
2. Mas também há `subsection.data.distributionChart` no nível raiz, que não é usado

**Impacto:**

- ✅ Os dados funcionam porque estão em `subsection.data.estado.distributionChart`
- ❌ Há duplicação desnecessária de dados
- ❌ Estrutura confusa com dados em dois lugares
- ⚠️ Arrays vazios no nível raiz (`sentimentChart: []`) não são usados, mas podem causar confusão

**Sugestão de Correção:**

**✅ PRIORIDADE: Alterar JSON**
Remover dados duplicados, manter apenas em `subsection.data.estado.*`:

```json
// Linhas 1209-1436 - Remover campos duplicados do nível raiz:
{
  "id": "attributes-Estado",
  "data": {
    // Remover: "distributionChart", "distributionTable" do nível raiz
    "sentimentChart": [],
    "sentimentTable": [],
    "estado": {
      "distributionChart": [...],  // ✅ Manter apenas aqui
      "distributionTable": [...],   // ✅ Manter apenas aqui
      // ... outros campos
    }
  }
}

// Linhas 1439-1554 - Remover section.data.estado se não necessário:
{
  "id": "attributes",
  "data": {}  // Ou remover completamente
}
```

**⚠️ ALTERNATIVA: Alterar Código (se JSON não puder ser alterado)**
Modificar `GenericSectionRenderer.jsx:513-521` para priorizar dados aninhados sobre dados do nível raiz.

---

### 3. ❌ Arrays Vazios em Campos de Dados

**Localização no JSON:** Múltiplas linhas

**Problema no JSON:**
Muitos arrays estão vazios quando deveriam conter dados:

**Na subsection `attributes-Estado.data`** (linhas 1314-1321):

```json
{
  "sentimentChart": [], // ❌ VAZIO
  "sentimentTable": [], // ❌ VAZIO
  "npsDistributionTable": [], // ❌ VAZIO
  "npsTable": [], // ❌ VAZIO
  "satisfactionImpactSentimentChart": [], // ❌ VAZIO
  "satisfactionImpactSentimentTable": [], // ❌ VAZIO
  "positiveCategoriesTable": [], // ❌ VAZIO
  "negativeCategoriesTable": [] // ❌ VAZIO
}
```

**Na questão NPS** (linhas 558-560):

```json
{
  "wordCloud": [], // ❌ VAZIO
  "sentimentCategories": [], // ❌ VAZIO
  "topicsByCategory": [] // ❌ VAZIO
}
```

**Comportamento Real do Código:**
Os componentes **de fato executam** verificações específicas:

- `src/components/survey/common/ChartRenderers.jsx:85` - Executa: `if (!chartData || !Array.isArray(chartData)) return null;`
- `src/components/survey/common/ChartRenderers.jsx:158` - Executa: `if (!chartData || !Array.isArray(chartData)) return null;`
- `src/components/survey/widgets/charts/LineChart.jsx:44` - Executa: `if (!data || data.length === 0) return <div>Nenhum dado disponível</div>;`
- `src/components/survey/widgets/charts/Histogram.jsx:38` - Executa: `if (!data || data.length === 0) return <div>Nenhum dado disponível</div>;`
- `src/components/survey/common/TableRenderers.jsx:40` - Executa: `if (!recommendationsData || !recommendationsData.items || !Array.isArray(recommendationsData.items))`

**Resultado:** Quando encontra array vazio `[]`, o componente retorna `null` ou mensagem "Nenhum dado disponível", não renderizando nada.

**Impacto:**

- ❌ Componentes que esperam dados não renderizam (retornam `null` ou mensagem "Nenhum dado disponível")
- ❌ Tabelas vazias não aparecem (retornam mensagem "Nenhuma recomendação encontrada" ou similar)
- ❌ Gráficos não são exibidos (mostram mensagem "Nenhum dado disponível")
- ✅ O código trata arrays vazios corretamente, não causa erros, mas não renderiza conteúdo

**Sugestão de Correção:**

**✅ PRIORIDADE: Alterar JSON**

**Opção 1 - Preencher com dados:**

```json
// Linhas 1314-1321 - Preencher arrays:
{
  "sentimentChart": [
    { "segment": "RJ", "positive": 45, "neutral": 30, "negative": 25 }
    // ... mais dados
  ],
  "sentimentTable": [...],
  "npsDistributionTable": [...],
  "npsTable": [...]
}
```

**Opção 2 - Remover campos se não houver dados:**

```json
// Remover campos vazios completamente
{
  "distributionChart": [...],
  "distributionTable": [...]
  // Campos vazios removidos
}
```

**Opção 3 - Usar `null` em vez de `[]`:**

```json
{
  "sentimentChart": null, // Em vez de []
  "sentimentTable": null
}
```

**⚠️ ALTERNATIVA: Alterar Código (se JSON não puder ser alterado)**
Modificar componentes para exibir mensagem quando array está vazio em vez de retornar `null`.

---

### 4. ❌ Estrutura de Dados na Questão NPS

**Localização no JSON:** Linhas 541-563

**Problema no JSON:**
A questão NPS tem uma estrutura inconsistente:

```json
{
  "id": 0,
  "question_id": "question01",
  "data": {
    "npsScore": -21.0,
    "npsCategory": "",  // ❌ VAZIO
    "npsStackedChart": [...],
    "wordCloud": [],
    "sentimentCategories": [],
    "topicsByCategory": []
  },
  "npsScore": null,  // ❌ DUPLICADO (também está em data.npsScore)
  "questionType": "nps"
}
```

**Comportamento Real do Código:**
O código **de fato acessa** `npsScore` através de `resolveDataPath()` que busca em múltiplos lugares. A duplicação pode fazer o código usar o valor errado dependendo da ordem de verificação.

**Impacto:**

- ⚠️ Inconsistência na estrutura de dados
- ⚠️ `npsCategory` vazio pode causar problemas se o código esperar um valor

**Sugestão de Correção:**

**✅ PRIORIDADE: Alterar JSON**

**Preencher `npsCategory`:**

```json
// Linha 543 - Preencher baseado no npsScore:
{
  "data": {
    "npsScore": -21.0,
    "npsCategory": "Ruim",  // Baseado em npsScore < 0
    "npsStackedChart": [...]
  }
}
```

**Remover duplicação de `npsScore`:**

```json
// Remover do nível raiz, manter apenas em data.npsScore:
{
  "id": 0,
  "data": {
    "npsScore": -21.0 // ✅ Manter apenas aqui
  }
  // Remover: "npsScore": null do nível raiz
}
```

**⚠️ ALTERNATIVA: Alterar Código (se JSON não puder ser alterado)**
Adicionar lógica para calcular `npsCategory` automaticamente baseado em `npsScore`.

---

### 5. ❌ Campo `label` em vez de `option` em `npsStackedChart`

**Localização no JSON:** Linhas 546, 550, 554

**Problema no JSON:**
O `npsStackedChart` usa campo `"label"` mas o código espera `"option"`:

```json
// Linhas 544-557 - ANTES:
{
  "npsStackedChart": [
    {
      "label": "detrator",  // ❌ Deveria ser "option"
      "value": 51.0
    },
    {
      "label": "promotor",  // ❌ Deveria ser "option"
      "value": 30.0
    },
    {
      "label": " Neutro ",  // ❌ Deveria ser "option"
      "value": 19.0
    }
  ]
}

// Comparando com surveyData.json (formato correto):
{
  "npsStackedChart": [
    {
      "option": "Detrator",  // ✅ Formato correto
      "value": 187,
      "percentage": 22
    },
    {
      "option": "Promotor",  // ✅ Formato correto
      "value": 493,
      "percentage": 58
    },
    {
      "option": "Neutro",  // ✅ Formato correto
      "value": 170,
      "percentage": 20
    }
  ]
}
```

**Comportamento Real do Código:**

- `SchemaNPSStackedChart` em `ChartRenderers.jsx:331` verifica se `chartData` é array e retorna `null` se for array
- Mas o código também trata `npsStackedChart` como array em `QuestionsList.jsx:470`
- Há inconsistência: código espera objeto em `SchemaNPSStackedChart` mas JSON tem array

**Impacto:**

- ⚠️ Se `npsStackedChart` for usado diretamente via `dataPath`, pode não renderizar devido à verificação de array
- ⚠️ Campo `label` em vez de `option` pode causar problemas se código esperar `option`

**Sugestão de Correção:**

**✅ PRIORIDADE: Alterar JSON**

```json
// Linhas 544-557 - Alterar:
{
  "npsStackedChart": [
    {
      "option": "Detrator", // Era "label": "detrator"
      "value": 51.0,
      "percentage": 51.0 // Adicionar se necessário
    },
    {
      "option": "Promotor", // Era "label": "promotor"
      "value": 30.0,
      "percentage": 30.0
    },
    {
      "option": "Neutro", // Era "label": " Neutro "
      "value": 19.0,
      "percentage": 19.0
    }
  ]
}
```

**⚠️ ALTERNATIVA: Alterar Código (se JSON não puder ser alterado)**

- Remover verificação `Array.isArray(chartData)` em `SchemaNPSStackedChart`
- OU adicionar transformação de array para objeto antes de passar para `NPSStackedChart`

---

### 6. ❌ Campo `label` em vez de `option` em `barChart`

**Localização no JSON:** Linhas 892-964

**Problema no JSON:**
O `barChart` usa campo `"label"` mas o código espera `"option"`:

```json
// Linhas 892-964 - ANTES:
{
  "barChart": [
    {
      "label": "Queda / instabilidade na internet...",  // ❌ Deveria ser "option"
      "value": 13.5
    }
    // ... mais itens
  ]
}

// Comparando com surveyData.json (formato correto):
{
  "barChart": [
    {
      "option": "Muito bom",  // ✅ Formato correto
      "value": 221,
      "percentage": 26
    }
    // ... mais itens
  ]
}
```

**Comportamento Real do Código:**
O template em `questionTemplates.js:46` configura `yAxisDataKey: "option"`:

```javascript
config: {
  dataKey: "percentage",
  yAxisDataKey: "option",  // Espera campo "option"
}
```

**Impacto:**

- ⚠️ Gráfico pode não exibir labels corretamente se código buscar campo `option` e encontrar `label`
- ⚠️ Campo `percentage` faltando pode afetar tooltips e formatação

**Sugestão de Correção:**

**✅ PRIORIDADE: Alterar JSON**

```json
// Linhas 892-964 - Alterar todos os itens:
{
  "barChart": [
    {
      "option": "Queda / instabilidade na internet...", // Era "label"
      "value": 13.5,
      "percentage": 13.5 // Adicionar se necessário
    }
    // ... alterar todos os outros itens também
  ]
}
```

**⚠️ ALTERNATIVA: Alterar Código (se JSON não puder ser alterado)**
Modificar `questionTemplates.js:46` para usar `yAxisDataKey: "label"` em vez de `"option"`.

---

### 7. ⚠️ Código Hardcoded - Análise Detalhada

**Análise Profunda do Código:**

Após análise detalhada, identifiquei múltiplos lugares onde há código **hardcoded** que pode causar problemas:

#### 5.1. 🔴 CRÍTICO - Funções que Buscam Seções por ID Hardcoded

**`src/services/dataResolver.js`:**

1. **`getAttributesFromData()` (linhas 8-30):**

   ```javascript
   const attributesSection = data.sections.find(
     (section) => section.id === "attributes", // ❌ HARDCODED
   );
   ```

   - **O que o código de fato faz:** Executa `find()` procurando exatamente `id === "attributes"`
   - **Resultado real:** Se não encontrar, `attributesSection` é `undefined`, função retorna `[]`
   - **Impacto:** Se a seção de atributos tiver outro ID (ex: "atributos", "caracteristicas"), não será encontrada
   - **Sugestão de Correção:** **JSON:** Garantir que seção tenha `id: "attributes"` (prioridade) OU **Código:** Tornar genérico ou aceitar múltiplos IDs

2. **`getQuestionsFromData()` (linhas 39-51):**

   ```javascript
   const responsesSection = data.sections.find(
     (section) => section.id === "responses", // ❌ HARDCODED
   );
   ```

   - **O que o código de fato faz:** Executa `find()` procurando exatamente `id === "responses"`
   - **Resultado real:** Se não encontrar, `responsesSection` é `undefined`, função retorna `[]`
   - **Impacto:** Se a seção de questões tiver outro ID (ex: "questions", "perguntas"), não será encontrada
   - **Sugestão de Correção:** **JSON:** Alterar `id: "questions"` para `id: "responses"` (prioridade) OU **Código:** Tornar genérico ou aceitar múltiplos IDs

#### 5.2. 🟡 MODERADO - Verificações Hardcoded em Múltiplos Componentes

**`src/components/survey/common/GenericSectionRenderer.jsx`:**

1. **Construção de `sectionData` (linhas 513-546):**

   ```javascript
   if (sectionId === "attributes" && section?.subsections) {
     // ❌ HARDCODED
     // Lógica especial para attributes
   }
   if (sectionId === "responses") {
     // ❌ HARDCODED
     // Lógica especial para responses
   }
   ```

   - **O que o código de fato faz:** Verifica exatamente `sectionId === "attributes"` antes de construir `sectionData` a partir de subsections
   - **Resultado real:** Se `sectionId` for diferente, pula essa lógica e usa `section.data` diretamente
   - **Impacto:** Outras seções com estrutura similar não terão `sectionData` construído da mesma forma
   - **Sugestão de Correção:** **JSON:** Garantir que seção tenha `id: "attributes"` e estrutura correta (prioridade) OU **Código:** Tornar genérico verificando padrão `subsection.id.startsWith(sectionId + "-")`

2. **Geração de subsections dinâmicas (linha 592):**

   ```javascript
   if (sectionId === "responses") {
     // ❌ HARDCODED
     const questions = getQuestionsFromData(data);
   }
   ```

   - **O que o código de fato faz:** Verifica exatamente `sectionId === "responses"` antes de gerar subsections dinamicamente
   - **Resultado real:** Se `sectionId` for diferente, não gera subsections dinamicamente, retorna `[]`
   - **Impacto:** Se outra seção precisar de subsections dinâmicas de questões, não funcionará
   - **Sugestão de Correção:** **JSON:** Garantir que seção tenha `id: "responses"` e campo `questions` (prioridade) OU **Código:** Usar flag `dynamicSubsections: true` no JSON para tornar genérico

**`src/components/survey/components/ContentRenderer.jsx`:**

1. **Fallbacks hardcoded (linhas 48-54):**

   ```javascript
   const fallbacks = {
     executive: "executive-summary", // ❌ HARDCODED
     support: "support-sentiment", // ❌ HARDCODED
     engagement: "engagement-sentiment", // ❌ HARDCODED
   };
   ```

   - **O que o código de fato faz:** Se `data.sections` não existir, usa fallback apenas para essas 3 seções
   - **Resultado real:** Se `data.sections` não existir e seção não estiver no fallback, retorna `activeSection` sem normalizar
   - **Impacto:** Menor, pois é apenas fallback quando `data.sections` não existe
   - **Sugestão de Correção:** **JSON:** Garantir que `data.sections` sempre exista (prioridade) OU **Código:** Remover fallbacks ou torná-los genéricos

2. **Verificações de padrões (linhas 63-75):**

   ```javascript
   if (section.id === "responses" && activeSection?.startsWith("responses-")) {
     // ❌ HARDCODED
     return activeSection;
   }
   if (
     section.id === "attributes" &&
     activeSection?.startsWith("attributes-")
   ) {
     // ❌ HARDCODED
     return activeSection;
   }
   ```

   - **O que o código de fato faz:** Verifica exatamente esses dois padrões antes de retornar `activeSection`
   - **Resultado real:** Se padrão não corresponder, continua para próxima verificação
   - **Impacto:** Outras seções com subsections dinâmicas não serão reconhecidas como válidas
   - **Sugestão de Correção:** **JSON:** Garantir que subsections sigam padrão `responses-{id}` ou `attributes-{id}` (prioridade) OU **Código:** Tornar genérico verificando padrão `sectionId-*`

3. **Extração de sectionId (linhas 225-235):**

   ```javascript
   if (normalizedSection.startsWith("support-")) {
     // ❌ HARDCODED
     finalSectionId = "support";
   } else if (normalizedSection.startsWith("responses-")) {
     // ❌ HARDCODED
     finalSectionId = "responses";
   } else if (normalizedSection.startsWith("attributes-")) {
     // ❌ HARDCODED
     finalSectionId = "attributes";
   } else if (normalizedSection.startsWith("executive-")) {
     // ❌ HARDCODED
     finalSectionId = "executive";
   } else if (normalizedSection.startsWith("engagement-")) {
     // ❌ HARDCODED
     finalSectionId = "engagement";
   }
   ```

   - **O que o código de fato faz:** Verifica sequencialmente apenas esses 5 prefixos
   - **Resultado real:** Se nenhum corresponder, `finalSectionId` permanece `null` ou usa `extractSectionId()`
   - **Impacto:** Se nova seção não estiver na lista, pode não ser encontrada e mostrar erro
   - **Sugestão de Correção:** **JSON:** Garantir que subsections sigam padrão `{sectionId}-{subsectionId}` (prioridade) OU **Código:** Tornar genérico extraindo prefixo antes do primeiro `-`

**`src/components/survey/components/SurveySidebar.jsx`:**

1. **Verificações de seções dinâmicas (linhas 74-126):**

   ```javascript
   if (item.id === "attributes") {
     // ❌ HARDCODED
     const attrs = getAttributesFromData(data);
   }
   if (item.id === "responses") {
     // ❌ HARDCODED
     const questions = getQuestionsFromData(data);
   }
   ```

   - **O que o código de fato faz:** Verifica exatamente `item.id === "attributes"` e `item.id === "responses"` antes de buscar subsections dinamicamente
   - **Resultado real:** Se `item.id` for diferente, não busca subsections dinamicamente, retorna `[]`
   - **Impacto:** Outras seções com subsections dinâmicas não aparecerão no sidebar
   - **Sugestão de Correção:** **JSON:** Garantir que seções dinâmicas tenham `id: "attributes"` ou `id: "responses"` (prioridade) OU **Código:** Usar flag `dynamicSubsections: true` no JSON para tornar genérico

**`src/components/survey/components/NavigationButtons.jsx`:**

1. **Verificações de padrões (linhas 120-124, 243-247):**

   ```javascript
   if (subsectionId.startsWith("attributes-")) {
     // ❌ HARDCODED
     sectionId = "attributes";
   } else if (subsectionId.startsWith("responses-")) {
     // ❌ HARDCODED
     sectionId = "responses";
   }
   ```

   - **O que o código de fato faz:** Verifica sequencialmente apenas esses dois prefixos para extrair `sectionId`
   - **Resultado real:** Se nenhum corresponder, `sectionId` permanece `null` e busca em `data.sections`
   - **Impacto:** Outras seções com subsections dinâmicas podem não ter navegação funcionando corretamente
   - **Sugestão de Correção:** **JSON:** Garantir que subsections sigam padrão `attributes-{id}` ou `responses-{id}` (prioridade) OU **Código:** Tornar genérico extraindo prefixo antes do primeiro `-`

**`src/utils/exportHelpers.js`:**

1. **Verificações hardcoded (linhas 22-72):**

   ```javascript
   if (sectionId === "attributes") {
     // ❌ HARDCODED
     const availableAttributes = getAttributesFromData(data);
   }
   if (sectionId === "responses") {
     // ❌ HARDCODED
     const allQuestions = getQuestionsFromData(data);
   }
   ```

   - **O que o código de fato faz:** Verifica exatamente `sectionId === "attributes"` e `sectionId === "responses"` antes de buscar subsections para export
   - **Resultado real:** Se `sectionId` for diferente, retorna `[]` e não exporta subsections
   - **Impacto:** Outras seções podem não exportar subsections corretamente
   - **Sugestão de Correção:** **JSON:** Garantir que seções dinâmicas tenham `id: "attributes"` ou `id: "responses"` (prioridade) OU **Código:** Usar flag `dynamicSubsections: true` no JSON para tornar genérico

#### 5.3. 🟢 MENOR - Fallbacks e Verificações Secundárias

**Múltiplos arquivos têm fallbacks hardcoded:**

- `ContentRenderer.jsx:14-18` - Fallbacks para "executive" e "support"
- `NavigationButtons.jsx:271-275` - Fallbacks para "executive" e "support"
- `Index.jsx:26-39` - Verificações hardcoded para "attributes" e "responses"

**Impacto:** Menor, pois são apenas fallbacks quando `data.sections` não existe

#### 5.4. ✅ PROGRAMÁTICO - O que Funciona Dinamicamente

**O que É programático e funciona bem:**

1. **Renderização de seções:** `SurveySidebar` renderiza todas as seções de `data.sections` dinamicamente
2. **Renderização de subsections fixas:** Qualquer seção com `subsections` array é renderizada
3. **Busca de seções:** `data.sections.find((s) => s.id === sectionId)` funciona para qualquer ID
4. **Componentes:** Componentes são renderizados dinamicamente baseados em `component.type`

---

### 8. ✅ Seção Support - Renderização Programática (NÃO É PROBLEMA)

**Localização no JSON:** Linhas 443-527

**Problema no JSON:**
A seção `support` tem dados, mas alguns componentes podem esperar campos adicionais:

```json
{
  "id": "support",
  "data": {
    "sentimentDivergentChart": [...],  // ✅ OK
    "segmentationTable": [...],        // ✅ OK
    "respondentIntentChart": [...]    // ✅ OK
  }
}
```

**Análise do Código:**
O código renderiza seções e subsections de forma **totalmente programática e dinâmica**:

1. **SurveySidebar.jsx:**
   - Busca seções dinamicamente de `data?.sections` (linha 217)
   - Renderiza todas as seções que existem no JSON
   - Não há verificações hardcoded de seções específicas
   - Subsections são buscadas dinamicamente de `section.subsections`

2. **ContentRenderer.jsx:**
   - Usa `hasRenderSchema()` que verifica se a seção tem `subsections` ou `renderSchema`
   - Aceita qualquer seção que tenha estrutura válida
   - Há alguns fallbacks hardcoded (linhas 225-235) apenas para extrair `sectionId` quando não consegue encontrar automaticamente, mas **não impedem renderização**

3. **GenericSectionRenderer.jsx:**
   - Busca seção dinamicamente: `data.sections.find((s) => s.id === sectionId)` (linha 503)
   - Se não encontrar, retorna mensagem de erro (linha 787-793)
   - Subsections são buscadas dinamicamente de `section.subsections` (linha 564-610)

**Conclusão:**
✅ **O código é totalmente programático** - ele renderiza qualquer seção e subsection que exista no JSON, independente do nome ou estrutura específica. Não há dependência de seções hardcoded como "support", "engagement", "executive", etc.

**Impacto:**

- ✅ A seção `support` será renderizada corretamente se tiver `subsections` ou `renderSchema`
- ✅ Não há problema se a seção não existir - o código simplesmente não a renderiza
- ✅ Não há problema se faltarem campos - apenas os componentes que dependem desses campos não renderizam
- ✅ O código é flexível e aceita qualquer estrutura de seção válida

**Observação:**
Comparando com `surveyData.json`, a seção equivalente (`engagement`) tem mais campos, mas isso não é um problema porque o código renderiza apenas o que existe. Se algum componente esperar um campo específico que não existe, ele simplesmente não renderiza (retorna `null`), mas não causa erro.

---

### 9. ❌ Estrutura de Dados na Questão Open-Ended

**Localização no JSON:** Linhas 565-883

**Problema no JSON:**
A questão open-ended tem uma estrutura que pode não corresponder ao esperado:

```json
{
  "id": 1,
  "questionType": "open-ended",
  "data": {
    "sentimentStackedChart": [...],
    "topCategoriesCards": [...],
    "wordCloud": [...],
    "npsScore": null,  // ❌ Não deveria estar aqui para open-ended
    "sentimentCategories": [],  // ❌ VAZIO
    "topicsByCategory": []      // ❌ VAZIO
  },
  "wordCloud": []  // ❌ DUPLICADO (também está em data.wordCloud)
}
```

**Comportamento Real do Código:**
O código **de fato acessa** `wordCloud` através de `resolveDataPath()` que busca em múltiplos lugares. A duplicação pode fazer o código usar o array vazio `[]` do nível raiz em vez do array com dados em `data.wordCloud`.

**Impacto:**

- ⚠️ Inconsistência na estrutura
- ⚠️ Arrays vazios podem fazer componentes não renderizarem

**Sugestão de Correção:**

**✅ PRIORIDADE: Alterar JSON**

**Remover duplicação de `wordCloud`:**

```json
// Remover do nível raiz, manter apenas em data.wordCloud:
{
  "id": 1,
  "data": {
    "wordCloud": [...]  // ✅ Manter apenas aqui
  }
  // Remover: "wordCloud": [] do nível raiz
}
```

**Preencher ou remover arrays vazios:**

```json
// Opção 1 - Preencher:
{
  "data": {
    "sentimentCategories": [
      { "category": "...", "sentiment": "positive" }
      // ... mais dados
    ],
    "topicsByCategory": [...]
  }
}

// Opção 2 - Remover:
{
  "data": {
    "sentimentStackedChart": [...],
    "topCategoriesCards": [...]
    // Campos vazios removidos
  }
}
```

**⚠️ ALTERNATIVA: Alterar Código (se JSON não puder ser alterado)**
Modificar `resolveDataPath()` para priorizar `data.wordCloud` sobre `wordCloud` do nível raiz.

---

### 10. ⚠️ Estrutura de Dados na Questão Single-Choice

**Localização no JSON:** Linhas 885-972

**Problema no JSON:**
A questão single-choice tem arrays vazios:

```json
{
  "id": 2,
  "questionType": "single-choice",
  "data": {
    "barChart": [...],  // ✅ OK
    "npsScore": null,    // ⚠️ Não deveria estar aqui
    "wordCloud": [],     // ❌ VAZIO
    "sentimentCategories": [],  // ❌ VAZIO
    "topicsByCategory": []      // ❌ VAZIO
  }
}
```

**Comportamento Real do Código:**
Para questões single-choice, o código **de fato renderiza** apenas componentes que têm dados. Se `barChart` tem dados, renderiza. Os outros campos vazios são ignorados (não causam erro, mas ocupam espaço desnecessário no JSON).

**Impacto:**

- ✅ O gráfico deve renderizar corretamente
- ⚠️ Campos desnecessários podem causar confusão

**Sugestão de Correção:**

**✅ PRIORIDADE: Alterar JSON**

**Remover campos não utilizados:**

```json
// Questão single-choice não precisa de wordCloud, sentimentCategories, etc.
// Remover campos não utilizados:
{
  "id": 2,
  "questionType": "single-choice",
  "data": {
    "barChart": [...]  // ✅ Manter apenas o necessário
    // Remover: wordCloud, sentimentCategories, topicsByCategory
  }
}
```

**⚠️ ALTERNATIVA: Alterar Código (se JSON não puder ser alterado)**
Modificar templates de questões para não renderizar campos não utilizados por tipo de questão.

---

### 11. ❌ Componentes Específicos que Não Renderizam

**Componentes Afetados:**

#### Na Seção Attributes - Subsection Estado:

1. **sentimentChart** (linha 1047, dataPath: `sectionData.estado.sentimentChart`)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 1314
   - **Componente:** `SchemaSentimentStackedChart`
   - **Comportamento:** Retorna `null` porque `chartData.length === 0`

2. **sentimentTable** (linha 1055, dataPath: `sectionData.estado.sentimentTable`)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 1315
   - **Componente:** `SchemaSentimentTable`
   - **Comportamento:** Retorna `null` ou mensagem vazia

3. **npsDistributionTable** (linha 1101, dataPath: `sectionData.estado.npsDistributionTable`)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 1316
   - **Componente:** `SchemaNPSDistributionTable`
   - **Comportamento:** Retorna `null` ou mensagem vazia

4. **npsTable** (linha 1118, dataPath: `sectionData.estado.npsTable`)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 1317
   - **Componente:** `SchemaNPSTable`
   - **Comportamento:** Retorna `null` ou mensagem vazia

5. **satisfactionImpactSentimentChart** (linha 1162, dataPath: `sectionData.estado.satisfactionImpactSentimentChart`)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 1318
   - **Componente:** `SchemaSentimentThreeColorChart`
   - **Comportamento:** Retorna `null` porque `chartData.length === 0`

6. **satisfactionImpactSentimentTable** (linha 1168, dataPath: `sectionData.estado.satisfactionImpactSentimentTable`)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 1319
   - **Componente:** `SchemaSentimentImpactTable`
   - **Comportamento:** Retorna `null` ou mensagem vazia

7. **positiveCategoriesTable** (linha 1184, dataPath: `sectionData.estado.positiveCategoriesTable`)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 1320
   - **Componente:** `SchemaPositiveCategoriesTable`
   - **Comportamento:** Retorna `null` ou mensagem vazia

8. **negativeCategoriesTable** (linha 1200, dataPath: `sectionData.estado.negativeCategoriesTable`)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 1321
   - **Componente:** `SchemaNegativeCategoriesTable`
   - **Comportamento:** Retorna `null` ou mensagem vazia

#### Na Questão NPS (question01):

1. **wordCloud** (se presente no template)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 558
   - **Componente:** `WordCloud`
   - **Comportamento:** Retorna `null` porque `data.length === 0`

#### Na Questão Open-Ended (question02):

1. **sentimentCategories** (se presente no template)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 879
   - **Componente:** Depende do template usado
   - **Comportamento:** Retorna `null` se verificar `array.length === 0`

2. **topicsByCategory** (se presente no template)
   - **Status:** ❌ Não renderiza
   - **Motivo:** Array vazio `[]` na linha 880
   - **Componente:** Depende do template usado
   - **Comportamento:** Retorna `null` se verificar `array.length === 0`

**Componentes que Renderizam Corretamente:**

1. ✅ **distributionChart** - Tem dados (linhas 1210-1260)
2. ✅ **distributionTable** - Tem dados (linhas 1262-1312)
3. ✅ **sentimentDivergentChart** - Tem dados (linhas 444-469)
4. ✅ **segmentationTable** - Tem dados (linhas 471-507)
5. ✅ **respondentIntentChart** - Tem dados (linhas 509-526)
6. ✅ **recommendationsTable** - Tem dados (linhas 73-360)
7. ✅ **barChart** (questão single-choice) - Tem dados (linhas 892-964)
8. ✅ **npsStackedChart** (questão NPS) - Tem dados (linhas 544-556)
9. ✅ **sentimentStackedChart** (questão open-ended) - Tem dados (linhas 572-597)
10. ✅ **topCategoriesCards** (questão open-ended) - Tem dados (linhas 599-674)
11. ✅ **wordCloud** (questão open-ended) - Tem dados (linhas 676-877)

---

## Resumo dos Problemas

### Problemas Críticos (Impedem Renderização)

1. **ID da seção de questões** - `"questions"` deve ser `"responses"`
   - **Tipo:** Problema no JSON
   - **Impacto:** Seção de questões não é encontrada
   - **Motivo:** `getQuestionsFromData()` busca especificamente por `id === "responses"`

2. **Código hardcoded para "responses"** - Função `getQuestionsFromData()` busca por ID fixo
   - **Tipo:** Problema no código
   - **Impacto:** Se a seção de questões tiver outro ID, não será encontrada
   - **Localização:** `src/services/dataResolver.js:43`

3. **Código hardcoded para "attributes"** - Função `getAttributesFromData()` busca por ID fixo
   - **Tipo:** Problema no código
   - **Impacto:** Se a seção de atributos tiver outro ID, não será encontrada
   - **Localização:** `src/services/dataResolver.js:12`

### Problemas Moderados (Podem Impedir Renderização)

4. **Arrays vazios** - Múltiplos arrays vazios podem fazer componentes não renderizarem
   - **Tipo:** Problema no JSON
   - **Impacto:** Componentes retornam `null` quando encontram arrays vazios

5. **Estrutura duplicada** - Dados duplicados na seção attributes
   - **Tipo:** Problema no JSON
   - **Impacto:** Confusão na estrutura, possível uso incorreto dos dados

6. **Verificações hardcoded em múltiplos componentes** - Lógica especial apenas para "responses" e "attributes"
   - **Tipo:** Problema no código
   - **Impacto:** Funcionalidades especiais (subsections dinâmicas, export, navegação) não funcionam para outras seções
   - **Locais:** `GenericSectionRenderer.jsx`, `ContentRenderer.jsx`, `SurveySidebar.jsx`, `NavigationButtons.jsx`, `exportHelpers.js`

### Problemas Menores (Inconsistências)

7. **Campos duplicados** - `npsScore`, `wordCloud` aparecem em múltiplos lugares
   - **Tipo:** Problema no JSON
   - **Impacto:** Inconsistência, possível uso incorreto

8. **Campos vazios** - `npsCategory` vazio, arrays vazios
   - **Tipo:** Problema no JSON
   - **Impacto:** Componentes podem não funcionar corretamente

9. **Fallbacks hardcoded** - Fallbacks apenas para seções específicas
   - **Tipo:** Problema no código (menor)
   - **Impacto:** Menor, pois são apenas fallbacks quando `data.sections` não existe

### ⚠️ Problemas no Código (Hardcoded)

6. **Código Hardcoded para "responses" e "attributes"** - Múltiplas funções e componentes têm verificações hardcoded
   - **Tipo:** Problema no código
   - **Impacto:** Se as seções tiverem IDs diferentes, não funcionarão corretamente
   - **Locais:**
     - `dataResolver.js` - `getQuestionsFromData()` e `getAttributesFromData()` buscam por IDs hardcoded
     - `GenericSectionRenderer.jsx` - Lógica especial apenas para "responses" e "attributes"
     - `ContentRenderer.jsx` - Fallbacks e verificações de padrões hardcoded
     - `SurveySidebar.jsx` - Verificações de seções dinâmicas hardcoded
     - `NavigationButtons.jsx` - Verificações de padrões hardcoded
     - `exportHelpers.js` - Lógica de export hardcoded

### ✅ Não É Problema

7. **Seção Support** - O código renderiza seções e subsections de forma programática
   - **Tipo:** Não é problema
   - **Explicação:** Apesar de haver código hardcoded, a renderização básica funciona dinamicamente. O código busca seções dinamicamente do JSON e renderiza qualquer estrutura válida. Os hardcodes afetam principalmente funcionalidades especiais (subsections dinâmicas, export, navegação).

---

## Recomendações

### ✅ PRIORIDADE: Alterações no JSON

Sempre priorize alterar o JSON em vez do código, pois é mais simples e rápido.

#### 1. 🔴 CRÍTICO - Corrigir ID da Seção de Questões

```json
// Linha 530
{
  "id": "responses", // Era "questions"
  "index": 2,
  "name": "Análise por Questão"
}
```

#### 2. 🟡 MODERADO - Preencher ou Remover Arrays Vazios

**Opção A - Preencher com dados:**

```json
// Linhas 1314-1321, 558-560, 879-880, 966-969
{
  "sentimentChart": [
    { "segment": "RJ", "positive": 45, "neutral": 30, "negative": 25 }
    // ... dados reais
  ]
}
```

**Opção B - Remover campos:**

```json
// Remover campos vazios completamente
{
  "distributionChart": [...],
  "distributionTable": [...]
  // Arrays vazios removidos
}
```

**Opção C - Usar `null`:**

```json
{
  "sentimentChart": null // Em vez de []
}
```

#### 3. 🟡 MODERADO - Limpar Estrutura Duplicada

```json
// Remover dados duplicados do nível raiz de subsection.data
// Manter apenas em subsection.data.estado.*
{
  "id": "attributes-Estado",
  "data": {
    "estado": {
      "distributionChart": [...],  // ✅ Dados apenas aqui
      "distributionTable": [...]
    }
  }
}

// Remover section.data.estado se não necessário
{
  "id": "attributes",
  "data": {}  // Ou remover completamente
}
```

#### 4. 🟢 MENOR - Preencher `npsCategory`

```json
// Linha 543
{
  "data": {
    "npsScore": -21.0,
    "npsCategory": "Ruim",  // Baseado em npsScore < 0
    "npsStackedChart": [...]
  }
}
```

**Lógica sugerida:**

- `npsScore < 0`: `"Ruim"`
- `npsScore >= 0 && npsScore < 50`: `"Bom"`
- `npsScore >= 50`: `"Excelente"`

#### 5. 🟢 MENOR - Remover Campos Duplicados

```json
// Remover do nível raiz, manter apenas em data.*
{
  "id": 0,
  "data": {
    "npsScore": -21.0,  // ✅ Manter apenas aqui
    "wordCloud": [...]  // ✅ Manter apenas aqui
  }
  // Remover: "npsScore": null e "wordCloud": [] do nível raiz
}
```

### ⚠️ ALTERNATIVA: Alterações no Código (Apenas se JSON não puder ser alterado)

Se por algum motivo o JSON não puder ser alterado, estas são as alternativas:

#### 1. Tornar Funções de Busca Genéricas

```javascript
// src/services/dataResolver.js
// ANTES:
const responsesSection = data.sections.find(
  (section) => section.id === "responses",
);

// DEPOIS - Opção 1 (aceitar múltiplos IDs):
const responsesSection = data.sections.find(
  (section) => section.id === "responses" || section.id === "questions",
);

// DEPOIS - Opção 2 (buscar por estrutura):
const responsesSection = data.sections.find(
  (section) => section.questions && Array.isArray(section.questions),
);
```

#### 2. Tornar Verificações de Padrões Genéricas

```javascript
// src/components/survey/components/ContentRenderer.jsx
// ANTES:
if (section.id === "responses" && activeSection?.startsWith("responses-")) {
  return activeSection;
}

// DEPOIS:
const prefix = activeSection?.split("-")[0];
if (section.id === prefix && activeSection?.startsWith(`${prefix}-`)) {
  return activeSection;
}
```

#### 3. Usar Flags no JSON para Tornar Código Genérico

**Adicionar flag no JSON:**

```json
{
  "id": "questions",
  "dynamicSubsections": true,  // ✅ Nova flag
  "questions": [...]
}
```

**Código genérico:**

```javascript
// Em vez de verificar sectionId === "responses"
if (section.dynamicSubsections && section.questions) {
  // Lógica genérica para qualquer seção com questões
}
```

#### 4. Melhorar Tratamento de Arrays Vazios

```javascript
// Componentes podem exibir mensagem em vez de retornar null
if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
  return <div>Nenhum dado disponível</div>; // Em vez de null
}
```

### Resumo de Prioridades

1. **🔴 ALTA PRIORIDADE - Alterar JSON:**
   - Corrigir `"id": "questions"` → `"id": "responses"` (linha 530)

2. **🟡 MÉDIA PRIORIDADE - Alterar JSON:**
   - Preencher arrays vazios OU remover campos não utilizados
   - Limpar estrutura duplicada em attributes

3. **🟢 BAIXA PRIORIDADE - Alterar JSON:**
   - Preencher `npsCategory`
   - Remover campos duplicados

4. **⚠️ ALTERNATIVA - Alterar Código (apenas se JSON não puder ser alterado):**
   - Tornar funções de busca mais flexíveis
   - Tornar verificações de padrões genéricas
   - Usar flags no JSON para tornar código genérico

---

---

## Tabela de Referência Rápida

| Problema                         | Tipo   | Severidade  | Localização                  | Impacto                                 |
| -------------------------------- | ------ | ----------- | ---------------------------- | --------------------------------------- |
| ID seção questões                | JSON   | 🔴 Crítico  | JSON linha 530               | Seção não encontrada                    |
| Código hardcoded "responses"     | Código | 🔴 Crítico  | dataResolver.js:43           | Se ID diferente, não funciona           |
| Código hardcoded "attributes"    | Código | 🔴 Crítico  | dataResolver.js:12           | Se ID diferente, não funciona           |
| Arrays vazios attributes         | JSON   | 🟡 Moderado | JSON linhas 1314-1321        | 8 componentes não renderizam            |
| Estrutura duplicada              | JSON   | 🟡 Moderado | JSON linhas 1209-1554        | Confusão na estrutura                   |
| Arrays vazios questões           | JSON   | 🟡 Moderado | JSON linhas 558-560, 879-880 | Componentes não renderizam              |
| Verificações hardcoded múltiplas | Código | 🟡 Moderado | Vários arquivos              | Funcionalidades especiais não funcionam |
| Campos duplicados                | JSON   | 🟢 Menor    | JSON múltiplas linhas        | Inconsistência                          |
| Campos vazios                    | JSON   | 🟢 Menor    | JSON linha 543               | Valores faltando                        |

---

## Resumo Executivo

### Problema Crítico Identificado

**ID da Seção de Questões Incorreto**

- O JSON usa `"id": "questions"` mas o código espera `"id": "responses"`
- **Impacto:** A seção de questões não é encontrada, nenhuma questão é renderizada
- **Sugestão de Correção:** **JSON:** Alterar linha 530 de `"id": "questions"` para `"id": "responses"` (prioridade) OU **Código:** Tornar `getQuestionsFromData()` mais flexível

### Problemas Moderados

1. **8 Componentes Não Renderizam na Seção Attributes**
   - Todos relacionados a arrays vazios na subsection `attributes-Estado`
   - Componentes afetados: sentimentChart, sentimentTable, npsDistributionTable, npsTable, satisfactionImpactSentimentChart, satisfactionImpactSentimentTable, positiveCategoriesTable, negativeCategoriesTable
   - **Sugestão de Correção:** **JSON:** Preencher arrays com dados reais OU remover campos se não houver dados (prioridade) OU **Código:** Modificar componentes para exibir mensagem quando array está vazio

2. **Estrutura de Dados Duplicada**
   - Dados aparecem em `subsection.data` e `subsection.data.estado`
   - Também há duplicação em `section.data.estado`
   - **Sugestão de Correção:** **JSON:** Remover dados duplicados, manter apenas em `subsection.data.estado.*` (prioridade) OU **Código:** Modificar `GenericSectionRenderer` para priorizar dados aninhados

### Estatísticas

- **Total de Componentes Analisados:** ~20+
- **Componentes que Não Renderizam:** 13+ (8 na attributes + 3 em questões + problemas de formato)
- **Componentes que Renderizam Corretamente:** 11+
- **Problemas Críticos:** 3 (1 JSON + 2 código)
- **Problemas Moderados:** 5 (3 JSON + 2 código)
- **Problemas Menores:** 3 (2 JSON + 1 código)

---

## Conclusão

### Problemas Críticos Identificados

1. **ID incorreto da seção de questões** (`"questions"` em vez de `"responses"`) - **Problema no JSON**
2. **Código hardcoded para "responses"** - `getQuestionsFromData()` busca especificamente por `id === "responses"` - **Problema no código**
3. **Código hardcoded para "attributes"** - `getAttributesFromData()` busca especificamente por `id === "attributes"` - **Problema no código**

### Análise: Programático vs Hardcoded

**O que É programático (funciona dinamicamente):**

- ✅ Renderização básica de seções e subsections
- ✅ Busca de seções por ID: `data.sections.find((s) => s.id === sectionId)`
- ✅ Renderização de componentes baseada em `component.type`
- ✅ Qualquer seção com `subsections` ou `renderSchema` é renderizada

**O que É hardcoded (pode causar problemas):**

- ❌ `getQuestionsFromData()` busca apenas por `id === "responses"`
- ❌ `getAttributesFromData()` busca apenas por `id === "attributes"`
- ❌ Lógica especial apenas para "responses" e "attributes" em múltiplos componentes
- ❌ Verificações de padrões hardcoded (`startsWith("responses-")`, `startsWith("attributes-")`)
- ❌ Fallbacks hardcoded para seções específicas

**Impacto dos Hardcodes:**

- 🔴 **Crítico:** Se a seção de questões tiver ID diferente de "responses", não será encontrada
- 🔴 **Crítico:** Se a seção de atributos tiver ID diferente de "attributes", não será encontrada
- 🟡 **Moderado:** Funcionalidades especiais (subsections dinâmicas, export, navegação) não funcionam para outras seções
- 🟢 **Menor:** Fallbacks hardcoded apenas afetam quando `data.sections` não existe

### Observação Importante

**A renderização básica funciona programaticamente**, mas **funcionalidades especiais dependem de código hardcoded**. Isso significa que:

- ✅ Seções com IDs diferentes de "responses" e "attributes" serão renderizadas normalmente
- ❌ Mas funcionalidades como subsections dinâmicas, export e navegação podem não funcionar para essas seções
- ⚠️ O código precisa ser atualizado para tornar essas funcionalidades genéricas

### Prioridade de Correção

1. **🔴 ALTA PRIORIDADE:**
   - Corrigir ID da seção de questões no JSON (`"questions"` → `"responses"`)
   - OU tornar código mais flexível para aceitar ambos os IDs

2. **🟡 MÉDIA PRIORIDADE:**
   - Preencher arrays vazios ou remover componentes não utilizados
   - Tornar código hardcoded mais genérico (especialmente `getQuestionsFromData` e `getAttributesFromData`)

3. **🟢 BAIXA PRIORIDADE:**
   - Limpar estrutura duplicada e campos inconsistentes
   - Remover fallbacks hardcoded ou torná-los genéricos

### Próximos Passos Recomendados

1. Corrigir o ID da seção de questões
2. Testar a renderização após a correção
3. Identificar quais componentes com arrays vazios são realmente necessários
4. Preencher dados faltantes ou remover componentes não utilizados
5. Limpar estrutura duplicada para melhorar manutenibilidade

---

## Sugestões de Correção

Esta seção fornece sugestões detalhadas de como corrigir cada problema, **sempre priorizando alterações no JSON** em vez de alterações no código.

### Correções Prioritárias no JSON

#### 1. 🔴 CRÍTICO - Corrigir ID da Seção de Questões

**Problema:** Seção tem `"id": "questions"` mas código busca `"id": "responses"`

**Solução no JSON:**

```json
// Linha 530 - ANTES:
{
  "id": "questions",
  "index": 2,
  "name": "Análise por Questão"
}

// DEPOIS:
{
  "id": "responses",  // ✅ Alterado
  "index": 2,
  "name": "Análise por Questão"
}
```

**Por que priorizar JSON:** É mais simples e rápido alterar o JSON do que modificar múltiplas funções no código que dependem desse ID.

---

#### 2. 🟡 MODERADO - Preencher ou Remover Arrays Vazios

**Problema:** Múltiplos arrays vazios fazem componentes não renderizarem

**Solução no JSON - Opção 1 (Preencher com dados):**

```json
// Linhas 1314-1321 - ANTES:
{
  "sentimentChart": [],
  "sentimentTable": [],
  "npsDistributionTable": [],
  "npsTable": []
}

// DEPOIS (se dados disponíveis):
{
  "sentimentChart": [
    { "segment": "RJ", "positive": 45, "neutral": 30, "negative": 25 }
    // ... mais dados
  ],
  "sentimentTable": [
    { "segment": "RJ", "positive": 45, "neutral": 30, "negative": 25 }
    // ... mais dados
  ],
  "npsDistributionTable": [
    { "segment": "RJ", "promotores": 30, "neutros": 40, "detratores": 30 }
    // ... mais dados
  ],
  "npsTable": [
    { "segment": "RJ", "nps": 0 }
    // ... mais dados
  ]
}
```

**Solução no JSON - Opção 2 (Remover campos se não houver dados):**

```json
// Linhas 1314-1321 - ANTES:
{
  "distributionChart": [...],
  "distributionTable": [...],
  "sentimentChart": [],      // ❌ Remover
  "sentimentTable": [],      // ❌ Remover
  "npsDistributionTable": [], // ❌ Remover
  "npsTable": []             // ❌ Remover
}

// DEPOIS:
{
  "distributionChart": [...],
  "distributionTable": [...]
  // Campos vazios removidos
}
```

**Solução no JSON - Opção 3 (Usar `null` em vez de `[]`):**

```json
// Se dados não estão disponíveis mas campo é necessário:
{
  "sentimentChart": null, // Em vez de []
  "sentimentTable": null // Em vez de []
}
```

**Por que priorizar JSON:** Remover ou preencher arrays vazios é mais simples do que modificar todos os componentes para tratar arrays vazios de forma diferente.

---

#### 3. 🟡 MODERADO - Limpar Estrutura Duplicada em Attributes

**Problema:** Dados duplicados em `subsection.data` e `subsection.data.estado`

**Solução no JSON:**

```json
// Linhas 1209-1436 - ANTES:
{
  "id": "attributes-Estado",
  "data": {
    "distributionChart": [...],  // ❌ DUPLICADO - remover
    "distributionTable": [...],   // ❌ DUPLICADO - remover
    "sentimentChart": [],
    "sentimentTable": [],
    "estado": {
      "distributionChart": [...],  // ✅ MANTER
      "distributionTable": [...],   // ✅ MANTER
      "sentimentChart": [],
      "sentimentTable": []
    }
  }
}

// DEPOIS:
{
  "id": "attributes-Estado",
  "data": {
    "sentimentChart": [],
    "sentimentTable": [],
    "estado": {
      "distributionChart": [...],  // ✅ Dados apenas aqui
      "distributionTable": [...],   // ✅ Dados apenas aqui
      "sentimentChart": [],
      "sentimentTable": []
    }
  }
}

// E remover também section.data.estado (linhas 1439-1554):
// ANTES:
{
  "id": "attributes",
  "data": {
    "estado": { ... }  // ❌ Remover se dados já estão em subsection.data
  }
}

// DEPOIS:
{
  "id": "attributes",
  "data": {}  // Ou remover completamente se não for necessário
}
```

**Por que priorizar JSON:** Limpar estrutura duplicada melhora a organização e evita confusão, sem necessidade de alterar código.

---

#### 4. 🟢 MENOR - Preencher Campo `npsCategory`

**Problema:** Campo `npsCategory` está vazio

**Solução no JSON:**

```json
// Linha 543 - ANTES:
{
  "data": {
    "npsScore": -21.0,
    "npsCategory": "",  // ❌ VAZIO
    "npsStackedChart": [...]
  }
}

// DEPOIS:
{
  "data": {
    "npsScore": -21.0,
    "npsCategory": "Ruim",  // ✅ Preenchido baseado no npsScore
    "npsStackedChart": [...]
  }
}
```

**Lógica sugerida para `npsCategory`:**

- `npsScore < 0`: `"Ruim"`
- `npsScore >= 0 && npsScore < 50`: `"Bom"`
- `npsScore >= 50`: `"Excelente"`

**Por que priorizar JSON:** Preencher o campo é mais simples do que adicionar lógica no código para calcular automaticamente.

---

#### 5. 🟢 MENOR - Remover Campos Duplicados

**Problema:** `npsScore` e `wordCloud` aparecem em múltiplos lugares

**Solução no JSON:**

```json
// Questão NPS - ANTES:
{
  "id": 0,
  "data": {
    "npsScore": -21.0,
    "npsStackedChart": [...]
  },
  "npsScore": null  // ❌ DUPLICADO - remover
}

// DEPOIS:
{
  "id": 0,
  "data": {
    "npsScore": -21.0,  // ✅ Manter apenas aqui
    "npsStackedChart": [...]
  }
  // npsScore removido do nível raiz
}

// Questão Open-Ended - ANTES:
{
  "id": 1,
  "data": {
    "wordCloud": [...]
  },
  "wordCloud": []  // ❌ DUPLICADO - remover
}

// DEPOIS:
{
  "id": 1,
  "data": {
    "wordCloud": [...]  // ✅ Manter apenas aqui
  }
  // wordCloud removido do nível raiz
}
```

**Por que priorizar JSON:** Remover duplicação evita confusão sobre qual valor será usado pelo código.

---

### Correções Alternativas no Código (Se JSON não puder ser alterado)

Se por algum motivo o JSON não puder ser alterado, estas são as alternativas no código:

#### 1. Tornar `getQuestionsFromData()` mais flexível

**Código atual:**

```javascript
// src/services/dataResolver.js:42-43
const responsesSection = data.sections.find(
  (section) => section.id === "responses",
);
```

**Sugestão de alteração:**

```javascript
// Aceitar múltiplos IDs
const responsesSection = data.sections.find(
  (section) => section.id === "responses" || section.id === "questions",
);
```

**OU usar flag no JSON:**

```javascript
// Buscar seção que tem campo questions
const responsesSection = data.sections.find(
  (section) => section.questions && Array.isArray(section.questions),
);
```

#### 2. Tornar verificações de padrões genéricas

**Código atual:**

```javascript
// src/components/survey/components/ContentRenderer.jsx:64
if (section.id === "responses" && activeSection?.startsWith("responses-")) {
  return activeSection;
}
```

**Sugestão de alteração:**

```javascript
// Tornar genérico extraindo prefixo
const prefix = activeSection?.split("-")[0];
if (section.id === prefix && activeSection?.startsWith(`${prefix}-`)) {
  return activeSection;
}
```

#### 3. Usar flags no JSON para tornar código genérico

**Adicionar flag no JSON:**

```json
{
  "id": "questions",
  "dynamicSubsections": true,  // ✅ Nova flag
  "questions": [...]
}
```

**Código genérico:**

```javascript
// Em vez de verificar sectionId === "responses"
if (section.dynamicSubsections && section.questions) {
  // Lógica genérica para qualquer seção com questões
}
```

---

### Resumo de Prioridades

1. **🔴 ALTA PRIORIDADE - Alterar JSON:**
   - Corrigir `"id": "questions"` → `"id": "responses"` (linha 530)

2. **🟡 MÉDIA PRIORIDADE - Alterar JSON:**
   - Preencher arrays vazios OU remover campos não utilizados
   - Limpar estrutura duplicada em attributes

3. **🟢 BAIXA PRIORIDADE - Alterar JSON:**
   - Preencher `npsCategory`
   - Remover campos duplicados

4. **⚠️ ALTERNATIVA - Alterar Código (apenas se JSON não puder ser alterado):**
   - Tornar funções de busca mais flexíveis
   - Tornar verificações de padrões genéricas
   - Usar flags no JSON para tornar código genérico

---

## Tabelas de Resumo

### Tabela 1: Problemas Causados pela Estrutura do JSON

| #   | Problema                                              | Localização JSON                                                                   | Severidade  | Componentes Afetados                                                                                                                                                                                 | Impacto Real                                                                                                                                                                                   | Sugestão de Correção                                                                                                                                                                                                                     |
| --- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | --- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | ID seção questões incorreto                           | Linha 530: `"id": "questions"`                                                     | 🔴 Crítico  | Todos os componentes de questões                                                                                                                                                                     | `getQuestionsFromData()` retorna `[]` porque busca `id === "responses"`, seção não encontrada                                                                                                  | **JSON:** Alterar linha 530 de `"id": "questions"` para `"id": "responses"`                                                                                                                                                              |
| 2   | Arrays vazios em attributes                           | Linhas 1314-1321: `sentimentChart: []`, `sentimentTable: []`, etc.                 | 🟡 Moderado | 8 componentes (sentimentChart, sentimentTable, npsDistributionTable, npsTable, satisfactionImpactSentimentChart, satisfactionImpactSentimentTable, positiveCategoriesTable, negativeCategoriesTable) | Componentes executam `if (!chartData                                                                                                                                                           |                                                                                                                                                                                                                                          | !Array.isArray(chartData) |     | chartData.length === 0)`e retornam`null` | **JSON:** Preencher arrays com dados reais OU remover campos se não houver dados. Se dados não disponíveis, usar `null` em vez de `[]` |
| 3   | Estrutura duplicada em attributes                     | Linhas 1209-1554: dados em `subsection.data` e `subsection.data.estado`            | 🟡 Moderado | Componentes que acessam `sectionData.estado.*`                                                                                                                                                       | Código executa `acc[key] = subsection.data` onde `key = "estado"`, então acessa `subsection.data.estado.distributionChart`. Há duplicação desnecessária em `subsection.data.distributionChart` | **JSON:** Remover dados duplicados. Manter apenas `subsection.data.estado.*` (remover campos no nível raiz de `subsection.data` como `distributionChart`, `distributionTable`) OU remover objeto `estado` aninhado se não for necessário |
| 4   | Arrays vazios em questões NPS                         | Linhas 558-560: `wordCloud: []`, `sentimentCategories: []`, `topicsByCategory: []` | 🟡 Moderado | Componentes wordCloud, sentimentCategories, topicsByCategory (se presentes no template)                                                                                                              | Componentes executam verificação de array vazio e retornam `null` ou mensagem "Nenhum dado disponível"                                                                                         | **JSON:** Preencher arrays com dados reais OU remover campos se não houver dados. Se dados não disponíveis, usar `null` em vez de `[]`                                                                                                   |
| 5   | Arrays vazios em questão open-ended                   | Linhas 879-880: `sentimentCategories: []`, `topicsByCategory: []`                  | 🟡 Moderado | Componentes sentimentCategories, topicsByCategory (se presentes no template)                                                                                                                         | Componentes executam verificação de array vazio e retornam `null`                                                                                                                              | **JSON:** Preencher arrays com dados reais OU remover campos se não houver dados                                                                                                                                                         |
| 6   | Campo `npsCategory` vazio                             | Linha 543: `"npsCategory": ""`                                                     | 🟢 Menor    | Componentes que exibem categoria NPS                                                                                                                                                                 | Código acessa `question.data.npsCategory` e recebe string vazia `""`, pode exibir vazio na UI                                                                                                  | **JSON:** Preencher com valor apropriado baseado no `npsScore` (ex: "Ruim" para negativo, "Bom" para positivo, "Excelente" para muito positivo)                                                                                          |
| 7   | Campos duplicados (`npsScore`, `wordCloud`)           | Múltiplas linhas: `npsScore` em `data.npsScore` e nível raiz                       | 🟢 Menor    | Componentes que acessam esses campos                                                                                                                                                                 | `resolveDataPath()` busca em múltiplos lugares, pode usar valor do nível raiz em vez de `data.npsScore` dependendo da ordem                                                                    | **JSON:** Remover duplicação. Manter apenas `data.npsScore` e `data.wordCloud`, remover do nível raiz da questão                                                                                                                         |
| 8   | Arrays vazios em questão single-choice                | Linhas 966-969: `wordCloud: []`, `sentimentCategories: []`, `topicsByCategory: []` | 🟢 Menor    | Componentes correspondentes (se presentes)                                                                                                                                                           | Componentes executam verificação de array vazio e retornam `null`                                                                                                                              | **JSON:** Remover campos se não forem utilizados para questões single-choice OU preencher com dados se necessário                                                                                                                        |
| 9   | Campo `label` em vez de `option` em `npsStackedChart` | Linhas 546, 550, 554: `"label": "detrator"` em vez de `"option"`                   | 🟡 Moderado | Componente `npsStackedChart` (se usado diretamente)                                                                                                                                                  | Código pode esperar campo `option` em vez de `label`. Além disso, `SchemaNPSStackedChart` verifica se é array e retorna `null` se for array                                                    | **JSON:** Alterar `"label"` para `"option"` em `npsStackedChart` (linhas 546, 550, 554). Adicionar campo `percentage` se necessário                                                                                                      |
| 10  | Campo `label` em vez de `option` em `barChart`        | Linhas 894-962: `"label": "..."` em vez de `"option"`                              | 🟡 Moderado | Componente `barChart`                                                                                                                                                                                | Código espera campo `option` para `yAxisDataKey` conforme config em `questionTemplates.js:46`                                                                                                  | **JSON:** Alterar todos os `"label"` para `"option"` no array `barChart` (linhas 894-962). Adicionar campo `percentage` se necessário                                                                                                    |

### Tabela 2: Problemas Causados por Restrições/Hardcodes do Código

| #   | Problema                                        | Localização Código                                                        | Severidade  | Restrição Real                                                                                                                   | Impacto Real                                                                                                                                                         | Sugestão de Correção                                                                                                                                                                              |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Busca hardcoded por `"responses"`               | `src/services/dataResolver.js:42-43`                                      | 🔴 Crítico  | Executa exatamente: `data.sections.find((section) => section.id === "responses")`                                                | Se `section.id` for diferente de `"responses"`, `find()` retorna `undefined`, função retorna `[]`, questões não são encontradas                                      | **JSON:** Alterar ID da seção para `"responses"` (prioridade) OU **Código:** Tornar função genérica aceitando múltiplos IDs ou usar flag no JSON                                                  |
| 2   | Busca hardcoded por `"attributes"`              | `src/services/dataResolver.js:11-12`                                      | 🔴 Crítico  | Executa exatamente: `data.sections.find((section) => section.id === "attributes")`                                               | Se `section.id` for diferente de `"attributes"`, `find()` retorna `undefined`, função retorna `[]`, atributos não são encontrados                                    | **JSON:** Garantir que seção de atributos tenha `id: "attributes"` (prioridade) OU **Código:** Tornar função genérica aceitando múltiplos IDs ou usar flag no JSON                                |
| 3   | Lógica especial apenas para `"attributes"`      | `src/components/survey/common/GenericSectionRenderer.jsx:513`             | 🟡 Moderado | Executa exatamente: `if (sectionId === "attributes" && section?.subsections)` antes de construir `sectionData`                   | Se `sectionId` for diferente, pula essa lógica e usa `section.data` diretamente. Outras seções com estrutura similar não têm `sectionData` construído da mesma forma | **JSON:** Garantir que seção de atributos tenha `id: "attributes"` e estrutura correta (prioridade) OU **Código:** Tornar genérico verificando padrão `subsection.id.startsWith(sectionId + "-")` |
| 4   | Lógica especial apenas para `"responses"`       | `src/components/survey/common/GenericSectionRenderer.jsx:525, 592`        | 🟡 Moderado | Executa exatamente: `if (sectionId === "responses")` antes de gerar subsections dinamicamente                                    | Se `sectionId` for diferente, não gera subsections dinamicamente, retorna `[]`. Outras seções não geram subsections dinamicamente de questões                        | **JSON:** Garantir que seção de questões tenha `id: "responses"` e campo `questions` (prioridade) OU **Código:** Usar flag `dynamicSubsections: true` no JSON para tornar genérico                |
| 5   | Verificação de padrão `"responses-"`            | `src/components/survey/components/ContentRenderer.jsx:64, 154`            | 🟡 Moderado | Executa exatamente: `if (section.id === "responses" && activeSection?.startsWith("responses-"))`                                 | Se padrão não corresponder, continua para próxima verificação. Subsections dinâmicas de outras seções não são reconhecidas como válidas                              | **JSON:** Garantir que subsections de questões sigam padrão `responses-{id}` (prioridade) OU **Código:** Tornar genérico extraindo prefixo antes do primeiro `-`                                  |
| 6   | Verificação de padrão `"attributes-"`           | `src/components/survey/components/ContentRenderer.jsx:71, 162`            | 🟡 Moderado | Executa exatamente: `if (section.id === "attributes" && activeSection?.startsWith("attributes-"))`                               | Se padrão não corresponder, continua para próxima verificação. Subsections dinâmicas de outras seções não são reconhecidas como válidas                              | **JSON:** Garantir que subsections de atributos sigam padrão `attributes-{id}` (prioridade) OU **Código:** Tornar genérico extraindo prefixo antes do primeiro `-`                                |
| 7   | Fallbacks hardcoded                             | `src/components/survey/components/ContentRenderer.jsx:48-54`              | 🟢 Menor    | Executa fallback apenas se `data.sections` não existir, verifica apenas: `executive`, `support`, `engagement`                    | Se `data.sections` não existir e seção não estiver no fallback, retorna `activeSection` sem normalizar                                                               | **JSON:** Garantir que `data.sections` sempre exista (prioridade) OU **Código:** Remover fallbacks ou torná-los genéricos                                                                         |
| 8   | Extração de sectionId hardcoded                 | `src/components/survey/components/ContentRenderer.jsx:225-235`            | 🟡 Moderado | Executa sequencialmente verificações apenas para: `support-`, `responses-`, `attributes-`, `executive-`, `engagement-`           | Se nenhum corresponder, `finalSectionId` permanece `null` ou usa `extractSectionId()`. Se nova seção não estiver na lista, pode não ser encontrada e mostrar erro    | **JSON:** Garantir que subsections sigam padrão `{sectionId}-{subsectionId}` (prioridade) OU **Código:** Tornar genérico extraindo prefixo antes do primeiro `-`                                  |
| 9   | Verificações em SurveySidebar                   | `src/components/survey/components/SurveySidebar.jsx:74, 80, 103, 117`     | 🟡 Moderado | Executa exatamente: `if (item.id === "attributes")` e `if (item.id === "responses")` antes de buscar subsections dinamicamente   | Se `item.id` for diferente, não busca subsections dinamicamente, retorna `[]`. Outras seções não aparecem no sidebar como dinâmicas                                  | **JSON:** Garantir que seções dinâmicas tenham `id: "attributes"` ou `id: "responses"` (prioridade) OU **Código:** Usar flag `dynamicSubsections: true` no JSON para tornar genérico              |
| 10  | Verificações em NavigationButtons               | `src/components/survey/components/NavigationButtons.jsx:120-124, 243-247` | 🟡 Moderado | Executa sequencialmente apenas: `if (subsectionId.startsWith("attributes-"))` e `if (subsectionId.startsWith("responses-"))`     | Se nenhum corresponder, `sectionId` permanece `null` e busca em `data.sections`. Padrões de outras seções não são reconhecidos                                       | **JSON:** Garantir que subsections sigam padrão `attributes-{id}` ou `responses-{id}` (prioridade) OU **Código:** Tornar genérico extraindo prefixo antes do primeiro `-`                         |
| 11  | Lógica de export hardcoded                      | `src/utils/exportHelpers.js:22, 39`                                       | 🟡 Moderado | Executa exatamente: `if (sectionId === "attributes")` e `if (sectionId === "responses")` antes de buscar subsections para export | Se `sectionId` for diferente, retorna `[]` e não exporta subsections. Outras seções podem não exportar corretamente                                                  | **JSON:** Garantir que seções dinâmicas tenham `id: "attributes"` ou `id: "responses"` (prioridade) OU **Código:** Usar flag `dynamicSubsections: true` no JSON para tornar genérico              |
| 12  | Verificação em SurveyHeader                     | `src/components/survey/components/SurveyHeader.jsx:174-191`               | 🟢 Menor    | Executa: `if (sectionId.startsWith("attributes-"))` e `if (sectionId.startsWith("responses-"))` para buscar ícone                | Se padrão não corresponder, usa fallback `FileText`. Ícones de outras seções podem não ser encontrados corretamente                                                  | **JSON:** Garantir que subsections sigam padrão `attributes-{id}` ou `responses-{id}` (prioridade) OU **Código:** Tornar genérico extraindo prefixo antes do primeiro `-`                         |
| 13  | Verificação em hasRenderSchema                  | `src/components/survey/components/ContentRenderer.jsx:105`                | 🟡 Moderado | Executa exatamente: `if (sectionId === "responses")` antes de verificar questões                                                 | Se `sectionId` for diferente, não verifica questões automaticamente. Outras seções com questões não são reconhecidas automaticamente                                 | **JSON:** Garantir que seção de questões tenha `id: "responses"` e campo `questions` (prioridade) OU **Código:** Tornar genérico verificando se seção tem campo `questions`                       |
| 14  | Verificação em normalizeSection                 | `src/components/survey/components/ContentRenderer.jsx:63-75`              | 🟡 Moderado | Executa verificações apenas para padrões `responses-*` e `attributes-*`                                                          | Se padrão não corresponder, continua para próxima verificação. Outras seções com subsections dinâmicas não são normalizadas corretamente                             | **JSON:** Garantir que subsections sigam padrão `{sectionId}-{subsectionId}` (prioridade) OU **Código:** Tornar genérico verificando padrão dinamicamente                                         |
| 15  | Verificação de array em `SchemaNPSStackedChart` | `src/components/survey/common/ChartRenderers.jsx:331`                     | 🟡 Moderado | Executa: `if (Array.isArray(chartData)) return null`                                                                             | Se `npsStackedChart` for array (formato esperado), retorna `null` e não renderiza                                                                                    | **JSON:** Formato atual (array) está correto, mas código tem bug. **Código:** Remover verificação `Array.isArray(chartData)` OU adicionar transformação de array para objeto                      |

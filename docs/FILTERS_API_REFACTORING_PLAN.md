# 📋 Plano de Refatoração: Preparação para API de Filtros

**Data:** 23/01/2026  
**Objetivo:** Preparar a lógica de sincronização de estado de filtros em `QuestionsList.jsx` para suportar a API de filtros especificada em `PEDROZA_QUESTIONS_API_SPEC.md`

---

## 🎯 Contexto

### Estado Atual

A lógica atual em `QuestionsList.jsx` tem múltiplos estados sincronizados:

1. **Filtro de Tipo de Questão** (`questionFilter`):
   - `data._filterPillsState.questionFilter` - Estado compartilhado via objeto mutável
   - `externalFilterState?.questionFilter` - Estado externo (de FilterPills)
   - `internalQuestionFilter` - Estado interno do componente

2. **Toggle Word Cloud** (`showWordCloud`):
   - `data._filterPillsState.showWordCloud` - Estado compartilhado
   - `externalFilterState?.showWordCloud` - Estado externo
   - `internalShowWordCloud` - Estado interno

3. **Filtros Dinâmicos por Questão** (`questionFilters`):
   - Estado local `questionFilters[questionId]` - Array de filtros aplicados por questão
   - Usado no `FilterPanel` para filtrar dados de cada questão individualmente

### API de Filtros (Futuro)

A API retorna filtros no formato:

```json
{
  "filters": {
    "applied": {
      "state": ["SP", "RJ"],
      "customerType": ["Pós-pago"]
    },
    "available": {
      "state": [
        { "value": "SP", "label": "São Paulo", "count": 450 },
        { "value": "RJ", "label": "Rio de Janeiro", "count": 320 }
      ],
      "customerType": [
        { "value": "Pós-pago", "label": "Pós-pago", "count": 520 }
      ]
    }
  }
}
```

**Comportamento:**
- Filtros são **cumulativos e agregados**
- Múltiplos valores no mesmo filtro: **somados** (OR)
- Diferentes filtros: **intersecção** (AND)
- Filtros são aplicados **globalmente** (não por questão)

---

## 🔄 Estratégia de Refatoração

### Fase 1: Abstrair Estado de Filtros (Preparação)

**Objetivo:** Criar uma camada de abstração que permita usar tanto o estado atual quanto a API futura.

#### 1.1. Criar Hook `useQuestionFilters`

**Localização:** `src/hooks/useQuestionFilters.js`

**Responsabilidades:**
- Gerenciar estado de filtros de tipo de questão (`questionFilter`)
- Gerenciar estado de word cloud (`showWordCloud`)
- Gerenciar filtros dinâmicos da API (`apiFilters`)
- Fornecer interface unificada para acessar/mudar filtros
- Suportar modo "local" (atual) e modo "API" (futuro)

**Interface Proposta:**

```javascript
const {
  // Filtro de tipo de questão
  questionFilter,
  setQuestionFilter,
  
  // Word cloud
  showWordCloud,
  setShowWordCloud,
  
  // Filtros dinâmicos da API
  apiFilters,        // { state: ["SP"], customerType: ["Pós-pago"] }
  setApiFilters,     // (filters) => void
  availableFilters,  // { state: [...], customerType: [...] }
  
  // Modo de operação
  mode,              // "local" | "api"
  isLoading,         // true quando carregando da API
} = useQuestionFilters({
  initialQuestionFilter,
  initialShowWordCloud,
  apiMode = false,   // true quando usando API
  surveyId,         // necessário para API
});
```

#### 1.2. Refatorar `QuestionsList.jsx`

**Mudanças:**
- Remover lógica complexa de sincronização (linhas 125-203)
- Usar `useQuestionFilters` hook
- Simplificar handlers `setQuestionFilter` e `setShowWordCloud`
- Manter compatibilidade com `externalFilterState` (para FilterPills)

**Antes:**
```javascript
// 80+ linhas de lógica complexa de sincronização
const normalizedQuestionFilter = useMemo(() => {
  const pillsFilter = data?._filterPillsState?.questionFilter;
  if (pillsFilter !== undefined) {
    return pillsFilter || "all";
  }
  return externalFilterState?.questionFilter || internalQuestionFilter || "all";
}, [data?._filterPillsState?.questionFilter, externalFilterState?.questionFilter, internalQuestionFilter, syncCounter]);
```

**Depois:**
```javascript
const {
  questionFilter: normalizedQuestionFilter,
  setQuestionFilter,
  showWordCloud,
  setShowWordCloud,
} = useQuestionFilters({
  initialQuestionFilter: externalFilterState?.questionFilter || "all",
  initialShowWordCloud: externalFilterState?.showWordCloud ?? true,
  externalFilterState, // Para compatibilidade com FilterPills
});
```

### Fase 2: Integração com API (Futuro)

**Quando a API estiver pronta:**

1. **Atualizar `useQuestionFilters`** para suportar modo API
2. **Criar serviço de API** (`src/services/questionsApi.js`)
3. **Atualizar `QuestionsList`** para usar dados da API quando disponível
4. **Atualizar `FilterPanel`** para usar filtros disponíveis da API

---

## 📝 Plano de Implementação

### Passo 1: Criar Hook `useQuestionFilters`

**Arquivo:** `src/hooks/useQuestionFilters.js`

**Funcionalidades:**
- ✅ Gerenciar estado interno de `questionFilter` e `showWordCloud`
- ✅ Sincronizar com `externalFilterState` (compatibilidade com FilterPills)
- ✅ Sincronizar com `data._filterPillsState` (compatibilidade atual)
- ✅ Preparar estrutura para filtros da API (mas não implementar ainda)
- ✅ Fornecer interface limpa e simples

### Passo 2: Refatorar `QuestionsList.jsx`

**Mudanças:**
- ✅ Remover função `resolveDataPath` duplicada (linhas 257-299)
- ✅ Remover lógica complexa de sincronização (linhas 125-203)
- ✅ Usar `useQuestionFilters` hook
- ✅ Simplificar handlers
- ✅ Manter compatibilidade com código existente

### Passo 3: Atualizar Documentação

- ✅ Atualizar `LEGACY_CODE_ANALYSIS_PART2.md` com status da refatoração
- ✅ Documentar interface do hook
- ✅ Documentar plano de migração para API

---

## 🔍 Detalhes Técnicos

### Estrutura de Estado Unificada

```javascript
// Estado interno do hook
{
  questionFilter: "all" | "nps" | "open-ended" | "multiple-choice" | "single-choice",
  showWordCloud: boolean,
  apiFilters: {
    [filterId: string]: string[]  // ex: { state: ["SP", "RJ"] }
  },
  availableFilters: {
    [filterId: string]: Array<{ value: string, label: string, count: number }>
  }
}
```

### Compatibilidade com Código Atual

**FilterPills** usa `data._filterPillsState`:
- Hook deve atualizar `data._filterPillsState` quando estado mudar
- Hook deve ler de `data._filterPillsState` quando disponível
- Manter polling se necessário (mas idealmente remover)

**QuestionsList** recebe `externalFilterState`:
- Hook deve aceitar `externalFilterState` como prop
- Hook deve sincronizar com `externalFilterState`
- Hook deve chamar callbacks de `externalFilterState` quando mudar

### Preparação para API

**Estrutura preparada mas não implementada:**
- `apiMode` flag (false por padrão)
- `apiFilters` state (vazio por padrão)
- `availableFilters` state (vazio por padrão)
- `setApiFilters` function (no-op por padrão)

**Quando API estiver pronta:**
- Adicionar lógica de fetch em `useQuestionFilters`
- Adicionar loading state
- Integrar com `QuestionsList` para usar dados da API

---

## ✅ Checklist de Implementação

### Fase 1: Preparação (Agora)

- [ ] Criar `src/hooks/useQuestionFilters.js`
- [ ] Implementar gerenciamento de estado interno
- [ ] Implementar sincronização com `externalFilterState`
- [ ] Implementar sincronização com `data._filterPillsState`
- [ ] Adicionar estrutura preparada para API (mas não implementar)
- [ ] Refatorar `QuestionsList.jsx` para usar hook
- [ ] Remover função `resolveDataPath` duplicada
- [ ] Remover lógica complexa de sincronização
- [ ] Testar compatibilidade com FilterPills
- [ ] Testar compatibilidade com código existente
- [ ] Atualizar documentação

### Fase 2: Integração com API (Futuro)

- [ ] Criar `src/services/questionsApi.js`
- [ ] Implementar fetch de filtros disponíveis
- [ ] Implementar fetch de questões com filtros
- [ ] Atualizar `useQuestionFilters` para modo API
- [ ] Atualizar `QuestionsList` para usar dados da API
- [ ] Atualizar `FilterPanel` para usar filtros da API
- [ ] Testar integração completa
- [ ] Documentar uso da API

---

## 📚 Referências

- `docs/PEDROZA_QUESTIONS_API_SPEC.md` - Especificação da API
- `src/components/survey/common/QuestionsList.jsx` - Código atual
- `src/components/survey/common/WidgetRenderers.jsx` - FilterPills component
- `src/components/survey/components/FilterPanel.jsx` - FilterPanel component

---

## 🎯 Benefícios Esperados

1. **Código mais limpo:** Reduzir 80+ linhas de lógica complexa para ~20 linhas usando hook
2. **Manutenibilidade:** Lógica de filtros centralizada em um único lugar
3. **Testabilidade:** Hook pode ser testado isoladamente
4. **Preparação para API:** Estrutura pronta para integração futura
5. **Compatibilidade:** Mantém funcionamento atual enquanto prepara para futuro

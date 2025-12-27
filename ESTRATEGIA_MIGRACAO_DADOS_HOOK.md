# Estratégia de Migração: Dados Estáticos → Hook com Simulação de API

## 📋 Objetivo

Transformar os dados estáticos de `surveyData.js` em um sistema que simula o envio de dados via JSON através de um hook React, mantendo todas as funcionalidades e estilizações existentes.

---

## 🎯 Princípios da Estratégia

### 1. **Não Quebrar Funcionalidades Existentes**

- Todos os componentes devem continuar funcionando exatamente como antes
- Manter a mesma estrutura de dados
- Preservar todas as estilizações e comportamentos

### 2. **Simular Requisição HTTP Real**

- Criar um hook que simula `fetch` ou `axios`
- Incluir estados de loading, error e success
- Adicionar delay simulado para realismo

### 3. **Facilitar Migração Futura para API Real**

- Estrutura deve permitir trocar facilmente de mock para API real
- Manter interface consistente

---

## 📐 Arquitetura Proposta

### ⚠️ **MELHORIA IMPORTANTE**: Usar React Query

O projeto já possui `@tanstack/react-query` instalado! Isso torna a solução muito mais robusta:

**Vantagens do React Query:**

- ✅ Loading/Error states built-in
- ✅ Cache automático (evita requisições duplicadas)
- ✅ Retry logic automático
- ✅ Refetching inteligente
- ✅ DevTools para debug
- ✅ Suspense support
- ✅ Otimistic updates

```
src/
├── data/
│   ├── surveyData.js          # (MANTIDO temporariamente para fallback)
│   └── surveyData.json        # (NOVO) Dados em formato JSON
├── hooks/
│   └── useSurveyData.js       # (NOVO) Hook usando React Query
├── services/
│   └── surveyDataService.js   # (NOVO) Serviço que simula API call
└── (NÃO PRECISA de Context - React Query já gerencia estado global)
```

---

## 🔄 Fases de Implementação

### **Fase 1: Preparação dos Dados JSON**

#### 1.1. Converter `surveyData.js` para JSON

- Criar `src/data/surveyData.json` com toda a estrutura atual
- Manter exatamente a mesma estrutura de objetos
- Validar que o JSON é válido

#### 1.2. Estrutura do JSON

```json
{
  "surveyInfo": { ... },
  "executiveReport": { ... },
  "supportAnalysis": { ... },
  "responseDetails": { ... },
  "attributeDeepDive": { ... },
  "implementationPlan": { ... },
  "uiTexts": { ... },
  "sectionsConfig": { ... },
  "severityLabels": { ... }
}
```

---

### **Fase 2: Criar Serviço de Simulação de API**

#### 2.1. Criar `src/services/surveyDataService.js`

```javascript
// Simula uma chamada de API com delay
export const fetchSurveyData = async () => {
  // Simula delay de rede (500ms - 1.5s)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Importa o JSON (em produção viria de uma API real)
  const response = await fetch("/src/data/surveyData.json");
  const data = await response.json();

  return data;
};
```

**Alternativa Recomendada (sem usar fetch real):**

```javascript
// Importa diretamente o JSON (simula API)
import surveyDataJson from "@/data/surveyData.json";

export const fetchSurveyData = async () => {
  // Simula delay de rede (ajustável via env)
  const delay = import.meta.env.VITE_API_DELAY || 800;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Retorna os dados (simula resposta de API)
  return surveyDataJson;
};
```

**Por que esta abordagem é melhor:**

- ✅ Não precisa configurar servidor para servir JSON
- ✅ Vite já suporta importação de JSON nativamente
- ✅ Mais simples e direto
- ✅ Delay configurável via variável de ambiente

---

### **Fase 3: Criar Hook com React Query** ⭐ **MELHOR ABORDAGEM**

#### 3.1. Criar `src/hooks/useSurveyData.js`

```javascript
import { useQuery } from "@tanstack/react-query";
import { fetchSurveyData } from "@/services/surveyDataService";

// Query key para cache do React Query
export const SURVEY_DATA_QUERY_KEY = ["surveyData"];

export const useSurveyData = () => {
  const { data, isLoading, isError, error, isFetching, isSuccess, refetch } =
    useQuery({
      queryKey: SURVEY_DATA_QUERY_KEY,
      queryFn: fetchSurveyData,
      staleTime: 5 * 60 * 1000, // 5 minutos - dados não ficam "stale" rapidamente
      gcTime: 10 * 60 * 1000, // 10 minutos - cache mantido por 10min
      retry: 2, // Tenta 2 vezes em caso de erro
      retryDelay: 1000, // 1 segundo entre tentativas
    });

  return {
    // Dados completos
    data,
    // Estados do React Query (mais granulares)
    loading: isLoading,
    isFetching,
    error: isError ? error : null,
    isSuccess,
    // Função para refetch manual
    refetch,
    // Helpers para acessar dados específicos (mantém compatibilidade)
    surveyInfo: data?.surveyInfo,
    executiveReport: data?.executiveReport,
    supportAnalysis: data?.supportAnalysis,
    responseDetails: data?.responseDetails,
    attributeDeepDive: data?.attributeDeepDive,
    implementationPlan: data?.implementationPlan,
    uiTexts: data?.uiTexts,
    sectionsConfig: data?.sectionsConfig,
    severityLabels: data?.severityLabels,
  };
};
```

**Vantagens desta abordagem:**

- ✅ **Cache automático**: Dados são cacheados, evitando requisições duplicadas
- ✅ **Retry automático**: Tenta novamente em caso de erro
- ✅ **Estados granulares**: `isLoading`, `isFetching`, `isError`, etc.
- ✅ **Refetch inteligente**: Pode refetch quando necessário
- ✅ **DevTools**: React Query DevTools para debug
- ✅ **Suspense ready**: Pronto para usar com React Suspense

---

### **Fase 4: Context Provider (OPCIONAL - React Query já gerencia estado)**

#### ⚠️ **IMPORTANTE**: React Query já gerencia estado global!

**NÃO é necessário criar um Context Provider** porque:

- React Query já mantém estado global via QueryClient
- Cache é compartilhado entre todos os componentes
- Múltiplos componentes podem usar `useSurveyData()` sem problemas
- QueryClient já está configurado no `App.jsx`

**Se quiser criar um Context (apenas para conveniência de API):**

#### 4.1. Criar `src/contexts/SurveyDataContext.jsx` (OPCIONAL)

```javascript
import { createContext, useContext } from "react";
import { useSurveyData } from "@/hooks/useSurveyData";

const SurveyDataContext = createContext(null);

// Provider opcional - apenas para facilitar acesso
export const SurveyDataProvider = ({ children }) => {
  const surveyData = useSurveyData();

  return (
    <SurveyDataContext.Provider value={surveyData}>
      {children}
    </SurveyDataContext.Provider>
  );
};

// Hook opcional - pode usar useSurveyData() diretamente também
export const useSurveyDataContext = () => {
  const context = useContext(SurveyDataContext);
  if (!context) {
    // Fallback: usar hook diretamente se não estiver em provider
    return useSurveyData();
  }
  return context;
};
```

**Recomendação**: **NÃO criar Context** - usar `useSurveyData()` diretamente em cada componente. React Query já gerencia tudo.

---

### **Fase 5: Migrar Componentes Gradualmente**

#### 5.1. Estratégia de Migração por Componente

**Opção Recomendada: Usar Hook Diretamente (React Query gerencia cache)**

```javascript
// ANTES
import { responseDetails, attributeDeepDive } from "@/data/surveyData";

// DEPOIS
import { useSurveyData } from "@/hooks/useSurveyData";

function Component() {
  const { responseDetails, attributeDeepDive, loading, error } =
    useSurveyData();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!responseDetails || !attributeDeepDive) return null;

  // resto do código (idêntico ao antes)...
}
```

**Por que esta é a melhor opção:**

- ✅ React Query já gerencia cache globalmente
- ✅ Não precisa de Context Provider
- ✅ Cada componente pode usar o hook independentemente
- ✅ Cache é compartilhado automaticamente
- ✅ Menos código, mais simples

#### 5.2. Ordem de Migração (Sugerida)

1. **SurveyLayout** (componente raiz)
2. **SurveyHeader** (usa sectionsConfig, responseDetails, attributeDeepDive)
3. **SurveySidebar** (usa surveyInfo, sectionsConfig)
4. **ContentRenderer** (usa responseDetails, attributeDeepDive)
5. **ExecutiveReport** (usa executiveReport, severityLabels, implementationPlan)
6. **SupportAnalysis** (usa supportAnalysis, uiTexts)
7. **ResponseDetails** (usa responseDetails, surveyInfo, uiTexts)
8. **AttributeDeepDive** (usa attributeDeepDive, uiTexts)
9. **FilterPanel** (usa attributeDeepDive, uiTexts)
10. **Export** (usa responseDetails, attributeDeepDive, uiTexts)

---

### **Fase 6: Tratamento de Estados (Loading/Error)**

#### 6.1. Criar Componentes de UI para Estados

```javascript
// src/components/survey/SurveyLoading.jsx
export function SurveyLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner />
        <p>Carregando dados da pesquisa...</p>
      </div>
    </div>
  );
}

// src/components/survey/SurveyError.jsx
export function SurveyError({ error, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <AlertCircle />
        <p>Erro ao carregar dados: {error.message}</p>
        <Button onClick={onRetry}>Tentar novamente</Button>
      </div>
    </div>
  );
}
```

#### 6.2. Usar no SurveyLayout

```javascript
import { useSurveyData } from "@/hooks/useSurveyData";

function SurveyLayout() {
  const { loading, error, refetch } = useSurveyData();

  if (loading) return <SurveyLoading />;
  if (error) {
    return <SurveyError error={error} onRetry={() => refetch()} />;
  }

  // Renderização normal...
  // Componentes filhos podem usar useSurveyData() também
  // React Query garante que não haverá múltiplas requisições
}
```

---

## 🔧 Configurações Necessárias

### 1. **Vite Config (para importar JSON)**

```javascript
// vite.config.js já deve suportar importação de JSON
// Se não, adicionar:
export default {
  // ... outras configs
  assetsInclude: ["**/*.json"],
};
```

### 2. **TypeScript (se aplicável)**

```typescript
// Criar tipos para os dados
export interface SurveyData {
  surveyInfo: SurveyInfo;
  executiveReport: ExecutiveReport;
  // ... outros tipos
}
```

---

## ✅ Checklist de Implementação

### Preparação

- [ ] Converter `surveyData.js` para `surveyData.json`
- [ ] Validar estrutura do JSON
- [ ] Testar importação do JSON no projeto

### Infraestrutura

- [ ] Criar `surveyDataService.js`
- [ ] Criar `useSurveyData.js` hook (usando React Query)
- [ ] (Opcional) Criar `SurveyDataContext.jsx` - **NÃO RECOMENDADO**
- [ ] Criar componentes `SurveyLoading` e `SurveyError`
- [ ] Verificar que QueryClient está configurado no App.jsx ✅ (já está)

### Migração

- [ ] (Opcional) Envolver App com `SurveyDataProvider` - **NÃO NECESSÁRIO**
- [ ] Migrar `SurveyLayout` (adicionar loading/error handling)
- [ ] Migrar `SurveyHeader`
- [ ] Migrar `SurveySidebar`
- [ ] Migrar `ContentRenderer`
- [ ] Migrar `ExecutiveReport`
- [ ] Migrar `SupportAnalysis`
- [ ] Migrar `ResponseDetails`
- [ ] Migrar `AttributeDeepDive`
- [ ] Migrar `FilterPanel`
- [ ] Migrar `Export`

### Testes

- [ ] Testar loading state
- [ ] Testar error state
- [ ] Testar todas as funcionalidades
- [ ] Validar que estilizações estão preservadas
- [ ] Testar performance

### Limpeza

- [ ] Remover imports antigos de `surveyData.js`
- [ ] (Opcional) Manter `surveyData.js` como fallback temporário
- [ ] Documentar mudanças

---

## 🚀 Vantagens desta Abordagem (com React Query)

1. **Simula Ambiente Real**: Prepara o código para migração futura para API real
2. **Mantém Compatibilidade**: Estrutura de dados idêntica
3. **Estados Robustos**: Loading, error, success, fetching (React Query)
4. **Cache Automático**: React Query gerencia cache automaticamente
5. **Retry Automático**: Tenta novamente em caso de erro
6. **Facilita Testes**: Pode mockar facilmente o serviço
7. **Melhora UX**: Loading states e error handling profissionais
8. **Performance**: Evita requisições duplicadas automaticamente
9. **DevTools**: React Query DevTools para debug
10. **Suspense Ready**: Pronto para React Suspense
11. **Refetch Inteligente**: Pode refetch quando necessário (ex: botão refresh)

---

## 🔄 Migração Futura para API Real

Quando for migrar para API real, basta alterar o serviço:

```javascript
// src/services/surveyDataService.js
export const fetchSurveyData = async () => {
  // ANTES (mock)
  // import surveyDataJson from "@/data/surveyData.json";
  // await new Promise((resolve) => setTimeout(resolve, 800));
  // return surveyDataJson;

  // DEPOIS (API real)
  const API_URL = import.meta.env.VITE_API_URL || "https://api.exemplo.com";
  const response = await fetch(`${API_URL}/api/survey/data`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados: ${response.statusText}`);
  }

  return await response.json();
};
```

**Configuração do React Query (opcional, para API real):**

```javascript
// src/App.jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 3,
      refetchOnWindowFocus: false, // Não refetch ao focar janela
    },
  },
});
```

**Nenhum componente precisa ser alterado!** 🎉

**Vantagens adicionais com API real:**

- ✅ React Query já tem retry configurado
- ✅ Cache evita requisições desnecessárias
- ✅ Pode adicionar polling se necessário
- ✅ Pode usar mutations para updates

---

## 📝 Notas Importantes

1. **Performance**: O delay simulado (800ms) pode ser ajustado via `VITE_API_DELAY` ou removido em desenvolvimento
2. **Fallback**: Manter `surveyData.js` temporariamente como fallback em caso de erro (opcional)
3. **Cache**: React Query já gerencia cache automaticamente ✅
4. **Error Handling**: React Query já tem retry logic configurado ✅
5. **Type Safety**: Se usar TypeScript, criar interfaces para todos os dados
6. **React Query DevTools**: Adicionar em desenvolvimento para debug:

   ```javascript
   import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

   // No App.jsx
   <ReactQueryDevtools initialIsOpen={false} />;
   ```

7. **Suspense**: Pode usar React Suspense com React Query para loading states mais elegantes

---

## 🎯 Próximos Passos

1. ✅ Revisar e aprovar esta estratégia (você está aqui!)
2. Implementar Fase 1 (converter para JSON)
3. Implementar Fase 2 (serviço de simulação)
4. Implementar Fase 3 (hook com React Query) ⭐
5. Testar hook isoladamente
6. Migrar componentes gradualmente (começar por SurveyLayout)
7. Testar todas as funcionalidades
8. Adicionar React Query DevTools (opcional, mas útil)
9. Remover código antigo (surveyData.js)

---

## ⚡ Resumo da Estratégia Otimizada

### O que mudou da estratégia original:

1. ✅ **Usa React Query** ao invés de hook customizado (já está instalado!)
2. ✅ **Não precisa de Context Provider** (React Query já gerencia estado)
3. ✅ **Cache automático** (sem código extra)
4. ✅ **Retry automático** (sem código extra)
5. ✅ **Mais robusto e profissional**
6. ✅ **Menos código para manter**

### Por que esta é a melhor estratégia:

- ✅ Aproveita ferramentas já instaladas (React Query)
- ✅ Segue padrões da indústria
- ✅ Mais simples (menos código)
- ✅ Mais robusto (cache, retry, etc.)
- ✅ Fácil migração futura para API real
- ✅ Mantém todas as funcionalidades existentes

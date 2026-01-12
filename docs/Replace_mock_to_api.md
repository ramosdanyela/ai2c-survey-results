# 🔌 Guia de Integração com API Real

Este documento explica como substituir a fake API (que atualmente carrega dados do JSON local) por uma API real para usar os hooks do código.

## 📋 Índice

1. [Visão Geral da Estrutura Atual](#visão-geral)
2. [Passo a Passo para Substituir](#passo-a-passo)
3. [Estrutura Esperada da API](#estrutura-esperada)
4. [Configuração de Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Tratamento de Erros](#tratamento-de-erros)
6. [Autenticação](#autenticação)
7. [Exemplos Completos](#exemplos-completos)

---

## 🎯 Visão Geral da Estrutura Atual

### Como Funciona Atualmente

A aplicação usa uma **fake API** que simula chamadas HTTP:

1. **Hook**: `useSurveyData()` - Hook React Query que busca dados
2. **Service**: `surveyDataService.js` - Simula chamada de API importando JSON local
3. **Dados**: `surveyData.json` - Arquivo JSON com todos os dados da pesquisa

### Fluxo Atual

```
Componente → useSurveyData() → fetchSurveyData() → surveyData.json
```

### Arquivos Envolvidos

- `src/hooks/useSurveyData.js` - Hook que usa React Query
- `src/services/surveyDataService.js` - Função que simula a API
- `src/data/surveyData.json` - Dados mockados
- `src/App.jsx` - Configuração do React Query

---

## 🔧 Passo a Passo para Substituir

### Passo 1: Configurar Variável de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# URL da API real
VITE_API_URL=https://api.exemplo.com/v1

# Endpoint específico para dados da pesquisa
VITE_SURVEY_DATA_ENDPOINT=/survey/data

# Opcional: Token de autenticação (se necessário)
VITE_API_TOKEN=seu-token-aqui

# Opcional: Timeout para requisições (em ms)
VITE_API_TIMEOUT=30000
```

### Passo 2: Atualizar o Service

Edite o arquivo `src/services/surveyDataService.js`:

```javascript
// ============================================================
// SURVEY DATA SERVICE - Integração com API Real
// ============================================================

/**
 * Busca dados da pesquisa da API real
 *
 * @returns {Promise<Object>} Dados completos da pesquisa
 * @throws {Error} Se houver erro ao carregar dados
 */
export const fetchSurveyData = async () => {
  try {
    // Obter URL da API das variáveis de ambiente
    const apiUrl = import.meta.env.VITE_API_URL;
    const endpoint =
      import.meta.env.VITE_SURVEY_DATA_ENDPOINT || "/survey/data";
    const fullUrl = `${apiUrl}${endpoint}`;

    // Configurar headers
    const headers = {
      "Content-Type": "application/json",
    };

    // Adicionar token de autenticação se existir
    const apiToken = import.meta.env.VITE_API_TOKEN;
    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }

    // Configurar timeout
    const timeout = import.meta.env.VITE_API_TIMEOUT
      ? parseInt(import.meta.env.VITE_API_TIMEOUT, 10)
      : 30000;

    // Criar AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Fazer requisição
    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    });

    // Limpar timeout
    clearTimeout(timeoutId);

    // Verificar se a resposta é OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Erro ao buscar dados: ${response.status} ${response.statusText}`
      );
    }

    // Parsear e retornar dados
    const data = await response.json();

    // Validar estrutura básica (opcional)
    if (!data || typeof data !== "object") {
      throw new Error("Resposta da API inválida: dados não são um objeto");
    }

    return data;
  } catch (error) {
    // Tratamento de erros específicos
    if (error.name === "AbortError") {
      throw new Error("Timeout: A requisição demorou muito para responder");
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Erro de conexão: Verifique sua internet e a URL da API");
    }

    // Re-throw erros já tratados
    if (error.message) {
      throw error;
    }

    // Erro genérico
    console.error("Erro ao buscar dados da pesquisa:", error);
    throw new Error("Falha ao carregar dados da pesquisa");
  }
};

/**
 * Função auxiliar para fazer requisições autenticadas
 * (Opcional: use se precisar de mais endpoints)
 */
export const apiRequest = async (endpoint, options = {}) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiToken = import.meta.env.VITE_API_TOKEN;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (apiToken) {
    headers["Authorization"] = `Bearer ${apiToken}`;
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};
```

### Passo 3: Verificar Configuração do React Query

O React Query já está configurado no `App.jsx`. Você pode ajustar as opções de cache se necessário:

```javascript
// src/App.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Configurar QueryClient com opções personalizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
      retry: 2, // Tentar 2 vezes em caso de erro
      retryDelay: 1000, // 1 segundo entre tentativas
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* ... resto do código ... */}
  </QueryClientProvider>
);
```

### Passo 4: Usar o Hook nos Componentes

O hook `useSurveyData()` já funciona da mesma forma, não precisa mudar nada nos componentes:

```javascript
import { useSurveyData } from "@/hooks/useSurveyData";

function MeuComponente() {
  const {
    data, // Dados completos
    loading, // Estado de carregamento
    error, // Erro (se houver)
    isSuccess, // Se carregou com sucesso
    refetch, // Função para refetch manual
    surveyInfo, // Helper: dados de surveyInfo
    executiveReport, // Helper: dados de executiveReport
  } = useSurveyData();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  if (!isSuccess) return null;

  return (
    <div>
      <h1>{surveyInfo?.title}</h1>
      {/* ... resto do componente ... */}
    </div>
  );
}
```

---

## 📊 Estrutura Esperada da API

### Formato da Resposta

A API deve retornar um JSON com a mesma estrutura do `surveyData.json`. A estrutura mínima esperada:

```json
{
  "surveyInfo": {
    "title": "Pesquisa de Satisfação do Cliente 2024",
    "company": "TechCorp Brasil",
    "period": "Outubro - Novembro 2024",
    "totalRespondents": 1247,
    "responseRate": 68.5,
    "nps": -21,
    "npsCategory": "Ruim"
  },
  "executiveReport": {
    "summary": {
      /* ... */
    },
    "recommendations": [
      /* ... */
    ]
  },
  "supportAnalysis": {
    "sentimentAnalysis": {
      /* ... */
    },
    "respondentIntent": {
      /* ... */
    },
    "segmentation": [
      /* ... */
    ]
  },
  "responseDetails": {
    "closedQuestions": [
      /* ... */
    ],
    "openQuestions": [
      /* ... */
    ]
  },
  "attributeDeepDive": {
    "attributes": [
      /* ... */
    ]
  },
  "uiTexts": {
    /* ... textos da interface ... */
  },
  "sectionsConfig": {
    "sections": [
      /* ... */
    ]
  }
}
```

### Endpoints Sugeridos

Se sua API tiver múltiplos endpoints, você pode estruturar assim:

```
GET /api/v1/survey/data          # Dados completos (endpoint principal)
GET /api/v1/survey/info          # Apenas surveyInfo
GET /api/v1/survey/executive     # Apenas executiveReport
GET /api/v1/survey/responses     # Apenas responseDetails
```

**Nota**: O código atual espera todos os dados em uma única resposta. Se sua API tiver endpoints separados, você precisará fazer múltiplas requisições e combinar os dados.

---

## 🔐 Variáveis de Ambiente

### Arquivo `.env`

```env
# URL base da API
VITE_API_URL=https://api.exemplo.com/v1

# Endpoint para dados da pesquisa
VITE_SURVEY_DATA_ENDPOINT=/survey/data

# Autenticação (Bearer Token)
VITE_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Timeout em milissegundos (padrão: 30000 = 30s)
VITE_API_TIMEOUT=30000

# Modo de desenvolvimento (usa dados locais se true)
VITE_USE_MOCK_DATA=false
```

### Arquivo `.env.example`

Crie um arquivo `.env.example` (sem valores sensíveis) para documentar as variáveis:

```env
VITE_API_URL=https://api.exemplo.com/v1
VITE_SURVEY_DATA_ENDPOINT=/survey/data
VITE_API_TOKEN=
VITE_API_TIMEOUT=30000
VITE_USE_MOCK_DATA=false
```

### Usando Variáveis de Ambiente

No código, acesse via `import.meta.env.VITE_*`:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
const token = import.meta.env.VITE_API_TOKEN;
```

**⚠️ Importante**:

- Variáveis devem começar com `VITE_` para serem expostas no cliente
- Nunca commite o arquivo `.env` com tokens reais
- Use `.env.local` para valores locais que não devem ser commitados

---

## ⚠️ Tratamento de Erros

### Erros Comuns e Soluções

#### 1. Erro de CORS

**Sintoma**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solução**: Configure CORS no backend:

```javascript
// Exemplo Express.js
app.use(
  cors({
    origin: "http://localhost:5173", // URL do frontend
    credentials: true,
  })
);
```

#### 2. Erro 401 (Não Autorizado)

**Sintoma**: `401 Unauthorized`

**Solução**: Verifique se o token está correto e não expirou:

```javascript
// Adicionar refresh token se necessário
if (response.status === 401) {
  // Tentar refresh token
  await refreshToken();
  // Refazer requisição
  return fetchSurveyData();
}
```

#### 3. Erro 404 (Não Encontrado)

**Sintoma**: `404 Not Found`

**Solução**: Verifique se a URL e o endpoint estão corretos:

```javascript
console.log("URL completa:", `${apiUrl}${endpoint}`);
```

#### 4. Timeout

**Sintoma**: `Timeout: A requisição demorou muito para responder`

**Solução**: Aumente o timeout ou otimize a API:

```env
VITE_API_TIMEOUT=60000  # 60 segundos
```

### Exibindo Erros na UI

O hook `useSurveyData()` já expõe o erro. Use assim:

```javascript
const { error, loading } = useSurveyData();

if (error) {
  return (
    <div className="error">
      <h2>Erro ao carregar dados</h2>
      <p>{error.message}</p>
      <button onClick={() => refetch()}>Tentar novamente</button>
    </div>
  );
}
```

---

## 🔑 Autenticação

### Bearer Token (Recomendado)

O código já suporta Bearer Token via variável de ambiente:

```env
VITE_API_TOKEN=seu-token-aqui
```

### Autenticação Dinâmica

Se você precisar obter o token dinamicamente (ex: login), crie um serviço de autenticação:

```javascript
// src/services/authService.js
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem("authToken", token);
};

export const getAuthToken = () => {
  if (!authToken) {
    authToken = localStorage.getItem("authToken");
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("authToken");
};
```

E atualize o `surveyDataService.js`:

```javascript
import { getAuthToken } from "./authService";

export const fetchSurveyData = async () => {
  const token = getAuthToken() || import.meta.env.VITE_API_TOKEN;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ... resto do código ...
};
```

### Refresh Token

Para implementar refresh token automático:

```javascript
// src/services/authService.js
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  const response = await fetch(`${apiUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (response.ok) {
    const { accessToken } = await response.json();
    setAuthToken(accessToken);
    return accessToken;
  }

  throw new Error("Failed to refresh token");
};
```

---

## 💡 Exemplos Completos

### Exemplo 1: API Simples (Sem Autenticação)

```javascript
// src/services/surveyDataService.js
export const fetchSurveyData = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const endpoint = import.meta.env.VITE_SURVEY_DATA_ENDPOINT || "/survey/data";

  const response = await fetch(`${apiUrl}${endpoint}`);

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
```

### Exemplo 2: API com Autenticação e Retry

```javascript
// src/services/surveyDataService.js
import { getAuthToken, refreshToken } from "./authService";

const makeRequest = async (url, retries = 2) => {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, { headers });

    // Se token expirou, tentar refresh
    if (response.status === 401 && retries > 0) {
      await refreshToken();
      return makeRequest(url, retries - 1);
    }

    if (!response.ok) {
      throw new Error(`Erro ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (retries > 0) {
      // Retry com backoff exponencial
      await new Promise((resolve) => setTimeout(resolve, 1000 * (3 - retries)));
      return makeRequest(url, retries - 1);
    }
    throw error;
  }
};

export const fetchSurveyData = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const endpoint = import.meta.env.VITE_SURVEY_DATA_ENDPOINT || "/survey/data";

  return makeRequest(`${apiUrl}${endpoint}`);
};
```

### Exemplo 3: Modo de Desenvolvimento (Fallback para Mock)

```javascript
// src/services/surveyDataService.js
import surveyDataJson from "@/data/surveyData.json";

export const fetchSurveyData = async () => {
  // Se estiver em modo de desenvolvimento e USE_MOCK_DATA=true, usar dados locais
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";
  const isDevelopment = import.meta.env.DEV;

  if (useMockData && isDevelopment) {
    console.warn("⚠️ Usando dados mockados (modo desenvolvimento)");
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));
    return surveyDataJson;
  }

  // Requisição real para API
  const apiUrl = import.meta.env.VITE_API_URL;
  const endpoint = import.meta.env.VITE_SURVEY_DATA_ENDPOINT || "/survey/data";

  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(import.meta.env.VITE_API_TOKEN && {
        Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
      }),
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados: ${response.status}`);
  }

  return response.json();
};
```

---

## ✅ Checklist de Migração

Use este checklist para garantir que tudo está funcionando:

- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] Arquivo `.env` adicionado ao `.gitignore`
- [ ] `surveyDataService.js` atualizado com fetch real
- [ ] Testado em ambiente de desenvolvimento
- [ ] Autenticação funcionando (se aplicável)
- [ ] Tratamento de erros implementado
- [ ] Loading states funcionando nos componentes
- [ ] Erros sendo exibidos corretamente na UI
- [ ] CORS configurado no backend (se necessário)
- [ ] Timeout configurado adequadamente
- [ ] Documentação da API atualizada

---

## 🆘 Troubleshooting

### Problema: Dados não carregam

**Verificações**:

1. Abra o DevTools (F12) → Network tab
2. Verifique se a requisição está sendo feita
3. Verifique o status code da resposta
4. Verifique se a URL está correta no console

### Problema: Erro de CORS

**Solução**: Configure o backend para aceitar requisições do frontend:

```javascript
// Backend (Express.js exemplo)
const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173" }));
```

### Problema: Token não funciona

**Verificações**:

1. Token está correto no `.env`?
2. Token não expirou?
3. Header `Authorization` está sendo enviado?
4. Backend está esperando o formato correto?

---

## 📚 Recursos Adicionais

- [React Query Documentation](https://tanstack.com/query/latest)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Última atualização**: 2024

# 📖 Exemplo de Uso do Hook

Este documento mostra como usar o hook `useSurveyData` nos componentes.

---

## 🎯 Exemplo Básico

### Antes (Import Direto)

```javascript
import { surveyInfo, executiveReport } from "@/data/surveyData";

function Component() {
  // Usa diretamente
  return <div>{surveyInfo.title}</div>;
}
```

### Depois (Com Hook)

```javascript
import { useSurveyData } from "@/hooks/useSurveyData";
import { SurveyLoading } from "@/components/survey/SurveyLoading";
import { SurveyError } from "@/components/survey/SurveyError";

function Component() {
  const { surveyInfo, executiveReport, loading, error, refetch } =
    useSurveyData();

  if (loading) return <SurveyLoading />;
  if (error) return <SurveyError error={error} onRetry={refetch} />;
  if (!surveyInfo) return null;

  return <div>{surveyInfo.title}</div>;
}
```

---

## 🔄 Exemplo Completo: SurveyLayout

```javascript
import { useSurveyData } from "@/hooks/useSurveyData";
import { SurveyLoading } from "@/components/survey/SurveyLoading";
import { SurveyError } from "@/components/survey/SurveyError";
import { ContentRenderer } from "@/components/survey/ContentRenderer";

export function SurveyLayout({ activeSection, onSectionChange }) {
  const { loading, error, refetch } = useSurveyData();

  // Estados de loading e error
  if (loading) return <SurveyLoading />;
  if (error) {
    return <SurveyError error={error} onRetry={refetch} />;
  }

  // Renderização normal (componentes filhos podem usar useSurveyData também)
  return (
    <div>
      <ContentRenderer
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
    </div>
  );
}
```

---

## 📦 Exemplo: Componente que Usa Dados Específicos

```javascript
import { useSurveyData } from "@/hooks/useSurveyData";
import { SurveyLoading } from "@/components/survey/SurveyLoading";

function ExecutiveReport({ subSection }) {
  // Pode usar o hook diretamente - React Query gerencia cache
  const { executiveReport, loading } = useSurveyData();

  if (loading) return <SurveyLoading />;
  if (!executiveReport) return null;

  // Usa os dados normalmente
  return (
    <div>
      <h1>{executiveReport.summary.aboutStudy}</h1>
      {/* resto do componente */}
    </div>
  );
}
```

---

## ⚡ Vantagens do React Query

### 1. **Cache Automático**

```javascript
// Componente A
const { surveyInfo } = useSurveyData(); // Faz requisição

// Componente B (mesmo render)
const { surveyInfo } = useSurveyData(); // Usa cache, não faz nova requisição!
```

### 2. **Refetch Manual**

```javascript
function RefreshButton() {
  const { refetch, isFetching } = useSurveyData();

  return (
    <Button onClick={refetch} disabled={isFetching}>
      {isFetching ? "Atualizando..." : "Atualizar"}
    </Button>
  );
}
```

### 3. **Estados Granulares**

```javascript
const {
  loading, // Primeira carga
  isFetching, // Qualquer busca (inclui refetch)
  isSuccess, // Sucesso
  isError, // Erro
  error, // Objeto de erro
} = useSurveyData();
```

---

## 🚨 Tratamento de Erros

```javascript
function Component() {
  const { data, error, isError, refetch } = useSurveyData();

  if (isError) {
    return (
      <div>
        <p>Erro: {error.message}</p>
        <button onClick={refetch}>Tentar novamente</button>
      </div>
    );
  }

  // resto do componente
}
```

---

## 📝 Notas Importantes

1. **Múltiplos Componentes**: Vários componentes podem usar `useSurveyData()` simultaneamente - React Query gerencia cache automaticamente
2. **Loading States**: Use `loading` para primeira carga, `isFetching` para refetch
3. **Error Handling**: Sempre verifique `isError` antes de usar `error`
4. **Null Safety**: Sempre verifique se dados existem antes de usar: `if (!surveyInfo) return null;`

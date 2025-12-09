# Estratégia de Migração: TSX → JSX

## 📋 Objetivo

Converter todos os arquivos `.tsx` para `.jsx` sem quebrar o código, **excluindo** a pasta `src/components/ui/`.

---

## 📁 Arquivos a Migrar

### 1. Arquivos Raiz

- `src/App.tsx` → `src/App.jsx`
- `src/main.tsx` → `src/main.jsx` (⚠️ **ATENÇÃO**: Este é `.tsx`, mas pode precisar ser `.ts` se não tiver JSX)

### 2. Páginas (`src/pages/`)

- `src/pages/Index.tsx` → `src/pages/Index.jsx`
- `src/pages/NotFound.tsx` → `src/pages/NotFound.jsx`

### 3. Componentes (`src/components/`)

- `src/components/ThemeToggle.tsx` → `src/components/ThemeToggle.jsx`
- `src/components/NavLink.tsx` → `src/components/NavLink.jsx`

### 4. Componentes Survey (`src/components/survey/`)

- `src/components/survey/AttributeDeepDive.tsx` → `src/components/survey/AttributeDeepDive.jsx`
- `src/components/survey/charts/Charts.tsx` → `src/components/survey/charts/Charts.jsx`
- `src/components/survey/ContentRenderer.tsx` → `src/components/survey/ContentRenderer.jsx`
- `src/components/survey/ExecutiveReport.tsx` → `src/components/survey/ExecutiveReport.jsx`
- `src/components/survey/FilterPanel.tsx` → `src/components/survey/FilterPanel.jsx`
- `src/components/survey/ImplementationPlan.tsx` → `src/components/survey/ImplementationPlan.jsx`
- `src/components/survey/ResponseDetails.tsx` → `src/components/survey/ResponseDetails.jsx`
- `src/components/survey/SupportAnalysis.tsx` → `src/components/survey/SupportAnalysis.jsx`
- `src/components/survey/SurveyHeader.tsx` → `src/components/survey/SurveyHeader.jsx`
- `src/components/survey/SurveyLayout.tsx` → `src/components/survey/SurveyLayout.jsx`
- `src/components/survey/SurveySidebar.tsx` → `src/components/survey/SurveySidebar.jsx`
- `src/components/survey/WordCloud.tsx` → `src/components/survey/WordCloud.jsx` (se existir)

### 5. Contextos (`src/contexts/`)

- `src/contexts/ThemeContext.tsx` → `src/contexts/ThemeContext.jsx`

---

## 🔍 Análise de Dependências TypeScript

### Tipos e Interfaces Identificados

#### 1. **Props de Componentes**

- `interface ThemeToggleProps` → Remover, usar PropTypes ou JSDoc
- `interface SurveyLayoutProps` → Remover
- `interface SurveyHeaderProps` → Remover
- `interface FilterPanelProps` → Remover
- `interface NavLinkCompatProps` → Remover
- `interface ThemeContextType` → Remover

#### 2. **Tipos de Dados**

- `type FilterType` → Remover ou converter para JSDoc
- `type QuestionFilter` → Remover ou converter para JSDoc
- `type Theme` → Importar de `@/lib/colors` (já é `.ts`)
- `export type FilterValue` → Remover ou converter para JSDoc

#### 3. **Tipos de Bibliotecas Externas**

- `React.ReactNode` → Manter como está (React aceita)
- `NavLinkProps` (react-router-dom) → Manter importação
- Tipos do Recharts (`SentimentDataItem`, `NPSData`, etc.) → Converter para JSDoc ou manter como comentários

#### 4. **Refs e Generics**

- `useRef<HTMLAsideElement>` → `useRef(null)` e adicionar JSDoc
- `forwardRef<HTMLAnchorElement, ...>` → `forwardRef` sem generic

---

## 🛠️ Estratégia de Conversão

### Fase 1: Preparação

1. **Backup do Projeto**

   ```bash
   git add -A
   git commit -m "Backup antes da migração TSX → JSX"
   ```

2. **Verificar Dependências**
   - Confirmar que `tsconfig.json` tem `"allowJs": true` ✅ (já está)
   - Verificar se Vite suporta `.jsx` ✅ (suporta)

### Fase 2: Conversão por Categoria

#### 2.1 Arquivos Simples (Sem Tipos Complexos)

**Prioridade: Alta** - Menor risco

1. `src/pages/NotFound.tsx`
2. `src/pages/Index.tsx`
3. `src/App.tsx`

**Ações:**

- Remover `interface` e `type`
- Manter imports do React
- Converter extensão `.tsx` → `.jsx`

#### 2.2 Componentes com Props Tipadas

**Prioridade: Média** - Requer atenção

1. `src/components/ThemeToggle.tsx`
2. `src/components/NavLink.tsx`
3. `src/components/survey/SurveyHeader.tsx`
4. `src/components/survey/SurveyLayout.tsx`

**Ações:**

- Remover `interface PropsName`
- Adicionar JSDoc para documentação:
  ```jsx
  /**
   * @param {Object} props
   * @param {string} props.activeSection
   * @param {Function} props.onSectionChange
   */
  ```
- Converter extensão `.tsx` → `.jsx`

#### 2.3 Componentes com Tipos Complexos

**Prioridade: Baixa** - Maior complexidade

1. `src/components/survey/FilterPanel.tsx`
   - `export type FilterType`
   - `export interface FilterValue`
   - `type QuestionFilter`
2. `src/components/survey/charts/Charts.tsx`
   - `export interface SentimentDataItem`
   - `export interface NPSData`
   - `export interface SimpleBarDataItem`

**Ações:**

- Converter tipos exportados para JSDoc ou comentários
- Manter tipos como constantes de string se necessário:
  ```jsx
  // FilterType: "state" | "customerType" | "education" | null
  const FILTER_TYPES = {
    STATE: "state",
    CUSTOMER_TYPE: "customerType",
    EDUCATION: "education",
    NULL: null,
  };
  ```

#### 2.4 Contextos

**Prioridade: Média**

1. `src/contexts/ThemeContext.tsx`
   - `interface ThemeContextType`
   - `type Theme` (importado de `@/lib/colors`)

**Ações:**

- Remover `interface ThemeContextType`
- Manter import de `Theme` de `@/lib/colors` (arquivo `.ts` permanece)
- Adicionar JSDoc para o contexto

#### 2.5 Arquivo Main

**Prioridade: Alta** - Ponto de entrada

1. `src/main.tsx`
   - Verificar se tem JSX (tem: `<App />`)
   - Converter para `.jsx`

**Ações:**

- Converter `.tsx` → `.jsx`
- Remover `!` (non-null assertion) ou substituir por verificação:
  ```jsx
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");
  createRoot(rootElement).render(<App />);
  ```

### Fase 3: Atualização de Imports

#### 3.1 Imports Relativos

Todos os imports que referenciam arquivos `.tsx` devem ser atualizados:

**Antes:**

```tsx
import App from "./App.tsx";
```

**Depois:**

```jsx
import App from "./App.jsx";
// OU (sem extensão - Vite resolve automaticamente)
import App from "./App";
```

#### 3.2 Imports de Aliases

Imports com `@/` não precisam de extensão:

```jsx
// ✅ Correto
import { ThemeToggle } from "@/components/ThemeToggle";
import { SurveyLayout } from "@/components/survey/SurveyLayout";
```

#### 3.3 Arquivos a Atualizar

- `src/main.jsx` (import de `App.tsx`)
- Todos os arquivos que importam componentes migrados

### Fase 4: Remoção de Sintaxes TypeScript

#### 4.1 Type Annotations

```tsx
// ❌ Antes
const [theme, setThemeState] = useState<Theme>(() => { ... });
const sidebarRef = useRef<HTMLAsideElement>(null);

// ✅ Depois
const [theme, setThemeState] = useState(() => { ... });
const sidebarRef = useRef(null);
```

#### 4.2 Interface Props

```tsx
// ❌ Antes
interface Props {
  activeSection: string;
  onSectionChange: (section: string) => void;
}
export function Component({ activeSection, onSectionChange }: Props) { ... }

// ✅ Depois
/**
 * @param {string} activeSection
 * @param {Function} onSectionChange
 */
export function Component({ activeSection, onSectionChange }) { ... }
```

#### 4.3 Type Assertions

```tsx
// ❌ Antes
const savedTheme = localStorage.getItem("theme") as Theme | null;
document.getElementById("root")!

// ✅ Depois
const savedTheme = localStorage.getItem("theme");
if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) { ... }
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
```

#### 4.4 Generic Types

```tsx
// ❌ Antes
forwardRef<HTMLAnchorElement, NavLinkCompatProps>(...)
Record<string, string>
Record<string, typeof FileText>

// ✅ Depois
forwardRef(...)
// Usar objetos JavaScript normais
const sectionTitles = { ... };
const sectionIcons = { ... };
```

#### 4.5 Type Exports

```tsx
// ❌ Antes
export type FilterType = "state" | "customerType" | "education" | null;
export interface FilterValue { ... }

// ✅ Depois
// Remover ou converter para JSDoc
/**
 * @typedef {("state" | "customerType" | "education" | null)} FilterType
 */
/**
 * @typedef {Object} FilterValue
 * @property {FilterType} filterType
 * @property {string[]} values
 */
```

### Fase 5: Verificação e Testes

#### 5.1 Checklist de Verificação

- [ ] Todos os arquivos `.tsx` (exceto `ui/`) foram convertidos
- [ ] Imports atualizados (com ou sem extensão)
- [ ] Sem erros de sintaxe TypeScript
- [ ] Aplicação compila sem erros
- [ ] Aplicação executa sem erros de runtime
- [ ] Funcionalidades principais testadas manualmente

#### 5.2 Comandos de Verificação

```bash
# Verificar se compila
npm run build

# Verificar lint
npm run lint

# Executar em desenvolvimento
npm run dev
```

#### 5.3 Testes Manuais

- [ ] Navegação entre seções funciona
- [ ] Filtros funcionam
- [ ] Tema (dark/light) funciona
- [ ] Gráficos renderizam corretamente
- [ ] Rotas funcionam

---

## 📝 Padrões de Conversão

### Padrão 1: Componente Simples

```tsx
// ANTES
interface Props {
  className?: string;
}
export function Component({ className }: Props) {
  return <div className={className}>Content</div>;
}
```

```jsx
// DEPOIS
/**
 * @param {Object} props
 * @param {string} [props.className]
 */
export function Component({ className }) {
  return <div className={className}>Content</div>;
}
```

### Padrão 2: Componente com useState Tipado

```tsx
// ANTES
const [theme, setTheme] = useState<Theme>("dark");
```

```jsx
// DEPOIS
const [theme, setTheme] = useState("dark");
```

### Padrão 3: Componente com useRef Tipado

```tsx
// ANTES
const ref = useRef<HTMLDivElement>(null);
```

```jsx
// DEPOIS
/** @type {import('react').MutableRefObject<HTMLDivElement | null>} */
const ref = useRef(null);
```

### Padrão 4: forwardRef com Tipos

```tsx
// ANTES
const Component = forwardRef<HTMLButtonElement, Props>(({ children }, ref) => (
  <button ref={ref}>{children}</button>
));
```

```jsx
// DEPOIS
const Component = forwardRef(({ children }, ref) => (
  <button ref={ref}>{children}</button>
));
```

### Padrão 5: Record Types

```tsx
// ANTES
const sectionTitles: Record<string, string> = { ... };
const sectionIcons: Record<string, typeof FileText> = { ... };
```

```jsx
// DEPOIS
const sectionTitles = { ... };
const sectionIcons = { ... };
```

---

## ⚠️ Pontos de Atenção

### 1. Arquivos `.ts` que Permanecem

- `src/lib/colors.ts` - Contém tipos TypeScript (`type Theme`)
- `src/lib/utils.ts` - Pode conter tipos
- `src/data/surveyData.ts` - Dados
- `src/hooks/*.ts` - Hooks (se existirem)
- `src/vite-env.d.ts` - Declarações de tipos

**Solução:** Manter como `.ts` e importar normalmente no JSX.

### 2. Imports de Tipos

```tsx
// ❌ Não funciona em JSX
import type { Theme } from "@/lib/colors";
```

```jsx
// ✅ Funciona (importa o valor, não o tipo)
import { Theme } from "@/lib/colors"; // Se Theme for um valor
// OU simplesmente não importar o tipo, usar string literal
```

### 3. Non-null Assertions

```tsx
// ❌ Não funciona em JSX
document.getElementById("root")!;
```

```jsx
// ✅ Adicionar verificação
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");
createRoot(root).render(<App />);
```

### 4. Type Guards

Manter lógica de validação:

```jsx
// ✅ Manter validação
if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
  return savedTheme;
}
```

### 5. Exports de Tipos

Se outros arquivos importam tipos exportados:

- Opção 1: Converter para JSDoc e documentar
- Opção 2: Criar arquivo `.d.ts` com declarações de tipos
- Opção 3: Remover export e usar inline

---

## 🔄 Ordem de Execução Recomendada

1. **Fase 1: Preparação** (Backup, verificação)
2. **Fase 2.1: Arquivos Simples** (NotFound, Index, App)
3. **Fase 2.5: Main** (main.tsx)
4. **Fase 2.2: Componentes com Props** (ThemeToggle, NavLink, SurveyHeader, SurveyLayout)
5. **Fase 2.4: Contextos** (ThemeContext)
6. **Fase 2.3: Componentes Complexos** (FilterPanel, Charts, outros survey)
7. **Fase 3: Atualização de Imports** (em todos os arquivos)
8. **Fase 4: Limpeza** (remover sintaxes TS restantes)
9. **Fase 5: Verificação** (build, lint, testes)

---

## 📊 Resumo

- **Total de arquivos a migrar:** ~15-20 arquivos
- **Arquivos excluídos:** Todos em `src/components/ui/`
- **Risco:** Médio (projeto já tem `allowJs: true`)
- **Tempo estimado:** 2-4 horas (dependendo da complexidade)

---

## ✅ Checklist Final

- [ ] Backup criado
- [ ] Todos os arquivos `.tsx` (exceto `ui/`) convertidos para `.jsx`
- [ ] Imports atualizados
- [ ] Sintaxes TypeScript removidas
- [ ] JSDoc adicionado onde necessário
- [ ] Build funciona (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] Aplicação funciona (`npm run dev`)
- [ ] Testes manuais realizados
- [ ] Documentação atualizada (se necessário)

---

## 🚨 Rollback

Se algo der errado:

```bash
git reset --hard HEAD
# OU
git checkout -- .
```

---

**Data de Criação:** $(date)
**Versão:** 1.0

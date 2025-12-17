# Relatório de Origem das Cores nos Componentes

Este documento mapeia todas as cores utilizadas nos componentes e suas origens.

## 📋 Resumo Executivo

As cores nos componentes vêm de **4 fontes principais**:

1. **`src/lib/colors.js`** - Arquivo centralizado de constantes de cores
2. **Variáveis CSS** - Definidas em `src/index.css` (usando `hsl(var(--nome-variavel))`)
3. **Cores hardcoded** - Valores hex/rgb/rgba/hsl diretamente no código
4. **Classes Tailwind** - Classes utilitárias do Tailwind CSS

---

## 1. Cores Importadas de `src/lib/colors.js`

### Componentes que importam de `colors.js`:

#### `SurveyHeader.jsx`

- `COLOR_ORANGE_PRIMARY` - Usado em `backgroundColor` do título
- `RGBA_ORANGE_SHADOW_40` - Usado em `boxShadow` do título
- `RGBA_BLACK_SHADOW_20` - Usado em `boxShadow` do header

#### `SurveySidebar.jsx`

- `RGBA_BLACK_SHADOW_20` - Usado em sombras
- `RGBA_ORANGE_SHADOW_20` - Usado em sombras
- `COLOR_ORANGE_PRIMARY` - Usado em `color` de elementos destacados

#### `ResponseDetails.jsx`

- `COLOR_ORANGE_PRIMARY` - Usado em `color` de elementos destacados
- `RGBA_ORANGE_SHADOW_15` - Usado em sombras
- `RGBA_ORANGE_SHADOW_20` - Usado em sombras
- `RGBA_BLACK_SHADOW_30` - Usado em sombras

#### `AttributeDeepDive.jsx`

- `RGBA_BLACK_SHADOW_20` - Usado em sombras

#### `ExecutiveReport.jsx`

- `COLOR_ORANGE_PRIMARY` - Usado em `borderLeftColor`

#### `ImplementationPlan.jsx`

- `COLOR_ORANGE_PRIMARY` - Importado mas não usado diretamente (usado via classes Tailwind)

#### `card.tsx` (UI Component)

- `RGBA_BLACK_SHADOW_40` - Usado em `boxShadow` padrão
- `RGBA_ORANGE_SHADOW_10` - Usado em `boxShadow` padrão
- `RGBA_BLACK_SHADOW_60` - Usado em `boxShadow` hover
- `RGBA_ORANGE_SHADOW_20` - Usado em `boxShadow` hover

#### `tabs.tsx` (UI Component)

- `RGBA_BLACK_SHADOW_20` - Usado em `boxShadow` do TabsList

#### `sheet.tsx` (UI Component)

- `COLOR_ORANGE_PRIMARY` - Importado mas não usado diretamente

#### `table.tsx` (UI Component)

- `COLOR_ORANGE_PRIMARY` - Importado mas não usado diretamente

---

## 2. Cores de Variáveis CSS (`hsl(var(--nome-variavel))`)

### Variáveis CSS definidas em `src/index.css`:

#### Cores de Tema (Light/Dark Mode)

- `--background` → `hsl(var(--background))`
- `--foreground` → `hsl(var(--foreground))`
- `--card` → `hsl(var(--card))`
- `--card-foreground` → `hsl(var(--card-foreground))`
- `--muted` → `hsl(var(--muted))`
- `--muted-foreground` → `hsl(var(--muted-foreground))`
- `--border` → `hsl(var(--border))`
- `--primary` → `hsl(var(--primary))` (Laranja: #ff9e2b)
- `--secondary` → `hsl(var(--secondary))`
- `--accent` → `hsl(var(--accent))`

#### Cores Customizadas

- `--custom-blue` → `hsl(var(--custom-blue))` (Azul: #0b18c8)
  - **Usado extensivamente em:**
    - `FilterPanel.jsx` - Botões, selects, checkboxes, badges
    - `SurveySidebar.jsx` - Links ativos, bordas, backgrounds
    - `ResponseDetails.jsx` - Badges, botões, highlights
    - `badge.tsx` - Variante default
    - `tabs.tsx` - Tab ativa

#### Cores de Gráficos

- `--chart-positive` → `hsl(var(--chart-positive))`

  - **Usado em:**
    - `Charts.jsx` - Gráficos de sentimento positivo
    - `AttributeDeepDive.jsx` - Indicadores positivos, cores de texto

- `--chart-negative` → `hsl(var(--chart-negative))`

  - **Usado em:**
    - `Charts.jsx` - Gráficos de sentimento negativo
    - `AttributeDeepDive.jsx` - Indicadores negativos, backgrounds

- `--chart-neutral` → `hsl(var(--chart-neutral))`
  - **Usado em:**
    - `Charts.jsx` - Gráficos de sentimento neutro
    - `AttributeDeepDive.jsx` - Indicadores neutros, backgrounds

#### Cores de Severidade

- `--severity-critical` → `hsl(var(--severity-critical))`
- `--severity-high` → `hsl(var(--severity-high))`
- `--severity-medium` → `hsl(var(--severity-medium))`
- `--severity-low` → `hsl(var(--severity-low))`
  - **Usado em:**
    - `ExecutiveReport.jsx` - Badges de severidade
    - `ImplementationPlan.jsx` - Badges e bordas de severidade

---

## 3. Cores Hardcoded (Valores Diretos no Código)

### ✅ **CORRIGIDO: Todas as cores hardcoded foram substituídas por constantes**

#### `SurveyHeader.jsx` - ✅ Corrigido

```javascript
// ✅ ANTES (hardcoded)
background: "linear-gradient(135deg, hsl(236, 90%, 50%) 0%, hsl(236, 90%, 45%) 100%)";
boxShadow: "0 4px 12px rgba(11, 24, 200, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)";
backgroundColor: "rgba(255, 255, 255, 0.2)";

// ✅ DEPOIS (usando constantes)
background: getBlueGradient();
boxShadow: getBlueButtonShadow();
backgroundColor: RGBA_WHITE_20;
```

- ✅ **Corrigido:** Todos os valores agora usam constantes de `colors.js`
- ✅ Funções `getBlueGradient()` e `getBlueButtonShadow()` criadas
- ✅ Constante `RGBA_WHITE_20` criada

#### `SurveySidebar.jsx` - ✅ Corrigido

```javascript
// ✅ ANTES (hardcoded)
backgroundColor: "#faf8f5"; // Bege claro/off-white
boxShadow: "0 2px 8px rgba(0,0,0,0.08)";
backgroundColor: "rgba(255,158,43,0.15)"; // Laranja com opacidade
color: "#1f2937"; // Cinza escuro
boxShadow: "0 1px 3px rgba(0,0,0,0.1)";

// ✅ DEPOIS (usando constantes)
backgroundColor: COLOR_LIGHT_BACKGROUND;
boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_08}`;
backgroundColor: RGBA_ORANGE_SHADOW_15;
color: COLOR_GRAY_DARK;
boxShadow: `0 1px 3px ${RGBA_BLACK_SHADOW_10}`;
```

- ✅ **Corrigido:** Todas as cores hardcoded substituídas por constantes
- ✅ Constantes criadas: `COLOR_GRAY_DARK`, `RGBA_BLACK_SHADOW_08`, `RGBA_BLACK_SHADOW_10`
- ✅ Constantes existentes utilizadas: `COLOR_LIGHT_BACKGROUND`, `RGBA_ORANGE_SHADOW_15`

#### `FilterPanel.jsx`

- Não tem cores hardcoded (usa variáveis CSS corretamente)

#### `ResponseDetails.jsx`

- Não tem cores hardcoded (usa constantes e variáveis CSS)

#### `AttributeDeepDive.jsx`

- Não tem cores hardcoded (usa variáveis CSS)

#### `Charts.jsx`

- Não tem cores hardcoded (usa variáveis CSS)

---

## 4. Classes Tailwind CSS

### Classes de Cores do Tailwind (definidas em `tailwind.config.js` e `index.css`)

#### Classes de Tema

- `bg-background`, `text-foreground`
- `bg-card`, `text-card-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-primary`, `text-primary-foreground`
- `bg-secondary`, `text-secondary-foreground`
- `bg-accent`, `text-accent-foreground`
- `border-border`

#### Classes Customizadas

- `bg-[hsl(var(--custom-blue))]` - Background azul customizado
- `text-[hsl(var(--custom-blue))]` - Texto azul customizado
- `border-[hsl(var(--custom-blue))]` - Borda azul customizado
- `ring-[hsl(var(--custom-blue))]` - Ring azul customizado

#### Classes de Severidade

- `bg-severity-critical`, `bg-severity-high`, `bg-severity-medium`, `bg-severity-low`
- `border-l-severity-critical`, etc.

#### Classes de Gráficos

- `bg-chart-positive`, `bg-chart-negative`, `bg-chart-neutral`

---

## 📊 Estatísticas de Uso

### Por Fonte:

1. **Variáveis CSS** (`hsl(var(--...))`): ~60% das cores
2. **Classes Tailwind**: ~25% das cores
3. **Constantes de `colors.js`**: ~15% das cores
4. **Cores hardcoded**: 0% ✅ (todas eliminadas)

### Por Componente:

#### `SurveyHeader.jsx`

- ✅ Usa constantes de `colors.js` (6)
- ✅ Sem cores hardcoded

#### `SurveySidebar.jsx`

- ✅ Usa constantes de `colors.js` (8)
- ✅ Usa variáveis CSS extensivamente
- ✅ Sem cores hardcoded

#### `FilterPanel.jsx`

- ✅ Usa apenas variáveis CSS (muito bem organizado)

#### `ResponseDetails.jsx`

- ✅ Usa constantes de `colors.js` (4)
- ✅ Usa variáveis CSS

#### `AttributeDeepDive.jsx`

- ✅ Usa constantes de `colors.js` (1)
- ✅ Usa variáveis CSS

#### `Charts.jsx`

- ✅ Usa apenas variáveis CSS

#### Componentes UI (`card.tsx`, `badge.tsx`, `tabs.tsx`, etc.)

- ✅ Usam constantes de `colors.js` ou variáveis CSS
- ✅ Bem organizados

---

## 🔍 Problemas Identificados e Corrigidos

### 1. ✅ Cores Hardcoded em `SurveyHeader.jsx` - CORRIGIDO

**Localização:** Linhas 375-377, 422-424, 383, 440

```javascript
// ❌ ANTES (hardcoded)
background: "linear-gradient(135deg, hsl(236, 90%, 50%) 0%, hsl(236, 90%, 45%) 100%)";
boxShadow: "0 4px 12px rgba(11, 24, 200, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)";
backgroundColor: "rgba(255, 255, 255, 0.2)";

// ✅ DEPOIS (usando constantes)
background: getBlueGradient();
boxShadow: getBlueButtonShadow();
backgroundColor: RGBA_WHITE_20;
```

**Solução Aplicada:**

- ✅ Criada função `getBlueGradient()` em `colors.js` para gradientes azuis
- ✅ Criada função `getBlueButtonShadow()` em `colors.js` para sombras de botões azuis
- ✅ Criada constante `RGBA_WHITE_20` para `rgba(255, 255, 255, 0.2)`
- ✅ Criada constante `RGBA_BLUE_CUSTOM_SHADOW_30` para `rgba(11, 24, 200, 0.3)`
- ✅ Criada constante `RGBA_BLACK_SHADOW_10` para `rgba(0, 0, 0, 0.1)`

### 2. ✅ Cores Hardcoded em `SurveySidebar.jsx` - CORRIGIDO

**Localização:** Linhas 176, 215, 226, 248, 259, 281, 292

```javascript
// ❌ ANTES (hardcoded)
backgroundColor: "#faf8f5"; // Bege claro
backgroundColor: "rgba(255,158,43,0.15)"; // Laranja com opacidade
color: "#1f2937"; // Cinza escuro
boxShadow: "0 2px 8px rgba(0,0,0,0.08)";
boxShadow: "0 1px 3px rgba(0,0,0,0.1)";

// ✅ DEPOIS (usando constantes)
backgroundColor: COLOR_LIGHT_BACKGROUND;
backgroundColor: RGBA_ORANGE_SHADOW_15;
color: COLOR_GRAY_DARK;
boxShadow: `0 2px 8px ${RGBA_BLACK_SHADOW_08}`;
boxShadow: `0 1px 3px ${RGBA_BLACK_SHADOW_10}`;
```

**Solução Aplicada:**

- ✅ `#faf8f5` → Substituído por `COLOR_LIGHT_BACKGROUND` (já existia)
- ✅ `rgba(255,158,43,0.15)` → Substituído por `RGBA_ORANGE_SHADOW_15` (já existia)
- ✅ `#1f2937` → Criada constante `COLOR_GRAY_DARK`
- ✅ `rgba(0,0,0,0.08)` → Criada constante `RGBA_BLACK_SHADOW_08`
- ✅ `rgba(0,0,0,0.1)` → Criada constante `RGBA_BLACK_SHADOW_10`

---

## ✅ Recomendações

### 1. **Eliminar todas as cores hardcoded**

- Substituir por constantes de `colors.js` ou variáveis CSS

### 2. **Padronizar uso de `--custom-blue`**

- Todos os componentes já usam corretamente via variável CSS
- ✅ Mantém consistência

### 3. **Centralizar gradientes**

- Criar funções/constantes em `colors.js` para gradientes
- Exemplo: `getBlueGradient()`, `getOrangeGradient()`

### 4. **Documentar cores customizadas**

- Adicionar comentários explicando quando usar cada cor
- Exemplo: "Use `--custom-blue` para elementos interativos principais"

### 5. **Criar constantes faltantes**

- `RGBA_WHITE_20` para `rgba(255, 255, 255, 0.2)`
- `COLOR_GRAY_DARK` para `#1f2937`
- Funções para gradientes azuis

---

## 📝 Mapeamento Completo por Componente

### `NavLink.jsx`

- ❌ Não usa cores diretamente (apenas classes Tailwind genéricas)

### `ThemeToggle.jsx`

- ❌ Não usa cores diretamente (usa classes Tailwind do tema)

### `SurveyHeader.jsx`

- ✅ `COLOR_ORANGE_PRIMARY` (importado)
- ✅ `RGBA_ORANGE_SHADOW_40` (importado)
- ✅ `RGBA_BLACK_SHADOW_20` (importado)
- ✅ `getBlueGradient()` (função importada)
- ✅ `getBlueButtonShadow()` (função importada)
- ✅ `RGBA_WHITE_20` (importado)

### `SurveySidebar.jsx`

- ✅ `RGBA_BLACK_SHADOW_20` (importado)
- ✅ `RGBA_ORANGE_SHADOW_20` (importado)
- ✅ `COLOR_ORANGE_PRIMARY` (importado)
- ✅ `COLOR_LIGHT_BACKGROUND` (importado)
- ✅ `RGBA_ORANGE_SHADOW_15` (importado)
- ✅ `COLOR_GRAY_DARK` (importado)
- ✅ `RGBA_BLACK_SHADOW_08` (importado)
- ✅ `RGBA_BLACK_SHADOW_10` (importado)
- ✅ `hsl(var(--custom-blue))` (variável CSS)

### `FilterPanel.jsx`

- ✅ `hsl(var(--custom-blue))` (variável CSS - usado extensivamente)
- ✅ Classes Tailwind de tema

### `ResponseDetails.jsx`

- ✅ `COLOR_ORANGE_PRIMARY` (importado)
- ✅ `RGBA_ORANGE_SHADOW_15` (importado)
- ✅ `RGBA_ORANGE_SHADOW_20` (importado)
- ✅ `RGBA_BLACK_SHADOW_30` (importado)
- ✅ `hsl(var(--custom-blue))` (variável CSS)

### `AttributeDeepDive.jsx`

- ✅ `RGBA_BLACK_SHADOW_20` (importado)
- ✅ `hsl(var(--chart-positive))` (variável CSS)
- ✅ `hsl(var(--chart-negative))` (variável CSS)
- ✅ `hsl(var(--chart-neutral))` (variável CSS)

### `ExecutiveReport.jsx`

- ✅ `COLOR_ORANGE_PRIMARY` (importado)
- ✅ Classes Tailwind de severidade

### `ImplementationPlan.jsx`

- ✅ `COLOR_ORANGE_PRIMARY` (importado - não usado diretamente)
- ✅ Classes Tailwind de severidade

### `Charts.jsx`

- ✅ `hsl(var(--foreground))` (variável CSS)
- ✅ `hsl(var(--chart-positive))` (variável CSS)
- ✅ `hsl(var(--chart-negative))` (variável CSS)
- ✅ `hsl(var(--chart-neutral))` (variável CSS)
- ✅ `hsl(var(--primary))` (variável CSS)

### Componentes UI

#### `card.tsx`

- ✅ `RGBA_BLACK_SHADOW_40` (importado)
- ✅ `RGBA_ORANGE_SHADOW_10` (importado)
- ✅ `RGBA_BLACK_SHADOW_60` (importado)
- ✅ `RGBA_ORANGE_SHADOW_20` (importado)

#### `badge.tsx`

- ✅ `hsl(var(--custom-blue))` (variável CSS)

#### `tabs.tsx`

- ✅ `RGBA_BLACK_SHADOW_20` (importado)
- ✅ `hsl(var(--custom-blue))` (variável CSS)

#### `sheet.tsx`

- ✅ `COLOR_ORANGE_PRIMARY` (importado - não usado diretamente)

#### `table.tsx`

- ✅ `COLOR_ORANGE_PRIMARY` (importado - não usado diretamente)

---

## 🎯 Conclusão

**Pontos Positivos:**

- ✅ Maioria das cores usa variáveis CSS ou constantes centralizadas
- ✅ Sistema de cores bem estruturado em `colors.js`
- ✅ Variáveis CSS permitem suporte a light/dark mode
- ✅ Componentes UI bem organizados

**Pontos a Melhorar:**

- ✅ **CORRIGIDO:** Eliminadas todas as cores hardcoded em `SurveyHeader.jsx` e `SurveySidebar.jsx`
- ✅ **CORRIGIDO:** Substituídos valores hardcoded por constantes centralizadas
- ✅ **CORRIGIDO:** Criadas constantes faltantes para gradientes e cores especiais

**Status das Correções:**

1. ✅ **CONCLUÍDO:** Substituído `rgba(255,158,43,0.15)` por `RGBA_ORANGE_SHADOW_15` em `SurveySidebar.jsx`
2. ✅ **CONCLUÍDO:** Criadas funções `getBlueGradient()` e `getBlueButtonShadow()` em `colors.js`
3. ✅ **CONCLUÍDO:** Criadas constantes `COLOR_GRAY_DARK`, `RGBA_WHITE_20`, `RGBA_BLACK_SHADOW_08`, `RGBA_BLACK_SHADOW_10`, `RGBA_BLUE_CUSTOM_SHADOW_30`

**Novas Constantes Adicionadas em `colors.js`:**

- `RGBA_WHITE_20` - `rgba(255,255,255,0.2)`
- `COLOR_GRAY_DARK` - `#1f2937`
- `RGBA_BLACK_SHADOW_10` - `rgba(0,0,0,0.1)`
- `RGBA_BLACK_SHADOW_08` - `rgba(0,0,0,0.08)`
- `RGBA_BLUE_CUSTOM_SHADOW_30` - `rgba(11, 24, 200, 0.3)`
- `getBlueGradient()` - Função que retorna gradiente azul
- `getBlueButtonShadow()` - Função que retorna sombra para botões azuis

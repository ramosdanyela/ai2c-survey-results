# 🎨 Guia Completo para Replicação no Figma

Este documento contém **TODAS** as informações necessárias para replicar fielmente o aplicativo em um protótipo no Figma.

**⚠️ NOTA**: Este documento foi gerado automaticamente. Para atualizar, execute: `node scripts/generate-figma-guide.js`

---

## 📋 Índice

1. [Paleta de Cores](#1-paleta-de-cores)
2. [Tipografia](#2-tipografia)
3. [Cores de Texto](#3-cores-de-texto)
4. [Espaçamentos](#4-espaçamentos)
5. [Ícones](#5-ícones)
6. [Componentes e Especificações](#6-componentes-e-especificações)
7. [Layout e Estrutura](#7-layout-e-estrutura)
8. [Sombras e Efeitos](#8-sombras-e-efeitos)
9. [Estados e Interações](#9-estados-e-interações)
10. [Breakpoints e Responsividade](#10-breakpoints-e-responsividade)
11. [Gradientes](#11-gradientes)

---

## 1. Paleta de Cores

### 1.1 Cores Principais (Hex)

#### Light Mode

| Nome                 | Hex       | HSL            | Uso                                  |
| -------------------- | --------- | -------------- | ------------------------------------ |
| **Laranja Primário** | `#ff9e2b` | `33 100% 58%`  | Destaques, botões principais, badges |
| **Azul Título**      | `#001dc6` | `231 100% 39%` | Títulos principais                   |
| **Azul Customizado** | `#0b18c8` | `236 90% 41%`  | Botões de navegação, sidebar ativa   |
| **Fundo Claro**      | `#F9FAFB` | `0 0% 98%`     | Background principal                 |
| **Card Claro**       | `#FFFFFF` | `0 0% 100%`    | Cards e containers                   |
| **Texto Escuro**     | `#000000` | `0 0% 0%`      | Texto principal                      |
| **Borda Clara**      | `#E5E7EB` | `0 0% 90%`     | Bordas e divisores                   |

#### Dark Mode

| Nome                 | Hex                     | HSL         | Uso                  |
| -------------------- | ----------------------- | ----------- | -------------------- |
| **Fundo Escuro**     | `#000000`               | `0 0% 3%`   | Background principal |
| **Card Escuro**      | `#141414`               | `0 0% 8%`   | Cards e containers   |
| **Texto Claro**      | `#FFFFFF`               | `0 0% 100%` | Texto principal      |
| **Texto Secundário** | `rgba(255,255,255,0.6)` | `0 0% 60%`  | Texto secundário     |
| **Borda Escura**     | `rgba(255,255,255,0.1)` | `0 0% 20%`  | Bordas e divisores   |

### 1.2 Cores de Sistema

#### Estados e Feedback

| Nome                  | Light Mode    | Dark Mode     | Uso                      |
| --------------------- | ------------- | ------------- | ------------------------ |
| **Success**           | `161 94% 30%` | `161 94% 30%` | Sucesso, confirmações    |
| **Warning**           | `38 92% 50%`  | `38 90% 55%`  | Avisos                   |
| **Error/Destructive** | `0 84% 60%`   | `0 84% 60%`   | Erros, ações destrutivas |
| **Info**              | `199 89% 48%` | `199 85% 55%` | Informações              |

### 1.3 Sombras com Cores (RGBA)

#### Sombras Laranja

| Nome                 | RGBA                    | Uso                 |
| -------------------- | ----------------------- | ------------------- |
| **Orange Shadow 40** | `rgba(255,158,43,0.4)`  | Sombras principais  |
| **Orange Shadow 30** | `rgba(255,158,43,0.3)`  | Sombras médias      |
| **Orange Shadow 20** | `rgba(255,158,43,0.2)`  | Sombras hover       |
| **Orange Shadow 15** | `rgba(255,158,43,0.15)` | Sombras sutis       |
| **Orange Shadow 10** | `rgba(255,158,43,0.1)`  | Sombras muito sutis |

#### Sombras Pretas

| Nome                | RGBA               | Uso                        |
| ------------------- | ------------------ | -------------------------- |
| **Black Shadow 60** | `rgba(0,0,0,0.6)`  | Sombras hover dark         |
| **Black Shadow 40** | `rgba(0,0,0,0.4)`  | Sombras principais dark    |
| **Black Shadow 30** | `rgba(0,0,0,0.3)`  | Sombras médias             |
| **Black Shadow 20** | `rgba(0,0,0,0.2)`  | Sombras leves              |
| **Black Shadow 10** | `rgba(0,0,0,0.1)`  | Sombras muito leves        |
| **Black Shadow 08** | `rgba(0,0,0,0.08)` | Sombras extremamente leves |

---

## 2. Tipografia

### 2.1 Fontes

#### Fonte Principal (Corpo)

- **Nome**: Inter
- **Fallbacks**: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`
- **Uso**: Texto do corpo, parágrafos, labels
- **Peso**: Normal (400), Semibold (600), Bold (700)

#### Fonte de Títulos

- **Nome**: Poppins
- **Fallbacks**: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif`
- **Uso**: Todos os headings (h1-h6), títulos de seção
- **Peso**: Bold (700)

### 2.2 Tamanhos de Fonte

| Classe Tailwind | Tamanho (px) | Tamanho (rem) | Uso                      |
| --------------- | ------------ | ------------- | ------------------------ |
| `text-xs`       | 12px         | 0.75rem       | Labels pequenos, badges  |
| `text-sm`       | 14px         | 0.875rem      | Texto secundário, botões |
| `text-base`     | 16px         | 1rem          | Texto do corpo (padrão)  |
| `text-lg`       | 18px         | 1.125rem      | Subtítulos, destaque     |
| `text-xl`       | 20px         | 1.25rem       | Subtítulos de seção      |
| `text-2xl`      | 24px         | 1.5rem        | Títulos de seção, header |
| `text-3xl`      | 30px         | 1.875rem      | Títulos grandes          |
| `text-4xl`      | 36px         | 2.25rem       | Títulos muito grandes    |

---

## 3. Cores de Texto

### 3.1 Cores de Texto Principais (Sistema)

#### Cores de Texto Base

| Classe Tailwind           | Variável CSS           | Light Mode           | Dark Mode             | Uso                          |
| ------------------------- | ---------------------- | -------------------- | --------------------- | ---------------------------- |
| `text-foreground`         | `--foreground`         | `#000000` (0 0% 0%)  | `#FFFFFF` (0 0% 100%) | Texto principal do app       |
| `text-muted-foreground`   | `--muted-foreground`   | `#737373` (0 0% 45%) | `#999999` (0 0% 60%)  | Texto secundário, descrições |
| `text-card-foreground`    | `--card-foreground`    | `#000000` (0 0% 0%)  | `#FFFFFF` (0 0% 100%) | Texto dentro de cards        |
| `text-popover-foreground` | `--popover-foreground` | `#000000` (0 0% 0%)  | `#FFFFFF` (0 0% 100%) | Texto em popovers/dropdowns  |

#### Cores de Texto de Ação

| Classe Tailwind           | Variável CSS           | Light Mode              | Dark Mode               | Uso                           |
| ------------------------- | ---------------------- | ----------------------- | ----------------------- | ----------------------------- |
| `text-primary`            | `--primary`            | `#ff9e2b` (33 100% 58%) | `#ff9e2b` (33 100% 58%) | Links, destaques laranja      |
| `text-primary-foreground` | `--primary-foreground` | `#FFFFFF` (0 0% 100%)   | `#FFFFFF` (0 0% 100%)   | Texto sobre fundo laranja     |
| `text-accent`             | `--accent`             | `#ff9e2b` (33 100% 58%) | `#ff9e2b` (33 100% 58%) | Texto de destaque             |
| `text-accent-foreground`  | `--accent-foreground`  | `#FFFFFF` (0 0% 100%)   | `#FFFFFF` (0 0% 100%)   | Texto sobre fundo de destaque |

#### Cores de Texto de Estado

| Classe Tailwind               | Variável CSS               | Light Mode              | Dark Mode               | Uso                           |
| ----------------------------- | -------------------------- | ----------------------- | ----------------------- | ----------------------------- |
| `text-destructive`            | `--destructive`            | `#EF4444` (0 84% 60%)   | `#EF4444` (0 84% 60%)   | Texto de erro                 |
| `text-destructive-foreground` | `--destructive-foreground` | `#FFFFFF` (0 0% 100%)   | `#FFFFFF` (0 0% 100%)   | Texto sobre fundo de erro     |
| `text-success`                | `--success`                | `#059669` (161 94% 30%) | `#059669` (161 94% 30%) | Texto de sucesso              |
| `text-success-foreground`     | `--success-foreground`     | `#FFFFFF` (0 0% 100%)   | `#FFFFFF` (0 0% 100%)   | Texto sobre fundo de sucesso  |
| `text-warning`                | `--warning`                | `hsl(38, 92%, 50%)`     | `hsl(38, 90%, 55%)`     | Texto de aviso                |
| `text-warning-foreground`     | `--warning-foreground`     | `#FFFFFF` (0 0% 100%)   | `#FFFFFF` (0 0% 100%)   | Texto sobre fundo de aviso    |
| `text-info`                   | `--info`                   | `hsl(199, 89%, 48%)`    | `hsl(199, 85%, 55%)`    | Texto informativo             |
| `text-info-foreground`        | `--info-foreground`        | `#FFFFFF` (0 0% 100%)   | `#FFFFFF` (0 0% 100%)   | Texto sobre fundo informativo |

#### Cores de Texto Secundárias

| Classe Tailwind             | Variável CSS             | Light Mode           | Dark Mode             | Uso                                     |
| --------------------------- | ------------------------ | -------------------- | --------------------- | --------------------------------------- |
| `text-secondary`            | `--secondary`            | `#F5F5F5` (0 0% 96%) | `#1F1F1F` (0 0% 12%)  | Fundo secundário (não usado como texto) |
| `text-secondary-foreground` | `--secondary-foreground` | `#000000` (0 0% 0%)  | `#FFFFFF` (0 0% 100%) | Texto sobre fundo secundário            |

#### Cores de Texto da Sidebar

| Classe Tailwind                   | Variável CSS                   | Light Mode            | Dark Mode             | Uso                                   |
| --------------------------------- | ------------------------------ | --------------------- | --------------------- | ------------------------------------- |
| `text-sidebar-foreground`         | `--sidebar-foreground`         | `#000000` (0 0% 0%)   | `#FFFFFF` (0 0% 100%) | Texto principal da sidebar            |
| `text-sidebar-accent-foreground`  | `--sidebar-accent-foreground`  | `#000000` (0 0% 0%)   | `#FFFFFF` (0 0% 100%) | Texto em itens ativos da sidebar      |
| `text-sidebar-primary-foreground` | `--sidebar-primary-foreground` | `#FFFFFF` (0 0% 100%) | `#FFFFFF` (0 0% 100%) | Texto sobre fundo primário da sidebar |

### 3.2 Cores de Texto por Componente

#### Header (SurveyHeader)

| Cor        | Classe/Valor | Uso                                              |
| ---------- | ------------ | ------------------------------------------------ |
| **Branco** | `text-white` | Título central (sobre fundo laranja)             |
| **Branco** | `text-white` | Texto dos botões de navegação (sobre fundo azul) |
| **Branco** | `text-white` | Ícones dos botões de navegação                   |

#### Sidebar (SurveySidebar)

| Cor                                  | Classe/Valor                              | Uso                                              |
| ------------------------------------ | ----------------------------------------- | ------------------------------------------------ |
| **Foreground**                       | `text-foreground`                         | Título do survey, empresa, período               |
| **Foreground com opacidade**         | `text-foreground/70`                      | Labels dos cards de métricas                     |
| **Sidebar Foreground**               | `text-sidebar-foreground`                 | Texto dos itens de menu                          |
| **Sidebar Foreground com opacidade** | `text-sidebar-foreground/80`              | Itens de menu inativos                           |
| **Sidebar Foreground com opacidade** | `text-sidebar-foreground/70`              | Subitens de menu inativos                        |
| **Branco**                           | `text-white`                              | Texto de itens de menu ativos (sobre fundo azul) |
| **Laranja**                          | `style={{ color: COLOR_ORANGE_PRIMARY }}` | Ícones dos cards de métricas (`#ff9e2b`)         |
| **Gray Dark**                        | `style={{ color: COLOR_GRAY_DARK }}`      | Valores numéricos dos cards (`#1f2937`)          |

#### Cards

| Cor                                | Classe/Valor               | Uso                                |
| ---------------------------------- | -------------------------- | ---------------------------------- |
| **Card Foreground**                | `text-card-foreground`     | Títulos de cards                   |
| **Muted Foreground**               | `text-muted-foreground`    | Texto do corpo, descrições         |
| **Muted Foreground com opacidade** | `text-muted-foreground/50` | Texto riscado (tarefas concluídas) |

#### Botões

| Variante              | Cor de Texto                                         | Uso                        |
| --------------------- | ---------------------------------------------------- | -------------------------- |
| **Default (Primary)** | `text-primary-foreground` (branco)                   | Botão primário             |
| **Destructive**       | `text-destructive-foreground` (branco)               | Botão de ação destrutiva   |
| **Outline**           | `text-foreground` → `text-accent-foreground` (hover) | Botão outline              |
| **Secondary**         | `text-secondary-foreground`                          | Botão secundário           |
| **Ghost**             | `text-foreground` → `text-accent-foreground` (hover) | Botão ghost                |
| **Link**              | `text-primary` (laranja)                             | Link estilizado como botão |

#### Badges

| Tipo                    | Cor de Texto                  | Uso                    |
| ----------------------- | ----------------------------- | ---------------------- |
| **Severidade Critical** | `text-white`                  | Badge crítico          |
| **Severidade High**     | `text-white`                  | Badge alto             |
| **Severidade Medium**   | `text-white`                  | Badge médio            |
| **Severidade Low**      | `text-white`                  | Badge baixo            |
| **Custom Blue**         | `text-white`                  | Badge azul customizado |
| **Secondary**           | `text-secondary-foreground`   | Badge secundário       |
| **Destructive**         | `text-destructive-foreground` | Badge destrutivo       |

#### Tabelas

| Elemento         | Cor de Texto                                     | Uso                          |
| ---------------- | ------------------------------------------------ | ---------------------------- |
| **Header**       | `text-muted-foreground`                          | Cabeçalhos de coluna         |
| **Cell**         | `text-foreground`                                | Células normais              |
| **Cell Muted**   | `text-muted-foreground`                          | Células com texto secundário |
| **Link em Cell** | `text-muted-foreground` → `text-primary` (hover) | Links dentro de células      |

#### Formulários

| Elemento        | Cor de Texto                          | Uso                 |
| --------------- | ------------------------------------- | ------------------- |
| **Label**       | `text-foreground` (via labelVariants) | Labels de campos    |
| **Input**       | `text-foreground`                     | Texto digitado      |
| **Placeholder** | `placeholder:text-muted-foreground`   | Placeholder         |
| **Description** | `text-muted-foreground`               | Descrição de campos |
| **Error**       | `text-destructive`                    | Mensagens de erro   |

#### Tooltips e Popovers

| Elemento          | Cor de Texto                                         | Uso                        |
| ----------------- | ---------------------------------------------------- | -------------------------- |
| **Popover**       | `text-popover-foreground`                            | Texto dentro de popovers   |
| **Tooltip**       | `text-popover-foreground`                            | Texto dentro de tooltips   |
| **Dropdown Menu** | `text-popover-foreground`                            | Texto em menus dropdown    |
| **Context Menu**  | `text-foreground` → `text-accent-foreground` (focus) | Texto em menus de contexto |

### 3.3 Cores de Texto Customizadas

#### Cores Customizadas via Classes Tailwind

| Classe                              | Valor                                                      | Uso                         |
| ----------------------------------- | ---------------------------------------------------------- | --------------------------- |
| `text-[hsl(var(--custom-blue))]`    | `#0b18c8` (236 90% 41%)                                    | Texto azul customizado      |
| `text-[hsl(var(--primary))]`        | `#ff9e2b` (33 100% 58%)                                    | Texto laranja (alternativa) |
| `text-[hsl(var(--chart-positive))]` | `hsl(210, 80%, 50%)` (light) / `hsl(210, 75%, 55%)` (dark) | Texto de gráficos positivos |

#### Cores Customizadas via Funções

| Função                     | Retorna                          | Uso                    |
| -------------------------- | -------------------------------- | ---------------------- |
| `getOrangeTextClass()`     | `text-[#ff9e2b]`                 | Texto laranja          |
| `getBlueCustomTextClass()` | `text-[hsl(var(--custom-blue))]` | Texto azul customizado |

### 3.4 Cores de Texto com Opacidade

#### Foreground com Opacidade

| Classe               | Opacidade | Uso                                           |
| -------------------- | --------- | --------------------------------------------- |
| `text-foreground/80` | 80%       | Texto com opacidade reduzida (hover de links) |
| `text-foreground/70` | 70%       | Texto secundário com opacidade                |
| `text-foreground/60` | 60%       | Texto muito secundário                        |
| `text-foreground/50` | 50%       | Texto desabilitado/riscado                    |

#### Sidebar Foreground com Opacidade

| Classe                       | Opacidade | Uso                       |
| ---------------------------- | --------- | ------------------------- |
| `text-sidebar-foreground/80` | 80%       | Itens de menu inativos    |
| `text-sidebar-foreground/70` | 70%       | Subitens de menu inativos |

#### Muted Foreground com Opacidade

| Classe                     | Opacidade | Uso                                |
| -------------------------- | --------- | ---------------------------------- |
| `text-muted-foreground/50` | 50%       | Texto riscado (tarefas concluídas) |

#### Primary com Opacidade

| Classe            | Opacidade | Uso                      |
| ----------------- | --------- | ------------------------ |
| `text-primary/90` | 90%       | Hover de links primários |

### 3.5 Cores de Texto Inline (Style)

#### Cores Inline Encontradas

| Componente            | Cor                          | Valor          | Uso                          |
| --------------------- | ---------------------------- | -------------- | ---------------------------- |
| **SurveySidebar**     | `COLOR_ORANGE_PRIMARY`       | `#ff9e2b`      | Ícones dos cards de métricas |
| **SurveySidebar**     | `COLOR_GRAY_DARK`            | `#1f2937`      | Valores numéricos dos cards  |
| **ResponseDetails**   | `COLOR_ORANGE_PRIMARY`       | `#ff9e2b`      | Destaques em gráficos        |
| **Export**            | `COLOR_ORANGE_PRIMARY`       | `#ff9e2b`      | Destaques                    |
| **Export**            | `"white"`                    | `#FFFFFF`      | Texto sobre fundos coloridos |
| **AttributeDeepDive** | `hsl(var(--chart-positive))` | Varia por tema | Texto de gráficos positivos  |

### 3.6 Resumo por Light/Dark Mode

#### Light Mode

| Categoria            | Cor Principal                  | Cor Secundária                     | Cor de Destaque     |
| -------------------- | ------------------------------ | ---------------------------------- | ------------------- |
| **Texto Principal**  | `#000000` (foreground)         | `#737373` (muted-foreground)       | `#ff9e2b` (primary) |
| **Texto em Cards**   | `#000000` (card-foreground)    | `#737373` (muted-foreground)       | -                   |
| **Texto em Botões**  | `#FFFFFF` (primary-foreground) | `#000000` (secondary-foreground)   | `#ff9e2b` (primary) |
| **Texto de Erro**    | `#EF4444` (destructive)        | `#FFFFFF` (destructive-foreground) | -                   |
| **Texto de Sucesso** | `#059669` (success)            | `#FFFFFF` (success-foreground)     | -                   |

#### Dark Mode

| Categoria            | Cor Principal                  | Cor Secundária                     | Cor de Destaque     |
| -------------------- | ------------------------------ | ---------------------------------- | ------------------- |
| **Texto Principal**  | `#FFFFFF` (foreground)         | `#999999` (muted-foreground)       | `#ff9e2b` (primary) |
| **Texto em Cards**   | `#FFFFFF` (card-foreground)    | `#999999` (muted-foreground)       | -                   |
| **Texto em Botões**  | `#FFFFFF` (primary-foreground) | `#FFFFFF` (secondary-foreground)   | `#ff9e2b` (primary) |
| **Texto de Erro**    | `#EF4444` (destructive)        | `#FFFFFF` (destructive-foreground) | -                   |
| **Texto de Sucesso** | `#059669` (success)            | `#FFFFFF` (success-foreground)     | -                   |

### 3.7 Estatísticas de Cores de Texto

- **Cores de sistema**: 15 variáveis CSS principais
- **Cores customizadas**: 3 (laranja, azul customizado, chart-positive)
- **Cores inline**: 4 (laranja, gray-dark, white, chart-positive)
- **Cores com opacidade**: 8 variações

**Distribuição por Uso:**

1. **Texto principal** (`text-foreground`): ~40% do uso
2. **Texto secundário** (`text-muted-foreground`): ~30% do uso
3. **Texto em botões** (`text-primary-foreground`, `text-white`): ~15% do uso
4. **Texto customizado** (laranja, azul): ~10% do uso
5. **Texto de estado** (erro, sucesso): ~5% do uso

---

## 4. Espaçamentos

### 3.1 Sistema de Espaçamento (Tailwind)

O sistema usa a escala padrão do Tailwind (baseada em 4px):

| Classe  | Valor (px) | Valor (rem) | Uso                       |
| ------- | ---------- | ----------- | ------------------------- |
| `p-0`   | 0px        | 0.000rem    | Espaçamento zero          |
| `p-1`   | 4px        | 0.250rem    | Espaçamento muito pequeno |
| `p-2`   | 8px        | 0.500rem    | Espaçamento pequeno       |
| `p-3`   | 12px       | 0.750rem    | Espaçamento médio-pequeno |
| `p-4`   | 16px       | 1.000rem    | Espaçamento padrão        |
| `p-5`   | 20px       | 1.250rem    | Espaçamento extra grande  |
| `p-6`   | 24px       | 1.500rem    | Espaçamento médio         |
| `p-8`   | 32px       | 2.000rem    | Espaçamento grande        |
| `p-10`  | 40px       | 2.500rem    | Espaçamento muito grande  |
| `p-12`  | 48px       | 3.000rem    | Espaçamento extra grande  |
| `p-16`  | 64px       | 4.000rem    | Espaçamento extra grande  |
| `p-20`  | 80px       | 5.000rem    | Espaçamento extra grande  |
| `p-24`  | 96px       | 6.000rem    | Espaçamento extra grande  |
| `p-0.5` | 2px        | 0.125rem    | Espaçamento mínimo        |

---

## 5. Ícones

### 4.1 Biblioteca de Ícones

**Biblioteca**: `lucide-react` (versão 0.556.0)

### 4.2 Ícones Encontrados no Código

- `Check`
- `ChevronDown`
- `ChevronLeft`
- `ChevronRight`
- `ChevronUp`
- `Circle`
- `Command as CommandPrimitive`
- `MoreHorizontal`
- `OTPInput`
- `OTPInputContext`
- `Slot`
- `VariantProps`
- `X`
- `cva`
- `type UseEmblaCarouselType`
- `type VariantProps`
- `useEffect`
- `useState`

### 4.3 Tamanhos de Ícones

| Tamanho           | Classe    | Valor | Uso                          |
| ----------------- | --------- | ----- | ---------------------------- |
| **Muito Pequeno** | `w-3 h-3` | 12px  | Ícones inline muito pequenos |
| **Pequeno**       | `w-4 h-4` | 16px  | Ícones padrão (mais comum)   |
| **Médio**         | `w-5 h-5` | 20px  | Ícones médios                |
| **Grande**        | `w-6 h-6` | 24px  | Ícones grandes (títulos)     |

---

## 10. Breakpoints e Responsividade

### 10.1 Breakpoints Tailwind

| Breakpoint | Tamanho | Prefixo | Uso                       |
| ---------- | ------- | ------- | ------------------------- |
| **sm**     | 640px   | `sm:`   | Tablets pequenos          |
| **md**     | 768px   | `md:`   | Tablets                   |
| **lg**     | 1024px  | `lg:`   | Desktop (sidebar aparece) |
| **xl**     | 1280px  | `xl:`   | Desktop grande            |
| **2xl**    | 1536px  | `2xl:`  | Desktop muito grande      |

---

## 📝 Notas Finais

### Checklist para Replicação no Figma

- [ ] Criar paleta de cores completa (Light e Dark mode)
- [ ] Configurar estilos de texto (Inter e Poppins)
- [ ] Configurar cores de texto (foreground, muted, primary, etc.)
- [ ] Criar componentes principais (Header, Sidebar, Cards, Botões)
- [ ] Configurar sistema de espaçamento (baseado em 4px)
- [ ] Importar ícones do Lucide (ou equivalentes)
- [ ] Configurar sombras e efeitos
- [ ] Criar variantes de componentes (hover, active, disabled)
- [ ] Configurar breakpoints e frames responsivos
- [ ] Criar gradientes
- [ ] Documentar estados e interações

### Dicas Importantes

1. **Cores**: Use variáveis no Figma para facilitar mudanças entre Light/Dark mode
2. **Espaçamento**: Crie um sistema de espaçamento baseado em 4px (8, 12, 16, 24, 32px)
3. **Tipografia**: Configure estilos de texto para cada tamanho e peso
4. **Componentes**: Crie componentes reutilizáveis no Figma para Header, Sidebar, Cards, etc.
5. **Auto Layout**: Use Auto Layout do Figma para espaçamentos consistentes
6. **Variants**: Use Variants para estados (hover, active, disabled)
7. **Frames**: Crie frames para cada breakpoint (mobile, tablet, desktop)

---

**Última atualização**: 14/12/2025, 18:26:46
**Gerado automaticamente por**: `scripts/generate-figma-guide.js`

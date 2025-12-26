# Documentação de Design - Sistema de Visualização de Resultados de Pesquisa

## 1. Introdução e Visão Geral

### 1.1 Propósito da Aplicação

Esta aplicação é um sistema de visualização e análise de resultados de pesquisas, permitindo navegação entre diferentes seções de relatórios executivos, análises de suporte, aprofundamento por atributos e análise detalhada por questão. A interface foi projetada para ser responsiva, com suporte a modo claro e escuro, e oferece uma experiência fluida com animações e transições suaves.

### 1.2 Estrutura de Navegação

A aplicação segue uma estrutura hierárquica de seções e subseções:

**Seções Principais:**

1. **Relatório Executivo**

   - Sumário Executivo
   - Recomendações

2. **Análises de Suporte**

   - Análise de Sentimento
   - Intenção de Respondentes
   - Segmentação

3. **Aprofundamento por Atributos**

   - Estado
   - Educação
   - Tipo de Cliente

4. **Análise por Questão**

   - Questão 1 (NPS)
   - Questão 2
   - Questão 4
   - Questão 5
   - (Questão 3 está oculta)

5. **Export** (página separada)

### 1.3 Screenshots Disponíveis

**Nota:** Esta documentação deve ser complementada com os screenshots PNG fornecidos. Para cada tela mencionada, referencie o arquivo PNG correspondente.

**Lista de Telas:**

1. `tela_01_sumario_executivo.png` - Sumário Executivo
2. `tela_02_recomendacoes.png` - Recomendações Executivas
3. `tela_03_sentimento.png` - Análise de Sentimento
4. `tela_04_intencao.png` - Intenção de Respondentes
5. `tela_05_segmentacao.png` - Segmentação
6. `tela_06_atributo_estado.png` - Aprofundamento: Estado
7. `tela_07_atributo_educacao.png` - Aprofundamento: Educação
8. `tela_08_atributo_tipo_cliente.png` - Aprofundamento: Tipo de Cliente
9. `tela_09_questao_1.png` - Análise: Questão 1 (NPS)
10. `tela_10_questao_2.png` - Análise: Questão 2
11. `tela_11_questao_4.png` - Análise: Questão 4
12. `tela_12_questao_5.png` - Análise: Questão 5
13. `tela_13_export.png` - Página de Export

### 1.4 Breakpoints Principais

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1023px
- **Desktop:** ≥ 1024px (lg)
- **Large Desktop:** ≥ 1280px (xl)
- **Extra Large:** ≥ 1536px (2xl)

---

## 2. Sistema de Design

### 2.1 Paleta de Cores

#### 2.1.1 Cores Principais

##### Laranja Primário (#ff9e2b)

- **Valor HEX:** `#ff9e2b`
- **Valor HSL:** `33 100% 58%`
- **Uso:**
  - Botões de destaque
  - Badges e indicadores
  - Destaques visuais
  - Sombras de destaque
  - Título central do header
- **Modo Claro:** `#ff9e2b`
- **Modo Escuro:** `#ff9e2b` (mesma cor)
- **Hover:** Mesma cor com sombra aumentada
- **Exemplos visuais:** [Ver screenshot: header com título laranja]

##### Azul Título (#1982d8)

- **Valor HEX:** `#1982d8`
- **Valor HSL:** `207 79% 47%`
- **Uso:**
  - Botões de navegação (anterior/próximo)
  - Itens ativos na sidebar
  - Destaques de seção
  - Bordas de elementos interativos
- **Modo Claro:** `#1982d8`
- **Modo Escuro:** `#1982d8` (mesma cor)
- **Hover:** Background translúcido `rgba(25, 130, 216, 0.2)`
- **Exemplos visuais:** [Ver screenshot: botões de navegação no header]

##### Preto (#000000)

- **Valor HEX:** `#000000`
- **Uso:**
  - Background modo escuro
  - Texto modo claro
- **Modo Claro:** Texto principal
- **Modo Escuro:** Background principal

##### Branco (#ffffff)

- **Valor HEX:** `#ffffff`
- **Uso:**
  - Texto modo escuro
  - Background modo claro
  - Cards modo claro
- **Modo Claro:** Background principal
- **Modo Escuro:** Texto principal

#### 2.1.2 Cores de Background

##### Background Principal

- **Modo Claro:** `#F9FAFB` (HSL: `0 0% 98%`)
- **Modo Escuro:** `hsl(0, 0%, 3%)` (quase preto)

##### Background de Cards

- **Modo Claro:** `#FFFFFF` (branco)
- **Modo Escuro:** `hsl(0, 0%, 8%)` (cinza muito escuro)

##### Background de Sidebar

- **Modo Claro:** `#F9FAFB` (HSL: `0 0% 98%`)
- **Modo Escuro:** `hsl(0, 0%, 10%)` (cinza escuro)

#### 2.1.3 Cores de Texto

##### Texto Principal (Foreground)

- **Modo Claro:** `#000000` (preto)
- **Modo Escuro:** `#FFFFFF` (branco)

##### Texto Secundário (Muted Foreground)

- **Modo Claro:** `hsl(0, 0%, 45%)` (cinza médio)
- **Modo Escuro:** `hsl(0, 0%, 60%)` (cinza claro)

#### 2.1.4 Cores de Severidade

##### Crítico (Critical)

- **HSL:** `0 84% 60%`
- **Uso:** Badges e indicadores de severidade crítica
- **Cor aproximada:** Vermelho

##### Alto (High)

- **HSL:** `25 95% 53%`
- **Uso:** Badges de severidade alta
- **Cor aproximada:** Laranja avermelhado

##### Médio (Medium)

- **HSL:** `38 92% 50%`
- **Uso:** Badges de severidade média
- **Cor aproximada:** Laranja/amarelo

##### Baixo (Low)

- **HSL:** `142 76% 36%`
- **Uso:** Badges de severidade baixa
- **Cor aproximada:** Verde

#### 2.1.5 Cores de Gráficos

- **Chart 1 (Laranja):** `33 100% 58%` (#ff9e2b)
- **Chart 2:** `20 90% 55%`
- **Chart 3:** `30 85% 55%`
- **Chart 4:** `15 95% 52%`
- **Chart 5:** `25 90% 53%`
- **Chart Positive:** `210 80% 50%` (modo claro) / `210 75% 55%` (modo escuro)
- **Chart Neutral:** `220 14% 50%` (modo claro) / `220 14% 60%` (modo escuro)
- **Chart Negative:** `0 84% 60%` (modo claro) / `0 70% 55%` (modo escuro)

### 2.2 Tipografia

#### 2.2.1 Famílias de Fonte

##### Inter

- **Uso:** Texto de corpo, parágrafos, labels, conteúdo geral
- **Fallback:** `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`
- **Aplicação:** `font-family: "Inter", ...`

##### Poppins

- **Uso:** Títulos (H1, H2, H3, H4, H5, H6), títulos de seção
- **Fallback:** `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif`
- **Aplicação:** `font-family: "Poppins", ...`
- **Peso padrão:** 700 (Bold)

#### 2.2.2 Hierarquia Tipográfica

##### Título Principal (H1) - Header

- **Fonte:** Poppins
- **Tamanho:**
  - Mobile: 14px (0.875rem)
  - Desktop: 24px (1.5rem)
- **Peso:** 700 (Bold)
- **Altura de linha:** 1.2
- **Cor:** Branco (#ffffff) - dentro de container laranja
- **Uso:** Título central no header
- **Exemplo:** [Ver screenshot: header com "Sumário Executivo"]

##### Título de Seção (H2) - Cards

- **Fonte:** Poppins
- **Tamanho:** 20px (1.25rem) / 24px (1.5rem)
- **Peso:** 700 (Bold)
- **Altura de linha:** 1.2
- **Cor:** Foreground (preto no claro, branco no escuro)
- **Uso:** Títulos dentro de cards principais
- **Espaçamento inferior:** 16px (1rem)

##### Subtítulo (H3)

- **Fonte:** Poppins
- **Tamanho:** 18px (1.125rem) / 20px (1.25rem)
- **Peso:** 600 (Semibold)
- **Altura de linha:** 1.3
- **Cor:** Foreground
- **Uso:** Subtítulos de seções
- **Espaçamento inferior:** 12px (0.75rem)

##### Texto de Corpo

- **Fonte:** Inter
- **Tamanho:** 16px (1rem) - tamanho base
- **Peso:** 400 (Normal)
- **Altura de linha:** 1.5 (relaxed)
- **Cor:** Foreground ou Muted Foreground (conforme contexto)
- **Uso:** Parágrafos, conteúdo principal

##### Texto Pequeno / Auxiliar

- **Fonte:** Inter
- **Tamanho:**
  - Mobile: 9px - 10px
  - Desktop: 12px - 14px (0.75rem - 0.875rem)
- **Peso:** 400 (Normal)
- **Altura de linha:** 1.4
- **Cor:** Muted Foreground (cinza)
- **Uso:** Labels, métricas secundárias, informações auxiliares

##### Texto em Badges

- **Fonte:** Inter
- **Tamanho:** 12px (0.75rem)
- **Peso:** 500 (Medium) ou 600 (Semibold)
- **Altura de linha:** 1.2
- **Cor:** Branco (quando background colorido)
- **Uso:** Badges de severidade, tags

### 2.3 Espaçamentos

#### 2.3.1 Sistema de Espaçamento

O sistema utiliza uma escala baseada em múltiplos de 4px:

- **4px (0.25rem):** Espaçamento mínimo entre elementos relacionados, gaps muito pequenos
- **8px (0.5rem):** Padding interno pequeno, gaps em listas compactas, espaçamento entre ícones e texto
- **12px (0.75rem):** Padding médio, espaçamento entre elementos relacionados
- **16px (1rem):** Padding padrão de cards, espaçamento padrão entre elementos, gap padrão em flex/grid
- **24px (1.5rem):** Espaçamento entre seções, padding de cards grandes, gap em grids maiores
- **32px (2rem):** Margem entre blocos principais, espaçamento vertical entre seções grandes
- **48px (3rem):** Espaçamento entre seções grandes, padding vertical de containers principais
- **64px (4rem):** Espaçamento máximo, usado raramente

#### 2.3.2 Espaçamentos Específicos

##### Padding de Cards

- **Padrão:** 16px - 24px (1rem - 1.5rem)
- **Header de Card:** 24px vertical (py-6)
- **Conteúdo de Card:** 16px - 24px (p-4 - p-6)

##### Gaps em Grids

- **Grid padrão:** 24px (gap-6)
- **Grid compacto:** 16px (gap-4)
- **Grid espaçado:** 32px (gap-8)

##### Espaçamento entre Seções

- **Entre seções principais:** 32px - 48px (space-y-8)
- **Entre elementos dentro de seção:** 16px - 24px

##### Padding Lateral (Conteúdo Principal)

- **Mobile:** 8px (px-2)
- **Tablet:** 16px (px-4)
- **Desktop:** 24px (px-6)

##### Padding Vertical (Conteúdo Principal)

- **Mobile:** 16px (py-4)
- **Tablet:** 24px (py-6)
- **Desktop:** 32px (py-8)

### 2.4 Bordas e Raios

#### 2.4.1 Border Radius

- **Padrão:** 12px (0.75rem) - `--radius: 0.75rem`
- **Médio:** 10px (calc(var(--radius) - 2px))
- **Pequeno:** 8px (calc(var(--radius) - 4px))
- **Totalmente arredondado:** 9999px (para badges, botões circulares)

#### 2.4.2 Estilos de Borda

- **Padrão:** Solid
- **Espessura padrão:** 1px
- **Espessura destacada:** 2px (para elementos ativos/hover)

#### 2.4.3 Cores de Borda

- **Modo Claro:** `hsl(0, 0%, 90%)` (cinza claro)
- **Modo Escuro:** `hsl(0, 0%, 20%)` (cinza escuro)
- **Borda destacada (azul):** `hsl(207, 79%, 47%)` com opacidade variável (30%, 40%)
- **Borda destacada (laranja):** `#ff9e2b` com opacidade variável

### 2.5 Sombras

#### 2.5.1 Sombra de Card Padrão

- **Valores:**
  - `0 6px 24px rgba(0,0,0,0.4)` (sombra preta principal)
  - `0 2px 6px rgba(255,158,43,0.1)` (sombra laranja sutil)
- **Uso:** Cards principais, containers elevados
- **Hover:**
  - `0 8px 32px rgba(0,0,0,0.6)` (sombra preta aumentada)
  - `0 3px 12px rgba(255,158,43,0.2)` (sombra laranja aumentada)
- **Transição:** `transition-all duration-300`

#### 2.5.2 Sombra de Botão Azul

- **Valores:**
  - `0 4px 12px rgba(25, 130, 216, 0.3)` (sombra azul)
  - `0 2px 4px rgba(0,0,0,0.1)` (sombra preta sutil)
- **Uso:** Botões de navegação (anterior/próximo)

#### 2.5.3 Sombra de Título Laranja (Header)

- **Valores:** `0 4px 16px rgba(255,158,43,0.4)`
- **Uso:** Container do título central no header

#### 2.5.4 Sombra de Sidebar

- **Valores:** `2px 0 8px rgba(0,0,0,0.2)`
- **Uso:** Sidebar desktop (sombra à direita)

#### 2.5.5 Sombra de Header

- **Valores:** `0 2px 8px rgba(0,0,0,0.2)`
- **Uso:** Header sticky (sombra inferior)

#### 2.5.6 Sombra de Card de Métrica (Sidebar)

- **Valores:** `0 1px 3px rgba(0,0,0,0.1)`
- **Uso:** Cards pequenos de métricas na sidebar

#### 2.5.7 Sombra de Overlay (Modal/Sheet)

- **Valores:** Background `rgba(0,0,0,0.9)` ou `rgba(0,0,0,0.8)`
- **Uso:** Overlay de modais e sheets (menu mobile)

---

## 3. Layout e Estrutura

### 3.1 Estrutura Geral

#### 3.1.1 Layout Desktop (≥1024px)

```
┌─────────────────────────────────────────────────────────┐
│                    [Sidebar Fixa]                        │
│  ┌────────────────────┐                                 │
│  │ Card Info Survey   │                                 │
│  └────────────────────┘                                 │
│  ┌────────────────────┐                                 │
│  │ Menu Navegação     │                                 │
│  │ - Executive        │                                 │
│  │ - Support         │                                 │
│  │ - Attributes      │                                 │
│  │ - Responses       │                                 │
│  └────────────────────┘                                 │
├─────────────────────────────────────────────────────────┤
│ [Header Sticky]                                          │
│ [Anterior] [Título Laranja] [Próximo]                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              [Conteúdo Principal]                        │
│              (margem esquerda = largura sidebar)        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Características:**

- **Sidebar:** Fixa à esquerda, largura automática (fit-content), sempre visível
- **Conteúdo Principal:** Margem esquerda dinâmica igual à largura da sidebar
- **Header:** Fixo no topo (sticky), abaixo da sidebar, z-index 10
- **Transição:** Conteúdo principal tem `transition-all duration-200` para ajuste suave da margem

#### 3.1.2 Layout Mobile (<1024px)

```
┌─────────────────────────────────────────┐
│ [Header Sticky]                         │
│ [☰ Menu] [Título] [Navegação]          │
├─────────────────────────────────────────┤
│                                         │
│         [Conteúdo Principal]            │
│         (100% largura)                  │
│                                         │
└─────────────────────────────────────────┘

[Sheet/Modal quando menu aberto]
┌─────────────────────────────────────────┐
│ [X] Fechar                              │
│ ┌────────────────────┐                 │
│ │ Card Info Survey  │                 │
│ └────────────────────┘                 │
│ ┌────────────────────┐                 │
│ │ Menu Navegação    │                 │
│ └────────────────────┘                 │
└─────────────────────────────────────────┘
```

**Características:**

- **Sidebar:** Oculto por padrão, acessível via menu hamburger (Sheet/Modal)
- **Header:** Visível no topo, contém botão hamburger à esquerda
- **Conteúdo Principal:** Ocupa 100% da largura
- **Menu Mobile:** Abre como Sheet da esquerda, overlay escuro, largura 75% (mobile) ou 320px (tablet)

### 3.2 Grids e Alinhamentos

#### 3.2.1 Sistema de Grid

A aplicação utiliza principalmente **Flexbox** para layouts, com **CSS Grid** para estruturas mais complexas quando necessário.

**Grid padrão para cards:**

- `display: grid`
- `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` (responsivo)
- `gap: 24px` (1.5rem)

**Grid para métricas (Sidebar):**

- `display: flex`
- `flex-direction: row`
- `gap: 8px - 16px`

#### 3.2.2 Alinhamentos Padrão

- **Conteúdo Principal:** Centralizado horizontalmente com `max-width` responsivo
  - Mobile: `max-width: 100%`
  - XL: `max-width: 98%`
  - 2XL: `max-width: 96%`
- **Textos:** Alinhamento à esquerda por padrão
- **Títulos de Card:** Centralizados quando em header de card
- **Botões:** Alinhamento conforme contexto (esquerda, centro, direita)

#### 3.2.3 Máxima Largura de Conteúdo

- **Mobile:** 100% (sem restrição)
- **Tablet:** 100% (sem restrição)
- **Desktop (XL):** 98% da largura disponível
- **Large Desktop (2XL):** 96% da largura disponível

---

## 4. Componentes

### 4.1 Header

#### 4.1.1 Estrutura Geral

**Posicionamento:**

- `position: sticky`
- `top: 0`
- `z-index: 10`
- Background: `bg-background` (cor de fundo do tema)
- Sombra: `0 2px 8px rgba(0,0,0,0.2)`

**Altura:**

- Mobile: ~48px - 56px (conforme conteúdo)
- Desktop: ~64px - 72px (conforme conteúdo)

**Padding:**

- Mobile: `px-2 py-2` (8px horizontal, 8px vertical)
- Tablet: `px-4 py-4` (16px horizontal, 16px vertical)
- Desktop: `px-6 py-4` (24px horizontal, 16px vertical)

#### 4.1.2 Elementos do Header

##### Menu Hamburger (Mobile apenas, <1024px)

- **Posição:** Esquerda do header
- **Ícone:** Menu (3 linhas horizontais) do lucide-react
- **Tamanho:** 20px x 20px (`w-5 h-5`)
- **Estilo:** Botão ghost, texto foreground
- **Hover:** Background muda para `bg-muted`
- **Ação:** Abre Sheet/Modal com sidebar mobile

##### Título Central

- **Container:**

  - Background: Laranja `#ff9e2b`
  - Padding:
    - Mobile: `px-1.5 py-1` (6px horizontal, 4px vertical)
    - Desktop: `px-4 py-2` (16px horizontal, 8px vertical)
  - Border-radius: `rounded-lg` (12px)
  - Sombra: `0 4px 16px rgba(255,158,43,0.4)`
  - Display: Flex, items-center, gap 8px - 16px

- **Ícone:**

  - Tamanho:
    - Mobile: 12px x 12px (`w-3 h-3`)
    - Desktop: 16px x 16px (`w-4 h-4`)
  - Cor: Branco
  - Flex-shrink: 0

- **Texto:**
  - Fonte: Poppins, Bold
  - Tamanho:
    - Mobile: 14px (`text-sm`)
    - Desktop: 24px (`text-2xl`)
  - Cor: Branco
  - Whitespace: nowrap

##### Botão Anterior

- **Posição:** Esquerda do título central
- **Container:**

  - Background: Gradiente azul linear `135deg, hsl(207, 79%, 50%) 0%, hsl(207, 79%, 45%) 100%`
  - Padding:
    - Mobile: `px-1.5 py-1` (6px horizontal, 4px vertical)
    - Desktop: `px-4 py-3` (16px horizontal, 12px vertical)
  - Border-radius: `rounded-lg` (12px)
  - Sombra: `0 4px 12px rgba(25, 130, 216, 0.3), 0 2px 4px rgba(0,0,0,0.1)`
  - Display: Flex, items-center
  - Gap:
    - Mobile: 4px (`gap-1`)
    - Desktop: 12px (`gap-3`)

- **Círculo com Ícone (Esquerda):**

  - Tamanho:
    - Mobile: 20px x 20px (`w-5 h-5`)
    - Desktop: 32px x 32px (`w-8 h-8`)
  - Background: `rgba(255,255,255,0.2)`
  - Border-radius: `rounded-full`
  - Ícone: ChevronLeft, branco
    - Mobile: 12px (`w-3 h-3`)
    - Desktop: 16px (`w-4 h-4`)

- **Conteúdo de Texto:**

  - **Mobile:** Layout horizontal
    - Ícone da seção (12px - 14px)
    - Nome da subseção (8px - 9px, truncate, max-width 120px)
  - **Desktop:** Layout vertical (coluna)
    - Linha 1: Nome da seção (14px, semibold)
    - Linha 2: Nome da subseção (12px, opacity 90%)

- **Estados:**

  - **Normal:** Como descrito
  - **Hover:**
    - Transform: `scale(1.02)`
    - Transição: `transition-all` 200ms
  - **Active (clicado):**
    - Transform: `scale(0.98)`
    - Transição: 100ms

- **Visibilidade:** Apenas quando há seção anterior disponível

##### Botão Próximo

- **Mesmas especificações do Botão Anterior**, exceto:
  - **Posição:** Direita do título central
  - **Ícone:** ChevronRight (no círculo à direita)
  - **Layout Mobile:** Ícone da seção + subseção (esquerda), círculo com chevron (direita)
  - **Layout Desktop:** Texto (esquerda), círculo com chevron (direita)
  - **Visibilidade:** Apenas quando há próxima seção disponível

### 4.2 Sidebar

#### 4.2.1 Sidebar Desktop (≥1024px)

**Posicionamento:**

- `position: fixed`
- `left: 0`
- `top: 0`
- `height: 100%` (full height)
- `z-index: 20`
- Background: `bg-sidebar` (cor do tema)
- Sombra: `2px 0 8px rgba(0,0,0,0.2)` (sombra à direita)
- Overflow: `overflow-y-auto` (scroll vertical se necessário)

**Largura:**

- `width: auto`
- `min-width: fit-content`
- Largura ajusta-se automaticamente ao conteúdo

**Padding:**

- Horizontal: `px-2 sm:px-3` (8px mobile, 12px desktop)
- Vertical: Conforme seções

#### 4.2.2 Estrutura da Sidebar

##### Card de Informações do Survey

- **Container:**

  - Background: `#F9FAFB` (modo claro) / `hsl(0, 0%, 10%)` (modo escuro)
  - Padding: `p-2 sm:p-3` (8px mobile, 12px desktop)
  - Border: `border border-border/50` (borda sutil)
  - Border-radius: `rounded-lg` (12px)
  - Sombra: `0 2px 8px rgba(0,0,0,0.08)`
  - Espaçamento interno: `space-y-1.5 sm:space-y-2`

- **Título do Survey:**

  - Fonte: Poppins, Bold
  - Tamanho: `text-sm sm:text-lg` (14px mobile, 18px desktop)
  - Cor: Foreground
  - Espaçamento inferior: `mb-0.5`

- **Empresa:**

  - Fonte: Inter, Normal
  - Tamanho: `text-[10px] sm:text-xs` (10px mobile, 12px desktop)
  - Cor: Foreground
  - Espaçamento inferior: `mb-0.5`

- **Período:**

  - Fonte: Inter, Normal
  - Tamanho: `text-[9px] sm:text-[10px]` (9px mobile, 10px desktop)
  - Cor: Foreground
  - Espaçamento inferior: `mb-2 sm:mb-3`

- **Cards de Métricas (3 cards horizontais):**
  - Layout: Flex horizontal, `gap-1.5 sm:gap-2`
  - Cada card:
    - Background: Branco (`bg-white`)
    - Padding: `p-1.5 sm:p-2` (6px mobile, 8px desktop)
    - Border-radius: `rounded-lg` (12px)
    - Sombra: `0 1px 3px rgba(0,0,0,0.1)`
    - Flex: `flex-1` (distribuição igual)
    - Min-width: 0 (para truncate funcionar)
    - Conteúdo interno:
      - Layout: Flex horizontal, `gap-1.5 sm:gap-2`, items-center
      - Ícone (esquerda):
        - Container: `w-6 h-6 sm:w-8 sm:h-8` (24px mobile, 32px desktop)
        - Background: `rgba(255,158,43,0.15)`
        - Border-radius: `rounded-lg` (12px)
        - Ícone: Cor laranja `#ff9e2b`, `w-3 h-3 sm:w-4 sm:h-4`
      - Conteúdo (direita):
        - Número:
          - Tamanho: `text-sm sm:text-lg` (14px mobile, 18px desktop)
          - Peso: 700 (Bold)
          - Cor: `#1f2937` (cinza escuro)
          - Espaçamento inferior: `mb-0.5`
        - Label:
          - Tamanho: `text-[9px] sm:text-[10px]` (9px mobile, 10px desktop)
          - Peso: 400 (Normal)
          - Cor: `foreground/70` (70% opacidade)

##### Menu de Navegação

- **Container:**

  - Layout: Flex vertical, `flex-col`
  - Gap: `gap-1.5 sm:gap-2` (6px mobile, 8px desktop)
  - Alinhamento: `items-start`
  - Largura: `w-full`
  - Overflow: `overflow-x-hidden`

- **Itens Principais:**

  - Layout: Flex horizontal, `items-center`
  - Gap: `gap-1.5 sm:gap-2` (6px mobile, 8px desktop)
  - Padding:
    - Mobile: `px-2 py-1.5` (8px horizontal, 6px vertical)
    - Desktop: `px-4 py-2` (16px horizontal, 8px vertical)
  - Border-radius: `rounded-lg` (12px)
  - Transição: `transition-all duration-200`
  - Largura: `w-full`
  - Texto: `text-left`

  - **Estado Normal:**

    - Cor: `text-sidebar-foreground/80` (80% opacidade)
    - Background: Transparente
    - Borda: `border border-transparent`

  - **Estado Hover:**

    - Cor: `text-sidebar-foreground` (100% opacidade)
    - Background: `bg-[hsl(var(--custom-blue))]/20` (azul 20% opacidade)
    - Borda: `border-[hsl(var(--custom-blue))]/40` (azul 40% opacidade)

  - **Estado Ativo:**

    - Cor: Branco (`text-white`)
    - Background: `bg-[hsl(var(--custom-blue))]` (azul sólido)
    - Sombra: `shadow-[0_3px_12px_hsl(var(--custom-blue),0.4)]`
    - Borda: Sem borda visível

  - **Ícone:**

    - Tamanho: `w-4 h-4` (16px)
    - Flex-shrink: 0
    - Cor: Herda do texto

  - **Texto:**

    - Fonte: Inter, Bold
    - Tamanho: `text-sm sm:text-lg` (14px mobile, 18px desktop)
    - Whitespace: `whitespace-nowrap`
    - Flex: `flex-1`
    - Truncate: `truncate` (se necessário)

  - **Ícone de Expansão (ChevronDown/ChevronRight):**
    - Tamanho: `w-4 h-4` (16px)
    - Flex-shrink: 0
    - Rotação: ChevronDown quando expandido, ChevronRight quando colapsado

- **Subitens (dentro de Collapsible):**

  - Container: Flex vertical, `flex-col`, `gap-1`
  - Margem esquerda: `ml-4` (16px)
  - Padding esquerdo: `pl-4` (16px)
  - Borda esquerda: `border-l-2 border-[hsl(var(--custom-blue))]/30` (borda azul 30% opacidade, 2px)

  - **Item de Subseção:**

    - Layout: Flex horizontal, `items-center` ou `items-start`
    - Gap: `gap-1.5 sm:gap-2`
    - Padding:
      - Mobile: `px-2 py-1.5` (8px horizontal, 6px vertical)
      - Desktop: `px-3 py-2` (12px horizontal, 8px vertical)
    - Border-radius: `rounded-lg` (12px)
    - Transição: `transition-all duration-200`
    - Largura: `w-full`
    - Texto: `text-left`

    - **Estado Normal:**

      - Cor: `text-sidebar-foreground/70` (70% opacidade)
      - Background: Transparente
      - Borda: `border border-transparent`

    - **Estado Hover:**

      - Cor: `text-sidebar-foreground` (100% opacidade)
      - Background: `bg-[hsl(var(--custom-blue))]/30` (azul 30% opacidade)
      - Borda: `border-[hsl(var(--custom-blue))]/30` (azul 30% opacidade)

    - **Estado Ativo:**

      - Cor: `text-sidebar-foreground` (100% opacidade)
      - Background: `bg-[hsl(var(--custom-blue))]/30` (azul 30% opacidade)
      - Borda: `border-[hsl(var(--custom-blue))]/30` (azul 30% opacidade)

    - **Texto:**
      - Fonte: Inter
      - Tamanho: `text-xs sm:text-sm` (12px mobile, 14px desktop)
      - Para questões: Layout com "Q1", "Q2", etc. à esquerda e texto da pergunta (truncate com tooltip se > 60 caracteres)

#### 4.2.3 Sidebar Mobile (Sheet/Modal)

**Sheet Container:**

- Background: `bg-sidebar`
- Largura:
  - Mobile: `w-full` (100%)
  - Tablet: `w-[320px]` (320px)
- Altura: `h-full` (100%)
- Posição: Fixa, esquerda
- Overlay: `bg-black/90` (preto 90% opacidade)
- Animação: Slide-in da esquerda
  - Duração abertura: 500ms
  - Duração fechamento: 300ms
  - Easing: `ease-in-out`

**Botão Fechar:**

- Posição: Canto superior direito
- Tamanho: `p-1.5 sm:p-2`
- Border-radius: `rounded-lg`
- Cor: `text-sidebar-foreground/80`
- Hover: `hover:text-sidebar-foreground hover:bg-[hsl(var(--custom-blue))]/20`
- Borda hover: `hover:border-[hsl(var(--custom-blue))]/40`
- Transição: `transition-all duration-200`

**Conteúdo:**

- Mesma estrutura da sidebar desktop, adaptada para mobile

### 4.3 Cards

#### 4.3.1 Card Padrão (Elevated)

**Container:**

- Background: `bg-card` (cor do tema)
- Border-radius: `rounded-lg` (12px)
- Borda: `border-0` (sem borda)
- Sombra: `0 6px 24px rgba(0,0,0,0.4), 0 2px 6px rgba(255,158,43,0.1)`
- Transição: `transition-all duration-300`

**Hover:**

- Sombra: `0 8px 32px rgba(0,0,0,0.6), 0 3px 12px rgba(255,158,43,0.2)`

**Classe CSS:** `.card-elevated`

#### 4.3.2 Card Header

**Container:**

- Padding: `py-6` (24px vertical)
- Display: Flex, `items-center`, `justify-center`
- Título:
  - Fonte: Poppins, Bold
  - Tamanho: `text-2xl` (24px)
  - Cor: `text-card-foreground`
  - Display: Flex, `items-center`, `gap-2` (8px)

#### 4.3.3 Card Content

**Container:**

- Padding: `p-4` ou `p-6` (16px ou 24px)
- Espaçamento interno: `space-y-3` ou `space-y-4` (conforme conteúdo)

### 4.4 Botões

#### 4.4.1 Botão Primário (Azul - Navegação)

Ver seção **4.1.2 - Botão Anterior/Próximo** para especificações completas.

#### 4.4.2 Botão Ghost (Menu Hamburger)

- **Variante:** Ghost
- **Tamanho:** Icon (`size="icon"`)
- **Background:** Transparente
- **Hover:** `hover:bg-muted`
- **Cor:** `text-foreground`
- **Padding:** Conforme tamanho do ícone

#### 4.4.3 Botão de Fechar (Sidebar Mobile)

- **Estilo:** Custom
- **Padding:** `p-1.5 sm:p-2` (6px mobile, 8px desktop)
- **Border-radius:** `rounded-lg` (12px)
- **Cor:** `text-sidebar-foreground/80`
- **Hover:**
  - Cor: `text-sidebar-foreground`
  - Background: `bg-[hsl(var(--custom-blue))]/20`
  - Borda: `border-[hsl(var(--custom-blue))]/40`
- **Transição:** `transition-all duration-200`

### 4.5 Tabelas

#### 4.5.1 Tabela Padrão

**Container:**

- Largura: `w-full`
- Border-collapse: `border-collapse`

**Header (TableHead):**

- Background: Conforme tema
- Padding: `px-4 py-3` (16px horizontal, 12px vertical)
- Texto: Alinhado à esquerda, Bold
- Cor: Foreground

**Células (TableCell):**

- Padding: `px-4 py-3` (16px horizontal, 12px vertical)
- Borda inferior: `border-b border-border`
- Transição: `transition-all duration-200`

**Linhas (TableRow):**

- **Hover:** `hover:bg-primary/10` (background laranja 10% opacidade)
- **Selecionado:** `data-[state=selected]:bg-primary/20` (background laranja 20% opacidade)

### 4.6 Gráficos

#### 4.6.1 Cores dos Gráficos

- **Chart 1:** Laranja `#ff9e2b` (HSL: `33 100% 58%`)
- **Chart 2:** `20 90% 55%`
- **Chart 3:** `30 85% 55%`
- **Chart 4:** `15 95% 52%`
- **Chart 5:** `25 90% 53%`

#### 4.6.2 Tipos de Gráfico

- **Bar Chart:** Barras verticais ou horizontais
- **Stacked Chart:** Gráfico empilhado
- **NPS Chart:** Gráfico específico para NPS (Net Promoter Score)

### 4.7 Modais/Dialogs

#### 4.7.1 Dialog Overlay

- Background: `bg-black/80` (preto 80% opacidade)
- Posição: `fixed inset-0`
- Z-index: `z-50`
- Animação: Fade-in
  - Duração: 200ms
  - Propriedades: `opacity 0 → 1`

#### 4.7.2 Dialog Content

- Background: `bg-background`
- Border-radius: `rounded-lg` (12px desktop, sem radius mobile)
- Padding: `p-6` (24px)
- Sombra: `shadow-lg`
- Posição: Centralizado (`left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]`)
- Largura máxima: `max-w-lg`
- Animação:
  - Entrada: Fade-in + Zoom-in + Slide-in
  - Saída: Fade-out + Zoom-out + Slide-out
  - Duração: 200ms

#### 4.7.3 Botão Fechar (Dialog)

- Posição: `absolute right-4 top-4`
- Tamanho: `h-4 w-4` (16px)
- Opacidade: `opacity-70`
- Hover: `opacity-100`
- Cor: Foreground

### 4.8 Tooltips

#### 4.8.1 Tooltip Container

- Background: `bg-popover`
- Cor: `text-popover-foreground`
- Padding: `px-3 py-1.5` (12px horizontal, 6px vertical)
- Border-radius: `rounded-md` (8px)
- Sombra: `shadow-md`
- Z-index: `z-50`
- Animação: Fade-in + Zoom-in + Slide-in
  - Duração: Conforme configuração padrão

#### 4.8.2 Posicionamento

- Posições: top, bottom, left, right
- Offset: 8px do elemento trigger

### 4.9 Accordions

#### 4.9.1 Accordion Item

**Trigger:**

- Display: Flex, `items-center`, `justify-between`
- Padding: `py-4` (16px vertical)
- Fonte: Medium
- Transição: `transition-all`
- Hover: `hover:underline`
- Ícone (ChevronDown):
  - Tamanho: `h-4 w-4` (16px)
  - Transição: `transition-transform duration-200`
  - Rotação: `rotate-180` quando aberto

**Content:**

- Overflow: `overflow-hidden`
- Animação:
  - Abertura: `animate-accordion-down` (height 0 → auto)
  - Fechamento: `animate-accordion-up` (height auto → 0)
  - Duração: 200ms
  - Easing: `ease-out`

---

## 5. Animações e Transições

### 5.1 Princípios Gerais

- **Duração padrão:** 200ms - 300ms
- **Easing functions:**
  - `ease-out` para entradas
  - `ease-in-out` para transições suaves
  - `ease-in` para saídas (raramente usado)
- **Quando usar animações:**
  - Entrada de conteúdo novo
  - Mudanças de estado (hover, active)
  - Transições entre seções
  - Abertura/fechamento de modais

### 5.2 Animações Específicas

#### 5.2.1 Fade-in de Conteúdo

**Descrição:** Animação suave de entrada quando uma nova seção é carregada.

**Especificações:**

- **Duração:** 300ms
- **Easing:** `ease-out`
- **Propriedades animadas:**
  - `opacity: 0 → 1`
  - `transform: translateY(10px) → translateY(0)`
- **Quando ocorre:** Ao mudar de seção no ContentRenderer
- **Classe CSS:** `animate-fade-in`
- **Keyframes:**

```css
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 5.2.2 Hover em Botões

**Descrição:** Efeito de escala sutil ao passar o mouse sobre botões.

**Especificações:**

- **Duração:** 200ms
- **Easing:** `ease-in-out` (implícito)
- **Propriedades animadas:**
  - `transform: scale(1) → scale(1.02)`
  - Sombra aumentada (se aplicável)
- **Quando ocorre:** Mouse sobre botão
- **Implementação:** `hover:scale-[1.02] transition-all`

#### 5.2.3 Active em Botões

**Descrição:** Feedback visual ao clicar em botões.

**Especificações:**

- **Duração:** 100ms
- **Easing:** `ease-in-out` (implícito)
- **Propriedades animadas:**
  - `transform: scale(1) → scale(0.98)`
- **Quando ocorre:** Clique no botão
- **Implementação:** `active:scale-[0.98] transition-all`

#### 5.2.4 Slide-in da Sidebar (Mobile)

**Descrição:** Animação de entrada/saída do menu mobile (Sheet).

**Especificações:**

- **Duração abertura:** 500ms
- **Duração fechamento:** 300ms
- **Easing:** `ease-in-out`
- **Propriedades animadas:**
  - `transform: translateX(-100%) → translateX(0)` (abertura)
  - `transform: translateX(0) → translateX(-100%)` (fechamento)
- **Quando ocorre:** Abrir/fechar menu mobile
- **Overlay:** Fade-in simultâneo (opacity 0 → 1)

#### 5.2.5 Overlay Fade-in (Modal/Sheet)

**Descrição:** Animação de fade do overlay de modais e sheets.

**Especificações:**

- **Duração:** 200ms
- **Easing:** `ease-in-out`
- **Propriedades animadas:**
  - `opacity: 0 → 1` (abertura)
  - `opacity: 1 → 0` (fechamento)
- **Quando ocorre:** Abrir/fechar modal ou sheet
- **Background:** `bg-black/90` ou `bg-black/80`

#### 5.2.6 Accordion Expand/Collapse

**Descrição:** Animação de abertura/fechamento de accordions.

**Especificações:**

- **Duração:** 200ms
- **Easing:** `ease-out`
- **Propriedades animadas:**
  - `height: 0 → var(--radix-accordion-content-height)` (abertura)
  - `height: var(--radix-accordion-content-height) → 0` (fechamento)
- **Quando ocorre:** Expandir/colapsar seção do accordion
- **Ícone:** Rotação simultânea (0° → 180°)

#### 5.2.7 Transição de Conteúdo (Margin Left)

**Descrição:** Ajuste suave da margem esquerda do conteúdo quando a sidebar muda de tamanho.

**Especificações:**

- **Duração:** 200ms
- **Easing:** `ease-in-out` (implícito)
- **Propriedades animadas:**
  - `margin-left: valor_anterior → novo_valor`
- **Quando ocorre:** Mudança de seção ou resize da janela (sidebar pode mudar de largura)
- **Implementação:** `transition-all duration-200` no container do conteúdo principal

#### 5.2.8 Transição de Hover em Itens de Menu

**Descrição:** Transição suave de cores e backgrounds em itens de menu.

**Especificações:**

- **Duração:** 200ms
- **Easing:** `ease-in-out` (implícito)
- **Propriedades animadas:**
  - Cor do texto (opacidade)
  - Background
  - Borda (opacidade)
- **Quando ocorre:** Hover em itens da sidebar
- **Implementação:** `transition-all duration-200`

---

## 6. Responsividade

### 6.1 Breakpoints

- **Mobile (sm):** < 640px
- **Tablet:** 640px - 1023px
- **Desktop (lg):** ≥ 1024px
- **Large Desktop (xl):** ≥ 1280px
- **Extra Large (2xl):** ≥ 1536px

### 6.2 Comportamento por Breakpoint

#### 6.2.1 Header

##### Mobile (<640px)

- **Menu hamburger:** Visível
- **Título:**
  - Tamanho: 14px (`text-sm`)
  - Padding: `px-1.5 py-1` (6px horizontal, 4px vertical)
- **Botões navegação:**
  - Layout: Horizontal compacto
  - Apenas ícone da seção + nome da subseção (lado a lado)
  - Padding: `px-1.5 py-1`
- **Padding lateral:** 8px (`px-2`)
- **Padding vertical:** 8px (`py-2`)

##### Tablet (640px - 1023px)

- **Menu hamburger:** Visível
- **Título:**
  - Tamanho: 18px (intermediário)
  - Padding: `px-4 py-2` (16px horizontal, 8px vertical)
- **Botões navegação:**
  - Layout: Horizontal
  - Ícone da seção + subseção (lado a lado)
  - Padding: `px-4 py-3`
- **Padding lateral:** 16px (`px-4`)
- **Padding vertical:** 16px (`py-4`)

##### Desktop (≥1024px)

- **Menu hamburger:** Oculto
- **Título:**
  - Tamanho: 24px (`text-2xl`)
  - Padding: `px-4 py-2` (16px horizontal, 8px vertical)
- **Botões navegação:**
  - Layout: Vertical (coluna)
  - Seção (linha 1) + Subseção (linha 2, menor, opacity 90%)
  - Padding: `px-4 py-3`
- **Padding lateral:** 24px (`px-6`)
- **Padding vertical:** 16px (`py-4`)

#### 6.2.2 Sidebar

##### Mobile (<1024px)

- **Visibilidade:** Oculto por padrão
- **Acesso:** Via menu hamburger (abre Sheet)
- **Largura do Sheet:** 100% (mobile) ou 320px (tablet)
- **Overlay:** Preto 90% opacidade

##### Desktop (≥1024px)

- **Visibilidade:** Sempre visível, fixa à esquerda
- **Largura:** Auto (fit-content)
- **Posição:** Fixed, não sobrepõe conteúdo

#### 6.2.3 Conteúdo Principal

##### Mobile (<640px)

- **Largura:** 100%
- **Padding lateral:** 8px (`px-2`)
- **Padding vertical:** 16px (`py-4`)
- **Max-width:** 100% (sem restrição)

##### Tablet (640px - 1023px)

- **Largura:** 100%
- **Padding lateral:** 16px (`px-4`)
- **Padding vertical:** 24px (`py-6`)
- **Max-width:** 100% (sem restrição)

##### Desktop (≥1024px)

- **Largura:** 100% menos margem esquerda (largura da sidebar)
- **Padding lateral:** 24px (`px-6`)
- **Padding vertical:** 32px (`py-8`)
- **Max-width:**
  - XL (≥1280px): 98% da largura disponível
  - 2XL (≥1536px): 96% da largura disponível

#### 6.2.4 Cards

##### Mobile (<640px)

- **Padding:** 12px - 16px (`p-3` ou `p-4`)
- **Gap entre cards:** 16px (`gap-4`)
- **Grid:** 1 coluna (stack vertical)

##### Tablet (640px - 1023px)

- **Padding:** 16px - 20px (`p-4` ou `p-5`)
- **Gap entre cards:** 20px - 24px (`gap-5` ou `gap-6`)
- **Grid:** 1-2 colunas (conforme espaço)

##### Desktop (≥1024px)

- **Padding:** 24px (`p-6`)
- **Gap entre cards:** 24px (`gap-6`)
- **Grid:** 2-3 colunas (conforme conteúdo)

#### 6.2.5 Tipografia Responsiva

##### Títulos

- **Mobile:** 18px - 20px
- **Tablet:** 20px - 22px
- **Desktop:** 24px

##### Texto de Corpo

- **Mobile:** 14px - 16px
- **Tablet:** 16px
- **Desktop:** 16px

##### Texto Pequeno

- **Mobile:** 9px - 10px
- **Tablet:** 10px - 12px
- **Desktop:** 12px - 14px

---

## 7. Especificações por Tela

### 7.1 Template para Documentação de Tela

Para cada screenshot/tela, documentar seguindo este template:

```
### [Nome da Tela] - Screenshot: [nome_arquivo.png]

#### Visão Geral
[Descrição do que a tela mostra e contexto de uso]

#### Layout
- Estrutura de grid/colunas
- Posicionamento de elementos principais
- Espaçamentos entre seções

#### Componentes Presentes
[Lista de todos os componentes visíveis na tela]

#### Especificações Detalhadas
[Para cada componente, especificar:]
- Posição (coordenadas relativas ou descrição)
- Tamanho (largura, altura)
- Cores exatas
- Tipografia
- Espaçamentos internos
- Bordas e sombras
- Estados visuais (se aplicável)

#### Interações
- O que acontece ao clicar em cada elemento
- Hover states visíveis
- Animações presentes

#### Responsividade
- Como a tela se adapta em diferentes tamanhos
- Elementos que aparecem/desaparecem
- Mudanças de layout
```

### 7.2 Lista de Telas para Documentar

1. **Sumário Executivo** (`tela_01_sumario_executivo.png`)
2. **Recomendações Executivas** (`tela_02_recomendacoes.png`)
3. **Análise de Sentimento** (`tela_03_sentimento.png`)
4. **Intenção de Respondentes** (`tela_04_intencao.png`)
5. **Segmentação** (`tela_05_segmentacao.png`)
6. **Aprofundamento: Estado** (`tela_06_atributo_estado.png`)
7. **Aprofundamento: Educação** (`tela_07_atributo_educacao.png`)
8. **Aprofundamento: Tipo de Cliente** (`tela_08_atributo_tipo_cliente.png`)
9. **Análise: Questão 1 (NPS)** (`tela_09_questao_1.png`)
10. **Análise: Questão 2** (`tela_10_questao_2.png`)
11. **Análise: Questão 4** (`tela_11_questao_4.png`)
12. **Análise: Questão 5** (`tela_12_questao_5.png`)
13. **Página de Export** (`tela_13_export.png`)

**Nota:** As especificações detalhadas de cada tela devem ser preenchidas analisando os screenshots PNG fornecidos, seguindo o template acima.

---

## 8. Checklist de Implementação

### 8.1 Sistema de Design

- [ ] Paleta de cores implementada (todas as cores HEX/HSL documentadas)
- [ ] Tipografia configurada (Inter para corpo, Poppins para títulos)
- [ ] Espaçamentos definidos (sistema baseado em 4px)
- [ ] Sombras criadas (todas as variações documentadas)
- [ ] Bordas e raios configurados (12px padrão)
- [ ] Modo claro e escuro implementado

### 8.2 Layout

- [ ] Sidebar desktop implementada (fixa, largura auto)
- [ ] Menu mobile implementado (Sheet com overlay)
- [ ] Header sticky funcionando (z-index 10)
- [ ] Conteúdo principal com margem esquerda dinâmica
- [ ] Transição suave da margem ao redimensionar

### 8.3 Componentes

- [ ] Header com navegação (título laranja, botões anterior/próximo)
- [ ] Sidebar com menu (card de info, menu navegação, subitens)
- [ ] Cards estilizados (sombra, hover, transições)
- [ ] Botões com estados (normal, hover, active)
- [ ] Tabelas formatadas (hover, seleção)
- [ ] Gráficos renderizados (cores corretas)
- [ ] Modais/Dialogs (overlay, animações)
- [ ] Tooltips (posicionamento, animações)
- [ ] Accordions (expansão/colapso animado)
- [ ] Badges de severidade (cores corretas)
- [ ] Filtros e painéis (FilterPanel)

### 8.4 Animações

- [ ] Fade-in de conteúdo (300ms, translateY)
- [ ] Hover states (scale 1.02, 200ms)
- [ ] Active states (scale 0.98, 100ms)
- [ ] Transições de página (margin-left, 200ms)
- [ ] Animações de modais (fade-in, zoom, slide)
- [ ] Accordions animados (height, 200ms)
- [ ] Slide-in da sidebar mobile (500ms abertura, 300ms fechamento)
- [ ] Transições de hover em menus (200ms)

### 8.5 Responsividade

- [ ] Mobile (<640px) - Layout adaptado
- [ ] Tablet (640-1023px) - Layout intermediário
- [ ] Desktop (≥1024px) - Layout completo
- [ ] Large Desktop (≥1280px) - Max-width aplicado
- [ ] Extra Large (≥1536px) - Max-width ajustado

### 8.6 Funcionalidades

- [ ] Navegação entre seções (botões anterior/próximo)
- [ ] Menu expansível/colapsável (Collapsible)
- [ ] Filtros funcionando (FilterPanel)
- [ ] Interações de gráficos (tooltips, hover)
- [ ] Modo claro/escuro (ThemeToggle)
- [ ] Accordions interativos (abrir/fechar)
- [ ] Word Cloud interativa (se aplicável)
- [ ] Export de dados (página Export)

### 8.7 Validação Visual

- [ ] Comparar com screenshots PNG fornecidos
- [ ] Verificar cores exatas (usar color picker)
- [ ] Verificar espaçamentos (usar régua/pixel ruler)
- [ ] Verificar tipografia (família, tamanho, peso)
- [ ] Verificar sombras (valores exatos)
- [ ] Verificar animações (gravar screen recording se necessário)
- [ ] Testar em diferentes tamanhos de tela
- [ ] Testar modo claro e escuro

---

## 9. Anexos

### 9.1 Referências de Screenshots

**Organização sugerida:**

- Criar pasta `screenshots/` com todos os PNGs
- Nomear arquivos conforme lista na seção 1.3
- Referenciar screenshots no formato: `![Descrição](screenshots/nome_arquivo.png)`

### 9.2 Valores de Cores Completos

**Cores Principais:**

- Laranja Primário: `#ff9e2b` / `hsl(33, 100%, 58%)`
- Azul Título: `#1982d8` / `hsl(207, 79%, 47%)`
- Preto: `#000000`
- Branco: `#ffffff`

**Backgrounds:**

- Background Claro: `#F9FAFB` / `hsl(0, 0%, 98%)`
- Background Escuro: `hsl(0, 0%, 3%)`
- Card Claro: `#FFFFFF`
- Card Escuro: `hsl(0, 0%, 8%)`
- Sidebar Claro: `#F9FAFB` / `hsl(0, 0%, 98%)`
- Sidebar Escuro: `hsl(0, 0%, 10%)`

**Textos:**

- Foreground Claro: `#000000`
- Foreground Escuro: `#FFFFFF`
- Muted Claro: `hsl(0, 0%, 45%)`
- Muted Escuro: `hsl(0, 0%, 60%)`

### 9.3 Fontes Utilizadas

- **Inter:** Google Fonts ou CDN
- **Poppins:** Google Fonts ou CDN

**Links sugeridos:**

- Inter: `https://fonts.google.com/specimen/Inter`
- Poppins: `https://fonts.google.com/specimen/Poppins`

---

## 10. Notas Finais

### 10.1 Precisão

Esta documentação foi criada com base no código fonte da aplicação. Para garantir precisão máxima na implementação:

1. **Use os screenshots PNG como referência visual principal**
2. **Valide valores de cores usando color picker nos screenshots**
3. **Meça espaçamentos diretamente nos screenshots**
4. **Teste animações comparando com comportamento esperado**
5. **Valide responsividade em diferentes dispositivos/tamanhos**

### 10.2 Adaptações

Algumas adaptações podem ser necessárias dependendo da tecnologia utilizada:

- **Framework CSS:** Ajustar classes Tailwind para framework equivalente
- **Biblioteca de componentes:** Adaptar componentes para biblioteca escolhida
- **Animações:** Implementar keyframes conforme framework (CSS puro, Framer Motion, etc.)

### 10.3 Suporte

Para dúvidas sobre implementação:

1. Consultar screenshots PNG correspondentes
2. Referenciar seções específicas desta documentação
3. Validar com código fonte original (se disponível)

---

**Documento criado em:** [Data]
**Versão:** 1.0
**Última atualização:** [Data]



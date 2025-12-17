# Paleta de Cores para Design System no Figma

Este documento lista todas as cores do sistema com seus nomes de variáveis para criação do design system no Figma.

---

## 🎨 Cores Principais (Base)

### Laranja

| Nome da Variável       | Cor (Hex) | HSL           | Descrição                           |
| ---------------------- | --------- | ------------- | ----------------------------------- |
| `COLOR_ORANGE_PRIMARY` | `#FF9E2B` | `33 100% 58%` | Laranja principal - cor de destaque |
| `HSL_ORANGE_PRIMARY`   | `#FF9E2B` | `33 100% 58%` | Laranja em HSL (mesma cor)          |

### Azul

| Nome da Variável    | Cor (Hex) | HSL            | Descrição                                |
| ------------------- | --------- | -------------- | ---------------------------------------- |
| `COLOR_BLUE_CUSTOM` | `#0B18C8` | `236 90% 41%`  | Azul customizado - elementos interativos |
| `COLOR_BLUE_TITLE`  | `#001DC6` | `231 100% 39%` | Azul escuro para títulos                 |
| `HSL_BLUE_CUSTOM`   | `#0B18C8` | `236 90% 41%`  | Azul customizado em HSL                  |
| `HSL_BLUE_TITLE`    | `#001DC6` | `231 100% 39%` | Azul título em HSL                       |
| `HSL_BLUE_SUBTITLE` | `#0026E6` | `231 100% 45%` | Azul subtítulo em HSL                    |

### Neutros

| Nome da Variável | Cor (Hex) | Descrição |
| ---------------- | --------- | --------- |
| `COLOR_BLACK`    | `#000000` | Preto     |
| `COLOR_WHITE`    | `#FFFFFF` | Branco    |

---

## 🌓 Cores Light Mode

| Nome da Variável             | Cor (Hex) | Descrição        |
| ---------------------------- | --------- | ---------------- |
| `COLOR_LIGHT_BACKGROUND`     | `#F9FAFB` | Fundo claro      |
| `COLOR_LIGHT_TEXT`           | `#000000` | Texto escuro     |
| `COLOR_LIGHT_TEXT_SECONDARY` | `#374151` | Texto secundário |
| `COLOR_GRAY_DARK`            | `#1F2937` | Cinza escuro     |
| `COLOR_LIGHT_CARD`           | `#FFFFFF` | Card claro       |
| `COLOR_LIGHT_BORDER`         | `#E5E7EB` | Borda clara      |

---

## 🌑 Cores Dark Mode (via CSS Variables)

### Backgrounds

| Variável CSS           | Light Mode (Hex) | Dark Mode (Hex) | HSL (Dark) |
| ---------------------- | ---------------- | --------------- | ---------- |
| `--background`         | `#F9FAFB`        | `#080808`       | `0 0% 3%`  |
| `--card`               | `#FFFFFF`        | `#141414`       | `0 0% 8%`  |
| `--popover`            | `#FFFFFF`        | `#141414`       | `0 0% 8%`  |
| `--sidebar-background` | `#F9FAFB`        | `#1A1A1A`       | `0 0% 10%` |

### Textos

| Variável CSS         | Light Mode (Hex) | Dark Mode (Hex) | HSL (Dark)  |
| -------------------- | ---------------- | --------------- | ----------- |
| `--foreground`       | `#000000`        | `#FFFFFF`       | `0 0% 100%` |
| `--card-foreground`  | `#000000`        | `#FFFFFF`       | `0 0% 100%` |
| `--muted-foreground` | `#737373`        | `#999999`       | `0 0% 60%`  |

### Primárias e Secundárias

| Variável CSS  | Light Mode (Hex) | Dark Mode (Hex) | HSL           |
| ------------- | ---------------- | --------------- | ------------- |
| `--primary`   | `#FF9E2B`        | `#FF9E2B`       | `33 100% 58%` |
| `--secondary` | `#F5F5F5`        | `#1F1F1F`       | `0 0% 12%`    |
| `--accent`    | `#FF9E2B`        | `#FF9E2B`       | `33 100% 58%` |
| `--muted`     | `#F5F5F5`        | `#2E2E2E`       | `0 0% 18%`    |

### Bordas

| Variável CSS       | Light Mode (Hex) | Dark Mode (Hex) | HSL (Dark) |
| ------------------ | ---------------- | --------------- | ---------- |
| `--border`         | `#E6E6E6`        | `#333333`       | `0 0% 20%` |
| `--input`          | `#E6E6E6`        | `#333333`       | `0 0% 20%` |
| `--sidebar-border` | `#E6E6E6`        | `#333333`       | `0 0% 20%` |

---

## 🎨 Cores de Estado (Semantic Colors)

### Destrutivo (Erro)

| Variável CSS               | Light Mode (Hex) | Dark Mode (Hex) | HSL (Light) | HSL (Dark)  |
| -------------------------- | ---------------- | --------------- | ----------- | ----------- |
| `--destructive`            | `#EF4444`        | `#EF4444`       | `0 84% 60%` | `0 84% 60%` |
| `--destructive-foreground` | `#FFFFFF`        | `#FFFFFF`       | `0 0% 100%` | `0 0% 100%` |

### Sucesso

| Variável CSS           | Light Mode (Hex) | Dark Mode (Hex) | HSL (Light)   | HSL (Dark)    |
| ---------------------- | ---------------- | --------------- | ------------- | ------------- |
| `--success`            | `#059669`        | `#059669`       | `161 94% 30%` | `161 94% 30%` |
| `--success-foreground` | `#FFFFFF`        | `#FFFFFF`       | `0 0% 100%`   | `0 0% 100%`   |

### Aviso

| Variável CSS           | Light Mode (Hex) | Dark Mode (Hex) | HSL (Light)  | HSL (Dark)   |
| ---------------------- | ---------------- | --------------- | ------------ | ------------ |
| `--warning`            | `#F59E0B`        | `#F59E0B`       | `38 92% 50%` | `38 90% 55%` |
| `--warning-foreground` | `#FFFFFF`        | `#FFFFFF`       | `0 0% 100%`  | `0 0% 100%`  |

### Informação

| Variável CSS        | Light Mode (Hex) | Dark Mode (Hex) | HSL (Light)   | HSL (Dark)    |
| ------------------- | ---------------- | --------------- | ------------- | ------------- |
| `--info`            | `#3B82F6`        | `#3B82F6`       | `199 89% 48%` | `199 85% 55%` |
| `--info-foreground` | `#FFFFFF`        | `#FFFFFF`       | `0 0% 100%`   | `0 0% 100%`   |

---

## 📊 Cores de Gráficos (Chart Colors)

### Sentimento

| Variável CSS       | Light Mode (Hex) | Dark Mode (Hex) | HSL (Light)   | HSL (Dark)    |
| ------------------ | ---------------- | --------------- | ------------- | ------------- |
| `--chart-positive` | `#3B82F6`        | `#3B82F6`       | `210 80% 50%` | `210 75% 55%` |
| `--chart-negative` | `#EF4444`        | `#EF4444`       | `0 84% 60%`   | `0 84% 60%`   |
| `--chart-neutral`  | `#6B7280`        | `#9CA3AF`       | `220 14% 50%` | `220 14% 60%` |

### Séries de Gráficos

| Variável CSS | Light/Dark Mode (Hex) | HSL           |
| ------------ | --------------------- | ------------- |
| `--chart-1`  | `#FF9E2B`             | `33 100% 58%` |
| `--chart-2`  | `#F97316`             | `20 90% 55%`  |
| `--chart-3`  | `#FB923C`             | `30 85% 55%`  |
| `--chart-4`  | `#F97316`             | `15 95% 52%`  |
| `--chart-5`  | `#FB923C`             | `25 90% 53%`  |

---

## ⚠️ Cores de Severidade

| Variável CSS          | Light/Dark Mode (Hex) | HSL           | Descrição |
| --------------------- | --------------------- | ------------- | --------- |
| `--severity-critical` | `#EF4444`             | `0 84% 60%`   | Crítico   |
| `--severity-high`     | `#F97316`             | `25 95% 53%`  | Alto      |
| `--severity-medium`   | `#F59E0B`             | `38 92% 50%`  | Médio     |
| `--severity-low`      | `#10B981`             | `142 76% 36%` | Baixo     |

---

## 🎭 Cores com Opacidade (RGBA)

### Sombras Laranja

| Nome da Variável        | RGBA                    | Hex com Opacidade | Uso                |
| ----------------------- | ----------------------- | ----------------- | ------------------ |
| `RGBA_ORANGE_SHADOW_40` | `rgba(255,158,43,0.4)`  | `#FF9E2B66`       | Sombra forte       |
| `RGBA_ORANGE_SHADOW_30` | `rgba(255,158,43,0.3)`  | `#FF9E2B4D`       | Sombra média       |
| `RGBA_ORANGE_SHADOW_20` | `rgba(255,158,43,0.2)`  | `#FF9E2B33`       | Sombra suave       |
| `RGBA_ORANGE_SHADOW_15` | `rgba(255,158,43,0.15)` | `#FF9E2B26`       | Background sutil   |
| `RGBA_ORANGE_SHADOW_10` | `rgba(255,158,43,0.1)`  | `#FF9E2B1A`       | Sombra muito suave |

### Sombras Pretas

| Nome da Variável       | RGBA               | Hex com Opacidade | Uso                       |
| ---------------------- | ------------------ | ----------------- | ------------------------- |
| `RGBA_BLACK_SHADOW_60` | `rgba(0,0,0,0.6)`  | `#00000099`       | Sombra muito forte        |
| `RGBA_BLACK_SHADOW_40` | `rgba(0,0,0,0.4)`  | `#00000066`       | Sombra forte              |
| `RGBA_BLACK_SHADOW_30` | `rgba(0,0,0,0.3)`  | `#0000004D`       | Sombra média              |
| `RGBA_BLACK_SHADOW_20` | `rgba(0,0,0,0.2)`  | `#00000033`       | Sombra suave              |
| `RGBA_BLACK_SHADOW_10` | `rgba(0,0,0,0.1)`  | `#0000001A`       | Sombra muito suave        |
| `RGBA_BLACK_SHADOW_08` | `rgba(0,0,0,0.08)` | `#00000014`       | Sombra extremamente suave |

### Brancos Translúcidos

| Nome da Variável | RGBA                    | Hex com Opacidade | Uso                  |
| ---------------- | ----------------------- | ----------------- | -------------------- |
| `RGBA_WHITE_20`  | `rgba(255,255,255,0.2)` | `#FFFFFF33`       | Overlay branco médio |
| `RGBA_WHITE_10`  | `rgba(255,255,255,0.1)` | `#FFFFFF1A`       | Overlay branco suave |

### Sombras Azuis

| Nome da Variável             | RGBA                     | Hex com Opacidade | Uso                     |
| ---------------------------- | ------------------------ | ----------------- | ----------------------- |
| `RGBA_BLUE_CUSTOM_SHADOW_30` | `rgba(11, 24, 200, 0.3)` | `#0B18C84D`       | Sombra azul customizada |

### Sombras Light Mode

| Nome da Variável          | RGBA               | Hex com Opacidade | Uso                 |
| ------------------------- | ------------------ | ----------------- | ------------------- |
| `RGBA_LIGHT_SHADOW_HOVER` | `rgba(0,0,0,0.15)` | `#00000026`       | Sombra hover light  |
| `RGBA_LIGHT_SHADOW`       | `rgba(0,0,0,0.1)`  | `#0000001A`       | Sombra padrão light |

---

## 🎨 Cores Especiais

### Highlight Orange

| Variável CSS                    | Light Mode (Hex) | Dark Mode (Hex) | HSL                                          |
| ------------------------------- | ---------------- | --------------- | -------------------------------------------- |
| `--highlight-orange`            | `#FF9E2B`        | `#FF9E2B`       | `33 100% 58%`                                |
| `--highlight-orange-foreground` | `#FFFFFF`        | `#FFFFFF`       | `0 0% 100%`                                  |
| `--highlight-orange-light`      | `#FFF8F0`        | `#3D2E1A`       | `33 100% 95%` (Light) / `33 100% 18%` (Dark) |

### Sidebar

| Variável CSS        | Light Mode (Hex) | Dark Mode (Hex) | HSL (Light)   | HSL (Dark)    |
| ------------------- | ---------------- | --------------- | ------------- | ------------- |
| `--sidebar-primary` | `#FF9E2B`        | `#FF9E2B`       | `33 100% 58%` | `33 100% 58%` |
| `--sidebar-accent`  | `#F5F5F5`        | `#2E2E2E`       | `0 0% 96%`    | `0 0% 18%`    |
| `--sidebar-ring`    | `#FF9E2B`        | `#FF9E2B`       | `33 100% 58%` | `33 100% 58%` |

---

## 📐 Como Criar no Figma

### 1. Estrutura de Cores no Figma

Crie os seguintes grupos de cores:

```
📁 Design System Colors
  📁 Primary
    🟠 Orange Primary (#FF9E2B)
    🔵 Blue Custom (#0B18C8)
    🔵 Blue Title (#001DC6)
    🔵 Blue Subtitle (#0026E6)

  📁 Neutrals
    ⚫ Black (#000000)
    ⚪ White (#FFFFFF)
    🔘 Gray Dark (#1F2937)
    🔘 Light Background (#F9FAFB)
    🔘 Light Card (#FFFFFF)
    🔘 Light Border (#E5E7EB)
    🔘 Light Text Secondary (#374151)

  📁 Semantic
    📁 Success
      🟢 Success (#059669 - unificado)
      🟢 Success Dark (#059669)
    📁 Warning
      🟡 Warning (#F59E0B)
    📁 Error
      🔴 Destructive (#EF4444)
      🔴 Destructive (#EF4444 - unificado)
    📁 Info
      🔵 Info (#3B82F6)

  📁 Charts
    📁 Sentiment
      🟢 Chart Positive (#3B82F6)
      🔴 Chart Negative (#EF4444)
      ⚪ Chart Neutral (#6B7280)
    📁 Series
      🟠 Chart 1 (#FF9E2B)
      🟠 Chart 2 (#F97316)
      🟠 Chart 3 (#FB923C)
      🟠 Chart 4 (#F97316)
      🟠 Chart 5 (#FB923C)

  📁 Severity
    🔴 Critical (#EF4444)
    🟠 High (#F97316)
    🟡 Medium (#F59E0B)
    🟢 Low (#10B981)

  📁 Shadows & Overlays
    📁 Orange Shadows
      🟠 Orange Shadow 40% (rgba(255,158,43,0.4))
      🟠 Orange Shadow 30% (rgba(255,158,43,0.3))
      🟠 Orange Shadow 20% (rgba(255,158,43,0.2))
      🟠 Orange Shadow 15% (rgba(255,158,43,0.15))
      🟠 Orange Shadow 10% (rgba(255,158,43,0.1))
    📁 Black Shadows
      ⚫ Black Shadow 60% (rgba(0,0,0,0.6))
      ⚫ Black Shadow 40% (rgba(0,0,0,0.4))
      ⚫ Black Shadow 30% (rgba(0,0,0,0.3))
      ⚫ Black Shadow 20% (rgba(0,0,0,0.2))
      ⚫ Black Shadow 10% (rgba(0,0,0,0.1))
      ⚫ Black Shadow 8% (rgba(0,0,0,0.08))
    📁 White Overlays
      ⚪ White Overlay 20% (rgba(255,255,255,0.2))
      ⚪ White Overlay 10% (rgba(255,255,255,0.1))
    📁 Blue Shadows
      🔵 Blue Shadow 30% (rgba(11, 24, 200, 0.3))

  📁 Theme Variables (Light)
    ⚪ Background (#F9FAFB)
    ⚫ Foreground (#000000)
    ⚪ Card (#FFFFFF)
    🔘 Muted (#F5F5F5)
    🔘 Border (#E6E6E6)

  📁 Theme Variables (Dark)
    ⚫ Background (#080808)
    ⚪ Foreground (#FFFFFF)
    🔘 Card (#141414)
    🔘 Muted (#2E2E2E)
    🔘 Border (#333333)
```

### 2. Nomenclatura no Figma

Use a seguinte convenção para nomes de cores no Figma:

**Formato:** `[Categoria]/[Nome]` ou `[Variável CSS]`

**Exemplos:**

- `Primary/Orange` ou `COLOR_ORANGE_PRIMARY`
- `Semantic/Success` ou `--success`
- `Shadows/Orange-40` ou `RGBA_ORANGE_SHADOW_40`
- `Theme/Light-Background` ou `--background (light)`
- `Theme/Dark-Background` ou `--background (dark)`

### 3. Dicas para Figma

1. **Crie Styles de Cores:**

   - Clique com botão direito na cor → "Add as color style"
   - Use o nome da variável como nome do style

2. **Organize por Modo:**

   - Crie frames separados para Light Mode e Dark Mode
   - Use variantes de componentes para alternar entre temas

3. **Documente as Cores:**

   - Adicione descrições nas cores explicando o uso
   - Use tags para facilitar busca (ex: "primary", "semantic", "shadow")

4. **Crie Tokens de Design:**
   - Use Figma Variables para criar tokens de design
   - Vincule as variáveis CSS às variáveis do Figma

---

## 📋 Checklist para Figma

- [ ] Criar grupo "Primary" com cores laranja e azul
- [ ] Criar grupo "Neutrals" com preto, branco e cinzas
- [ ] Criar grupo "Semantic" com cores de estado
- [ ] Criar grupo "Charts" com cores de gráficos
- [ ] Criar grupo "Severity" com cores de severidade
- [ ] Criar grupo "Shadows & Overlays" com todas as opacidades
- [ ] Criar grupo "Theme Variables" separado por Light/Dark
- [ ] Adicionar descrições em cada cor
- [ ] Criar color styles para todas as cores
- [ ] Organizar em frames separados por categoria
- [ ] Documentar uso de cada cor

---

## 🔗 Referências

- **Arquivo de Cores:** `src/lib/colors.js`
- **Variáveis CSS:** `src/index.css`
- **Relatório Completo:** `RELATORIO_CORES_COMPONENTES.md`

---

## 📝 Notas Importantes

1. **Opacidades no Figma:**

   - Para cores com opacidade, você pode criar layers com blend modes ou usar a opacidade do próprio objeto
   - Recomendação: criar cores sólidas e aplicar opacidade quando necessário

2. **Conversão HSL para Hex:**

   - Todas as cores HSL foram convertidas para Hex para facilitar no Figma
   - Use ferramentas online ou o próprio Figma para conversão se necessário

3. **Variáveis CSS:**

   - As variáveis CSS mudam entre Light e Dark mode
   - Crie versões separadas para cada modo no Figma

4. **Gradientes:**
   - O sistema usa gradientes (ex: `getBlueGradient()`)
   - Crie esses gradientes como estilos no Figma também


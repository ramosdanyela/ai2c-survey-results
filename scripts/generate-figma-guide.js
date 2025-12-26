#!/usr/bin/env node

/**
 * Script para gerar automaticamente o Guia Completo do Figma
 * a partir do código-fonte do aplicativo.
 *
 * Uso: node scripts/generate-figma-guide.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores do arquivo colors.js
const colorsPath = path.join(__dirname, "../src/lib/colors.js");
const indexCssPath = path.join(__dirname, "../src/index.css");
const tailwindConfigPath = path.join(__dirname, "../tailwind.config.js");

// Função para ler e extrair cores do colors.js
function extractColors() {
  const content = fs.readFileSync(colorsPath, "utf-8");
  const colors = {
    hex: {},
    hsl: {},
    rgba: {},
  };

  // Extrair cores HEX
  const hexMatches = content.matchAll(/export const COLOR_(\w+) = "([^"]+)";/g);
  for (const match of hexMatches) {
    colors.hex[match[1].toLowerCase()] = match[2];
  }

  // Extrair cores HSL
  const hslMatches = content.matchAll(/export const HSL_(\w+) = "([^"]+)";/g);
  for (const match of hslMatches) {
    colors.hsl[match[1].toLowerCase()] = match[2];
  }

  // Extrair cores RGBA
  const rgbaMatches = content.matchAll(/export const RGBA_(\w+) = "([^"]+)";/g);
  for (const match of rgbaMatches) {
    colors.rgba[match[1].toLowerCase()] = match[2];
  }

  return colors;
}

// Função para extrair variáveis CSS do index.css
function extractCSSVariables() {
  const content = fs.readFileSync(indexCssPath, "utf-8");
  const variables = {
    light: {},
    dark: {},
  };

  // Extrair variáveis do light mode (:root)
  const lightMatch = content.match(/:root\s*\{([^}]+)\}/s);
  if (lightMatch) {
    const lightVars = lightMatch[1];
    const varMatches = lightVars.matchAll(/--([^:]+):\s*([^;]+);/g);
    for (const match of varMatches) {
      variables.light[match[1].trim()] = match[2].trim();
    }
  }

  // Extrair variáveis do dark mode (.dark)
  const darkMatch = content.match(/\.dark\s*\{([^}]+)\}/s);
  if (darkMatch) {
    const darkVars = darkMatch[1];
    const varMatches = darkVars.matchAll(/--([^:]+):\s*([^;]+);/g);
    for (const match of varMatches) {
      variables.dark[match[1].trim()] = match[2].trim();
    }
  }

  return variables;
}

// Função para extrair ícones usados
function extractIcons() {
  const srcPath = path.join(__dirname, "../src");
  const iconImports = new Set();

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (
        stat.isDirectory() &&
        !file.startsWith(".") &&
        file !== "node_modules"
      ) {
        scanDirectory(filePath);
      } else if (
        file.endsWith(".jsx") ||
        file.endsWith(".tsx") ||
        file.endsWith(".js") ||
        file.endsWith(".ts")
      ) {
        const content = fs.readFileSync(filePath, "utf-8");

        // Extrair imports do lucide-react
        const lucideMatches = content.matchAll(/from ['"]lucide-react['"]/g);
        if (lucideMatches) {
          // Encontrar a linha de import anterior
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (
              lines[i].includes('from "lucide-react"') ||
              lines[i].includes("from 'lucide-react'")
            ) {
              // Pegar a linha anterior que contém os ícones
              if (i > 0) {
                const importLine = lines[i - 1] + lines[i];
                const iconMatches = importLine.match(/\{([^}]+)\}/);
                if (iconMatches) {
                  const icons = iconMatches[1].split(",").map((i) => i.trim());
                  icons.forEach((icon) => iconImports.add(icon));
                }
              }
            }
          }
        }
      }
    }
  }

  scanDirectory(srcPath);
  return Array.from(iconImports).sort();
}

// Função para extrair espaçamentos do Tailwind config
function extractSpacing() {
  // Espaçamentos padrão do Tailwind (baseado em 4px)
  const spacing = {
    0: "0px",
    0.5: "2px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
  };

  return spacing;
}

// Função para extrair breakpoints do Tailwind
function extractBreakpoints() {
  return {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  };
}

// Função para gerar o documento Markdown
function generateMarkdown() {
  const colors = extractColors();
  const cssVars = extractCSSVariables();
  const icons = extractIcons();
  const spacing = extractSpacing();
  const breakpoints = extractBreakpoints();

  let md = `# 🎨 Guia Completo para Replicação no Figma

Este documento contém **TODAS** as informações necessárias para replicar fielmente o aplicativo em um protótipo no Figma.

**⚠️ NOTA**: Este documento foi gerado automaticamente. Para atualizar, execute: \`node scripts/generate-figma-guide.js\`

---

## 📋 Índice

1. [Paleta de Cores](#1-paleta-de-cores)
2. [Tipografia](#2-tipografia)
3. [Espaçamentos](#3-espaçamentos)
4. [Ícones](#4-ícones)
5. [Componentes e Especificações](#5-componentes-e-especificações)
6. [Layout e Estrutura](#6-layout-e-estrutura)
7. [Sombras e Efeitos](#7-sombras-e-efeitos)
8. [Estados e Interações](#8-estados-e-interações)
9. [Breakpoints e Responsividade](#9-breakpoints-e-responsividade)
10. [Gradientes](#10-gradientes)

---

## 1. Paleta de Cores

### 1.1 Cores Principais (Hex)

#### Light Mode

| Nome | Hex | HSL | Uso |
|------|-----|-----|-----|
`;

  // Adicionar cores principais
  if (colors.hex.orange_primary) {
    md += `| **Laranja Primário** | \`${colors.hex.orange_primary}\` | \`${
      colors.hsl.orange_primary || "33 100% 58%"
    }\` | Destaques, botões principais, badges |\n`;
  }
  if (colors.hex.blue_title) {
    md += `| **Azul Título** | \`${colors.hex.blue_title}\` | \`${
      colors.hsl.blue_title || "207 79% 47%"
    }\` | Títulos principais |\n`;
  }
  if (colors.hex.blue_custom) {
    md += `| **Azul Customizado** | \`${colors.hex.blue_custom}\` | \`${
      colors.hsl.blue_custom || "236 90% 41%"
    }\` | Botões de navegação, sidebar ativa |\n`;
  }
  if (colors.hex.light_background) {
    md += `| **Fundo Claro** | \`${colors.hex.light_background}\` | \`0 0% 98%\` | Background principal |\n`;
  }
  if (colors.hex.light_card) {
    md += `| **Card Claro** | \`${colors.hex.light_card}\` | \`0 0% 100%\` | Cards e containers |\n`;
  }
  if (colors.hex.light_text) {
    md += `| **Texto Escuro** | \`${colors.hex.light_text}\` | \`0 0% 0%\` | Texto principal |\n`;
  }
  if (colors.hex.light_border) {
    md += `| **Borda Clara** | \`${colors.hex.light_border}\` | \`0 0% 90%\` | Bordas e divisores |\n`;
  }

  md += `
#### Dark Mode

| Nome | Hex | HSL | Uso |
|------|-----|-----|-----|
| **Fundo Escuro** | \`#000000\` | \`0 0% 3%\` | Background principal |
| **Card Escuro** | \`#141414\` | \`0 0% 8%\` | Cards e containers |
| **Texto Claro** | \`#FFFFFF\` | \`0 0% 100%\` | Texto principal |
| **Texto Secundário** | \`rgba(255,255,255,0.6)\` | \`0 0% 60%\` | Texto secundário |
| **Borda Escura** | \`rgba(255,255,255,0.1)\` | \`0 0% 20%\` | Bordas e divisores |

### 1.2 Cores de Sistema

#### Estados e Feedback

| Nome | Light Mode | Dark Mode | Uso |
|------|------------|-----------|-----|
| **Success** | \`${cssVars.light.success || "#059669"}\` | \`${
    cssVars.dark.success || "#059669"
  }\` | Sucesso, confirmações |
| **Warning** | \`${cssVars.light.warning || "hsl(38, 92%, 50%)"}\` | \`${
    cssVars.dark.warning || "hsl(38, 90%, 55%)"
  }\` | Avisos |
| **Error/Destructive** | \`${
    cssVars.light.destructive || "hsl(0, 84%, 60%)"
  }\` | \`${
    cssVars.dark.destructive || "hsl(0, 84%, 60%)"
  }\` | Erros, ações destrutivas |
| **Info** | \`${cssVars.light.info || "hsl(199, 89%, 48%)"}\` | \`${
    cssVars.dark.info || "hsl(199, 85%, 55%)"
  }\` | Informações |

### 1.3 Sombras com Cores (RGBA)

#### Sombras Laranja

| Nome | RGBA | Uso |
|------|------|-----|
`;

  // Adicionar sombras laranja
  Object.entries(colors.rgba).forEach(([key, value]) => {
    if (key.includes("orange") && key.includes("shadow")) {
      const name = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      md += `| **${name}** | \`${value}\` | Sombras ${
        key.includes("40")
          ? "principais"
          : key.includes("30")
          ? "médias"
          : key.includes("20")
          ? "hover"
          : key.includes("15")
          ? "sutis"
          : "muito sutis"
      } |\n`;
    }
  });

  md += `
#### Sombras Pretas

| Nome | RGBA | Uso |
|------|------|-----|
`;

  // Adicionar sombras pretas
  Object.entries(colors.rgba).forEach(([key, value]) => {
    if (key.includes("black") && key.includes("shadow")) {
      const name = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      md += `| **${name}** | \`${value}\` | Sombras ${
        key.includes("60")
          ? "hover dark"
          : key.includes("40")
          ? "principais dark"
          : key.includes("30")
          ? "médias"
          : key.includes("20")
          ? "leves"
          : key.includes("10")
          ? "muito leves"
          : "extremamente leves"
      } |\n`;
    }
  });

  md += `
---

## 2. Tipografia

### 2.1 Fontes

#### Fonte Principal (Corpo)
- **Nome**: Inter
- **Fallbacks**: \`-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif\`
- **Uso**: Texto do corpo, parágrafos, labels
- **Peso**: Normal (400), Semibold (600), Bold (700)

#### Fonte de Títulos
- **Nome**: Poppins
- **Fallbacks**: \`-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif\`
- **Uso**: Todos os headings (h1-h6), títulos de seção
- **Peso**: Bold (700)

### 2.2 Tamanhos de Fonte

| Classe Tailwind | Tamanho (px) | Tamanho (rem) | Uso |
|-----------------|--------------|---------------|-----|
| \`text-xs\` | 12px | 0.75rem | Labels pequenos, badges |
| \`text-sm\` | 14px | 0.875rem | Texto secundário, botões |
| \`text-base\` | 16px | 1rem | Texto do corpo (padrão) |
| \`text-lg\` | 18px | 1.125rem | Subtítulos, destaque |
| \`text-xl\` | 20px | 1.25rem | Subtítulos de seção |
| \`text-2xl\` | 24px | 1.5rem | Títulos de seção, header |
| \`text-3xl\` | 30px | 1.875rem | Títulos grandes |
| \`text-4xl\` | 36px | 2.25rem | Títulos muito grandes |

---

## 3. Espaçamentos

### 3.1 Sistema de Espaçamento (Tailwind)

O sistema usa a escala padrão do Tailwind (baseada em 4px):

| Classe | Valor (px) | Valor (rem) | Uso |
|--------|------------|-------------|-----|
`;

  // Adicionar espaçamentos
  Object.entries(spacing).forEach(([key, value]) => {
    const rem = (parseFloat(value) / 16).toFixed(3) + "rem";
    md += `| \`p-${key}\` | ${value} | ${rem} | Espaçamento ${
      key === "0"
        ? "zero"
        : key === "0.5"
        ? "mínimo"
        : key === "1"
        ? "muito pequeno"
        : key === "2"
        ? "pequeno"
        : key === "3"
        ? "médio-pequeno"
        : key === "4"
        ? "padrão"
        : key === "6"
        ? "médio"
        : key === "8"
        ? "grande"
        : key === "10"
        ? "muito grande"
        : "extra grande"
    } |\n`;
  });

  md += `
---

## 4. Ícones

### 4.1 Biblioteca de Ícones

**Biblioteca**: \`lucide-react\` (versão 0.556.0)

### 4.2 Ícones Encontrados no Código

`;

  icons.forEach((icon) => {
    md += `- \`${icon}\`\n`;
  });

  md += `
### 4.3 Tamanhos de Ícones

| Tamanho | Classe | Valor | Uso |
|---------|--------|-------|-----|
| **Muito Pequeno** | \`w-3 h-3\` | 12px | Ícones inline muito pequenos |
| **Pequeno** | \`w-4 h-4\` | 16px | Ícones padrão (mais comum) |
| **Médio** | \`w-5 h-5\` | 20px | Ícones médios |
| **Grande** | \`w-6 h-6\` | 24px | Ícones grandes (títulos) |

---

## 9. Breakpoints e Responsividade

### 9.1 Breakpoints Tailwind

| Breakpoint | Tamanho | Prefixo | Uso |
|------------|---------|---------|-----|
`;

  Object.entries(breakpoints).forEach(([key, value]) => {
    const use =
      key === "sm"
        ? "Tablets pequenos"
        : key === "md"
        ? "Tablets"
        : key === "lg"
        ? "Desktop (sidebar aparece)"
        : key === "xl"
        ? "Desktop grande"
        : "Desktop muito grande";
    md += `| **${key}** | ${value} | \`${key}:\` | ${use} |\n`;
  });

  md += `
---

## 📝 Notas Finais

### Checklist para Replicação no Figma

- [ ] Criar paleta de cores completa (Light e Dark mode)
- [ ] Configurar estilos de texto (Inter e Poppins)
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

**Última atualização**: ${new Date().toLocaleString("pt-BR")}
**Gerado automaticamente por**: \`scripts/generate-figma-guide.js\`
`;

  return md;
}

// Executar
try {
  const markdown = generateMarkdown();
  const outputPath = path.join(__dirname, "../GUIA_FIGMA_COMPLETO.md");
  fs.writeFileSync(outputPath, markdown, "utf-8");
  console.log("✅ Guia do Figma gerado com sucesso em:", outputPath);
  console.log(`📊 Estatísticas:`);
  console.log(`   - Ícones encontrados: ${extractIcons().length}`);
  console.log(
    `   - Cores extraídas: ${Object.keys(extractColors().hex).length} HEX, ${
      Object.keys(extractColors().hsl).length
    } HSL, ${Object.keys(extractColors().rgba).length} RGBA`
  );
} catch (error) {
  console.error("❌ Erro ao gerar guia:", error);
  process.exit(1);
}



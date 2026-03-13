# @ai2c/ui - Design System Reutilizável

Pacote UI extraído do projeto AI2C Survey Results. Contém todos os design tokens, componentes shadcn/ui, sistema de cores e utilitários.

## Conteúdo

| Pasta/Arquivo | Descrição |
|---|---|
| `index.css` | CSS variables (light/dark mode), tipografia, layers de componentes |
| `tailwind.config.js` | Configuração Tailwind com todas as cores, animações e tokens |
| `postcss.config.js` | PostCSS com Tailwind + Autoprefixer |
| `lib/colors.js` | Sistema de cores centralizado (hex, HSL, RGBA, paletas, funções de tema) |
| `lib/utils.js` | Utilitário `cn()` (clsx + tailwind-merge) e helpers de texto |
| `lib/icons.js` | Mapeamento centralizado de ícones lucide-react |
| `styles/variants.js` | Variantes CVA para cards e títulos |
| `components/` | 29 componentes shadcn/ui (Button, Card, Dialog, Tabs, etc.) |
| `hooks/use-toast.js` | Hook de toast notifications |

## Como usar em outro projeto

### 1. Copiar a pasta

Copie toda a pasta `packages/ui/` para o seu projeto.

### 2. Instalar dependências

```bash
cd packages/ui
npm install
```

Ou, se preferir copiar manualmente no `package.json` do seu projeto, as dependências principais são:

- `@radix-ui/*` (vários pacotes)
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `tailwindcss-animate`, `lucide-react`, `next-themes`
- `tailwindcss`, `postcss`, `autoprefixer` (devDependencies)

### 3. Importar o CSS

No seu arquivo de entrada (ex: `main.jsx` ou `App.jsx`):

```js
import "./packages/ui/index.css";
// ou ajuste o path conforme a localização
```

### 4. Configurar o Tailwind

No `tailwind.config.js` do seu projeto, estenda ou importe a configuração:

```js
// Opção A: Usar diretamente
import uiConfig from "./packages/ui/tailwind.config.js";
export default uiConfig;

// Opção B: Estender
import uiConfig from "./packages/ui/tailwind.config.js";
export default {
  ...uiConfig,
  content: [
    ...uiConfig.content,
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
};
```

### 5. Importar componentes

```jsx
import { Button, Card, CardHeader, CardTitle, CardContent } from "./packages/ui/components";
import { cn } from "./packages/ui/lib/utils";
import { COLOR_ORANGE_PRIMARY, getShadow } from "./packages/ui/lib/colors";
```

### 6. Configurar path alias (opcional)

Para usar `@ui/` como alias, adicione ao `vite.config.js`:

```js
resolve: {
  alias: {
    "@ui": path.resolve(__dirname, "./packages/ui"),
  },
},
```

E no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@ui/*": ["./packages/ui/*"]
    }
  }
}
```

Depois importe assim:

```jsx
import { Button } from "@ui/components";
import { cn } from "@ui/lib/utils";
```

## Fontes

O design system usa as fontes **Inter** (corpo) e **Poppins** (títulos). Adicione no `<head>` do seu HTML:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap" rel="stylesheet">
```

## Dark Mode

O tema escuro é ativado pela classe CSS `dark` no elemento `<html>`. Use o pacote `next-themes` para alternar:

```jsx
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>
```

## Cores principais

| Token | Cor | Uso |
|---|---|---|
| `--primary` / `--accent` | `#ff9e2b` (Orange) | Cor principal, destaques |
| `--custom-blue` | `#1982d8` | Botões de controle, links |
| `--title-blue` | `#001dc6` | Títulos principais |
| `--background` | Light: `#F9FAFB` / Dark: `#050505` | Fundo da página |
| `--card` | Light: `#FFFFFF` / Dark: `#141414` | Fundo dos cards |

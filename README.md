# AI2C Results - Dashboard de Resultados de Pesquisa

Aplicação web para visualização e análise de resultados de pesquisas de satisfação do cliente. O dashboard apresenta relatórios executivos, análises detalhadas, nuvens de palavras, planos de implementação e muito mais.

## 📋 Sobre o Projeto

Este projeto é um dashboard interativo desenvolvido para exibir e analisar resultados de pesquisas de satisfação. A aplicação oferece:

- **Relatório Executivo**: Resumo executivo com principais descobertas e conclusões
- **Análise de Atributos**: Deep dive em atributos específicos da pesquisa
- **Nuvem de Palavras**: Visualização de termos mais mencionados
- **Análise de Suporte**: Métricas e insights sobre suporte ao cliente
- **Plano de Implementação**: Recomendações e ações prioritárias
- **Detalhes de Respostas**: Visualização detalhada das respostas coletadas

## 🏗️ Estrutura do Projeto

```
ai2c_results/
├── src/
│   ├── components/
│   │   ├── survey/          # Componentes específicos da pesquisa
│   │   │   ├── AttributeDeepDive.tsx
│   │   │   ├── ContentRenderer.tsx
│   │   │   ├── ExecutiveReport.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── ImplementationPlan.tsx
│   │   │   ├── ResponseDetails.tsx
│   │   │   ├── SupportAnalysis.tsx
│   │   │   ├── SurveyHeader.tsx
│   │   │   ├── SurveyLayout.tsx
│   │   │   ├── SurveySidebar.tsx
│   │   │   └── WordCloud.tsx
│   │   ├── ui/              # Componentes UI do shadcn/ui
│   │   └── NavLink.tsx
│   ├── data/
│   │   └── surveyData.ts    # Dados da pesquisa (mock data)
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utilitários
│   ├── pages/               # Páginas da aplicação
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globais
├── public/                  # Arquivos estáticos
├── dist/                    # Build de produção (gerado)
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## 🛠️ Tecnologias Utilizadas

- **Vite** - Build tool e dev server
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **React Router** - Roteamento
- **shadcn/ui** - Componentes UI baseados em Radix UI
- **Tailwind CSS** - Framework CSS utilitário
- **Recharts** - Biblioteca de gráficos
- **TanStack Query** - Gerenciamento de estado do servidor
- **Lucide React** - Ícones

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js (versão 18 ou superior) - [Instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório** (se aplicável):

```bash
git clone <URL_DO_REPOSITORIO>
cd ai2c_results
```

2. **Instale as dependências**:

```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**:

```bash
npm run dev
```

4. **Acesse a aplicação**:
   - Abra seu navegador em `http://localhost:8080`
   - O servidor recarrega automaticamente quando você faz alterações

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento na porta 8080
- `npm run build` - Cria o build de produção na pasta `dist/`
- `npm run build:dev` - Cria o build em modo desenvolvimento
- `npm run preview` - Visualiza o build de produção localmente
- `npm run lint` - Executa o linter ESLint

## 📦 Como Fazer o Build

Para criar uma versão otimizada para produção:

```bash
npm run build
```

O build será gerado na pasta `dist/`, contendo todos os arquivos estáticos otimizados e prontos para deploy.

Para testar o build localmente antes de fazer deploy:

```bash
npm run build
npm run preview
```

## 🌐 Como Colocar no Ar (Deploy)

### Opção 1: Deploy Estático (Recomendado)

A aplicação é uma SPA (Single Page Application) e pode ser hospedada em qualquer serviço de hospedagem estática:

#### **Vercel** (Recomendado - Gratuito)

1. Instale a CLI da Vercel:

```bash
npm i -g vercel
```

2. Faça login:

```bash
vercel login
```

3. Deploy:

```bash
npm run build
vercel --prod
```

Ou conecte seu repositório GitHub no [Vercel Dashboard](https://vercel.com) para deploy automático.

#### **Netlify** (Gratuito)

1. Instale a CLI do Netlify:

```bash
npm i -g netlify-cli
```

2. Faça login:

```bash
netlify login
```

3. Deploy:

```bash
npm run build
netlify deploy --prod --dir=dist
```

Ou arraste a pasta `dist` para o [Netlify Drop](https://app.netlify.com/drop).

#### **GitHub Pages**

1. Adicione o plugin do GitHub Pages no `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/ai2c_results/", // Nome do seu repositório
  // ... resto da configuração
});
```

2. Crie um script no `package.json`:

```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

3. Instale `gh-pages`:

```bash
npm install --save-dev gh-pages
```

4. Deploy:

```bash
npm run deploy
```

#### **AWS S3 + CloudFront**

1. Faça o build:

```bash
npm run build
```

2. Faça upload da pasta `dist` para um bucket S3
3. Configure o bucket para hospedagem de site estático
4. (Opcional) Configure CloudFront para CDN

#### **Outros Serviços**

A pasta `dist` pode ser hospedada em qualquer serviço que suporte sites estáticos:

- **Firebase Hosting**
- **Azure Static Web Apps**
- **Cloudflare Pages**
- **Surge.sh**
- **Render**

### Opção 2: Servidor Node.js

Se preferir usar um servidor Node.js:

1. Instale `serve`:

```bash
npm install -g serve
```

2. Faça o build:

```bash
npm run build
```

3. Inicie o servidor:

```bash
serve -s dist -l 3000
```

### Configuração Importante para SPAs

Como esta é uma SPA usando React Router, certifique-se de que o servidor está configurado para redirecionar todas as rotas para `index.html`. A maioria dos serviços de hospedagem estática faz isso automaticamente.

## 📝 Personalização

### Alterar Dados da Pesquisa

Os dados da pesquisa estão em `src/data/surveyData.ts`. Edite este arquivo para personalizar os dados exibidos no dashboard.

### Personalizar Estilos

- Estilos globais: `src/index.css`
- Configuração do Tailwind: `tailwind.config.ts`
- Componentes UI: `src/components/ui/`

## 🔧 Desenvolvimento

### Estrutura de Componentes

- **SurveyLayout**: Layout principal com sidebar e header
- **ContentRenderer**: Renderiza o conteúdo baseado na seção ativa
- **ExecutiveReport**: Exibe o relatório executivo
- **SurveySidebar**: Navegação lateral entre seções

### Adicionar Novas Seções

1. Crie o componente da nova seção em `src/components/survey/`
2. Adicione a seção no `ContentRenderer.tsx`
3. Adicione o item de navegação no `SurveySidebar.tsx`
4. Atualize os dados em `surveyData.ts` se necessário

## 📄 Licença

Este projeto é privado.

## 🤝 Contribuindo

Para contribuir com o projeto, faça um fork, crie uma branch para sua feature e abra um pull request.

---

**Desenvolvido com ❤️ usando React, TypeScript e Vite**

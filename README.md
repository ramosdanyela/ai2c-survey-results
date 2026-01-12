# 📊 AI2C Results - Survey Dashboard

Sistema de visualização de resultados de pesquisa **100% genérico** e baseado em JSON programático. Todas as seções, subseções e componentes são renderizados dinamicamente através de schemas definidos no JSON.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

> ⚠️ **IMPORTANTE**: Para fazer testes e experimentações, **sempre crie uma nova branch** e não commite diretamente na branch `main`. Use `git checkout -b nome-da-branch` antes de fazer alterações.

## ✨ Características Principais

- 🎯 **100% Genérico** - Sistema totalmente baseado em JSON, sem código hardcoded
- 🔄 **Renderização Dinâmica** - Seções e subseções renderizadas automaticamente
- 📊 **Componentes Ricos** - Suporte a cards, charts, tables, accordions, filtros, etc.
- 🎨 **Temas** - Suporte a tema claro/escuro com transição suave
- 📱 **Responsivo** - Interface adaptável para desktop, tablet e mobile
- 🔍 **Filtros Avançados** - Sistema de filtros por atributos (estado, tipo de cliente, etc.)
- 📈 **Visualizações** - Gráficos interativos com Recharts
- 🎭 **UI Moderna** - Baseado em shadcn/ui e Radix UI

## 🏗️ Arquitetura

O sistema utiliza uma arquitetura baseada em **schemas JSON** que define completamente a estrutura e renderização das seções:

1. **JSON Define Tudo** - O arquivo `surveyData.json` contém toda a estrutura
2. **GenericSectionRenderer** - Componente principal que processa os schemas
3. **Componentes Genéricos** - Widgets reutilizáveis (cards, charts, tables, etc.)
4. **Resolução Dinâmica** - Dados e estilos resolvidos em tempo de execução

### Fluxo de Renderização

```
JSON (surveyData.json)
  ↓
sectionsConfig.sections[].data.renderSchema
  ↓
GenericSectionRenderer
  ↓
SchemaComponent (processa cada tipo)
  ↓
Componentes Finais (Card, Chart, Table, etc.)
```

## 📁 Estrutura do Projeto

```
src/
├── components/
│   └── survey/
│       ├── common/              # Componentes genéricos
│       │   ├── GenericCard.jsx
│       │   ├── GenericSectionRenderer.jsx  # ⭐ Core do sistema
│       │   ├── GenericSubsection.jsx
│       │   └── QuestionsList.jsx
│       ├── components/          # Componentes de layout
│       │   ├── ContentRenderer.jsx
│       │   ├── SurveyLayout.jsx
│       │   ├── SurveySidebar.jsx
│       │   └── SurveyHeader.jsx
│       └── widgets/             # Widgets reutilizáveis
│           ├── Charts.jsx       # Gráficos (Bar, Stacked, NPS, etc.)
│           ├── Tables.jsx       # Tabelas (Distribution, Sentiment, etc.)
│           ├── WordCloud.jsx
│           └── badgeTypes.jsx
├── data/
│   ├── surveyData.json          # ⭐ Dados e schemas da pesquisa
│   └── surveyData.js            # Fallback (legacy)
├── services/
│   ├── dataResolver.js          # Resolve paths de dados
│   ├── styleResolver.js         # Resolve estilos e variantes
│   └── surveyDataService.js     # Serviço de dados
├── hooks/
│   ├── useSurveyData.js         # Hook principal para dados
│   └── useSectionData.js
└── pages/
    └── Index.jsx                # Página principal
```

## 🛠️ Tecnologias

- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Radix UI** - Primitivos acessíveis
- **Recharts** - Gráficos e visualizações
- **React Query** - Gerenciamento de estado e cache de dados
- **React Router** - Roteamento
- **Lucide React** - Ícones

## 📚 Documentação

Toda a documentação está na pasta [`docs/`](./docs/):

### Documentação Principal

- **[Doc_how-to_json.md](./docs/Doc_how-to_json.md)** - 📖 Documentação completa da estrutura do JSON, componentes disponíveis, templates, condições e exemplos detalhados
- **[Doc_how-to_json_short.md](./docs/Doc_how-to_json_short.md)** - ⚡ Guia rápido de referência para criar seções, subseções e componentes

### Integração e APIs

- **[Replace_mock_to_api.md](./docs/Replace_mock_to_api.md)** - 🔌 Guia completo de integração com API real: substituir dados mockados por chamadas HTTP, configuração de variáveis de ambiente, autenticação e tratamento de erros

### Estratégias Avançadas

- **[PLUS_FILTER_BACKEND_STRATEGY.md](./docs/PLUS_FILTER_BACKEND_STRATEGY.md)** - 📊 Estratégia de implementação de filtros ativos com backend: arquitetura, estrutura de dados, endpoints e hooks para filtros dinâmicos

### Documentação Rápida

#### Criar uma Nova Seção

1. Adicione a seção em `sectionsConfig.sections` no JSON
2. Defina `hasSchema: true`
3. Crie o `renderSchema` com componentes
4. A seção será renderizada automaticamente!

Exemplo mínimo:

```json
{
  "sectionsConfig": {
    "sections": [
      {
        "id": "minha-secao",
        "index": 0,
        "name": "Minha Seção",
        "icon": "FileText",
        "hasSchema": true,
        "data": {
          "renderSchema": {
            "components": [
              {
                "type": "card",
                "index": 0,
                "title": "Título",
                "content": "Conteúdo",
                "styleVariant": "default"
              }
            ]
          }
        }
      }
    ]
  }
}
```

## 🎨 Componentes Disponíveis

### Tipos de Componentes Suportados

- **Cards** - `type: "card"` - Cards com título e conteúdo
- **Gráficos** - `type: "barChart"`, `type: "sentimentStackedChart"`, etc.
- **Tabelas** - `type: "distributionTable"`, `type: "sentimentTable"`, etc.
- **Listas** - `type: "questionsList"` - Lista de questões com filtros
- **Accordions** - `type: "accordion"` - Acordeões expansíveis
- **Filtros** - `type: "filterPills"` - Pills de filtro
- **Word Cloud** - `type: "wordCloud"` - Nuvem de palavras

Veja a [documentação completa](./docs/Doc_how-to_json.md) para todos os tipos e detalhes de configuração.

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build           # Build para produção
npm run build:dev       # Build em modo desenvolvimento
npm run preview         # Preview do build

# Análise
npm run lint            # Executa ESLint
npm run analyze:unused  # Analisa código não utilizado
npm run analyze:deps    # Analisa dependências
npm run analyze:all   # Executa todas as análises
```

## 🔧 Configuração

### Variáveis de Ambiente

O projeto suporta variáveis de ambiente para configuração:

#### Modo de Desenvolvimento (Mock)

- `VITE_API_DELAY` - Delay simulado para chamadas de API (padrão: 800ms)
- `VITE_USE_MOCK_DATA` - Usar dados mockados localmente (padrão: `true` em desenvolvimento)

#### Integração com API Real

- `VITE_API_URL` - URL base da API (ex: `https://api.exemplo.com/v1`)
- `VITE_SURVEY_DATA_ENDPOINT` - Endpoint para dados da pesquisa (padrão: `/survey/data`)
- `VITE_API_TOKEN` - Token de autenticação Bearer (opcional)
- `VITE_API_TIMEOUT` - Timeout para requisições em ms (padrão: 30000)

**📖 Veja o guia completo:** [Replace_mock_to_api.md](./docs/Replace_mock_to_api.md)

### Personalização

- **Temas**: Configurados em `src/contexts/ThemeContext.jsx`
- **Cores**: Definidas em `src/lib/colors.js`
- **Estilos**: Variantes em `src/styles/variants.js`

## 🎯 Conceitos Principais

### Sistema Genérico

O sistema foi projetado para ser **100% programático**. Isso significa:

- ✅ Nenhuma seção é hardcoded
- ✅ Tudo é definido no JSON
- ✅ Fácil adicionar novas seções sem código
- ✅ Fácil modificar estrutura existente
- ✅ "Prova de fogo" - se o JSON está correto, tudo funciona

### Render Schema

Cada seção com `hasSchema: true` deve ter um `renderSchema` que define:

- **Subseções** (opcional) - Se a seção tem subseções
- **Componentes** - Array de componentes a renderizar
- **Configurações** - Configurações específicas de cada componente

### Integração com API

O sistema suporta dois modos de operação:

1. **Modo Mock (Desenvolvimento)** - Carrega dados do `surveyData.json` local
2. **Modo API (Produção)** - Faz chamadas HTTP para API real usando React Query

O hook `useSurveyData()` gerencia automaticamente o carregamento, cache e estados de loading/error. Veja [Replace_mock_to_api.md](./docs/Replace_mock_to_api.md) para migrar para API real.

## 🤝 Contribuindo

> ⚠️ **REGRAS DE DESENVOLVIMENTO**
>
> - **SEMPRE crie uma nova branch** para testes, experimentações e desenvolvimento
> - **NUNCA commite diretamente na branch `main`**
> - Use `git checkout -b nome-da-branch` antes de fazer alterações
> - Faça merge via Pull Request após revisão e testes

### Diretrizes

1. Mantenha o sistema genérico - evite código hardcoded
2. Documente novas funcionalidades
3. Siga os padrões existentes de estrutura JSON
4. Teste com diferentes estruturas de dados
5. Use branches separadas para cada feature ou teste

## 📝 Notas

- O sistema prioriza o JSON (`surveyData.json`) sobre código hardcoded
- Componentes legacy existem mas não são mais usados no fluxo principal
- O `GenericSectionRenderer` é o coração do sistema
- O sistema usa **React Query** para gerenciamento de dados e cache
- Suporte completo para integração com API real (veja documentação em `docs/`)

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ usando React, Vite e Tailwind CSS**

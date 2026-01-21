# Estratégia para JSON de Teste de Estresse

## Objetivo
Criar um JSON completo (`surveyData-stress-test.json`) que teste diferentes aspectos do sistema de renderização, com dados e estruturas variadas.

## Tema Escolhido
**Pesquisa de Satisfação de Funcionários / Employee Satisfaction Survey**
- Empresa: "InnovaTech Solutions"
- Período: Janeiro - Março 2025
- Total de respondentes: 850 funcionários
- NPS: 35 (Bom)

## Estrutura das 6 Seções

### Seção 1: Relatório Executivo (Executive Report)
**Objetivo:** Testar estrutura básica com cards e tabelas
- **Subseção 1.1:** Sumário Executivo
  - Cards com diferentes `styleVariant` (default, highlight, border-left)
  - Templates complexos
- **Subseção 1.2:** Recomendações
  - Tabela de recomendações com tarefas
  - Diferentes severidades (critical, high, medium, low)

### Seção 2: Análise de Engajamento (Engagement Analysis)
**Objetivo:** Testar gráficos de sentimento e segmentação
- **Subseção 2.1:** Sentimento Geral
  - SentimentDivergentChart
  - Cards com descrições
- **Subseção 2.2:** Segmentação por Departamento
  - SegmentationTable
  - Dados com clusters diferentes
- **Subseção 2.3:** Intenção de Permanência
  - BarChart com diferentes configurações
  - Dados de intenção de saída

### Seção 3: Análise por Atributos (Attribute Analysis)
**Objetivo:** Testar estrutura dinâmica com atributos
- **Subseção 3.1:** Por Departamento (template dinâmico)
  - DistributionTable
  - SentimentStackedChart
  - NPS tables e charts
  - SatisfactionImpact com sentimentThreeColorChart
  - PositiveCategoriesTable e NegativeCategoriesTable
- **Subseção 3.2:** Por Tempo de Empresa
  - Mesma estrutura, dados diferentes
- **Subseção 3.3:** Por Cargo
  - Estrutura completa com todas as tabelas

### Seção 4: Análise por Questão (Question Analysis)
**Objetivo:** Testar lista de questões com diferentes tipos
- **Estrutura:** hasSubsections: false
- **Componentes:**
  - FilterPills com wordCloudToggle
  - QuestionsList
- **Questões:**
  - 1 questão NPS (com npsScoreCard e npsStackedChart)
  - 2 questões fechadas (closed) com barChart
  - 3 questões abertas (open) com:
    - sentimentStackedChart
    - topCategoriesCards
    - wordCloud (só dados nativos; imagens não usadas)
### Seção 5: Análise de Cultura Organizacional (Culture Analysis)
**Objetivo:** Testar combinações complexas de componentes
- **Subseção 5.1:** Valores Organizacionais
  - Cards aninhados
  - Wrappers com diferentes props
  - Gráficos empilhados
- **Subseção 5.2:** Comunicação Interna
  - SentimentDivergentChart
  - Tabelas customizadas
  - Condições complexas
- **Subseção 5.3:** Desenvolvimento Profissional
  - Múltiplos gráficos em grid
  - Cards com contentStyleVariant variados

### Seção 6: Export (Route)
**Objetivo:** Testar item Export (página do app, sempre disponível)
- Export não está em sections; textos em uiTexts.export; app injeta o item no menu
- Navegação para /export definida no app

## Componentes a Testar

### Gráficos
- ✅ barChart (múltiplas configurações)
- ✅ sentimentDivergentChart
- ✅ sentimentStackedChart
- ✅ sentimentThreeColorChart
- ✅ npsStackedChart
- ✅ npsScoreCard

### Tabelas
- ✅ recommendationsTable
- ✅ segmentationTable
- ✅ distributionTable
- ✅ sentimentTable
- ✅ npsDistributionTable
- ✅ npsTable
- ✅ sentimentImpactTable
- ✅ positiveCategoriesTable
- ✅ negativeCategoriesTable

### Outros
- ✅ card (todos os styleVariants)
- ✅ wrapper (diferentes tags e props)
- ✅ questionsList
- ✅ filterPills
- ✅ wordCloud
- ✅ topCategoriesCards

## Casos de Teste Específicos

### 1. Templates Complexos
- Templates aninhados: `{{uiTexts.section.subsection.field}}`
- Templates com sectionData: `{{sectionData.nested.deep.value}}`
- Templates com currentAttribute: `{{currentAttribute.name}}`
- Templates com question: `{{question.summary}}`

### 2. Condições
- Condições simples: `"condition": "question.type === 'nps'"`
- Condições complexas: `"condition": "currentAttribute.npsSummary && showDetails"`
- Condições com valores truthy/falsy

### 3. Estruturas de Dados
- Arrays vazios (edge case)
- Dados com valores null
- Dados com porcentagens que somam > 100% (edge case)
- Dados com valores muito grandes/pequenos

### 4. Configurações
- Diferentes presets de gráficos
- Configurações de ordenação (asc/desc)
- (hiddenIds e excludedFromChartIds foram removidos)

### 5. Wrappers
- Wrappers com className
- Wrappers com props customizadas
- Wrappers aninhados
- Wrappers com conteúdo de texto

## Dados Realistas

### Departamentos
- Engenharia (35%)
- Vendas (25%)
- Marketing (15%)
- RH (10%)
- Operações (10%)
- Outros (5%)

### Tempo de Empresa
- Menos de 1 ano (20%)
- 1-3 anos (35%)
- 3-5 anos (25%)
- Mais de 5 anos (20%)

### Cargos
- Estagiário/Júnior (30%)
- Pleno (40%)
- Sênior (20%)
- Liderança (10%)

## Textos (uiTexts)

### Estrutura
- Textos globais em `uiTexts` raiz
- Textos específicos em `data.uiTexts` de cada seção
- Precedência: seção > global

### Categorias de Textos
- Títulos e labels
- Mensagens de erro
- Labels de filtros
- Tooltips
- Severity labels
- NPS labels

## Validações a Testar

1. ✅ JSON válido
2. ✅ Todas as seções têm schema válido
3. ✅ Todos os dataPaths resolvem corretamente
4. ✅ Todos os templates são válidos
5. ✅ Todas as condições são válidas
6. ✅ Ícones existem no Lucide
7. ✅ Estruturas de dados correspondem aos componentes

## Estrutura Final do Arquivo

```json
{
  "metadata": { ... },
  "sectionsConfig": {
    "sections": [
      { "id": "executive", ... },
      { "id": "engagement", ... },
      { "id": "attributes", ... },
      { "id": "questions", ... },
      { "id": "culture", ... },
      { "id": "export", ... }
    ],
    "components": { ... }
  },
  "uiTexts": { ... },
  "surveyInfo": { ... }
}
```

## Próximos Passos

1. Criar o JSON completo seguindo esta estratégia
2. Validar contra o schema
3. Testar renderização no sistema
4. Documentar casos edge encontrados



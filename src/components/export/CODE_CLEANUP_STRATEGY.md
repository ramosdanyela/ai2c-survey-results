# 🧹 Estratégia de Limpeza de Código

Este documento descreve a estratégia completa para identificar e remover código redundante, não utilizado e condições desnecessárias no repositório.

## 📋 Visão Geral

A estratégia consiste em 4 análises principais que identificam diferentes tipos de problemas:

1. **Código não utilizado** - Funções, componentes, hooks e arquivos não importados
2. **Código duplicado** - Componentes e arquivos com mesmo nome ou conteúdo similar
3. **Condições if com modelos JSON** - Verificações de tipo/modelo que podem ser simplificadas
4. **Imports não utilizados** - Imports que não são usados ou apontam para arquivos inexistentes

## 🚀 Como Usar

### Executar todas as análises

```bash
npm run analyze:all
```

Este comando executa todas as análises e gera um relatório consolidado em `reports/consolidated-analysis-report.json`.

### Executar análises individuais

```bash
# Código não utilizado
npm run analyze:unused

# Código duplicado
npm run analyze:duplicates

# Condições if com JSON
npm run analyze:json-conditions

# Imports não utilizados
npm run analyze:unused-imports

# Campos não utilizados no JSON (já existente)
npm run analyze:unused-fields
```

## 📊 Scripts de Análise

### 1. `analyze-unused-code.js`

**O que identifica:**
- Componentes exportados mas nunca importados
- Hooks não utilizados
- Funções utilitárias não utilizadas
- Arquivos que não são importados em nenhum lugar

**Relatório:** `reports/unused-code-report.json`

**Exemplo de saída:**
```
📦 Componentes não utilizados (5):
  src/components/widgets/OldComponent.jsx → OldComponent
  src/utils/legacyHelper.js → legacyFunction
```

### 2. `analyze-duplicates.js`

**O que identifica:**
- Componentes com mesmo nome em locais diferentes
- Arquivos com conteúdo idêntico
- Arquivos com conteúdo muito similar (>80%)

**Relatório:** `reports/duplicates-report.json`

**Exemplo de saída:**
```
📦 Componentes com mesmo nome (2 grupos):
  Heatmap (2 ocorrências):
    - src/components/widgets/Heatmap.jsx
    - src/components/widgets/charts/Heatmap.jsx
```

### 3. `analyze-json-conditions.js`

**O que identifica:**
- Condições `if` que verificam `component.type === '...'`
- Switch/case com tipos de componentes JSON
- Verificações de estrutura JSON (renderSchema, subsections, etc.)

**Relatório:** `reports/json-conditions-report.json`

**Exemplo de saída:**
```
📋 Valores mais verificados:
  barChart: 15 ocorrências
  lineChart: 12 ocorrências
  card: 10 ocorrências
```

### 4. `analyze-unused-imports.js`

**O que identifica:**
- Imports nomeados que não são usados no arquivo
- Imports default não utilizados
- Imports de arquivos que não existem

**Relatório:** `reports/unused-imports-report.json`

**Exemplo de saída:**
```
📦 Imports não utilizados:
  src/components/Survey.jsx:
    Linha 5: OldComponent de './OldComponent'
```

## 📁 Estrutura de Relatórios

Todos os relatórios são salvos em `reports/`:

```
reports/
├── unused-code-report.json          # Código não utilizado
├── duplicates-report.json            # Código duplicado
├── json-conditions-report.json       # Condições if com JSON
├── unused-imports-report.json        # Imports não utilizados
├── unused-fields-report.json         # Campos JSON não utilizados (existente)
└── consolidated-analysis-report.json # Relatório consolidado
```

## 🎯 Processo de Limpeza Recomendado

### Fase 1: Análise (Executar todos os scripts)

```bash
npm run analyze:all
```

### Fase 2: Revisão dos Relatórios

1. Abrir `reports/consolidated-analysis-report.json`
2. Revisar recomendações por prioridade:
   - **Alta prioridade**: Código duplicado, arquivos idênticos
   - **Média prioridade**: Componentes não utilizados, muitas condições if
   - **Baixa prioridade**: Imports não utilizados

### Fase 3: Ação

#### Alta Prioridade

1. **Arquivos duplicados idênticos**
   - Verificar qual versão está sendo usada
   - Remover a versão não utilizada
   - Atualizar imports se necessário

2. **Componentes duplicados**
   - Comparar implementações
   - Consolidar em uma única versão
   - Atualizar todos os imports

#### Média Prioridade

1. **Componentes não utilizados**
   - Verificar se são realmente não utilizados (pode haver uso dinâmico)
   - Se confirmado, remover o componente
   - Verificar dependências antes de remover

2. **Muitas condições if com JSON**
   - Verificar se `ComponentRegistry` está sendo usado
   - Considerar migrar condições if para o registry
   - Simplificar lógica de renderização

#### Baixa Prioridade

1. **Imports não utilizados**
   - Remover imports não utilizados
   - Corrigir imports de arquivos inexistentes
   - Melhorar legibilidade do código

## ⚠️ Cuidados Importantes

### Código não utilizado pode ser usado dinamicamente

Alguns componentes podem ser usados dinamicamente através de:
- Strings de nome de componente
- Registry patterns
- Lazy loading
- Templates JSON

**Solução:** Verificar manualmente antes de remover.

### Condições if podem ser necessárias

Algumas condições if podem ser necessárias para:
- Backward compatibility
- Validação de dados
- Fallbacks

**Solução:** Revisar contexto antes de simplificar.

### Arquivos duplicados podem ter diferenças sutis

Arquivos que parecem idênticos podem ter:
- Diferenças em comentários
- Diferenças em imports
- Histórico diferente

**Solução:** Comparar cuidadosamente antes de remover.

## 🔍 Exemplos de Problemas Encontrados

### Exemplo 1: Componentes Duplicados

**Problema:**
```
src/components/widgets/Heatmap.jsx
src/components/widgets/charts/Heatmap.jsx
```

**Solução:**
- Verificar qual está sendo usado: `grep -r "from.*widgets/Heatmap" src/`
- Se apenas `charts/Heatmap` é usado, remover `widgets/Heatmap.jsx`
- Se ambos são usados, consolidar em uma única versão

### Exemplo 2: Condições if Excessivas

**Problema:**
```javascript
if (component.type === 'barChart') {
  return <BarChart ... />;
} else if (component.type === 'lineChart') {
  return <LineChart ... />;
} else if (component.type === 'pieChart') {
  return <PieChart ... />;
}
// ... 20+ condições
```

**Solução:**
- Usar `ComponentRegistry` (já existe no projeto)
- Mover lógica para o registry
- Simplificar renderização

### Exemplo 3: Imports Não Utilizados

**Problema:**
```javascript
import { OldComponent } from './OldComponent'; // Não usado
import { NewComponent } from './NewComponent';
```

**Solução:**
- Remover import não utilizado
- Verificar se `OldComponent` ainda é necessário

## 📈 Métricas e Acompanhamento

Após executar as análises, você terá:

- **Total de arquivos analisados**
- **Componentes não utilizados**
- **Arquivos duplicados**
- **Condições if com JSON**
- **Imports não utilizados**

Use essas métricas para:
- Estabelecer metas de limpeza
- Acompanhar progresso ao longo do tempo
- Priorizar refatorações

## 🛠️ Manutenção Contínua

Recomenda-se executar as análises:

- **Antes de releases importantes**
- **Após grandes refatorações**
- **Mensalmente** para manter o código limpo
- **Antes de adicionar novos componentes** (verificar se já existe algo similar)

## 📝 Notas

- Os scripts são **não-destrutivos** - apenas analisam, não modificam código
- Sempre **revisar manualmente** antes de remover código
- **Fazer backup** ou commit antes de grandes limpezas
- **Testar** após remover código para garantir que nada quebrou

## 🤝 Contribuindo

Se encontrar problemas ou melhorias nos scripts:

1. Verificar se o problema já foi reportado
2. Criar issue descrevendo o problema
3. Propor melhorias nos scripts de análise

---

**Última atualização:** Janeiro 2026

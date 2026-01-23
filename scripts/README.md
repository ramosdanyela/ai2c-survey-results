# 📊 Scripts de Análise de Código

Este diretório contém scripts para análise e limpeza de código do repositório.

## 🚀 Uso Rápido

Execute todas as análises de uma vez:

```bash
npm run analyze:all
```

## 📋 Scripts Disponíveis

### 1. `analyze-unused-code.js`
Identifica código não utilizado:
- Componentes não importados
- Hooks não utilizados
- Funções não utilizadas
- Arquivos não importados

**Comando:** `npm run analyze:unused`

### 2. `analyze-duplicates.js`
Identifica código duplicado:
- Componentes com mesmo nome
- Arquivos idênticos
- Arquivos similares (>80%)

**Comando:** `npm run analyze:duplicates`

### 3. `analyze-json-conditions.js`
Identifica condições if com modelos JSON:
- Verificações de `component.type`
- Switch/case com tipos JSON
- Verificações de estrutura JSON

**Comando:** `npm run analyze:json-conditions`

### 4. `analyze-unused-imports.js`
Identifica imports não utilizados:
- Imports nomeados não usados
- Imports default não usados
- Imports de arquivos inexistentes

**Comando:** `npm run analyze:unused-imports`

### 5. `analyze-all.js`
Script master que executa todos os scripts acima e gera um relatório consolidado.

**Comando:** `npm run analyze:all`

## 📁 Relatórios

Todos os relatórios são salvos em `reports/`:

- `unused-code-report.json` - Código não utilizado
- `duplicates-report.json` - Código duplicado
- `json-conditions-report.json` - Condições if com JSON
- `unused-imports-report.json` - Imports não utilizados
- `consolidated-analysis-report.json` - Relatório consolidado

## 📖 Documentação Completa

Veja `docs/CODE_CLEANUP_STRATEGY.md` para documentação completa da estratégia.

## ⚠️ Notas

- Os scripts são **não-destrutivos** - apenas analisam, não modificam código
- Sempre **revisar manualmente** antes de remover código
- **Fazer backup** ou commit antes de grandes limpezas

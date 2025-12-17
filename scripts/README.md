# Scripts de Análise de Código

Este diretório contém scripts para análise e limpeza de código.

## 📋 Scripts Disponíveis

### 1. `analyze-unused-code.js`

Analisa o código para identificar componentes, funções e arquivos não utilizados.

**Uso:**

```bash
npm run analyze:unused
```

**O que faz:**

- Mapeia todos os arquivos `.js`, `.jsx`, `.ts`, `.tsx` em `src/`
- Analisa imports e exports
- Rastreia referências entre arquivos
- Identifica exports não utilizados
- Identifica arquivos nunca importados
- Gera relatórios em JSON e HTML

**Saída:**

- `reports/unused-code-analysis.json` - Dados estruturados
- `reports/unused-code-report.html` - Relatório visual interativo

### 2. `check-duplicate-files.js`

Identifica arquivos duplicados ou com nomes suspeitos (copy, backup, etc).

**Uso:**

```bash
node scripts/check-duplicate-files.js
```

**O que faz:**

- Encontra arquivos com nomes similares
- Identifica arquivos com "copy", "backup", "old", "temp" no nome
- Compara tamanhos de arquivos duplicados

**Saída:**

- `reports/duplicate-files.json` - Lista de arquivos duplicados

## 🚀 Execução Rápida

### Análise Completa

```bash
npm run analyze:all
```

Isso executa:

1. Análise de código não utilizado
2. Análise de dependências npm não utilizadas

### Análise Individual

```bash
# Apenas código não utilizado
npm run analyze:unused

# Apenas dependências
npm run analyze:deps

# Arquivos duplicados
node scripts/check-duplicate-files.js
```

## 📊 Interpretando os Resultados

### Relatório HTML

Abra `reports/unused-code-report.html` no navegador para ver:

- Estatísticas gerais
- Lista de arquivos não utilizados
- Lista de exports não utilizados

### Falsos Positivos Comuns

⚠️ **Atenção**: Nem tudo marcado como "não utilizado" deve ser removido:

1. **Componentes de UI Library** - Componentes shadcn podem ser usados no futuro
2. **Imports Dinâmicos** - `import()` não são detectados
3. **Uso via String** - Componentes referenciados por string em rotas
4. **Hooks e Contextos** - Podem ser usados indiretamente
5. **Tipos TypeScript** - Tipos podem aparecer como não utilizados

### Próximos Passos

1. **Revisar Relatório**: Abra o HTML e revise cada item
2. **Validar Manualmente**: Verifique se são realmente não utilizados
3. **Testar**: Execute a aplicação para garantir que nada quebrou
4. **Remover**: Crie um PR com as remoções

## 🔧 Dependências

Os scripts usam:

- `glob` - Para busca de arquivos (já incluído no script)
- `depcheck` - Para análise de dependências (executado via npx)

## 📝 Notas

- Os scripts analisam apenas código estático
- Imports dinâmicos (`import()`) podem não ser detectados
- Arquivos de configuração são ignorados
- Entry points (`main.jsx`, `App.jsx`) são sempre considerados utilizados

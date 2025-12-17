# 🚀 Guia Rápido - Análise de Código Não Utilizado

## Execução em 3 Passos

### 1️⃣ Executar Análise Completa

```bash
npm run analyze:all
```

Isso executa:

- ✅ Análise de código não utilizado
- ✅ Análise de dependências npm
- ✅ Verificação de arquivos duplicados

### 2️⃣ Revisar Relatórios

Abra no navegador:

```
reports/unused-code-report.html
```

### 3️⃣ Validar e Remover

1. **Revisar cada item** no relatório HTML
2. **Verificar falsos positivos** (veja seção abaixo)
3. **Testar aplicação** antes de remover
4. **Criar PR** com remoções

## ⚠️ Falsos Positivos Comuns

### Componentes UI (shadcn)

**Status**: Geralmente são falsos positivos

- Componentes em `components/ui/` podem ser usados no futuro
- **Ação**: Manter se houver planos de uso

### Arquivo Duplicado Encontrado

**Arquivo**: `data/surveyData copy.js`

- **Ação**: Verificar se pode ser removido

### Funções Utilitárias

**Exemplo**: `lib/utils.js::cn`, `lib/colors.js::*`

- Podem ser usadas indiretamente ou no futuro
- **Ação**: Verificar uso manualmente

## 📊 Interpretando Números

### Exemplo de Saída:

```
Total de arquivos: 75
Total de exports: 345
Exports não utilizados: 335
Arquivos não utilizados: 70
```

**O que significa:**

- Muitos exports não utilizados são **componentes UI** (esperado)
- Foque em arquivos não utilizados primeiro
- Revise exports de componentes customizados (`components/survey/`)

## 🎯 Prioridades de Limpeza

### Alta Prioridade ✅

1. Arquivos com "copy" no nome
2. Arquivos nunca importados (exceto UI)
3. Funções em `lib/` não utilizadas

### Média Prioridade ⚠️

1. Componentes customizados não utilizados
2. Hooks não utilizados
3. Contextos não utilizados

### Baixa Prioridade 📦

1. Componentes UI (shadcn)
2. Utilitários que podem ser úteis no futuro

## 📝 Checklist de Validação

Antes de remover qualquer código:

- [ ] Execute `npm run dev` e teste a aplicação
- [ ] Verifique se não há imports dinâmicos (`import()`)
- [ ] Verifique uso em rotas (strings)
- [ ] Verifique se não é usado via refs
- [ ] Verifique se não é usado em testes (se houver)

## 🔗 Links Úteis

- [Estratégia Completa](./ESTRATEGIA_CODIGO_NAO_UTILIZADO.md)
- [Documentação dos Scripts](./scripts/README.md)

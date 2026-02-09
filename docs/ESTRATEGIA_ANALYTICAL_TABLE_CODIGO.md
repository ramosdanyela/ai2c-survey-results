# Estratégia: alterar código do analyticalTable para suportar a estrutura de dados

Este documento descreve as alterações necessárias no código para que o **analyticalTable** use os defaults acordados (ver `SUGESTAO_ANALYTICAL_TABLE_JSON.md`):

- **Ordenação inicial:** `percentage` descendente (no código; não enviar `defaultSort` no JSON).
- **showRanking:** default **false**; no JSON só quando for `true`.
- **sortable:** default **true** em cada coluna; no JSON só quando for `false`.

Nenhuma alteração é feita aqui; apenas a estratégia para implementação.

---

## 1. Arquivos envolvidos

| Arquivo | Papel |
|---------|--------|
| `src/components/survey/widgets/AnalyticalTable.jsx` | Componente de apresentação: recebe `data`, `columns`, `showRanking`, `defaultSort`, `rankingKey` e aplica ordenação/ranking. |
| `src/components/survey/common/TableRenderers.jsx` | `SchemaAnalyticalTable`: resolve dados, monta `columns` a partir de `config.columns` ou `inferAnalyticalColumns`, e passa props para `AnalyticalTable`. Função `inferAnalyticalColumns`: define colunas quando `config.columns` não vem. |

---

## 2. Alterações no componente `AnalyticalTable.jsx`

### 2.1 Default de `showRanking`

- **Hoje:** `showRanking = true`.
- **Alvo:** `showRanking = false`.
- **Ação:** Na desestruturação das props, trocar para `showRanking = false`.

### 2.2 Default de `defaultSort`

- **Hoje:** `defaultSort` opcional; se não vier, o estado inicial usa a primeira coluna sortable com `direction: "desc"`.
- **Alvo:** Ordenação inicial sempre por **percentage desc**. Se não existir coluna `percentage`, fallback para a primeira coluna sortable com `desc`.
- **Ação:**
  1. Definir constante ou valor default: `defaultSort = { key: "percentage", direction: "desc" }`.
  2. No `useState` do `sortConfig`: usar esse default quando `defaultSort` não for passado.
  3. Se a coluna `percentage` não existir em `columns`, usar a primeira coluna cujo `sortable` seja true (e direction `desc`), para não quebrar tabelas sem `percentage`.

### 2.3 Comentário JSDoc

- Atualizar o bloco `@param` no topo do arquivo: `showRanking` default `false`, `defaultSort` não enviado no JSON (default no código: percentage desc).

---

## 3. Alterações no `TableRenderers.jsx`

### 3.1 `SchemaAnalyticalTable`: repasse de `showRanking`

- **Hoje:** `showRanking={config.showRanking !== false}` (default true).
- **Alvo:** Só exibir ranking quando o JSON disser explicitamente `showRanking: true`.
- **Ação:** Trocar para `showRanking={config.showRanking === true}`.

### 3.2 `SchemaAnalyticalTable`: repasse de `defaultSort`

- **Hoje:** `defaultSort={config.defaultSort}` (pode ser undefined).
- **Alvo:** Não enviar `defaultSort` no JSON; o componente usa o default do código (percentage desc). Se no futuro for necessário permitir override, aceitar `config.defaultSort` quando existir.
- **Ação:** Não passar `defaultSort` para `AnalyticalTable` (deixar o componente usar seu default). Opcional: se `config.defaultSort` existir, passar `defaultSort={config.defaultSort}` para permitir override explícito no JSON.

### 3.3 `SchemaAnalyticalTable`: repasse de `rankingKey`

- **Hoje:** `rankingKey={config.rankingKey}`.
- **Alvo:** Default no código pode ser `"percentage"` quando existir a coluna; não é obrigatório no JSON.
- **Ação:** Não passar `rankingKey` quando não vier em config (deixar o componente decidir), ou passar `rankingKey={config.rankingKey}` só quando definido. O componente hoje usa `rankingKey` para o valor exibido na coluna Rank; se não vier, pode continuar usando índice (ou percentage se for o defaultSort). Pode deixar como está (opcional no config).

### 3.4 Normalização de `columns` (sortable default true)

- **Hoje:** Se `config.columns` existe, usa como está. Em `inferAnalyticalColumns` já se define `sortable: true` para cada coluna.
- **Alvo:** Para cada coluna vinda do `config.columns`, se `sortable` não estiver definido, tratar como `true`. Se vier `sortable: false` no JSON, respeitar.
- **Ação:** Ao montar `columns` a partir de `config.columns`, normalizar cada item: `sortable: column.sortable !== false` (default true). Exemplo:

```js
const columns =
  config.columns && config.columns.length > 0
    ? config.columns.map((col) => ({
        ...col,
        sortable: col.sortable !== false,
      }))
    : inferAnalyticalColumns(tableData);
```

Assim, omitir `sortable` no JSON resulta em coluna ordenável; só `sortable: false` desativa.

---

## 4. Ordem sugerida de implementação

1. **AnalyticalTable.jsx**
   - Alterar default `showRanking` para `false`.
   - Definir default de ordenação: `{ key: "percentage", direction: "desc" }`, com fallback para primeira coluna sortable quando `percentage` não existir.
   - Atualizar JSDoc.

2. **TableRenderers.jsx**
   - Em `SchemaAnalyticalTable`, alterar `showRanking` para `config.showRanking === true`.
   - Deixar de passar `defaultSort` (ou passar só quando `config.defaultSort` existir).
   - Normalizar `columns` com `sortable: col.sortable !== false` quando vier de `config.columns`.

3. **Testes manuais**
   - Sem config: tabela com dados inferidos, sem coluna Rank, ordenação por percentage (ou primeira coluna).
   - Com `showRanking: true`: coluna Rank visível.
   - Com `config.columns` sem `sortable`: todas ordenáveis.
   - Com `config.columns` com uma coluna `sortable: false`: essa coluna não ordenável.
   - Dados com estrutura “Resposta × Estado” (segment + Paraná, RS, SC): ordenação default por percentage se existir, senão primeira coluna.

---

## 5. Resumo dos defaults após a alteração

| Prop / Comportamento | Default no código | No JSON |
|----------------------|-------------------|---------|
| Ordenação inicial   | `{ key: "percentage", direction: "desc" }` (fallback: primeira coluna sortable, desc) | Não enviar `defaultSort`. Opcional: permitir override com `config.defaultSort`. |
| showRanking         | `false`           | Só enviar `"showRanking": true` se quiser coluna Rank. |
| sortable (por coluna) | `true`         | Só enviar `"sortable": false` na coluna que não deve ordenar. |
| rankingKey          | (opcional) componente pode usar índice ou coluna do defaultSort | Opcional no config. |

Com isso, o código passa a suportar a estrutura de dados e convenções descritas em `SUGESTAO_ANALYTICAL_TABLE_JSON.md` sem exigir `defaultSort`, `showRanking` nem `sortable` no JSON quando os valores forem os defaults.

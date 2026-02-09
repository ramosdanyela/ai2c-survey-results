# Estratégia: distributionChart com StackedBarMECE (estrutura option + series)

## Objetivo

Fazer o **distributionChart** (ex.: estado.questions.pergunta6.distributionChart na linha 2233) ser renderizado pelo **StackedBarMECE** com a estrutura sugerida e aprovada: **option** como chave do eixo Y (rótulo da barra) e **series** no config; dados como array de `{ option, [dataKey1]: number, [dataKey2]: number, ... }`.

## Situação atual

- **Componente no JSON:** `type: "barChart"`, `dataPath: "sectionData.estado.questions.pergunta6.distributionChart"` (e análogos para pergunta3, 4, 5 em estado e servio).
- **Dados:** `distributionChart` é array no formato `{ answer: "1", Paraná: 0, "Rio Grande do Sul": 19.6, "Santa Catarina": 9.6 }` (Resposta × colunas com %).
- **StackedBarMECE hoje:** recebe `categoryKey` (default "category") e `series: [{ dataKey, name, color? }]`; os dados devem ter uma chave por série. Não usa "option".

## Estrutura alvo (aprovada)

- **Config do componente:** `yAxisDataKey: "option"` (igual barChart), `series: [{ dataKey, name, color? }]` (uma entrada por coluna de percentual).
- **Dados:** array de `{ option: string, [dataKey1]: number, [dataKey2]: number, ... }` — ou seja, trocar **answer** por **option** no payload.

---

## Parte 1: Código

### 1.1 StackedBarMECE.jsx

- Aceitar prop **`yAxisDataKey`** (default **`"option"`**) em vez de fixar `categoryKey`.
- Usar `yAxisDataKey` no `<YAxis dataKey={yAxisDataKey} />` e na leitura dos dados (já implícito pois Recharts usa dataKey).
- Manter compatibilidade: se o consumidor passar `categoryKey`, pode ser usado como fallback; senão usar `yAxisDataKey`. Para alinhar à sugestão, **default único** pode ser `yAxisDataKey = "option"` e não receber mais `categoryKey` (ou receber e fazer `const axisKey = yAxisDataKey ?? categoryKey ?? "option"`).

**Decisão:** adicionar `yAxisDataKey = "option"` e usar no YAxis; manter `categoryKey` como alias/fallback opcional para não quebrar quem já usa (ex.: MockMECEPage). Assim: `const axisKey = yAxisDataKey ?? categoryKey ?? "option"` e `<YAxis dataKey={axisKey} />`.

### 1.2 ChartRenderers.jsx (SchemaStackedBarMECE)

- Ler **`config.yAxisDataKey`** (default **`"option"`**) e repassar para StackedBarMECE.
- Manter **`config.categoryKey`** como fallback para compatibilidade; passar como `categoryKey` só se não houver yAxisDataKey, ou sempre passar ambos e deixar o componente decidir.
- Repassar **`config.series`** como hoje.

**Decisão:** passar `yAxisDataKey={config.yAxisDataKey ?? config.categoryKey ?? "option"}` e manter `categoryKey` para fallback no componente.

---

## Parte 2: JSON

### 2.1 Componentes que usam distributionChart

Trocar de **barChart** para **stackedBarMECE** e ajustar config e dados:

- **Onde:** todos os componentes com `type: "barChart"` e `dataPath` terminando em **`.distributionChart`** (estado.questions.pergunta3–6, servio.questions.pergunta3–6, e os de nível subseção estado/servio quando tiverem formato answer+colunas).
- **Alteração no componente:**
  - `type`: `"barChart"` → **`"stackedBarMECE"`**.
  - `dataPath`: manter **`.distributionChart`** (ou, se preferir chave nova, usar `.stackedBarMECE`; aqui mantemos `.distributionChart` e só mudamos o formato dos dados).
  - `config`: adicionar **`yAxisDataKey: "option"`** e **`series`** com um item por coluna de percentual. As chaves em `series[].dataKey` devem ser **exatamente** as chaves dos objetos no array (ex.: "Paran" se no JSON estiver com encoding quebrado, ou "Paraná", "Rio Grande do Sul", "Santa Catarina"). `series[].name` pode ser o label de exibição (ex.: "Paraná (%)").

### 2.2 Dados distributionChart

- Em cada `distributionChart` que hoje tem formato **answer + colunas**:
  - Trocar a chave **`answer`** por **`option`** em cada objeto do array.
  - Manter as demais chaves (nomes dos segmentos/estados) e valores numéricos (percentuais).

Exemplo (estado.questions.pergunta6):

**Antes:**  
`{ "answer": "5", "Paran": 0.0, "Rio Grande do Sul": 53.6, "Santa Catarina": 37.5 }`

**Depois:**  
`{ "option": "5", "Paran": 0.0, "Rio Grande do Sul": 53.6, "Santa Catarina": 37.5 }`

(Se no JSON a chave for "Paraná", usar "Paraná" em `series[].dataKey`; se for "Paran", usar essa mesma string no config.)

### 2.3 Registry

- Garantir que **stackedBarMECE** está registrado no ComponentRegistry (já está). Nenhuma alteração necessária se o tipo já for reconhecido.

---

## Ordem de execução

1. **Código:** alterar StackedBarMECE (yAxisDataKey, fallback categoryKey) e SchemaStackedBarMECE (repassar yAxisDataKey).
2. **JSON:** para cada componente barChart cujo dataPath aponta para `.distributionChart` com dados no formato answer+colunas: (a) mudar type para stackedBarMECE e adicionar config (yAxisDataKey, series); (b) nos dados, renomear answer → option em todos os itens de distributionChart.
3. **Revisão:** conferir um caso (ex.: estado.pergunta6) no navegador.

**Nota (pós-execução):** Os gráficos de nível subseção (`sectionData.estado.distributionChart` e `sectionData.servio.distributionChart`) usam formato `segment` / `count` / `percentage` (uma barra por segmento). Eles foram mantidos como **barChart**; apenas os `distributionChart` dentro de **questions.perguntaX** (formato option + colunas) foram convertidos para **stackedBarMECE**.

---

## Resumo

| Onde | Alteração |
|------|-----------|
| StackedBarMECE.jsx | Prop `yAxisDataKey` (default "option"); usar no YAxis; manter categoryKey como fallback. |
| ChartRenderers SchemaStackedBarMECE | Passar `yAxisDataKey` (e categoryKey se necessário) a partir de config. |
| JSON componentes | barChart → stackedBarMECE onde dataPath é .distributionChart; config com yAxisDataKey e series. |
| JSON dados | Nos arrays distributionChart, renomear chave "answer" → "option". |

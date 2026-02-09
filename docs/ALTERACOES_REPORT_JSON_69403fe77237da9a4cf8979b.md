# Alterações em `69403fe77237da9a4cf8979b_report_json.json`

**Arquivo:** `src/data/tests-06-02/69403fe77237da9a4cf8979b_report_json.json`  
**Diff:** **+638** linhas, **-226** linhas (cerca de +412 linhas líquidas).

---

## 1. Tipo do gráfico: `barChart` → `stackedBarMECE` e dataPath

**Antes (ex.: pergunta3 estado):**
```json
{
  "type": "barChart",
  "index": 0,
  "dataPath": "sectionData.estado.questions.pergunta3.distributionChart"
}
```

**Depois:**
```json
{
  "type": "stackedBarMECE",
  "index": 0,
  "dataPath": "sectionData.estado.questions.pergunta3.stackedBarMECE",
  "config": {
    "yAxisDataKey": "option",
    "series": [
      { "dataKey": "Paraná", "name": "Paraná (%)" },
      { "dataKey": "Rio Grande do Sul", "name": "Rio Grande do Sul (%)" },
      { "dataKey": "Santa Catarina", "name": "Santa Catarina (%)" }
    ]
  }
}
```

Aplicado em **estado** (pergunta3–6) e **serviço** (pergunta3–6); na seção serviço a série é só `"Internet Fixa"`.

---

## 2. Tipo da tabela: `distributionTable` → `analyticalTable` e dataPath

**Antes:**
```json
{
  "type": "distributionTable",
  "index": 1,
  "dataPath": "sectionData.estado.questions.pergunta3.distributionTable"
}
```

**Depois:**
```json
{
  "type": "analyticalTable",
  "index": 1,
  "dataPath": "sectionData.estado.questions.pergunta3.analyticalTable"
}
```

Mesmo padrão para as demais perguntas (estado e serviço).

---

## 3. Dados em `distributionChart`: `answer` → `option`

**Antes:**
```json
{
  "answer": "1",
  "Paraná": 0.0,
  "Rio Grande do Sul": 11.9,
  "Santa Catarina": 6.4
}
```

**Depois:**
```json
{
  "Paraná": 0,
  "Rio Grande do Sul": 11.9,
  "Santa Catarina": 6.4,
  "option": "1"
}
```

Ou seja: chave da categoria de **answer** para **option**.

---

## 4. Dados em `distributionTable`: `answer` → `segment`

**Antes:**
```json
{
  "answer": "1",
  "Paraná": 0.0,
  "Rio Grande do Sul": 11.9,
  "Santa Catarina": 6.4
}
```

**Depois:**
```json
{
  "Paraná": 0,
  "Rio Grande do Sul": 11.9,
  "Santa Catarina": 6.4,
  "segment": "1"
}
```

Mesma ideia: **answer** → **segment**.

---

## 5. Novo bloco `analyticalTable` por pergunta

**Antes:** a pergunta encerrava em:
```json
"negativeCategoriesTable": []
```

**Depois:** passou a existir um array `analyticalTable` (ordenado, ex.: maior valor primeiro), ex.:
```json
"negativeCategoriesTable": [],
"analyticalTable": [
  { "segment": "5", "Paraná": 50, "Rio Grande do Sul": 59.7, "Santa Catarina": 52.5 },
  { "segment": "4", "Paraná": 42.9, "Rio Grande do Sul": 16.4, "Santa Catarina": 19 },
  ...
]
```

Incluído nas perguntas 3–6 das seções **estado** e **serviço**.

---

## 6. Nova chave `stackedBarMECE` nos dados das perguntas

**Antes:** não existia a chave `stackedBarMECE` no objeto da pergunta.

**Depois:**

- Nas perguntas **com** gráfico de distribuição (3–6): foi adicionado `"stackedBarMECE": [ ... ]` com o mesmo conteúdo de `distributionChart` (campos de percentuais + `"option"`).

Exemplo (pergunta3 estado):
```json
"stackedBarMECE": [
  { "Paraná": 0, "Rio Grande do Sul": 11.9, "Santa Catarina": 6.4, "option": "1" },
  ...
]
```

Assim o `dataPath` do componente `stackedBarMECE` passa a refletir o nome do gráfico (`...stackedBarMECE`).

---

## Resumo das mudanças

| Área | Alteração |
|------|-----------|
| **Gráfico** | `barChart` → `stackedBarMECE` com `config` (yAxisDataKey, series) e `dataPath` em `...stackedBarMECE`. |
| **Tabela** | `distributionTable` → `analyticalTable` e `dataPath` em `...analyticalTable`. |
| **distributionChart** | Campo **answer** → **option**, colocado no final do objeto. |
| **distributionTable** | Campo **answer** → **segment**, colocado no final do objeto. |
| **Dados novos** | Em cada pergunta 3–6: array **analyticalTable** (ordenado, chave `segment` + colunas de %). |

**Onde vale:** seções **estado** e **serviço**, perguntas 3–6 para componentes e tabelas analíticas; chave `stackedBarMECE` em todas as perguntas afetadas pelo processamento do JSON.

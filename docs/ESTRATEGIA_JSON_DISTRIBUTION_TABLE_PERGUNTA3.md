# Estratégia: fazer a tabela de pergunta3 (estado) renderizar no JSON

## Contexto

- **Arquivo:** `src/data/tests-06-02/69403fe77237da9a4cf8979b_report_json.json`
- **Dados:** `sectionData.estado.questions.pergunta3.distributionTable` (linhas ~2067–2096)
- **Componente atual:** `type: "distributionTable"`, `dataPath: "sectionData.estado.questions.pergunta3.distributionTable"` (linhas ~1719–1722)

## Formato dos dados atuais

```json
"distributionTable": [
  { "answer": "1", "Paraná": 0.0, "Rio Grande do Sul": 11.9, "Santa Catarina": 6.4 },
  { "answer": "2", "Paraná": 0.0, "Rio Grande do Sul": 3.1, "Santa Catarina": 8.9 },
  ...
  { "answer": "5", "Paraná": 50.0, "Rio Grande do Sul": 59.7, "Santa Catarina": 52.5 }
]
```

Ou seja: **Resposta × Estado** (linhas = resposta 1–5, colunas = estados com %).

## O que cada componente espera

| Componente         | Formato esperado |
|--------------------|------------------|
| **DistributionTable** | Array de `{ segment, count, percentage }` — uma linha por segmento, duas colunas numéricas (quantidade e %). Não suporta colunas dinâmicas por estado. |
| **AnalyticalTable**   | Array de `{ segment, ... }` — primeira coluna = rótulo da linha; demais chaves = colunas (ex.: Paraná, Rio Grande do Sul, Santa Catarina). Suporta o layout Resposta × Estado. |

Conclusão: o payload atual **não** é compatível com DistributionTable (não há `segment`/`count`/`percentage` por linha). É compatível com **analyticalTable** (primeira coluna = resposta, demais = estados).

## Estratégia escolhida

Usar **analyticalTable** para esse dado, sem alterar o componente DistributionTable.

1. **Adicionar** em `estado.questions.pergunta3` a chave **`analyticalTable`** com o mesmo array, trocando **`answer`** por **`segment`** (convenção do analyticalTable).
2. **Alterar** o componente que hoje é `distributionTable` com dataPath em pergunta3 para:
   - `type: "analyticalTable"`
   - `dataPath: "sectionData.estado.questions.pergunta3.analyticalTable"`
   - `config` opcional: `columns` com label "Resposta" e estados com sufixo "(%)" para exibição.
3. Manter **`distributionTable`** no JSON como está (pode ser usado em outro fluxo ou removido depois). O que passa a renderizar a tabela é o componente apontando para `analyticalTable`.

## Alterações no JSON (resumo)

| Onde | O quê |
|------|--------|
| `sections[].subsections[].components[]` (objeto com dataPath pergunta3.distributionTable) | Trocar `type` para `"analyticalTable"`, `dataPath` para `"sectionData.estado.questions.pergunta3.analyticalTable"`; opcionalmente adicionar `config.columns`. |
| `section.data.estado.questions.pergunta3` | Adicionar chave `analyticalTable` com array igual ao atual `distributionTable`, mas com propriedade `segment` no lugar de `answer` em cada item. |

Assim a tabela “Resposta | Paraná (%) | Rio Grande do Sul (%) | Santa Catarina (%)” passa a renderizar via analyticalTable.

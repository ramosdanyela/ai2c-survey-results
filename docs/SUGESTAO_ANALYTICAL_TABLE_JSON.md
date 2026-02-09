# Sugestão: Estrutura JSON para analyticalTable

Documento de referência para padronizar o envio de dados do **analyticalTable** com as outras tabelas do projeto, usando **segment** como chave da primeira coluna (rótulo da linha). Nenhuma alteração de código ou JSON existente é feita até a adoção desta convenção.

---

## 1. Padrão das outras tabelas (referência)

- **distributionTable, segmentationTable, sentimentTable:** `dataPath` aponta para **um array direto**. O valor em `section.data.<chave>` é o array de linhas. Configuração fica em `component.config`.
- **recommendationsTable:** exceção — objeto com `config` e `items` (array).

Para o **analyticalTable** recomenda-se seguir o padrão da maioria: **array direto** + **config no componente**, e convenção de **segment** para o rótulo da linha (como em distributionTable/segmentationTable).

---

## 2. Componente (objeto no array de componentes)

| Campo     | Tipo   | Obrigatório | Descrição |
|----------|--------|-------------|-----------|
| `type`   | string | Sim         | `"analyticalTable"` |
| `index`  | number | Não         | Ordem de renderização |
| `dataPath` | string | Sim       | Caminho para o array de dados. Ex.: `"sectionData.analyticalTable"` ou `"question.data.analyticalTable"` |
| `config` | object | Não         | Ver seção 3 abaixo |

Exemplo mínimo:

```json
{
  "type": "analyticalTable",
  "index": 0,
  "dataPath": "sectionData.analyticalTable"
}
```

Exemplo com config (só o que for diferente do default — ex.: colunas com label e showRanking):

```json
{
  "type": "analyticalTable",
  "index": 0,
  "dataPath": "sectionData.analyticalTable",
  "config": {
    "columns": [
      { "key": "segment", "label": "Categoria" },
      { "key": "value", "label": "Respostas" },
      { "key": "percentage", "label": "%" }
    ],
    "showRanking": true
  }
}
```

Ordenação inicial (percentage desc) e colunas sortable vêm do código; não é preciso enviar `defaultSort` nem `sortable: true` em cada coluna.

---

## 3. Config (opcional)

Tudo dentro de `component.config`. Nenhum config deve vir dentro do payload de dados.

**Defaults no código (não é obrigatório enviar no JSON):**
- **Ordenação inicial:** `percentage` descendente (definido no código). Não enviar `defaultSort` no JSON.
- **Coluna de ranking:** desligada por padrão (`showRanking: false`). Só colocar `"showRanking": true` no JSON se quiser exibir a coluna Rank.
- **Colunas sortable:** todas ordenáveis por padrão (`sortable: true`). Só colocar `"sortable": false` em uma coluna no JSON se quiser desativar a ordenação nela.

| Campo          | Tipo   | Descrição |
|----------------|--------|-----------|
| `columns`      | array  | `[{ key, label, sortable?, formatter? }]`. Se omitido, colunas são inferidas pelas chaves do primeiro item (segment + demais). Em cada coluna, `sortable` default no código é `true`; use `sortable: false` no JSON para desativar. |
| `showRanking`  | boolean | Exibir coluna de ranking. **Default no código: false.** Só enviar no JSON quando for `true`. |

---

## 4. Dados (valor apontado pelo dataPath)

- **Tipo:** **array** de objetos (uma linha por objeto).
- **Local:** O valor resolvido pelo `dataPath` deve ser **diretamente** esse array. Ex.: `section.data.analyticalTable = [ ... ]`. Não usar wrapper como `{ items: [...] }` nem `{ analyticalTable: [...] }` no envio.

### 4.1 Convenção das chaves nas linhas

- **segment** (string ou número): rótulo da linha — pode ser categoria (ex.: "Atendimento"), estado (ex.: "Paraná") ou valor de resposta (ex.: "5", "4", "3", "2", "1") quando as linhas são “Resposta” e as colunas são segmentos (estados, etc.).
- Demais chaves: valores da linha (numéricos ou texto). Podem ser:
  - nomes fixos: **value**, **count**, **percentage** (quantidade ou percentual único por linha), ou
  - nomes de segmentos (ex.: **Paraná**, **Rio Grande do Sul**, **Santa Catarina**) quando cada coluna é um segmento e o valor é o percentual naquela célula (tabela Resposta × Estado).

### 4.2 Exemplo de payload de dados

Array em `section.data.analyticalTable` (ou no objeto que o front resolve como `sectionData.analyticalTable`):

```json
[
  { "segment": "Atendimento", "value": 320, "percentage": 42.5 },
  { "segment": "Preço", "value": 180, "percentage": 23.9 },
  { "segment": "Qualidade", "value": 150, "percentage": 19.9 },
  { "segment": "Outros", "value": 104, "percentage": 13.8 }
]
```

Outro exemplo (ranking por região):

```json
[
  { "segment": "Região A", "count": 100, "percentage": 35 },
  { "segment": "Região B", "count": 85, "percentage": 30 },
  { "segment": "Região C", "count": 95, "percentage": 34 }
]
```

Exemplo por estado (Paraná, Rio Grande do Sul, etc.) — o **valor** de `segment` é que identifica cada linha:

```json
[
  { "segment": "Paraná", "value": 120, "percentage": 28 },
  { "segment": "Rio Grande do Sul", "value": 95, "percentage": 22 },
  { "segment": "Santa Catarina", "value": 88, "percentage": 20 },
  { "segment": "São Paulo", "value": 85, "percentage": 19 },
  { "segment": "Outros", "value": 40, "percentage": 9 }
]
```

O front não precisa de outro campo para “saber” qual linha é qual: o conteúdo de `segment` (ex.: "Paraná", "Rio Grande do Sul") é o rótulo exibido e o identificador da linha.

### 4.3 Exemplo: Resposta por estado (estados como colunas)

Quando a tabela tem **Resposta** na primeira coluna e **estados (Paraná, Rio Grande do Sul, Santa Catarina) como colunas** com percentuais em cada célula, a mesma estrutura serve: cada linha é um objeto, `segment` é o rótulo da linha (ex.: valor da resposta 5, 4, 3, 2, 1) e as demais chaves são os nomes dos estados, com o percentual naquele (resposta, estado).

Exemplo que gera a tabela “Resposta | Paraná (%) | Rio Grande do Sul (%) | Santa Catarina (%)”:

```json
[
  { "segment": "5", "Paraná": 50.0, "Rio Grande do Sul": 59.7, "Santa Catarina": 52.5 },
  { "segment": "4", "Paraná": 42.9, "Rio Grande do Sul": 16.4, "Santa Catarina": 19.0 },
  { "segment": "3", "Paraná": 7.1, "Rio Grande do Sul": 8.8, "Santa Catarina": 13.2 },
  { "segment": "2", "Paraná": 0.0, "Rio Grande do Sul": 3.1, "Santa Catarina": 8.9 },
  { "segment": "1", "Paraná": 0.0, "Rio Grande do Sul": 11.9, "Santa Catarina": 6.4 }
]
```

Config sugerido para cabeçalhos (ex.: sufixo “%”). Ordenação e sortable vêm do código; só definir colunas e labels. Para essa tabela (Resposta × Estado) normalmente não se usa coluna de ranking, então não enviar `showRanking` (default false):

```json
{
  "config": {
    "columns": [
      { "key": "segment", "label": "Resposta" },
      { "key": "Paraná", "label": "Paraná (%)" },
      { "key": "Rio Grande do Sul", "label": "Rio Grande do Sul (%)" },
      { "key": "Santa Catarina", "label": "Santa Catarina (%)" }
    ]
  }
}
```

Assim, “qual é do Paraná” em cada linha é a coluna cuja chave é `"Paraná"`; “qual é do Rio Grande do Sul” é a chave `"Rio Grande do Sul"`, etc. A estrutura (array de objetos com `segment` + chaves dinâmicas) comporta tanto “uma linha por estado” quanto “uma linha por resposta com estados nas colunas”.

Exemplo com colunas extras:

```json
[
  { "segment": "Tema 1", "positive": 40, "neutral": 35, "negative": 25 },
  { "segment": "Tema 2", "positive": 55, "neutral": 30, "negative": 15 }
]
```

---

## 5. Exemplo completo (componente + dados no relatório)

### 5.1 Componente dentro de uma subseção

```json
{
  "type": "analyticalTable",
  "index": 0,
  "dataPath": "sectionData.analyticalTable",
  "config": {
    "columns": [
      { "key": "segment", "label": "Categoria" },
      { "key": "value", "label": "Respostas" },
      { "key": "percentage", "label": "%" }
    ],
    "showRanking": true
  }
}
```

(Ordenação inicial percentage desc e sortable são defaults no código.)

### 5.2 Dados na seção (section.data)

```json
{
  "analyticalTable": [
    { "segment": "Atendimento", "value": 320, "percentage": 42.5 },
    { "segment": "Preço", "value": 180, "percentage": 23.9 },
    { "segment": "Qualidade", "value": 150, "percentage": 19.9 },
    { "segment": "Outros", "value": 104, "percentage": 13.8 }
  ]
}
```

O `dataPath` `"sectionData.analyticalTable"` resolve para esse array (o front monta `sectionData` a partir de `section.data`).

### 5.3 Se for por questão (question.data)

Componente (config mínimo; ordenação e sortable vêm do código):

```json
{
  "type": "analyticalTable",
  "index": 0,
  "dataPath": "question.data.analyticalTable",
  "config": {
    "showRanking": true
  }
}
```

Dados (dentro do objeto da questão):

```json
{
  "question": {
    "question_id": 1,
    "question": "Principais temas mencionados",
    "data": {
      "analyticalTable": [
        { "segment": "Tema A", "value": 120, "percentage": 38 },
        { "segment": "Tema B", "value": 95, "percentage": 30 },
        { "segment": "Tema C", "value": 100, "percentage": 32 }
      ]
    }
  }
}
```

---

## 6. Resumo

| Onde        | Formato |
|------------|---------|
| **Componente** | `type: "analyticalTable"`, `dataPath: "sectionData.analyticalTable"` (ou `question.data.analyticalTable`), `config` opcional: `columns` (key, label; sortable só se false), `showRanking` (só se true). Defaults no código: ordenação percentage desc, showRanking false, sortable true. |
| **Dados**      | **Array direto** na chave indicada pelo dataPath. Sem wrapper (sem `items` nem `analyticalTable` no valor). |
| **Cada linha** | Objeto com **segment** (rótulo) + chaves de valor (ex.: value, count, percentage). |
| **Local no relatório** | `section.data.analyticalTable` ou `question.data.analyticalTable`. |

Assim o analyticalTable fica alinhado ao padrão das outras tabelas (array direto + config no componente) e usa **segment** como convenção para o rótulo da linha.

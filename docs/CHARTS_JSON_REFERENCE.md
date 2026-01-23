# 📊 Referência de Gráficos - Estrutura JSON

Este documento descreve como estruturar os dados JSON para utilizar cada tipo de gráfico disponível no sistema.

---

## 📋 Índice

1. [KPI Card](#1-kpi-card)
2. [Line Chart](#2-line-chart)
3. [Pareto Chart](#3-pareto-chart)
4. [Analytical Table](#4-analytical-table)
5. [Slope Graph](#5-slope-graph)
6. [Waterfall Chart](#6-waterfall-chart)
7. [Scatter Plot](#7-scatter-plot)
8. [Histogram](#8-histogram)
9. [Quadrant Chart](#9-quadrant-chart)
10. [Heatmap](#10-heatmap)
11. [Sankey Diagram](#11-sankey-diagram)
12. [Stacked Bar MECE](#12-stacked-bar-mece-aprimorado)
13. [Evolutionary Scorecard](#13-evolutionary-scorecard-aprimorado)

---

## 1. KPI Card

**Categoria:** Síntese Numérica Imediata  
**Tipo:** `kpiCard`

### Estrutura de Dados

```json
{
  "type": "kpiCard",
  "index": 0,
  "dataPath": "sectionData.kpi",
  "config": {
    "valueKey": "value",
    "labelKey": "label",
    "deltaKey": "delta",
    "trendKey": "trend",
    "targetKey": "target"
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "kpi": {
      "value": 1250,
      "label": "Total de Vendas",
      "delta": 150,
      "trend": "up",
      "target": 1200
    }
  }
}
```

### Campos

| Campo    | Tipo   | Obrigatório | Descrição                      |
| -------- | ------ | ----------- | ------------------------------ |
| `value`  | number | ✅          | Valor principal do KPI         |
| `label`  | string | ✅          | Texto descritivo               |
| `delta`  | number | ❌          | Mudança (positiva ou negativa) |
| `trend`  | string | ❌          | "up" \| "down" \| "neutral"    |
| `target` | number | ❌          | Valor meta                     |

### Exemplo Completo

```json
{
  "sections": [
      {
        "id": "dashboard",
        "data": {
          "renderSchema": {
            "components": [
              {
                "type": "kpiCard",
                "index": 0,
                "dataPath": "sectionData.salesKPI",
                "config": {
                  "valueKey": "value",
                  "labelKey": "label"
                }
              }
            ]
          },
          "salesKPI": {
            "value": 1250,
            "label": "Vendas do Mês",
            "delta": 150,
            "trend": "up",
            "target": 1200
          }
        }
      }
    ]
  }
}
```

---

## 2. Line Chart

**Categoria:** Evolução Temporal  
**Tipo:** `lineChart`

### Estrutura de Dados

```json
{
  "type": "lineChart",
  "index": 0,
  "dataPath": "sectionData.temporalData",
  "config": {
    "xAxisDataKey": "date",
    "lines": [
      {
        "dataKey": "value1",
        "name": "Série 1",
        "color": "#ff9e2b",
        "strokeWidth": 2
      },
      {
        "dataKey": "value2",
        "name": "Série 2",
        "color": "#1982d8",
        "strokeWidth": 2
      }
    ],
    "height": 400,
    "showGrid": true
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "temporalData": [
      { "date": "Jan", "value1": 100, "value2": 80 },
      { "date": "Fev", "value1": 120, "value2": 90 },
      { "date": "Mar", "value1": 110, "value2": 95 },
      { "date": "Abr", "value1": 130, "value2": 100 },
      { "date": "Mai", "value1": 125, "value2": 105 }
    ]
  }
}
```

### Campos

| Campo                 | Tipo   | Obrigatório | Descrição                        |
| --------------------- | ------ | ----------- | -------------------------------- |
| `xAxisDataKey`        | string | ✅          | Chave para eixo X                |
| `lines`               | array  | ✅          | Array de configurações de linhas |
| `lines[].dataKey`     | string | ✅          | Chave dos dados da linha         |
| `lines[].name`        | string | ✅          | Nome da série                    |
| `lines[].color`       | string | ❌          | Cor da linha (hex)               |
| `lines[].strokeWidth` | number | ❌          | Espessura da linha (padrão: 2)   |
| `height`              | number | ❌          | Altura do gráfico (padrão: 400)  |

---

## 3. Pareto Chart

**Categoria:** Foco nos Fatores Críticos  
**Tipo:** `paretoChart`

### Estrutura de Dados

```json
{
  "type": "paretoChart",
  "index": 0,
  "dataPath": "sectionData.pareto",
  "config": {
    "categoryKey": "category",
    "valueKey": "value",
    "showCumulative": true,
    "cumulativeThreshold": 80,
    "height": 400
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "pareto": [
      { "category": "Problema A", "value": 45 },
      { "category": "Problema B", "value": 30 },
      { "category": "Problema C", "value": 15 },
      { "category": "Problema D", "value": 7 },
      { "category": "Problema E", "value": 3 }
    ]
  }
}
```

### Campos

| Campo                 | Tipo    | Obrigatório | Descrição                               |
| --------------------- | ------- | ----------- | --------------------------------------- |
| `categoryKey`         | string  | ✅          | Chave para categoria                    |
| `valueKey`            | string  | ✅          | Chave para valor                        |
| `showCumulative`      | boolean | ❌          | Mostrar linha cumulativa (padrão: true) |
| `cumulativeThreshold` | number  | ❌          | Threshold para linha (padrão: 80)       |

**Nota:** Os dados são automaticamente ordenados por valor decrescente.

---

## 4. Analytical Table

**Categoria:** Síntese Analítica Final  
**Tipo:** `analyticalTable`

### Estrutura de Dados

```json
{
  "type": "analyticalTable",
  "index": 0,
  "dataPath": "sectionData.ranking",
  "config": {
    "columns": [
      {
        "key": "rank",
        "label": "Rank",
        "sortable": true
      },
      {
        "key": "name",
        "label": "Nome",
        "sortable": true
      },
      {
        "key": "value",
        "label": "Valor",
        "sortable": true,
        "formatter": null
      }
    ],
    "showRanking": true,
    "defaultSort": {
      "key": "value",
      "direction": "desc"
    }
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "ranking": [
      { "rank": 1, "name": "Item A", "value": 95, "category": "Alta" },
      { "rank": 2, "name": "Item B", "value": 87, "category": "Alta" },
      { "rank": 3, "name": "Item C", "value": 72, "category": "Média" }
    ]
  }
}
```

### Campos

| Campo                 | Tipo     | Obrigatório | Descrição                                |
| --------------------- | -------- | ----------- | ---------------------------------------- |
| `columns`             | array    | ✅          | Configuração de colunas                  |
| `columns[].key`       | string   | ✅          | Chave dos dados                          |
| `columns[].label`     | string   | ✅          | Label da coluna                          |
| `columns[].sortable`  | boolean  | ❌          | Permitir ordenação                       |
| `columns[].formatter` | function | ❌          | Função de formatação                     |
| `showRanking`         | boolean  | ❌          | Mostrar coluna de ranking (padrão: true) |
| `defaultSort`         | object   | ❌          | Ordenação padrão                         |

---

## 5. Slope Graph

**Categoria:** Comparação de Impacto  
**Tipo:** `slopeGraph`

### Estrutura de Dados

```json
{
  "type": "slopeGraph",
  "index": 0,
  "dataPath": "sectionData.beforeAfter",
  "config": {
    "categoryKey": "category",
    "beforeKey": "before",
    "afterKey": "after",
    "showLabels": true,
    "showDelta": true,
    "height": 400
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "beforeAfter": [
      { "category": "Atendimento", "before": 60, "after": 75 },
      { "category": "Qualidade", "before": 70, "after": 85 },
      { "category": "Preço", "before": 50, "after": 65 },
      { "category": "Entrega", "before": 55, "after": 70 }
    ]
  }
}
```

### Campos

| Campo         | Tipo    | Obrigatório | Descrição                        |
| ------------- | ------- | ----------- | -------------------------------- |
| `categoryKey` | string  | ✅          | Chave para categoria             |
| `beforeKey`   | string  | ✅          | Chave para valor "antes"         |
| `afterKey`    | string  | ✅          | Chave para valor "depois"        |
| `showLabels`  | boolean | ❌          | Mostrar valores nos pontos       |
| `showDelta`   | boolean | ❌          | Mostrar diferença (padrão: true) |

---

## 6. Waterfall Chart

**Categoria:** Decomposição Causal  
**Tipo:** `waterfallChart`

### Estrutura de Dados

```json
{
  "type": "waterfallChart",
  "index": 0,
  "dataPath": "sectionData.waterfall",
  "config": {
    "labelKey": "label",
    "valueKey": "value",
    "typeKey": "type",
    "height": 400
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "waterfall": [
      { "label": "Inicial", "value": 1000, "type": "start" },
      { "label": "Vendas", "value": 300, "type": "positive" },
      { "label": "Custos", "value": -150, "type": "negative" },
      { "label": "Marketing", "value": -50, "type": "negative" },
      { "label": "Final", "value": 1100, "type": "end" }
    ]
  }
}
```

### Campos

| Campo      | Tipo   | Obrigatório | Descrição                                    |
| ---------- | ------ | ----------- | -------------------------------------------- |
| `labelKey` | string | ✅          | Chave para label                             |
| `valueKey` | string | ✅          | Chave para valor                             |
| `typeKey`  | string | ✅          | Chave para tipo                              |
| `type`     | string | ✅          | "start" \| "positive" \| "negative" \| "end" |

**Nota:** O tipo "start" e "end" são valores totais. "positive" e "negative" são mudanças.

---

## 7. Scatter Plot

**Categoria:** Relação entre Variáveis  
**Tipo:** `scatterPlot`

### Estrutura de Dados

```json
{
  "type": "scatterPlot",
  "index": 0,
  "dataPath": "sectionData.correlation",
  "config": {
    "xAxisDataKey": "x",
    "yAxisDataKey": "y",
    "sizeKey": "size",
    "colorKey": "category",
    "colorMap": {
      "A": "#ff9e2b",
      "B": "#1982d8",
      "C": "#10b981"
    },
    "height": 400
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "correlation": [
      { "x": 10, "y": 20, "size": 5, "category": "A" },
      { "x": 15, "y": 30, "size": 8, "category": "A" },
      { "x": 20, "y": 25, "size": 6, "category": "B" },
      { "x": 25, "y": 40, "size": 10, "category": "B" }
    ]
  }
}
```

### Campos

| Campo          | Tipo   | Obrigatório | Descrição                     |
| -------------- | ------ | ----------- | ----------------------------- |
| `xAxisDataKey` | string | ✅          | Chave para eixo X             |
| `yAxisDataKey` | string | ✅          | Chave para eixo Y             |
| `sizeKey`      | string | ❌          | Chave para tamanho dos pontos |
| `colorKey`     | string | ❌          | Chave para cor dos pontos     |
| `colorMap`     | object | ❌          | Mapa de valores para cores    |

---

## 8. Histogram

**Categoria:** Distribuição Estatística  
**Tipo:** `histogram`

### Estrutura de Dados

```json
{
  "type": "histogram",
  "index": 0,
  "dataPath": "sectionData.distribution",
  "config": {
    "valueKey": "value",
    "bins": 10,
    "showDensity": false,
    "height": 400
  }
}
```

### Dados no JSON

**Opção 1: Array de valores**

```json
{
  "sectionData": {
    "distribution": [12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40]
  }
}
```

**Opção 2: Array de objetos**

```json
{
  "sectionData": {
    "distribution": [
      { "value": 12 },
      { "value": 15 },
      { "value": 18 },
      { "value": 20 }
    ]
  }
}
```

### Campos

| Campo         | Tipo    | Obrigatório | Descrição                                        |
| ------------- | ------- | ----------- | ------------------------------------------------ |
| `valueKey`    | string  | ❌          | Chave para valor (se array de objetos)           |
| `bins`        | number  | ❌          | Número de bins (auto-calculado se não fornecido) |
| `showDensity` | boolean | ❌          | Mostrar densidade vs. contagem (padrão: false)   |

---

## 9. Quadrant Chart

**Categoria:** Priorização Executiva  
**Tipo:** `quadrantChart`

### Estrutura de Dados

```json
{
  "type": "quadrantChart",
  "index": 0,
  "dataPath": "sectionData.quadrant",
  "config": {
    "xAxisDataKey": "x",
    "yAxisDataKey": "y",
    "labelKey": "label",
    "sizeKey": "size",
    "quadrants": {
      "xThreshold": 50,
      "yThreshold": 50,
      "labels": [
        "Baixo Impacto",
        "Alto Impacto",
        "Baixo Esforço",
        "Alto Esforço"
      ]
    },
    "height": 400
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "quadrant": [
      { "x": 30, "y": 70, "label": "Alta Prioridade", "size": 10 },
      { "x": 70, "y": 80, "label": "Urgente", "size": 15 },
      { "x": 20, "y": 30, "label": "Baixa Prioridade", "size": 5 },
      { "x": 80, "y": 20, "label": "Monitorar", "size": 8 }
    ]
  }
}
```

### Campos

| Campo                  | Tipo   | Obrigatório | Descrição                   |
| ---------------------- | ------ | ----------- | --------------------------- |
| `xAxisDataKey`         | string | ✅          | Chave para eixo X           |
| `yAxisDataKey`         | string | ✅          | Chave para eixo Y           |
| `labelKey`             | string | ✅          | Chave para label            |
| `sizeKey`              | string | ❌          | Chave para tamanho da bolha |
| `quadrants.xThreshold` | number | ✅          | Threshold do eixo X         |
| `quadrants.yThreshold` | number | ✅          | Threshold do eixo Y         |
| `quadrants.labels`     | array  | ✅          | Labels dos 4 quadrantes     |

---

## 10. Heatmap

**Categoria:** Cruzamento Multidimensional  
**Tipo:** `heatmap`

### Estrutura de Dados

```json
{
  "type": "heatmap",
  "index": 0,
  "dataPath": "sectionData.heatmap",
  "config": {
    "xKey": "x",
    "yKey": "y",
    "valueKey": "value",
    "xCategories": ["Segunda", "Terça", "Quarta"],
    "yCategories": ["Manhã", "Tarde"],
    "colorScale": "viridis",
    "height": 400
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "heatmap": [
      { "x": "Segunda", "y": "Manhã", "value": 85 },
      { "x": "Segunda", "y": "Tarde", "value": 72 },
      { "x": "Terça", "y": "Manhã", "value": 90 },
      { "x": "Terça", "y": "Tarde", "value": 68 },
      { "x": "Quarta", "y": "Manhã", "value": 88 },
      { "x": "Quarta", "y": "Tarde", "value": 75 }
    ]
  }
}
```

### Campos

| Campo         | Tipo   | Obrigatório | Descrição                                              |
| ------------- | ------ | ----------- | ------------------------------------------------------ |
| `xKey`        | string | ✅          | Chave para categoria X                                 |
| `yKey`        | string | ✅          | Chave para categoria Y                                 |
| `valueKey`    | string | ✅          | Chave para valor                                       |
| `xCategories` | array  | ❌          | Categorias do eixo X (auto-detectado se não fornecido) |
| `yCategories` | array  | ❌          | Categorias do eixo Y (auto-detectado se não fornecido) |
| `colorScale`  | string | ❌          | "viridis" \| "plasma" \| "red-blue" \| "green-red"     |

---

## 11. Sankey Diagram

**Categoria:** Fluxo e Jornada  
**Tipo:** `sankeyDiagram`

### Estrutura de Dados

```json
{
  "type": "sankeyDiagram",
  "index": 0,
  "dataPath": "sectionData.sankey",
  "config": {
    "nodeKey": "id",
    "nodeLabel": "label",
    "linkSource": "source",
    "linkTarget": "target",
    "linkValue": "value",
    "height": 400,
    "width": 800,
    "nodeWidth": 15,
    "nodePadding": 10
  }
}
```

### Dados no JSON

**Opção 1: Objeto com nodes e links**

```json
{
  "sectionData": {
    "sankey": {
      "nodes": [
        { "id": "source1", "label": "Fonte 1" },
        { "id": "source2", "label": "Fonte 2" },
        { "id": "intermediate", "label": "Intermediário" },
        { "id": "target1", "label": "Destino 1" },
        { "id": "target2", "label": "Destino 2" }
      ],
      "links": [
        { "source": "source1", "target": "intermediate", "value": 50 },
        { "source": "source2", "target": "intermediate", "value": 30 },
        { "source": "intermediate", "target": "target1", "value": 40 },
        { "source": "intermediate", "target": "target2", "value": 40 }
      ]
    }
  }
}
```

**Opção 2: Paths separados**

```json
{
  "type": "sankeyDiagram",
  "index": 0,
  "dataPath": "sectionData",
  "config": {
    "nodesPath": "sectionData.nodes",
    "linksPath": "sectionData.links"
  }
}
```

### Campos

| Campo            | Tipo   | Obrigatório | Descrição         |
| ---------------- | ------ | ----------- | ----------------- |
| `nodes`          | array  | ✅          | Array de nós      |
| `nodes[].id`     | string | ✅          | ID único do nó    |
| `nodes[].label`  | string | ✅          | Label do nó       |
| `links`          | array  | ✅          | Array de conexões |
| `links[].source` | string | ✅          | ID do nó origem   |
| `links[].target` | string | ✅          | ID do nó destino  |
| `links[].value`  | number | ✅          | Valor do fluxo    |

---

## 12. Stacked Bar MECE (Aprimorado)

**Categoria:** Generalização de Composição  
**Tipo:** `stackedBarMECE`

### Estrutura de Dados

```json
{
  "type": "stackedBarMECE",
  "index": 0,
  "dataPath": "sectionData.stacked",
  "config": {
    "categoryKey": "category",
    "series": [
      {
        "dataKey": "series1",
        "name": "Série 1",
        "color": "#ff9e2b"
      },
      {
        "dataKey": "series2",
        "name": "Série 2",
        "color": "#1982d8"
      },
      {
        "dataKey": "series3",
        "name": "Série 3",
        "color": "#10b981"
      }
    ],
    "height": 400
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "stacked": [
      {
        "category": "Categoria 1",
        "series1": 40,
        "series2": 30,
        "series3": 30
      },
      {
        "category": "Categoria 2",
        "series1": 50,
        "series2": 25,
        "series3": 25
      },
      {
        "category": "Categoria 3",
        "series1": 35,
        "series2": 35,
        "series3": 30
      }
    ]
  }
}
```

### Campos

| Campo              | Tipo   | Obrigatório | Descrição                        |
| ------------------ | ------ | ----------- | -------------------------------- |
| `categoryKey`      | string | ✅          | Chave para categoria             |
| `series`           | array  | ✅          | Array de configurações de séries |
| `series[].dataKey` | string | ✅          | Chave dos dados da série         |
| `series[].name`    | string | ✅          | Nome da série                    |
| `series[].color`   | string | ❌          | Cor da série (hex)               |

**Nota:** Os valores devem somar 100% por categoria para melhor visualização.

---

## 13. Evolutionary Scorecard (Aprimorado)

**Categoria:** Síntese de KPIs Avançada  
**Tipo:** `evolutionaryScorecard`

### Estrutura de Dados

```json
{
  "type": "evolutionaryScorecard",
  "index": 0,
  "dataPath": "sectionData.scorecard",
  "config": {
    "valueKey": "value",
    "targetKey": "target",
    "deltaKey": "delta",
    "trendKey": "trend",
    "labelKey": "label"
  }
}
```

### Dados no JSON

```json
{
  "sectionData": {
    "scorecard": {
      "value": 85,
      "target": 90,
      "delta": 5,
      "trend": "up",
      "label": "Satisfação do Cliente"
    }
  }
}
```

### Campos

| Campo    | Tipo   | Obrigatório | Descrição                   |
| -------- | ------ | ----------- | --------------------------- |
| `value`  | number | ✅          | Valor atual                 |
| `target` | number | ❌          | Valor meta                  |
| `delta`  | number | ❌          | Diferença (mudança)         |
| `trend`  | string | ❌          | "up" \| "down" \| "neutral" |
| `label`  | string | ✅          | Label do scorecard          |

---

## 🔧 Configurações Comuns

### Margens do Gráfico

Todos os gráficos suportam configuração de margens:

```json
{
  "config": {
    "margin": {
      "top": 20,
      "right": 30,
      "left": 20,
      "bottom": 20
    }
  }
}
```

### Altura do Gráfico

```json
{
  "config": {
    "height": 400
  }
}
```

### Formatação de Valores

Alguns gráficos suportam formatação customizada:

```json
{
  "config": {
    "format": "(value) => `${value.toFixed(2)}%`"
  }
}
```

---

## ⚠️ Validação

O sistema valida automaticamente:

- ✅ Tipo de componente válido
- ✅ `dataPath` aponta para dados existentes
- ✅ Estrutura de dados correta (arrays, objetos, etc.)
- ✅ Campos obrigatórios presentes
- ✅ Tipos de dados corretos

**Execute a validação:**

```bash
npm run validate:json src/data/surveyData.json
```

---

## 📝 Notas Importantes

1. **Paths Relativos:** Use `sectionData.` para paths relativos à seção
2. **Arrays:** A maioria dos gráficos requer arrays de dados
3. **Cores:** Use códigos hex (#ff9e2b) ou referências ao sistema de cores
4. **Valores Percentuais:** Muitos gráficos esperam valores de 0-100
5. **Ordenação:** Alguns gráficos ordenam automaticamente (ex: Pareto)

---

## 🐛 Troubleshooting

### Gráfico não aparece

- Verifique se `dataPath` está correto
- Confirme que os dados existem no JSON
- Verifique o console do navegador para erros

### Dados não formatados corretamente

- Verifique se arrays são realmente arrays
- Confirme que objetos têm as chaves esperadas
- Valide tipos de dados (números vs strings)

### Cores não aparecem

- Use códigos hex válidos (#ff9e2b)
- Verifique se `colorMap` está configurado corretamente
- Confirme que `colorKey` aponta para valores válidos

---

**Versão:** 1.1  
**Última Atualização:** 2025-01-XX

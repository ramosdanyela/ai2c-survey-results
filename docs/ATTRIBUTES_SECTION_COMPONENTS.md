# Componentes da seção "attributes" (Análise por Atributos)

Referência: `src/data/surveyDataFromDaniel.json`  
Seção no JSON: `sections[3]` (linhas ~1086–1879).

---

## 1. Subsection: **Tipo de Cliente**

`id`: `attributes-TipodeCliente` · `index`: 0  
Definição no JSON: `sections[3].subsections[0]` (linhas ~1092–1367)

| #     | Tipo do componente         | Título / contexto                                             | Endereço dos dados no JSON (`surveyDataFromDaniel.json`)                                                                                                                                                     |
| ----- | -------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `card`                     | Sumário                                                       | Sem `dataPath` — texto em `components[0].text` (linhas 1101–1102)                                                                                                                                            |
| 2     | `grid-container`           | —                                                             | Container; filhos abaixo.                                                                                                                                                                                    |
| 2.1   | `barChart`                 | (distribuição)                                                | **dataPath:** `sectionData.TipodeCliente.distributionChart` → `sections[3].subsections[0].data.distributionChart` (linhas 1192–1213)                                                                         |
| 2.2   | `distributionTable`        | (distribuição)                                                | **dataPath:** `sectionData.TipodeCliente.distributionTable` → `sections[3].subsections[0].data.distributionTable` (linhas 1214–1233)                                                                         |
| 3     | `card`                     | "Qual é a probabilidade de você recomendar nossa empresa..."  | Card com `cardContentVariant: "with-tables"`; filhos abaixo.                                                                                                                                                 |
| 3.1   | `card`                     | Sumário                                                       | Texto em `components[0].text` (linhas 1128–1129)                                                                                                                                                             |
| 3.2   | `container`                | —                                                             | Container; filhos abaixo.                                                                                                                                                                                    |
| 3.2.1 | `npsDistributionTable`     | —                                                             | **dataPath:** `sectionData.TipodeCliente.questions.question01.npsDistributionTable` → `sections[3].subsections[0].data.questions.question01.npsDistributionTable` (linhas 1236–1254)                         |
| 3.2.2 | `npsTable`                 | —                                                             | **dataPath:** `sectionData.TipodeCliente.questions.question01.npsTable` → `sections[3].subsections[0].data.questions.question01.npsTable` (linhas 1255–1268)                                                 |
| 4     | `card`                     | "Quais são os principais pontos que impactam sua satisfação?" | Card com tabelas; filhos abaixo.                                                                                                                                                                             |
| 4.1   | `card`                     | Sumário                                                       | Texto em `components[0].text` (linhas 1164–1165)                                                                                                                                                             |
| 4.2   | `container`                | —                                                             | Container; filhos abaixo.                                                                                                                                                                                    |
| 4.2.1 | `sentimentThreeColorChart` | —                                                             | **dataPath:** `sectionData.TipodeCliente.questions.question02.satisfactionImpactSentimentChart` → `sections[3].subsections[0].data.questions.question02.satisfactionImpactSentimentChart` (linhas 1286–1304) |
| 4.2.2 | `sentimentImpactTable`     | —                                                             | **dataPath:** `sectionData.TipodeCliente.questions.question02.satisfactionImpactSentimentTable` → `sections[3].subsections[0].data.questions.question02.satisfactionImpactSentimentTable` (linhas 1305–1323) |
| 4.2.3 | `positiveCategoriesTable`  | —                                                             | **dataPath:** `sectionData.TipodeCliente.questions.question02.positiveCategoriesTable` → `sections[3].subsections[0].data.questions.question02.positiveCategoriesTable` (linhas 1324–1342)                   |
| 4.2.4 | `negativeCategoriesTable`  | —                                                             | **dataPath:** `sectionData.TipodeCliente.questions.question02.negativeCategoriesTable` → `sections[3].subsections[0].data.questions.question02.negativeCategoriesTable` (linhas 1343–1362)                   |

Dados da subsection: `sections[3].subsections[0].data` (linhas 1190–1366).

---

## 2. Subsection: **Estado**

`id`: `attributes-Estado` · `index`: 1  
Definição no JSON: `sections[3].subsections[1]` (linhas ~1369–1878)

| #     | Tipo do componente         | Título / contexto                                             | Endereço dos dados no JSON (`surveyDataFromDaniel.json`)                                                                                                                                              |
| ----- | -------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `card`                     | Sumário                                                       | Sem `dataPath` — texto em `components[0].text` (linhas 1374–1375)                                                                                                                                     |
| 2     | `grid-container`           | —                                                             | Container; filhos abaixo.                                                                                                                                                                             |
| 2.1   | `barChart`                 | (distribuição)                                                | **dataPath:** `sectionData.Estado.distributionChart` → `sections[3].subsections[1].data.distributionChart` (linhas 1365–1415)                                                                         |
| 2.2   | `distributionTable`        | (distribuição)                                                | **dataPath:** `sectionData.Estado.distributionTable` → `sections[3].subsections[1].data.distributionTable` (linhas 1416–1466)                                                                         |
| 3     | `card`                     | "Qual é a probabilidade de você recomendar nossa empresa..."  | Card com tabelas; filhos abaixo.                                                                                                                                                                      |
| 3.1   | `card`                     | Sumário                                                       | Texto em `components[0].text` (linhas 1401–1402)                                                                                                                                                      |
| 3.2   | `container`                | —                                                             | Container; filhos abaixo.                                                                                                                                                                             |
| 3.2.1 | `npsDistributionTable`     | —                                                             | **dataPath:** `sectionData.Estado.questions.question01.npsDistributionTable` → `sections[3].subsections[1].data.questions.question01.npsDistributionTable` (linhas 1469–1497)                         |
| 3.2.2 | `npsTable`                 | —                                                             | **dataPath:** `sectionData.Estado.questions.question01.npsTable` → `sections[3].subsections[1].data.questions.question01.npsTable` (linhas 1498–1519)                                                 |
| 4     | `card`                     | "Quais são os principais pontos que impactam sua satisfação?" | Card com tabelas; filhos abaixo.                                                                                                                                                                      |
| 4.1   | `card`                     | Sumário                                                       | Texto em `components[0].text` (linhas 1437–1438)                                                                                                                                                      |
| 4.2   | `container`                | —                                                             | Container; filhos abaixo.                                                                                                                                                                             |
| 4.2.1 | `sentimentThreeColorChart` | —                                                             | **dataPath:** `sectionData.Estado.questions.question02.satisfactionImpactSentimentChart` → `sections[3].subsections[1].data.questions.question02.satisfactionImpactSentimentChart` (linhas 1522–1544) |
| 4.2.2 | `sentimentImpactTable`     | —                                                             | **dataPath:** `sectionData.Estado.questions.question02.satisfactionImpactSentimentTable` → `sections[3].subsections[1].data.questions.question02.satisfactionImpactSentimentTable` (linhas 1545–1563) |
| 4.2.3 | `positiveCategoriesTable`  | —                                                             | **dataPath:** `sectionData.Estado.questions.question02.positiveCategoriesTable` → `sections[3].subsections[1].data.questions.question02.positiveCategoriesTable` (linhas 1564–1583)                   |
| 4.2.4 | `negativeCategoriesTable`  | —                                                             | **dataPath:** `sectionData.Estado.questions.question02.negativeCategoriesTable` → `sections[3].subsections[1].data.questions.question02.negativeCategoriesTable` (linhas 1584–1604)                   |

Dados da subsection: `sections[3].subsections[1].data` (linhas 1364–1877).

---

## Resumo dos dataPaths

- **sectionData** é resolvido no runtime contra o contexto da seção/subsection (ex.: `dataResolver.js` usa `sectionData` e/ou `_activeSubsection.data`).
- No JSON, os dados que alimentam esses `dataPath` estão em:
  - **Tipo de Cliente:** `sections[3].subsections[0].data`
  - **Estado:** `sections[3].subsections[1].data`

Arquivo usado: `src/data/surveyDataFromDaniel.json`.

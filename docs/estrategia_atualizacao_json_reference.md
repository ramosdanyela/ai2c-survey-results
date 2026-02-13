# Estratégia para atualizar as informações do Json Reference (todas as abas)

Este documento define como manter a página **Json Reference** (`src/pages/JsonReference.jsx`) sempre alinhada com o código, com a API/backend e com a documentação, em todas as abas: **Data Path**, **Inventário**, **Estrutura**, **Campos**, **Tabelas**, **Componentes**, **Cards** e **Variantes**.

---

## 1. Visão geral das fontes de dados por aba

| Aba | O que mostra | Fonte atual | Fonte recomendada |
|-----|----------------|-------------|--------------------|
| **Data Path** | Componentes por dataPath, filtros, exemplos com dados | `useSurveyData()` + `mergedSectionData` + registry | Mantém: hook + registry |
| **Inventário** | Tipos do registry + scan do relatório (seções, subseções, componentes, questões) | `componentCategories`/`allComponents` (hardcoded) + `reportInventory` (JSON) | Registry + config de categorias + JSON |
| **Estrutura** | Estrutura básica do JSON (metadata, sections, subsections, data) | `basicStructure` (hardcoded no JSX) | Módulo/schema único (doc ou config) |
| **Campos** | Campos de metadata, componente, seção, subseção, questão, surveyInfo | Lista hardcoded + `extractComponentData`, `extractSectionData`, etc. | Config de campos + valores extraídos do JSON |
| **Tabelas** | Tabelas de valores (tipos do registry, questionTypes, campos de seção/subseção/componente/config) | `componentCategories` + `questionTypeTemplates` + `extract*` | Registry + questionTemplates + extract* |
| **Componentes** | Lista de todos os componentes por categoria | `allComponents` + `componentCategories` (hardcoded) | Registry + config de categorias |
| **Cards** | Exemplos de uso do componente card (JSON + renderizado) | `cardExamples` (hardcoded) | Arquivo de exemplos (config ou JSON) |
| **Variantes** | cardStyleVariant, cardContentVariant, titleStyleVariant (classes CSS) | `@/styles/variants` + `extractComponentData.cardStyleVariants` etc. | variants.js (fonte única) + valores “no JSON” do extract |

---

## 2. Princípios da estratégia

1. **Fonte única de verdade**  
   Cada tipo de informação (tipos de componente, categorias, estrutura do JSON, lista de campos, exemplos de card, variantes de estilo) deve ter **um único lugar** no código ou em config. A página Json Reference apenas **consome** esses dados.

2. **Nome da fonte do JSON dinâmico**  
   O texto exibido (“Baseado em: json_file_app_05-02.json”) deve refletir a fonte real: nome do arquivo carregado ou `survey_id` da API, não um nome fixo no JSX.

3. **Registry e categorias**  
   A lista de tipos de componente vem de `ComponentRegistry`. As **categorias** (Charts, Cards, Tables, etc.) devem vir de um único config (ex.: `config/componentCategories.js`) para não duplicar no `JsonReference.jsx`.

4. **Documentação e código sincronizados**  
   Quando a API ou o schema mudar, atualizar em ordem: (1) `docs/backend_api_specification.md` e/ou `docs/ESTRUTURA_COMPONENTES_JSON.md`, (2) config/schema no código (estrutura, campos), (3) Json Reference se ainda houver algo hardcoded.

---

## 3. Plano por aba

### 3.1 Data Path

- **O que atualizar:** Nada estrutural; já usa `useSurveyData()`, `mergedSectionData`, `componentRegistry` e filtros.
- **Ação:** Garantir que o rótulo “Baseado em: …” use a fonte real do JSON (ver 3.9).

---

### 3.2 Inventário

- **Problema:** “Tipos aceitos pelo código” usa `componentCategories` definido localmente no JsonReference; “Inventário do relatório” usa `reportInventory` (derivado do JSON) e um nome de arquivo fixo na descrição.
- **Ações:**
  1. Criar **fonte única para categorias**: `src/config/componentCategories.js` exportando um mapa `{ Charts: [...], Cards: [...], ... }` derivado ou alinhado ao registry (ver 3.6).
  2. Em JsonReference, usar `Object.keys(componentRegistry)` para `allComponents` e importar categorias de `componentCategories.js`.
  3. Substituir o nome fixo do arquivo na descrição do card “Inventário do relatório” por um valor dinâmico (ex.: `surveyId` do metadata ou nome da fonte retornado pelo `useSurveyData` / service).

---

### 3.3 Estrutura

- **Problema:** `basicStructure` está hardcoded no JSX; pode divergir do schema real ou da documentação.
- **Ações:**
  1. Criar módulo **`src/config/jsonStructureSchema.js`** (ou equivalente) exportando o objeto `basicStructure` (e opcionalmente descrições por bloco). Manter esse arquivo como **fonte única** da estrutura “oficial” do JSON.
  2. Em JsonReference, importar `basicStructure` (e textos, se existirem) desse módulo.
  3. Quando `docs/ESTRUTURA_COMPONENTES_JSON.md` ou `docs/backend_api_specification.md` mudar (novos nós raiz, novas propriedades obrigatórias), atualizar **primeiro** `jsonStructureSchema.js` e depois a doc, ou o contrário, mas sempre os dois.

---

### 3.4 Campos

- **Problema:** Lista de campos (metadata, componente, seção, subseção, questão, surveyInfo) e descrições estão hardcoded no JSX; só os “valores encontrados no JSON” vêm dos `extract*`.
- **Ações:**
  1. Criar **`src/config/fieldsReference.js`** (ou `jsonFieldsReference.js`) exportando arrays de objetos por grupo, ex.:  
     `metadataFields`, `componentFields`, `sectionFields`, `subsectionFields`, `questionFields`, `surveyInfoFields`.  
     Cada item: `{ name, required, type, desc }` (e onde fizer sentido, chave para “valores” vindo do extract, ex.: `valuesKey: 'extractComponentData.types'`).
  2. Na aba Campos, iterar sobre esses arrays e, quando houver chave de “valores”, preencher com os dados dos `extract*` (extractComponentData, extractSectionData, etc.). Assim, ao adicionar um campo novo (ex.: na API), basta editar **só** `fieldsReference.js`.
  3. Manter alinhado com `docs/ESTRUTURA_COMPONENTES_JSON.md` e `docs/backend_api_specification.md`: quando um campo for documentado como novo/obrigatório, atualizar `fieldsReference.js` e a doc no mesmo passo.

---

### 3.5 Tabelas

- **O que já é dinâmico:** Tabelas de “valores no JSON” (seção, subseção, componente, config) usam `extractSectionData`, `extractSubsectionData`, `extractComponentData`, `extractConfigData`. Isso deve permanecer.
- **Ações:**
  1. Tabela “Tipos de componente aceitos pelo código”: passar a usar o mesmo `componentCategories` importado de `config/componentCategories.js` (fonte única com Inventário e Componentes).
  2. Tabela “Tipos de questão aceitos”: já usa `getSupportedQuestionTypes()` e `questionTypeTemplates`; manter. Garantir que, ao alterar `questionTemplates`, a tabela continue sendo gerada a partir deles.
  3. Garantir que os **nomes dos campos** nas tabelas (id, index, name, icon, etc.) coincidam com os nomes em `fieldsReference.js` e na aba Campos, para não ter duas listas diferentes de “campos de seção/subseção/componente”.

---

### 3.6 Componentes

- **Problema:** `allComponents` e `componentCategories` estão duplicados no JsonReference em relação ao registry.
- **Ações:**
  1. `allComponents = Object.keys(componentRegistry)` (já pode estar assim; garantir que não haja lista manual de tipos).
  2. Criar **`src/config/componentCategories.js`** que exporta um mapa categoria → array de tipos, ex.:  
     `export const componentCategories = { Charts: [...], Cards: [...], Tables: [...], ... }`.  
     Preencher com os mesmos tipos que estão no registry; pode incluir “Outros” para tipos do registry que não entrem em nenhuma categoria.
  3. JsonReference importa `componentCategories` desse config. Ao **adicionar um novo componente** no projeto: (1) registrar em `ComponentRegistry.jsx`, (2) adicionar o tipo na categoria adequada em `componentCategories.js`. Assim Inventário, Tabelas e Componentes ficam alinhados sem editar o JsonReference.

---

### 3.7 Cards

- **Problema:** `cardExamples` está hardcoded no JsonReference (basic, withDescription, borderLeft, etc.).
- **Ações:**
  1. Criar **`src/config/cardExamples.js`** (ou `data/cardExamples.json`) exportando o objeto `cardExamples` com os mesmos exemplos que hoje estão no JSX.
  2. JsonReference importa e usa esse objeto. Ao adicionar uma nova variante de card (ex.: novo `cardStyleVariant` em `variants.js`), adicionar um exemplo correspondente em `cardExamples.js` (ou no JSON) e, se necessário, atualizar a doc em `ESTRUTURA_COMPONENTES_JSON.md` (seção Cards).

---

### 3.8 Variantes

- **Situação:** Variantes de estilo já vêm de `@/styles/variants.js` (cardVariants, cardContentVariants, cardTitleVariants). A aba também mostra “valores encontrados no JSON” (extractComponentData.cardStyleVariants, etc.).
- **Ações:**
  1. Manter **variants.js** como única fonte das opções de estilo (nomes + classes). Ao adicionar uma nova variante (ex.: novo valor em `cardVariants`), a aba Variantes passa a mostrá-la automaticamente.
  2. Não duplicar a lista de variantes no JsonReference; usar sempre `Object.keys(cardVariants)`, `Object.keys(cardContentVariants)`, `Object.keys(cardTitleVariants)`.
  3. Opcional: na mesma aba, deixar explícito (ex.: badge “no JSON”) para as variantes que aparecem em `extractComponentData.cardStyleVariants` / cardContentVariantsList, para facilitar a comparação “disponíveis no código” vs “usados no relatório”.

---

### 3.9 Fonte do JSON (nome exibido)

- **Problema:** O texto “Baseado em: json_file_app_05-02.json” está fixo; o dado real hoje vem de `surveyDataService.js` (import estático de outro arquivo, ex.: `69403fe77237da9a4cf8979b_report_json.json`).
- **Ações:**
  1. Em **surveyDataService**: ao retornar os dados, retornar também um identificador da fonte, ex.:  
     `{ data: surveyDataJson, source: "69403fe77237da9a4cf8979b_report_json.json" }`  
     ou, quando houver API: `source: metadata.surveyId || "API"`.
  2. No hook **useSurveyData** (ou no componente que consome), expor esse `source` (ou derivar de `data?.metadata?.surveyId` quando vier da API).
  3. Na página Json Reference, usar esse valor para o CardDescription: “Baseado em: {source}” em vez do nome fixo. Assim, ao trocar o arquivo em `surveyDataService` ou ao usar a API, o rótulo atualiza sozinho.

---

## 4. Checklist de atualização (quando algo mudar)

Use este checklist para não esquecer de atualizar todas as abas e fontes relacionadas.

### Ao alterar a API / backend / schema do JSON

- [ ] Atualizar `docs/backend_api_specification.md` e/ou `docs/ESTRUTURA_COMPONENTES_JSON.md`.
- [ ] Atualizar `src/config/jsonStructureSchema.js` (estrutura básica) se mudar raiz ou nós principais.
- [ ] Atualizar `src/config/fieldsReference.js` se surgirem novos campos ou mudança de obrigatoriedade/tipo.
- [ ] Se a fonte do JSON passar a ser a API, ajustar `surveyDataService.js` e o rótulo “Baseado em” (fonte dinâmica).

### Ao adicionar ou remover um tipo de componente

- [ ] Registrar em `src/components/survey/common/ComponentRegistry.jsx`.
- [ ] Incluir o tipo na categoria correta em `src/config/componentCategories.js`.
- [ ] Se o componente tiver campos ou dataPath específicos, atualizar `docs/ESTRUTURA_COMPONENTES_JSON.md` e, se necessário, `fieldsReference.js` (ex.: campos de componente).

### Ao adicionar ou alterar tipo de questão

- [ ] Atualizar `src/config/questionTemplates.js` (questionTypeTemplates e getSupportedQuestionTypes).
- [ ] Aba Tabelas e Inventário (questões) passam a refletir isso automaticamente.

### Ao adicionar ou alterar variante de estilo (card / title / content)

- [ ] Atualizar `src/styles/variants.js`.
- [ ] Se for variante de card, considerar adicionar exemplo em `src/config/cardExamples.js`.

### Ao trocar o arquivo ou fonte do JSON de desenvolvimento

- [ ] Alterar import ou URL em `src/services/surveyDataService.js`.
- [ ] Se implementar 3.9, o rótulo “Baseado em” na Json Reference atualiza sozinho; senão, procurar e atualizar qualquer nome de arquivo fixo no JSX.

---

## 5. Ordem sugerida de implementação

1. **Fonte do JSON (3.9)** – rápido e melhora a confiança no que está sendo exibido.
2. **componentCategories (3.6 e uso em 3.2 e 3.5)** – um único config elimina duplicação em Inventário, Tabelas e Componentes.
3. **Estrutura (3.3)** – extrair `basicStructure` para `jsonStructureSchema.js`.
4. **Campos (3.4)** – extrair lista de campos para `fieldsReference.js`.
5. **Cards (3.7)** – extrair `cardExamples` para `cardExamples.js`.
6. Revisar **Variantes (3.8)** (uso consistente de `Object.keys(...)` e opcional “no JSON”).
7. Rodar uma vez o checklist da seção 4 para garantir que não restou referência hardcoded às listas que foram movidas para config.

---

## 6. Resumo dos novos arquivos de config

| Arquivo | Conteúdo |
|---------|----------|
| `src/config/componentCategories.js` | Mapa categoria → tipos de componente (alinhado ao registry). |
| `src/config/jsonStructureSchema.js` | Objeto `basicStructure` (e opcionalmente textos da aba Estrutura). |
| `src/config/fieldsReference.js` | Lista de campos por grupo (metadata, componente, seção, subseção, questão, surveyInfo). |
| `src/config/cardExamples.js` | Objeto `cardExamples` para a aba Cards. |

Com isso, as abas **Inventário**, **Estrutura**, **Campos**, **Tabelas**, **Componentes**, **Cards** e **Variantes** passam a ser atualizadas de forma consistente sempre que você atualizar esses configs, o registry, os questionTemplates ou o variants.js, sem precisar caçar valores hardcoded no JsonReference.

# Estratégia: Componentes renderizados em Questions/Responses (front + JSON)

## Objetivo

Listar todos os componentes do front que renderizam a seção **questions/responses** (Análise por Questão), indicando de onde vêm os dados no JSON e qual estrutura é necessária para cada um.

## Como o fluxo funciona

1. **Fonte das questões no JSON**  
   As questões vêm do array `sections[].questions`, onde a seção tem `id === "responses"` ou `id === "questions"`.  
   Resolução: `getQuestionsFromData(data)` em `src/services/dataResolver.js` → retorna `getQuestionsSection(data).questions`.

2. **Definição dos componentes por tipo de questão**  
   Não há um array `components` por questão no JSON. O tipo da questão (`questionType`) define qual conjunto de componentes é renderizado, via **templates** em `src/config/questionTemplates.js`:
   - `getQuestionTemplate(questionType)` retorna um array de definições `{ type, index, dataPath, config }`.
   - `single-choice` usa o mesmo template que `multiple-choice`.

3. **Contexto de dados ao renderizar**  
   Em `QuestionsList.jsx`, para cada questão é montado um objeto `componentData` que inclui:
   - `...data` (payload completo),
   - `question` (objeto da questão atual),
   - `surveyInfo`, `showWordCloud`, `uiTexts`.
   Os componentes recebem esse objeto e usam `dataPath` em relação a ele (ex.: `question.data` → `componentData.question.data`).

4. **Resolução do dataPath**  
   O código usa `resolveDataPath(data, component.dataPath, component.data)` em `src/services/dataResolver.js`.  
   Paths que começam com `question.` são resolvidos a partir de `data.question` (ex.: `question.data.barChart` → `data.question.data.barChart`).

5. **Registry de componentes**  
   O tipo do componente (`type` no template) é usado para buscar o renderizador em `src/components/survey/common/ComponentRegistry.jsx` (`componentRegistry[type]`).  
   Cada tipo (ex.: `barChart`, `npsScoreCard`) está mapeado para um Schema* (ex.: `SchemaBarChart`, `SchemaNPSScoreCard`).

## Onde procurar no código

| O que | Onde |
|-------|------|
| Lista de questões | `dataResolver.getQuestionsFromData(data)` → `sections[id=responses|questions].questions` |
| Template por questionType | `config/questionTemplates.js` → `questionTypeTemplates` e `getQuestionTemplate()` |
| Renderização dos componentes da questão | `QuestionsList.jsx` → `renderQuestionComponents(question)` |
| Mapeamento type → componente React | `ComponentRegistry.jsx` → `componentRegistry` |
| Uso do dataPath em cada componente | `CardRenderers.jsx`, `ChartRenderers.jsx`, `WidgetRenderers.jsx`, `TableRenderers.jsx` |

## Tipos de questão e componentes (resumo)

- **nps**: `npsScoreCard`, `npsStackedChart`
- **multiple-choice** / **single-choice**: `barChart`
- **open-ended**: `sentimentDivergentChart`, `topCategoriesCards`, `wordCloud`
- **rating**: `barChart` (mesmo template que multiple-choice)

O CSV anexo detalha, para cada linha:
- `question_type`
- Nome do componente (para leitura)
- Nome do componente no código (type no registry)
- Caminho utilizado pelo código para acessar (`dataPath`)
- Estrutura de dados necessária para renderizar (exemplo hipotético em JSON).

## Arquivo gerado

- **docs/questions_responses_components.csv**  
  Colunas: `question_type`, `nome_do_componente`, `nome_componente_codigo`, `caminho_dataPath`, `estrutura_data`.  
  Delimitador: vírgula. A coluna `estrutura_data` contém JSON de exemplo (dados hipotéticos) entre aspas.

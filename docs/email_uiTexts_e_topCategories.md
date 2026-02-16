# E-mail: Ajustes no JSON – uiTexts e renomeação topCategories

**Assunto:** Ajustes no JSON do relatório (uiTexts e nome do bloco Top Categories)

---

Olá,

Revendo o JSON do relatório (**surveyId: 69403fe77237da9a4cf8979b**), identificamos dois pontos que precisam de atenção para alinhar com o que o frontend espera e com a documentação atual.

---

## 1. Itens da área de questões estavam com fallback

Na seção **“Análise por Questão”**, os textos exibidos (tipos de questão, filtros, títulos de cards como “Top 3 Categorias”, “NPS Score”, “menções”, “Positivo”/“Negativo”, etc.) estavam vindo de **fallbacks** do código porque o objeto **`uiTexts`** no JSON não trazia as chaves usadas nessa área.

Ou seja: quando `uiTexts` não informa esses textos, o frontend usa valores padrão em português/inglês definidos no código. Para garantir que os rótulos sejam os desejados (e facilitar tradução ou personalização por pesquisa), o ideal é preencher **`uiTexts.responseDetails`** (e, se quiser, outras seções de `uiTexts`) no próprio JSON.

---

## 2. O que pode ser colocado em uiTexts

O `uiTexts` fica na **raiz** do JSON e todas as chaves são **opcionais**. Quando presentes, elas substituem os fallbacks do código. As principais áreas são:

| Área                | Uso                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **responseDetails** | Rótulos da área de questões e respostas: tipos de questão, “NPS Score”, título do bloco de categorias, “menções”, “Positivo”/“Negativo”, “Filtrar questão”, prefixo “Q”, etc. |
| **filterPanel**     | Textos do painel de filtros: “Todas”, “Campo Aberto”, “Múltipla Escolha”, “Filtrar por questão”, “Selecione uma questão”, etc.                                                |
| **common**          | Loading, erros e estados vazios: “Carregando questões...”, “Dados não encontrados.”, etc.                                                                                     |
| **surveySidebar**   | Rótulos da sidebar (respondentes, taxa de resposta, etc.).                                                                                                                    |
| **surveyHeader**    | Navegação (Anterior, Próximo, Exportar).                                                                                                                                      |
| **tables**          | Mensagens de tabela vazia (recomendações, segmentação, etc.).                                                                                                                 |
| **widgets**         | Mensagens específicas de widgets (ex.: wordCloud).                                                                                                                            |

A referência completa de chaves está no documento **REFERENCIA_UITEXTS_JSON.md**.

---

## 3. Renomeação: top3categories → topCategories

O título do bloco que exibe as principais categorias (Top 3) passa a ser referenciado pela chave **`topCategories`** (e não mais `top3Categories`).  
Ao preencher os textos da área de questões em `uiTexts`, use:

- **`uiTexts.responseDetails.topCategories`** — para o título desse bloco (ex.: “Top 3 Categorias” ou “Principais categorias”).

---

## 4. Como está hoje x como deveria estar (uiTexts)

### Como está hoje no JSON

O `uiTexts` atual tem apenas `filterPanel`, `export` e `common`; **não há `responseDetails`**, então todos os textos da área de questões vêm do fallback:

```json
"uiTexts": {
  "filterPanel": {
    "all": "Todas",
    "open-ended": "Campo Aberto",
    "multiple-choice": "Múltipla Escolha",
    "single-choice": "Escolha única",
    "nps": "NPS"
  },
  "export": {
    "title": "Export de Dados",
    "description": "Exporte os dados da pesquisa em diferentes formatos",
    "exportFullReport": "Exportar Relatório Completo",
    "selectSpecificSections": "Selecionar Seções Específicas",
    "exportAsPDF": "Exportar como PDF",
    "selectAtLeastOneSection": "Selecione pelo menos uma seção"
  },
  "common": {
    "loading": {
      "loadingQuestions": "Carregando questões..."
    },
    "errors": {
      "dataNotFound": "Dados não encontrados."
    }
  }
}
```

### Como deveria estar (incluindo responseDetails e topCategories)

Incluir **`responseDetails`** com as chaves usadas na área de questões, usando **`topCategories`** para o bloco de categorias:

```json
"uiTexts": {
  "filterPanel": {
    "all": "Todas",
    "open-ended": "Campo Aberto",
    "multiple-choice": "Múltipla Escolha",
    "single-choice": "Escolha única",
    "nps": "NPS"
  },
  "responseDetails": {
    "all": "Todas",
    "open-ended": "Campo Aberto",
    "multiple-choice": "Múltipla Escolha",
    "single-choice": "Escolha única",
    "nps": "NPS",
    "npsScore": "NPS Score",
    "topCategories": "Top Categorias",
    "mentions": "menções",
    "positive": "Positivo",
    "negative": "Negativo",
    "noPositiveTopics": "Nenhum tópico positivo",
    "noNegativeTopics": "Nenhum tópico negativo",
    "filterQuestion": "Filtrar questão",
    "questionPrefix": "Q",
    "pdf": "PDF",
    "summary": "Resumo",
    "loadingFilteredData": "Carregando dados filtrados..."
  },
  "export": {
    "title": "Export de Dados",
    "description": "Exporte os dados da pesquisa em diferentes formatos",
    "exportFullReport": "Exportar Relatório Completo",
    "selectSpecificSections": "Selecionar Seções Específicas",
    "exportAsPDF": "Exportar como PDF",
    "selectAtLeastOneSection": "Selecione pelo menos uma seção"
  },
  "common": {
    "loading": {
      "loading": "Carregando...",
      "loadingQuestions": "Carregando questões...",
      "loadingFilteredData": "Carregando dados filtrados...",
      "loadingData": "Carregando dados..."
    },
    "errors": {
      "questionsNotFound": "Questões não encontradas.",
      "dataNotFound": "Dados não encontrados."
    }
  }
}
```

Assim, os rótulos da área de questões passam a vir do JSON (incluindo o título do bloco via **`topCategories`**), e não mais apenas dos fallbacks do código.

Se precisar de mais chaves (filterPanel completo, surveySidebar, tables, etc.), a lista está em **REFERENCIA_UITEXTS_JSON.md**.

Qualquer dúvida, podemos alinhar em um próximo passo.

Att.

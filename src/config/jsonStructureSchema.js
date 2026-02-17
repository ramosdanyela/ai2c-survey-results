/**
 * Estrutura básica do JSON do relatório (fonte única para aba Estrutura do Json Reference).
 * Atualizar quando docs/official_docs/ESTRUTURA_COMPONENTES_JSON.md ou schema de validação mudar.
 */
export const basicStructure = {
  metadata: {
    version: "string",
    language: "string",
    surveyId: "string",
  },
  sections: [
    {
      id: "string (único)",
      index: "number",
      name: "string",
      icon: "string (nome do ícone)",
      subsections: [
        {
          id: "string (único)",
          index: "number",
          name: "string",
          icon: "string",
          components: [],
          data: {
            // Dados específicos da subseção (opcional)
          },
        },
      ],
      components: [],
      questions: [],
      data: {
        // Dados específicos da seção (opcional)
      },
    },
  ],
  uiTexts: {
    filterPanel: {},
    export: {},
    common: {},
  },
  surveyInfo: {
    title: "string",
    company: "string",
    period: "string",
    totalRespondents: "number",
    responseRate: "number",
    questions: "number",
  },
};

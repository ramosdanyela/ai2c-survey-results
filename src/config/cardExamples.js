/**
 * Exemplos de uso do componente card para a aba Cards do Json Reference.
 * Ao adicionar variantes em variants.js, considerar novo exemplo aqui.
 */
export const cardExamples = {
  basic: {
    type: "card",
    index: 0,
    title: "Título do Card",
    text: "Texto do card com suporte a quebras de linha.\nSegunda linha.",
    cardStyleVariant: "default",
  },
  withDescription: {
    type: "card",
    index: 0,
    useDescription: true,
    text: "Texto usando CardDescription component",
    cardStyleVariant: "default",
    cardContentVariant: "with-description",
  },
  borderLeft: {
    type: "card",
    index: 0,
    title: "Card com Borda",
    text: "Card com borda laranja à esquerda",
    cardStyleVariant: "border-left",
  },
  withNested: {
    type: "card",
    index: 0,
    title: "Card com Componentes",
    text: "Card que contém outros componentes",
    cardStyleVariant: "default",
    components: [
      {
        type: "barChart",
        index: 0,
        dataPath: "sectionData.data",
        config: {},
      },
    ],
  },
  overflowHidden: {
    type: "card",
    index: 0,
    title: "",
    text: "",
    cardStyleVariant: "overflow-hidden",
    components: [
      {
        type: "recommendationsTable",
        index: 0,
        dataPath: "sectionData.recommendationsTable",
      },
    ],
  },
  flexColumn: {
    type: "card",
    index: 0,
    title: "Card Flex Column",
    cardStyleVariant: "flex-column",
    cardContentVariant: "with-charts",
    components: [
      {
        type: "barChart",
        index: 0,
        dataPath: "sectionData.data",
      },
    ],
  },
};

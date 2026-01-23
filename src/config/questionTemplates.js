/**
 * Question Type Templates
 * 
 * Define a estrutura de renderização de componentes para cada tipo de questão.
 * Cada tipo de questão sempre terá os mesmos componentes renderizados na mesma ordem.
 * O que muda entre questões do mesmo tipo são apenas os dados, sumário e título.
 * 
 * IMPORTANTE: single-choice e multiple-choice têm a mesma estrutura de renderização.
 */

/**
 * Templates de componentes para cada tipo de questão
 * Cada template define um array de componentes que serão renderizados na ordem especificada
 */
export const questionTypeTemplates = {
  /**
   * Template para questões NPS
   * Componentes: npsScoreCard, npsStackedChart
   */
  nps: [
    {
      type: "npsScoreCard",
      index: 0,
      dataPath: "surveyInfo",
      config: {},
    },
    {
      type: "npsStackedChart",
      index: 1,
      dataPath: "question.data",
      config: {},
    },
  ],

  /**
   * Template para questões de múltipla escolha
   * Componente: barChart
   */
  "multiple-choice": [
    {
      type: "barChart",
      index: 0,
      dataPath: "question.data",
      config: {
        dataKey: "percentage",
        yAxisDataKey: "option",
      },
    },
  ],

  /**
   * Template para questões de escolha única
   * IMPORTANTE: Usa a mesma estrutura que multiple-choice
   * Componente: barChart
   */
  "single-choice": [
    {
      type: "barChart",
      index: 0,
      dataPath: "question.data",
      config: {
        dataKey: "percentage",
        yAxisDataKey: "option",
      },
    },
  ],

  /**
   * Template para questões abertas (open-ended)
   * Componentes: sentimentStackedChart, topCategoriesCards, wordCloud
   */
  "open-ended": [
    {
      type: "sentimentStackedChart",
      index: 0,
      dataPath: "question.data.sentimentData",
      config: {},
    },
    {
      type: "topCategoriesCards",
      index: 1,
      dataPath: "question.data.topCategories",
      config: {
        title: "Top 3 Categorias",
      },
    },
    {
      type: "wordCloud",
      index: 2,
      dataPath: "question.data.wordCloud",
      config: {
        title: "Nuvem de Palavras",
      },
    },
  ],

  /**
   * Template para questões de rating (se necessário no futuro)
   * Por padrão, usa a mesma estrutura que multiple-choice
   */
  rating: [
    {
      type: "barChart",
      index: 0,
      dataPath: "question.data",
      config: {
        dataKey: "percentage",
        yAxisDataKey: "option",
      },
    },
  ],
};

/**
 * Obtém o template de componentes para um tipo de questão
 * 
 * @param {string} questionType - Tipo da questão ("nps", "multiple-choice", "single-choice", "open-ended", "rating")
 * @returns {Array} Array de componentes do template ou null se tipo inválido
 */
export const getQuestionTemplate = (questionType) => {
  // Single-choice usa o mesmo template que multiple-choice
  if (questionType === "single-choice") {
    return questionTypeTemplates["multiple-choice"];
  }

  return questionTypeTemplates[questionType] || null;
};

/**
 * Verifica se um tipo de questão é válido
 * 
 * @param {string} questionType - Tipo da questão
 * @returns {boolean} true se o tipo é válido
 */
export const isValidQuestionType = (questionType) => {
  return questionType in questionTypeTemplates || questionType === "single-choice";
};

/**
 * Lista todos os tipos de questões suportados
 * 
 * @returns {string[]} Array com todos os tipos suportados
 */
export const getSupportedQuestionTypes = () => {
  return Object.keys(questionTypeTemplates);
};

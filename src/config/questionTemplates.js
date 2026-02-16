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
      dataPath: "question.data",
      config: {},
    },
    {
      type: "npsStackedChart",
      index: 1,
      dataPath: "question.data.npsStackedChart",
      config: {},
    },
  ],

  /**
   * Template para questões de múltipla escolha
   * Componente: barChart
   * Config de altura/largura evita encavalar legendas quando há muitas barras.
   */
  "multiple-choice": [
    {
      type: "barChart",
      index: 0,
      dataPath: "question.data.barChart",
      config: {
        dataKey: "percentage",
        yAxisDataKey: "option",
        heightPerBar: 44,
        maxHeight: 960,
        yAxisWidth: 200,
        margin: { top: 10, right: 50, left: 50, bottom: 10 },
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
      dataPath: "question.data.barChart",
      config: {
        dataKey: "percentage",
        yAxisDataKey: "option",
        heightPerBar: 44,
        maxHeight: 960,
        yAxisWidth: 200,
        margin: { top: 10, right: 50, left: 50, bottom: 10 },
      },
    },
  ],

  /**
   * Template para questões abertas (open-ended)
   * Componentes: sentimentDivergentChart, topCategoriesCards, wordCloud
   * Dados do gráfico em question.data.sentimentDivergentChart
   */
  "open-ended": [
    {
      type: "sentimentDivergentChart",
      index: 0,
      dataPath: "question.data.sentimentDivergentChart",
      config: {},
    },
    {
      type: "topCategoriesCards",
      index: 1,
      dataPath: "question.data.topCategoriesCards",
      config: {},
    },
    {
      type: "wordCloud",
      index: 2,
      dataPath: "question.data.wordCloud",
      config: {},
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
      dataPath: "question.data.barChart",
      config: {
        dataKey: "percentage",
        yAxisDataKey: "option",
        heightPerBar: 44,
        maxHeight: 960,
        yAxisWidth: 200,
        margin: { top: 10, right: 50, left: 50, bottom: 10 },
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
  return (
    questionType in questionTypeTemplates || questionType === "single-choice"
  );
};

/**
 * Lista todos os tipos de questões suportados
 *
 * @returns {string[]} Array com todos os tipos suportados
 */
export const getSupportedQuestionTypes = () => {
  return Object.keys(questionTypeTemplates);
};

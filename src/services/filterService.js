// ============================================================
// FILTER SERVICE - Simulação de API de Filtros
// ============================================================
//
// Duas funções mock estruturadas para substituição direta pela API real.
// Para migrar: troque o corpo de cada função pelo fetch correspondente.
//
// ============================================================

import filterDefinitionsJson from "../data/mocks/filterDefinitions.json";
import filteredQuestionDataJson from "../data/mocks/filteredQuestionData.json";

/**
 * API 1 - Busca definições de filtros disponíveis para a pesquisa
 * Produção: GET /api/surveys/{surveyId}/filters
 *
 * @param {string} surveyId - ID da pesquisa
 * @returns {Promise<{ success: boolean, data: { survey_id: string, filters: Array } }>}
 */
export const fetchFilterDefinitions = async (surveyId) => {
  // Mock: simula latência de rede e retorna JSON local
  // Real: return fetch(`/api/surveys/${surveyId}/filters`).then(r => r.json())
  await new Promise((resolve) => setTimeout(resolve, 300));
  return filterDefinitionsJson;
};

/**
 * API 2 - Busca dados filtrados para uma questão específica
 * Produção: POST /api/surveys/{surveyId}/questions/{questionId}/filtered
 * Body: { filters: [{ filter_id, values }] }
 *
 * Retorna: { success: boolean, data: { survey_id, question_id, question_type, applied_filters, data: {...} } }
 *
 * @param {string} surveyId - ID da pesquisa
 * @param {string} questionId - ID da questão (ex: "question01")
 * @param {Array<{ filter_id: string, values: string[] }>} filters - Filtros selecionados
 * @returns {Promise<{ success: boolean, data?: Object, error?: string }>}
 */
export const fetchFilteredQuestionData = async (
  surveyId,
  questionId,
  filters,
) => {
  // Mock: simula latência de rede
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Busca no JSON a melhor correspondência (match exato de filtros)
  const match = filteredQuestionDataJson.responses.find(
    (r) =>
      r.question_id === questionId &&
      JSON.stringify(r.applied_filters) === JSON.stringify(filters),
  );

  if (match) {
    return { success: true, data: match };
  }

  // Fallback: primeira entrada para essa questão (dados genéricos filtrados)
  const fallback = filteredQuestionDataJson.responses.find(
    (r) => r.question_id === questionId,
  );

  if (fallback) {
    return {
      success: true,
      data: { ...fallback, applied_filters: filters },
    };
  }

  return {
    success: false,
    error: "No data for this filter combination",
  };
};

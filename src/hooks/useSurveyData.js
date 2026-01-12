// ============================================================
// USE SURVEY DATA HOOK - Hook com React Query
// ============================================================
//
// ⚠️ ARQUIVO ISOLADO PARA SIMULAÇÃO
// Para remover a simulação e voltar aos imports diretos:
// 1. Delete este arquivo
// 2. Volte a usar: import { surveyInfo, ... } from "@/data/surveyData"
// 3. Remova os estados de loading/error dos componentes
//
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { fetchSurveyData } from "@/services/surveyDataService";

// Query key para cache do React Query
export const SURVEY_DATA_QUERY_KEY = ["surveyData"];

/**
 * Hook para buscar dados da pesquisa usando React Query
 *
 * @returns {Object} Objeto com dados e estados
 * @property {Object|null} data - Dados completos da pesquisa
 * @property {boolean} loading - Se está carregando (primeira vez)
 * @property {boolean} isFetching - Se está buscando (inclui refetch)
 * @property {boolean} isError - Se houve erro
 * @property {Error|null} error - Objeto de erro (se houver)
 * @property {boolean} isSuccess - Se carregou com sucesso
 * @property {Function} refetch - Função para refetch manual
 * @property {Object} surveyInfo - Helper: dados de surveyInfo
 * @property {Object} executiveReport - Helper: dados de executiveReport
 * @property {Object} supportAnalysis - Helper: dados de supportAnalysis
 * @property {Object} responseDetails - Helper: dados de responseDetails
 * @property {Object} attributeDeepDive - Helper: dados de attributeDeepDive
 * @property {Object} uiTexts - Helper: dados de uiTexts
 * @property {Object} sectionsConfig - Helper: dados de sectionsConfig
 * @property {Object} severityLabels - Helper: dados de severityLabels
 */
export const useSurveyData = () => {
  const { data, isLoading, isError, error, isFetching, isSuccess, refetch } =
    useQuery({
      queryKey: SURVEY_DATA_QUERY_KEY,
      queryFn: fetchSurveyData,
      staleTime: 5 * 60 * 1000, // 5 minutos - dados não ficam "stale" rapidamente
      gcTime: 10 * 60 * 1000, // 10 minutos - cache mantido por 10min
      retry: 2, // Tenta 2 vezes em caso de erro
      retryDelay: 1000, // 1 segundo entre tentativas
    });

  return {
    // Dados completos
    data,
    // Estados do React Query (mais granulares)
    loading: isLoading,
    isFetching,
    error: isError ? error : null,
    isSuccess,
    // Função para refetch manual
    refetch,
    // Helpers para acessar dados específicos (mantém compatibilidade)
    surveyInfo: data?.surveyInfo,
    executiveReport: data?.executiveReport,
    supportAnalysis: data?.supportAnalysis,
    responseDetails: data?.responseDetails,
    attributeDeepDive: data?.attributeDeepDive,
    uiTexts: data?.uiTexts,
    sectionsConfig: data?.sectionsConfig,
    severityLabels: data?.uiTexts?.severityLabels,
  };
};

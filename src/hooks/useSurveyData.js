/**
 * ⚠️ ARQUIVO ISOLADO PARA SIMULAÇÃO
 * Para remover a simulação e voltar aos imports diretos:
 * 1. Delete este arquivo
 * 2. Volte a usar: import { surveyInfo, ... } from "@/data/surveyData"
 * 3. Remova os estados de loading/error dos componentes
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSurveyData } from "@/services/surveyDataService";
import { resolveDataPath } from "@/services/dataResolver";

// Query key para cache do React Query
export const SURVEY_DATA_QUERY_KEY = ["surveyData"];

/**
 * Hook para buscar dados da pesquisa usando React Query
 *
 * ✅ 100% DINÂMICO - Funciona com qualquer estrutura de JSON
 *
 * Este hook não assume nenhuma estrutura específica. Use as funções genéricas
 * para acessar dados de forma dinâmica, independente da estrutura do seu JSON.
 *
 * @returns {Object} Objeto com dados e estados
 * @property {Object|null} data - Dados completos da pesquisa (acesse qualquer propriedade diretamente)
 * @property {boolean} loading - Se está carregando (primeira vez)
 * @property {boolean} isFetching - Se está buscando (inclui refetch)
 * @property {boolean} isError - Se houve erro
 * @property {Error|null} error - Objeto de erro (se houver)
 * @property {boolean} isSuccess - Se carregou com sucesso
 * @property {Function} refetch - Função para refetch manual
 * @property {Function} getSectionById - Busca seção por ID no sections (genérico)
 * @property {Function} resolvePath - Resolve caminho de dados dinamicamente (genérico)
 *
 * @example
 * // Exemplo 1: Acessar dados diretamente
 * const { data } = useSurveyData();
 * const titulo = data?.surveyInfo?.title;
 * const relatorio = data?.executiveReport;
 *
 * @example
 * // Exemplo 2: Usar resolvePath para caminhos dinâmicos
 * const { resolvePath } = useSurveyData();
 * const summary = resolvePath("executiveReport.summary.aboutStudy");
 * const question = resolvePath("responseDetails.questions[0]");
 *
 * @example
 * // Exemplo 3: Buscar seção no sections
 * const { getSectionById } = useSurveyData();
 * const secao = getSectionById("executive");
 * const sectionData = secao?.data;
 */
export const useSurveyData = () => {
  const { data: raw, isLoading, isError, error, isFetching, isSuccess, refetch } =
    useQuery({
      queryKey: SURVEY_DATA_QUERY_KEY,
      queryFn: fetchSurveyData,
      staleTime: 5 * 60 * 1000, // 5 minutos - dados não ficam "stale" rapidamente
      gcTime: 10 * 60 * 1000, // 10 minutos - cache mantido por 10min
      retry: 2, // Tenta 2 vezes em caso de erro
      retryDelay: 1000, // 1 segundo entre tentativas
    });

  // Suporta resposta { data, source } (novo) ou JSON direto (legado)
  const data = raw?.data ?? raw;
  const source = raw?.source ?? data?.metadata?.surveyId ?? null;

  // Função genérica para buscar seção por ID no sections
  const getSectionById = useMemo(() => {
    return (sectionId) => {
      if (!data?.sections || !sectionId) return null;
      return (
        data.sections.find(
          (section) => section.id === sectionId
        ) || null
      );
    };
  }, [data]);

  // Função genérica para resolver caminhos de dados
  const resolvePath = useMemo(() => {
    return (path) => {
      if (!data || !path) return null;
      return resolveDataPath(data, path);
    };
  }, [data]);

  return {
    data,
    source,
    loading: isLoading,
    isFetching,
    error: isError ? error : null,
    isSuccess,
    refetch,
    getSectionById,
    resolvePath,
  };
};

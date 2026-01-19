// ============================================================
// USE SURVEY DATA HOOK - Hook com React Query (100% Dinâmico)
// ============================================================
//
// ⚠️ ARQUIVO ISOLADO PARA SIMULAÇÃO
// Para remover a simulação e voltar aos imports diretos:
// 1. Delete este arquivo
// 2. Volte a usar: import { surveyInfo, ... } from "@/data/surveyData"
// 3. Remova os estados de loading/error dos componentes
//
// ============================================================
// 📝 EXEMPLO DE USO - TOTALMENTE DINÂMICO
// ============================================================
//
// Este hook é 100% dinâmico e funciona com QUALQUER estrutura de JSON:
//
// // ✅ Acessar dados diretamente (qualquer estrutura)
// const { data } = useSurveyData();
// console.log(data.relatorioExecutivo); // funciona com qualquer nome
// console.log(data.minhaSecaoCustomizada);
//
// // ✅ Resolver caminhos dinâmicos
// const { resolvePath } = useSurveyData();
// const summary = resolvePath("relatorioExecutivo.summary.aboutStudy");
// const nested = resolvePath("secao.subsecao.dados[0].valor");
//
// // ✅ Buscar seção por ID no sectionsConfig
// const { getSectionById } = useSurveyData();
// const minhaSecao = getSectionById("minhaSecaoCustomizada");
// const sectionData = minhaSecao?.data;
//
// // ✅ Acessar sectionsConfig diretamente
// const { data } = useSurveyData();
// const sections = data?.sectionsConfig?.sections || [];
// const minhaSecao = sections.find(s => s.id === "minhaSecao");
//
// ============================================================

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
 * @property {Function} getSectionById - Busca seção por ID no sectionsConfig (genérico)
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
 * // Exemplo 3: Buscar seção no sectionsConfig
 * const { getSectionById } = useSurveyData();
 * const secao = getSectionById("executive");
 * const sectionData = secao?.data;
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

  // Função genérica para buscar seção por ID no sectionsConfig
  // Funciona com qualquer ID, não assume nomes específicos
  const getSectionById = useMemo(() => {
    return (sectionId) => {
      if (!data?.sectionsConfig?.sections || !sectionId) return null;
      return (
        data.sectionsConfig.sections.find(
          (section) => section.id === sectionId
        ) || null
      );
    };
  }, [data]);

  // Função genérica para resolver caminhos de dados
  // Suporta: "propriedade.subpropriedade", "array[0]", "sectionData.caminho", etc.
  const resolvePath = useMemo(() => {
    return (path) => {
      if (!data || !path) return null;
      return resolveDataPath(data, path);
    };
  }, [data]);

  return {
    // Dados completos - Acesse qualquer propriedade diretamente
    // Ex: data.surveyInfo, data.executiveReport, data.minhaSecaoCustomizada
    data,
    // Estados do React Query
    loading: isLoading,
    isFetching,
    error: isError ? error : null,
    isSuccess,
    // Função para refetch manual
    refetch,
    // Funções genéricas - funcionam com qualquer estrutura
    getSectionById, // Busca seção por ID no sectionsConfig
    resolvePath, // Resolve caminhos dinâmicos (ex: "secao.subsecao.dados[0]")
  };
};

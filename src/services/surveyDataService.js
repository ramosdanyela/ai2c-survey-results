// ============================================================
// SURVEY DATA SERVICE - Simulação de API
// ============================================================
//
// ⚠️ ARQUIVO ISOLADO PARA SIMULAÇÃO
// Para remover a simulação, delete este arquivo e use
// os imports diretos de surveyData.js nos componentes
//
// ============================================================

// Importa diretamente o JSON (simula API)
import surveyDataJson from "../data/telmob_report_json_fixes_20-02.json";

/** Nome da fonte para exibição (ex.: Json Reference) */
const DATA_SOURCE_LABEL = "telmob_report_json_fixes_20-02.json";

/**
 * Retorna os dados da pesquisa e o identificador da fonte.
 * Em produção real, troque por fetch(API_URL) e use metadata.surveyId como source.
 */
export const fetchSurveyData = async () => {
  const data = surveyDataJson;
  const source =
    data?.metadata?.surveyId ?? DATA_SOURCE_LABEL;
  return { data, source };
};

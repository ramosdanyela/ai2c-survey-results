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
import surveyDataJson from "../data/telcoempengdemo000000000_report_json.json";

/** Nome da fonte para exibição (ex.: Json Reference) */
const DATA_SOURCE_LABEL = "telcoempengdemo000000000_report_json.json";

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * Retorna os dados da pesquisa e o identificador da fonte.
 * Em produção real, troque por fetch(API_URL) e use metadata.surveyKey como source.
 */
export const fetchSurveyData = async ({ questionnaireId, reportId }) => {
  console.log("==== args:", { questionnaireId, reportId });

  if (!questionnaireId || !reportId) {
    const data = surveyDataJson;
    const source = data?.metadata?.surveyKey ?? DATA_SOURCE_LABEL;
    return { data, source };
  }

  const ai2cAuth = JSON.parse(localStorage.getItem("auth") || "{}");
  if (!ai2cAuth.tokenType || !ai2cAuth.accessToken) {
    throw new Error("Token de autenticação não encontrado");
  }
  const url = `${API_URL}/questionnaires/${questionnaireId}/reports/download/${reportId}/reportJson`;
  const presignedResponse = await fetch(url, {
    headers: { Authorization: `${ai2cAuth.tokenType} ${ai2cAuth.accessToken}` },
  });

  if (!presignedResponse.ok) {
    throw new Error(`Falha ao carregar relatório: ${presignedResponse.status}`);
  }

  const presignedData = await presignedResponse.json();

  const response = await fetch(presignedData.url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar relatório: ${response.status}`);
  }

  const data = await response.json();
  return data.data ?? data;
};

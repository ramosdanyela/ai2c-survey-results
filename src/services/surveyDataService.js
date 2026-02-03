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
import surveyDataJson from "@/data/telmob_fixed_daniel.json";

/**
 * Retorna os dados da pesquisa imediatamente (evita loading infinito).
 * Em produção real, troque por fetch(API_URL).
 */
export const fetchSurveyData = async () => {
  return Promise.resolve(surveyDataJson);
};

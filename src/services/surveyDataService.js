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
import surveyDataJson from "@/data/surveyData.json";

/**
 * Simula uma chamada de API para buscar dados da pesquisa
 *
 * @returns {Promise<Object>} Dados completos da pesquisa
 * @throws {Error} Se houver erro ao carregar dados
 */
export const fetchSurveyData = async () => {
  try {
    // Simula delay de rede (configurável via env)
    const delay = import.meta.env.VITE_API_DELAY
      ? parseInt(import.meta.env.VITE_API_DELAY, 10)
      : 800; // Default: 800ms

    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retorna os dados (simula resposta de API)
    // Em produção real, aqui viria: await fetch(API_URL)
    return surveyDataJson;
  } catch (error) {
    console.error("Erro ao buscar dados da pesquisa:", error);
    throw new Error("Falha ao carregar dados da pesquisa");
  }
};

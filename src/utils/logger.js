/**
 * Sistema de Logging Centralizado
 * 
 * Fornece logging controlado com níveis e suporte para desenvolvimento/produção
 * 
 * @example
 * import { logger } from "@/utils/logger";
 * 
 * logger.warn("Aviso não crítico");
 * logger.error("Erro crítico", error);
 * logger.debug("Debug info", { data });
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Logger centralizado com níveis de log
 */
export const logger = {
  /**
   * Log de debug - apenas em desenvolvimento
   * @param {string} message - Mensagem de debug
   * @param {...any} args - Argumentos adicionais
   */
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Log de informação - apenas em desenvolvimento
   * @param {string} message - Mensagem informativa
   * @param {...any} args - Argumentos adicionais
   */
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Aviso - casos não críticos (ex: dados opcionais não encontrados)
   * Apenas em desenvolvimento para não poluir console em produção
   * @param {string} message - Mensagem de aviso
   * @param {...any} args - Argumentos adicionais
   */
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /**
   * Aviso crítico - sempre logado (ex: tipos inválidos, erros de configuração)
   * @param {string} message - Mensagem de aviso crítico
   * @param {...any} args - Argumentos adicionais
   */
  warnCritical: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Erro - sempre logado
   * @param {string} message - Mensagem de erro
   * @param {...any} args - Argumentos adicionais
   */
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

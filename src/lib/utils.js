import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Quebra linha após cada ponto final (.) para melhor quebra de página/parágrafo.
 * Usado em summary (questions) e text (components).
 * @param {string} str
 * @returns {string}
 */
export function breakLinesAfterPeriod(str) {
  if (str == null || typeof str !== "string") return str;
  return str.replace(/\.\s+/g, ".\n");
}

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

/**
 * Parseia texto que contém marcadores [*] e retorna array de itens para lista com bullets.
 * Usado na UI (renderizar <ul><li>) e no export Word (parágrafos com bullet).
 * @param {string} str - Texto com [*] como separador de itens
 * @returns {string[] | null} Itens não vazios, ou null se não houver [*]
 */
export function parseBulletItems(str) {
  if (str == null || typeof str !== "string") return null;
  if (!str.includes("[*]")) return null;
  const items = str
    .split("[*]")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

/**
 * Capitaliza apenas a primeira palavra do título (seção ou subseção).
 * Ex.: "relatório executivo" → "Relatório executivo"
 * @param {string} str - Título a formatar
 * @returns {string} Título com só a primeira palavra capitalizada
 */
export function capitalizeTitle(str) {
  if (str == null || typeof str !== "string") return str;
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  const parts = trimmed.split(/\s+/);
  const first = parts[0];
  const rest = parts.slice(1);
  const firstWord =
    first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  const restWords = rest.map((w) => w.toLowerCase()).join(" ");
  return restWords ? `${firstWord} ${restWords}` : firstWord;
}

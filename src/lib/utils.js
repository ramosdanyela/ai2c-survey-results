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
 * Parseia texto que contém marcadores [*].
 * Apenas o texto que vem depois de cada [*] é considerado item da lista;
 * texto antes do primeiro [*] é intro (parágrafo normal).
 * Usado na UI (renderizar intro + <ul><li>) e no export Word.
 * @param {string} str - Texto com [*] antes de cada item de lista
 * @returns {{ intro: string, items: string[] } | null} intro + itens, ou null se não houver [*]
 */
export function parseBulletItems(str) {
  if (str == null || typeof str !== "string") return null;
  if (!str.includes("[*]")) return null;
  const parts = str.split("[*]");
  const intro = (parts[0] || "").trim();
  const items = parts
    .slice(1)
    .map((s) => s.trim())
    .filter(Boolean);
  return { intro, items };
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
